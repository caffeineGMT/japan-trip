/**
 * A/B Testing Analytics Tracker
 * Tracks user events and conversion metrics for pricing page optimization
 */

const fs = require('fs').promises;
const path = require('path');

// Store analytics data in JSON file (in production, use proper DB)
const ANALYTICS_DIR = path.join(process.cwd(), 'data');
const ANALYTICS_FILE = path.join(ANALYTICS_DIR, 'ab-test-analytics.json');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event, variant, timestamp, page, userAgent } = req.body;

    if (!event || !variant) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create analytics entry
    const analyticsEntry = {
      event,
      variant,
      timestamp: timestamp || new Date().toISOString(),
      page: page || 'unknown',
      userAgent: userAgent || 'unknown',
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      sessionId: generateSessionId(req)
    };

    // Load existing analytics data
    let analyticsData = [];
    try {
      await fs.mkdir(ANALYTICS_DIR, { recursive: true });
      const fileContent = await fs.readFile(ANALYTICS_FILE, 'utf8');
      analyticsData = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist yet, start fresh
      analyticsData = [];
    }

    // Add new entry
    analyticsData.push(analyticsEntry);

    // Keep only last 10,000 entries to prevent file from growing too large
    if (analyticsData.length > 10000) {
      analyticsData = analyticsData.slice(-10000);
    }

    // Save back to file
    await fs.writeFile(ANALYTICS_FILE, JSON.stringify(analyticsData, null, 2));

    // Log to console for monitoring
    console.log('[ANALYTICS]', event, variant, page);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return res.status(500).json({
      error: 'Failed to track event',
      message: error.message
    });
  }
};

/**
 * Generate a session ID from request headers
 */
function generateSessionId(req) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';
  const timestamp = Date.now();

  // Simple hash function
  const hash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  };

  return hash(ip + userAgent + Math.floor(timestamp / 3600000)); // Session per hour
}
