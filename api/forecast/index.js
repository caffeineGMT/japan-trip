/**
 * Cherry Blossom Forecast API
 * GET /api/forecast?city=Tokyo&year=2026
 * Returns ML-based bloom predictions
 */

const { loadModels, predictBloom } = require('../../lib/forecastModel');
const axios = require('axios');

// In-memory cache for models (loaded once at startup)
let modelsCache = null;
let modelsCacheTime = null;
const MODEL_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get current temperature accumulation from OpenWeatherMap
 * @param {string} city - City name
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {number} Temperature accumulation in °C-days
 */
async function getCurrentTempAccumulation(city, lat, lon) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.warn('OpenWeatherMap API key not configured, using estimated value');
      // Return estimated value based on current date
      const now = new Date();
      const daysSinceFeb1 = Math.floor((now - new Date(now.getFullYear(), 1, 1)) / (1000 * 60 * 60 * 24));
      return daysSinceFeb1 * 8; // Rough estimate: 8°C average per day
    }

    // Get historical weather data for Feb 1 - today
    const currentYear = new Date().getFullYear();
    const startDate = Math.floor(new Date(currentYear, 1, 1).getTime() / 1000);
    const endDate = Math.floor(Date.now() / 1000);

    // OpenWeatherMap Historical API
    const url = `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${startDate}&appid=${apiKey}&units=metric`;

    // For demo purposes, use a simpler current weather + estimated approach
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await axios.get(currentUrl);

    const currentTemp = response.data.main.temp;
    const daysSinceFeb1 = Math.floor((Date.now() - new Date(currentYear, 1, 1).getTime()) / (1000 * 60 * 60 * 24));

    // Estimate accumulation: current temp × days
    const tempAccumulation = Math.max(0, currentTemp * daysSinceFeb1 * 0.7); // 0.7 factor for averaging

    return Math.round(tempAccumulation);
  } catch (error) {
    console.error('Error fetching temperature data:', error.message);
    // Fallback: estimate based on date and latitude
    const now = new Date();
    const daysSinceFeb1 = Math.floor((now - new Date(now.getFullYear(), 1, 1)) / (1000 * 60 * 60 * 24));
    const latFactor = (50 - lat) / 5; // Warmer in south
    return Math.round((daysSinceFeb1 * 8 + latFactor * 20));
  }
}

/**
 * Get city coordinates from CITIES list
 */
function getCityCoordinates(cityName) {
  const { CITIES } = require('../../scripts/scrapeHistoricalData');
  const city = CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase());
  return city ? { lat: city.lat, lon: city.lon } : null;
}

/**
 * Main API handler
 */
async function handler(req, res) {
  try {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Parse query parameters
    const { city, year } = req.query;

    if (!city) {
      res.status(400).json({ error: 'City parameter is required' });
      return;
    }

    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    // Load models (with caching)
    if (!modelsCache || (Date.now() - modelsCacheTime) > MODEL_CACHE_TTL) {
      console.log('Loading forecast models...');
      modelsCache = await loadModels();
      modelsCacheTime = Date.now();

      if (!modelsCache) {
        res.status(500).json({ error: 'Failed to load forecast models' });
        return;
      }
    }

    // Get model for requested city
    const model = modelsCache[city];
    if (!model) {
      res.status(404).json({
        error: `No forecast model available for ${city}`,
        availableCities: Object.keys(modelsCache)
      });
      return;
    }

    // Get city coordinates
    const coords = getCityCoordinates(city);
    if (!coords) {
      res.status(404).json({ error: `City not found: ${city}` });
      return;
    }

    // Get current temperature accumulation
    const tempAccumulation = await getCurrentTempAccumulation(city, coords.lat, coords.lon);

    // Generate prediction
    const prediction = predictBloom(city, tempAccumulation, model, targetYear);

    // Format response
    const response = {
      city: prediction.city,
      year: targetYear,
      predictedBloomDate: prediction.predictedBloomDate,
      peakDate: prediction.peakDate,
      peakWeek: prediction.peakWeek,
      confidence: Math.round(prediction.confidence * 100) / 100,
      historicalRange: prediction.historicalRange,
      status: prediction.status,
      tempAccumulation: prediction.tempAccumulation,
      metadata: {
        modelQuality: {
          rSquared: Math.round(model.metrics.rSquared * 1000) / 1000,
          rmse: Math.round(model.metrics.rmse * 10) / 10,
          sampleSize: model.metrics.sampleSize
        },
        generatedAt: new Date().toISOString()
      }
    };

    // Cache headers (7 days during season, 24 hours off-season)
    const now = new Date();
    const month = now.getMonth();
    const isSeasonTime = month >= 2 && month <= 4; // March-May
    const cacheMaxAge = isSeasonTime ? 7 * 24 * 60 * 60 : 24 * 60 * 60;

    res.setHeader('Cache-Control', `public, max-age=${cacheMaxAge}, s-maxage=${cacheMaxAge}`);
    res.status(200).json(response);

  } catch (error) {
    console.error('Forecast API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Export for serverless and Express
module.exports = handler;

// For local testing
if (require.main === module) {
  const express = require('express');
  const app = express();

  app.get('/api/forecast', handler);

  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Forecast API listening on port ${port}`);
    console.log(`Test: http://localhost:${port}/api/forecast?city=Tokyo&year=2026`);
  });
}
