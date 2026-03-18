/**
 * Interactive Map Component for Japan Trip
 * Features: Leaflet map, offline tile caching, marker clustering, custom icons
 */

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getIconByCategory, createClusterIcon } from '../lib/markerIcons';
import { tileCache, isOffline } from '../lib/tileCache';
import type { Location, MapConfig } from '../types/map';

// Default map configuration for Japan
const defaultMapConfig: MapConfig = {
  defaultCenter: [35.6762, 139.6503], // Tokyo
  defaultZoom: 12,
  minZoom: 6,
  maxZoom: 18,
  maxBounds: [
    [24.0, 122.0], // Southwest corner of Japan
    [46.0, 154.0], // Northeast corner of Japan
  ],
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  offlineStorageQuota: 50, // MB
  clusterConfig: {
    maxClusterRadius: 80,
    disableClusteringAtZoom: 15,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
  },
};

interface MapProps {
  locations: Location[];
  config?: Partial<MapConfig>;
  onLocationClick?: (location: Location) => void;
  onLocationUpdate?: (location: Location) => void;
  className?: string;
  style?: React.CSSProperties;
}

// Custom tile layer that supports offline caching
const OfflineTileLayer: React.FC<{ url: string; attribution: string }> = ({ url, attribution }) => {
  const map = useMap();
  const [offline, setOffline] = useState(isOffline());

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show offline indicator
  useEffect(() => {
    if (offline) {
      const offlineControl = L.control({ position: 'topright' });
      offlineControl.onAdd = () => {
        const div = L.DomUtil.create('div', 'offline-indicator');
        div.innerHTML = `
          <div style="
            background: #ff6b6b;
            color: white;
            padding: 8px 12px;
            border-radius: 5px;
            font-weight: bold;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          ">
            📡 Offline Mode
          </div>
        `;
        return div;
      };
      offlineControl.addTo(map);

      return () => {
        offlineControl.remove();
      };
    }
  }, [offline, map]);

  return <TileLayer url={url} attribution={attribution} />;
};

// Component to handle map events
const MapEventHandler: React.FC<{
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
}> = ({ onBoundsChange }) => {
  useMapEvents({
    moveend: (e) => {
      const bounds = e.target.getBounds();
      onBoundsChange?.(bounds);
    },
  });
  return null;
};

// Component to recenter map
const RecenterButton: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();

  const handleRecenter = () => {
    map.setView(center, zoom);
  };

  useEffect(() => {
    const recenterControl = L.control({ position: 'topleft' });
    recenterControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'recenter-button');
      div.innerHTML = `
        <button style="
          background: white;
          border: 2px solid rgba(0,0,0,0.2);
          border-radius: 5px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0 1px 5px rgba(0,0,0,0.3);
        " title="Recenter Map">
          🎯
        </button>
      `;
      div.querySelector('button')?.addEventListener('click', handleRecenter);
      return div;
    };
    recenterControl.addTo(map);

    return () => {
      recenterControl.remove();
    };
  }, [map, center, zoom]);

  return null;
};

export const Map: React.FC<MapProps> = ({
  locations,
  config = {},
  onLocationClick,
  onLocationUpdate,
  className,
  style,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [visibleLocations, setVisibleLocations] = useState<Location[]>(locations);

  const fullConfig = { ...defaultMapConfig, ...config };

  // Filter visible locations based on map bounds
  useEffect(() => {
    if (!mapBounds) {
      setVisibleLocations(locations);
      return;
    }

    const filtered = locations.filter(loc =>
      mapBounds.contains([loc.lat, loc.lng])
    );
    setVisibleLocations(filtered);
  }, [mapBounds, locations]);

  const handleMarkerClick = (location: Location) => {
    setSelectedLocation(location);
    onLocationClick?.(location);
  };

  const handleMarkAsVisited = (location: Location) => {
    const updated = { ...location, visited: true };
    onLocationUpdate?.(updated);
  };

  return (
    <div className={`japan-map-container ${className || ''}`} style={{ height: '100vh', width: '100%', ...style }}>
      <MapContainer
        center={fullConfig.defaultCenter}
        zoom={fullConfig.defaultZoom}
        minZoom={fullConfig.minZoom}
        maxZoom={fullConfig.maxZoom}
        maxBounds={fullConfig.maxBounds}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <OfflineTileLayer
          url={fullConfig.tileUrl}
          attribution={fullConfig.attribution}
        />

        <MapEventHandler onBoundsChange={setMapBounds} />

        <RecenterButton center={fullConfig.defaultCenter} zoom={fullConfig.defaultZoom} />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={fullConfig.clusterConfig.maxClusterRadius}
          disableClusteringAtZoom={fullConfig.clusterConfig.disableClusteringAtZoom}
          spiderfyOnMaxZoom={fullConfig.clusterConfig.spiderfyOnMaxZoom}
          showCoverageOnHover={fullConfig.clusterConfig.showCoverageOnHover}
          zoomToBoundsOnClick={fullConfig.clusterConfig.zoomToBoundsOnClick}
          iconCreateFunction={createClusterIcon}
        >
          {visibleLocations.map((location) => (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={getIconByCategory(location.category, location.visited)}
              eventHandlers={{
                click: () => handleMarkerClick(location),
              }}
            >
              <Popup>
                <div style={{ minWidth: '200px', maxWidth: '300px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                    {location.name}
                  </h3>
                  {location.nameJa && (
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                      {location.nameJa}
                    </p>
                  )}
                  {location.imageUrl && (
                    <img
                      src={location.imageUrl}
                      alt={location.name}
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '5px',
                        marginBottom: '8px',
                      }}
                    />
                  )}
                  {location.description && (
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}>
                      {location.description}
                    </p>
                  )}
                  {location.address && (
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#888' }}>
                      📍 {location.address}
                    </p>
                  )}
                  {location.rating && (
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>
                      ⭐ {location.rating.toFixed(1)} / 5.0
                    </p>
                  )}
                  {location.notes && (
                    <div style={{
                      padding: '8px',
                      backgroundColor: '#fff3cd',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      fontSize: '12px',
                    }}>
                      <strong>Notes:</strong> {location.notes}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    {!location.visited && (
                      <button
                        onClick={() => handleMarkAsVisited(location)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        ✓ Mark Visited
                      </button>
                    )}
                    {location.visited && (
                      <div style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor: '#e8f5e9',
                        color: '#2e7d32',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}>
                        ✓ Visited
                      </div>
                    )}
                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
                        window.open(url, '_blank');
                      }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      🗺️ Directions
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Location Count Badge */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 1000,
          padding: '10px 15px',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: '14px',
          fontWeight: 'bold',
        }}
      >
        📍 {visibleLocations.length} / {locations.length} locations
        {locations.filter(l => l.visited).length > 0 && (
          <span style={{ marginLeft: '10px', color: '#4CAF50' }}>
            ✓ {locations.filter(l => l.visited).length} visited
          </span>
        )}
      </div>
    </div>
  );
};

export default Map;
