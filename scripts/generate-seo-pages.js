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
 * Fetch JSON from URL with promise - improved error handling
 */
function fetchJSON(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        const defaultOptions = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Japan-Trip-Companion/1.0; +https://trip.to)',
                'Accept': 'application/json'
            }
        };

        const requestOptions = { ...defaultOptions, ...options };

        const req = protocol.get(url, requestOptions, (res) => {
            // Handle redirects
            if (res.statusCode === 301 || res.statusCode === 302) {
                fetchJSON(res.headers.location, options).then(resolve).catch(reject);
                return;
            }

            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                return;
            }

            let data = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`JSON parse error: ${e.message}`));
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
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
 * Fetch description from Wikipedia - improved with better error handling
 */
async function fetchWikipediaDescription(cityName) {
    try {
        // Use the correct Wikipedia REST API endpoint
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

        return getFallbackDescription(cityName);
    } catch (error) {
        console.error(`Error fetching Wikipedia data for ${cityName}:`, error.message);
        return getFallbackDescription(cityName);
    }
}

/**
 * Fallback descriptions for each city (high-quality, SEO-optimized)
 */
function getFallbackDescription(cityName) {
    const descriptions = {
        'Tokyo': {
            short: 'Capital city of Japan',
            full: 'Tokyo, officially the Tokyo Metropolis, is the capital and most populous prefecture of Japan. Located at the head of Tokyo Bay, it is a global hub of business, finance, technology, and culture. From ancient temples to cutting-edge skyscrapers, Tokyo seamlessly blends tradition with modernity. Experience world-class dining, vibrant neighborhoods like Shibuya and Shinjuku, and serene gardens in this dynamic metropolis.',
        },
        'Kyoto': {
            short: 'Historic cultural capital of Japan',
            full: 'Kyoto, the ancient capital of Japan for over a millennium, is renowned for its classical Buddhist temples, stunning gardens, imperial palaces, and traditional wooden houses. Home to over 2,000 temples and shrines, including the iconic Fushimi Inari and Kinkaku-ji (Golden Pavilion), Kyoto offers an unparalleled glimpse into traditional Japanese culture. Experience geisha districts, tea ceremonies, and some of Japan\'s most spectacular cherry blossom and autumn foliage viewing spots.',
        },
        'Osaka': {
            short: 'Japan\'s kitchen and vibrant commercial hub',
            full: 'Osaka, Japan\'s third-largest city, is famous for its modern architecture, vibrant nightlife, and hearty street food culture. Known as "Japan\'s Kitchen," Osaka offers culinary delights like takoyaki and okonomiyaki. The city features attractions like Osaka Castle, the bustling Dotonbori district, and Universal Studios Japan. With a reputation for friendly locals and energetic atmosphere, Osaka provides a perfect contrast to Tokyo\'s formality and Kyoto\'s tradition.',
        },
        'Hakone': {
            short: 'Mountain resort town near Mount Fuji',
            full: 'Hakone is a mountainous town in Japan\'s Fuji-Hakone-Izu National Park, renowned for its hot springs resorts (onsen), natural beauty, and museums. On clear days, visitors can enjoy stunning views of nearby Mount Fuji. Hakone offers traditional ryokan accommodations, the scenic Lake Ashi, the Hakone Open-Air Museum, and a historic mountain railway. It\'s a perfect escape from Tokyo, offering relaxation and natural splendor just 90 minutes from the capital.',
        },
        'Nara': {
            short: 'Ancient capital famous for friendly deer',
            full: 'Nara, Japan\'s first permanent capital, is a treasure trove of historical sites including Todai-ji Temple housing a 15-meter bronze Buddha statue. The city\'s most charming feature is Nara Park, where over 1,000 friendly deer roam freely and bow to visitors for food. With eight UNESCO World Heritage Sites, including Kasuga-taisha Shrine with its thousands of lanterns, Nara offers an intimate encounter with Japan\'s ancient past and natural beauty.',
        },
        'Hiroshima': {
            short: 'City of peace and resilience',
            full: 'Hiroshima, rebuilt after the devastating 1945 atomic bombing, stands today as a vibrant city dedicated to peace. The Peace Memorial Park and Museum serve as powerful reminders of the past and hopes for a nuclear-free future. Beyond its historical significance, Hiroshima offers beautiful gardens, the reconstructed Hiroshima Castle, and world-famous okonomiyaki. The nearby island of Miyajima, with its floating torii gate, is easily accessible from the city.',
        },
        'Nikko': {
            short: 'Sacred mountain town with ornate shrines',
            full: 'Nikko, a mountain town in Tochigi Prefecture, is home to Toshogu, Japan\'s most lavishly decorated shrine and the mausoleum of Tokugawa Ieyasu, founder of the Tokugawa shogunate. The town\'s Shrines and Temples of Nikko are UNESCO World Heritage Sites. Surrounded by stunning natural scenery including waterfalls, lakes, and autumn foliage, Nikko offers hiking in Nikko National Park and traditional hot springs. The saying "Never say \'magnificent\' until you\'ve seen Nikko" speaks to its splendor.',
        },
        'Kamakura': {
            short: 'Historic coastal town with Great Buddha',
            full: 'Kamakura, a coastal town south of Tokyo, was Japan\'s political center from 1185-1333. Today, it\'s known for the Great Buddha (Daibutsu), a 13-meter bronze statue dating from 1252, and numerous Zen temples and shrines. The town offers beautiful hiking trails, traditional shopping streets, and beaches. Kamakura\'s laid-back atmosphere and rich history make it a popular day trip from Tokyo, combining cultural sites with coastal scenery.',
        },
        'Takayama': {
            short: 'Beautifully preserved Edo-period town',
            full: 'Takayama, in the mountainous Hida region, preserves a beautifully intact old town with traditional wooden merchant houses. The city is famous for its skilled carpentry, sake breweries, and one of Japan\'s most celebrated festivals held in spring and autumn. Visitors can explore museums, morning markets, and taste Hida beef. The surrounding Japanese Alps offer spectacular scenery, hot springs, and access to traditional thatched-roof villages like Shirakawa-go.',
        },
        'Kanazawa': {
            short: 'Cultural gem with pristine gardens',
            full: 'Kanazawa, on the Sea of Japan coast, escaped war damage and retains its historic districts, including the well-preserved geisha district Higashi Chaya. The city boasts Kenroku-en, considered one of Japan\'s three most beautiful gardens, and the 21st Century Museum of Contemporary Art. Famous for gold leaf production, traditional crafts, and fresh seafood, Kanazawa offers an authentic cultural experience with less crowding than Kyoto.',
        },
        'Fukuoka': {
            short: 'Gateway city to Kyushu',
            full: 'Fukuoka, the largest city on Kyushu Island, is known for its modern architecture, beaches, and renowned food scene, particularly Hakata ramen and fresh seafood from its fish markets. The city offers ancient temples, shopping arcades, and the unique Canal City complex. With excellent connections to other Kyushu destinations and even South Korea, Fukuoka serves as an ideal base for exploring southwestern Japan.',
        },
        'Sapporo': {
            short: 'Northern capital famous for snow and beer',
            full: 'Sapporo, the capital of Hokkaido, is famous for its winter sports, the annual Snow Festival featuring massive ice sculptures, and Sapporo beer. The city offers wide boulevards, parks, and proximity to ski resorts and hot springs. Summer brings the refreshing climate and lavender fields. Sapporo\'s food scene includes fresh seafood, Genghis Khan (grilled mutton), and unique regional ramen.',
        },
        'Yokohama': {
            short: 'Port city with cosmopolitan flair',
            full: 'Yokohama, Japan\'s second-largest city, is a major port with a cosmopolitan atmosphere. Chinatown, Japan\'s largest, offers authentic Chinese cuisine. The futuristic Minato Mirai 21 district features the Landmark Tower with panoramic views, waterfront promenades, museums, and the unique Cup Noodles Museum. Historic Western-style buildings in Motomachi reflect Yokohama\'s role in opening Japan to the world.',
        },
        'Nagoya': {
            short: 'Industrial powerhouse with samurai heritage',
            full: 'Nagoya, Japan\'s fourth-largest city, is an industrial powerhouse and automotive hub home to Toyota. The reconstructed Nagoya Castle showcases the city\'s samurai past. Atsuta Shrine, one of Japan\'s most important Shinto shrines, houses the sacred sword Kusanagi. The city offers excellent museums, shopping, and is a gateway to the historic towns of Takayama and Shirakawa-go.',
        },
        'Kobe': {
            short: 'Sophisticated port city famous for beef',
            full: 'Kobe, a port city framed by mountains and sea, is famous worldwide for its premium marbled beef. The city blends cosmopolitan culture with natural beauty, featuring the scenic Rokko mountain range, Arima Onsen hot springs, and a charming historic Chinatown. The 1995 earthquake led to thoughtful urban renewal. The waterfront area offers modern architecture, shopping, and stunning night views.',
        },
        'Okinawa': {
            short: 'Tropical paradise with unique culture',
            full: 'Okinawa, Japan\'s southernmost prefecture, offers a tropical climate, stunning beaches, and a unique Ryukyuan culture distinct from mainland Japan. The islands feature coral reefs perfect for diving, Shuri Castle (a UNESCO World Heritage Site), and traditional Okinawan cuisine known for its health benefits. The archipelago combines natural beauty with a laid-back island lifestyle and historical significance as the former Ryukyu Kingdom.',
        },
        'Miyajima': {
            short: 'Sacred island with floating torii gate',
            full: 'Miyajima, officially Itsukushima, is a small island near Hiroshima renowned for its giant torii gate appearing to float on water at high tide. Itsukushima Shrine, a UNESCO World Heritage Site, and its vermillion buildings are built over water. The island offers temples, a five-story pagoda, friendly deer, hiking Mount Misen, and maple leaf-shaped cookies (momiji manju). It\'s considered one of Japan\'s three most scenic views.',
        },
        'Kawaguchiko': {
            short: 'Lake resort with Mount Fuji views',
            full: 'Lake Kawaguchiko, one of the Fuji Five Lakes, offers the best views of Mount Fuji reflected in its waters. This resort town provides hot springs, museums, the Fuji-Q Highland amusement park, and the Chureito Pagoda, an iconic photo spot. Outdoor activities include boating, fishing, cycling, and camping. Each season offers unique beauty: cherry blossoms in spring, lavender in summer, and fall foliage framing Japan\'s sacred mountain.',
        },
        'Matsumoto': {
            short: 'Alpine city with original castle',
            full: 'Matsumoto, in the Japanese Alps, is home to Matsumoto Castle, one of Japan\'s few original castles and designated a National Treasure. Its striking black walls have earned it the nickname "Crow Castle." The city serves as a gateway to the Northern Alps and offers museums including the Japan Ukiyo-e Museum. The surrounding area provides hot springs, hiking, and skiing opportunities in stunning mountain scenery.',
        },
        'Nagano': {
            short: '1998 Winter Olympics host in the mountains',
            full: 'Nagano, host of the 1998 Winter Olympics, is a mountain city famous for Zenko-ji Temple, one of Japan\'s most important Buddhist temples. The surrounding area offers world-class skiing, the famous snow monkeys bathing in hot springs at Jigokudani, and scenic hiking trails. The region produces soba noodles and sake, and provides access to traditional post towns along the historic Nakasendo trail.',
        }
    };

    const fallback = descriptions[cityName] || {
        short: `Beautiful destination in Japan`,
        full: `${cityName} is a must-visit destination in Japan, offering unique cultural experiences, stunning landscapes, and unforgettable memories. Whether you're interested in history, nature, cuisine, or modern attractions, ${cityName} has something special to offer every traveler.`
    };

    return {
        ...fallback,
        extract_html: `<p>${fallback.full}</p>`
    };
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

            // Rate limiting - wait 500ms between API calls (faster than before)
            await new Promise(resolve => setTimeout(resolve, 500));
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
    console.log(`  ✓ Real Wikipedia + fallback descriptions (authoritative content)`);
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
