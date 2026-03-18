/**
 * Migration Script: data.js → japan-cherry-blossom-2026.json
 * Converts the existing TRIP_DATA structure to the new template format
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the existing data.js and extract TRIP_DATA
const dataJsPath = join(__dirname, '..', 'data.js');
const dataJsContent = readFileSync(dataJsPath, 'utf-8');

// Extract TRIP_DATA array (simple regex approach)
const match = dataJsContent.match(/const TRIP_DATA = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Could not extract TRIP_DATA from data.js');
  process.exit(1);
}

// Use eval to parse the data (safe since we control the source)
const TRIP_DATA = eval(match[1]);

// Create the new template structure
const template = {
  metadata: {
    id: 'japan-cherry-blossom-2026',
    title: {
      en: 'Japan Cherry Blossom 2026',
      zh: '2026年日本樱花之旅',
      ja: '2026年日本桜ツアー'
    },
    destination: {
      en: 'Tokyo, Kyoto, Osaka, Nara',
      zh: '东京、京都、大阪、奈良',
      ja: '東京、京都、大阪、奈良'
    },
    country: 'JP',
    duration_days: 14,
    season: 'spring',
    tags: ['cherry-blossom', 'cultural', 'food-tour', 'temples', 'modern-traditional'],
    last_updated: '2026-03-18'
  },
  geography: {
    default_center: [35.6762, 139.6503],
    default_zoom: 12
  },
  days: TRIP_DATA
};

// Write the template
const outputPath = join(__dirname, '..', 'templates', 'japan-cherry-blossom-2026.json');
writeFileSync(outputPath, JSON.stringify(template, null, 2));

console.log('✓ Successfully migrated data.js to japan-cherry-blossom-2026.json');
console.log(`  Output: ${outputPath}`);
console.log(`  Days: ${template.days.length}`);
console.log(`  Total stops: ${template.days.reduce((sum, day) => sum + day.stops.length, 0)}`);
