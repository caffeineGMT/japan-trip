const { getReferralStats } = require('../../lib/referral');
const { verifySession } = require('../../lib/supabase-auth');

/**
 * Get referral statistics for authenticated user
 * GET /api/referral/stats
 * Requires: Authentication
 */
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const token = authHeader.substring(7);
    const { user, error: authError } = await verifySession(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // Get referral stats
    const stats = await getReferralStats(user.id);

    return res.status(200).json(stats);

  } catch (error) {
    console.error('Error getting referral stats:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
