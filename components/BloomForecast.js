/**
 * Cherry Blossom Bloom Forecast Map Component
 * Displays color-coded markers for bloom status across 50 cities
 */

import React, { useEffect, useState } from 'react';
import bloomCache from '../lib/bloomCache';

// Bloom status color scheme
const STATUS_COLORS = {
  'pre-bloom': '#9CA3AF',    // Gray
  'early-bloom': '#FBB6CE',  // Light pink
  'peak': '#DC2626',         // Red
  'post-peak': '#92400E'     // Brown
};

const STATUS_LABELS = {
  'pre-bloom': 'Pre-bloom',
  'early-bloom': 'Early Bloom',
  'peak': 'Peak Bloom',
  'post-peak': 'Post-peak'
};

/**
 * Main BloomForecast component
 */
export default function BloomForecast({ map, cities, year }) {
  const [forecasts, setForecasts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    loadForecasts();
  }, [cities, year]);

  useEffect(() => {
    if (map && Object.keys(forecasts).length > 0) {
      renderMarkers();
    }
  }, [map, forecasts]);

  /**
   * Load forecasts for all cities
   */
  const loadForecasts = async () => {
    setLoading(true);

    try {
      const currentYear = year || new Date().getFullYear();
      const cityNames = cities.map(c => c.name);

      // Use cache to fetch forecasts
      const results = await bloomCache.prefetch(cityNames, currentYear);

      // Convert to map
      const forecastMap = {};
      results.forEach((forecast, index) => {
        if (forecast) {
          forecastMap[cityNames[index]] = forecast;
        }
      });

      setForecasts(forecastMap);
    } catch (error) {
      console.error('Failed to load forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render markers on map
   */
  const renderMarkers = () => {
    // Clear existing markers
    markers.forEach(marker => marker.remove());

    const newMarkers = [];

    cities.forEach(city => {
      const forecast = forecasts[city.name];
      if (!forecast) return;

      // Create marker with color based on status
      const color = STATUS_COLORS[forecast.status] || STATUS_COLORS['pre-bloom'];

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'bloom-marker';
      el.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: ${color};
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s;
      `;

      // Hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Click to show popup
      el.addEventListener('click', () => {
        showForecastPopup(city, forecast);
      });

      // Add marker to map (assuming Leaflet)
      const marker = L.marker([city.lat, city.lon], {
        icon: L.divIcon({
          className: 'bloom-marker-wrapper',
          html: el.outerHTML,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map);

      // Bind popup
      marker.bindPopup(createPopupContent(city, forecast), {
        maxWidth: 300,
        className: 'bloom-forecast-popup'
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  };

  /**
   * Create popup content HTML
   */
  const createPopupContent = (city, forecast) => {
    const statusLabel = STATUS_LABELS[forecast.status] || forecast.status;
    const confidence = Math.round(forecast.confidence * 100);

    return `
      <div class="bloom-forecast-popup-content">
        <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #1F2937;">
          ${city.name}
        </h3>

        <div style="margin-bottom: 12px;">
          <div style="display: inline-block; padding: 4px 12px; background: ${STATUS_COLORS[forecast.status]}; color: white; border-radius: 12px; font-size: 12px; font-weight: 600;">
            ${statusLabel}
          </div>
        </div>

        <div style="font-size: 14px; color: #4B5563; line-height: 1.6;">
          <p style="margin: 8px 0;">
            <strong>Predicted Bloom:</strong> ${formatDate(forecast.predictedBloomDate)}
          </p>
          <p style="margin: 8px 0;">
            <strong>Peak Week:</strong> Week ${forecast.peakWeek}
          </p>
          <p style="margin: 8px 0;">
            <strong>Confidence:</strong> ${confidence}%
          </p>
          <p style="margin: 8px 0; font-size: 12px; color: #6B7280;">
            Historical range: Days ${forecast.historicalRange[0]}-${forecast.historicalRange[1]}
          </p>
        </div>

        ${forecast.tempAccumulation ? `
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #6B7280;">
            Temp accumulation: ${Math.round(forecast.tempAccumulation)}°C-days
          </div>
        ` : ''}
      </div>
    `;
  };

  /**
   * Show forecast popup
   */
  const showForecastPopup = (city, forecast) => {
    setSelectedCity({ city, forecast });
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <div className="bloom-forecast-loading" style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontSize: '14px',
        color: '#4B5563',
        zIndex: 1000
      }}>
        Loading bloom forecasts...
      </div>
    );
  }

  /**
   * Render legend
   */
  return (
    <div className="bloom-forecast-legend" style={{
      position: 'absolute',
      bottom: '80px',
      right: '20px',
      background: 'white',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 1000,
      minWidth: '200px'
    }}>
      <h4 style={{
        margin: '0 0 12px 0',
        fontSize: '14px',
        fontWeight: '600',
        color: '#1F2937'
      }}>
        Bloom Status
      </h4>

      <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <div key={status} style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: STATUS_COLORS[status],
              border: '2px solid white',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
              marginRight: '8px'
            }} />
            <span style={{ color: '#4B5563' }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #E5E7EB',
        fontSize: '11px',
        color: '#6B7280'
      }}>
        Updated: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}

// Vanilla JS version for non-React usage
export function initBloomForecastLayer(map, cities, year) {
  const currentYear = year || new Date().getFullYear();
  const markers = [];

  // Load forecasts
  bloomCache.prefetch(cities.map(c => c.name), currentYear)
    .then(forecasts => {
      // Create markers for each city
      forecasts.forEach((forecast, index) => {
        if (!forecast) return;

        const city = cities[index];
        const color = STATUS_COLORS[forecast.status] || STATUS_COLORS['pre-bloom'];

        // Create marker
        const marker = L.circleMarker([city.lat, city.lon], {
          radius: 8,
          fillColor: color,
          fillOpacity: 0.9,
          color: 'white',
          weight: 2
        }).addTo(map);

        // Create popup
        const popupContent = createPopupHTML(city, forecast);
        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'bloom-forecast-popup'
        });

        markers.push(marker);
      });

      // Add legend
      addLegend(map);
    })
    .catch(error => {
      console.error('Failed to load bloom forecasts:', error);
    });

  return markers;
}

function createPopupHTML(city, forecast) {
  const statusLabel = STATUS_LABELS[forecast.status] || forecast.status;
  const confidence = Math.round(forecast.confidence * 100);
  const date = new Date(forecast.predictedBloomDate);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif;">
      <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #1F2937;">
        ${city.name}
      </h3>
      <div style="margin-bottom: 12px;">
        <span style="display: inline-block; padding: 4px 12px; background: ${STATUS_COLORS[forecast.status]}; color: white; border-radius: 12px; font-size: 12px; font-weight: 600;">
          ${statusLabel}
        </span>
      </div>
      <div style="font-size: 14px; color: #4B5563;">
        <p style="margin: 8px 0;"><strong>Predicted Bloom:</strong> ${formattedDate}</p>
        <p style="margin: 8px 0;"><strong>Peak Week:</strong> Week ${forecast.peakWeek}</p>
        <p style="margin: 8px 0;"><strong>Confidence:</strong> ${confidence}%</p>
      </div>
    </div>
  `;
}

function addLegend(map) {
  const legend = L.control({ position: 'bottomright' });

  legend.onAdd = function() {
    const div = L.DomUtil.create('div', 'bloom-forecast-legend');
    div.style.cssText = `
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      font-family: system-ui, -apple-system, sans-serif;
    `;

    let html = '<h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">Bloom Status</h4>';

    Object.entries(STATUS_LABELS).forEach(([status, label]) => {
      html += `
        <div style="display: flex; align-items: center; margin-bottom: 6px; font-size: 12px;">
          <div style="width: 16px; height: 16px; border-radius: 50%; background: ${STATUS_COLORS[status]}; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2); margin-right: 8px;"></div>
          <span>${label}</span>
        </div>
      `;
    });

    div.innerHTML = html;
    return div;
  };

  legend.addTo(map);
}
