/**
 * Dexie IndexedDB Database Configuration
 * Offline-first data storage for Japan Trip Companion
 */

import Dexie from 'dexie';

/**
 * Main database class extending Dexie
 * Provides typed access to all collections
 */
export class JapanTripDB extends Dexie {
  constructor() {
    super('JapanTripDatabase');

    // Define database schema
    // ++id = auto-incrementing primary key
    this.version(1).stores({
      trips: '++id, name, startDate, endDate, locations',
      savedPlaces: '++id, tripId, name, lat, lng, category, notes',
      forecastData: '++id, location, bloomDate, peakStart, peakEnd, cachedAt',
      mapTiles: '++id, z, x, y, url'
    });

    // Enable automatic table creation
    this.trips = this.table('trips');
    this.savedPlaces = this.table('savedPlaces');
    this.forecastData = this.table('forecastData');
    this.mapTiles = this.table('mapTiles');
  }
}

// Create and export singleton database instance
export const db = new JapanTripDB();

// Export database utilities
export const resetDatabase = async () => {
  await db.delete();
  return new JapanTripDB();
};

export const getDatabaseInfo = async () => {
  const tripCount = await db.trips.count();
  const placesCount = await db.savedPlaces.count();
  const forecastCount = await db.forecastData.count();
  const tilesCount = await db.mapTiles.count();

  return {
    trips: tripCount,
    savedPlaces: placesCount,
    forecastData: forecastCount,
    mapTiles: tilesCount,
    totalRecords: tripCount + placesCount + forecastCount + tilesCount
  };
};

export const clearOldCache = async (maxAgeMs = 7 * 24 * 60 * 60 * 1000) => {
  const cutoffDate = new Date(Date.now() - maxAgeMs);

  // Clear old forecast data
  const deletedForecasts = await db.forecastData
    .where('cachedAt')
    .below(cutoffDate.toISOString())
    .delete();

  console.log(`Cleared ${deletedForecasts} old forecast records`);
  return deletedForecasts;
};

export default db;
