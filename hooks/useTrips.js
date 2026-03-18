/**
 * useTrips Hook
 * React hooks for managing trips with Dexie IndexedDB
 * Provides real-time reactive queries and CRUD operations
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db.js';
import { useCallback } from 'react';

/**
 * Get all trips sorted by start date (newest first)
 * Returns live-updating array of trips
 */
export const useTrips = () => {
  return useLiveQuery(
    () => db.trips.orderBy('startDate').reverse().toArray(),
    []
  );
};

/**
 * Get a single trip by ID
 * @param {number} id - Trip ID
 * @returns {Object|undefined} Trip object or undefined
 */
export const useTripById = (id) => {
  return useLiveQuery(
    () => db.trips.get(id),
    [id]
  );
};

/**
 * Get upcoming trips (start date in the future)
 * @returns {Array} Array of upcoming trips
 */
export const useUpcomingTrips = () => {
  const today = new Date().toISOString().split('T')[0];
  return useLiveQuery(
    () => db.trips
      .where('startDate')
      .aboveOrEqual(today)
      .sortBy('startDate'),
    []
  );
};

/**
 * Get past trips (end date in the past)
 * @returns {Array} Array of past trips
 */
export const usePastTrips = () => {
  const today = new Date().toISOString().split('T')[0];
  return useLiveQuery(
    () => db.trips
      .where('endDate')
      .below(today)
      .reverse()
      .sortBy('endDate'),
    []
  );
};

/**
 * Hook providing CRUD operations for trips
 * @returns {Object} Object with add, update, delete functions
 */
export const useTripActions = () => {
  const addTrip = useCallback(async (tripData) => {
    const { name, startDate, endDate, locations = [] } = tripData;

    if (!name || !startDate || !endDate) {
      throw new Error('Trip name, start date, and end date are required');
    }

    const trip = {
      name,
      startDate,
      endDate,
      locations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const id = await db.trips.add(trip);
    console.log(`Trip created with ID: ${id}`);
    return id;
  }, []);

  const updateTrip = useCallback(async (id, updates) => {
    if (!id) {
      throw new Error('Trip ID is required');
    }

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await db.trips.update(id, updateData);
    console.log(`Trip ${id} updated`);
    return id;
  }, []);

  const deleteTrip = useCallback(async (id) => {
    if (!id) {
      throw new Error('Trip ID is required');
    }

    // Also delete associated saved places
    await db.savedPlaces.where('tripId').equals(id).delete();

    await db.trips.delete(id);
    console.log(`Trip ${id} and associated places deleted`);
    return id;
  }, []);

  const addLocationToTrip = useCallback(async (tripId, location) => {
    const trip = await db.trips.get(tripId);
    if (!trip) {
      throw new Error(`Trip ${tripId} not found`);
    }

    const locations = trip.locations || [];
    locations.push(location);

    await db.trips.update(tripId, {
      locations,
      updatedAt: new Date().toISOString()
    });

    return tripId;
  }, []);

  const removeLocationFromTrip = useCallback(async (tripId, locationIndex) => {
    const trip = await db.trips.get(tripId);
    if (!trip) {
      throw new Error(`Trip ${tripId} not found`);
    }

    const locations = trip.locations || [];
    locations.splice(locationIndex, 1);

    await db.trips.update(tripId, {
      locations,
      updatedAt: new Date().toISOString()
    });

    return tripId;
  }, []);

  return {
    addTrip,
    updateTrip,
    deleteTrip,
    addLocationToTrip,
    removeLocationFromTrip
  };
};

/**
 * Complete hook combining queries and actions
 * @returns {Object} All trip-related hooks in one object
 */
export const useTripsComplete = () => {
  const trips = useTrips();
  const upcomingTrips = useUpcomingTrips();
  const pastTrips = usePastTrips();
  const actions = useTripActions();

  return {
    trips,
    upcomingTrips,
    pastTrips,
    ...actions
  };
};
