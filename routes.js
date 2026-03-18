// Google Directions API integration for route calculation

/**
 * Fetches route information from Google Directions API
 * @param {Object} origin - {lat, lng} coordinates of starting point
 * @param {Object} destination - {lat, lng} coordinates of ending point
 * @param {string} mode - Travel mode: 'transit', 'walking', 'driving'
 * @returns {Promise<Object>} Route data with duration, distance, and encoded polyline
 */
window.fetchRoute = async function fetchRoute(origin, destination, mode = 'transit') {
  // Check if API key is configured
  if (!CONFIG.GOOGLE_MAPS_API_KEY || CONFIG.GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    console.warn('Google Maps API key not configured. Using straight-line routes.');
    return getFallbackRoute(origin, destination);
  }

  const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
  url.searchParams.append('origin', `${origin.lat},${origin.lng}`);
  url.searchParams.append('destination', `${destination.lat},${destination.lng}`);
  url.searchParams.append('mode', mode.toLowerCase());
  url.searchParams.append('key', CONFIG.GOOGLE_MAPS_API_KEY);
  url.searchParams.append('alternatives', 'false');
  url.searchParams.append('language', 'en');

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
      console.warn(`Directions API error: ${data.status}. Using fallback route.`);
      return getFallbackRoute(origin, destination);
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    return {
      duration: leg.duration.text,
      durationValue: leg.duration.value, // in seconds
      distance: leg.distance.text,
      distanceValue: leg.distance.value, // in meters
      polyline: route.overview_polyline.points,
      steps: leg.steps.map(step => ({
        instruction: step.html_instructions,
        distance: step.distance.text,
        duration: step.duration.text,
        mode: step.travel_mode
      }))
    };
  } catch (error) {
    console.error('Error fetching route:', error);
    return getFallbackRoute(origin, destination);
  }
}

/**
 * Fallback route using straight line when API is unavailable
 * @param {Object} origin - {lat, lng}
 * @param {Object} destination - {lat, lng}
 * @returns {Object} Simplified route data
 */
window.getFallbackRoute = function getFallbackRoute(origin, destination) {
  // Calculate approximate straight-line distance using Haversine formula
  const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);

  // Rough estimate: walking speed ~5 km/h, transit ~20 km/h
  const estimatedMinutes = Math.round((distance / 20) * 60);

  return {
    duration: `~${estimatedMinutes} min`,
    durationValue: estimatedMinutes * 60,
    distance: `${distance.toFixed(1)} km`,
    distanceValue: distance * 1000,
    polyline: null, // Will use straight line
    fallback: true
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Origin latitude
 * @param {number} lng1 - Origin longitude
 * @param {number} lat2 - Destination latitude
 * @param {number} lng2 - Destination longitude
 * @returns {number} Distance in kilometers
 */
window.calculateDistance = function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
window.toRad = function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Decode Google's encoded polyline format
 * @param {string} encoded - Encoded polyline string
 * @returns {Array} Array of [lat, lng] coordinates
 */
window.decodePolyline = function decodePolyline(encoded) {
  if (!encoded) return null;

  const coordinates = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    coordinates.push([lat / 1e5, lng / 1e5]);
  }

  return coordinates;
}

/**
 * Get travel mode icon emoji
 * @param {string} mode - Travel mode
 * @returns {string} Emoji representing the mode
 */
window.getModeIcon = function getModeIcon(mode) {
  const icons = {
    transit: '🚇',
    walking: '🚶',
    driving: '🚗',
    bicycling: '🚴'
  };
  return icons[mode.toLowerCase()] || '🚇';
}

/**
 * Batch fetch routes for multiple stop pairs
 * @param {Array} stops - Array of stops with lat/lng
 * @param {string} defaultMode - Default travel mode
 * @returns {Promise<Array>} Array of route data
 */
window.fetchMultipleRoutes = async function fetchMultipleRoutes(stops, defaultMode = 'transit') {
  const routePromises = [];

  for (let i = 0; i < stops.length - 1; i++) {
    const origin = { lat: stops[i].lat, lng: stops[i].lng };
    const destination = { lat: stops[i + 1].lat, lng: stops[i + 1].lng };
    const mode = stops[i].travelMode || defaultMode;

    routePromises.push(
      fetchRoute(origin, destination, mode)
        .then(route => ({
          from: i,
          to: i + 1,
          mode,
          ...route
        }))
    );
  }

  return Promise.all(routePromises);
}
