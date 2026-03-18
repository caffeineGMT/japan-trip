// Unit tests for weather.js (weather caching and display)
const fs = require('fs');
const path = require('path');

// Mock fetch
global.fetch = jest.fn();

// Mock CONFIG
global.CONFIG = {
  OPENWEATHER_API_KEY: 'test-key',
  CACHE_DURATION: 6 * 60 * 60 * 1000, // 6 hours
  CITIES: {
    tokyo: { lat: 35.6762, lon: 139.6503 },
    kyoto: { lat: 35.0116, lon: 135.7681 },
    osaka: { lat: 34.6937, lon: 135.5023 },
    nara: { lat: 34.6851, lon: 135.8050 }
  }
};

describe('Weather Module', () => {
  let fetchWeather, getWeatherAccent, getTempColor, getCacheAge;

  beforeEach(() => {
    // Clear localStorage and mocks
    global.localStorage.clear();
    global.fetch.mockClear();

    // Load weather.js
    const weatherCode = fs.readFileSync(path.join(__dirname, '../../weather.js'), 'utf8');
    eval(weatherCode);

    // Export functions to test scope
    fetchWeather = global.fetchWeather;
    getWeatherAccent = global.getWeatherAccent;
    getTempColor = global.getTempColor;
    getCacheAge = global.getCacheAge;
  });

  describe('Weather Caching', () => {
    const mockWeatherResponse = {
      list: [
        {
          dt: 1712016000,
          temp: { max: 18, min: 10 },
          weather: [{ icon: '01d', description: 'clear sky', main: 'Clear' }],
          humidity: 65,
          speed: 3.5,
          pop: 0.1
        }
      ]
    };

    test('should fetch fresh weather data', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherResponse
      });

      const result = await fetchWeather('tokyo', 35.6762, 139.6503);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        tempHigh: 18,
        tempLow: 10,
        description: 'clear sky',
        condition: 'Clear'
      });
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('should cache fetched data', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherResponse
      });

      await fetchWeather('tokyo', 35.6762, 139.6503);

      const cached = localStorage.getItem('weather_tokyo');
      expect(cached).toBeTruthy();

      const { data, timestamp } = JSON.parse(cached);
      expect(data).toHaveLength(1);
      expect(timestamp).toBeLessThanOrEqual(Date.now());
    });

    test('should return cached data if fresh', async () => {
      const cachedData = [
        {
          date: new Date(),
          icon: '01d',
          tempHigh: 20,
          tempLow: 12,
          description: 'cached weather'
        }
      ];

      localStorage.setItem('weather_tokyo', JSON.stringify({
        data: cachedData,
        timestamp: Date.now() - 60000 // 1 minute ago
      }));

      const result = await fetchWeather('tokyo', 35.6762, 139.6503);

      expect(result).toEqual(cachedData);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('should refetch if cache expired', async () => {
      localStorage.setItem('weather_tokyo', JSON.stringify({
        data: [],
        timestamp: Date.now() - (7 * 60 * 60 * 1000) // 7 hours ago
      }));

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherResponse
      });

      await fetchWeather('tokyo', 35.6762, 139.6503);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('should return expired cache on network error', async () => {
      const expiredData = [{ tempHigh: 15, tempLow: 8 }];

      localStorage.setItem('weather_tokyo', JSON.stringify({
        data: expiredData,
        timestamp: Date.now() - (10 * 60 * 60 * 1000) // 10 hours ago
      }));

      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchWeather('tokyo', 35.6762, 139.6503);

      expect(result).toEqual(expiredData);
    });

    test('should return empty array if no cache and network fails', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchWeather('tokyo', 35.6762, 139.6503);

      expect(result).toEqual([]);
    });
  });

  describe('Weather Utilities', () => {
    test('getWeatherAccent should return correct colors', () => {
      expect(getWeatherAccent('Clear')).toContain('251, 191, 36');
      expect(getWeatherAccent('Clouds')).toContain('156, 163, 175');
      expect(getWeatherAccent('Rain')).toContain('59, 130, 246');
      expect(getWeatherAccent('Unknown')).toBe('transparent');
    });

    test('getTempColor should categorize temperatures', () => {
      expect(getTempColor(5)).toBe('#60a5fa'); // Cold - blue
      expect(getTempColor(15)).toBe('var(--text)'); // Moderate
      expect(getTempColor(30)).toBe('#fb923c'); // Hot - orange
    });

    test('getCacheAge should calculate age correctly', () => {
      const now = Date.now();

      // 2 hours 30 minutes ago
      localStorage.setItem('weather_tokyo', JSON.stringify({
        data: [],
        timestamp: now - (2.5 * 60 * 60 * 1000)
      }));

      const age = getCacheAge('tokyo');
      expect(age).toBe('2h ago');
    });

    test('getCacheAge should show minutes for recent cache', () => {
      const now = Date.now();

      // 45 minutes ago
      localStorage.setItem('weather_kyoto', JSON.stringify({
        data: [],
        timestamp: now - (45 * 60 * 1000)
      }));

      const age = getCacheAge('kyoto');
      expect(age).toBe('45m ago');
    });

    test('getCacheAge should return null if no cache', () => {
      const age = getCacheAge('osaka');
      expect(age).toBeNull();
    });
  });
});
