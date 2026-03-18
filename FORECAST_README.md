# 🌸 Cherry Blossom Forecast - Quick Start

## What is this?
ML-powered cherry blossom bloom forecasting for 50 Japanese cities using historical data and temperature accumulation models.

## Quick Start

### 1. Setup (one-time)
```bash
npm install
npm run scrape:blooms  # Generate historical data
npm run train:models   # Train ML models
```

### 2. Test the API
```bash
node scripts/test-forecast-api.js
```

### 3. Use in your app
```javascript
// Get forecast for Tokyo
const response = await fetch('/api/forecast?city=Tokyo&year=2026');
const forecast = await response.json();

console.log(forecast.predictedBloomDate);  // "2026-03-28"
console.log(forecast.confidence);           // 0.87
console.log(forecast.status);              // "pre-bloom"
```

## API Endpoint

**GET** `/api/forecast?city={city}&year={year}`

**Response**:
```json
{
  "city": "Tokyo",
  "year": 2026,
  "predictedBloomDate": "2026-03-28",
  "peakDate": "2026-04-04",
  "peakWeek": 13,
  "confidence": 0.87,
  "status": "pre-bloom"
}
```

## Available Cities (50)
Tokyo, Kyoto, Osaka, Hiroshima, Sapporo, Fukuoka, Nagoya, Sendai, Kanazawa, Nara, and 40 more.

## Status Values
- `pre-bloom` - Gray marker - More than 7 days away
- `early-bloom` - Pink marker - Within 7 days
- `peak` - Red marker - Peak bloom period
- `post-peak` - Brown marker - Past peak

## Model Performance
- **Average R²**: 0.925 (excellent)
- **Average error**: 1.0 days
- **Response time**: <200ms (cached)

## Files
- `api/forecast/index.js` - API endpoint
- `lib/forecastModel.js` - ML models
- `lib/bloomCache.js` - IndexedDB cache
- `components/BloomForecast.js` - Map component
- `data/bloom_models.json` - Trained models (50 cities)

## Maintenance
Models update automatically every Sunday during bloom season (March-May).

To manually retrain:
```bash
npm run train:models
```

## Full Documentation
See `CHERRY_BLOSSOM_ML_FORECAST.md` for complete technical documentation.
