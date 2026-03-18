const { trackShareEvent } = require('../../lib/referral');
const { verifySession } = require('../../lib/supabase-auth');

/**
 * Track share event for analytics
 * POST /api/analytics/share
 * Body: { shortCode: string, platform: string, tripId: string }
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
    const { shortCode, platform, tripId } = req.body;

    if (!shortCode || !platform) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Try to get user ID from auth token (optional)
    let userId = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { user } = await verifySession(token);
      if (user) {
        userId = user.id;
      }
    }

    // Track share event
    const metadata = {
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer || req.headers.referrer
    };

    await trackShareEvent(shortCode, platform, userId, metadata);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error tracking share event:', error);
    // Don't fail the request - analytics failures shouldn't break user flow
    return res.status(200).json({ success: true });
  }
};
