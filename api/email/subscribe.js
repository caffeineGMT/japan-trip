const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/email/subscribe
 * Subscribe a user to the email nurture sequence
 */
router.post('/subscribe', async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      source = 'landing_page',
      utmSource,
      utmMedium,
      utmCampaign
    } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Check if already subscribed
    const { data: existingSubscriber } = await supabase
      .from('email_subscribers')
      .select('id, status, email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return res.status(200).json({
          success: true,
          message: 'Already subscribed',
          subscriberId: existingSubscriber.id
        });
      } else if (existingSubscriber.status === 'unsubscribed') {
        // Reactivate subscription
        const { data: reactivated, error: reactivateError } = await supabase
          .from('email_subscribers')
          .update({
            status: 'active',
            unsubscribed_at: null,
            subscribed_at: new Date().toISOString()
          })
          .eq('id', existingSubscriber.id)
          .select()
          .single();

        if (reactivateError) throw reactivateError;

        return res.status(200).json({
          success: true,
          message: 'Subscription reactivated',
          subscriberId: reactivated.id
        });
      }
    }

    // Create new subscriber
    const { data: newSubscriber, error: insertError } = await supabase
      .from('email_subscribers')
      .insert({
        email: email.toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        status: 'active',
        source,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        subscription_tier: 'free'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log(`📧 New email subscriber: ${email} (source: ${source})`);

    // Send welcome email immediately
    try {
      const emailScheduler = require('../../lib/email-scheduler');
      await emailScheduler.sendWelcomeEmail(newSubscriber);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the subscription if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to email updates',
      subscriberId: newSubscriber.id
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      error: 'Failed to subscribe',
      message: error.message
    });
  }
});

module.exports = router;
