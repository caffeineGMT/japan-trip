const express = require('express');
const router = express.Router();
const emailScheduler = require('../../lib/email-scheduler');

/**
 * POST /api/email/cron/process-drip
 * Cron endpoint to process drip campaign
 * Secure with CRON_SECRET from environment
 */
router.post('/cron/process-drip', async (req, res) => {
  try {
    // Verify cron secret
    const cronSecret = req.headers['x-cron-secret'] || req.query.secret;

    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      console.warn('⚠️  Unauthorized cron attempt');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('📧 Cron job triggered: Processing drip campaign');

    const result = await emailScheduler.processDripCampaign();

    res.json({
      success: true,
      message: 'Drip campaign processed',
      ...result
    });

  } catch (error) {
    console.error('Cron process-drip error:', error);
    res.status(500).json({
      error: 'Failed to process drip campaign',
      message: error.message
    });
  }
});

/**
 * POST /api/email/cron/test-email
 * Test endpoint to send a test email
 */
router.post('/cron/test-email', async (req, res) => {
  try {
    const cronSecret = req.headers['x-cron-secret'] || req.query.secret;

    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { subscriberId, campaignSequence = 1 } = req.body;

    if (!subscriberId) {
      return res.status(400).json({ error: 'subscriberId required' });
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: subscriber } = await supabase
      .from('email_subscribers')
      .select('*')
      .eq('id', subscriberId)
      .single();

    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    const campaign = await emailScheduler.getCampaign(campaignSequence);
    const result = await emailScheduler.sendCampaignEmail(subscriber, campaign);

    res.json({
      success: true,
      message: 'Test email sent',
      result
    });

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      error: 'Failed to send test email',
      message: error.message
    });
  }
});

module.exports = router;
