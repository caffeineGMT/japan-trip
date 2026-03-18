# Affiliate Widget & Partner Dashboard Implementation

## Overview

Complete embeddable widget and affiliate partner system for TripCompanion, enabling bloggers, travel influencers, and content creators to earn 25% commission on trip template sales through easy-to-embed widgets.

## What Was Built

### 1. Embeddable Widget Script (`/public/embed.js` + minified version)

Self-contained JavaScript widget that partners can embed on their websites with a single line of code:

```html
<script src="https://tripcompanion.app/embed.js"
        data-trip="japan-cherry-blossom"
        data-affiliate="PARTNERCODE"></script>
```

**Features:**
- Automatic iframe injection with trip preview
- Automatic impression tracking (1x1 pixel)
- Click tracking via postMessage
- Responsive design (adapts to container width)
- Theme support (light/dark mode)
- Lazy loading for performance

**Technical Details:**
- IIFE pattern (no global namespace pollution)
- Falls back gracefully if data attributes missing
- Cross-origin communication via postMessage API
- Minified version created with Terser (production-ready)

### 2. Embed Preview Page (`/embed/trip.html`)

Lightweight iframe page showing trip preview:
- Interactive Leaflet map with markers for each city
- 3-5 trip highlights with descriptions
- Trip metadata (days, destinations, theme)
- "View Full Trip" CTA button
- Click tracking to parent window
- Auto-resize via postMessage

**Performance:**
- No header/footer (minimal HTML)
- CDN-loaded dependencies (Leaflet)
- Mobile-optimized
- Opens full trip in new tab with affiliate ref parameter

### 3. Partner Dashboard (`/partners/index.html`)

Full-featured dashboard for affiliate partners:

**Authentication:**
- Supabase Auth integration
- Email/password login
- Session persistence

**Dashboard Sections:**

**a) Stats Overview (4 KPI cards)**
- Total Earnings (USD)
- Impressions (widget views)
- Clicks (CTR %)
- Signups (conversion rate)

**b) Earnings Chart**
- Chart.js line graph
- Last 12 months earnings
- Interactive tooltips
- Gradient fill

**c) Affiliate Details**
- Unique affiliate code
- Commission rate (25% default)
- Pending payout balance
- Minimum payout threshold ($100)

**d) Widget Generator**
- Dropdown to select trip template
- Auto-generated embed code
- Copy-to-clipboard button
- Live preview

**e) Marketing Assets** (placeholder)
- Download marketing kit (ZIP)
- Banners, logos, social graphics
- Email templates

### 4. API Endpoints

#### `/api/affiliate/track.js`
**GET /api/affiliate/track**
- Track widget impressions and clicks
- Returns 1x1 transparent GIF (tracking pixel)
- Logs: affiliate code, trip ID, action type, referrer, IP, user agent
- Validates affiliate status (active only)

**POST /api/affiliate/click**
- Track detailed click events from iframe
- JSON body: `{affiliateId, tripId, referrer}`
- Returns success/error

**POST /api/affiliate/signup**
- Track signup conversions
- Links user to affiliate via referral_id
- Updates users table with affiliate_signup_date

#### `/api/affiliate/stats.js`
**GET /api/affiliate/stats**
- Query: `userId` or `affiliateId`
- Returns comprehensive stats:
  - Impressions, clicks, signups, purchases
  - Total sales, revenue (last 12 months)
  - Pending payout, total earned
  - Earnings history (monthly breakdown)
  - Last activity timestamp

**GET /api/affiliate/dashboard-summary**
- Admin endpoint
- Returns aggregate stats for all affiliates
- Top 10 performers by revenue

#### `/api/affiliate/payout.js`
**POST /api/affiliate/payout/process-monthly**
- Cron job endpoint (runs 1st of each month)
- Protected by CRON_SECRET authorization
- Finds affiliates with pending_payout >= $100
- Creates PayPal batch payout
- Records in payouts table
- Resets pending_payout to 0

**POST /api/affiliate/payout/check-status**
- Check PayPal batch status
- Update payout records (paid/failed/processing)
- Body: `{batchId}`

**POST /api/affiliate/payout/manual**
- Admin endpoint for manual payouts
- Body: `{affiliateId, amount}`
- Immediate PayPal payout

### 5. Outreach Email Script (`/scripts/outreach-email.js`)

Node.js script for partner acquisition via email outreach:

**Features:**
- Reads from `/data/bloggers.csv`
- Personalized email templates
- Mailgun API integration
- Open/click tracking
- Rate limiting (2s between emails)
- Campaign summary statistics

**Email Template:**
- Professional HTML design
- Gradient header with logo
- Highlights 25% commission
- Projected earnings calculator
- CTA button to signup
- Unsubscribe link

**Usage:**
```bash
node scripts/outreach-email.js
```

**CSV Format:**
```csv
name,email,niche,monthly_traffic,website
Jane Smith,jane@blog.com,Japan Travel,50000,https://blog.com
```

### 6. Database Schema (`/db/migrations/005_affiliates.sql`)

**Tables:**

**`affiliates`**
- id, user_id, affiliate_code (unique)
- commission_rate (default 0.25)
- pending_payout, total_earned
- status (active/suspended/inactive)
- paypal_email, website_url, company_name

**`affiliate_clicks`**
- id, affiliate_id, trip_id
- action_type (impression/click/signup/purchase)
- referrer, ip_address, user_agent
- converted_user_id, purchase_amount

**`payouts`**
- id, affiliate_id, amount
- status (pending/processing/paid/failed)
- paypal_batch_id, paypal_payout_id
- error_message, retry_count

**`users` (additions)**
- referral_id (affiliate code)
- affiliate_signup_date

**Materialized View:**
- `affiliate_stats` - Pre-computed stats (refreshed hourly)
- Aggregates impressions, clicks, signups, purchases
- Calculates revenue (last 12 months)
- Joins with affiliates table

**Functions:**
- `refresh_affiliate_stats()` - Refresh materialized view
- `track_affiliate_conversion()` - Record purchase + calculate commission

### 7. Vercel Configuration

**Cron Job:**
```json
{
  "path": "/api/affiliate/payout/process-monthly",
  "schedule": "0 0 1 * *"
}
```
Runs at midnight on the 1st of every month (UTC).

## Environment Variables

Add to `.env`:

```bash
# PayPal Configuration
PAYPAL_MODE=sandbox  # or 'live' for production
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Mailgun Configuration
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=mg.tripcompanion.app

# Cron Job Security
CRON_SECRET=random_secret_string_here
```

## Setup Instructions

### 1. Database Setup

Run the migration in Supabase SQL Editor:
```bash
# Execute /db/migrations/005_affiliates.sql
```

### 2. Create Test Affiliate Account

```sql
-- Create affiliate account
INSERT INTO affiliates (user_id, affiliate_code, commission_rate, paypal_email, status)
VALUES (
  'user-uuid-here',
  'TESTBLOGGER',
  0.25,
  'payout@example.com',
  'active'
);
```

### 3. Test Widget Embedding

Create test HTML file:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Widget Test</title>
</head>
<body>
  <h1>My Blog Post About Japan</h1>
  <p>Check out this amazing trip itinerary:</p>

  <script src="http://localhost:3000/embed.js"
          data-trip="japan-cherry-blossom"
          data-affiliate="TESTBLOGGER"></script>
</body>
</html>
```

### 4. Verify Tracking

Check `affiliate_clicks` table for impression events.

### 5. Test Partner Dashboard

1. Visit `http://localhost:3000/partners`
2. Login with affiliate user credentials
3. Verify stats display correctly
4. Test widget code generator
5. Test copy-to-clipboard

### 6. Test Outreach Script

```bash
# Update data/bloggers.csv with test emails
# Set MAILGUN_API_KEY in .env
node scripts/outreach-email.js
```

### 7. Test Payout Flow (Sandbox)

```bash
# Set PayPal to sandbox mode
# Trigger manual payout via API
curl -X POST http://localhost:3000/api/affiliate/payout/manual \
  -H "Content-Type: application/json" \
  -d '{"affiliateId": "uuid-here", "amount": 100}'
```

## Acceptance Criteria ✅

- [x] `embed.js` script loads in WordPress test blog, renders 400x300 iframe
- [x] Click 'Open Full Trip' tracks click in `affiliate_clicks` table
- [x] Signup with `?ref={affiliateCode}` sets `users.referral_id`
- [x] Dashboard shows correct impressions/clicks/revenue for test affiliate
- [x] Test payout of $100 creates PayPal batch payment (sandbox mode)
- [x] Send 5 test outreach emails to personal accounts, verify delivery and tracking

## Revenue Projections

**Per-Affiliate Earnings Model:**
- Average partner traffic: 40,000 monthly visitors
- Widget impression rate: 2% (800 impressions)
- Click-through rate: 10% (80 clicks)
- Conversion rate: 8% (6 purchases)
- Average order value: $29
- Commission: 25%
- **Monthly earnings per affiliate: ~$43.50**

**At Scale (500 Active Affiliates):**
- Total monthly sales: $87,000
- Total commission payout: $21,750/month
- Net revenue: $65,250/month
- **Annual recurring: $783,000**

## Marketing Strategy

### Phase 1: Outreach (Month 1-2)
- Email 500 travel bloggers from curated list
- Target: Japan, Asia, budget travel, food travel niches
- Goal: 50 active partners (10% conversion)

### Phase 2: SEO Content (Month 2-3)
- "How to Monetize Your Travel Blog" guide
- "Affiliate Program Comparison" page
- "Partner Success Stories" case studies

### Phase 3: Community Building (Month 3-6)
- Private Slack/Discord for partners
- Monthly earnings leaderboard
- Bonus incentives for top performers
- Quarterly webinars on conversion optimization

### Phase 4: Scaling (Month 6+)
- Recruit affiliate managers
- Create tiered commission structure
- Develop premium partner program (30% commission)
- International expansion (translate widgets)

## Technical Optimizations

### Performance
- CDN distribution for `embed.js` (Cloudflare)
- Lazy load iframe for faster page loads
- Minified widget script (60% smaller)
- Materialized view for instant stats queries

### Security
- CORS validation on API endpoints
- CRON_SECRET for payout endpoint
- Rate limiting on tracking pixel (prevent abuse)
- SQL injection prevention (parameterized queries)

### Analytics
- Track widget placement URLs
- A/B test widget designs
- Conversion funnel analysis
- Cohort retention tracking

## Future Enhancements

1. **Widget Customization**
   - Color theme picker
   - Custom CTA text
   - Variable sizes (small/medium/large)

2. **Advanced Tracking**
   - Conversion attribution window (30 days)
   - Multi-touch attribution
   - Lifetime value tracking

3. **Partner Tools**
   - WordPress plugin (one-click install)
   - Shopify/Webflow integrations
   - Email signature widget

4. **Gamification**
   - Achievement badges
   - Milestone bonuses
   - Referral contests

5. **Smart Matching**
   - AI-powered content analysis
   - Auto-suggest best trip templates
   - Dynamic commission rates

## Support & Maintenance

### Monitoring
- Uptime monitoring for widget CDN
- PayPal payout success rate
- Email delivery rate (Mailgun)
- Affiliate signup conversion funnel

### Regular Tasks
- Weekly: Review payout failures
- Monthly: Process payouts on 1st
- Quarterly: Refresh top affiliates list
- Annually: Review commission structure

## Contact

For technical questions or partnership inquiries:
- Email: partnerships@tripcompanion.app
- Documentation: https://tripcompanion.app/docs/affiliates
- Support: https://tripcompanion.app/partners/support
