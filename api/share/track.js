const { trackShareEvent } = require('../../lib/referral');

/**
 * Track share event for analytics
 * POST /api/share/track
 * Body: { shortCode: string, platform: string, userId?: string, metadata?: object }
 */
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shortCode, platform, userId, metadata } = req.body;

    if (!shortCode || !platform) {
      return res.status(400).json({ error: 'Missing required fields: shortCode, platform' });
    }

    // Track share event
    await trackShareEvent(shortCode, platform, userId, metadata);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error in /api/share/track:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
