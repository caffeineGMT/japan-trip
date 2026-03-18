// API endpoint: POST /api/referrals/apply-discount
// Apply $10 discount for referred users on signup

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { referralCode, userId } = req.body;

    if (!referralCode || !userId) {
      return res.status(400).json({ error: 'Referral code and userId required' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the referral record
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('*, referral_codes!inner(user_id)')
      .eq('referral_code', referralCode.toUpperCase())
      .is('referred_user_id', null)
      .order('clicked_at', { ascending: false })
      .limit(1)
      .single();

    if (referralError || !referral) {
      return res.status(404).json({ error: 'Referral not found or already used' });
    }

    // Update referral with referred user
    const { error: updateError } = await supabase
      .from('referrals')
      .update({
        referred_user_id: userId,
        signed_up_at: new Date().toISOString(),
        discount_applied: true
      })
      .eq('id', referral.id);

    if (updateError) {
      console.error('Error updating referral:', updateError);
      return res.status(500).json({ error: 'Failed to update referral' });
    }

    // Update referred user's record
    await supabase
      .from('users')
      .update({
        referred_by: referral.referrer_id
      })
      .eq('id', userId);

    // Create Stripe coupon code for $10 off (one-time use)
    let stripeCouponId = 'referral_10off';
    try {
      await stripe.coupons.retrieve(stripeCouponId);
    } catch (error) {
      // Create coupon if it doesn't exist
      await stripe.coupons.create({
        id: stripeCouponId,
        amount_off: 1000, // $10 in cents
        currency: 'usd',
        duration: 'once',
        name: 'Referral Discount - $10 Off'
      });
    }

    // Create unique promotion code for this user
    const promoCode = await stripe.promotionCodes.create({
      coupon: stripeCouponId,
      code: `REF${referralCode}${Date.now().toString(36).toUpperCase()}`,
      max_redemptions: 1,
      metadata: {
        user_id: userId,
        referral_id: referral.id,
        referral_code: referralCode
      }
    });

    return res.status(200).json({
      success: true,
      discount: {
        amount: 1000, // $10 in cents
        code: promoCode.code,
        stripePromotionCodeId: promoCode.id
      },
      message: 'Referral discount applied successfully'
    });

  } catch (error) {
    console.error('Error in apply-discount:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
