// API endpoint: POST /api/referrals/mark-conversion
// Mark a referral as converted when user makes first payment
// Called from Stripe webhook handler

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Internal-Secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify internal call (should only be called from webhook handler)
    const internalSecret = req.headers['x-internal-secret'];
    if (internalSecret !== process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { userId, stripeCustomerId, amount } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find referral record for this user
    const { data: referral, error: findError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_user_id', userId)
      .is('converted_at', null)
      .single();

    if (findError || !referral) {
      // No referral to mark - user wasn't referred or already converted
      return res.status(200).json({
        success: true,
        message: 'No referral to mark'
      });
    }

    // Mark as converted
    const { error: updateError } = await supabase
      .from('referrals')
      .update({
        converted_at: new Date().toISOString(),
        referred_email: (await supabase.auth.admin.getUserById(userId)).data.user?.email
      })
      .eq('id', referral.id);

    if (updateError) {
      console.error('Error marking conversion:', updateError);
      return res.status(500).json({ error: 'Failed to mark conversion' });
    }

    // Check and grant rewards to referrer (handled by database trigger)
    const { data: rewards } = await supabase
      .rpc('check_and_grant_referral_rewards', { p_user_id: referral.referrer_id });

    // Send notification email to referrer if reward granted
    if (rewards && rewards.length > 0) {
      await sendRewardNotification(referral.referrer_id, rewards);
    }

    return res.status(200).json({
      success: true,
      referralId: referral.id,
      rewardsGranted: rewards || [],
      message: 'Referral marked as converted'
    });

  } catch (error) {
    console.error('Error in mark-conversion:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function sendRewardNotification(userId, rewards) {
  // TODO: Implement email notification using Mailgun
  // This will be called when rewards are granted
  console.log(`Sending reward notification to user ${userId}:`, rewards);

  // Example email content:
  // Subject: "You've earned a reward! 🎉"
  // Body: "Congratulations! You've successfully referred 3 friends and earned 1 month of premium for free!"
}
