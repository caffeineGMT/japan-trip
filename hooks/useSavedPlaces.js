/**
 * useSavedPlaces Hook
 * React hooks for managing saved places/POIs with Dexie IndexedDB
 * Provides real-time reactive queries and CRUD operations
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db.js';
import { useCallback } from 'react';

/**
 * Get all saved places across all trips
 * @returns {Array} Array of all saved places
 */
export const useAllSavedPlaces = () => {
  return useLiveQuery(
    () => db.savedPlaces.toArray(),
    []
  );
};

/**
 * Get saved places for a specific trip
 * @param {number} tripId - Trip ID
 * @returns {Array} Array of saved places for the trip
 */
export const useSavedPlacesByTrip = (tripId) => {
  return useLiveQuery(
    () => db.savedPlaces.where('tripId').equals(tripId).toArray(),
    [tripId]
  );
};

/**
 * Get saved places by category for a specific trip
 * @param {number} tripId - Trip ID
 * @param {string} category - Category name (e.g., 'restaurant', 'temple', 'hotel')
 * @returns {Array} Filtered array of saved places
 */
export const useSavedPlacesByCategory = (tripId, category) => {
  return useLiveQuery(
    () => db.savedPlaces
      .where('[tripId+category]')
      .equals([tripId, category])
      .toArray(),
    [tripId, category]
  );
};

/**
 * Get a single saved place by ID
 * @param {number} id - Place ID
 * @returns {Object|undefined} Saved place object or undefined
 */
export const useSavedPlaceById = (id) => {
  return useLiveQuery(
    () => db.savedPlaces.get(id),
    [id]
  );
};

/**
 * Search saved places by name
 * @param {string} searchTerm - Search term
 * @returns {Array} Matching saved places
 */
export const useSearchSavedPlaces = (searchTerm) => {
  return useLiveQuery(
    async () => {
      if (!searchTerm || searchTerm.trim().length === 0) {
        return [];
      }

      const allPlaces = await db.savedPlaces.toArray();
      const term = searchTerm.toLowerCase();

      return allPlaces.filter(place =>
        place.name?.toLowerCase().includes(term) ||
        place.notes?.toLowerCase().includes(term)
      );
    },
    [searchTerm]
  );
};

/**
 * Hook providing CRUD operations for saved places
 * @returns {Object} Object with add, update, delete functions
 */
export const useSavedPlaceActions = () => {
  const addSavedPlace = useCallback(async (placeData) => {
    const { tripId, name, lat, lng, category = 'other', notes = '' } = placeData;

    if (!tripId || !name || lat === undefined || lng === undefined) {
      throw new Error('Trip ID, name, latitude, and longitude are required');
    }

    // Validate coordinates
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error('Invalid coordinates');
    }

    const place = {
      tripId,
      name,
      lat,
      lng,
      category,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const id = await db.savedPlaces.add(place);
    console.log(`Saved place created with ID: ${id}`);
    return id;
  }, []);

  const updateSavedPlace = useCallback(async (id, updates) => {
    if (!id) {
      throw new Error('Place ID is required');
    }

    // Validate coordinates if provided
    if (updates.lat !== undefined || updates.lng !== undefined) {
      const place = await db.savedPlaces.get(id);
      const lat = updates.lat !== undefined ? updates.lat : place.lat;
      const lng = updates.lng !== undefined ? updates.lng : place.lng;

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('Invalid coordinates');
      }
    }

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await db.savedPlaces.update(id, updateData);
    console.log(`Saved place ${id} updated`);
    return id;
  }, []);

  const deleteSavedPlace = useCallback(async (id) => {
    if (!id) {
      throw new Error('Place ID is required');
    }

    await db.savedPlaces.delete(id);
    console.log(`Saved place ${id} deleted`);
    return id;
  }, []);

  const bulkAddSavedPlaces = useCallback(async (placesArray) => {
    if (!Array.isArray(placesArray) || placesArray.length === 0) {
      throw new Error('Valid places array is required');
    }

    const timestamp = new Date().toISOString();
    const placesWithTimestamps = placesArray.map(place => ({
      ...place,
      createdAt: timestamp,
      updatedAt: timestamp
    }));

    const ids = await db.savedPlaces.bulkAdd(placesWithTimestamps, { allKeys: true });
    console.log(`Bulk added ${ids.length} saved places`);
    return ids;
  }, []);

  const deleteSavedPlacesByTrip = useCallback(async (tripId) => {
    if (!tripId) {
      throw new Error('Trip ID is required');
    }

    const count = await db.savedPlaces.where('tripId').equals(tripId).delete();
    console.log(`Deleted ${count} saved places for trip ${tripId}`);
    return count;
  }, []);

  return {
    addSavedPlace,
    updateSavedPlace,
    deleteSavedPlace,
    bulkAddSavedPlaces,
    deleteSavedPlacesByTrip
  };
};

/**
 * Get category statistics for a trip
 * @param {number} tripId - Trip ID
 * @returns {Object} Category counts
 */
export const usePlaceCategoryStats = (tripId) => {
  return useLiveQuery(
    async () => {
      const places = await db.savedPlaces.where('tripId').equals(tripId).toArray();

      const stats = {};
      places.forEach(place => {
        const category = place.category || 'other';
        stats[category] = (stats[category] || 0) + 1;
      });

      return stats;
    },
    [tripId]
  );
};

/**
 * Complete hook combining queries and actions
 * @returns {Object} All saved place-related hooks in one object
 */
export const useSavedPlacesComplete = () => {
  const allPlaces = useAllSavedPlaces();
  const actions = useSavedPlaceActions();

  return {
    allPlaces,
    ...actions
  };
};
