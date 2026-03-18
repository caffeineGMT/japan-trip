const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const mailgunClient = require('../../lib/mailgun-client');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/email/webhook
 * Mailgun webhook for email event tracking
 */
router.post('/webhook', async (req, res) => {
  try {
    // Verify webhook signature
    if (!mailgunClient.verifyWebhookSignature(req.body)) {
      console.warn('⚠️  Invalid Mailgun webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = mailgunClient.parseWebhookEvent(req.body);
    const { eventType, email, messageId, timestamp, trackingData } = event;

    console.log(`📧 Email event: ${eventType} for ${email}`);

    // Find subscriber
    const { data: subscriber } = await supabase
      .from('email_subscribers')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (!subscriber) {
      console.warn(`Subscriber not found for email: ${email}`);
      return res.status(200).json({ message: 'Subscriber not found, event ignored' });
    }

    // Find email send record
    let emailSend = null;
    if (trackingData.subscriber_id && trackingData.campaign_id) {
      const { data } = await supabase
        .from('email_sends')
        .select('id')
        .eq('subscriber_id', trackingData.subscriber_id)
        .eq('campaign_id', trackingData.campaign_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      emailSend = data;
    }

    const sendId = emailSend?.id;

    // Handle different event types
    switch (eventType) {
      case 'delivered':
        if (sendId) {
          await supabase
            .from('email_sends')
            .update({
              status: 'delivered',
              delivered_at: timestamp.toISOString()
            })
            .eq('id', sendId);
        }
        break;

      case 'opened':
        if (sendId) {
          // Update first open time
          const { data: existingSend } = await supabase
            .from('email_sends')
            .select('opened_at')
            .eq('id', sendId)
            .single();

          if (!existingSend?.opened_at) {
            await supabase
              .from('email_sends')
              .update({ opened_at: timestamp.toISOString() })
              .eq('id', sendId);
          }

          // Record event
          await supabase.from('email_events').insert({
            send_id: sendId,
            subscriber_id: subscriber.id,
            event_type: 'opened',
            ip_address: req.body['client-info']?.['client-ip'],
            user_agent: req.body['client-info']?.['user-agent'],
            occurred_at: timestamp.toISOString()
          });
        }
        break;

      case 'clicked':
        if (sendId) {
          // Update first click time
          const { data: existingSend } = await supabase
            .from('email_sends')
            .select('clicked_at')
            .eq('id', sendId)
            .single();

          if (!existingSend?.clicked_at) {
            await supabase
              .from('email_sends')
              .update({ clicked_at: timestamp.toISOString() })
              .eq('id', sendId);
          }

          // Record event with URL
          await supabase.from('email_events').insert({
            send_id: sendId,
            subscriber_id: subscriber.id,
            event_type: 'clicked',
            link_url: req.body.url,
            ip_address: req.body['client-info']?.['client-ip'],
            user_agent: req.body['client-info']?.['user-agent'],
            occurred_at: timestamp.toISOString()
          });
        }
        break;

      case 'unsubscribed':
        // Update subscriber status
        await supabase
          .from('email_subscribers')
          .update({
            status: 'unsubscribed',
            unsubscribed_at: timestamp.toISOString()
          })
          .eq('id', subscriber.id);

        if (sendId) {
          await supabase
            .from('email_sends')
            .update({ unsubscribed_at: timestamp.toISOString() })
            .eq('id', sendId);

          await supabase.from('email_events').insert({
            send_id: sendId,
            subscriber_id: subscriber.id,
            event_type: 'unsubscribed',
            occurred_at: timestamp.toISOString()
          });
        }
        break;

      case 'complained':
        // Mark as complained (spam)
        await supabase
          .from('email_subscribers')
          .update({
            status: 'complained',
            unsubscribed_at: timestamp.toISOString()
          })
          .eq('id', subscriber.id);

        if (sendId) {
          await supabase
            .from('email_sends')
            .update({ complained_at: timestamp.toISOString() })
            .eq('id', sendId);

          await supabase.from('email_events').insert({
            send_id: sendId,
            subscriber_id: subscriber.id,
            event_type: 'complained',
            occurred_at: timestamp.toISOString()
          });
        }

        console.warn(`⚠️  Spam complaint from: ${email}`);
        break;

      case 'bounced':
      case 'failed':
        // Update subscriber status
        await supabase
          .from('email_subscribers')
          .update({ status: 'bounced' })
          .eq('id', subscriber.id);

        if (sendId) {
          await supabase
            .from('email_sends')
            .update({
              status: 'bounced',
              bounced_at: timestamp.toISOString(),
              error_message: req.body.reason || req.body['delivery-status']?.message
            })
            .eq('id', sendId);

          await supabase.from('email_events').insert({
            send_id: sendId,
            subscriber_id: subscriber.id,
            event_type: 'bounced',
            event_data: {
              reason: req.body.reason,
              code: req.body.code,
              error: req.body.error
            },
            occurred_at: timestamp.toISOString()
          });
        }

        console.warn(`⚠️  Bounce from: ${email} - ${req.body.reason}`);
        break;

      default:
        console.log(`Unknown event type: ${eventType}`);
    }

    res.status(200).json({ message: 'Event processed' });

  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to Mailgun to prevent retries
    res.status(200).json({ message: 'Error processed' });
  }
});

module.exports = router;
