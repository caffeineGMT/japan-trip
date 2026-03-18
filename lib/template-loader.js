/**
 * Trip Template Loader
 * Dynamically loads and validates trip templates from JSON files
 * Browser-compatible ES6 module
 */

// Browser-compatible Ajv (needs to be loaded via CDN in HTML)
// Schema will be embedded for browser validation

const SCHEMA = {
  "$schema": "https://json-schema.org/draft-07/schema",
  "type": "object",
  "required": ["metadata", "geography", "days"],
  "properties": {
    "metadata": {
      "type": "object",
      "required": ["id", "title", "destination", "country", "duration_days"]
    },
    "geography": {
      "type": "object",
      "required": ["default_center", "default_zoom"]
    },
    "days": {
      "type": "array",
      "minItems": 1
    }
  }
};

/**
 * Basic template validation (browser-compatible)
 * Performs structural checks without full Ajv validation
 */
function validateBasic(template) {
  const errors = [];

  // Check required top-level fields
  if (!template.metadata) errors.push('Missing required field: metadata');
  if (!template.geography) errors.push('Missing required field: geography');
  if (!template.days || !Array.isArray(template.days)) {
    errors.push('Missing or invalid required field: days (must be array)');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Check metadata
  const meta = template.metadata;
  if (!meta.id) errors.push('metadata.id is required');
  if (!meta.title?.en) errors.push('metadata.title.en is required');
  if (!meta.destination?.en) errors.push('metadata.destination.en is required');
  if (!meta.country) errors.push('metadata.country is required');
  if (!meta.duration_days || meta.duration_days < 1) {
    errors.push('metadata.duration_days must be >= 1');
  }

  // Check geography
  const geo = template.geography;
  if (!Array.isArray(geo.default_center) || geo.default_center.length !== 2) {
    errors.push('geography.default_center must be [lat, lng] array');
  }
  if (!geo.default_zoom || geo.default_zoom < 1 || geo.default_zoom > 20) {
    errors.push('geography.default_zoom must be between 1 and 20');
  }

  // Check days structure
  if (template.days.length === 0) {
    errors.push('days array must have at least one day');
  }

  template.days.forEach((day, idx) => {
    if (!day.id) errors.push(`days[${idx}].id is required`);
    if (!day.city?.en) errors.push(`days[${idx}].city.en is required`);
    if (!day.theme?.en) errors.push(`days[${idx}].theme.en is required`);
    if (!Array.isArray(day.stops) || day.stops.length === 0) {
      errors.push(`days[${idx}].stops must be non-empty array`);
    }

    // Validate coordinates
    if (Array.isArray(day.center)) {
      const [lat, lng] = day.center;
      if (lat < -90 || lat > 90) {
        errors.push(`days[${idx}].center latitude ${lat} out of range [-90, 90]`);
      }
      if (lng < -180 || lng > 180) {
        errors.push(`days[${idx}].center longitude ${lng} out of range [-180, 180]`);
      }
    }

    // Validate stops
    if (day.stops) {
      day.stops.forEach((stop, stopIdx) => {
        if (!stop.name?.en) {
          errors.push(`days[${idx}].stops[${stopIdx}].name.en is required`);
        }
        if (stop.lat < -90 || stop.lat > 90) {
          errors.push(`days[${idx}].stops[${stopIdx}].lat out of range`);
        }
        if (stop.lng < -180 || stop.lng > 180) {
          errors.push(`days[${idx}].stops[${stopIdx}].lng out of range`);
        }
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Load a trip template by ID
 * @param {string} tripId - Template identifier (e.g., 'japan-cherry-blossom-2026')
 * @returns {Promise<Object>} - The loaded and validated template data
 * @throws {Error} - If template not found or validation fails
 */
export async function loadTemplate(tripId) {
  const templateUrl = `/templates/${tripId}.json`;

  try {
    const response = await fetch(templateUrl);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Template not found: ${tripId}`);
      }
      throw new Error(`Failed to load template: ${response.statusText}`);
    }

    const template = await response.json();

    // Validate template
    const validation = validateBasic(template);

    if (!validation.valid) {
      const errorList = validation.errors.join('\n• ');
      throw new Error(`Template validation failed for "${tripId}":\n• ${errorList}`);
    }

    // Additional checks
    if (template.metadata.id !== tripId) {
      console.warn(`Warning: Template ID mismatch. Expected "${tripId}", got "${template.metadata.id}"`);
    }

    return template;

  } catch (error) {
    if (error.name === 'SyntaxError') {
      throw new Error(`Invalid JSON in template "${tripId}": ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get template metadata without loading full template
 * Useful for marketplace/catalog views
 */
export async function getTemplateMetadata(tripId) {
  const template = await loadTemplate(tripId);
  return template.metadata;
}

/**
 * List available templates (requires manifest.json)
 */
export async function listTemplates() {
  try {
    const response = await fetch('/templates/manifest.json');
    if (!response.ok) {
      throw new Error('Template manifest not found');
    }
    return await response.json();
  } catch (error) {
    console.warn('No template manifest found. Using default template list.');
    return {
      templates: [
        { id: 'japan-cherry-blossom-2026', title: 'Japan Cherry Blossom 2026' },
        { id: 'paris-week', title: 'Paris Week' },
        { id: 'iceland-ring-road', title: 'Iceland Ring Road' }
      ]
    };
  }
}

/**
 * Show error overlay in UI
 */
export function showErrorOverlay(error, tripId) {
  const overlay = document.createElement('div');
  overlay.id = 'template-error-overlay';
  overlay.innerHTML = `
    <div class="error-content">
      <h2>⚠️ Template Error</h2>
      <p><strong>Failed to load template:</strong> ${tripId || 'unknown'}</p>
      <pre>${error.message || error}</pre>
      <div class="error-actions">
        <button onclick="window.location.href='/'">← Back to Home</button>
        <button onclick="window.location.reload()">↻ Retry</button>
      </div>
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    #template-error-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    }
    .error-content {
      background: #1a1a2e;
      border: 2px solid #ef4444;
      border-radius: 12px;
      padding: 30px;
      max-width: 600px;
      width: 100%;
      color: #e8e8ef;
    }
    .error-content h2 {
      margin-top: 0;
      color: #ef4444;
    }
    .error-content pre {
      background: #0f0f1e;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-size: 0.9em;
      border-left: 3px solid #ef4444;
    }
    .error-actions {
      margin-top: 20px;
      display: flex;
      gap: 10px;
    }
    .error-actions button {
      flex: 1;
      padding: 12px 20px;
      border: none;
      border-radius: 6px;
      background: #6366f1;
      color: white;
      cursor: pointer;
      font-size: 1em;
      transition: background 0.2s;
    }
    .error-actions button:hover {
      background: #4f46e5;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);
}

export default {
  loadTemplate,
  getTemplateMetadata,
  listTemplates,
  showErrorOverlay
};
