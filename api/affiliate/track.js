const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * GET /api/affiliate/track
 * Track affiliate widget events (impressions, clicks)
 *
 * Query params:
 * - affiliate: affiliate code
 * - trip: trip template ID
 * - action: 'impression' or 'click'
 * - ref: referrer URL
 */
router.get('/track', async (req, res) => {
  try {
    const { affiliate, trip, action, ref } = req.query;

    if (!affiliate || !action) {
      // Return 1x1 transparent GIF even on error (tracking pixel)
      return sendTrackingPixel(res);
    }

    // Get affiliate ID from code
    const { data: affiliateData, error: affiliateError } = await supabase
      .from('affiliates')
      .select('id, status')
      .eq('affiliate_code', affiliate)
      .eq('status', 'active')
      .single();

    if (affiliateError || !affiliateData) {
      console.error('Affiliate not found:', affiliate);
      return sendTrackingPixel(res);
    }

    // Get IP and user agent from request
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    const userAgent = req.headers['user-agent'];

    // Insert tracking event
    const { error: insertError } = await supabase
      .from('affiliate_clicks')
      .insert({
        affiliate_id: affiliateData.id,
        trip_id: trip || null,
        action_type: action,
        referrer: ref || null,
        ip_address: ipAddress,
        user_agent: userAgent
      });

    if (insertError) {
      console.error('Error inserting tracking event:', insertError);
    }

    // Return 1x1 transparent GIF
    sendTrackingPixel(res);

  } catch (error) {
    console.error('Tracking error:', error);
    sendTrackingPixel(res);
  }
});

/**
 * POST /api/affiliate/click
 * Track click event from embed iframe (with more context)
 */
router.post('/click', async (req, res) => {
  try {
    const { affiliateId, tripId, referrer } = req.body;

    if (!affiliateId) {
      return res.status(400).json({ error: 'Missing affiliateId' });
    }

    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    const userAgent = req.headers['user-agent'];

    const { error } = await supabase
      .from('affiliate_clicks')
      .insert({
        affiliate_id: affiliateId,
        trip_id: tripId,
        action_type: 'click',
        referrer: referrer,
        ip_address: ipAddress,
        user_agent: userAgent
      });

    if (error) {
      console.error('Error tracking click:', error);
      return res.status(500).json({ error: 'Failed to track click' });
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Click tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/affiliate/signup
 * Track signup conversion (called when user signs up with referral code)
 */
router.post('/signup', async (req, res) => {
  try {
    const { affiliateCode, userId } = req.body;

    if (!affiliateCode || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get affiliate ID from code
    const { data: affiliateData } = await supabase
      .from('affiliates')
      .select('id')
      .eq('affiliate_code', affiliateCode)
      .eq('status', 'active')
      .single();

    if (!affiliateData) {
      return res.status(404).json({ error: 'Affiliate not found' });
    }

    // Record signup event
    const { error: insertError } = await supabase
      .from('affiliate_clicks')
      .insert({
        affiliate_id: affiliateData.id,
        action_type: 'signup',
        converted_user_id: userId
      });

    if (insertError) {
      console.error('Error tracking signup:', insertError);
      return res.status(500).json({ error: 'Failed to track signup' });
    }

    // Update user's referral_id
    await supabase
      .from('users')
      .update({
        referral_id: affiliateCode,
        affiliate_signup_date: new Date().toISOString()
      })
      .eq('id', userId);

    res.json({ success: true });

  } catch (error) {
    console.error('Signup tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Helper: Send 1x1 transparent GIF (tracking pixel)
 */
function sendTrackingPixel(res) {
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );

  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': pixel.length,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  res.end(pixel);
}

module.exports = router;
