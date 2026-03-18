/**
 * Trip Template Validator
 * Uses Ajv JSON Schema validator with format validation
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load schema
const schemaPath = join(__dirname, 'schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

// Initialize Ajv with strict mode and all errors
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: true
});
addFormats(ajv);

// Compile schema
const validate = ajv.compile(schema);

/**
 * Custom validation for i18n strings
 * Ensures at least 'en' field is present
 */
function validateI18nString(obj, path = '') {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error(`${path}: Expected i18n object, got ${typeof obj}`);
  }
  if (!obj.en) {
    throw new Error(`${path}: Missing required 'en' field in i18n string`);
  }
  return true;
}

/**
 * Check for duplicate stop IDs within a template
 */
function checkDuplicateStopIds(days) {
  const allStopIds = new Set();
  const duplicates = [];

  days.forEach((day, dayIdx) => {
    if (!day.stops) return;

    day.stops.forEach((stop, stopIdx) => {
      const stopId = `${day.id}-${stop.name.en}`;
      if (allStopIds.has(stopId)) {
        duplicates.push({
          day: day.id,
          stop: stop.name.en,
          location: `days[${dayIdx}].stops[${stopIdx}]`
        });
      }
      allStopIds.add(stopId);
    });
  });

  if (duplicates.length > 0) {
    const dupeList = duplicates.map(d => `${d.location}: "${d.stop}"`).join(', ');
    throw new Error(`Duplicate stop IDs found: ${dupeList}`);
  }
}

/**
 * Validate a trip template
 * @param {Object} template - The template object to validate
 * @param {boolean} strict - Whether to perform strict validation (i18n checks, duplicates)
 * @returns {Object} - Validation result { valid: boolean, errors: Array }
 */
export function validateTemplate(template, strict = true) {
  // Basic schema validation
  const valid = validate(template);

  if (!valid) {
    const errors = validate.errors.map(err => ({
      path: err.instancePath || err.dataPath,
      message: err.message,
      keyword: err.keyword,
      params: err.params,
      schemaPath: err.schemaPath
    }));

    return {
      valid: false,
      errors,
      message: formatValidationErrors(errors)
    };
  }

  // Strict validation
  if (strict) {
    try {
      // Check for duplicate stop IDs
      checkDuplicateStopIds(template.days);

      // Validate coordinate ranges (additional check beyond schema)
      template.days.forEach((day, dayIdx) => {
        const [lat, lng] = day.center;
        if (lat < -90 || lat > 90) {
          throw new Error(`days[${dayIdx}].center: Latitude ${lat} out of range [-90, 90]`);
        }
        if (lng < -180 || lng > 180) {
          throw new Error(`days[${dayIdx}].center: Longitude ${lng} out of range [-180, 180]`);
        }

        day.stops.forEach((stop, stopIdx) => {
          if (stop.lat < -90 || stop.lat > 90) {
            throw new Error(`days[${dayIdx}].stops[${stopIdx}]: Latitude ${stop.lat} out of range [-90, 90]`);
          }
          if (stop.lng < -180 || stop.lng > 180) {
            throw new Error(`days[${dayIdx}].stops[${stopIdx}]: Longitude ${stop.lng} out of range [-180, 180]`);
          }
        });
      });
    } catch (err) {
      return {
        valid: false,
        errors: [{ path: 'strict-validation', message: err.message }],
        message: `Strict validation failed: ${err.message}`
      };
    }
  }

  return {
    valid: true,
    errors: [],
    message: 'Template is valid'
  };
}

/**
 * Format validation errors for display
 */
function formatValidationErrors(errors) {
  if (errors.length === 0) return 'No errors';

  const formatted = errors.map(err => {
    let msg = `• ${err.path || 'root'}`;

    if (err.keyword === 'required') {
      msg += `: Missing required field "${err.params.missingProperty}"`;
    } else if (err.keyword === 'type') {
      msg += `: Expected ${err.params.type}, got ${err.message}`;
    } else if (err.keyword === 'pattern') {
      msg += `: ${err.message} (expected pattern: ${err.params.pattern})`;
    } else if (err.keyword === 'enum') {
      msg += `: ${err.message}. Allowed values: ${err.params.allowedValues.join(', ')}`;
    } else if (err.keyword === 'minimum' || err.keyword === 'maximum') {
      msg += `: ${err.message}`;
    } else {
      msg += `: ${err.message}`;
    }

    if (err.schemaPath) {
      msg += ` (schema: ${err.schemaPath})`;
    }

    return msg;
  }).join('\n');

  return `Validation errors:\n${formatted}`;
}

/**
 * CLI validation tool
 * Usage: node lib/validator.js templates/your-template.json
 */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node lib/validator.js <template-file.json>');
    process.exit(1);
  }

  const templatePath = args[0];

  try {
    const templateData = JSON.parse(readFileSync(templatePath, 'utf-8'));
    const result = validateTemplate(templateData, true);

    if (result.valid) {
      console.log('✓ Template is valid!');
      console.log(`  ID: ${templateData.metadata.id}`);
      console.log(`  Title: ${templateData.metadata.title.en}`);
      console.log(`  Destination: ${templateData.metadata.destination.en}`);
      console.log(`  Days: ${templateData.metadata.duration_days}`);
      process.exit(0);
    } else {
      console.error('✗ Template validation failed:');
      console.error(result.message);
      process.exit(1);
    }
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

export default { validateTemplate };
