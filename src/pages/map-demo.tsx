/**
 * Map Demo Page
 * Demonstrates the interactive map with offline capabilities and custom markers
 */

import React, { useState, useEffect } from 'react';
import Map from '../components/Map';
import { TileDownloader } from '../components/TileDownloader';
import { sampleLocations } from '../data/sample-locations';
import type { Location } from '../types/map';

const MapDemo: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>(sampleLocations);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showVisitedOnly, setShowVisitedOnly] = useState(false);

  // Load saved locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('japan-trip-locations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocations(parsed);
      } catch (err) {
        console.error('Failed to load saved locations:', err);
      }
    }
  }, []);

  // Save locations to localStorage when they change
  useEffect(() => {
    localStorage.setItem('japan-trip-locations', JSON.stringify(locations));
  }, [locations]);

  const handleLocationUpdate = (updatedLocation: Location) => {
    setLocations(prev =>
      prev.map(loc => (loc.id === updatedLocation.id ? updatedLocation : loc))
    );
  };

  // Filter locations
  const filteredLocations = locations.filter(loc => {
    if (showVisitedOnly && !loc.visited) return false;
    if (filterCategory !== 'all' && loc.category !== filterCategory) return false;
    return true;
  });

  const categories = [
    { value: 'all', label: 'All', emoji: '🗺️' },
    { value: 'restaurant', label: 'Restaurants', emoji: '🍜' },
    { value: 'temple', label: 'Temples', emoji: '⛩️' },
    { value: 'sakura', label: 'Sakura', emoji: '🌸' },
    { value: 'hotel', label: 'Hotels', emoji: '🏨' },
    { value: 'attraction', label: 'Attractions', emoji: '🗼' },
    { value: 'station', label: 'Stations', emoji: '🚇' },
  ];

  const stats = {
    total: locations.length,
    visited: locations.filter(l => l.visited).length,
    restaurants: locations.filter(l => l.category === 'restaurant').length,
    temples: locations.filter(l => l.category === 'temple').length,
    sakura: locations.filter(l => l.category === 'sakura').length,
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      {/* Header */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '15px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
            🗾 Japan Trip Map
          </h1>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>

            {/* Visited Filter */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showVisitedOnly}
                onChange={(e) => setShowVisitedOnly(e.target.checked)}
              />
              <span>Visited Only</span>
            </label>
          </div>
        </div>

        {/* Stats Bar */}
        <div
          style={{
            marginTop: '10px',
            display: 'flex',
            gap: '15px',
            fontSize: '14px',
            color: '#666',
            flexWrap: 'wrap',
          }}
        >
          <span>📍 Total: {stats.total}</span>
          <span style={{ color: '#4CAF50' }}>✓ Visited: {stats.visited}</span>
          <span>🍜 Restaurants: {stats.restaurants}</span>
          <span>⛩️ Temples: {stats.temples}</span>
          <span>🌸 Sakura: {stats.sakura}</span>
        </div>
      </div>

      {/* Map Container */}
      <div style={{ paddingTop: '110px', height: '100%' }}>
        <Map
          locations={filteredLocations}
          onLocationUpdate={handleLocationUpdate}
          config={{
            defaultCenter: [35.6762, 139.6503], // Tokyo
            defaultZoom: 11,
          }}
        />
      </div>

      {/* Tile Downloader */}
      <TileDownloader />

      {/* Instructions Overlay */}
      <div
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '10px',
          zIndex: 999,
          maxWidth: '300px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          padding: '15px',
        }}
      >
        <h3 style={{ marginTop: 0, fontSize: '16px' }}>Quick Guide</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
          <li>Click markers to see details</li>
          <li>Zoom 15+ to see individual markers</li>
          <li>Use 📥 button to download offline maps</li>
          <li>Mark locations as visited</li>
          <li>Get directions to any location</li>
        </ul>
      </div>

      {/* CSS for responsive design */}
      <style>{`
        @media (max-width: 768px) {
          .leaflet-control-zoom {
            margin-top: 60px !important;
          }
        }

        .leaflet-popup-content {
          margin: 13px 13px;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }

        .marker-cluster-small,
        .marker-cluster-medium,
        .marker-cluster-large {
          background-color: rgba(110, 204, 57, 0.6);
        }

        .marker-cluster-small div,
        .marker-cluster-medium div,
        .marker-cluster-large div {
          background-color: rgba(110, 204, 57, 1);
        }
      `}</style>
    </div>
  );
};

export default MapDemo;
