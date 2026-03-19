import { NextRequest, NextResponse } from 'next/server';
import { buildIndex, search, filterByCategory, filterBySeason } from '@/lib/searchLocations';
import type { Location } from '@/lib/locationSchema';

let initialized = false;

async function ensureIndex() {
  if (initialized) return;

  try {
    const fs = await import('fs');
    const path = await import('path');
    const dataPath = path.join(process.cwd(), 'data', 'locations.json');
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const locations: Location[] = JSON.parse(raw);
    buildIndex(locations);
    initialized = true;
  } catch (err) {
    console.error('Failed to load locations:', err);
    throw new Error('Location index unavailable');
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureIndex();
  } catch {
    return NextResponse.json({ error: 'Search index not available' }, { status: 503 });
  }

  const { searchParams } = request.nextUrl;
  const q = searchParams.get('q') || '';
  const lang = (searchParams.get('lang') as 'en' | 'ja' | 'zh') || 'en';
  const category = searchParams.get('category') as Location['category'] | null;
  const season = searchParams.get('season') as 'spring' | 'summer' | 'fall' | 'winter' | null;
  const minCost = searchParams.get('minCost');
  const maxCost = searchParams.get('maxCost');
  const minCherryBlossom = searchParams.get('minCherryBlossom');
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  // Simple category/season listing without query
  if (!q && category && !season) {
    const results = filterByCategory(category);
    return NextResponse.json({ results: results.slice(0, limit), total: results.length });
  }
  if (!q && season && !category) {
    const results = filterBySeason(season);
    return NextResponse.json({ results: results.slice(0, limit), total: results.length });
  }

  const filters = {
    ...(category ? { category } : {}),
    ...(season ? { season } : {}),
    ...(minCost ? { minCost: parseInt(minCost, 10) } : {}),
    ...(maxCost ? { maxCost: parseInt(maxCost, 10) } : {}),
    ...(minCherryBlossom ? { minCherryBlossom: parseInt(minCherryBlossom, 10) } : {}),
  };

  const results = search(q, lang, Object.keys(filters).length > 0 ? filters : undefined, limit);

  return NextResponse.json({ results, total: results.length });
}
