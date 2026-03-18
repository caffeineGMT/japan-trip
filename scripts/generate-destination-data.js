const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Unsplash API access key - get from https://unsplash.com/developers
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'YOUR_UNSPLASH_ACCESS_KEY';

async function fetchUnsplashImage(query) {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (!response.ok) {
      console.warn(`Unsplash API error for "${query}": ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const photo = data.results[0];
      return {
        url: photo.urls.regular,
        urlFull: photo.urls.full,
        urlThumb: photo.urls.thumb,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        downloadUrl: photo.links.download_location
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching Unsplash image for "${query}":`, error.message);
    return null;
  }
}

async function fetchWikipediaSummary(pageId) {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageId)}`
    );

    if (!response.ok) {
      console.warn(`Wikipedia API error for "${pageId}": ${response.status}`);
      return null;
    }

    const data = await response.json();
    return {
      title: data.title,
      extract: data.extract,
      description: data.description || '',
      thumbnailUrl: data.thumbnail ? data.thumbnail.source : null,
      pageUrl: data.content_urls ? data.content_urls.desktop.page : null
    };
  } catch (error) {
    console.error(`Error fetching Wikipedia summary for "${pageId}":`, error.message);
    return null;
  }
}

async function generateDestinationData() {
  const inputPath = path.join(__dirname, '../src/data/destinations.json');
  const outputPath = path.join(__dirname, '../src/data/destinations-enriched.json');

  console.log('Reading destinations data...');
  const destinations = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  console.log(`Processing ${destinations.length} destinations...`);

  const enrichedDestinations = [];

  for (let i = 0; i < destinations.length; i++) {
    const dest = destinations[i];
    console.log(`\n[${i + 1}/${destinations.length}] Processing ${dest.name}...`);

    // Fetch Unsplash image
    console.log(`  Fetching Unsplash image for "${dest.unsplashQuery}"...`);
    const imageData = await fetchUnsplashImage(dest.unsplashQuery);

    // Fetch Wikipedia summary
    console.log(`  Fetching Wikipedia summary for "${dest.wikiPageId}"...`);
    const wikiData = await fetchWikipediaSummary(dest.wikiPageId);

    // Add rate limiting delay to respect API limits
    await new Promise(resolve => setTimeout(resolve, 1000));

    enrichedDestinations.push({
      ...dest,
      image: imageData,
      wikipedia: wikiData
    });
  }

  console.log(`\n\nWriting enriched data to ${outputPath}...`);
  fs.writeFileSync(outputPath, JSON.stringify(enrichedDestinations, null, 2));

  console.log('\n✅ Done! Enriched destination data saved.');
  console.log(`\nSuccessfully enriched: ${enrichedDestinations.filter(d => d.image && d.wikipedia).length}/${destinations.length} destinations`);

  // Also update the base destinations.json with the enriched data
  fs.writeFileSync(inputPath, JSON.stringify(enrichedDestinations, null, 2));
  console.log('✅ Updated src/data/destinations.json with enriched data');
}

// Run if executed directly
if (require.main === module) {
  if (UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
    console.warn('\n⚠️  WARNING: UNSPLASH_ACCESS_KEY not set!');
    console.warn('Set it via: export UNSPLASH_ACCESS_KEY=your_key_here\n');
    console.log('Proceeding anyway - images will be marked as unavailable.\n');
  }

  generateDestinationData().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { fetchUnsplashImage, fetchWikipediaSummary, generateDestinationData };
