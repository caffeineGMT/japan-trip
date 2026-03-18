/**
 * Vercel Cron Job: Refresh Cherry Blossom Forecasts
 * Runs every Sunday at 00:00 UTC during March-May
 * Updates all city forecasts and warms up cache
 */

const { loadModels, predictBloom } = require('../../lib/forecastModel');
const { CITIES } = require('../../scripts/scrapeHistoricalData');

/**
 * Refresh all forecasts
 */
async function refreshForecasts() {
  console.log('Starting forecast refresh...');
  const startTime = Date.now();

  try {
    // Load models
    const models = await loadModels();
    if (!models) {
      throw new Error('Failed to load models');
    }

    const currentYear = new Date().getFullYear();
    const forecasts = [];

    // Generate predictions for all cities
    for (const city of CITIES) {
      try {
        // Use estimated temp accumulation based on current date
        const now = new Date();
        const daysSinceFeb1 = Math.floor((now - new Date(currentYear, 1, 1)) / (1000 * 60 * 60 * 24));
        const latFactor = (50 - city.lat) / 5;
        const tempAccum = daysSinceFeb1 * 8 + latFactor * 20;

        const forecast = predictBloom(city.name, tempAccum, models[city.name], currentYear);
        forecasts.push(forecast);
      } catch (error) {
        console.error(`Failed to forecast ${city.name}:`, error.message);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✓ Generated ${forecasts.length} forecasts in ${duration}ms`);

    return {
      success: true,
      count: forecasts.length,
      duration: duration,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Forecast refresh failed:', error);
    throw error;
  }
}

/**
 * Check if we should run (March-May only)
 */
function shouldRun() {
  const now = new Date();
  const month = now.getMonth(); // 0 = January
  return month >= 2 && month <= 4; // March (2) to May (4)
}

/**
 * Vercel serverless function handler
 */
async function handler(req, res) {
  // Verify cron secret (security)
  const authHeader = req.headers.authorization;
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedAuth) {
    console.error('Unauthorized cron request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if we should run
  if (!shouldRun()) {
    console.log('Outside of bloom season (March-May), skipping refresh');
    return res.status(200).json({
      success: true,
      skipped: true,
      reason: 'Outside bloom season'
    });
  }

  try {
    const result = await refreshForecasts();
    res.status(200).json(result);
  } catch (error) {
    console.error('Cron job failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = handler;

// For local testing
if (require.main === module) {
  console.log('Running forecast refresh locally...\n');
  refreshForecasts()
    .then(result => {
      console.log('\nResult:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('\nError:', error);
      process.exit(1);
    });
}
