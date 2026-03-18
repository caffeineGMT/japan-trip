/**
 * Map Types for Japan Trip Companion
 * Defines interfaces for locations, tile caching, and download progress
 */

export interface Location {
  id: string;
  name: string;
  nameJa: string;
  lat: number;
  lng: number;
  category: 'restaurant' | 'temple' | 'sakura' | 'hotel' | 'attraction' | 'station';
  description?: string;
  descriptionJa?: string;
  address?: string;
  rating?: number;
  imageUrl?: string;
  visited?: boolean;
  notes?: string;
}

export interface TileCoordinates {
  x: number;
  y: number;
  z: number;
}

export interface TileCacheEntry {
  url: string;
  blob: Blob;
  timestamp: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface DownloadRegion {
  bounds: BoundingBox;
  name: string;
  zoomLevels: number[];
}

export interface DownloadProgress {
  totalTiles: number;
  downloadedTiles: number;
  failedTiles: number;
  currentTile: TileCoordinates | null;
  bytesDownloaded: number;
  startTime: number;
  estimatedCompletion?: number;
  tilesPerSecond: number;
  isDownloading: boolean;
  isPaused: boolean;
}

export interface StorageQuota {
  usage: number; // in bytes
  quota: number; // in bytes
  percentUsed: number;
}

export interface TileCache {
  getTile: (x: number, y: number, z: number) => Promise<string | null>;
  setTile: (x: number, y: number, z: number, blob: Blob) => Promise<void>;
  deleteTile: (x: number, y: number, z: number) => Promise<void>;
  clearCache: () => Promise<void>;
  getStorageUsage: () => Promise<StorageQuota>;
  downloadTiles: (
    bounds: BoundingBox,
    zoomLevels: number[],
    onProgress?: (progress: DownloadProgress) => void
  ) => Promise<void>;
  pauseDownload: () => void;
  resumeDownload: () => void;
  cancelDownload: () => void;
}

export interface MarkerClusterConfig {
  maxClusterRadius: number;
  disableClusteringAtZoom: number;
  spiderfyOnMaxZoom: boolean;
  showCoverageOnHover: boolean;
  zoomToBoundsOnClick: boolean;
}

export interface MapConfig {
  defaultCenter: [number, number];
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
  maxBounds?: [[number, number], [number, number]];
  tileUrl: string;
  attribution: string;
  offlineStorageQuota: number; // in MB
  clusterConfig: MarkerClusterConfig;
}
