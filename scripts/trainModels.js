/**
 * Train ML models for cherry blossom forecasting
 * Reads historical data and trains linear regression models for each city
 */

const fs = require('fs').promises;
const path = require('path');
const {
  trainAllModels,
  saveModels,
  validateModels
} = require('../lib/forecastModel');

async function main() {
  console.log('🌸 Cherry Blossom Forecast Model Training\n');

  try {
    // Load historical data
    console.log('Loading historical data...');
    const dataPath = path.join(__dirname, '..', 'data', 'historical_blooms.json');
    const dataContent = await fs.readFile(dataPath, 'utf-8');
    const historicalData = JSON.parse(dataContent);
    console.log(`✓ Loaded ${historicalData.length} historical records\n`);

    // Train models for all cities
    console.log('Training models for all cities...');
    const models = trainAllModels(historicalData);
    const cityCount = Object.keys(models).length;
    console.log(`✓ Trained ${cityCount} city models\n`);

    // Display model statistics
    console.log('Model Performance Summary:');
    console.log('─'.repeat(80));
    console.log(
      'City'.padEnd(20) +
      'R²'.padEnd(10) +
      'RMSE'.padEnd(10) +
      'Samples'.padEnd(10) +
      'Quality'
    );
    console.log('─'.repeat(80));

    const sortedCities = Object.keys(models).sort();
    for (const city of sortedCities) {
      const model = models[city];
      const r2 = model.metrics.rSquared.toFixed(3);
      const rmse = model.metrics.rmse.toFixed(1);
      const samples = model.metrics.sampleSize;

      // Quality rating based on R²
      let quality = '⭐';
      if (model.metrics.rSquared > 0.9) quality = '⭐⭐⭐⭐⭐';
      else if (model.metrics.rSquared > 0.8) quality = '⭐⭐⭐⭐';
      else if (model.metrics.rSquared > 0.7) quality = '⭐⭐⭐';
      else if (model.metrics.rSquared > 0.6) quality = '⭐⭐';

      console.log(
        city.padEnd(20) +
        r2.padEnd(10) +
        rmse.padEnd(10) +
        samples.toString().padEnd(10) +
        quality
      );
    }
    console.log('─'.repeat(80));

    // Calculate average metrics
    const avgR2 = Object.values(models).reduce((sum, m) => sum + m.metrics.rSquared, 0) / cityCount;
    const avgRMSE = Object.values(models).reduce((sum, m) => sum + m.metrics.rmse, 0) / cityCount;
    console.log(`\nAverage R²: ${avgR2.toFixed(3)}`);
    console.log(`Average RMSE: ${avgRMSE.toFixed(1)} days`);

    // Validate on test data (2024)
    console.log('\nValidating models on 2024 data...');
    const validation = validateModels(models, historicalData);
    const validationEntries = Object.entries(validation);

    if (validationEntries.length > 0) {
      const avgError = validationEntries.reduce((sum, [_, v]) => sum + v.error, 0) / validationEntries.length;
      console.log(`✓ Average prediction error: ${avgError.toFixed(1)} days\n`);

      // Show top 5 most accurate predictions
      console.log('Top 5 Most Accurate 2024 Predictions:');
      const sorted = validationEntries.sort((a, b) => a[1].error - b[1].error);
      for (let i = 0; i < Math.min(5, sorted.length); i++) {
        const [city, v] = sorted[i];
        console.log(`  ${(i + 1)}. ${city}: ${v.error.toFixed(1)} days error (predicted: ${v.predicted}, actual: ${v.actual})`);
      }
    }

    // Save models to file
    console.log('\nSaving models...');
    await saveModels(models);
    console.log('✓ Models saved to data/bloom_models.json');

    // Generate summary report
    const report = {
      trainingDate: new Date().toISOString(),
      totalCities: cityCount,
      totalRecords: historicalData.length,
      averageMetrics: {
        rSquared: avgR2,
        rmse: avgRMSE
      },
      modelQuality: {
        excellent: Object.values(models).filter(m => m.metrics.rSquared > 0.9).length,
        good: Object.values(models).filter(m => m.metrics.rSquared > 0.7 && m.metrics.rSquared <= 0.9).length,
        fair: Object.values(models).filter(m => m.metrics.rSquared > 0.5 && m.metrics.rSquared <= 0.7).length,
        poor: Object.values(models).filter(m => m.metrics.rSquared <= 0.5).length
      }
    };

    const reportPath = path.join(__dirname, '..', 'data', 'model_training_report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log('✓ Training report saved to data/model_training_report.json');

    console.log('\n✅ Model training complete!\n');

  } catch (error) {
    console.error('\n❌ Training failed:', error);
    process.exit(1);
  }
}

// Run training
if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };
