const { trackReferral } = require('../../lib/referral');
const { verifySession } = require('../../lib/supabase-auth');

/**
 * Track referral on user signup
 * POST /api/referral/track
 * Body: { referrerId: string }
 * Requires: Authentication (referred user's token)
 */
module.exports = async (req, res) => {
  // Enable CORS
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
    // Verify authentication (referred user)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const token = authHeader.substring(7);
    const { user, error: authError } = await verifySession(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const { referrerId, shortCode } = req.body;

    if (!referrerId) {
      return res.status(400).json({ error: 'Missing referrerId' });
    }

    // Track referral
    const referral = await trackReferral(user.id, referrerId, shortCode);

    return res.status(200).json({
      success: true,
      referral: {
        id: referral.id,
        status: referral.status
      }
    });

  } catch (error) {
    console.error('Error tracking referral:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
