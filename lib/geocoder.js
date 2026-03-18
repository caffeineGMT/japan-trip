/**
 * Nominatim Geocoding API Wrapper
 * Provides location search and reverse geocoding using OpenStreetMap data
 */

class Geocoder {
  constructor() {
    this.baseUrl = 'https://nominatim.openstreetmap.org';
    this.defaultParams = {
      format: 'json',
      addressdetails: 1,
      limit: 5,
      'accept-language': 'en,ja,zh'
    };
    // Rate limiting: 1 request per second as per Nominatim usage policy
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000;
  }

  /**
   * Geocode a location query to coordinates
   * @param {string} query - Search query (e.g., "Tokyo Tower", "Shibuya Crossing")
   * @param {Object} options - Additional options
   * @param {Array} options.bounds - [minLat, minLng, maxLat, maxLng] to bias results
   * @param {string} options.countryCode - ISO 3166-1alpha2 code (e.g., 'jp' for Japan)
   * @returns {Promise<Array>} Array of location results
   */
  async geocode(query, options = {}) {
    await this._rateLimit();

    const params = new URLSearchParams({
      ...this.defaultParams,
      q: query
    });

    if (options.bounds) {
      const [minLat, minLng, maxLat, maxLng] = options.bounds;
      params.append('viewbox', `${minLng},${minLat},${maxLng},${maxLat}`);
      params.append('bounded', '1');
    }

    if (options.countryCode) {
      params.append('countrycodes', options.countryCode);
    }

    try {
      const response = await fetch(`${this.baseUrl}/search?${params}`, {
        headers: {
          'User-Agent': 'JapanTripCompanion/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }

      const results = await response.json();

      return results.map(r => ({
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        display_name: r.display_name,
        name: r.name || r.display_name.split(',')[0],
        type: r.type,
        class: r.class,
        address: r.address,
        importance: r.importance,
        boundingbox: r.boundingbox
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to location details
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Location details
   */
  async reverseGeocode(lat, lng) {
    await this._rateLimit();

    const params = new URLSearchParams({
      ...this.defaultParams,
      lat: lat.toString(),
      lon: lng.toString()
    });

    try {
      const response = await fetch(`${this.baseUrl}/reverse?${params}`, {
        headers: {
          'User-Agent': 'JapanTripCompanion/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display_name: result.display_name,
        name: result.name || result.display_name.split(',')[0],
        address: result.address
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  /**
   * Search for locations with autocomplete suggestions
   * @param {string} query - Partial search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of suggestions
   */
  async autocomplete(query, options = {}) {
    if (!query || query.length < 3) {
      return [];
    }

    return this.geocode(query, options);
  }

  /**
   * Rate limiting helper to comply with Nominatim usage policy
   * @private
   */
  async _rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve =>
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
  }
}

// Export for use in both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Geocoder;
} else {
  window.Geocoder = Geocoder;
}
