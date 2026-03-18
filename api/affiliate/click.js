/**
 * POST /api/affiliate/click
 * Track outbound affiliate clicks (clicks to Booking.com, GetYourGuide, JR Pass)
 * Logs to Supabase outbound_affiliate_clicks table
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service key for server-side operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      source,
      userId,
      templateId,
      dayIndex,
      itemName,
      itemPrice,
      city,
      sessionId,
      referrer,
      timestamp
    } = req.body;

    // Validate required fields
    if (!source) {
      return res.status(400).json({ error: 'Missing required field: source' });
    }

    // Get IP address and user agent from request headers
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] ||
                      req.headers['x-real-ip'] ||
                      req.connection.remoteAddress ||
                      null;

    const userAgent = req.headers['user-agent'] || null;

    // Prepare click data
    const clickData = {
      source: source,
      user_id: userId || null,
      template_id: templateId || null,
      day_index: dayIndex !== undefined ? dayIndex : null,
      item_name: itemName || null,
      item_price: itemPrice || null,
      city: city || null,
      session_id: sessionId || null,
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer: referrer || null,
      clicked_at: timestamp || new Date().toISOString()
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('outbound_affiliate_clicks')
      .insert([clickData])
      .select();

    if (error) {
      console.error('[Affiliate Click API] Supabase error:', error);
      return res.status(500).json({
        error: 'Failed to log click',
        details: error.message
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      clickId: data[0]?.id,
      message: 'Click logged successfully'
    });

  } catch (error) {
    console.error('[Affiliate Click API] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
