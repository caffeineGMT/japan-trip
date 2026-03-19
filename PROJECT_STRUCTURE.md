# Project Structure

## Root Files

- `index.html` - Main application page
- `script.js` - Core app logic (Leaflet map, itinerary, UI)
- `style.css` - Styling (dark theme, mobile-first responsive)
- `data.js` - Trip itinerary data (days, stops, hotels)
- `i18n.js` - Internationalization (English/Chinese/Japanese)
- `config.js` - API keys and configuration
- `weather.js` - Weather API integration
- `routes.js` - Google Directions API for route planning
- `sakura-widget.js` - Cherry blossom forecast widget
- `audio-player.js` - Japanese phrase audio player
- `phrases.json` - Travel phrases dictionary (6 categories)
- `whats-next.js` - "What's Next" activity widget
- `checklist.html` + `checklist.js` - Packing checklist page
- `reservations.html` + `reservations.js` - Reservations page
- `vercel.json` - Vercel deployment configuration
- `package.json` - Minimal NPM config (no dependencies)
- `.gitignore` - Git ignore rules

## Documentation

- `README.md` - Project overview and setup guide
- `CLAUDE.md` - Development rules and forbidden features
- `CHERRY_BLOSSOM_ML_FORECAST.md` - ML forecast system documentation
- `PROJECT_STRUCTURE.md` - This file

## Directories

### `/lib` - Utility Libraries
- `template-loader.js` - Dynamic template loading system
- `forecastModel.js` - Cherry blossom ML prediction model
- `bloomCache.js` - Bloom forecast data caching
- `geocoder.js` - Location/geocoding utilities
- `validator.js` - Data validation helpers

### `/data` - JSON Data Files
- `sakura-forecast.json` - Cherry blossom bloom predictions
- `historical_blooms.json` - Historical bloom data (2000-2025)
- `bloom_models.json` - ML model coefficients and parameters
- `model_training_report.json` - Model training results
- `reservations.json` - Hotel and restaurant bookings
- `checklist.json` - Packing list items

### `/audio/phrases` - Native Speaker Audio
- 44 MP3 files organized by category:
  - `general_*.mp3` (10 files) - Basic greetings and phrases
  - `restaurant_*.mp3` (9 files) - Dining phrases
  - `train_*.mp3` (7 files) - Transportation phrases
  - `temple_*.mp3` (5 files) - Cultural site phrases
  - `shopping_*.mp3` (7 files) - Shopping phrases
  - `emergency_*.mp3` (6 files) - Emergency phrases

### `/scripts` - Build and Utility Scripts
- `generate-audio-gtts.py` - Generate phrase audio with Google TTS
- `generate-audio.js` - Alternative audio generation
- `process-native-recordings.js` - Process native speaker recordings
- `record-audio.html` - Web-based audio recording interface
- `validate-audio.js` - Validate audio file integrity
- `scrapeHistoricalData.js` - Scrape historical bloom data
- `trainModels.js` - Train cherry blossom forecast models
- `test-forecast-api.js` - Test forecast API endpoints
- `curateLocations.ts` - Location curation utilities

### `/.vercel` - Vercel Configuration
- Deployment configuration (auto-generated)

## Allowed Features

Per `CLAUDE.md`, this project focuses on:

1. ✅ Interactive Leaflet map with offline tiles
2. ✅ Itinerary display & day-by-day navigation
3. ✅ Budget tracking (reservations page)
4. ✅ Weather integration (real-time forecasts)
5. ✅ Route planning (Google Directions API)
6. ✅ Mobile-responsive design
7. ✅ Cherry blossom forecast (ML-powered, legitimate personal feature)
8. ✅ Japanese phrases with native audio

## Forbidden Features (Removed)

All of the following have been **completely removed**:

- ❌ Monetization (Stripe, payments, pricing, checkouts)
- ❌ Affiliate systems (tracking, partner dashboards)
- ❌ Marketing (SEO, social media campaigns, viral sharing)
- ❌ White-label/multi-tenant systems
- ❌ Analytics services (PostHog, Google Analytics, funnels)
- ❌ Marketplace features
- ❌ Auth/accounts (login, signup, sessions)
- ❌ Chrome extensions
- ❌ PWA (manifest.json, service workers, install prompts)
- ❌ B2B sales systems
- ❌ Product features (this is personal, not a product)

## Tech Stack

- **Pure HTML/CSS/JavaScript** - No frameworks (Next.js/React removed)
- **Leaflet 1.9.4** - Interactive maps
- **CartoDB Dark Tiles** - Map styling
- **Google Maps/Directions API** - Routing and directions
- **Weather API** - Real-time forecasts
- **Web Audio API** - Native phrase playback
- **Python SimpleHTTPServer** - Local development server

## Running Locally

```bash
# Start local server
npm start
# Or directly with Python
python3 -m http.server 8000
```

Open http://localhost:8000

## Deployment

Hosted on Vercel. Auto-deploys on push to `main` branch.

**DO NOT** manually deploy via CLI.
