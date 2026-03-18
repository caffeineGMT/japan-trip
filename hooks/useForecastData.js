/**
 * useForecastData Hook
 * React hooks for managing cherry blossom forecast data with Dexie IndexedDB
 * Provides real-time reactive queries, CRUD operations, and cache management
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db.js';
import { useCallback } from 'react';

/**
 * Get all forecast data
 * @returns {Array} Array of all forecast entries
 */
export const useAllForecasts = () => {
  return useLiveQuery(
    () => db.forecastData.toArray(),
    []
  );
};

/**
 * Get forecast data for a specific location
 * @param {string} location - Location name (e.g., 'Tokyo', 'Kyoto')
 * @returns {Object|undefined} Forecast data or undefined
 */
export const useForecastByLocation = (location) => {
  return useLiveQuery(
    () => db.forecastData
      .where('location')
      .equalsIgnoreCase(location)
      .first(),
    [location]
  );
};

/**
 * Get forecast data by ID
 * @param {number} id - Forecast ID
 * @returns {Object|undefined} Forecast data or undefined
 */
export const useForecastById = (id) => {
  return useLiveQuery(
    () => db.forecastData.get(id),
    [id]
  );
};

/**
 * Get forecasts sorted by bloom date (earliest first)
 * @returns {Array} Sorted array of forecasts
 */
export const useForecastsSortedByBloom = () => {
  return useLiveQuery(
    () => db.forecastData.orderBy('bloomDate').toArray(),
    []
  );
};

/**
 * Get forecasts cached within a certain time period (fresh forecasts)
 * @param {number} maxAgeHours - Maximum cache age in hours (default: 24)
 * @returns {Array} Fresh forecast entries
 */
export const useFreshForecasts = (maxAgeHours = 24) => {
  return useLiveQuery(
    async () => {
      const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();
      return db.forecastData
        .where('cachedAt')
        .aboveOrEqual(cutoffTime)
        .toArray();
    },
    [maxAgeHours]
  );
};

/**
 * Get stale forecasts that need updating
 * @param {number} maxAgeHours - Maximum cache age in hours (default: 24)
 * @returns {Array} Stale forecast entries
 */
export const useStaleForecasts = (maxAgeHours = 24) => {
  return useLiveQuery(
    async () => {
      const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();
      return db.forecastData
        .where('cachedAt')
        .below(cutoffTime)
        .toArray();
    },
    [maxAgeHours]
  );
};

/**
 * Hook providing CRUD and cache operations for forecast data
 * @returns {Object} Object with add, update, delete, and cache management functions
 */
export const useForecastActions = () => {
  const addForecast = useCallback(async (forecastData) => {
    const { location, bloomDate, peakStart, peakEnd } = forecastData;

    if (!location || !bloomDate) {
      throw new Error('Location and bloom date are required');
    }

    const forecast = {
      location,
      bloomDate,
      peakStart: peakStart || null,
      peakEnd: peakEnd || null,
      cachedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const id = await db.forecastData.add(forecast);
    console.log(`Forecast created for ${location} with ID: ${id}`);
    return id;
  }, []);

  const updateForecast = useCallback(async (id, updates) => {
    if (!id) {
      throw new Error('Forecast ID is required');
    }

    const updateData = {
      ...updates,
      cachedAt: new Date().toISOString()
    };

    await db.forecastData.update(id, updateData);
    console.log(`Forecast ${id} updated`);
    return id;
  }, []);

  const deleteForecast = useCallback(async (id) => {
    if (!id) {
      throw new Error('Forecast ID is required');
    }

    await db.forecastData.delete(id);
    console.log(`Forecast ${id} deleted`);
    return id;
  }, []);

  const upsertForecast = useCallback(async (forecastData) => {
    const { location } = forecastData;

    if (!location) {
      throw new Error('Location is required');
    }

    // Check if forecast exists for this location
    const existing = await db.forecastData
      .where('location')
      .equalsIgnoreCase(location)
      .first();

    if (existing) {
      // Update existing forecast
      await db.forecastData.update(existing.id, {
        ...forecastData,
        cachedAt: new Date().toISOString()
      });
      console.log(`Forecast updated for ${location}`);
      return existing.id;
    } else {
      // Add new forecast
      return addForecast(forecastData);
    }
  }, [addForecast]);

  const bulkUpsertForecasts = useCallback(async (forecastsArray) => {
    if (!Array.isArray(forecastsArray) || forecastsArray.length === 0) {
      throw new Error('Valid forecasts array is required');
    }

    const results = await Promise.all(
      forecastsArray.map(forecast => upsertForecast(forecast))
    );

    console.log(`Bulk upserted ${results.length} forecasts`);
    return results;
  }, [upsertForecast]);

  const refreshForecastCache = useCallback(async (location, forecastData) => {
    return upsertForecast({ location, ...forecastData });
  }, [upsertForecast]);

  const clearStaleForecasts = useCallback(async (maxAgeHours = 24 * 7) => {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();

    const count = await db.forecastData
      .where('cachedAt')
      .below(cutoffTime)
      .delete();

    console.log(`Cleared ${count} stale forecasts`);
    return count;
  }, []);

  const clearAllForecasts = useCallback(async () => {
    const count = await db.forecastData.clear();
    console.log(`Cleared all ${count} forecasts`);
    return count;
  }, []);

  return {
    addForecast,
    updateForecast,
    deleteForecast,
    upsertForecast,
    bulkUpsertForecasts,
    refreshForecastCache,
    clearStaleForecasts,
    clearAllForecasts
  };
};

/**
 * Check if a forecast is stale and needs refresh
 * @param {number} maxAgeHours - Maximum cache age in hours (default: 24)
 * @returns {Function} Function that checks if a forecast object is stale
 */
export const useIsForecastStale = (maxAgeHours = 24) => {
  return useCallback((forecast) => {
    if (!forecast || !forecast.cachedAt) {
      return true;
    }

    const cacheAge = Date.now() - new Date(forecast.cachedAt).getTime();
    const maxAge = maxAgeHours * 60 * 60 * 1000;

    return cacheAge > maxAge;
  }, [maxAgeHours]);
};

/**
 * Get forecast statistics
 * @returns {Object} Statistics about cached forecasts
 */
export const useForecastStats = () => {
  return useLiveQuery(
    async () => {
      const allForecasts = await db.forecastData.toArray();
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;

      const stats = {
        total: allForecasts.length,
        fresh: 0,
        stale: 0,
        locations: new Set(),
        oldestCache: null,
        newestCache: null
      };

      allForecasts.forEach(forecast => {
        const cacheTime = new Date(forecast.cachedAt).getTime();

        if (cacheTime > oneDayAgo) {
          stats.fresh++;
        } else {
          stats.stale++;
        }

        stats.locations.add(forecast.location);

        if (!stats.oldestCache || cacheTime < new Date(stats.oldestCache).getTime()) {
          stats.oldestCache = forecast.cachedAt;
        }

        if (!stats.newestCache || cacheTime > new Date(stats.newestCache).getTime()) {
          stats.newestCache = forecast.cachedAt;
        }
      });

      stats.locations = Array.from(stats.locations);

      return stats;
    },
    []
  );
};

/**
 * Complete hook combining queries and actions
 * @returns {Object} All forecast-related hooks in one object
 */
export const useForecastDataComplete = () => {
  const allForecasts = useAllForecasts();
  const actions = useForecastActions();
  const stats = useForecastStats();

  return {
    allForecasts,
    stats,
    ...actions
  };
};
