// ==================== DYNAMIC TEMPLATE LOADER ====================
// Import template loader
import { loadTemplate, showErrorOverlay } from './lib/template-loader.js';

// Global state
let TRIP_DATA = [];
let TEMPLATE_METADATA = null;

// Initialize app with dynamic template
async function initializeApp() {
  try {
    // Get trip ID from URL parameter, default to Japan template
    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get('trip') || 'japan-cherry-blossom-2026';

    console.log(`[Template] Loading template: ${tripId}`);

    // Load template
    const template = await loadTemplate(tripId);

    // Set global data
    TRIP_DATA = template.days;
    TEMPLATE_METADATA = template.metadata;

    console.log(`[Template] Loaded successfully:`, {
      id: TEMPLATE_METADATA.id,
      title: TEMPLATE_METADATA.title.en,
      days: TRIP_DATA.length
    });

    // Set map initial position from geography
    if (template.geography) {
      const [lat, lng] = template.geography.default_center;
      const zoom = template.geography.default_zoom;
      map.setView([lat, lng], zoom);
    }

    // Render template header
    renderTemplateHeader(TEMPLATE_METADATA);

    // Initialize i18n
    I18N.init();

    // Build tabs and select first day
    buildTabs();
    selectDay(0);

    // Initialize weather cache for all cities
    if (typeof initializeWeather === 'function') {
      initializeWeather().catch(err => {
        console.error('Weather initialization error:', err);
      });
    }

    // Initialize sakura widget
    if (typeof initSakuraWidget === 'function') {
      initSakuraWidget().catch(err => {
        console.error('Sakura widget initialization error:', err);
      });
    }

    // Initialize phrases
    loadPhrases();

  } catch (error) {
    console.error('[Template] Load error:', error);
    showErrorOverlay(error, urlParams.get('trip'));
  }
}

// Render template header with metadata
function renderTemplateHeader(metadata) {
  const headerContainer = document.getElementById('template-header');
  if (!headerContainer) {
    // Create header container if it doesn't exist
    const header = document.getElementById('top-header');
    const newContainer = document.createElement('div');
    newContainer.id = 'template-header';
    newContainer.className = 'template-header';
    header.insertAdjacentElement('afterend', newContainer);
  }

  const container = document.getElementById('template-header');

  // Build header HTML
  const currentLang = I18N?.currentLang || 'en';
  const title = metadata.title[currentLang] || metadata.title.en;
  const destination = metadata.destination[currentLang] || metadata.destination.en;

  // Season badge
  const seasonIcons = {
    spring: '🌸',
    summer: '☀️',
    fall: '🍂',
    winter: '❄️'
  };
  const seasonIcon = seasonIcons[metadata.season] || '';

  const html = `
    <div class="template-info">
      <h1 class="template-title">${title}</h1>
      <div class="template-meta">
        <span class="template-destination">📍 ${destination}</span>
        <span class="template-duration">${metadata.duration_days} Days</span>
        ${metadata.season ? `<span class="template-season">${seasonIcon} ${metadata.season.charAt(0).toUpperCase() + metadata.season.slice(1)}</span>` : ''}
        ${metadata.last_updated ? `<span class="template-updated">Updated: ${metadata.last_updated}</span>` : ''}
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Add styles if not already present
  if (!document.getElementById('template-header-styles')) {
    const style = document.createElement('style');
    style.id = 'template-header-styles';
    style.textContent = `
      .template-header {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-bottom: 2px solid var(--primary);
        padding: 20px 25px;
        display: none; /* Hidden on mobile by default */
      }

      @media (min-width: 768px) {
        .template-header {
          display: block;
        }
      }

      .template-info {
        max-width: 1200px;
        margin: 0 auto;
      }

      .template-title {
        font-size: 1.8em;
        font-weight: 700;
        color: #e8e8ef;
        margin: 0 0 10px 0;
        letter-spacing: -0.02em;
      }

      .template-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        font-size: 0.95em;
        color: var(--text-muted);
      }

      .template-meta > span {
        display: inline-flex;
        align-items: center;
        padding: 5px 12px;
        background: rgba(99, 102, 241, 0.1);
        border-radius: 6px;
        border: 1px solid rgba(99, 102, 241, 0.2);
      }

      .template-destination {
        font-weight: 600;
        color: var(--primary);
      }

      .template-duration {
        background: rgba(16, 185, 129, 0.1);
        border-color: rgba(16, 185, 129, 0.2);
        color: #10b981;
      }

      .template-season {
        background: rgba(245, 158, 11, 0.1);
        border-color: rgba(245, 158, 11, 0.2);
        color: #f59e0b;
      }

      .template-updated {
        font-size: 0.85em;
        opacity: 0.7;
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize map (will be repositioned by template)
const map = L.map('map', {
  zoomControl: true,
  attributionControl: true
}).setView([0, 0], 2); // Temporary initial view

// Use CartoDB dark tiles for the aesthetic
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// State
let currentDayIndex = 0;
let markers = [];
let routeLine = null;
let routePolylines = [];
let routeBadges = [];

// City color mapping
function getCityColor(day) {
  return day.color || '#ef4444';
}

// Category label
function getCategoryLabel(cat) {
  const labels = {
    food: 'Food',
    transport: 'Transport',
    hotel: 'Hotel',
    activity: 'Activity'
  };
  return labels[cat] || cat;
}

// Build day tabs
function buildTabs() {
  const tabsContainer = document.getElementById('day-tabs');
  tabsContainer.innerHTML = ''; // Clear existing tabs
  TRIP_DATA.forEach((day, i) => {
    const tab = document.createElement('div');
    tab.className = 'day-tab' + (i === 0 ? ' active' : '');
    tab.innerHTML = `
      <span>${day.day}</span>
      <span class="tab-date">${day.date}</span>
      <span class="tab-city" style="background:${day.color}"></span>
    `;
    tab.addEventListener('click', () => selectDay(i));
    tabsContainer.appendChild(tab);
  });
}

// Select a day
function selectDay(index) {
  currentDayIndex = index;
  const day = TRIP_DATA[index];

  // Update tab active state
  document.querySelectorAll('.day-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
    if (i === index) {
      tab.style.borderColor = day.color;
      tab.style.background = hexToRgba(day.color, 0.1);
      tab.style.color = '#e8e8ef';
    } else {
      tab.style.borderColor = 'transparent';
      tab.style.background = 'transparent';
      tab.style.color = '';
    }
  });

  // Update sidebar
  renderSidebar(day);

  // Update map
  renderMap(day);
}

// Render sidebar
function renderSidebar(day) {
  const header = document.getElementById('sidebar-header');
  const content = document.getElementById('sidebar-content');
  const color = getCityColor(day);

  // Header
  let headerHtml = `
    <div class="day-label" style="color:${color}">${day.day} &middot; ${day.weekday}</div>
    <h2>${I18N.t(day.theme)}</h2>
    <div class="day-meta">${I18N.t(day.city)} &middot; ${day.date}</div>
  `;

  if (day.hotel) {
    headerHtml += `<div class="hotel-badge">&#127976; ${I18N.t(day.hotel)}</div>`;
  }

  // Add weather widget placeholder in header
  headerHtml += `<div id="weatherWidget" class="weather-container"></div>`;

  header.innerHTML = headerHtml;

  // Render weather for this day
  if (day.city && typeof renderWeather === 'function') {
    const targetDate = parseDateFromDay(day);
    const weatherContainer = document.getElementById('weatherWidget');
    if (weatherContainer) {
      renderWeather(day.city, targetDate, weatherContainer).catch(err => {
        console.error('Weather render error:', err);
      });
    }
  }

  // Content — stop cards
  let contentHtml = '';

  day.stops.forEach((stop, i) => {
    const isHighlight = stop.highlight ? ' highlight' : '';
    contentHtml += `
      <div class="stop-card${isHighlight}" data-stop="${i}" onclick="focusStop(${i})">
        <div class="stop-connector"></div>
        <div class="stop-number" style="background:${color}">${i + 1}</div>
        <div class="stop-info">
          <div class="stop-time">${stop.time}</div>
          <h4>${I18N.t(stop.name)}</h4>
          <div class="stop-desc">${I18N.t(stop.desc)}</div>
          <span class="stop-category ${stop.category}">${getCategoryLabel(stop.category)}</span>
        </div>
      </div>
    `;
  });

  // Cultural Tips
  if (day.culturalTips) {
    contentHtml += '<div class="cultural-tips"><h3>' + I18N.t({en: 'Cultural Tips', zh: '文化贴士', ja: '文化のヒント'}) + '</h3><ul>';
    day.culturalTips.forEach(tip => {
      contentHtml += '<li>' + I18N.t(tip) + '</li>';
    });
    contentHtml += '</ul></div>';
  }

  // Checklist
  if (day.checklist) {
    contentHtml += '<div class="checklist-section"><h3>Checklist</h3>';
    day.checklist.forEach((item, i) => {
      contentHtml += `
        <div class="checklist-item" id="check-${i}">
          <input type="checkbox" onchange="toggleCheck(${i})" />
          <span>${I18N.t(item)}</span>
        </div>
      `;
    });
    contentHtml += '</div>';
  }

  // Dinner note
  if (day.dinner) {
    contentHtml += `<div class="note-block"><strong>Dinner:</strong> ${I18N.t(day.dinner)}</div>`;
  }

  // Note
  if (day.note) {
    contentHtml += `<div class="note-block">${I18N.t(day.note)}</div>`;
  }

  // Extras
  if (day.extras) {
    contentHtml += '<div class="extras-block"><h3>Also Consider</h3><ul>';
    day.extras.forEach(e => {
      contentHtml += `<li>${I18N.t(e)}</li>`;
    });
    contentHtml += '</ul></div>';
  }

  content.innerHTML = contentHtml;

  // === AFFILIATE WIDGETS INJECTION ===
  // Inject affiliate widgets after initial content is loaded
  renderAffiliateWidgets(day, currentDayIndex, content);

  content.scrollTop = 0;
}

// Render affiliate widgets for monetization
async function renderAffiliateWidgets(day, dayIndex, container) {
  // Create container for affiliate widgets
  const affiliateContainer = document.createElement('div');
  affiliateContainer.className = 'affiliate-widgets-section';
  affiliateContainer.id = 'affiliate-widgets';

  // Show transport widget (JR Pass) on first few days only
  if (typeof TransportWidget !== 'undefined' && dayIndex <= 2) {
    const transportHTML = TransportWidget.render(TRIP_DATA, dayIndex);
    if (transportHTML) {
      affiliateContainer.innerHTML += transportHTML;
    }
  }

  // Show activities widget for all days
  if (typeof ActivitiesWidget !== 'undefined') {
    try {
      const activitiesHTML = await ActivitiesWidget.render(day, dayIndex);
      if (activitiesHTML) {
        affiliateContainer.innerHTML += activitiesHTML;
      }
    } catch (error) {
      console.error('Error rendering activities widget:', error);
    }
  }

  // Show hotels widget for all days
  if (typeof HotelsWidget !== 'undefined') {
    try {
      const hotelsHTML = await HotelsWidget.render(day, dayIndex);
      if (hotelsHTML) {
        affiliateContainer.innerHTML += hotelsHTML;
      }
    } catch (error) {
      console.error('Error rendering hotels widget:', error);
    }
  }

  // Append to sidebar content
  container.appendChild(affiliateContainer);
}

// Render map markers and route
async function renderMap(day) {
  // Clear existing
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  if (routeLine) {
    map.removeLayer(routeLine);
    routeLine = null;
  }
  routePolylines.forEach(p => map.removeLayer(p));
  routePolylines = [];
  routeBadges.forEach(b => map.removeLayer(b));
  routeBadges = [];

  const color = getCityColor(day);
  const latlngs = [];

  day.stops.forEach((stop, i) => {
    const isHighlight = stop.highlight ? ' highlight' : '';

    // Custom div icon
    const icon = L.divIcon({
      className: '',
      html: `<div class="custom-marker${isHighlight}" style="background:${color}">${i + 1}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -20]
    });

    // Create popup content with Google Maps deep link
    const stopName = I18N.t(stop.name);
    const popupContent = `
      <h4>${stopName}</h4>
      <div class="popup-time">${stop.time}</div>
      <div class="popup-desc">${I18N.t(stop.desc)}</div>
      <button class="directions-button" onclick="openGoogleMaps(${stop.lat}, ${stop.lng}, '${stopName.replace(/'/g, "\\'")}')">
        <span class="directions-icon">🧭</span> Directions
      </button>
    `;

    const marker = L.marker([stop.lat, stop.lng], { icon })
      .addTo(map)
      .bindPopup(popupContent, { maxWidth: 280 });

    marker.on('click', () => {
      highlightStopCard(i);
    });

    markers.push(marker);
    latlngs.push([stop.lat, stop.lng]);
  });

  // Draw route line (fallback - simple dashed line)
  if (latlngs.length > 1) {
    routeLine = L.polyline(latlngs, {
      color: color,
      weight: 3,
      opacity: 0.5,
      dashArray: '8, 8',
      className: 'route-line'
    }).addTo(map);
  }

  // Fit bounds
  if (latlngs.length > 0) {
    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: day.zoom || 14
    });
  }

  // Draw detailed routes with Google Directions API
  if (day.stops.length > 1) {
    await drawRoutes(day);
  }
}

// Focus on a specific stop from sidebar click
function focusStop(index) {
  const day = TRIP_DATA[currentDayIndex];
  const stop = day.stops[index];

  map.setView([stop.lat, stop.lng], 15, { animate: true });
  markers[index].openPopup();

  highlightStopCard(index);
}

// Highlight a stop card in sidebar
function highlightStopCard(index) {
  document.querySelectorAll('.stop-card').forEach((card, i) => {
    card.classList.toggle('active', i === index);
  });

  // Scroll into view
  const card = document.querySelector(`.stop-card[data-stop="${index}"]`);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Toggle checklist
function toggleCheck(index) {
  const el = document.getElementById(`check-${index}`);
  if (el) {
    el.classList.toggle('checked');
  }
}

// Draw routes between consecutive stops with Google Directions API
async function drawRoutes(day) {
  const stops = day.stops;

  for (let i = 0; i < stops.length - 1; i++) {
    const origin = { lat: stops[i].lat, lng: stops[i].lng };
    const destination = { lat: stops[i + 1].lat, lng: stops[i + 1].lng };

    // Determine travel mode (can be customized per stop)
    const mode = stops[i].travelMode || CONFIG.DEFAULT_TRAVEL_MODE;

    try {
      // Fetch route from Google Directions API
      const routeData = await fetchRoute(origin, destination, mode);

      // Get color for this route based on mode
      const routeColor = CONFIG.ROUTE_COLORS[mode] || CONFIG.ROUTE_COLORS.transit;

      let polyline;

      // Draw polyline
      if (routeData.polyline && !routeData.fallback) {
        // Use Google's encoded polyline for curved route
        const coordinates = decodePolyline(routeData.polyline);
        if (coordinates) {
          polyline = L.polyline(coordinates, {
            color: routeColor,
            weight: CONFIG.ROUTE_WEIGHT,
            opacity: CONFIG.ROUTE_OPACITY,
            className: 'route-polyline',
            smoothFactor: 1.5
          }).addTo(map);

          // Add hover tooltip with route details
          polyline.bindTooltip(`
            <div class="route-tooltip">
              <div><strong>${getModeIcon(mode)} ${mode.charAt(0).toUpperCase() + mode.slice(1)}</strong></div>
              <div>Distance: ${routeData.distance}</div>
              <div>Duration: ${routeData.duration}</div>
            </div>
          `, {
            sticky: true,
            className: 'route-tooltip-popup'
          });

          routePolylines.push(polyline);
        }
      }

      // Calculate midpoint for badge placement
      const midLat = (origin.lat + destination.lat) / 2;
      const midLng = (origin.lng + destination.lng) / 2;

      // Create travel time badge
      const badgeClass = CONFIG.BADGE_PULSE_ANIMATION && (stops[i].highlight || stops[i + 1].highlight)
        ? 'travel-time-badge pulse'
        : 'travel-time-badge';

      const badgeIcon = L.divIcon({
        className: '',
        html: `
          <div class="${badgeClass}" data-mode="${mode}">
            <span class="badge-icon">${getModeIcon(mode)}</span>
            <span class="badge-duration">${routeData.duration}</span>
            <span class="badge-distance">${routeData.distance}</span>
          </div>
        `,
        iconSize: [120, 40],
        iconAnchor: [60, 20]
      });

      const badge = L.marker([midLat, midLng], {
        icon: badgeIcon,
        interactive: true
      }).addTo(map);

      // Make badge clickable to toggle between duration/distance on mobile
      badge.on('click', function(e) {
        const badgeEl = e.target.getElement().querySelector('.travel-time-badge');
        if (badgeEl) {
          badgeEl.classList.toggle('show-distance');
        }
      });

      routeBadges.push(badge);

    } catch (error) {
      console.error(`Error drawing route ${i} -> ${i + 1}:`, error);
    }
  }

  // Hide the fallback dashed line if we have API routes
  if (routePolylines.length > 0 && routeLine) {
    map.removeLayer(routeLine);
    routeLine = null;
  }
}

// Open Google Maps with directions to a specific location
function openGoogleMaps(lat, lng, name) {
  const url = `${CONFIG.MAPS_DEEP_LINK_BASE}&destination=${lat},${lng}&destination_place_id=&travelmode=transit`;
  window.open(url, '_blank');
}

// Utility
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Parse date from day object for weather integration
function parseDateFromDay(day) {
  // day.date format examples: "Mar 31", "Apr 1", "Mar 29-30"
  if (!day.date) return null;

  const year = 2026; // Trip year
  const datePart = day.date.split('-')[0].trim(); // Get first date if range

  // Parse month and day
  const parts = datePart.split(' ');
  if (parts.length !== 2) return null;

  const monthMap = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };

  const month = monthMap[parts[0]];
  const dayNum = parseInt(parts[1]);

  if (month === undefined || isNaN(dayNum)) return null;

  return new Date(year, month, dayNum);
}

// Hamburger menu toggle for mobile
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');
const header = document.getElementById('top-header');

if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    sidebar.classList.toggle('collapsed');
    sidebarToggle.classList.toggle('active');
  });

  // Close sidebar when clicking on map on mobile
  const mapContainer = document.querySelector('.map-container');
  if (mapContainer) {
    mapContainer.addEventListener('click', () => {
      if (window.innerWidth < 768 && !sidebar.classList.contains('collapsed')) {
        sidebar.classList.add('collapsed');
        sidebarToggle.classList.remove('active');
      }
    });
  }
}

// Sticky header scroll effect
let lastScrollY = 0;
const checkScroll = () => {
  const sidebarContent = document.querySelector('.sidebar-content');
  if (sidebarContent && sidebarContent.scrollTop > 10) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
};

const sidebarContent = document.querySelector('.sidebar-content');
if (sidebarContent) {
  sidebarContent.addEventListener('scroll', checkScroll, { passive: true });
}

// Resize handler for responsive layout changes
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile && sidebar) {
      // On desktop/tablet, ensure sidebar is visible
      sidebar.classList.remove('collapsed');
      if (sidebarToggle) {
        sidebarToggle.classList.remove('active');
      }
    }
    // Invalidate map size on resize
    if (map) {
      map.invalidateSize();
    }
  }, 250);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    if (currentDayIndex < TRIP_DATA.length - 1) {
      selectDay(currentDayIndex + 1);
      document.querySelectorAll('.day-tab')[currentDayIndex].scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (currentDayIndex > 0) {
      selectDay(currentDayIndex - 1);
      document.querySelectorAll('.day-tab')[currentDayIndex].scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  }
});

// Language switcher event listeners
document.querySelectorAll('.lang-switcher button').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const selectedLang = e.target.dataset.lang;
    I18N.setLang(selectedLang);

    // Update active button state
    document.querySelectorAll('.lang-switcher button').forEach(b => {
      b.classList.toggle('active', b === e.target);
    });

    // Re-render current day with new language
    selectDay(currentDayIndex);

    // Re-render template header if metadata exists
    if (TEMPLATE_METADATA) {
      renderTemplateHeader(TEMPLATE_METADATA);
    }
  });
});

// ==================== PHRASES MODULE ====================

// Global phrases data
let phrasesData = null;

// Fetch phrases on init
function loadPhrases() {
  fetch('phrases.json')
    .then(r => r.json())
    .then(d => {
      phrasesData = d;
      console.log('Phrases loaded successfully');
    })
    .catch(err => {
      console.error('Error loading phrases:', err);
    });
}

// Text-to-speech function
function speak(text, lang) {
  if (!window.speechSynthesis) {
    console.error('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // Slightly slower for clarity
  window.speechSynthesis.speak(utterance);
}

// Render phrases modal
function renderPhrases() {
  if (!phrasesData) {
    document.getElementById('phrases-list').innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">Loading phrases...</p>';
    return;
  }

  const container = document.getElementById('phrases-list');
  const currentLang = I18N.currentLang;

  let html = '';

  // Category metadata
  const categoryMeta = {
    general: { icon: '💬', label: { en: 'General', zh: '常用', ja: '一般' } },
    restaurant: { icon: '🍜', label: { en: 'Restaurant', zh: '餐厅', ja: 'レストラン' } },
    train: { icon: '🚄', label: { en: 'Train', zh: '交通', ja: '電車' } },
    temple: { icon: '⛩️', label: { en: 'Temple', zh: '寺庙', ja: '寺院' } },
    shopping: { icon: '🛍️', label: { en: 'Shopping', zh: '购物', ja: 'ショッピング' } },
    emergency: { icon: '🚨', label: { en: 'Emergency', zh: '紧急', ja: '緊急' } }
  };

  // Render each category
  Object.keys(phrasesData).forEach(category => {
    const meta = categoryMeta[category];
    const phrases = phrasesData[category];

    html += `
      <div class="phrase-category">
        <button class="phrase-category-header" onclick="togglePhraseCategory('${category}')">
          <span class="category-icon">${meta.icon}</span>
          <span class="category-label">${meta.label[currentLang] || meta.label.en}</span>
          <span class="category-count">${phrases.length}</span>
          <span class="category-chevron">▼</span>
        </button>
        <div class="phrase-category-content" id="phrases-${category}">
    `;

    phrases.forEach((phrase, index) => {
      const translatedText = currentLang === 'en' ? phrase.en : (currentLang === 'zh' ? phrase.zh : phrase.ja);

      html += `
        <div class="phrase-card" onclick="speak('${phrase.ja.replace(/'/g, "\\'")}', 'ja-JP')">
          <div class="phrase-main">
            <div class="phrase-japanese">${phrase.ja}</div>
            <div class="phrase-romaji">${phrase.romaji}</div>
          </div>
          <div class="phrase-translation">${translatedText}</div>
          <button class="phrase-speaker" aria-label="Speak">
            <span class="speaker-icon">🔊</span>
          </button>
        </div>
      `;
    });

    html += '</div></div>';
  });

  container.innerHTML = html;
}

// Toggle category collapse/expand
function togglePhraseCategory(category) {
  const content = document.getElementById(`phrases-${category}`);
  const header = content.previousElementSibling;

  if (content.style.display === 'none' || content.style.display === '') {
    content.style.display = 'block';
    header.classList.add('expanded');
  } else {
    content.style.display = 'none';
    header.classList.remove('expanded');
  }
}

// Phrases button event listener
const phrasesBtn = document.getElementById('phrases-btn');
if (phrasesBtn) {
  phrasesBtn.addEventListener('click', () => {
    renderPhrases();
    const modal = document.getElementById('phrases-modal');
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
  });
}

// Close modal event listeners
const closeModalBtns = document.querySelectorAll('.close-modal');
closeModalBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.modal');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = ''; // Restore scrolling
      window.speechSynthesis.cancel(); // Stop any ongoing speech
    }
  });
});

// Close modal on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('show');
    document.body.style.overflow = '';
    window.speechSynthesis.cancel();
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.querySelector('.modal.show');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
      window.speechSynthesis.cancel();
    }
  }
});

// ============================================================================
// PWA: Install Prompt Handler
// ============================================================================

let deferredInstallPrompt = null;
let installButton = null;

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('[PWA] Install prompt available');

  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();

  // Store the event for later use
  deferredInstallPrompt = e;

  // Show custom install button
  showInstallButton();
});

// Create and show install button
function showInstallButton() {
  // Check if button already exists
  if (installButton) return;

  // Create install button
  installButton = document.createElement('button');
  installButton.id = 'pwa-install-btn';
  installButton.className = 'pwa-install-btn';
  installButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
    <span>Install App</span>
  `;
  installButton.title = 'Install Trip Companion app';

  // Add click handler
  installButton.addEventListener('click', installApp);

  // Insert into header (after hamburger menu)
  const header = document.getElementById('top-header');
  const headerLeft = header.querySelector('.header-left');
  if (headerLeft) {
    headerLeft.insertAdjacentElement('afterend', installButton);
  }

  // Auto-hide after 30 seconds on desktop
  if (window.innerWidth >= 768) {
    setTimeout(() => {
      if (installButton && installButton.parentElement) {
        installButton.style.opacity = '0';
        installButton.style.pointerEvents = 'none';
      }
    }, 30000);
  }
}

// Install app handler
async function installApp() {
  if (!deferredInstallPrompt) {
    console.log('[PWA] No install prompt available');
    return;
  }

  // Show the install prompt
  deferredInstallPrompt.prompt();

  // Wait for the user's response
  const { outcome } = await deferredInstallPrompt.userChoice;
  console.log(`[PWA] User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);

  // Clear the prompt
  deferredInstallPrompt = null;

  // Hide the install button
  if (installButton) {
    installButton.remove();
    installButton = null;
  }
}

// Listen for app installed event
window.addEventListener('appinstalled', () => {
  console.log('[PWA] App installed successfully');

  // Hide install button if still visible
  if (installButton) {
    installButton.remove();
    installButton = null;
  }

  // Clear the deferred prompt
  deferredInstallPrompt = null;

  // Optional: Track installation
  if (typeof gtag !== 'undefined') {
    gtag('event', 'pwa_install', {
      event_category: 'engagement',
      event_label: 'PWA Installed'
    });
  }
});

// ============================================================================
// PWA: Offline Indicator
// ============================================================================

let offlineIndicator = null;

// Create offline indicator
function createOfflineIndicator() {
  if (offlineIndicator) return;

  offlineIndicator = document.createElement('div');
  offlineIndicator.id = 'offline-indicator';
  offlineIndicator.className = 'offline-indicator';
  offlineIndicator.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="1" y1="1" x2="23" y2="23"></line>
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
      <line x1="12" y1="20" x2="12.01" y2="20"></line>
    </svg>
    <span>Offline Mode</span>
  `;

  // Insert into header
  const header = document.getElementById('top-header');
  if (header) {
    header.appendChild(offlineIndicator);
  }
}

// Remove offline indicator
function removeOfflineIndicator() {
  if (offlineIndicator && offlineIndicator.parentElement) {
    offlineIndicator.classList.add('hiding');
    setTimeout(() => {
      if (offlineIndicator && offlineIndicator.parentElement) {
        offlineIndicator.remove();
        offlineIndicator = null;
      }
    }, 300);
  }
}

// Update online/offline status
function updateOnlineStatus() {
  if (navigator.onLine) {
    console.log('[PWA] Online');
    removeOfflineIndicator();
  } else {
    console.log('[PWA] Offline');
    createOfflineIndicator();
  }
}

// Listen for online/offline events
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Check initial status
updateOnlineStatus();

// ============================================================================
// PWA: Cache Management Helper (for manual tile caching)
// ============================================================================

// Allow users to manually cache tiles for the current view
window.cacheCurrentMapTiles = function() {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    console.log('[PWA] Service worker not active');
    return;
  }

  // Get current map bounds
  const bounds = map.getBounds();
  const zoom = map.getZoom();

  const boundsArray = [
    bounds.getSouth(),
    bounds.getNorth(),
    bounds.getWest(),
    bounds.getEast()
  ];

  // Send message to service worker to cache tiles
  navigator.serviceWorker.controller.postMessage({
    type: 'CACHE_TILES',
    bounds: boundsArray,
    zoom: Math.floor(zoom)
  });

  console.log(`[PWA] Caching tiles for current view (zoom ${Math.floor(zoom)})`);
};

console.log('[PWA] Features initialized');

// ==================== START APP ====================
// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
