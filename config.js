// Configuration for external API integrations
const CONFIG = {
  // Google Maps API key - Replace with your actual API key
  // Get one at: https://console.cloud.google.com/google/maps-apis/
  GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',

  // Google Maps deep link base URL for opening directions in Google Maps app/web
  MAPS_DEEP_LINK_BASE: 'https://www.google.com/maps/dir/?api=1',

  // Default travel mode for route calculation
  DEFAULT_TRAVEL_MODE: 'transit', // Options: 'transit', 'walking', 'driving'

  // Route display settings
  ROUTE_COLORS: {
    transit: '#4285F4',    // Blue for public transit
    walking: '#10b981',    // Green for walking
    driving: '#f59e0b'     // Orange for driving
  },

  // Polyline weight and opacity
  ROUTE_WEIGHT: 3,
  ROUTE_OPACITY: 0.8,

  // Badge styling
  BADGE_PULSE_ANIMATION: true,

  // OpenWeatherMap API Configuration
  // Get your free API key from: https://openweathermap.org/api
  OPENWEATHER_API_KEY: 'YOUR_API_KEY_HERE',

  // Weather cache duration (6 hours in milliseconds)
  CACHE_DURATION: 6 * 60 * 60 * 1000,

  // City coordinates for weather lookups
  CITIES: {
    Tokyo: { lat: 35.6762, lon: 139.6503 },
    Kyoto: { lat: 35.0116, lon: 135.7681 },
    Osaka: { lat: 34.6937, lon: 135.5023 },
    Nara: { lat: 34.6851, lon: 135.8048 }
  }
};
