const { supabaseAdmin } = require('./supabase-auth');

/**
 * Track a new referral when a user signs up via referral link
 * @param {string} referredUserId - ID of the new user who signed up
 * @param {string} referrerId - ID of the user who referred them
 * @param {string} shortCode - Optional short code that was used for referral
 * @returns {Promise<object>} Created referral record
 */
async function trackReferral(referredUserId, referrerId, shortCode = null) {
  try {
    // Prevent self-referrals
    if (referredUserId === referrerId) {
      throw new Error('Users cannot refer themselves');
    }

    // Check if referral already exists
    const { data: existing } = await supabaseAdmin
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrerId)
      .eq('referred_user_id', referredUserId)
      .single();

    if (existing) {
      console.log('Referral already exists:', existing.id);
      return existing;
    }

    // Create referral record
    const { data: referral, error: referralError } = await supabaseAdmin
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_user_id: referredUserId,
        short_code: shortCode,
        source: shortCode ? 'share_link' : 'direct_invite',
        status: 'completed', // Mark as completed immediately on signup
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (referralError) {
      console.error('Error creating referral:', referralError);
      throw referralError;
    }

    // Update referrer's rewards
    await updateReferralRewards(referrerId);

    // Check if referrer qualifies for premium rewards
    await checkReferralRewards(referrerId);

    return referral;

  } catch (error) {
    console.error('Error in trackReferral:', error);
    throw error;
  }
}

/**
 * Update referral reward counters for a user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function updateReferralRewards(userId) {
  try {
    // Count referrals by status
    const { data: referrals } = await supabaseAdmin
      .from('referrals')
      .select('status')
      .eq('referrer_id', userId);

    const totalReferrals = referrals?.length || 0;
    const completedReferrals = referrals?.filter(r => r.status === 'completed' || r.status === 'rewarded').length || 0;
    const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;

    // Upsert referral rewards record
    const { error: upsertError } = await supabaseAdmin
      .from('referral_rewards')
      .upsert({
        user_id: userId,
        total_referrals: totalReferrals,
        completed_referrals: completedReferrals,
        pending_referrals: pendingReferrals,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('Error updating referral rewards:', upsertError);
      throw upsertError;
    }

  } catch (error) {
    console.error('Error in updateReferralRewards:', error);
    throw error;
  }
}

/**
 * Check referral count and grant premium access if qualified
 * Rewards: 1 month premium for every 3 completed referrals
 * @param {string} userId - User ID
 * @returns {Promise<object>} Updated rewards data
 */
async function checkReferralRewards(userId) {
  try {
    // Use the database function for atomic reward checking
    const { error: checkError } = await supabaseAdmin
      .rpc('check_referral_rewards', { p_user_id: userId });

    if (checkError) {
      console.error('Error checking referral rewards:', checkError);
      throw checkError;
    }

    // Fetch updated rewards
    const { data: rewards, error: fetchError } = await supabaseAdmin
      .from('referral_rewards')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // Ignore "not found" errors
      console.error('Error fetching referral rewards:', fetchError);
      throw fetchError;
    }

    return rewards;

  } catch (error) {
    console.error('Error in checkReferralRewards:', error);
    throw error;
  }
}

/**
 * Get referral stats for a user
 * @param {string} userId - User ID
 * @returns {Promise<object>} Referral statistics
 */
async function getReferralStats(userId) {
  try {
    // Get rewards record
    const { data: rewards } = await supabaseAdmin
      .from('referral_rewards')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get recent referrals
    const { data: recentReferrals } = await supabaseAdmin
      .from('referrals')
      .select('*, referred_user:users!referred_user_id(email)')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate progress to next reward (3 referrals = 1 month premium)
    const completedCount = rewards?.completed_referrals || 0;
    const progressToNextReward = completedCount % 3;
    const remainingForReward = 3 - progressToNextReward;

    return {
      totalReferrals: rewards?.total_referrals || 0,
      completedReferrals: completedCount,
      pendingReferrals: rewards?.pending_referrals || 0,
      premiumMonthsEarned: rewards?.premium_months_earned || 0,
      premiumUntil: rewards?.premium_until,
      progressToNextReward,
      remainingForReward: remainingForReward === 3 ? 3 : remainingForReward,
      recentReferrals: recentReferrals || []
    };

  } catch (error) {
    console.error('Error in getReferralStats:', error);
    throw error;
  }
}

/**
 * Track share event for analytics
 * @param {string} shortCode - Short code being shared
 * @param {string} platform - Platform ('twitter', 'facebook', 'whatsapp', 'copy_link', 'email')
 * @param {string} userId - User ID (optional)
 * @param {object} metadata - Additional metadata (user_agent, referrer)
 * @returns {Promise<object>} Created share event
 */
async function trackShareEvent(shortCode, platform, userId = null, metadata = {}) {
  try {
    const { data: shareEvent, error: eventError } = await supabaseAdmin
      .from('share_events')
      .insert({
        short_code: shortCode,
        platform,
        user_id: userId,
        user_agent: metadata.userAgent,
        referrer: metadata.referrer,
        shared_at: new Date().toISOString()
      })
      .select()
      .single();

    if (eventError) {
      console.error('Error tracking share event:', eventError);
      throw eventError;
    }

    return shareEvent;

  } catch (error) {
    console.error('Error in trackShareEvent:', error);
    // Don't throw - analytics failures shouldn't break user flow
    return null;
  }
}

module.exports = {
  trackReferral,
  updateReferralRewards,
  checkReferralRewards,
  getReferralStats,
  trackShareEvent
};
