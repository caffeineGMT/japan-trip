// Cherry Blossom Forecast Widget
// Fetches live sakura data with fallback to static JSON

const SAKURA_CACHE_KEY = 'sakura_forecast_cache';
const SAKURA_CACHE_EXPIRY_DAYS = 7;
const SAKURA_API_TIMEOUT = 3000; // 3 seconds

// Status to icon mapping
const STATUS_ICONS = {
  'dormant': '🌰',
  'bud': '🌱',
  'blooming': '🌸',
  'peak': '🌸🌸',
  'fallen': '🍂'
};

/**
 * Check if cached data is still valid
 */
function isCacheValid() {
  try {
    const cached = localStorage.getItem(SAKURA_CACHE_KEY);
    if (!cached) return false;

    const data = JSON.parse(cached);
    const cacheTime = new Date(data.cachedAt);
    const now = new Date();
    const daysDiff = (now - cacheTime) / (1000 * 60 * 60 * 24);

    return daysDiff < SAKURA_CACHE_EXPIRY_DAYS;
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
  }
}

/**
 * Get cached sakura data
 */
function getCachedData() {
  try {
    const cached = localStorage.getItem(SAKURA_CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached);
    return data.forecast;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

/**
 * Cache sakura data
 */
function cacheData(forecast) {
  try {
    const cacheEntry = {
      forecast,
      cachedAt: new Date().toISOString()
    };
    localStorage.setItem(SAKURA_CACHE_KEY, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error('Error caching data:', error);
  }
}

/**
 * Fetch sakura forecast from API with timeout
 */
async function fetchFromAPI() {
  // Try multiple API sources in priority order
  const apiSources = [
    // Option 1: tenki.jp via CORS proxy (most reliable public source)
    {
      url: 'https://api.allorigins.win/get?url=https://tenki.jp/sakura/',
      parse: (response) => {
        // This would need HTML parsing - for now, fail gracefully
        throw new Error('HTML parsing not implemented');
      }
    }
    // Note: Other APIs require authentication/keys, so we'll fall back to static
  ];

  // For now, always use fallback since we don't have a working public API
  // In production, implement proper API integration here
  return null;
}

/**
 * Load static fallback data
 */
async function loadFallbackData() {
  try {
    const response = await fetch('./data/sakura-forecast.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading fallback data:', error);
    return null;
  }
}

/**
 * Get sakura forecast data (API or fallback)
 */
async function getSakuraData() {
  // Check cache first
  if (isCacheValid()) {
    const cached = getCachedData();
    if (cached) {
      console.log('Using cached sakura data');
      return cached;
    }
  }

  // Try API with timeout
  try {
    const apiData = await Promise.race([
      fetchFromAPI(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API timeout')), SAKURA_API_TIMEOUT)
      )
    ]);

    if (apiData) {
      cacheData(apiData);
      return apiData;
    }
  } catch (error) {
    console.log('API fetch failed, using fallback:', error.message);
  }

  // Fallback to static JSON
  const fallbackData = await loadFallbackData();
  if (fallbackData) {
    cacheData(fallbackData);
  }

  return fallbackData;
}

/**
 * Format date range for display
 */
function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const startMonth = monthNames[start.getMonth()];
  const startDay = start.getDate();
  const endDay = end.getDate();

  // If same month, show "Apr 1-8"
  if (start.getMonth() === end.getMonth()) {
    return `${startMonth} ${startDay}-${endDay}`;
  } else {
    // Different months, show "Mar 28-Apr 5"
    const endMonth = monthNames[end.getMonth()];
    return `${startMonth} ${startDay}-${endMonth} ${endDay}`;
  }
}

/**
 * Render sakura widget
 */
function renderWidget(data) {
  const container = document.getElementById('sakura-widget');
  if (!container || !data || !data.cities) return;

  let html = '';

  // Filter to only show the 4 cities we care about
  const targetCities = ['Tokyo', 'Kyoto', 'Osaka', 'Nara'];
  const cities = data.cities.filter(city => targetCities.includes(city.name));

  cities.forEach(city => {
    const icon = STATUS_ICONS[city.status] || '🌸';
    const peakRange = formatDateRange(city.peakStart, city.peakEnd);
    const isPeak = city.status === 'peak';
    const pulseClass = isPeak ? 'pulse' : '';

    html += `
      <div class="sakura-status ${pulseClass}" title="${city.name}: ${city.status} (Peak: ${peakRange})">
        <div class="sakura-icon">${icon}</div>
        <div class="sakura-label">${city.name}</div>
        <div class="sakura-peak">${peakRange}</div>
      </div>
    `;
  });

  container.innerHTML = html;
  container.style.display = 'flex';
}

/**
 * Initialize sakura widget
 */
async function initSakuraWidget() {
  try {
    console.log('Initializing sakura widget...');
    const data = await getSakuraData();

    if (data) {
      renderWidget(data);
      console.log('Sakura widget initialized successfully');
    } else {
      console.error('Failed to load sakura data');
    }
  } catch (error) {
    console.error('Error initializing sakura widget:', error);
  }
}

// Auto-refresh check (daily)
function scheduleRefresh() {
  const REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  setInterval(async () => {
    if (!isCacheValid()) {
      console.log('Cache expired, refreshing sakura data...');
      const data = await getSakuraData();
      if (data) {
        renderWidget(data);
      }
    }
  }, REFRESH_INTERVAL);
}

// Export for use in script.js
window.initSakuraWidget = initSakuraWidget;

// Auto-schedule refresh on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleRefresh);
} else {
  scheduleRefresh();
}
