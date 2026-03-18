/**
 * Request Payout API
 * Allows affiliates to request payout of available commission
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { affiliate_id } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get affiliate partner details
    const { data: partner, error: partnerError } = await supabase
      .from('affiliate_partners')
      .select('*')
      .eq('id', affiliate_id)
      .single();

    if (partnerError || !partner) {
      return res.status(404).json({ error: 'Affiliate partner not found' });
    }

    if (partner.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Get available commissions (approved and not yet paid)
    const { data: availableCommissions, error: commissionsError } = await supabase
      .from('affiliate_conversions')
      .select('*')
      .eq('affiliate_id', affiliate_id)
      .eq('status', 'approved')
      .is('payout_id', null);

    if (commissionsError) throw commissionsError;

    const totalAvailable = availableCommissions.reduce(
      (sum, c) => sum + (c.commission_amount_cents || 0),
      0
    );

    // Check minimum payout threshold ($100)
    const minPayout = 10000; // cents
    if (totalAvailable < minPayout) {
      return res.status(400).json({
        error: 'Insufficient balance',
        message: `Minimum payout is $${minPayout / 100}. Current balance: $${totalAvailable / 100}`
      });
    }

    // Validate payout settings
    if (!partner.payout_email) {
      return res.status(400).json({
        error: 'Payout settings incomplete',
        message: 'Please configure your payout email in settings'
      });
    }

    // Create payout record
    const { data: payout, error: payoutError } = await supabase
      .from('affiliate_payouts')
      .insert({
        affiliate_id: affiliate_id,
        amount_cents: totalAvailable,
        commission_count: availableCommissions.length,
        payout_method: partner.payout_method || 'paypal',
        payout_email: partner.payout_email,
        status: 'pending'
      })
      .select()
      .single();

    if (payoutError) throw payoutError;

    // Link commissions to this payout
    const { error: updateError } = await supabase
      .from('affiliate_conversions')
      .update({ payout_id: payout.id })
      .in('id', availableCommissions.map(c => c.id));

    if (updateError) throw updateError;

    // In production, this would trigger PayPal/Stripe payment processing
    // For now, we'll just mark as pending and send notification

    // Send notification email (pseudo-code)
    // await sendPayoutNotification(partner.email, payout);

    return res.status(200).json({
      success: true,
      payout: {
        id: payout.id,
        amount_cents: payout.amount_cents,
        status: payout.status,
        message: 'Payout requested successfully. You will receive payment within 5-7 business days.'
      }
    });

  } catch (error) {
    console.error('Request payout error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
