/**
 * Cherry Blossom Forecast Cache
 * IndexedDB cache with 7-day TTL and automatic refresh
 */

class BloomCache {
  constructor() {
    this.dbName = 'JapanTripDB';
    this.storeName = 'bloomForecasts';
    this.version = 1;
    this.db = null;
    this.TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  }

  /**
   * Initialize IndexedDB
   */
  async init() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB not available');
      return false;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'cacheKey' });
          store.createIndex('city', 'city', { unique: false });
          store.createIndex('year', 'year', { unique: false });
          store.createIndex('cachedAt', 'cachedAt', { unique: false });
        }
      };
    });
  }

  /**
   * Generate cache key
   */
  getCacheKey(city, year) {
    return `${city}_${year}`;
  }

  /**
   * Get forecast from cache
   * @param {string} city - City name
   * @param {number} year - Year
   * @returns {Object|null} Cached forecast or null if expired/not found
   */
  async get(city, year) {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const cacheKey = this.getCacheKey(city, year);
      const request = store.get(cacheKey);

      request.onsuccess = () => {
        const result = request.result;

        if (!result) {
          resolve(null);
          return;
        }

        // Check if cache is expired
        const now = Date.now();
        const age = now - result.cachedAt;

        if (age > this.TTL) {
          console.log(`Cache expired for ${city} ${year} (age: ${Math.round(age / (1000 * 60 * 60))} hours)`);
          resolve(null);
          return;
        }

        resolve(result.forecast);
      };

      request.onerror = () => {
        console.error('Failed to get from cache:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Store forecast in cache
   * @param {string} city - City name
   * @param {number} year - Year
   * @param {Object} forecast - Forecast data
   */
  async set(city, year, forecast) {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) return false;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const cacheEntry = {
        cacheKey: this.getCacheKey(city, year),
        city: city,
        year: year,
        forecast: forecast,
        cachedAt: Date.now()
      };

      const request = store.put(cacheEntry);

      request.onsuccess = () => {
        console.log(`Cached forecast for ${city} ${year}`);
        resolve(true);
      };

      request.onerror = () => {
        console.error('Failed to cache forecast:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all cached forecasts
   * @returns {Array} Array of all cached forecasts
   */
  async getAll() {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result || [];
        const now = Date.now();

        // Filter out expired entries
        const valid = results.filter(entry => {
          const age = now - entry.cachedAt;
          return age <= this.TTL;
        });

        resolve(valid.map(entry => ({
          ...entry.forecast,
          cachedAt: entry.cachedAt
        })));
      };

      request.onerror = () => {
        console.error('Failed to get all from cache:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Clear expired cache entries
   * @returns {number} Number of entries cleared
   */
  async clearExpired() {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) return 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.openCursor();
      let cleared = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
          const entry = cursor.value;
          const age = Date.now() - entry.cachedAt;

          if (age > this.TTL) {
            cursor.delete();
            cleared++;
          }

          cursor.continue();
        } else {
          console.log(`Cleared ${cleared} expired cache entries`);
          resolve(cleared);
        }
      };

      request.onerror = () => {
        console.error('Failed to clear expired cache:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Check if refresh is needed (based on day of week)
   * Refresh on Sundays during March-May
   * @returns {boolean} True if refresh should happen
   */
  shouldRefresh() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const month = now.getMonth(); // 0 = January

    // Refresh on Sundays during March (2), April (3), May (4)
    return dayOfWeek === 0 && month >= 2 && month <= 4;
  }

  /**
   * Fetch fresh forecast from API
   * @param {string} city - City name
   * @param {number} year - Year
   * @returns {Object} Fresh forecast data
   */
  async fetchFresh(city, year) {
    try {
      const response = await fetch(`/api/forecast?city=${encodeURIComponent(city)}&year=${year}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const forecast = await response.json();
      return forecast;
    } catch (error) {
      console.error(`Failed to fetch forecast for ${city}:`, error);
      throw error;
    }
  }

  /**
   * Get forecast with automatic caching
   * @param {string} city - City name
   * @param {number} year - Year
   * @param {boolean} forceRefresh - Force fresh fetch
   * @returns {Object} Forecast data
   */
  async getForecast(city, year, forceRefresh = false) {
    // Check cache first
    if (!forceRefresh) {
      const cached = await this.get(city, year);
      if (cached) {
        console.log(`Using cached forecast for ${city} ${year}`);
        return cached;
      }
    }

    // Fetch fresh data
    console.log(`Fetching fresh forecast for ${city} ${year}`);
    const forecast = await this.fetchFresh(city, year);

    // Store in cache
    await this.set(city, year, forecast);

    return forecast;
  }

  /**
   * Prefetch forecasts for multiple cities
   * Useful for warming up cache on page load
   * @param {Array<string>} cities - Array of city names
   * @param {number} year - Year
   */
  async prefetch(cities, year) {
    console.log(`Prefetching forecasts for ${cities.length} cities...`);

    const promises = cities.map(city =>
      this.getForecast(city, year).catch(err => {
        console.error(`Failed to prefetch ${city}:`, err);
        return null;
      })
    );

    const results = await Promise.all(promises);
    const successful = results.filter(r => r !== null).length;

    console.log(`Prefetched ${successful}/${cities.length} forecasts`);
    return results;
  }

  /**
   * Schedule automatic weekly refresh
   * Call this on app initialization
   */
  scheduleWeeklyRefresh(cities) {
    // Check every hour if it's Sunday
    setInterval(async () => {
      if (this.shouldRefresh()) {
        console.log('Weekly refresh triggered');
        const year = new Date().getFullYear();
        await this.prefetch(cities, year);
        await this.clearExpired();
      }
    }, 60 * 60 * 1000); // Check every hour
  }
}

// Export singleton instance
const bloomCache = new BloomCache();

// Auto-initialize on module load (browser only)
if (typeof window !== 'undefined') {
  bloomCache.init().catch(err => {
    console.error('Failed to initialize bloom cache:', err);
  });
}

module.exports = bloomCache;
