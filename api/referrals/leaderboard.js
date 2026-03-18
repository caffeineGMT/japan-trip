// API endpoint: GET /api/referrals/leaderboard
// Get top referrers leaderboard

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get leaderboard from view
    const { data: leaderboard, error } = await supabase
      .from('referral_leaderboard')
      .select('*')
      .limit(50);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }

    // Anonymize emails for privacy (show first 3 chars + ***)
    const anonymizedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      email: entry.email.substring(0, 3) + '***@' + entry.email.split('@')[1],
      successfulReferrals: entry.successful_referrals,
      totalReferrals: entry.total_referrals,
      rewardsEarned: entry.rewards_earned,
      badges: getBadges(entry.successful_referrals)
    }));

    return res.status(200).json({
      success: true,
      leaderboard: anonymizedLeaderboard,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in leaderboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function getBadges(referrals) {
  const badges = [];

  if (referrals >= 1) badges.push({ name: 'First Referral', icon: '🎯' });
  if (referrals >= 3) badges.push({ name: 'Triple Threat', icon: '🔥' });
  if (referrals >= 10) badges.push({ name: 'Lifetime Legend', icon: '👑' });
  if (referrals >= 25) badges.push({ name: 'Super Referrer', icon: '⭐' });
  if (referrals >= 50) badges.push({ name: 'Referral Master', icon: '💎' });
  if (referrals >= 100) badges.push({ name: 'Ultimate Champion', icon: '🏆' });

  return badges;
}
