# Affiliate Revenue Tracking Implementation

## Overview

This system tracks clicks on affiliate widgets (Booking.com, GetYourGuide, JR Pass) and logs them to Supabase for revenue attribution and analytics.

## Components

### 1. Frontend Widgets

**Location:** `/widgets/`

- **hotels.js** - Booking.com hotel widget
- **activities.js** - GetYourGuide tours & activities widget
- **transport.js** - JR Pass widget

Each widget:
- Renders affiliate content based on day/location
- Generates affiliate deep links with partner IDs
- Calls `AffiliateTracker.trackClick()` on click
- Displays proper affiliate disclosure

### 2. Affiliate Tracker

**Location:** `/lib/affiliate-tracker.js`

Client-side tracking library that:
- Logs clicks to localStorage for immediate feedback
- Sends events to Google Analytics (if configured)
- Posts click data to backend API endpoint
- Tracks session IDs for conversion attribution
- Provides statistics and export functionality

### 3. Backend API

**Location:** `/api/affiliate/click.js`

Serverless function that:
- Receives POST requests with click metadata
- Extracts IP address and user agent from headers
- Inserts click records into Supabase
- Returns success/failure response

### 4. Database Schema

**Location:** `/database-schema-outbound-affiliate-clicks.sql`

Supabase table: `outbound_affiliate_clicks`

Fields:
- `id` - UUID primary key
- `source` - Affiliate partner (booking.com, getyourguide, jrpass)
- `user_id` - User ID (if authenticated)
- `template_id` - Trip template ID
- `day_index` - Day number in itinerary
- `item_name` - Hotel/activity name
- `item_price` - Listed price
- `city` - City name
- `session_id` - Browser session ID
- `ip_address` - Click IP address
- `user_agent` - Browser user agent
- `referrer` - Referring URL
- `clicked_at` - Timestamp
- `converted` - Conversion flag (for future use)
- `conversion_value_cents` - Conversion amount (for future use)

## Setup Instructions

### 1. Environment Variables

Add to `.env`:

```bash
# Affiliate Partner IDs
BOOKING_AFFILIATE_ID=2891748
GETYOURGUIDE_PARTNER_ID=YOUR_PARTNER_ID
GETYOURGUIDE_API_KEY=YOUR_API_KEY
JRPASS_AFFILIATE_ID=japan_trip_demo
```

### 2. Database Setup

Run the SQL schema in Supabase SQL Editor:

```bash
psql -h db.xxxxx.supabase.co -U postgres -d postgres < database-schema-outbound-affiliate-clicks.sql
```

Or copy/paste the contents of `database-schema-outbound-affiliate-clicks.sql` into Supabase SQL Editor.

### 3. Sign Up for Affiliate Programs

#### Booking.com
1. Visit https://affiliate.booking.com
2. Sign up as an affiliate partner
3. Get your Affiliate ID (AID)
4. Add to `.env` as `BOOKING_AFFILIATE_ID`

#### GetYourGuide
1. Visit https://partner.getyourguide.com
2. Apply for partner program
3. Get API key and Partner ID from dashboard
4. Add to `.env` as `GETYOURGUIDE_PARTNER_ID` and `GETYOURGUIDE_API_KEY`

#### JR Pass
1. Visit https://www.jrpass.com/affiliate
2. Join affiliate program
3. Get your affiliate code
4. Add to `.env` as `JRPASS_AFFILIATE_ID`

## How It Works

### Click Flow

1. User views a day in the itinerary
2. `renderSidebar()` calls `renderAffiliateWidgets()`
3. Widgets render with affiliate deep links
4. User clicks "View Deals" or "Book Now"
5. Widget's `onclick` handler calls `AffiliateTracker.trackClick()`
6. Tracker logs to:
   - Console (dev logging)
   - Google Analytics (if configured)
   - localStorage (local cache)
   - Backend API → Supabase (persistent storage)
7. User is redirected to affiliate partner site

### Data Flow

```
User Click → Widget → AffiliateTracker → API Endpoint → Supabase
                   ↓
              localStorage
                   ↓
           Google Analytics
```

## Widget Rendering Logic

### Hotels Widget

- Shows on all days
- Calculates center point from day's stops
- Parses check-in/check-out dates from `day.date`
- Generates Booking.com search URL with:
  - Latitude/longitude
  - Check-in/check-out dates
  - Partner AID
- Displays 3 hotels with ratings, prices, amenities

### Activities Widget

- Shows on all days
- Detects categories from stop names/descriptions
- Matches activities to detected categories
- Generates GetYourGuide deep links
- Displays 3 activities with duration, price, ratings

### Transport Widget (JR Pass)

- Shows only on first 3 days (days 0-2)
- Only for Japan trips
- Recommends pass type based on trip duration:
  - 7-day pass for ≤7 day trips
  - 14-day pass for 8-14 day trips
  - 21-day pass for 15+ day trips
- Includes travel tips and alternative options

## Analytics & Reporting

### View Stats in Console

```javascript
// Get click statistics
AffiliateTracker.getStats()

// Export clicks to JSON
AffiliateTracker.exportClicks()
```

### Query Supabase

```sql
-- Total clicks by source
SELECT source, COUNT(*) as clicks
FROM outbound_affiliate_clicks
GROUP BY source;

-- Clicks by day
SELECT day_index, COUNT(*) as clicks
FROM outbound_affiliate_clicks
WHERE template_id = 'japan-cherry-blossom-2026'
GROUP BY day_index
ORDER BY day_index;

-- Top clicked items
SELECT source, item_name, COUNT(*) as clicks
FROM outbound_affiliate_clicks
WHERE item_name IS NOT NULL
GROUP BY source, item_name
ORDER BY clicks DESC
LIMIT 10;

-- Recent clicks
SELECT *
FROM outbound_affiliate_clicks
ORDER BY clicked_at DESC
LIMIT 50;
```

## Testing

### Manual Test

1. Load the trip companion: `http://localhost:3000`
2. Navigate through days
3. Click on hotel/activity/JR Pass affiliate links
4. Check browser console for tracking logs
5. Verify clicks in Supabase dashboard

### Expected Console Output

```
[Affiliate Click] {source: "booking.com", dayNumber: 1, city: "Tokyo", ...}
[Affiliate] Click logged to backend: {success: true, clickId: "..."}
```

### Test Script

```bash
# Send test click to API
curl -X POST http://localhost:3000/api/affiliate/click \
  -H "Content-Type: application/json" \
  -d '{
    "source": "booking.com",
    "templateId": "japan-cherry-blossom-2026",
    "dayIndex": 0,
    "itemName": "Grand Hyatt Tokyo",
    "itemPrice": 350,
    "city": "Tokyo",
    "sessionId": "test_session_123"
  }'
```

Expected response:
```json
{
  "success": true,
  "clickId": "uuid-here",
  "message": "Click logged successfully"
}
```

## Revenue Attribution

### Current Implementation

- Tracks which affiliate links are clicked
- Logs metadata for attribution (day, city, item, price)
- Stores session IDs for future conversion tracking

### Future Enhancements

1. **Conversion Tracking**
   - Implement postback URLs with affiliate partners
   - Update `converted` and `conversion_value_cents` when purchases complete
   - Calculate ROI per widget/day/city

2. **A/B Testing**
   - Test different widget placements
   - Test different CTAs and imagery
   - Optimize for conversion rate

3. **Revenue Dashboard**
   - Build admin dashboard showing:
     - Total clicks by partner
     - Estimated revenue (if conversion data available)
     - Top performing days/cities
     - Click-through rates

## Acceptance Criteria ✅

- [x] Booking.com widget shows on all days with correct check-in dates
- [x] GetYourGuide widget shows relevant activities for each city
- [x] JR Pass banner visible on Japan templates only (days 0-2)
- [x] All clicks logged to Supabase with accurate metadata
- [x] API endpoint `/api/affiliate/click` responds 200 OK
- [x] Test clicks logged successfully to database

## File Checklist

- [x] `/widgets/hotels.js` - Booking.com widget
- [x] `/widgets/activities.js` - GetYourGuide widget
- [x] `/widgets/transport.js` - JR Pass widget
- [x] `/lib/affiliate-tracker.js` - Click tracking library
- [x] `/api/affiliate/click.js` - Backend API endpoint
- [x] `/database-schema-outbound-affiliate-clicks.sql` - Database schema
- [x] `/components/affiliate-widget.css` - Widget styling (pre-existing)
- [x] `/.env.example` - Environment variable documentation
- [x] `/script.js` - Integration in `renderAffiliateWidgets()` (pre-existing)
- [x] `/index.html` - Widget script tags loaded (pre-existing)

## Production Deployment

### Before Going Live

1. Replace demo affiliate IDs with real ones in `.env`
2. Deploy database schema to production Supabase
3. Test all affiliate links redirect correctly
4. Verify click tracking works on production domain
5. Set up monitoring/alerts for API errors
6. Review affiliate program terms & conditions
7. Ensure proper disclosure language on all widgets

### Compliance

- Widgets include "Affiliate Partner" badge
- Footer shows disclosure: "Affiliate Partner • Prices may vary"
- Links open in new tab (`target="_blank"`)
- No misleading claims about pricing or availability

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify environment variables are set
3. Check Supabase logs for API errors
4. Review network tab for failed requests
5. Ensure database schema is deployed

## License

This affiliate tracking system is part of the Japan Trip Companion project.
