# Visual Trip Builder

A powerful, interactive trip planning interface with geocoding, drag-and-drop, and multilingual support.

## Features

### 🗺️ Interactive Map Preview
- Real-time Leaflet map showing all stops
- Color-coded routes connecting stops within each day
- Marker popups with stop details
- Auto-zoom to fit all locations

### 🔍 Geocoding Integration
- Nominatim (OpenStreetMap) API integration
- Autocomplete search for destinations
- Location search for stops with instant results
- Coordinate validation and display

### 🎯 Drag & Drop
- SortableJS integration for reordering stops
- Visual drag handles on each stop card
- Smooth animations and ghost states
- Automatic state updates on reorder

### 🌍 Multilingual Support (i18n)
- English, Chinese (Simplified), Japanese
- Tab-based language switcher
- Empty field indicators
- Auto-translate API integration ready

### 💾 Import/Export
- JSON file download with validation
- Drag-and-drop file import
- Shareable URL generation (Base64 encoded)
- API publishing ready (JWT auth)

### 🎨 Production UI
- Three-column responsive layout
- Mobile-first design with breakpoints
- Real-time autosave to localStorage
- Status indicators and animations

## Architecture

```
/builder/
├── index.html              # Main UI (3-column layout)
├── style.css               # Complete styling system
├── app.js                  # State management & localStorage
├── main.js                 # App initialization & coordination
├── i18n-editor.js          # Language tab component
├── export.js               # Validation, export, import
└── components/
    └── day-editor.js       # Web component for day editing

/lib/
└── geocoder.js             # Nominatim API wrapper
```

## Data Schema

### Trip Object
```javascript
{
  title: String,
  destination: String,
  startDate: String,          // ISO date
  endDate: String,            // ISO date
  days: [Day],
  metadata: {
    created: String,          // ISO timestamp
    modified: String,         // ISO timestamp
    version: String
  }
}
```

### Day Object
```javascript
{
  id: String,                 // Unique identifier
  day: String,                // "Day 1", "Day 2", etc.
  date: String,               // Display date
  weekday: String,            // "Monday", etc.
  city: {                     // i18n
    en: String,
    zh: String,
    ja: String
  },
  theme: {                    // i18n
    en: String,
    zh: String,
    ja: String
  },
  color: String,              // Hex color
  center: [Number, Number],   // [lat, lng]
  zoom: Number,
  stops: [Stop],
  culturalTips: [String],
  checklist: [String]
}
```

### Stop Object
```javascript
{
  id: String,
  name: {                     // i18n
    en: String,
    zh: String,
    ja: String
  },
  time: String,
  desc: {                     // i18n
    en: String,
    zh: String,
    ja: String
  },
  lat: Number,
  lng: Number,
  icon: String,               // 'attraction', 'food', 'hotel', etc.
  category: String            // 'activity', 'transport', etc.
}
```

## Usage

### Basic Workflow

1. **Create Trip**: Enter title and destination
2. **Add Days**: Click "Add Day" button
3. **Add Stops**:
   - Click "Add Stop" on any day
   - Search for locations (geocoded automatically)
   - Or add manually and geocode later
4. **Customize**:
   - Edit stop names, times, descriptions inline
   - Drag to reorder stops
   - Change day colors and metadata
5. **Export**: Download as JSON or share via URL

### Geocoding

```javascript
// Automatic geocoding on stop creation
await builder.addStop(dayId, {
  searchQuery: 'Tokyo Tower'  // Will be geocoded
});

// Manual geocoding for existing stop
await geocoder.geocode('Fushimi Inari', {
  countryCode: 'jp'  // Bias results to Japan
});
```

### Import/Export

```javascript
// Export as file
const result = exporter.exportAsFile();

// Import from file
const file = await fileInput.files[0];
const result = await exporter.importFromFile(file);

// Generate shareable link
const url = exporter.generateShareLink();
// Returns: https://domain.com?import=eyJ0aXRsZSI6Ik15...

// Import from URL
const result = exporter.importFromLink(encodedData);
```

### State Management

```javascript
// Subscribe to changes
builder.subscribe((event, state) => {
  console.log('State changed:', event.type);
  // Types: 'day-added', 'day-updated', 'stop-added', etc.
});

// Auto-save is automatic (500ms debounce)
// Manual save:
builder.saveState();

// Clear all data
builder.clearTrip();
```

## API Integration

### Geocoding (Nominatim)

Rate limit: 1 request/second (enforced automatically)

```javascript
const geocoder = new Geocoder();

// Search
const results = await geocoder.geocode('Tokyo Tower', {
  countryCode: 'jp',
  bounds: [35.5, 139.5, 35.8, 139.8]
});

// Reverse geocode
const location = await geocoder.reverseGeocode(35.6586, 139.7454);
```

### Translation API (Ready for Integration)

```javascript
const i18n = new I18nEditor();

// Single translation
const translated = await i18n.translate(
  'Cherry Blossom Viewing',
  'en',
  'ja'
);

// Batch translate all empty fields
const updated = await i18n.batchTranslate(
  'en',
  ['zh', 'ja'],
  tripData
);
```

To enable, implement `/api/translate` endpoint with Google Cloud Translation API.

## Validation

All exports are validated before download:

- ✅ Required fields (title, days array)
- ✅ i18n objects must have English translation
- ✅ Valid hex colors
- ✅ Coordinate bounds check
- ✅ Valid categories and icons
- ✅ Array structure validation

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## Dependencies

- **Leaflet 1.9.4**: Map preview
- **SortableJS 1.15.0**: Drag and drop
- **Nominatim API**: Geocoding (free, rate-limited)

## localStorage

Automatically persists to `trip-builder-state` key:

```javascript
// Clear saved data
localStorage.removeItem('trip-builder-state');

// Manual export before clearing
const backup = localStorage.getItem('trip-builder-state');
```

## Performance

- ⚡ Debounced autosave (500ms)
- ⚡ Debounced search (500ms)
- ⚡ Rate-limited geocoding (1 req/sec)
- ⚡ Lazy map rendering
- 📦 Total bundle: ~50KB (excluding dependencies)

## Future Enhancements

- [ ] Multiple destination support
- [ ] Route optimization (traveling salesman)
- [ ] Weather integration
- [ ] Budget tracking per stop
- [ ] Photo uploads
- [ ] Collaboration features (real-time sync)
- [ ] Template library (pre-built itineraries)
- [ ] Google Maps/Mapbox alternatives
- [ ] Offline PWA support

## License

Part of the Japan Trip Companion project.
