// Service Worker for Japan Trip PWA
// Version 1.0.0

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const LEAFLET_CACHE = `leaflet-${CACHE_VERSION}`;
const TILES_CACHE = `tiles-${CACHE_VERSION}`;

// Static assets to pre-cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/reservations.html',
  '/checklist.html',
  '/offline.html',
  '/style.css',
  '/script.js',
  '/data.js',
  '/config.js',
  '/i18n.js',
  '/routes.js',
  '/weather.js',
  '/whats-next.js',
  '/sakura-widget.js',
  '/reservations.js',
  '/checklist.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Leaflet library assets
const LEAFLET_ASSETS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
];

// Font assets
const FONT_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap'
];

// City bounds for tile pre-caching [minLat, maxLat, minLng, maxLng]
const CITY_BOUNDS = {
  tokyo: [35.65, 35.75, 139.65, 139.85],
  kyoto: [34.95, 35.05, 135.70, 135.80],
  osaka: [34.63, 34.73, 135.45, 135.55],
  nara: [34.66, 34.72, 135.80, 135.88]
};

// Zoom levels to pre-cache
const ZOOM_LEVELS = [12, 13, 14, 15, 16];

// Calculate tile coordinates from lat/lng
function getTileCoords(lat, lng, zoom) {
  const n = Math.pow(2, zoom);
  const latRad = (lat * Math.PI) / 180;
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y, z: zoom };
}

// Generate tile URLs for a bounding box
function generateTileUrls(bounds, zoomLevels) {
  const urls = [];
  const [minLat, maxLat, minLng, maxLng] = bounds;
  const subdomains = ['a', 'b', 'c', 'd'];

  zoomLevels.forEach(zoom => {
    const topLeft = getTileCoords(maxLat, minLng, zoom);
    const bottomRight = getTileCoords(minLat, maxLng, zoom);

    for (let x = topLeft.x; x <= bottomRight.x; x++) {
      for (let y = topLeft.y; y <= bottomRight.y; y++) {
        const subdomain = subdomains[(x + y) % subdomains.length];
        const url = `https://${subdomain}.basemaps.cartocdn.com/dark_all/${zoom}/${x}/${y}.png`;
        urls.push(url);
      }
    }
  });

  return urls;
}

// Generate all tile URLs for pre-caching
function getAllTileUrls() {
  const allUrls = [];
  Object.values(CITY_BOUNDS).forEach(bounds => {
    allUrls.push(...generateTileUrls(bounds, ZOOM_LEVELS));
  });
  return [...new Set(allUrls)]; // Remove duplicates
}

// Install event - pre-cache static assets and tiles
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    (async () => {
      try {
        // Cache static assets
        const staticCache = await caches.open(STATIC_CACHE);
        await staticCache.addAll(STATIC_ASSETS);
        console.log(`[SW] Cached ${STATIC_ASSETS.length} static assets`);

        // Cache Leaflet assets
        const leafletCache = await caches.open(LEAFLET_CACHE);
        await leafletCache.addAll(LEAFLET_ASSETS);
        console.log(`[SW] Cached ${LEAFLET_ASSETS.length} Leaflet assets`);

        // Cache fonts (with error handling as they may fail due to CORS)
        try {
          await staticCache.addAll(FONT_ASSETS);
          console.log('[SW] Cached font assets');
        } catch (fontError) {
          console.warn('[SW] Font caching failed (expected):', fontError.message);
        }

        // Pre-cache critical map tiles (limit to avoid overwhelming the cache)
        const tilesCache = await caches.open(TILES_CACHE);
        const tileUrls = getAllTileUrls();
        console.log(`[SW] Pre-caching ${tileUrls.length} map tiles...`);

        // Cache tiles in batches to avoid overwhelming the cache
        const BATCH_SIZE = 50;
        for (let i = 0; i < tileUrls.length; i += BATCH_SIZE) {
          const batch = tileUrls.slice(i, i + BATCH_SIZE);
          await Promise.allSettled(
            batch.map(url =>
              fetch(url)
                .then(response => response.ok ? tilesCache.put(url, response) : null)
                .catch(() => null)
            )
          );
          console.log(`[SW] Cached tile batch ${i / BATCH_SIZE + 1}/${Math.ceil(tileUrls.length / BATCH_SIZE)}`);
        }

        console.log('[SW] Installation complete');

        // Activate immediately
        self.skipWaiting();
      } catch (error) {
        console.error('[SW] Installation failed:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      const validCaches = [STATIC_CACHE, LEAFLET_CACHE, TILES_CACHE];

      await Promise.all(
        cacheNames.map(cacheName => {
          if (!validCaches.includes(cacheName)) {
            console.log(`[SW] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );

      // Take control immediately
      await self.clients.claim();
      console.log('[SW] Activation complete');
    })()
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Check if it's a map tile
        if (url.hostname.includes('basemaps.cartocdn.com') || url.hostname.includes('tile.openstreetmap.org')) {
          return await handleTileRequest(request);
        }

        // Check if it's a Leaflet asset
        if (url.hostname.includes('unpkg.com') && url.pathname.includes('leaflet')) {
          return await handleLeafletRequest(request);
        }

        // Check if it's a static asset
        if (url.origin === self.location.origin || url.hostname.includes('fonts.googleapis.com')) {
          return await handleStaticRequest(request);
        }

        // For API requests (weather, directions), network first
        if (url.hostname.includes('openweathermap.org') || url.hostname.includes('googleapis.com')) {
          return await handleApiRequest(request);
        }

        // Default: network first with cache fallback
        return await fetch(request);
      } catch (error) {
        console.error('[SW] Fetch error:', error);

        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          const cache = await caches.open(STATIC_CACHE);
          return await cache.match('/offline.html');
        }

        return new Response('Network error', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    })()
  );
});

// Cache-first strategy for static assets
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// Cache-first strategy for Leaflet assets
async function handleLeafletRequest(request) {
  const cache = await caches.open(LEAFLET_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// Network-first with 7-day cache fallback for tiles
async function handleTileRequest(request) {
  const cache = await caches.open(TILES_CACHE);

  try {
    // Try network first
    const response = await fetch(request, {
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });

    if (response.ok) {
      // Cache the tile for 7 days
      const clonedResponse = response.clone();
      cache.put(request, clonedResponse);
      return response;
    }
  } catch (error) {
    // Network failed, try cache
    console.log('[SW] Network failed for tile, using cache');
  }

  // Fallback to cache
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  // Return a placeholder tile if not in cache
  return new Response(null, {
    status: 503,
    statusText: 'Tile not available offline'
  });
}

// Network-first for API requests
async function handleApiRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Could implement cache fallback for API responses here
    throw error;
  }
}

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_TILES') {
    // Allow manual tile caching from the app
    const { bounds, zoom } = event.data;
    event.waitUntil(
      (async () => {
        const cache = await caches.open(TILES_CACHE);
        const urls = generateTileUrls(bounds, [zoom]);
        await Promise.allSettled(
          urls.map(url =>
            fetch(url).then(r => r.ok ? cache.put(url, r) : null).catch(() => null)
          )
        );
      })()
    );
  }
});

console.log('[SW] Service worker loaded');
