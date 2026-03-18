const express = require('express');
const router = express.Router();
const openaiClient = require('../../lib/openai-client');
const contextBuilder = require('../../lib/context-builder');
const { getDistance } = require('geolib');

/**
 * GET /api/ai/recommend
 * Get real-time contextual recommendations based on user location
 */
router.get('/recommend', async (req, res) => {
  try {
    const { lat, lon, dayIndex, time, userId, city } = req.query;

    // Validate required parameters
    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Latitude and longitude are required'
      });
    }

    if (!userId) {
      return res.status(400).json({
        error: 'Authentication required',
        message: 'User ID is required for recommendations'
      });
    }

    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);
    const currentDayIndex = parseInt(dayIndex) || 0;
    const currentTime = time || new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    // Get nearby POIs (in a real implementation, this would query Google Places API)
    // For now, we'll use sample POIs from our itinerary data
    const nearbyPOIs = await findNearbyPOIs(userLat, userLon, city);

    if (nearbyPOIs.length === 0) {
      return res.json({
        success: true,
        hasRecommendation: false,
        message: 'No nearby points of interest found'
      });
    }

    // Filter POIs within 1km
    const closePOIs = nearbyPOIs.filter(poi => {
      const distance = getDistance(
        { latitude: userLat, longitude: userLon },
        { latitude: poi.lat, longitude: poi.lng }
      );
      return distance <= 1000; // 1km radius
    });

    if (closePOIs.length === 0) {
      return res.json({
        success: true,
        hasRecommendation: false,
        message: 'No points of interest within 1km'
      });
    }

    // Select the closest interesting POI
    const selectedPOI = closePOIs[0];
    const distance = getDistance(
      { latitude: userLat, longitude: userLon },
      { latitude: selectedPOI.lat, longitude: selectedPOI.lng }
    );

    // Get current weather (mock - in production, call weather API)
    const weather = {
      condition: 'Partly Cloudy',
      temperature: 18
    };

    // Build recommendation context
    const context = {
      currentLocation: {
        name: city || 'Your current location',
        city: city || 'Tokyo',
        lat: userLat,
        lng: userLon
      },
      nearbyPOI: {
        name: selectedPOI.name,
        category: selectedPOI.category,
        description: selectedPOI.description,
        distance: `${Math.round(distance)}m`,
        rating: selectedPOI.rating,
        reviewCount: selectedPOI.reviewCount,
        closingTime: selectedPOI.closingTime,
        lat: selectedPOI.lat,
        lng: selectedPOI.lng
      },
      dayIndex: currentDayIndex,
      currentTime,
      weather,
      userLocation: { lat: userLat, lng: userLon }
    };

    // Generate AI recommendation
    const prompt = contextBuilder.buildRecommendationPrompt(context);
    const systemPrompt = 'You are a friendly, knowledgeable local guide. Provide concise, enthusiastic recommendations.';

    const recommendation = await openaiClient.complete(prompt, {
      userId,
      userTier: 'premium', // Real-time recommendations available to all users
      systemPrompt,
      endpoint: 'recommend',
      maxTokens: 200,
      temperature: 0.8
    });

    // Return recommendation
    res.json({
      success: true,
      hasRecommendation: true,
      poi: context.nearbyPOI,
      recommendation: recommendation.trim(),
      distance: Math.round(distance),
      metadata: {
        currentTime,
        weather,
        dayIndex: currentDayIndex
      }
    });

  } catch (error) {
    console.error('Recommendation error:', error);

    // Handle specific errors
    if (error.message.includes('Rate limit')) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Please wait a moment before requesting another recommendation'
      });
    }

    res.status(500).json({
      error: 'Recommendation failed',
      message: 'Failed to generate recommendation. Please try again.'
    });
  }
});

/**
 * Find nearby POIs (mock implementation)
 * In production, this would call Google Places API
 */
async function findNearbyPOIs(lat, lon, city = 'Tokyo') {
  // Sample POIs for demonstration
  // In production, replace with Google Places API call
  const samplePOIs = [
    {
      name: 'Senso-ji Temple',
      lat: 35.7148,
      lng: 139.7967,
      category: 'temple',
      description: 'Tokyo\'s oldest and most significant Buddhist temple',
      rating: 4.5,
      reviewCount: 45000,
      closingTime: '17:00'
    },
    {
      name: 'Ueno Park',
      lat: 35.7149,
      lng: 139.7742,
      category: 'park',
      description: 'Large public park famous for cherry blossoms',
      rating: 4.4,
      reviewCount: 28000,
      closingTime: '23:00'
    },
    {
      name: 'Tsukiji Outer Market',
      lat: 35.6654,
      lng: 139.7707,
      category: 'market',
      description: 'Historic fish market with fresh seafood and street food',
      rating: 4.3,
      reviewCount: 19000,
      closingTime: '14:00'
    },
    {
      name: 'Shibuya Crossing',
      lat: 35.6595,
      lng: 139.7004,
      category: 'landmark',
      description: 'World\'s busiest pedestrian crossing',
      rating: 4.6,
      reviewCount: 52000,
      closingTime: 'N/A'
    },
    {
      name: 'Meiji Shrine',
      lat: 35.6764,
      lng: 139.6993,
      category: 'shrine',
      description: 'Shinto shrine dedicated to Emperor Meiji',
      rating: 4.5,
      reviewCount: 38000,
      closingTime: '16:00'
    }
  ];

  // Calculate distances and sort by proximity
  const poisWithDistance = samplePOIs.map(poi => {
    const distance = getDistance(
      { latitude: lat, longitude: lon },
      { latitude: poi.lat, longitude: poi.lng }
    );
    return { ...poi, distanceMeters: distance };
  });

  return poisWithDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);
}

module.exports = router;
