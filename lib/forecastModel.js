/**
 * Cherry Blossom Forecast Model
 * Uses linear regression to predict bloom dates based on temperature accumulation
 * Model: bloomDOY = β0 + β1 * tempAccumulation
 */

const stats = require('simple-statistics');
const { format, getDayOfYear, parseISO } = require('date-fns');
const fs = require('fs').promises;
const path = require('path');

/**
 * Train a linear regression model for a specific city
 * @param {string} cityName - Name of the city
 * @param {Array} historicalData - Array of historical bloom records
 * @returns {Object} Trained model with coefficients and metrics
 */
function trainModel(cityName, historicalData) {
  // Filter data for specific city
  const cityData = historicalData.filter(d => d.city === cityName);

  if (cityData.length < 5) {
    throw new Error(`Insufficient data for ${cityName}: ${cityData.length} records`);
  }

  // Prepare training data: x = tempAccumulation, y = bloomDOY
  const trainingData = cityData.map(d => [d.tempAccumulation, d.bloomDOY]);

  // Calculate linear regression
  const regression = stats.linearRegression(trainingData);
  const regressionLine = stats.linearRegressionLine(regression);

  // Calculate R² (coefficient of determination)
  const actualY = trainingData.map(d => d[1]);
  const predictedY = trainingData.map(d => regressionLine(d[0]));
  const rSquared = stats.rSquared(trainingData, regressionLine);

  // Calculate RMSE (root mean square error)
  const squaredErrors = actualY.map((y, i) => Math.pow(y - predictedY[i], 2));
  const rmse = Math.sqrt(stats.mean(squaredErrors));

  // Calculate historical range
  const bloomDOYs = cityData.map(d => d.bloomDOY);
  const historicalRange = [
    Math.min(...bloomDOYs),
    Math.max(...bloomDOYs)
  ];

  return {
    city: cityName,
    coefficients: {
      intercept: regression.b,
      slope: regression.m
    },
    metrics: {
      rSquared: rSquared,
      rmse: rmse,
      sampleSize: cityData.length
    },
    historicalRange: historicalRange,
    predict: function(tempAccumulation) {
      return regressionLine(tempAccumulation);
    }
  };
}

/**
 * Train models for all cities in the dataset
 * @param {Array} historicalData - Full historical dataset
 * @returns {Object} Map of city names to trained models
 */
function trainAllModels(historicalData) {
  const cities = [...new Set(historicalData.map(d => d.city))];
  const models = {};

  for (const city of cities) {
    try {
      models[city] = trainModel(city, historicalData);
    } catch (error) {
      console.error(`Failed to train model for ${city}:`, error.message);
    }
  }

  return models;
}

/**
 * Predict bloom date based on current temperature accumulation
 * @param {string} cityName - Name of the city
 * @param {number} currentTempAccum - Current temperature accumulation (°C-days)
 * @param {Object} model - Trained model for the city
 * @param {number} currentYear - Current year
 * @returns {Object} Prediction with confidence interval
 */
function predictBloom(cityName, currentTempAccum, model, currentYear = new Date().getFullYear()) {
  if (!model) {
    throw new Error(`No model available for ${cityName}`);
  }

  // Predict bloom DOY
  const predictedDOY = Math.round(model.predict(currentTempAccum));

  // Calculate confidence based on R² and RMSE
  const confidence = calculateConfidence(model, currentTempAccum);

  // Convert DOY to date
  const bloomDate = doyToDate(currentYear, predictedDOY);

  // Calculate peak week (bloom typically peaks 7 days after start)
  const peakDate = doyToDate(currentYear, predictedDOY + 7);
  const peakWeek = Math.ceil(predictedDOY / 7);

  // Determine bloom status based on current date
  const today = new Date();
  const todayDOY = getDayOfYear(today);
  const status = getBloomStatus(todayDOY, predictedDOY);

  return {
    city: cityName,
    predictedBloomDate: bloomDate,
    predictedBloomDOY: predictedDOY,
    peakDate: peakDate,
    peakWeek: peakWeek,
    confidence: confidence,
    historicalRange: model.historicalRange,
    status: status,
    tempAccumulation: currentTempAccum
  };
}

/**
 * Calculate prediction confidence based on model quality and input
 * @param {Object} model - Trained model
 * @param {number} tempAccum - Temperature accumulation
 * @returns {number} Confidence score (0-1)
 */
function calculateConfidence(model, tempAccum) {
  // Base confidence from R²
  let confidence = model.metrics.rSquared;

  // Adjust for RMSE (lower RMSE = higher confidence)
  const rmseAdjustment = Math.max(0, 1 - model.metrics.rmse / 10);
  confidence = confidence * 0.7 + rmseAdjustment * 0.3;

  // Penalize extrapolation beyond training data range
  // (We don't have the temp accumulation range stored, so skip this for now)

  return Math.max(0, Math.min(1, confidence));
}

/**
 * Get bloom status based on current and predicted DOY
 * @param {number} currentDOY - Current day of year
 * @param {number} predictedDOY - Predicted bloom day of year
 * @returns {string} Status: 'pre-bloom', 'early-bloom', 'peak', 'post-peak'
 */
function getBloomStatus(currentDOY, predictedDOY) {
  const diff = currentDOY - predictedDOY;

  if (diff < -7) return 'pre-bloom';
  if (diff < 0) return 'early-bloom';
  if (diff < 7) return 'peak';
  return 'post-peak';
}

/**
 * Convert day of year to ISO date string
 * @param {number} year - Year
 * @param {number} doy - Day of year
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
function doyToDate(year, doy) {
  const date = new Date(year, 0);
  date.setDate(doy);
  return format(date, 'yyyy-MM-dd');
}

/**
 * Calculate temperature accumulation from daily temperatures
 * Sums daily average temperatures above 0°C from February 1st
 * @param {Array} dailyTemps - Array of {date, avgTemp} objects
 * @returns {number} Temperature accumulation in °C-days
 */
function calculateTempAccumulation(dailyTemps) {
  let accumulation = 0;
  const startDate = new Date(new Date().getFullYear(), 1, 1); // February 1st

  for (const temp of dailyTemps) {
    const date = parseISO(temp.date);
    if (date >= startDate && temp.avgTemp > 0) {
      accumulation += temp.avgTemp;
    }
  }

  return accumulation;
}

/**
 * Load trained models from cache
 * @returns {Object} Map of city names to trained models
 */
async function loadModels() {
  try {
    const modelsPath = path.join(__dirname, '..', 'data', 'bloom_models.json');
    const data = await fs.readFile(modelsPath, 'utf-8');
    const modelsData = JSON.parse(data);

    // Reconstruct predict functions
    const models = {};
    for (const [city, modelData] of Object.entries(modelsData)) {
      models[city] = {
        ...modelData,
        predict: function(tempAccum) {
          return modelData.coefficients.intercept + modelData.coefficients.slope * tempAccum;
        }
      };
    }

    return models;
  } catch (error) {
    console.error('Failed to load models:', error.message);
    return null;
  }
}

/**
 * Save trained models to cache
 * @param {Object} models - Map of city names to trained models
 */
async function saveModels(models) {
  // Remove predict functions for serialization
  const modelsData = {};
  for (const [city, model] of Object.entries(models)) {
    const { predict, ...serializableModel } = model;
    modelsData[city] = serializableModel;
  }

  const modelsPath = path.join(__dirname, '..', 'data', 'bloom_models.json');
  await fs.writeFile(modelsPath, JSON.stringify(modelsData, null, 2));
}

/**
 * Validate model accuracy on test data (2024)
 * @param {Object} models - Trained models
 * @param {Array} historicalData - Full dataset including 2024
 * @returns {Object} Validation results
 */
function validateModels(models, historicalData) {
  const testYear = 2024;
  const testData = historicalData.filter(d => d.year === testYear);
  const results = {};

  for (const record of testData) {
    if (!models[record.city]) continue;

    const prediction = predictBloom(
      record.city,
      record.tempAccumulation,
      models[record.city],
      testYear
    );

    const error = Math.abs(prediction.predictedBloomDOY - record.bloomDOY);
    results[record.city] = {
      predicted: prediction.predictedBloomDOY,
      actual: record.bloomDOY,
      error: error,
      confidence: prediction.confidence
    };
  }

  return results;
}

module.exports = {
  trainModel,
  trainAllModels,
  predictBloom,
  calculateConfidence,
  getBloomStatus,
  calculateTempAccumulation,
  loadModels,
  saveModels,
  validateModels
};
