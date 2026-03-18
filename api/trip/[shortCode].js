const { supabaseAdmin } = require('../../lib/supabase-auth');

/**
 * Get trip data by short code (public, read-only)
 * GET /api/trip/:shortCode
 * Returns: Trip data for public viewing
 */
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shortCode } = req.query;

    if (!shortCode) {
      return res.status(400).json({ error: 'Missing shortCode parameter' });
    }

    // Fetch share data
    const { data: shareData, error: shareError } = await supabaseAdmin
      .from('trips_shared')
      .select('trip_id, user_id, view_count')
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .single();

    if (shareError || !shareData) {
      return res.status(404).json({ error: 'Trip not found or link expired' });
    }

    // Increment view count
    await supabaseAdmin
      .from('trips_shared')
      .update({
        view_count: shareData.view_count + 1,
        last_viewed_at: new Date().toISOString()
      })
      .eq('short_code', shortCode);

    // For MVP, return hardcoded trip data
    // In production, you would fetch actual trip data from a trips table
    // using shareData.trip_id
    const tripData = {
      id: shareData.trip_id,
      title: 'Japan Cherry Blossom Trip',
      destination: 'Tokyo, Kyoto, Osaka, Nara',
      duration: '14 Days',
      description: 'Experience the beauty of Japan during cherry blossom season with this comprehensive 14-day itinerary.',
      highlights: [
        {
          name: 'Shibuya Crossing',
          location: 'Tokyo',
          description: 'Iconic scramble crossing in the heart of Tokyo',
          coords: [139.7005, 35.6595]
        },
        {
          name: 'Fushimi Inari Shrine',
          location: 'Kyoto',
          description: 'Famous for thousands of vermillion torii gates',
          coords: [135.7726, 34.9671]
        },
        {
          name: 'Osaka Castle',
          location: 'Osaka',
          description: 'Historic castle surrounded by cherry blossoms',
          coords: [135.5258, 34.6873]
        }
      ],
      route: [
        [139.7005, 35.6595], // Tokyo
        [135.7681, 35.0116], // Kyoto
        [135.5023, 34.6937], // Osaka
        [135.8048, 34.6851]  // Nara
      ],
      sharedBy: shareData.user_id,
      viewCount: shareData.view_count + 1
    };

    return res.status(200).json(tripData);

  } catch (error) {
    console.error('Error in /api/trip/[shortCode]:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
