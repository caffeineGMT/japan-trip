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

  header.innerHTML = headerHtml;

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
function renderMap(day) {
  // Clear existing
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  if (routeLine) {
    map.removeLayer(routeLine);
    routeLine = null;
  }

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

    const marker = L.marker([stop.lat, stop.lng], { icon })
      .addTo(map)
      .bindPopup(`
        <h4>${stop.name}</h4>
        <div class="popup-time">${stop.time}</div>
        <div class="popup-desc">${stop.desc}</div>
      `, { maxWidth: 280 });

    marker.on('click', () => {
      highlightStopCard(i);
    });

    markers.push(marker);
    latlngs.push([stop.lat, stop.lng]);
  });

  // Draw route line
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

// Utility
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
