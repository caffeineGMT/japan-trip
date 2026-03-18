const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const paypal = require('paypal-rest-sdk');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Configure PayPal SDK
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' or 'live'
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET
});

/**
 * POST /api/affiliate/payout/process-monthly
 * Process monthly payouts for affiliates with pending balance >= $100
 * Should be called by Vercel cron on 1st of each month
 */
router.post('/payout/process-monthly', async (req, res) => {
  try {
    // Verify cron secret to prevent unauthorized access
    const cronSecret = req.headers['authorization']?.replace('Bearer ', '');
    if (cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Starting monthly payout process...');

    // Get all affiliates with pending payout >= $100
    const { data: affiliates, error: fetchError } = await supabase
      .from('affiliates')
      .select('*')
      .eq('status', 'active')
      .gte('pending_payout', 100)
      .not('paypal_email', 'is', null);

    if (fetchError) {
      throw fetchError;
    }

    if (!affiliates || affiliates.length === 0) {
      console.log('No affiliates eligible for payout');
      return res.json({
        success: true,
        message: 'No affiliates eligible for payout',
        processed: 0
      });
    }

    console.log(`Found ${affiliates.length} affiliates eligible for payout`);

    // Create PayPal batch payout
    const payoutItems = affiliates.map(affiliate => ({
      recipient_type: 'EMAIL',
      amount: {
        value: affiliate.pending_payout.toFixed(2),
        currency: 'USD'
      },
      receiver: affiliate.paypal_email,
      note: `TripCompanion affiliate commission payout - ${new Date().toLocaleDateString()}`,
      sender_item_id: affiliate.id // For tracking
    }));

    const payoutBatch = {
      sender_batch_header: {
        sender_batch_id: `BATCH_${Date.now()}`,
        email_subject: 'You have a payment from TripCompanion',
        email_message: 'You have received a commission payout from TripCompanion. Thank you for being a valued partner!'
      },
      items: payoutItems
    };

    // Execute PayPal payout
    const payoutResult = await new Promise((resolve, reject) => {
      paypal.payout.create(payoutBatch, true, (error, payout) => {
        if (error) {
          reject(error);
        } else {
          resolve(payout);
        }
      });
    });

    console.log('PayPal batch created:', payoutResult.batch_header.payout_batch_id);

    // Record payout in database and update affiliate balances
    const payoutRecords = [];
    for (const affiliate of affiliates) {
      const amount = affiliate.pending_payout;

      // Create payout record
      const { data: payoutRecord, error: insertError } = await supabase
        .from('payouts')
        .insert({
          affiliate_id: affiliate.id,
          amount: amount,
          status: 'processing',
          paypal_batch_id: payoutResult.batch_header.payout_batch_id
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating payout record:', insertError);
        continue;
      }

      // Reset pending payout to 0
      await supabase
        .from('affiliates')
        .update({ pending_payout: 0 })
        .eq('id', affiliate.id);

      payoutRecords.push({
        affiliateCode: affiliate.affiliate_code,
        amount: amount,
        email: affiliate.paypal_email
      });
    }

    res.json({
      success: true,
      message: `Processed ${payoutRecords.length} payouts`,
      batchId: payoutResult.batch_header.payout_batch_id,
      totalAmount: payoutRecords.reduce((sum, p) => sum + p.amount, 0),
      payouts: payoutRecords
    });

  } catch (error) {
    console.error('Payout processing error:', error);
    res.status(500).json({
      error: 'Payout processing failed',
      message: error.message
    });
  }
});

/**
 * POST /api/affiliate/payout/check-status
 * Check status of a PayPal payout batch and update database
 */
router.post('/payout/check-status', async (req, res) => {
  try {
    const { batchId } = req.body;

    if (!batchId) {
      return res.status(400).json({ error: 'Missing batchId' });
    }

    // Get batch status from PayPal
    const batchStatus = await new Promise((resolve, reject) => {
      paypal.payout.get(batchId, (error, payout) => {
        if (error) {
          reject(error);
        } else {
          resolve(payout);
        }
      });
    });

    // Update payout records in database
    const { data: payouts, error: fetchError } = await supabase
      .from('payouts')
      .select('*')
      .eq('paypal_batch_id', batchId);

    if (fetchError) {
      throw fetchError;
    }

    const updates = [];
    for (const payout of payouts) {
      // Find corresponding item in PayPal response
      const paypalItem = batchStatus.items?.find(
        item => item.payout_item.sender_item_id === payout.affiliate_id
      );

      if (paypalItem) {
        const status = paypalItem.transaction_status === 'SUCCESS' ? 'paid' :
                      paypalItem.transaction_status === 'FAILED' ? 'failed' :
                      'processing';

        await supabase
          .from('payouts')
          .update({
            status: status,
            paypal_status: paypalItem.transaction_status,
            paypal_payout_id: paypalItem.payout_item_id,
            paid_at: status === 'paid' ? new Date().toISOString() : null,
            error_message: paypalItem.errors ? JSON.stringify(paypalItem.errors) : null
          })
          .eq('id', payout.id);

        updates.push({
          payoutId: payout.id,
          status: status
        });
      }
    }

    res.json({
      success: true,
      batchStatus: batchStatus.batch_header.batch_status,
      updates: updates
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: 'Failed to check status',
      message: error.message
    });
  }
});

/**
 * POST /api/affiliate/payout/manual
 * Manually trigger payout for a specific affiliate (admin only)
 */
router.post('/payout/manual', async (req, res) => {
  try {
    const { affiliateId, amount } = req.body;

    if (!affiliateId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get affiliate
    const { data: affiliate, error: fetchError } = await supabase
      .from('affiliates')
      .select('*')
      .eq('id', affiliateId)
      .single();

    if (fetchError || !affiliate) {
      return res.status(404).json({ error: 'Affiliate not found' });
    }

    if (!affiliate.paypal_email) {
      return res.status(400).json({ error: 'No PayPal email on file' });
    }

    // Create single payout
    const payoutData = {
      sender_batch_header: {
        sender_batch_id: `MANUAL_${Date.now()}`,
        email_subject: 'Manual payout from TripCompanion'
      },
      items: [{
        recipient_type: 'EMAIL',
        amount: {
          value: parseFloat(amount).toFixed(2),
          currency: 'USD'
        },
        receiver: affiliate.paypal_email,
        note: 'Manual commission payout',
        sender_item_id: affiliateId
      }]
    };

    const payoutResult = await new Promise((resolve, reject) => {
      paypal.payout.create(payoutData, true, (error, payout) => {
        if (error) reject(error);
        else resolve(payout);
      });
    });

    // Record in database
    await supabase
      .from('payouts')
      .insert({
        affiliate_id: affiliateId,
        amount: amount,
        status: 'processing',
        paypal_batch_id: payoutResult.batch_header.payout_batch_id
      });

    // Deduct from pending balance
    await supabase
      .from('affiliates')
      .update({
        pending_payout: Math.max(0, affiliate.pending_payout - amount)
      })
      .eq('id', affiliateId);

    res.json({
      success: true,
      batchId: payoutResult.batch_header.payout_batch_id,
      amount: amount
    });

  } catch (error) {
    console.error('Manual payout error:', error);
    res.status(500).json({
      error: 'Manual payout failed',
      message: error.message
    });
  }
});

module.exports = router;
