/**
 * Visual Trip Builder - Main Application
 * Initializes and coordinates all components
 */

(function() {
  'use strict';

  // Global state
  let builder;
  let exporter;
  let i18nEditor;
  let geocoder;
  let previewMap;
  let currentDayId = null; // For add stop modal

  // Initialize app
  function init() {
    // Initialize core components
    builder = new TripBuilder();
    exporter = new TripExporter(builder);
    i18nEditor = new I18nEditor();
    geocoder = new Geocoder();

    // Initialize map
    initMap();

    // Set up event listeners
    setupEventListeners();

    // Subscribe to builder changes
    builder.subscribe(handleStateChange);

    // Initial render
    render();

    // Check for import from URL
    checkUrlImport();

    console.log('Trip Builder initialized');
  }

  /**
   * Initialize Leaflet preview map
   */
  function initMap() {
    previewMap = L.map('preview-map').setView([35.6762, 139.6503], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(previewMap);

    // Fix map size after initialization
    setTimeout(() => {
      previewMap.invalidateSize();
    }, 100);
  }

  /**
   * Set up all event listeners
   */
  function setupEventListeners() {
    // Trip metadata
    document.getElementById('trip-title').addEventListener('input', (e) => {
      builder.updateMetadata({ title: e.target.value });
    });

    document.getElementById('destination').addEventListener('input', debounce((e) => {
      handleDestinationSearch(e.target.value);
    }, 500));

    document.getElementById('start-date').addEventListener('change', (e) => {
      builder.updateMetadata({ startDate: e.target.value });
    });

    document.getElementById('end-date').addEventListener('change', (e) => {
      builder.updateMetadata({ endDate: e.target.value });
    });

    // Add day button
    document.getElementById('add-day-btn').addEventListener('click', () => {
      builder.addDay();
    });

    // Import/Export
    document.getElementById('import-btn').addEventListener('click', handleImportClick);
    document.getElementById('export-btn').addEventListener('click', handleExport);
    document.getElementById('import-file-input').addEventListener('change', handleFileImport);

    // Add stop modal
    document.getElementById('cancel-add-stop').addEventListener('click', closeAddStopModal);
    document.getElementById('manual-add-stop').addEventListener('click', handleManualAddStop);
    document.getElementById('stop-search-input').addEventListener('input', debounce((e) => {
      handleStopSearch(e.target.value);
    }, 500));

    // Day editor events (delegated)
    document.addEventListener('day-update', (e) => {
      builder.updateDay(e.detail.dayId, e.detail.updates);
    });

    document.addEventListener('day-delete', (e) => {
      builder.deleteDay(e.detail.dayId);
    });

    document.addEventListener('stop-add-request', (e) => {
      openAddStopModal(e.detail.dayId);
    });

    document.addEventListener('stop-update', (e) => {
      builder.updateStop(e.detail.dayId, e.detail.stopId, e.detail.updates);
    });

    document.addEventListener('stop-delete', (e) => {
      builder.deleteStop(e.detail.dayId, e.detail.stopId);
    });

    document.addEventListener('stops-reorder', (e) => {
      builder.reorderStops(e.detail.dayId, e.detail.stopIds);
    });

    document.addEventListener('geocode-request', async (e) => {
      await handleGeocodeRequest(e.detail.dayId, e.detail.stopId);
    });
  }

  /**
   * Handle state changes from builder
   */
  function handleStateChange(event, state) {
    switch (event.type) {
      case 'day-added':
      case 'day-updated':
      case 'day-deleted':
      case 'stop-added':
      case 'stop-updated':
      case 'stop-deleted':
      case 'stops-reordered':
      case 'trip-imported':
        render();
        updateMap();
        break;

      case 'autosave':
        showAutosaveIndicator();
        break;
    }
  }

  /**
   * Render the entire UI
   */
  function render() {
    const container = document.getElementById('days-container');

    if (builder.state.days.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
          </svg>
          <h3>Start Planning Your Trip</h3>
          <p>Click "Add Day" to create your first day</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';

    builder.state.days.forEach((day, index) => {
      const dayEditor = document.createElement('day-editor');
      dayEditor.setAttribute('day-index', index);
      dayEditor.setDayData(day);
      container.appendChild(dayEditor);
    });
  }

  /**
   * Update preview map with all stops
   */
  function updateMap() {
    // Clear existing markers and polylines
    previewMap.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        previewMap.removeLayer(layer);
      }
    });

    const allMarkers = [];
    const allCoords = [];

    builder.state.days.forEach((day) => {
      const dayCoords = [];

      day.stops.forEach((stop) => {
        if (stop.lat && stop.lng) {
          // Add marker
          const marker = L.marker([stop.lat, stop.lng], {
            title: stop.name.en
          }).addTo(previewMap);

          marker.bindPopup(`
            <strong>${stop.name.en}</strong><br>
            ${stop.time ? `<em>${stop.time}</em><br>` : ''}
            ${stop.desc.en ? `<small>${stop.desc.en}</small>` : ''}
          `);

          allMarkers.push(marker);
          dayCoords.push([stop.lat, stop.lng]);
          allCoords.push([stop.lat, stop.lng]);
        }
      });

      // Draw polyline connecting stops in this day
      if (dayCoords.length > 1) {
        L.polyline(dayCoords, {
          color: day.color,
          weight: 3,
          opacity: 0.7
        }).addTo(previewMap);
      }
    });

    // Fit bounds to show all markers
    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      previewMap.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  /**
   * Handle destination search autocomplete
   */
  async function handleDestinationSearch(query) {
    if (!query || query.length < 3) {
      document.getElementById('destination-autocomplete').style.display = 'none';
      return;
    }

    try {
      const results = await geocoder.autocomplete(query);

      const dropdown = document.getElementById('destination-autocomplete');

      if (results.length === 0) {
        dropdown.style.display = 'none';
        return;
      }

      dropdown.innerHTML = results.slice(0, 5).map(result => `
        <div class="autocomplete-item" data-name="${result.name}">
          ${result.name}
          <div style="font-size: 12px; color: #718096;">${result.display_name}</div>
        </div>
      `).join('');

      dropdown.style.display = 'block';

      // Add click handlers
      dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
          document.getElementById('destination').value = item.dataset.name;
          builder.updateMetadata({ destination: item.dataset.name });
          dropdown.style.display = 'none';
        });
      });
    } catch (error) {
      console.error('Destination search failed:', error);
    }
  }

  /**
   * Open add stop modal
   */
  function openAddStopModal(dayId) {
    currentDayId = dayId;
    document.getElementById('add-stop-modal').style.display = 'flex';
    document.getElementById('stop-search-input').value = '';
    document.getElementById('stop-search-results').innerHTML = '';
    document.getElementById('stop-search-input').focus();
  }

  /**
   * Close add stop modal
   */
  function closeAddStopModal() {
    document.getElementById('add-stop-modal').style.display = 'none';
    currentDayId = null;
  }

  /**
   * Handle stop search
   */
  async function handleStopSearch(query) {
    if (!query || query.length < 3) {
      document.getElementById('stop-search-results').innerHTML = '';
      return;
    }

    try {
      const results = await geocoder.geocode(query, { countryCode: 'jp' });

      const container = document.getElementById('stop-search-results');

      if (results.length === 0) {
        container.innerHTML = '<p style="padding: 12px; text-align: center; color: #718096;">No results found</p>';
        return;
      }

      container.innerHTML = results.slice(0, 5).map(result => `
        <div class="search-result-item" data-result='${JSON.stringify({
          name: result.name,
          lat: result.lat,
          lng: result.lng,
          display_name: result.display_name
        })}'>
          <div class="search-result-name">${result.name}</div>
          <div class="search-result-address">${result.display_name}</div>
        </div>
      `).join('');

      // Add click handlers
      container.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const data = JSON.parse(item.dataset.result);
          addStopFromSearch(data);
        });
      });
    } catch (error) {
      console.error('Stop search failed:', error);
      document.getElementById('stop-search-results').innerHTML =
        '<p style="padding: 12px; text-align: center; color: #e53e3e;">Search failed. Please try again.</p>';
    }
  }

  /**
   * Add stop from search result
   */
  async function addStopFromSearch(data) {
    await builder.addStop(currentDayId, {
      name: { en: data.name, zh: '', ja: '' },
      desc: { en: data.display_name, zh: '', ja: '' },
      lat: data.lat,
      lng: data.lng,
      time: '',
      icon: 'attraction',
      category: 'activity'
    });

    closeAddStopModal();
  }

  /**
   * Add stop manually (without geocoding)
   */
  async function handleManualAddStop() {
    await builder.addStop(currentDayId, {
      name: { en: 'New Stop', zh: '', ja: '' },
      desc: { en: '', zh: '', ja: '' },
      lat: null,
      lng: null,
      time: '',
      icon: 'attraction',
      category: 'activity'
    });

    closeAddStopModal();
  }

  /**
   * Handle geocode request for existing stop
   */
  async function handleGeocodeRequest(dayId, stopId) {
    const day = builder.state.days.find(d => d.id === dayId);
    if (!day) return;

    const stop = day.stops.find(s => s.id === stopId);
    if (!stop) return;

    const query = stop.name.en || 'Tokyo';

    try {
      const results = await geocoder.geocode(query, { countryCode: 'jp' });

      if (results && results.length > 0) {
        const best = results[0];
        builder.updateStop(dayId, stopId, {
          lat: best.lat,
          lng: best.lng
        });

        alert(`Location found: ${best.display_name}`);
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
      alert('Geocoding failed. Please try again.');
    }
  }

  /**
   * Handle import button click
   */
  function handleImportClick() {
    document.getElementById('import-file-input').click();
  }

  /**
   * Handle file import
   */
  async function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const result = await exporter.importFromFile(file);

    if (result.success) {
      alert('Trip imported successfully!');
    } else {
      alert('Import failed:\n\n' + result.errors.join('\n'));
    }

    // Reset file input
    event.target.value = '';
  }

  /**
   * Handle export
   */
  function handleExport() {
    const result = exporter.exportAsFile();

    if (result.success) {
      showAutosaveIndicator('Exported successfully');
    } else {
      alert('Export failed:\n\n' + result.errors.join('\n'));
    }
  }

  /**
   * Check URL for import parameter
   */
  function checkUrlImport() {
    const params = new URLSearchParams(window.location.search);
    const importData = params.get('import');

    if (importData) {
      const result = exporter.importFromLink(importData);

      if (result.success) {
        alert('Trip loaded from link!');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        alert('Failed to load trip from link:\n\n' + result.errors.join('\n'));
      }
    }
  }

  /**
   * Show autosave indicator
   */
  function showAutosaveIndicator(message = 'Saved') {
    const indicator = document.getElementById('autosave-indicator');
    indicator.textContent = message;
    indicator.classList.add('visible');

    setTimeout(() => {
      indicator.classList.remove('visible');
    }, 2000);
  }

  /**
   * Debounce helper
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
