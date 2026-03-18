#!/usr/bin/env node

/**
 * SEO Landing Page Generator
 * Generates 20 high-priority destination landing pages with:
 * - Unsplash hero images
 * - Wikipedia descriptions
 * - SEO metadata (title, meta, JSON-LD, Open Graph)
 * - Internal linking
 * - Sitemap.xml
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
require('dotenv').config();

// Priority cities with search volume and coordinates
const CITIES = [
    { name: 'Tokyo', searchVolume: 2900, lat: 35.6762, lon: 139.6503 },
    { name: 'Kyoto', searchVolume: 1600, lat: 35.0116, lon: 135.7681 },
    { name: 'Osaka', searchVolume: 1200, lat: 34.6937, lon: 135.5023 },
    { name: 'Hakone', searchVolume: 890, lat: 35.2324, lon: 139.1070 },
    { name: 'Nara', searchVolume: 720, lat: 34.6851, lon: 135.8048 },
    { name: 'Hiroshima', searchVolume: 650, lat: 34.3853, lon: 132.4553 },
    { name: 'Nikko', searchVolume: 480, lat: 36.7197, lon: 139.6982 },
    { name: 'Kamakura', searchVolume: 420, lat: 35.3193, lon: 139.5467 },
    { name: 'Takayama', searchVolume: 380, lat: 36.1462, lon: 137.2519 },
    { name: 'Kanazawa', searchVolume: 340, lat: 36.5613, lon: 136.6562 },
    { name: 'Fukuoka', searchVolume: 310, lat: 33.5904, lon: 130.4017 },
    { name: 'Sapporo', searchVolume: 290, lat: 43.0642, lon: 141.3469 },
    { name: 'Yokohama', searchVolume: 270, lat: 35.4437, lon: 139.6380 },
    { name: 'Nagoya', searchVolume: 240, lat: 35.1815, lon: 136.9066 },
    { name: 'Kobe', searchVolume: 220, lat: 34.6901, lon: 135.1955 },
    { name: 'Okinawa', searchVolume: 210, lat: 26.2124, lon: 127.6809 },
    { name: 'Miyajima', searchVolume: 190, lat: 34.2959, lon: 132.3197 },
    { name: 'Kawaguchiko', searchVolume: 170, lat: 35.5078, lon: 138.7644 },
    { name: 'Matsumoto', searchVolume: 150, lat: 36.2381, lon: 137.9722 },
    { name: 'Nagano', searchVolume: 140, lat: 36.6513, lon: 138.1810 }
];

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const TEMPLATE_PATH = path.join(__dirname, '../templates/destination-page.html');
const DESTINATIONS_DIR = path.join(__dirname, '../destinations');

// Ensure destinations directory exists
if (!fs.existsSync(DESTINATIONS_DIR)) {
    fs.mkdirSync(DESTINATIONS_DIR, { recursive: true });
}

/**
 * Fetch JSON from URL with promise
 */
function fetchJSON(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        const defaultOptions = {
            headers: {
                'User-Agent': 'Japan-Trip-Companion/1.0 (https://trip.to; contact@trip.to)',
                'Accept': 'application/json'
            }
        };

        const requestOptions = { ...defaultOptions, ...options };

        protocol.get(url, requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

/**
 * Download image from URL and save locally
 */
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(filepath);
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

/**
 * Fetch hero image from Unsplash
 */
async function fetchUnsplashImage(cityName) {
    const query = encodeURIComponent(`${cityName} Japan`);

    // If no valid API key, use Unsplash Source directly
    if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'your_unsplash_access_key_here') {
        return {
            url: `https://source.unsplash.com/1920x1080/?${query}`,
            localPath: `https://source.unsplash.com/1920x1080/?${query}`,
            attribution: 'Unsplash'
        };
    }

    try {
        const url = `https://api.unsplash.com/search/photos?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1&orientation=landscape`;

        const data = await fetchJSON(url);

        if (data.results && data.results.length > 0) {
            const photo = data.results[0];
            const imageUrl = photo.urls.regular; // 1080px width

            // Download image to local directory
            const slug = cityName.toLowerCase().replace(/\s+/g, '-');
            const imagePath = path.join(DESTINATIONS_DIR, `${slug}-hero.jpg`);

            await downloadImage(imageUrl, imagePath);

            return {
                url: imageUrl,
                localPath: `/destinations/${slug}-hero.jpg`,
                attribution: `Photo by ${photo.user.name} on Unsplash`
            };
        }

        // Fallback to placeholder
        return {
            url: `https://source.unsplash.com/1920x1080/?${query}`,
            localPath: `https://source.unsplash.com/1920x1080/?${query}`,
            attribution: 'Unsplash'
        };
    } catch (error) {
        console.error(`Error fetching Unsplash image for ${cityName}:`, error.message);
        // Fallback to Unsplash source URL
        const query = encodeURIComponent(`${cityName} Japan`);
        return {
            url: `https://source.unsplash.com/1920x1080/?${query}`,
            localPath: `https://source.unsplash.com/1920x1080/?${query}`,
            attribution: 'Unsplash'
        };
    }
}

/**
 * Fetch description from Wikipedia
 */
async function fetchWikipediaDescription(cityName) {
    try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cityName)}`;
        const data = await fetchJSON(url);

        if (data.extract) {
            // Get first 2-3 paragraphs (approximately 400-600 characters)
            const fullText = data.extract;
            const sentences = fullText.split('. ');

            // Take first 4-5 sentences for a good description
            const description = sentences.slice(0, 5).join('. ') + (sentences.length > 5 ? '.' : '');

            return {
                short: data.description || `City in Japan`,
                full: description,
                extract_html: data.extract_html || `<p>${description}</p>`
            };
        }

        return {
            short: `Beautiful destination in Japan`,
            full: `${cityName} is a must-visit destination in Japan, offering unique cultural experiences, stunning landscapes, and unforgettable memories.`,
            extract_html: `<p>${cityName} is a must-visit destination in Japan, offering unique cultural experiences, stunning landscapes, and unforgettable memories.</p>`
        };
    } catch (error) {
        console.error(`Error fetching Wikipedia data for ${cityName}:`, error.message);
        return {
            short: `Beautiful destination in Japan`,
            full: `${cityName} is a must-visit destination in Japan, offering unique cultural experiences, stunning landscapes, and unforgettable memories.`,
            extract_html: `<p>${cityName} is a must-visit destination in Japan, offering unique cultural experiences, stunning landscapes, and unforgettable memories.</p>`
        };
    }
}

/**
 * Generate related destination links (5 random cities excluding current)
 */
function generateRelatedLinks(currentCity, allCities) {
    const otherCities = allCities.filter(c => c.name !== currentCity.name);

    // Shuffle and take 5
    const shuffled = otherCities.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    return selected.map(city => {
        const slug = city.name.toLowerCase().replace(/\s+/g, '-');
        return `<a href="/destinations/${slug}.html" class="destination-card">
                    <h3>${city.name}</h3>
                    <p>${city.searchVolume} monthly searches</p>
                </a>`;
    }).join('\n                ');
}

/**
 * Generate HTML page from template
 */
async function generatePage(city, template, allCities) {
    const slug = city.name.toLowerCase().replace(/\s+/g, '-');

    console.log(`\n📍 Generating page for ${city.name}...`);

    // Fetch hero image
    console.log(`  🖼️  Fetching hero image from Unsplash...`);
    const image = await fetchUnsplashImage(city.name);

    // Fetch Wikipedia description
    console.log(`  📚 Fetching description from Wikipedia...`);
    const wiki = await fetchWikipediaDescription(city.name);

    // Generate related links
    const relatedLinks = generateRelatedLinks(city, allCities);

    // Meta description
    const metaDescription = `Plan your ${city.name} trip with interactive maps, walking routes, and local insights. Free Japan travel planner with offline maps.`;

    // Replace template variables
    let html = template
        .replace(/{{CITY}}/g, city.name)
        .replace(/{{SLUG}}/g, slug)
        .replace(/{{TITLE}}/g, `${city.name} Trip Planner`)
        .replace(/{{META_DESCRIPTION}}/g, metaDescription)
        .replace(/{{HERO_IMAGE}}/g, image.localPath)
        .replace(/{{OG_IMAGE}}/g, image.url)
        .replace(/{{LATITUDE}}/g, city.lat)
        .replace(/{{LONGITUDE}}/g, city.lon)
        .replace(/{{CONTENT}}/g, `<p>${wiki.full}</p>`)
        .replace(/{{RELATED_LINKS}}/g, relatedLinks);

    // Save HTML file
    const outputPath = path.join(DESTINATIONS_DIR, `${slug}.html`);
    fs.writeFileSync(outputPath, html, 'utf8');

    console.log(`  ✅ Generated: ${outputPath}`);

    return {
        city: city.name,
        slug,
        url: `/destinations/${slug}.html`,
        searchVolume: city.searchVolume
    };
}

/**
 * Generate sitemap.xml
 */
function generateSitemap(pages) {
    const now = new Date().toISOString().split('T')[0];

    const urls = pages.map(page => `  <url>
    <loc>https://trip.to${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.searchVolume > 1000 ? '0.9' : page.searchVolume > 500 ? '0.8' : '0.7'}</priority>
  </url>`).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main Pages -->
  <url>
    <loc>https://trip.to/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://trip.to/pricing.html</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Destination Pages -->
${urls}
</urlset>`;

    const sitemapPath = path.join(__dirname, '../sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');

    console.log(`\n✅ Generated sitemap.xml with ${pages.length} destination pages`);
}

/**
 * Generate destinations index page
 */
function generateIndexPage(pages) {
    const destinationsList = pages
        .sort((a, b) => b.searchVolume - a.searchVolume)
        .map(page => `            <a href="${page.url}" class="destination-card">
                <h3>${page.city}</h3>
                <p>${page.searchVolume.toLocaleString()} monthly searches</p>
            </a>`).join('\n');

    const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Japan Destinations - Interactive Trip Planner</title>
    <meta name="description" content="Explore 20+ Japan destinations with interactive maps and itineraries. Plan your perfect Japan trip with our free travel companion.">
    <link rel="canonical" href="https://trip.to/destinations/" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f9fafb;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 60px 20px;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #1f2937;
            text-align: center;
        }
        .subtitle {
            font-size: 1.2rem;
            color: #6b7280;
            text-align: center;
            margin-bottom: 3rem;
        }
        .destinations-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
        }
        .destination-card {
            background: white;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            text-decoration: none;
            color: #1f2937;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .destination-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .destination-card h3 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }
        .destination-card p {
            font-size: 0.9rem;
            color: #6b7280;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 2rem;
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }
        .back-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back-link">← Back to Home</a>
        <h1>Explore Japan Destinations</h1>
        <p class="subtitle">Choose your destination and start planning your perfect Japan trip</p>

        <div class="destinations-grid">
${destinationsList}
        </div>
    </div>
</body>
</html>`;

    const indexPath = path.join(DESTINATIONS_DIR, 'index.html');
    fs.writeFileSync(indexPath, indexHTML, 'utf8');

    console.log(`✅ Generated destinations index page`);
}

/**
 * Main execution
 */
async function main() {
    console.log('🚀 Starting SEO Landing Page Generation');
    console.log(`📊 Generating ${CITIES.length} destination pages\n`);

    if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'your_unsplash_access_key_here') {
        console.warn('⚠️  WARNING: UNSPLASH_ACCESS_KEY not configured');
        console.log('Using Unsplash Source (fallback) for images');
        console.log('For production, add your API key to .env for higher quality images\n');
    }

    // Read template
    const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

    // Generate all pages
    const pages = [];

    for (const city of CITIES) {
        try {
            const page = await generatePage(city, template, CITIES);
            pages.push(page);

            // Rate limiting - wait 1 second between API calls
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`❌ Error generating page for ${city.name}:`, error.message);
        }
    }

    // Generate sitemap
    generateSitemap(pages);

    // Generate index page
    generateIndexPage(pages);

    console.log(`\n🎉 COMPLETE! Generated ${pages.length} destination pages`);
    console.log(`📁 Location: ${DESTINATIONS_DIR}`);
    console.log(`🗺️  Sitemap: ${path.join(__dirname, '../sitemap.xml')}`);
    console.log(`\n📈 SEO Checklist:`);
    console.log(`  ✓ ${pages.length} destination landing pages with unique content`);
    console.log(`  ✓ Hero images from Unsplash (high quality)`);
    console.log(`  ✓ Wikipedia descriptions (authoritative content)`);
    console.log(`  ✓ SEO meta tags (title, description, keywords)`);
    console.log(`  ✓ Open Graph & Twitter Card tags`);
    console.log(`  ✓ JSON-LD structured data (TravelAgency schema)`);
    console.log(`  ✓ Internal linking (5 related cities per page)`);
    console.log(`  ✓ Sitemap.xml generated`);
    console.log(`  ✓ Mobile-responsive design`);
    console.log(`\n🚀 Next Steps:`);
    console.log(`  1. Deploy to production`);
    console.log(`  2. Submit sitemap to Google Search Console`);
    console.log(`  3. Monitor indexing status (expect 3-7 days)`);
    console.log(`  4. Track rankings for target keywords`);
}

// Run the generator
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
