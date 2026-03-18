# Save to Japan Trip - Chrome Extension

Save places from Google Maps, TripAdvisor, and Airbnb directly to your Japan Trip itinerary with one click!

## Features

- **One-Click Save**: Add places to your trip planner instantly
- **Multi-Platform Support**: Works on Google Maps, TripAdvisor, and Airbnb
- **Smart Data Extraction**: Automatically captures place name, location, rating, and description
- **Usage Analytics**: Track how many places you've saved
- **Beautiful UI**: Seamless integration that matches each platform's design

## Installation

### From Source (Developer Mode)

1. **Clone the repository** (or navigate to the chrome-extension folder):
   ```bash
   cd chrome-extension
   ```

2. **Open Chrome Extensions Page**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)

3. **Load the Extension**:
   - Click "Load unpacked"
   - Select the `chrome-extension` folder

4. **Pin the Extension** (optional):
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Save to Japan Trip"
   - Click the pin icon

### From Chrome Web Store (Coming Soon)

Search for "Save to Japan Trip" in the [Chrome Web Store](https://chrome.google.com/webstore/).

## Usage

1. **Browse for Places**:
   - Visit Google Maps, TripAdvisor, or Airbnb
   - Search for places in Japan (or anywhere!)

2. **Save to Trip**:
   - Open any place/listing detail page
   - Look for the "Save to Japan Trip" button
   - Click it to save the place

3. **Manage Your Saves**:
   - Visit [japan-trip-companion.vercel.app/saved-places](https://japan-trip-companion.vercel.app/saved-places)
   - View all saved places
   - Mark places as added to itinerary
   - Delete places you don't need

## Supported Platforms

| Platform | Supported | Features |
|----------|-----------|----------|
| **Google Maps** | ✅ | Name, coordinates, category, address, rating |
| **TripAdvisor** | ✅ | Name, coordinates, category, description, rating |
| **Airbnb** | ✅ | Name, location, type, rating, description |

## Privacy & Data

- **Local Storage Only**: Your saved count and preferences are stored locally in your browser
- **Secure API**: All saved places are sent via HTTPS to your trip planner
- **No Tracking**: We don't track your browsing or sell your data
- **Open Source**: Full source code available for review

## Development

### Project Structure

```
chrome-extension/
├── manifest.json              # Extension configuration
├── background.js              # Service worker (API communication)
├── content-google-maps.js     # Google Maps integration
├── content-tripadvisor.js     # TripAdvisor integration
├── content-airbnb.js          # Airbnb integration
├── popup.html                 # Extension popup UI
├── popup.js                   # Popup logic
├── styles.css                 # Shared styles
└── icons/                     # Extension icons
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

### Building

Icons are generated automatically:

```bash
node generate-icons.js
```

### API Endpoints

The extension communicates with these endpoints:

- `POST /api/extension/save-poi` - Save a new place
- `GET /api/extension/saved-pois` - Get all saved places
- `PATCH /api/extension/poi/:id` - Update place status
- `DELETE /api/extension/poi/:id` - Delete a place

### Testing Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Load the extension in Chrome (developer mode)

3. Visit Google Maps and try saving a place

4. Check `http://localhost:3000/saved-places` to see your saves

## Publishing to Chrome Web Store

1. **Prepare for Production**:
   - Update `manifest.json` version
   - Test on all supported platforms
   - Create promotional images (1280x800)

2. **Create ZIP**:
   ```bash
   zip -r extension.zip . -x "*.git*" -x "node_modules/*" -x "generate-icons.js"
   ```

3. **Submit to Chrome Web Store**:
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Create new item
   - Upload ZIP file
   - Fill in store listing details
   - Submit for review

## Marketing Strategy

### Distribution Channels

1. **Chrome Web Store** (Primary)
   - SEO keywords: "japan travel planner extension", "save places chrome"
   - 5-star reviews from beta users
   - Regular updates and bug fixes

2. **Reddit** (`r/chrome`, `r/JapanTravel`)
   - Post: "I built a Chrome extension to save any place to your Japan trip with 1 click"
   - Provide value first, mention extension second
   - Respond to all comments

3. **ProductHunt**
   - Launch as update to main app
   - "Now with Chrome Extension for 1-Click Place Saving"
   - Hunter outreach for visibility

4. **Email Signature**
   - All outbound emails include: "P.S. Get our Chrome extension - save any place to your Japan trip with 1 click"

### Expected Growth

- **Week 1**: 100 installs (existing users + Reddit)
- **Month 1**: 1,000 installs (Chrome Store organic + viral sharing)
- **Month 3**: 5,000 installs (ProductHunt + word of mouth)

### Conversion Funnel

```
Extension Install → Use extension to save places → Visit saved-places page →
Sign up for account → Try premium features → Convert to paid ($10/month)
```

**Expected conversion rate**: 10% install → paid = 100 installs → 10 paid users → $100 MRR

## Troubleshooting

### Extension Not Appearing

- Make sure you're on a supported site (Google Maps, TripAdvisor, Airbnb)
- Refresh the page after installing the extension
- Check that the extension is enabled in `chrome://extensions/`

### Button Not Showing

- The button appears after place details load (usually 1-2 seconds)
- Try scrolling down to the action buttons section
- Check browser console for errors (F12)

### Save Failed

- Check your internet connection
- Make sure the app server is running
- Check browser console for error messages

## License

MIT License - See main project LICENSE file

## Support

- **Issues**: [GitHub Issues](https://github.com/caffeineGMT/japan-trip/issues)
- **Email**: support@japan-trip-companion.com
- **Reddit**: u/JapanTripCompanion

## Changelog

### v1.0.0 (Initial Release)

- ✅ Google Maps integration
- ✅ TripAdvisor integration
- ✅ Airbnb integration
- ✅ One-click save functionality
- ✅ Saved places dashboard
- ✅ Usage statistics
- ✅ Beautiful popup UI

## Roadmap

- [ ] Firefox extension support
- [ ] Safari extension support
- [ ] Booking.com integration
- [ ] Yelp integration
- [ ] Auto-suggest best day to add place to itinerary
- [ ] Duplicate detection
- [ ] Export saved places to CSV
- [ ] Share saved places list with friends
