// Initialize map
const map = L.map('map', {
  zoomControl: true,
  attributionControl: true
}).setView([35.6762, 139.6503], 12);

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
    <h2>${day.theme}</h2>
    <div class="day-meta">${day.city} &middot; ${day.date}</div>
  `;

  if (day.hotel) {
    headerHtml += `<div class="hotel-badge">&#127976; ${day.hotel}</div>`;
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
          <h4>${stop.name}</h4>
          <div class="stop-desc">${stop.desc}</div>
          <span class="stop-category ${stop.category}">${getCategoryLabel(stop.category)}</span>
        </div>
      </div>
    `;
  });

  // Checklist
  if (day.checklist) {
    contentHtml += '<div class="checklist-section"><h3>Checklist</h3>';
    day.checklist.forEach((item, i) => {
      contentHtml += `
        <div class="checklist-item" id="check-${i}">
          <input type="checkbox" onchange="toggleCheck(${i})" />
          <span>${item}</span>
        </div>
      `;
    });
    contentHtml += '</div>';
  }

  // Dinner note
  if (day.dinner) {
    contentHtml += `<div class="note-block"><strong>Dinner:</strong> ${day.dinner}</div>`;
  }

  // Note
  if (day.note) {
    contentHtml += `<div class="note-block">${day.note}</div>`;
  }

  // Extras
  if (day.extras) {
    contentHtml += '<div class="extras-block"><h3>Also Consider</h3><ul>';
    day.extras.forEach(e => {
      contentHtml += `<li>${e}</li>`;
    });
    contentHtml += '</ul></div>';
  }

  content.innerHTML = contentHtml;
  content.scrollTop = 0;
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
    const popupContent = `
      <h4>${stop.name}</h4>
      <div class="popup-time">${stop.time}</div>
      <div class="popup-desc">${stop.desc}</div>
      <button class="directions-button" onclick="openGoogleMaps(${stop.lat}, ${stop.lng}, '${stop.name.replace(/'/g, "\\'")}')">
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

// Init
buildTabs();
selectDay(0);

// Initialize weather cache for all cities
if (typeof initializeWeather === 'function') {
  initializeWeather().catch(err => {
    console.error('Weather initialization error:', err);
  });
}
