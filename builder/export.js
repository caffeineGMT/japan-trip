/**
 * Export/Import Module
 * Handles trip template validation, export, and import
 */

class TripExporter {
  constructor(tripBuilder) {
    this.builder = tripBuilder;
    this.validators = this.initializeValidators();
  }

  /**
   * Initialize validation rules
   */
  initializeValidators() {
    return {
      required: (value, fieldName) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
          return `${fieldName} is required`;
        }
        return null;
      },

      i18nRequired: (value, fieldName) => {
        if (!value || typeof value !== 'object') {
          return `${fieldName} must be an i18n object`;
        }
        if (!value.en) {
          return `${fieldName} must have an English translation`;
        }
        return null;
      },

      coordinates: (lat, lng, fieldName) => {
        if (typeof lat !== 'number' || typeof lng !== 'number') {
          return `${fieldName} must have valid coordinates`;
        }
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          return `${fieldName} has invalid coordinate values`;
        }
        return null;
      },

      array: (value, fieldName) => {
        if (!Array.isArray(value)) {
          return `${fieldName} must be an array`;
        }
        return null;
      }
    };
  }

  /**
   * Validate trip data
   * @param {Object} tripData - Trip data to validate
   * @returns {Object} { valid: boolean, errors: Array }
   */
  validate(tripData) {
    const errors = [];

    // Validate basic structure
    if (!tripData.title) {
      errors.push('Trip must have a title');
    }

    if (!tripData.days || !Array.isArray(tripData.days)) {
      errors.push('Trip must have a days array');
    } else if (tripData.days.length === 0) {
      errors.push('Trip must have at least one day');
    } else {
      // Validate each day
      tripData.days.forEach((day, dayIndex) => {
        const dayPrefix = `Day ${dayIndex + 1}`;

        // Required fields
        if (!day.id) errors.push(`${dayPrefix}: Missing id`);
        if (!day.day) errors.push(`${dayPrefix}: Missing day label`);

        // i18n fields
        const cityError = this.validators.i18nRequired(day.city, 'city');
        if (cityError) errors.push(`${dayPrefix}: ${cityError}`);

        const themeError = this.validators.i18nRequired(day.theme, 'theme');
        if (themeError) errors.push(`${dayPrefix}: ${themeError}`);

        // Color
        if (!day.color || !day.color.match(/^#[0-9A-Fa-f]{6}$/)) {
          errors.push(`${dayPrefix}: Invalid color (must be hex format)`);
        }

        // Center coordinates
        if (!Array.isArray(day.center) || day.center.length !== 2) {
          errors.push(`${dayPrefix}: Center must be [lat, lng] array`);
        } else {
          const coordError = this.validators.coordinates(day.center[0], day.center[1], 'center');
          if (coordError) errors.push(`${dayPrefix}: ${coordError}`);
        }

        // Stops
        if (!Array.isArray(day.stops)) {
          errors.push(`${dayPrefix}: Stops must be an array`);
        } else {
          day.stops.forEach((stop, stopIndex) => {
            const stopPrefix = `${dayPrefix}, Stop ${stopIndex + 1}`;

            // Required fields
            if (!stop.id) errors.push(`${stopPrefix}: Missing id`);

            const nameError = this.validators.i18nRequired(stop.name, 'name');
            if (nameError) errors.push(`${stopPrefix}: ${nameError}`);

            const descError = this.validators.i18nRequired(stop.desc, 'description');
            if (descError) errors.push(`${stopPrefix}: ${descError}`);

            // Coordinates (optional but if present must be valid)
            if ((stop.lat !== null || stop.lng !== null)) {
              const coordError = this.validators.coordinates(stop.lat, stop.lng, 'coordinates');
              if (coordError) errors.push(`${stopPrefix}: ${coordError}`);
            }

            // Category and icon
            const validCategories = ['transport', 'hotel', 'food', 'activity', 'shopping'];
            if (!validCategories.includes(stop.category)) {
              errors.push(`${stopPrefix}: Invalid category (must be one of: ${validCategories.join(', ')})`);
            }
          });
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Export trip as JSON file download
   */
  exportAsFile() {
    const tripData = this.builder.state;

    // Validate before export
    const validation = this.validate(tripData);
    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
      return {
        success: false,
        errors: validation.errors
      };
    }

    // Create download
    const json = JSON.stringify(tripData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.sanitizeFilename(tripData.title)}-trip.json`;
    a.click();

    URL.revokeObjectURL(url);

    return {
      success: true,
      size: blob.size
    };
  }

  /**
   * Import trip from JSON file
   * @param {File} file - JSON file to import
   * @returns {Promise<Object>} Import result
   */
  async importFromFile(file) {
    try {
      const text = await file.text();
      const tripData = JSON.parse(text);

      // Validate imported data
      const validation = this.validate(tripData);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Import into builder
      const imported = this.builder.importTrip(tripData);

      return {
        success: imported,
        tripData
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to parse JSON: ${error.message}`]
      };
    }
  }

  /**
   * Publish trip to API (requires authentication)
   * @param {string} authToken - JWT authentication token
   * @returns {Promise<Object>} Publish result
   */
  async publishToAPI(authToken) {
    const tripData = this.builder.state;

    // Validate before publishing
    const validation = this.validate(tripData);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(tripData)
      });

      if (!response.ok) {
        throw new Error(`Publish failed: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        templateId: result.id,
        url: result.url
      };
    } catch (error) {
      return {
        success: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Generate shareable link
   * @returns {string} Data URL with trip data
   */
  generateShareLink() {
    const tripData = this.builder.state;
    const json = JSON.stringify(tripData);
    const encoded = btoa(unescape(encodeURIComponent(json)));

    // Create shareable URL (assuming deployment at japan-trip.vercel.app)
    const baseUrl = window.location.origin;
    return `${baseUrl}?import=${encoded}`;
  }

  /**
   * Import from shareable link
   * @param {string} encodedData - Base64 encoded trip data
   * @returns {Object} Import result
   */
  importFromLink(encodedData) {
    try {
      const json = decodeURIComponent(escape(atob(encodedData)));
      const tripData = JSON.parse(json);

      const validation = this.validate(tripData);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      const imported = this.builder.importTrip(tripData);

      return {
        success: imported,
        tripData
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to import from link: ${error.message}`]
      };
    }
  }

  /**
   * Sanitize filename for download
   * @param {string} filename - Original filename
   * @returns {string} Sanitized filename
   */
  sanitizeFilename(filename) {
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Export as data.js format (for direct use in app)
   * @returns {string} JavaScript module content
   */
  exportAsDataJS() {
    const tripData = this.builder.state;

    return `// Generated trip data
const TRIP_DATA = ${JSON.stringify(tripData.days, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TRIP_DATA;
}
`;
  }
}

// Make available globally
window.TripExporter = TripExporter;
