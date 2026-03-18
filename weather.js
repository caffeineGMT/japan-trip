// Weather fetching and caching logic

/**
 * Fetch 14-day weather forecast from OpenWeatherMap
 * @param {string} city - City name
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Array>} Array of weather data
 */
async function fetchWeather(city, lat, lon) {
  const cacheKey = `weather_${city}`;

  // Check cache first
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    // Return cached data if less than 6 hours old
    if (age < CONFIG.CACHE_DURATION) {
      console.log(`Using cached weather for ${city} (${Math.round(age / 1000 / 60)} minutes old)`);
      return data;
    }
  }

  // Fetch fresh data
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=14&units=metric&appid=${CONFIG.OPENWEATHER_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    // Parse and format the data
    const weatherData = json.list.map(day => ({
      date: new Date(day.dt * 1000),
      icon: day.weather[0].icon,
      tempHigh: Math.round(day.temp.max),
      tempLow: Math.round(day.temp.min),
      description: day.weather[0].description,
      humidity: day.humidity,
      windSpeed: day.speed,
      pop: Math.round((day.pop || 0) * 100), // Precipitation probability
      condition: day.weather[0].main // Clear, Clouds, Rain, etc.
    }));

    // Cache the data
    localStorage.setItem(cacheKey, JSON.stringify({
      data: weatherData,
      timestamp: Date.now()
    }));

    console.log(`Fetched fresh weather for ${city}`);
    return weatherData;

  } catch (error) {
    console.error(`Failed to fetch weather for ${city}:`, error);

    // Return cached data if available, even if expired
    if (cached) {
      console.log(`Using expired cache for ${city} due to fetch error`);
      const { data } = JSON.parse(cached);
      return data;
    }

    // Return empty array if no cache available
    return [];
  }
}

/**
 * Get weather condition background color accent
 */
function getWeatherAccent(condition) {
  const accents = {
    Clear: 'rgba(251, 191, 36, 0.15)', // Yellow tint
    Clouds: 'rgba(156, 163, 175, 0.15)', // Gray tint
    Rain: 'rgba(59, 130, 246, 0.15)', // Blue tint
    Drizzle: 'rgba(59, 130, 246, 0.15)',
    Snow: 'rgba(219, 234, 254, 0.15)',
    Thunderstorm: 'rgba(79, 70, 229, 0.15)'
  };
  return accents[condition] || 'transparent';
}

/**
 * Get temperature color coding
 */
function getTempColor(temp) {
  if (temp < 10) return '#60a5fa'; // Blue
  if (temp > 25) return '#fb923c'; // Orange
  return 'var(--text)'; // Neutral
}

/**
 * Get cache age string
 */
function getCacheAge(city) {
  const cacheKey = `weather_${city}`;
  const cached = localStorage.getItem(cacheKey);

  if (!cached) return null;

  const { timestamp } = JSON.parse(cached);
  const ageMs = Date.now() - timestamp;
  const ageHours = Math.floor(ageMs / 1000 / 60 / 60);
  const ageMinutes = Math.floor((ageMs / 1000 / 60) % 60);

  if (ageHours > 0) {
    return `${ageHours}h ago`;
  } else {
    return `${ageMinutes}m ago`;
  }
}

/**
 * Render weather card for a specific day
 * @param {string} city - City name
 * @param {Date} targetDate - The date to show weather for
 * @param {HTMLElement} container - DOM element to render into
 */
async function renderWeather(city, targetDate, container) {
  // Show loading state
  container.innerHTML = `
    <div class="weather-skeleton">
      <div class="skeleton-shimmer"></div>
    </div>
  `;

  const cityConfig = CONFIG.CITIES[city];
  if (!cityConfig) {
    container.innerHTML = `<div class="weather-error">City not found</div>`;
    return;
  }

  // Fetch weather data
  const weatherData = await fetchWeather(city, cityConfig.lat, cityConfig.lon);

  if (!weatherData || weatherData.length === 0) {
    container.innerHTML = `
      <div class="weather-error">
        <span>⚠️ Unable to load weather</span>
      </div>
    `;
    return;
  }

  // Find the matching day
  const targetDateStr = targetDate.toISOString().split('T')[0];
  const matchingWeather = weatherData.find(w => {
    const weatherDateStr = w.date.toISOString().split('T')[0];
    return weatherDateStr === targetDateStr;
  });

  if (!matchingWeather) {
    // Use first available day if no exact match
    const weather = weatherData[0];
    container.innerHTML = renderWeatherCard(weather, city, true);
  } else {
    container.innerHTML = renderWeatherCard(matchingWeather, city, false);
  }
}

/**
 * Render a single weather card HTML
 */
function renderWeatherCard(weather, city, isApproximate = false) {
  const accent = getWeatherAccent(weather.condition);
  const highColor = getTempColor(weather.tempHigh);
  const cacheAge = getCacheAge(city);
  const showPrecip = weather.pop > 30;

  return `
    <div class="weather-card" style="background: ${accent}" data-expanded="false" onclick="toggleWeatherCard(this)">
      <div class="weather-compact">
        <img
          src="https://openweathermap.org/img/wn/${weather.icon}@2x.png"
          alt="${weather.description}"
          class="weather-icon"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';"
        />
        <span class="weather-icon-fallback" style="display:none;">
          ${getWeatherEmoji(weather.condition)}
        </span>
        <div class="weather-temps">
          <span class="temp-high" style="color: ${highColor}">${weather.tempHigh}°</span>
          <span class="temp-separator">/</span>
          <span class="temp-low">${weather.tempLow}°</span>
        </div>
        <div class="weather-desc">${weather.description}</div>
        ${cacheAge ? `<div class="cache-indicator" title="Last updated ${cacheAge}">Updated ${cacheAge}</div>` : ''}
        ${isApproximate ? `<div class="weather-warning">⚠️ Approximate</div>` : ''}
      </div>
      ${showPrecip ? `<div class="precip-bar" style="width: ${weather.pop}%"></div>` : ''}
      <div class="weather-details" style="display: none;">
        <div class="weather-detail-row">
          <span class="detail-label">Humidity</span>
          <span class="detail-value">${weather.humidity}%</span>
        </div>
        <div class="weather-detail-row">
          <span class="detail-label">Wind</span>
          <span class="detail-value">${weather.windSpeed} m/s</span>
        </div>
        ${showPrecip ? `
          <div class="weather-detail-row">
            <span class="detail-label">Precipitation</span>
            <span class="detail-value">${weather.pop}%</span>
          </div>
        ` : ''}
      </div>
      <button class="refresh-weather-btn" onclick="refreshWeather(event, '${city}')" title="Refresh weather">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>
      </button>
    </div>
  `;
}

/**
 * Toggle weather card expansion
 */
function toggleWeatherCard(card) {
  const details = card.querySelector('.weather-details');
  const isExpanded = card.dataset.expanded === 'true';

  if (isExpanded) {
    card.dataset.expanded = 'false';
    details.style.display = 'none';
    card.style.height = '60px';
  } else {
    card.dataset.expanded = 'true';
    details.style.display = 'block';
    card.style.height = '200px';
  }
}

/**
 * Refresh weather for a specific city
 */
async function refreshWeather(event, city) {
  event.stopPropagation(); // Prevent card toggle

  const btn = event.currentTarget;
  btn.classList.add('spinning');

  // Clear cache for this city
  const cacheKey = `weather_${city}`;
  localStorage.removeItem(cacheKey);

  // Re-render current day's weather
  const currentDay = TRIP_DATA[currentDayIndex];
  const weatherContainer = document.getElementById('weatherWidget');

  if (weatherContainer && currentDay.city === city) {
    const targetDate = parseDateFromDay(currentDay);
    await renderWeather(city, targetDate, weatherContainer);
  }

  setTimeout(() => {
    btn.classList.remove('spinning');
  }, 500);
}

/**
 * Get weather emoji fallback based on condition
 */
function getWeatherEmoji(condition) {
  const emojis = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Snow: '❄️',
    Thunderstorm: '⛈️',
    Mist: '🌫️',
    Fog: '🌫️'
  };
  return emojis[condition] || '🌤️';
}

/**
 * Parse date from day object (handles various formats)
 */
function parseDateFromDay(day) {
  // Handle different date formats in TRIP_DATA
  const dateStr = day.date;

  // Format: "Mar 31" or "Apr 1" etc.
  if (dateStr.includes('Mar') || dateStr.includes('Apr')) {
    const year = 2026;
    const [month, dayNum] = dateStr.split(' ');
    const monthNum = month === 'Mar' ? 2 : 3; // 0-indexed
    return new Date(year, monthNum, parseInt(dayNum));
  }

  // Format: "Mar 29-30" (range)
  if (dateStr.includes('-')) {
    const parts = dateStr.split(' ');
    const month = parts[0];
    const dayNums = parts[1].split('-');
    const year = 2026;
    const monthNum = month === 'Mar' ? 2 : 3;
    return new Date(year, monthNum, parseInt(dayNums[0]));
  }

  // Fallback to current date
  return new Date();
}

/**
 * Initialize weather for all cities on page load
 */
async function initializeWeather() {
  // Pre-fetch weather for all cities to populate cache
  const cities = Object.keys(CONFIG.CITIES);

  console.log('Pre-fetching weather for all cities...');
  const promises = cities.map(city => {
    const { lat, lon } = CONFIG.CITIES[city];
    return fetchWeather(city, lat, lon);
  });

  await Promise.all(promises);
  console.log('Weather cache initialized');
}
