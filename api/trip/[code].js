const { supabaseAdmin } = require('../../lib/supabase-auth');

/**
 * Get trip data for public share view
 * GET /api/trip/:code
 * Returns: Trip data with highlights, route, and metadata
 */
module.exports = async (req, res) => {
  // Enable CORS for public sharing
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
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Missing code parameter' });
    }

    // Fetch share data from Supabase
    const { data: shareData, error: shareError } = await supabaseAdmin
      .from('trips_shared')
      .select('*')
      .eq('short_code', code)
      .eq('is_active', true)
      .single();

    if (shareError || !shareData) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Increment view count
    await supabaseAdmin
      .from('trips_shared')
      .update({
        view_count: (shareData.view_count || 0) + 1,
        last_viewed_at: new Date().toISOString()
      })
      .eq('id', shareData.id);

    // For this MVP, use hardcoded trip data based on the Japan trip
    // In production, you would fetch this from a trips table using shareData.trip_id
    const tripData = {
      id: shareData.trip_id,
      shortCode: shareData.short_code,
      sharedBy: shareData.user_id,
      title: 'Japan Cherry Blossom Trip 2026',
      destination: 'Tokyo • Kyoto • Osaka • Nara',
      duration: '14 Days (Mar 30 - Apr 13)',
      description: 'Experience the beauty of Japan during cherry blossom season! This 2-week itinerary covers the best of Tokyo, Kyoto, Osaka, and Nara with carefully curated stops for culture, food, and nature.',
      viewCount: (shareData.view_count || 0) + 1,
      shareCount: shareData.share_count || 0,
      highlights: [
        {
          name: 'Shibuya Sky',
          location: 'Tokyo, Shibuya',
          description: 'Panoramic views from 229m high observation deck. Reserved for April 1, 6:40 PM',
          coords: [35.6580, 139.7016]
        },
        {
          name: 'Sensoji Temple',
          location: 'Tokyo, Asakusa',
          description: 'Tokyo\'s oldest temple with iconic thunder gate and bustling Nakamise shopping street',
          coords: [35.7148, 139.7967]
        },
        {
          name: 'Fushimi Inari Shrine',
          location: 'Kyoto',
          description: 'Famous for thousands of vermillion torii gates creating tunnels up the mountain',
          coords: [34.9671, 135.7727]
        },
        {
          name: 'Osaka Castle',
          location: 'Osaka',
          description: 'Iconic Japanese castle surrounded by cherry blossom gardens and moats',
          coords: [34.6873, 135.5262]
        },
        {
          name: 'Nara Deer Park',
          location: 'Nara',
          description: 'Feed friendly wild deer and visit Todaiji Temple with giant Buddha statue',
          coords: [34.6851, 135.8048]
        }
      ],
      route: [
        [35.6580, 139.7016], // Shibuya
        [35.7148, 139.7967], // Sensoji
        [34.9671, 135.7727], // Fushimi Inari
        [34.6873, 135.5262], // Osaka Castle
        [34.6851, 135.8048]  // Nara
      ],
      createdAt: shareData.created_at,
      sharedAt: shareData.created_at
    };

    return res.status(200).json(tripData);

  } catch (error) {
    console.error('Error fetching trip data:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
