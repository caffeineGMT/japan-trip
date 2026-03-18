/**
 * SyncIndicator Component
 * Shows online/offline status and last sync time
 * Displays IndexedDB sync status for offline-first PWA
 */

import React, { useState, useEffect } from 'react';
import { getDatabaseInfo } from '../lib/db.js';

const SyncIndicator = ({ className = '', showDetails = false }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(null);
  const [dbStats, setDbStats] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load database stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getDatabaseInfo();
        setDbStats(stats);
      } catch (error) {
        console.error('Error loading database stats:', error);
      }
    };

    loadStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update last sync time
  useEffect(() => {
    const updateLastSync = () => {
      const now = new Date();
      setLastSync(now);
      localStorage.setItem('lastSyncTime', now.toISOString());
    };

    // Load last sync from localStorage
    const savedSync = localStorage.getItem('lastSyncTime');
    if (savedSync) {
      setLastSync(new Date(savedSync));
    } else {
      updateLastSync();
    }

    // Update sync time when online status changes or data changes
    if (isOnline) {
      updateLastSync();
    }
  }, [isOnline, dbStats]);

  const formatLastSync = () => {
    if (!lastSync) return 'Never';

    const now = new Date();
    const diffMs = now - lastSync;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getStatusColor = () => {
    if (isOnline) {
      return '#10b981'; // green
    }
    return '#f59e0b'; // amber
  };

  const getStatusText = () => {
    if (isOnline) {
      return 'Online';
    }
    return 'Offline';
  };

  const getStatusIcon = () => {
    if (isOnline) {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
        </svg>
      );
    }
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" fill="currentColor"/>
      </svg>
    );
  };

  return (
    <div className={`sync-indicator ${className}`}>
      <div
        className="sync-badge"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ borderColor: getStatusColor() }}
      >
        <span className="status-icon" style={{ color: getStatusColor() }}>
          {getStatusIcon()}
        </span>
        <span className="status-text" style={{ color: getStatusColor() }}>
          {getStatusText()}
        </span>
        {showDetails && (
          <span className="last-sync">
            • {formatLastSync()}
          </span>
        )}
      </div>

      {showTooltip && (
        <div className="sync-tooltip">
          <div className="tooltip-row">
            <strong>Status:</strong> {getStatusText()}
          </div>
          <div className="tooltip-row">
            <strong>Last Sync:</strong> {formatLastSync()}
          </div>
          {dbStats && (
            <>
              <div className="tooltip-divider"></div>
              <div className="tooltip-row">
                <strong>Cached Data:</strong>
              </div>
              <div className="tooltip-row stats">
                • {dbStats.trips} trips
              </div>
              <div className="tooltip-row stats">
                • {dbStats.savedPlaces} saved places
              </div>
              <div className="tooltip-row stats">
                • {dbStats.forecastData} forecasts
              </div>
              <div className="tooltip-row stats">
                • {dbStats.mapTiles} map tiles
              </div>
            </>
          )}
          <div className="tooltip-divider"></div>
          <div className="tooltip-note">
            {isOnline
              ? 'All changes are synced'
              : 'Changes saved locally, will sync when online'}
          </div>
        </div>
      )}

      <style jsx>{`
        .sync-indicator {
          position: relative;
          display: inline-block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          user-select: none;
        }

        .sync-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: white;
          border: 1.5px solid;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .sync-badge:hover {
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        .status-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-text {
          font-weight: 600;
        }

        .last-sync {
          color: #6b7280;
          font-size: 12px;
          font-weight: 400;
        }

        .sync-tooltip {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: #1f2937;
          color: white;
          padding: 12px;
          border-radius: 8px;
          font-size: 12px;
          min-width: 220px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        .sync-tooltip::before {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-bottom-color: #1f2937;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .tooltip-row {
          padding: 4px 0;
          line-height: 1.4;
        }

        .tooltip-row.stats {
          padding-left: 12px;
          font-size: 11px;
          color: #d1d5db;
        }

        .tooltip-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.2);
          margin: 8px 0;
        }

        .tooltip-note {
          margin-top: 4px;
          font-size: 11px;
          color: #9ca3af;
          font-style: italic;
        }

        strong {
          font-weight: 600;
          margin-right: 4px;
        }

        @media (max-width: 640px) {
          .sync-badge {
            padding: 4px 10px;
            font-size: 12px;
          }

          .last-sync {
            display: none;
          }

          .sync-tooltip {
            left: auto;
            right: 0;
            transform: none;
            min-width: 200px;
          }

          .sync-tooltip::before {
            left: auto;
            right: 20px;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default SyncIndicator;
