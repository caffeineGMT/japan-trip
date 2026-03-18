/**
 * Tile Downloader Component
 * UI for selecting regions and downloading offline map tiles
 */

import React, { useState, useEffect } from 'react';
import { tileCache } from '../lib/tileCache';
import type { BoundingBox, DownloadProgress, StorageQuota } from '../types/map';

interface TileDownloaderProps {
  onRegionSelect?: (bounds: BoundingBox) => void;
  className?: string;
}

const JAPAN_REGIONS = [
  { name: 'Tokyo', bounds: { north: 35.82, south: 35.53, east: 139.95, west: 139.65 } },
  { name: 'Kyoto', bounds: { north: 35.10, south: 34.93, east: 135.85, west: 135.68 } },
  { name: 'Osaka', bounds: { north: 34.75, south: 34.61, east: 135.58, west: 135.43 } },
  { name: 'Hiroshima', bounds: { north: 34.43, south: 34.35, east: 132.50, west: 132.42 } },
  { name: 'Nara', bounds: { north: 34.71, south: 34.66, east: 135.85, west: 135.78 } },
  { name: 'Hakone', bounds: { north: 35.27, south: 35.18, east: 139.08, west: 138.98 } },
];

const ZOOM_PRESETS = [
  { name: 'City View (13-15)', levels: [13, 14, 15] },
  { name: 'Street View (15-16)', levels: [15, 16] },
  { name: 'Detailed (13-16)', levels: [13, 14, 15, 16] },
  { name: 'Custom', levels: [] },
];

export const TileDownloader: React.FC<TileDownloaderProps> = ({ onRegionSelect, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [customBounds, setCustomBounds] = useState<BoundingBox>({
    north: 35.82,
    south: 35.53,
    east: 139.95,
    west: 139.65,
  });
  const [selectedZoomPreset, setSelectedZoomPreset] = useState(0);
  const [customZoomLevels, setCustomZoomLevels] = useState<number[]>([]);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [storage, setStorage] = useState<StorageQuota | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    updateStorageInfo();
  }, []);

  const updateStorageInfo = async () => {
    try {
      const quota = await tileCache.getStorageUsage();
      setStorage(quota);
    } catch (err) {
      console.error('Failed to get storage info:', err);
    }
  };

  const handleDownload = async () => {
    setError('');

    // Get bounds
    const bounds = selectedRegion
      ? JAPAN_REGIONS.find(r => r.name === selectedRegion)?.bounds
      : customBounds;

    if (!bounds) {
      setError('Please select a region or enter custom bounds');
      return;
    }

    // Get zoom levels
    let zoomLevels = ZOOM_PRESETS[selectedZoomPreset].levels;
    if (selectedZoomPreset === ZOOM_PRESETS.length - 1) {
      // Custom zoom levels
      zoomLevels = customZoomLevels;
    }

    if (zoomLevels.length === 0) {
      setError('Please select zoom levels');
      return;
    }

    // Check storage before download
    const quota = await tileCache.getStorageUsage();
    if (quota.percentUsed > 80) {
      const confirm = window.confirm(
        `Storage is ${quota.percentUsed.toFixed(1)}% full. This may cause downloads to fail. Continue?`
      );
      if (!confirm) return;
    }

    // Start download
    try {
      await tileCache.downloadTiles(bounds, zoomLevels, (p) => {
        setProgress(p);
        updateStorageInfo();
      });
    } catch (err) {
      setError(`Download failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handlePause = () => {
    tileCache.pauseDownload();
  };

  const handleResume = () => {
    tileCache.resumeDownload();
  };

  const handleCancel = () => {
    tileCache.cancelDownload();
    setProgress(null);
  };

  const handleClearCache = async () => {
    const confirm = window.confirm(
      'This will delete all downloaded tiles. Are you sure?'
    );
    if (!confirm) return;

    try {
      await tileCache.clearCache();
      await updateStorageInfo();
      setProgress(null);
    } catch (err) {
      setError(`Failed to clear cache: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className={`tile-downloader ${className || ''}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="download-toggle-btn"
        style={{
          position: 'fixed',
          top: '80px',
          right: '10px',
          zIndex: 1000,
          padding: '10px 15px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        }}
      >
        📥 Offline Maps
      </button>

      {isOpen && (
        <div
          className="download-panel"
          style={{
            position: 'fixed',
            top: '130px',
            right: '10px',
            zIndex: 1000,
            width: '320px',
            maxHeight: '500px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Download Offline Maps</h3>

          {/* Storage Info */}
          {storage && (
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Storage Used:</span>
                <strong>{formatBytes(storage.usage)} / {formatBytes(storage.quota)}</strong>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#ddd', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${storage.percentUsed}%`,
                    height: '100%',
                    backgroundColor: storage.percentUsed > 80 ? '#ff6b6b' : '#4CAF50',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px', marginTop: '5px', color: '#666' }}>
                {storage.percentUsed.toFixed(1)}%
              </div>
            </div>
          )}

          {/* Region Selection */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Select Region:
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Custom Bounds</option>
              {JAPAN_REGIONS.map(region => (
                <option key={region.name} value={region.name}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Bounds */}
          {!selectedRegion && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
                Custom Bounds (Latitude, Longitude):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="North"
                  value={customBounds.north}
                  onChange={(e) => setCustomBounds({ ...customBounds, north: parseFloat(e.target.value) })}
                  style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }}
                />
                <input
                  type="number"
                  placeholder="South"
                  value={customBounds.south}
                  onChange={(e) => setCustomBounds({ ...customBounds, south: parseFloat(e.target.value) })}
                  style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }}
                />
                <input
                  type="number"
                  placeholder="East"
                  value={customBounds.east}
                  onChange={(e) => setCustomBounds({ ...customBounds, east: parseFloat(e.target.value) })}
                  style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }}
                />
                <input
                  type="number"
                  placeholder="West"
                  value={customBounds.west}
                  onChange={(e) => setCustomBounds({ ...customBounds, west: parseFloat(e.target.value) })}
                  style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }}
                />
              </div>
            </div>
          )}

          {/* Zoom Level Selection */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Zoom Levels:
            </label>
            <select
              value={selectedZoomPreset}
              onChange={(e) => setSelectedZoomPreset(parseInt(e.target.value))}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              {ZOOM_PRESETS.map((preset, idx) => (
                <option key={idx} value={idx}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Zoom Levels */}
          {selectedZoomPreset === ZOOM_PRESETS.length - 1 && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
                Enter zoom levels (10-16), comma-separated:
              </label>
              <input
                type="text"
                placeholder="e.g., 13,14,15"
                onChange={(e) => {
                  const levels = e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 10 && n <= 16);
                  setCustomZoomLevels(levels);
                }}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
          )}

          {/* Download Progress */}
          {progress && (
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '5px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Progress:</strong> {progress.downloadedTiles} / {progress.totalTiles} tiles
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#c8e6c9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(progress.downloadedTiles / progress.totalTiles) * 100}%`,
                    height: '100%',
                    backgroundColor: '#4CAF50',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
              <div style={{ fontSize: '12px', marginTop: '8px', color: '#555' }}>
                <div>Speed: {progress.tilesPerSecond.toFixed(1)} tiles/sec</div>
                <div>Downloaded: {formatBytes(progress.bytesDownloaded)}</div>
                {progress.estimatedCompletion && (
                  <div>ETA: {formatTime(progress.estimatedCompletion)}</div>
                )}
                {progress.failedTiles > 0 && (
                  <div style={{ color: '#f44336' }}>Failed: {progress.failedTiles} tiles</div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '5px', color: '#c62828' }}>
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {!progress?.isDownloading ? (
              <button
                onClick={handleDownload}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Download
              </button>
            ) : (
              <>
                {!progress.isPaused ? (
                  <button
                    onClick={handlePause}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#FF9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={handleResume}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    Resume
                  </button>
                )}
                <button
                  onClick={handleCancel}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </>
            )}
            <button
              onClick={handleClearCache}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#9E9E9E',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Clear Cache
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
