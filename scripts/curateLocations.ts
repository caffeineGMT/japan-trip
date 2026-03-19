/**
 * Location Curation Script
 *
 * This script helps curate and enrich the locations database.
 * It can:
 * 1. Validate existing locations against the Zod schema
 * 2. Output a CSV for manual review
 * 3. Optionally query Google Places API to seed new locations
 *
 * Usage:
 *   npx ts-node scripts/curateLocations.ts validate    - Validate locations.json
 *   npx ts-node scripts/curateLocations.ts csv         - Export to CSV for review
 *   npx ts-node scripts/curateLocations.ts stats       - Show database statistics
 *   npx ts-node scripts/curateLocations.ts fetch       - Fetch from Google Places API (requires GOOGLE_PLACES_API_KEY)
 */

import * as fs from 'fs';
import * as path from 'path';
import { LocationsArraySchema, type Location } from '../lib/locationSchema';
import { randomUUID } from 'crypto';

const DATA_PATH = path.join(__dirname, '..', 'data', 'locations.json');

function loadLocations(): unknown[] {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function validate() {
  console.log('Validating locations.json...\n');
  const data = loadLocations();

  const result = LocationsArraySchema.safeParse(data);
  if (result.success) {
    console.log(`Valid! ${result.data.length} locations pass schema validation.`);
    return result.data;
  } else {
    console.error('Validation errors:');
    for (const issue of result.error.issues) {
      console.error(`  [${issue.path.join('.')}] ${issue.message}`);
    }
    process.exit(1);
  }
}

function exportCsv() {
  const locations = validate();
  const csvPath = path.join(__dirname, '..', 'data', 'locations-review.csv');

  const headers = [
    'id', 'name_en', 'name_ja', 'name_zh', 'lat', 'lng',
    'category', 'subcategory', 'averageCost', 'cherryBlossomRating',
    'spring', 'summer', 'fall', 'winter', 'description_en',
  ];

  const rows = locations.map((loc) => [
    loc.id,
    `"${loc.name_en}"`,
    `"${loc.name_ja}"`,
    `"${loc.name_zh}"`,
    loc.coords.lat,
    loc.coords.lng,
    loc.category,
    loc.subcategory,
    loc.averageCost,
    loc.cherryBlossomRating ?? '',
    loc.seasonalRating.spring,
    loc.seasonalRating.summer,
    loc.seasonalRating.fall,
    loc.seasonalRating.winter,
    `"${loc.description.en.replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  fs.writeFileSync(csvPath, csv);
  console.log(`\nExported ${locations.length} locations to ${csvPath}`);
}

function showStats() {
  const locations = validate();

  const categories = new Map<string, number>();
  const subcategories = new Map<string, number>();
  const cities = new Map<string, number>();

  for (const loc of locations) {
    categories.set(loc.category, (categories.get(loc.category) || 0) + 1);
    subcategories.set(loc.subcategory, (subcategories.get(loc.subcategory) || 0) + 1);

    // Rough city detection from coordinates
    let city = 'Other';
    const { lat, lng } = loc.coords;
    if (lat > 35.5 && lat < 35.9 && lng > 139.4 && lng < 140.0) city = 'Tokyo';
    else if (lat > 34.9 && lat < 35.1 && lng > 135.7 && lng < 135.85) city = 'Kyoto';
    else if (lat > 34.6 && lat < 34.75 && lng > 135.4 && lng < 135.6) city = 'Osaka';
    else if (lat > 34.65 && lat < 34.72 && lng > 135.75 && lng < 135.85) city = 'Nara';
    else if (lat > 34.35 && lat < 34.45 && lng > 132.4 && lng < 132.5) city = 'Hiroshima';
    else if (lat > 35.2 && lat < 35.3 && lng > 139.0 && lng < 139.1) city = 'Hakone';
    else if (lat > 42.9 && lat < 43.2 && lng > 141.2 && lng < 141.5) city = 'Sapporo';
    else if (lat > 33.5 && lat < 33.7 && lng > 130.3 && lng < 130.5) city = 'Fukuoka';
    else if (lat > 34.65 && lat < 34.72 && lng > 135.15 && lng < 135.25) city = 'Kobe';
    cities.set(city, (cities.get(city) || 0) + 1);
  }

  console.log('\n--- Location Database Stats ---');
  console.log(`Total locations: ${locations.length}`);
  console.log('\nBy category:');
  for (const [cat, count] of [...categories.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log('\nBy subcategory (top 15):');
  const sortedSubs = [...subcategories.entries()].sort((a, b) => b[1] - a[1]);
  for (const [sub, count] of sortedSubs.slice(0, 15)) {
    console.log(`  ${sub}: ${count}`);
  }
  console.log('\nBy city:');
  for (const [city, count] of [...cities.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${city}: ${count}`);
  }

  const sakuraSpots = locations.filter(
    (l) => l.cherryBlossomRating !== null && l.cherryBlossomRating >= 3
  );
  console.log(`\nCherry blossom spots (rating >= 3): ${sakuraSpots.length}`);

  const avgCost = locations.reduce((sum, l) => sum + l.averageCost, 0) / locations.length;
  console.log(`Average cost: ¥${Math.round(avgCost)}`);
}

async function fetchFromGooglePlaces() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error('Error: GOOGLE_PLACES_API_KEY environment variable is required.');
    console.log('Set it with: export GOOGLE_PLACES_API_KEY=your-api-key');
    console.log('\nFor now, the database uses manually curated data.');
    process.exit(1);
  }

  const categories = [
    { type: 'restaurant', keyword: 'ramen', category: 'food' as const, subcategory: 'ramen' },
    { type: 'restaurant', keyword: 'sushi', category: 'food' as const, subcategory: 'sushi' },
    { type: 'restaurant', keyword: 'tempura', category: 'food' as const, subcategory: 'tempura' },
    { type: 'restaurant', keyword: 'yakitori', category: 'food' as const, subcategory: 'yakitori' },
    { type: 'tourist_attraction', keyword: 'temple', category: 'culture' as const, subcategory: 'temple' },
    { type: 'tourist_attraction', keyword: 'shrine', category: 'culture' as const, subcategory: 'shrine' },
    { type: 'museum', keyword: 'museum', category: 'culture' as const, subcategory: 'museum' },
    { type: 'park', keyword: 'park garden', category: 'nature' as const, subcategory: 'park' },
    { type: 'spa', keyword: 'onsen hot spring', category: 'nature' as const, subcategory: 'onsen' },
    { type: 'bar', keyword: 'bar', category: 'nightlife' as const, subcategory: 'bar' },
  ];

  const cities = [
    { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
    { lat: 35.0116, lng: 135.7681, name: 'Kyoto' },
    { lat: 34.6937, lng: 135.5023, name: 'Osaka' },
    { lat: 33.5904, lng: 130.4017, name: 'Fukuoka' },
    { lat: 43.0618, lng: 141.3545, name: 'Sapporo' },
  ];

  const newLocations: Location[] = [];

  for (const city of cities) {
    for (const cat of categories) {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${city.lat},${city.lng}&radius=10000&type=${cat.type}&keyword=${cat.keyword}&key=${apiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results) {
          for (const place of data.results.slice(0, 10)) {
            newLocations.push({
              id: randomUUID(),
              name_en: place.name,
              name_ja: place.name, // Would need Google Translate API for proper translation
              name_zh: place.name, // Would need Google Translate API for proper translation
              coords: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
              },
              category: cat.category,
              subcategory: cat.subcategory,
              description: {
                en: place.vicinity || `${cat.subcategory} in ${city.name}`,
                ja: `${city.name}の${cat.subcategory}`,
                zh: `${city.name}的${cat.subcategory}`,
              },
              photos: [],
              averageCost: place.price_level ? place.price_level * 1500 : 1000,
              seasonalRating: { spring: 4, summer: 3, fall: 4, winter: 3 },
              cherryBlossomRating: null,
            });
          }
        }
      } catch (err) {
        console.error(`Failed to fetch ${cat.keyword} in ${city.name}:`, err);
      }
    }
  }

  // Merge with existing
  let existing: Location[] = [];
  try {
    existing = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  } catch {
    // No existing file
  }

  const merged = [...existing, ...newLocations];
  fs.writeFileSync(DATA_PATH, JSON.stringify(merged, null, 2));
  console.log(`Added ${newLocations.length} locations from Google Places API.`);
  console.log(`Total: ${merged.length} locations.`);
  console.log('\nRun "npx ts-node scripts/curateLocations.ts csv" to review before committing.');
}

// CLI
const command = process.argv[2] || 'stats';

switch (command) {
  case 'validate':
    validate();
    break;
  case 'csv':
    exportCsv();
    break;
  case 'stats':
    showStats();
    break;
  case 'fetch':
    fetchFromGooglePlaces();
    break;
  default:
    console.log('Usage: npx ts-node scripts/curateLocations.ts [validate|csv|stats|fetch]');
}
