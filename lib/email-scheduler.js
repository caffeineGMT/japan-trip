const { createClient } = require('@supabase/supabase-js');
const mailgunClient = require('./mailgun-client');
const templateRenderer = require('./email-template-renderer');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class EmailScheduler {
  /**
   * Send welcome email (Email #1) immediately
   */
  async sendWelcomeEmail(subscriber) {
    const campaign = await this.getCampaign(1); // Email sequence #1
    return this.sendCampaignEmail(subscriber, campaign);
  }

  /**
   * Get campaign by sequence number
   */
  async getCampaign(sequenceNumber) {
    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('email_sequence_number', sequenceNumber)
      .eq('status', 'active')
      .single();

    if (error || !campaign) {
      throw new Error(`Campaign #${sequenceNumber} not found`);
    }

    return campaign;
  }

  /**
   * Send a campaign email to a subscriber
   */
  async sendCampaignEmail(subscriber, campaign) {
    try {
      // Check if already sent
      const { data: existingSend } = await supabase
        .from('email_sends')
        .select('id')
        .eq('subscriber_id', subscriber.id)
        .eq('campaign_id', campaign.id)
        .single();

      if (existingSend) {
        console.log(`Already sent campaign #${campaign.email_sequence_number} to ${subscriber.email}`);
        return { success: false, reason: 'already_sent' };
      }

      // Render email template
      const html = templateRenderer.render(campaign.template_id, {
        firstName: subscriber.first_name || 'there',
        email: subscriber.email,
        appUrl: process.env.APP_URL || 'http://localhost:3000'
      });

      // Create send record
      const { data: emailSend, error: sendError } = await supabase
        .from('email_sends')
        .insert({
          subscriber_id: subscriber.id,
          campaign_id: campaign.id,
          status: 'queued'
        })
        .select()
        .single();

      if (sendError) throw sendError;

      // Send via Mailgun
      const result = await mailgunClient.sendCampaignEmail(subscriber, campaign, html);

      // Update send record
      await supabase
        .from('email_sends')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          mailgun_message_id: result.messageId
        })
        .eq('id', emailSend.id);

      console.log(`✅ Sent campaign #${campaign.email_sequence_number} to ${subscriber.email}`);

      return { success: true, sendId: emailSend.id };

    } catch (error) {
      console.error('Send campaign email error:', error);

      // Update send record with error
      if (emailSend?.id) {
        await supabase
          .from('email_sends')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', emailSend.id);
      }

      throw error;
    }
  }

  /**
   * Process drip campaign for all active subscribers
   * This should be called by a cron job daily
   */
  async processDripCampaign() {
    try {
      console.log('📧 Processing drip campaign...');

      // Get all active subscribers
      const { data: subscribers, error } = await supabase
        .from('email_subscribers')
        .select('*')
        .eq('status', 'active')
        .order('subscribed_at', { ascending: true });

      if (error) throw error;

      console.log(`Found ${subscribers.length} active subscribers`);

      let sent = 0;
      let skipped = 0;

      for (const subscriber of subscribers) {
        try {
          const result = await this.processSubscriberDrip(subscriber);
          if (result.sent) {
            sent++;
          } else {
            skipped++;
          }
        } catch (error) {
          console.error(`Error processing subscriber ${subscriber.email}:`, error);
          skipped++;
        }
      }

      console.log(`✅ Drip campaign complete: ${sent} sent, ${skipped} skipped`);

      return { sent, skipped };

    } catch (error) {
      console.error('Process drip campaign error:', error);
      throw error;
    }
  }

  /**
   * Process drip campaign for a single subscriber
   */
  async processSubscriberDrip(subscriber) {
    // Calculate days since subscription
    const subscribedAt = new Date(subscriber.subscribed_at);
    const now = new Date();
    const daysSinceSubscription = Math.floor((now - subscribedAt) / (1000 * 60 * 60 * 24));

    // Get all campaigns
    const { data: campaigns } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('status', 'active')
      .order('email_sequence_number', { ascending: true });

    // Find next campaign to send
    for (const campaign of campaigns) {
      if (daysSinceSubscription >= campaign.delay_days) {
        // Check if already sent
        const { data: existingSend } = await supabase
          .from('email_sends')
          .select('id')
          .eq('subscriber_id', subscriber.id)
          .eq('campaign_id', campaign.id)
          .single();

        if (!existingSend) {
          // Send this campaign
          await this.sendCampaignEmail(subscriber, campaign);
          return { sent: true, campaign: campaign.email_sequence_number };
        }
      }
    }

    return { sent: false };
  }

  /**
   * Track conversion (free to paid upgrade)
   */
  async trackConversion(subscriberId, stripePaymentId, amount) {
    try {
      // Get subscriber
      const { data: subscriber } = await supabase
        .from('email_subscribers')
        .select('*')
        .eq('id', subscriberId)
        .single();

      if (!subscriber) {
        throw new Error('Subscriber not found');
      }

      // Update subscriber
      await supabase
        .from('email_subscribers')
        .update({
          subscription_tier: 'premium',
          converted_at: new Date().toISOString()
        })
        .eq('id', subscriberId);

      // Find last email send
      const { data: lastSend } = await supabase
        .from('email_sends')
        .select('id, campaign_id')
        .eq('subscriber_id', subscriberId)
        .order('sent_at', { ascending: false })
        .limit(1)
        .single();

      // Record conversion
      await supabase.from('email_conversions').insert({
        subscriber_id: subscriberId,
        send_id: lastSend?.id,
        campaign_id: lastSend?.campaign_id,
        conversion_type: 'free_to_paid',
        revenue_amount: amount,
        stripe_payment_id: stripePaymentId
      });

      console.log(`💰 Conversion tracked: ${subscriber.email} → $${amount}`);

      return { success: true };

    } catch (error) {
      console.error('Track conversion error:', error);
      throw error;
    }
  }
}

module.exports = new EmailScheduler();
