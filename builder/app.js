/**
 * Visual Trip Builder - State Management
 * Handles trip data, localStorage persistence, and state updates
 */

class TripBuilder {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
    this.geocoder = new Geocoder();

    // Auto-save on state changes
    this.autoSaveDebounceTimer = null;
  }

  /**
   * Load state from localStorage or create default
   */
  loadState() {
    const saved = localStorage.getItem('trip-builder-state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to parse saved state:', error);
      }
    }

    // Default empty trip
    return {
      title: 'My Japan Trip',
      destination: 'Japan',
      startDate: null,
      endDate: null,
      days: [],
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        version: '1.0'
      }
    };
  }

  /**
   * Save state to localStorage
   */
  saveState() {
    this.state.metadata.modified = new Date().toISOString();
    localStorage.setItem('trip-builder-state', JSON.stringify(this.state));
  }

  /**
   * Auto-save with debouncing (500ms delay)
   */
  autoSave() {
    clearTimeout(this.autoSaveDebounceTimer);
    this.autoSaveDebounceTimer = setTimeout(() => {
      this.saveState();
      this.notify({ type: 'autosave', timestamp: Date.now() });
    }, 500);
  }

  /**
   * Update trip metadata
   */
  updateMetadata(updates) {
    Object.assign(this.state, updates);
    this.autoSave();
    this.notify({ type: 'metadata-updated', data: updates });
  }

  /**
   * Add a new day
   */
  addDay(dayData = {}) {
    const newDay = {
      id: `day-${Date.now()}`,
      day: `Day ${this.state.days.length + 1}`,
      date: null,
      weekday: null,
      city: { en: '', zh: '', ja: '' },
      theme: { en: '', zh: '', ja: '' },
      color: this.getNextColor(),
      center: [35.6762, 139.6503], // Default to Tokyo
      zoom: 13,
      stops: [],
      culturalTips: [],
      checklist: [],
      ...dayData
    };

    this.state.days.push(newDay);
    this.autoSave();
    this.notify({ type: 'day-added', data: newDay });
    return newDay;
  }

  /**
   * Update a day
   */
  updateDay(dayId, updates) {
    const dayIndex = this.state.days.findIndex(d => d.id === dayId);
    if (dayIndex === -1) return;

    Object.assign(this.state.days[dayIndex], updates);
    this.autoSave();
    this.notify({ type: 'day-updated', data: { dayId, updates } });
  }

  /**
   * Delete a day
   */
  deleteDay(dayId) {
    const index = this.state.days.findIndex(d => d.id === dayId);
    if (index === -1) return;

    const deleted = this.state.days.splice(index, 1)[0];
    this.autoSave();
    this.notify({ type: 'day-deleted', data: deleted });
  }

  /**
   * Add a stop to a day
   */
  async addStop(dayId, stopData) {
    const day = this.state.days.find(d => d.id === dayId);
    if (!day) return;

    const newStop = {
      id: `stop-${Date.now()}`,
      name: { en: '', zh: '', ja: '' },
      time: '',
      desc: { en: '', zh: '', ja: '' },
      lat: null,
      lng: null,
      icon: 'attraction',
      category: 'activity',
      ...stopData
    };

    // If we have a search query but no coordinates, geocode it
    if (stopData.searchQuery && !stopData.lat) {
      try {
        const results = await this.geocoder.geocode(stopData.searchQuery, {
          countryCode: 'jp'
        });

        if (results && results.length > 0) {
          const best = results[0];
          newStop.lat = best.lat;
          newStop.lng = best.lng;
          if (!newStop.name.en) {
            newStop.name.en = best.name;
          }
        }
      } catch (error) {
        console.error('Geocoding failed:', error);
      }
    }

    day.stops.push(newStop);
    this.autoSave();
    this.notify({ type: 'stop-added', data: { dayId, stop: newStop } });
    return newStop;
  }

  /**
   * Update a stop
   */
  updateStop(dayId, stopId, updates) {
    const day = this.state.days.find(d => d.id === dayId);
    if (!day) return;

    const stop = day.stops.find(s => s.id === stopId);
    if (!stop) return;

    Object.assign(stop, updates);
    this.autoSave();
    this.notify({ type: 'stop-updated', data: { dayId, stopId, updates } });
  }

  /**
   * Delete a stop
   */
  deleteStop(dayId, stopId) {
    const day = this.state.days.find(d => d.id === dayId);
    if (!day) return;

    const index = day.stops.findIndex(s => s.id === stopId);
    if (index === -1) return;

    const deleted = day.stops.splice(index, 1)[0];
    this.autoSave();
    this.notify({ type: 'stop-deleted', data: { dayId, stop: deleted } });
  }

  /**
   * Reorder stops within a day
   */
  reorderStops(dayId, stopIds) {
    const day = this.state.days.find(d => d.id === dayId);
    if (!day) return;

    const newOrder = stopIds.map(id => day.stops.find(s => s.id === id)).filter(Boolean);
    day.stops = newOrder;
    this.autoSave();
    this.notify({ type: 'stops-reordered', data: { dayId, stopIds } });
  }

  /**
   * Move stop between days
   */
  moveStop(stopId, fromDayId, toDayId, toIndex = -1) {
    const fromDay = this.state.days.find(d => d.id === fromDayId);
    const toDay = this.state.days.find(d => d.id === toDayId);

    if (!fromDay || !toDay) return;

    const stopIndex = fromDay.stops.findIndex(s => s.id === stopId);
    if (stopIndex === -1) return;

    const [stop] = fromDay.stops.splice(stopIndex, 1);

    if (toIndex === -1) {
      toDay.stops.push(stop);
    } else {
      toDay.stops.splice(toIndex, 0, stop);
    }

    this.autoSave();
    this.notify({ type: 'stop-moved', data: { stopId, fromDayId, toDayId } });
  }

  /**
   * Get color for next day
   */
  getNextColor() {
    const colors = [
      '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
      '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
    ];
    return colors[this.state.days.length % colors.length];
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  notify(event) {
    this.listeners.forEach(listener => listener(event, this.state));
  }

  /**
   * Import trip data from JSON
   */
  importTrip(tripData) {
    try {
      // Validate basic structure
      if (!tripData.days || !Array.isArray(tripData.days)) {
        throw new Error('Invalid trip data: missing days array');
      }

      this.state = {
        ...tripData,
        metadata: {
          ...tripData.metadata,
          modified: new Date().toISOString()
        }
      };

      this.saveState();
      this.notify({ type: 'trip-imported', data: tripData });
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  /**
   * Export trip data as JSON
   */
  exportTrip() {
    return JSON.stringify(this.state, null, 2);
  }

  /**
   * Clear all data (with confirmation)
   */
  clearTrip() {
    this.state = this.loadState();
    this.state.days = [];
    this.saveState();
    this.notify({ type: 'trip-cleared' });
  }
}

// Make available globally
window.TripBuilder = TripBuilder;
