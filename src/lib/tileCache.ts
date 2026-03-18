/**
 * Offline Tile Cache for Japan Trip Map
 * Uses IndexedDB via localforage for storing map tiles offline
 */

import localforage from 'localforage';
import type { TileCoordinates, BoundingBox, DownloadProgress, StorageQuota, TileCache } from '../types/map';

const TILE_STORE_NAME = 'map-tiles';
const MAX_STORAGE_MB = 50;
const MAX_STORAGE_BYTES = MAX_STORAGE_MB * 1024 * 1024;

// Initialize localforage instance for tile storage
const tileStore = localforage.createInstance({
  name: 'japan-trip',
  storeName: TILE_STORE_NAME,
  description: 'Offline map tiles for Japan Trip companion',
});

// Download state
let downloadState = {
  isDownloading: false,
  isPaused: false,
  isCancelled: false,
  currentProgress: null as DownloadProgress | null,
};

/**
 * Convert tile coordinates to storage key
 */
const getTileKey = (x: number, y: number, z: number): string => {
  return `tile_${z}_${x}_${y}`;
};

/**
 * Calculate number of tiles in a bounding box for a zoom level
 */
const calculateTileCount = (bounds: BoundingBox, zoom: number): number => {
  const n = Math.pow(2, zoom);
  const latRange = Math.PI / 180;

  const xtile1 = Math.floor((bounds.west + 180) / 360 * n);
  const xtile2 = Math.floor((bounds.east + 180) / 360 * n);

  const ytile1 = Math.floor((1 - Math.log(Math.tan(bounds.north * latRange) + 1 / Math.cos(bounds.north * latRange)) / Math.PI) / 2 * n);
  const ytile2 = Math.floor((1 - Math.log(Math.tan(bounds.south * latRange) + 1 / Math.cos(bounds.south * latRange)) / Math.PI) / 2 * n);

  const xTiles = Math.abs(xtile2 - xtile1) + 1;
  const yTiles = Math.abs(ytile2 - ytile1) + 1;

  return xTiles * yTiles;
};

/**
 * Get tile coordinates for a bounding box at a specific zoom level
 */
const getTileCoordinates = (bounds: BoundingBox, zoom: number): TileCoordinates[] => {
  const tiles: TileCoordinates[] = [];
  const n = Math.pow(2, zoom);
  const latRange = Math.PI / 180;

  const xtile1 = Math.floor((bounds.west + 180) / 360 * n);
  const xtile2 = Math.floor((bounds.east + 180) / 360 * n);

  const ytile1 = Math.floor((1 - Math.log(Math.tan(bounds.north * latRange) + 1 / Math.cos(bounds.north * latRange)) / Math.PI) / 2 * n);
  const ytile2 = Math.floor((1 - Math.log(Math.tan(bounds.south * latRange) + 1 / Math.cos(bounds.south * latRange)) / Math.PI) / 2 * n);

  for (let x = Math.min(xtile1, xtile2); x <= Math.max(xtile1, xtile2); x++) {
    for (let y = Math.min(ytile1, ytile2); y <= Math.max(ytile1, ytile2); y++) {
      tiles.push({ x, y, z: zoom });
    }
  }

  return tiles;
};

/**
 * Download a single tile
 */
const downloadTile = async (x: number, y: number, z: number): Promise<Blob | null> => {
  const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    console.error(`Failed to download tile ${z}/${x}/${y}:`, error);
    return null;
  }
};

/**
 * Get storage quota information
 */
const getStorageUsage = async (): Promise<StorageQuota> => {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || MAX_STORAGE_BYTES;

      return {
        usage,
        quota,
        percentUsed: (usage / quota) * 100,
      };
    }
  } catch (error) {
    console.error('Failed to get storage estimate:', error);
  }

  // Fallback: estimate based on stored tiles
  const keys = await tileStore.keys();
  const estimatedUsage = keys.length * 15000; // Assume ~15KB per tile

  return {
    usage: estimatedUsage,
    quota: MAX_STORAGE_BYTES,
    percentUsed: (estimatedUsage / MAX_STORAGE_BYTES) * 100,
  };
};

/**
 * Implement LRU eviction when storage quota is exceeded
 */
const evictOldestTiles = async (targetBytes: number) => {
  const keys = await tileStore.keys();
  const tiles: { key: string; timestamp: number }[] = [];

  // Get timestamps for all tiles
  for (const key of keys) {
    const data = await tileStore.getItem<{ timestamp: number }>(key);
    if (data && data.timestamp) {
      tiles.push({ key, timestamp: data.timestamp });
    }
  }

  // Sort by timestamp (oldest first)
  tiles.sort((a, b) => a.timestamp - b.timestamp);

  let freedBytes = 0;
  const avgTileSize = 15000; // Estimated tile size

  // Delete oldest tiles until we free enough space
  for (const tile of tiles) {
    if (freedBytes >= targetBytes) break;
    await tileStore.removeItem(tile.key);
    freedBytes += avgTileSize;
  }
};

/**
 * Download tiles for a region
 */
const downloadTiles = async (
  bounds: BoundingBox,
  zoomLevels: number[],
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> => {
  // Reset download state
  downloadState.isDownloading = true;
  downloadState.isPaused = false;
  downloadState.isCancelled = false;

  // Calculate total tiles
  let allTiles: TileCoordinates[] = [];
  for (const zoom of zoomLevels) {
    const tiles = getTileCoordinates(bounds, zoom);
    allTiles = allTiles.concat(tiles);
  }

  const totalTiles = allTiles.length;
  let downloadedTiles = 0;
  let failedTiles = 0;
  let bytesDownloaded = 0;
  const startTime = Date.now();

  const updateProgress = () => {
    const elapsed = (Date.now() - startTime) / 1000; // seconds
    const tilesPerSecond = downloadedTiles / elapsed;
    const remainingTiles = totalTiles - downloadedTiles;
    const estimatedCompletion = remainingTiles / tilesPerSecond;

    const progress: DownloadProgress = {
      totalTiles,
      downloadedTiles,
      failedTiles,
      currentTile: allTiles[downloadedTiles] || null,
      bytesDownloaded,
      startTime,
      estimatedCompletion: estimatedCompletion * 1000, // ms
      tilesPerSecond,
      isDownloading: downloadState.isDownloading,
      isPaused: downloadState.isPaused,
    };

    downloadState.currentProgress = progress;
    onProgress?.(progress);
  };

  // Download tiles with delay to avoid rate limiting
  for (let i = 0; i < allTiles.length; i++) {
    // Check for pause/cancel
    while (downloadState.isPaused && !downloadState.isCancelled) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (downloadState.isCancelled) {
      downloadState.isDownloading = false;
      return;
    }

    const tile = allTiles[i];
    const key = getTileKey(tile.x, tile.y, tile.z);

    // Check if tile already exists
    const existing = await tileStore.getItem(key);
    if (existing) {
      downloadedTiles++;
      updateProgress();
      continue;
    }

    // Download tile
    const blob = await downloadTile(tile.x, tile.y, tile.z);

    if (blob) {
      // Check storage quota
      const quota = await getStorageUsage();
      if (quota.percentUsed > 90) {
        // Evict 20% of storage
        await evictOldestTiles(quota.usage * 0.2);
      }

      // Store tile
      await tileStore.setItem(key, {
        blob,
        timestamp: Date.now(),
      });

      downloadedTiles++;
      bytesDownloaded += blob.size;
    } else {
      failedTiles++;
    }

    updateProgress();

    // Rate limiting: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  downloadState.isDownloading = false;
  updateProgress();
};

/**
 * Create TileCache instance
 */
export const createTileCache = (): TileCache => {
  return {
    getTile: async (x: number, y: number, z: number): Promise<string | null> => {
      const key = getTileKey(x, y, z);
      const data = await tileStore.getItem<{ blob: Blob }>(key);

      if (data && data.blob) {
        return URL.createObjectURL(data.blob);
      }

      return null;
    },

    setTile: async (x: number, y: number, z: number, blob: Blob): Promise<void> => {
      const key = getTileKey(x, y, z);
      await tileStore.setItem(key, {
        blob,
        timestamp: Date.now(),
      });
    },

    deleteTile: async (x: number, y: number, z: number): Promise<void> => {
      const key = getTileKey(x, y, z);
      await tileStore.removeItem(key);
    },

    clearCache: async (): Promise<void> => {
      await tileStore.clear();
    },

    getStorageUsage,

    downloadTiles,

    pauseDownload: () => {
      downloadState.isPaused = true;
    },

    resumeDownload: () => {
      downloadState.isPaused = false;
    },

    cancelDownload: () => {
      downloadState.isCancelled = true;
      downloadState.isDownloading = false;
    },
  };
};

// Export singleton instance
export const tileCache = createTileCache();

// Helper to check if we're offline
export const isOffline = (): boolean => {
  return !navigator.onLine;
};

// Helper to get tile URL (online or cached)
export const getTileUrl = async (x: number, y: number, z: number): Promise<string> => {
  // Try cache first
  const cachedUrl = await tileCache.getTile(x, y, z);
  if (cachedUrl) {
    return cachedUrl;
  }

  // If offline, return placeholder
  if (isOffline()) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9mZmxpbmU8L3RleHQ+PC9zdmc+';
  }

  // Return online URL
  return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
};
