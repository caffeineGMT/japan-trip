const { nanoid } = require('nanoid');
const { supabaseAdmin, verifySession } = require('../../lib/supabase-auth');

/**
 * Create shareable short link for a trip
 * POST /api/share/create
 * Body: { tripId: string, userId: string }
 * Returns: { shortUrl: string, shortCode: string }
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

    const { tripId } = req.body;

    if (!tripId) {
      return res.status(400).json({ error: 'Missing required field: tripId' });
    }

    // Check if share already exists for this trip
    const { data: existingShare } = await supabaseAdmin
      .from('trips_shared')
      .select('short_code')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (existingShare) {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.BASE_URL || 'https://trip.to';

      return res.status(200).json({
        shortUrl: `${baseUrl}/${existingShare.short_code}`,
        shortCode: existingShare.short_code,
        existing: true
      });
    }

    // Generate unique 8-character short code
    let shortCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!isUnique && attempts < maxAttempts) {
      shortCode = nanoid(8);

      // Check if short code already exists
      const { data: existing } = await supabaseAdmin
        .from('trips_shared')
        .select('id')
        .eq('short_code', shortCode)
        .single();

      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Failed to generate unique short code');
    }

    // Create share record
    const { data: shareData, error: insertError } = await supabaseAdmin
      .from('trips_shared')
      .insert({
        trip_id: tripId,
        user_id: user.id,
        short_code: shortCode,
        view_count: 0,
        share_count: 0,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating share:', insertError);
      throw insertError;
    }

    // Increment share count immediately
    await supabaseAdmin
      .from('trips_shared')
      .update({ share_count: 1 })
      .eq('id', shareData.id);

    // Construct short URL
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.BASE_URL || 'https://trip.to';

    const shortUrl = `${baseUrl}/${shortCode}`;

    // Return success response
    return res.status(200).json({
      shortUrl,
      shortCode,
      existing: false
    });

  } catch (error) {
    console.error('Error in /api/share/create:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
