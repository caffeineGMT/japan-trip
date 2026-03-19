# Japan Trip 2026 - Personal Trip Planner

A personal web app for planning my Japan trip (March 30 - April 13, 2026).

## Features

- **Interactive Leaflet Map** - View all destinations and stops on a dark-themed map
- **Day-by-Day Itinerary** - Navigate through each day's schedule with detailed stops
- **Weather Integration** - Real-time weather forecasts for each destination
- **Cherry Blossom Forecast** - ML-powered sakura bloom predictions (see `CHERRY_BLOSSOM_ML_FORECAST.md`)
- **Route Planning** - Google Directions API integration for travel times between stops
- **Japanese Phrases** - Essential travel phrases with native audio recordings
- **Trilingual Support** - English, Chinese (中文), and Japanese (日本語)
- **Budget Tracking** - Track reservations and expenses
- **Packing Checklist** - Organize what to bring
- **Mobile-Responsive** - Works on phone, tablet, and desktop

## Tech Stack

- Pure HTML/CSS/JavaScript (no frameworks)
- [Leaflet](https://leafletjs.com/) for interactive maps
- CartoDB Dark tiles for aesthetic map styling
- Google Maps/Directions APIs for routing
- Weather API integration

## File Structure

```
.
├── index.html              # Main app
├── script.js               # Core app logic (map, itinerary, UI)
├── style.css               # Styling (mobile-first, responsive)
├── data.js                 # Trip itinerary data
├── i18n.js                 # Internationalization (EN/ZH/JA)
├── config.js               # API keys and configuration
├── weather.js              # Weather integration
├── routes.js               # Google Directions API routing
├── sakura-widget.js        # Cherry blossom forecast widget
├── audio-player.js         # Japanese phrase audio player
├── phrases.json            # Travel phrases dictionary
├── whats-next.js           # "What's Next" widget
├── checklist.html/js       # Packing checklist page
├── reservations.html/js    # Hotel/restaurant reservations page
├── lib/
│   ├── template-loader.js  # Dynamic template loading
│   ├── forecastModel.js    # Cherry blossom ML model
│   ├── bloomCache.js       # Bloom forecast caching
│   ├── geocoder.js         # Location utilities
│   └── validator.js        # Data validation
├── data/
│   ├── sakura-forecast.json      # Bloom predictions
│   ├── historical_blooms.json    # Historical bloom data
│   ├── bloom_models.json         # ML model coefficients
│   ├── reservations.json         # Hotel/restaurant bookings
│   └── checklist.json            # Packing list
└── audio/phrases/          # Native speaker recordings (MP3)
```

## Running Locally

```bash
# Simple Python server
python3 -m http.server 8000

# Or use npm
npm start
```

Then open http://localhost:8000

## Deployment

Deployed to Vercel. Push to `main` branch triggers auto-deployment.

**DO NOT** run `vercel deploy` manually - deployments are handled automatically via GitHub integration.

## Project Rules

See `CLAUDE.md` for development guidelines.

**This is a PERSONAL trip planner** - not a product, not for customers, no monetization.

## License

Private - for personal use only.
