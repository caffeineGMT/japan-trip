import MiniSearch, { SearchResult } from 'minisearch';
import type { Location } from './locationSchema';

let searchIndex: MiniSearch<Location> | null = null;
let locationsData: Location[] = [];

export function buildIndex(locations: Location[]): MiniSearch<Location> {
  locationsData = locations;

  const miniSearch = new MiniSearch<Location>({
    fields: ['name_en', 'name_ja', 'name_zh', 'desc_en', 'desc_ja', 'desc_zh', 'subcategory'],
    storeFields: ['id'],
    searchOptions: {
      boost: { name_en: 3, name_ja: 3, name_zh: 3, subcategory: 2 },
      fuzzy: 0.2,
      prefix: true,
    },
    extractField: (doc: Location & Record<string, unknown>, fieldName: string) => {
      if (fieldName === 'desc_en') return doc.description.en;
      if (fieldName === 'desc_ja') return doc.description.ja;
      if (fieldName === 'desc_zh') return doc.description.zh;
      return (doc as Record<string, unknown>)[fieldName] as string;
    },
  });

  miniSearch.addAll(locations);
  searchIndex = miniSearch;
  return miniSearch;
}

export interface SearchFilters {
  category?: Location['category'];
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  minCost?: number;
  maxCost?: number;
  minCherryBlossom?: number;
}

export function search(
  query: string,
  lang: 'en' | 'ja' | 'zh' = 'en',
  filters?: SearchFilters,
  limit: number = 20
): Location[] {
  if (!searchIndex || locationsData.length === 0) {
    throw new Error('Search index not built. Call buildIndex() first.');
  }

  let results: Location[];

  if (query.trim()) {
    const boostFields: Record<string, number> = {};
    if (lang === 'ja') {
      boostFields['name_ja'] = 5;
      boostFields['desc_ja'] = 3;
    } else if (lang === 'zh') {
      boostFields['name_zh'] = 5;
      boostFields['desc_zh'] = 3;
    } else {
      boostFields['name_en'] = 5;
      boostFields['desc_en'] = 3;
    }

    const searchResults: SearchResult[] = searchIndex.search(query, {
      boost: boostFields,
      fuzzy: 0.2,
      prefix: true,
    });

    const resultIds = new Set(searchResults.map((r) => r.id));
    results = locationsData.filter((loc) => resultIds.has(loc.id));

    // Preserve search ranking order
    const idOrder = new Map(searchResults.map((r, i) => [r.id, i]));
    results.sort((a, b) => (idOrder.get(a.id) ?? 999) - (idOrder.get(b.id) ?? 999));
  } else {
    results = [...locationsData];
  }

  // Apply filters
  if (filters) {
    results = applyFilters(results, filters);
  }

  // Boost seasonal relevance if season filter is set
  if (filters?.season) {
    results.sort((a, b) => {
      const seasonA = a.seasonalRating[filters.season!];
      const seasonB = b.seasonalRating[filters.season!];
      return seasonB - seasonA;
    });
  }

  return results.slice(0, limit);
}

function applyFilters(locations: Location[], filters: SearchFilters): Location[] {
  return locations.filter((loc) => {
    if (filters.category && loc.category !== filters.category) return false;
    if (filters.minCost !== undefined && loc.averageCost < filters.minCost) return false;
    if (filters.maxCost !== undefined && loc.averageCost > filters.maxCost) return false;
    if (
      filters.minCherryBlossom !== undefined &&
      (loc.cherryBlossomRating === null || loc.cherryBlossomRating < filters.minCherryBlossom)
    )
      return false;
    return true;
  });
}

export function filterByCategory(category: Location['category']): Location[] {
  return locationsData.filter((loc) => loc.category === category);
}

export function filterBySeason(season: 'spring' | 'summer' | 'fall' | 'winter'): Location[] {
  return [...locationsData].sort(
    (a, b) => b.seasonalRating[season] - a.seasonalRating[season]
  );
}

export function getLocationById(id: string): Location | undefined {
  return locationsData.find((loc) => loc.id === id);
}

export function serializeIndex(): string | null {
  if (!searchIndex) return null;
  return JSON.stringify(searchIndex);
}

export function loadSerializedIndex(
  serialized: string,
  locations: Location[]
): MiniSearch<Location> {
  locationsData = locations;
  searchIndex = MiniSearch.loadJSON<Location>(serialized, {
    fields: ['name_en', 'name_ja', 'name_zh', 'desc_en', 'desc_ja', 'desc_zh', 'subcategory'],
    storeFields: ['id'],
  });
  return searchIndex;
}
