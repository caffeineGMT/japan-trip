// API endpoint: GET /api/referrals/stats
// Get user's referral statistics

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    // Get user's referral code
    const { data: codeData } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('user_id', user.id)
      .single();

    // Get referral stats
    const { data: referrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    // Get rewards
    const { data: rewards } = await supabase
      .from('referral_rewards')
      .select('*')
      .eq('user_id', user.id)
      .order('granted_at', { ascending: false });

    // Calculate stats
    const totalClicks = referrals?.length || 0;
    const signups = referrals?.filter(r => r.signed_up_at).length || 0;
    const conversions = referrals?.filter(r => r.converted_at).length || 0;
    const pendingRewards = Math.floor(conversions / 3) - (rewards?.filter(r => r.reward_type === 'month_free').length || 0);

    // Recent referrals (last 10)
    const recentReferrals = referrals?.slice(0, 10).map(r => ({
      id: r.id,
      email: r.referred_email,
      clickedAt: r.clicked_at,
      signedUpAt: r.signed_up_at,
      convertedAt: r.converted_at,
      status: r.converted_at ? 'converted' : (r.signed_up_at ? 'signed_up' : 'clicked')
    }));

    return res.status(200).json({
      success: true,
      referralCode: codeData?.code,
      stats: {
        totalClicks,
        signups,
        conversions,
        conversionRate: totalClicks > 0 ? (conversions / totalClicks * 100).toFixed(1) : 0,
        pendingRewards,
        nextRewardProgress: conversions % 3,
        nextRewardIn: 3 - (conversions % 3)
      },
      rewards: rewards?.map(r => ({
        type: r.reward_type,
        referralCount: r.referral_count,
        grantedAt: r.granted_at,
        expiresAt: r.expires_at,
        used: r.used
      })) || [],
      recentReferrals: recentReferrals || []
    });

  } catch (error) {
    console.error('Error in referral stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
