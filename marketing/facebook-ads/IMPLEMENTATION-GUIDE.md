# Facebook Ads Implementation Guide

Complete step-by-step guide to launch Facebook Ads retargeting campaigns for Japan Trip Companion.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Facebook Business Setup](#facebook-business-setup)
3. [Pixel Installation](#pixel-installation)
4. [Custom Audience Creation](#custom-audience-creation)
5. [Creative Asset Preparation](#creative-asset-preparation)
6. [Campaign Launch](#campaign-launch)
7. [Testing & Verification](#testing-verification)
8. [Monitoring & Optimization](#monitoring-optimization)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Accounts Required
- [ ] Facebook Business Manager account
- [ ] Facebook Page for Japan Trip Companion
- [ ] Facebook Ad Account with payment method
- [ ] Access to website codebase
- [ ] Analytics dashboard access

### Budget & Timeline
- **Budget:** $1,500/month ($50/day)
- **Duration:** March 1 - April 30, 2026
- **Setup Time:** 2-3 days
- **Optimization:** Ongoing daily

---

## Facebook Business Setup

### Step 1: Create Facebook Business Manager

1. Go to [business.facebook.com](https://business.facebook.com)
2. Click **Create Account**
3. Enter business details:
   - Business Name: Japan Trip Companion
   - Your Name: [Your Name]
   - Business Email: marketing@japan-trip.com
4. Verify email and add payment method

### Step 2: Create Facebook Page

1. In Business Manager, go to **Pages** → **Add**
2. Click **Create New Page**
3. Page details:
   - Page Name: Japan Trip Companion
   - Category: Travel Company
   - Description: AI-powered Japan trip planner with offline maps and cherry blossom forecasts
4. Add profile photo (logo) and cover photo (cherry blossoms)
5. Publish page

### Step 3: Create Ad Account

1. In Business Manager, go to **Ad Accounts** → **Add**
2. Click **Create New Ad Account**
3. Ad Account details:
   - Ad Account Name: Japan Trip Companion - 2026
   - Time Zone: America/Los_Angeles
   - Currency: USD
4. Add payment method (credit card)
5. Assign yourself as Admin

### Step 4: Create Facebook Pixel

1. In Business Manager, go to **Events Manager**
2. Click **Connect Data Sources** → **Web** → **Facebook Pixel**
3. Pixel Name: Japan Trip Companion Pixel
4. Enter website URL: https://japan-trip.com
5. Click **Continue** → **Install Pixel Now**
6. Choose **Manually Install Pixel Code**
7. **COPY THE PIXEL ID** (you'll need this)

---

## Pixel Installation

### Step 5: Install Pixel on Website

**Option A: Automatic (Recommended)**

1. Add pixel configuration to `.env`:
```bash
FB_PIXEL_ID=YOUR_PIXEL_ID_HERE
```

2. Update `index.html` - add before `</head>`:
```html
<!-- Facebook Pixel -->
<script>
  const FB_PIXEL_ID = 'YOUR_PIXEL_ID'; // Replace with actual ID
</script>
<script src="/marketing/facebook-ads/tracking/facebook-pixel.js"></script>
<noscript>
  <img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1" />
</noscript>
```

3. Add to other key pages:
   - `/early-access` (signup page)
   - `/pricing` (pricing page)
   - `/success` (conversion page)
   - `/account` (account page)

**Option B: Manual (Facebook Tag)**

1. Copy the pixel base code from Facebook
2. Paste before `</head>` on all pages
3. Add standard events manually

### Step 6: Verify Pixel Installation

1. Install **Meta Pixel Helper** Chrome extension
2. Visit your website
3. Click extension icon - should show green checkmark
4. Verify events firing:
   - PageView ✓
   - ViewContent ✓
   - InitiateCheckout (on signup form) ✓
   - Purchase (on success page) ✓

### Step 7: Test Pixel Events

1. Visit website in incognito mode
2. Navigate to different pages
3. Fill out signup form (don't submit)
4. Go to Facebook Events Manager → **Test Events**
5. Should see events appearing in real-time

---

## Custom Audience Creation

### Step 8: Create Website Custom Audiences

In Facebook Business Manager → **Audiences** → **Create Audience** → **Custom Audience**

**Audience 1: Website Visitors (7 days)**
- Source: Website
- Events: All website visitors
- Retention: 7 days
- Name: websiteVisitors_7d

**Audience 2: Website Visitors (30 days)**
- Source: Website
- Events: All website visitors
- Retention: 30 days
- Name: websiteVisitors_30d

**Audience 3: Cherry Blossom Searchers (30 days)**
- Source: Website
- Events: Custom Event - `CherryBlossomSearcher`
- Retention: 30 days
- Name: cherryBlossomSearchers_30d

**Audience 4: Signup Abandoners (7 days)**
- Source: Website
- Include: `InitiateCheckout` in past 7 days
- Exclude: `CompleteRegistration` in past 7 days
- Name: signupAbandoners_7d

**Audience 5: Pricing Page Viewers (14 days)**
- Source: Website
- Events: PageView where URL contains `/pricing`
- Retention: 14 days
- Name: pricingPageViewers_14d

**Audience 6: High Intent Users (30 days)**
- Source: Website
- Events: Custom Event - `CustomAudience_HIGH_INTENT_USERS`
- Retention: 30 days
- Name: highIntentUsers_30d

### Step 9: Create Lookalike Audiences

**Lookalike 1: Website Visitors 1%**
- Source: websiteVisitors_30d
- Location: United States
- Audience Size: 1% (most similar)
- Name: LAL_websiteVisitors_1pct_US

Repeat for CA, GB, AU

### Step 10: Create Exclusion Audiences

**Existing Customers**
- Source: Website
- Events: `Purchase` in past 180 days
- Name: existingCustomers

**Current Subscribers**
- Source: Customer List (upload emails)
- Name: currentSubscribers

---

## Creative Asset Preparation

### Step 11: Prepare Images (Carousel Ads)

**Required Images (1080 x 1080 px):**

1. **shinjuku-gyoen-sakura.jpg**
   - Photo of Shinjuku Gyoen cherry blossoms
   - High quality, peak bloom
   - Source: Unsplash or original photo

2. **philosophers-path-sakura.jpg**
   - Philosopher's Path canal with cherry trees
   - Romantic atmosphere

3. **osaka-castle-sakura.jpg**
   - Osaka Castle with cherry blossoms foreground
   - Dramatic composition

4. **nara-park-sakura.jpg**
   - Deer + cherry blossoms
   - Unique, playful

5. **app-screenshot-map.jpg**
   - Screenshot of Japan Trip Companion app
   - Clean UI, mobile mockup

**Image Checklist:**
- [ ] 1080 x 1080 px (square)
- [ ] JPG format, <5MB
- [ ] Text overlay <20% of image
- [ ] High resolution (not blurry)
- [ ] Vibrant colors
- [ ] No watermarks

### Step 12: Prepare Video (Retargeting)

**cherry-blossom-map-animation.mp4**

**Specifications:**
- Resolution: 1080 x 1080 (square) or 1080 x 1920 (vertical)
- Duration: 15 seconds
- Format: MP4
- Frame rate: 30fps
- Audio: Background music + captions
- File size: <1GB

**Storyboard:**
0-3s: Cherry blossoms blooming (time-lapse)
3-8s: Map animation Tokyo → Kyoto → Osaka → Nara
8-11s: App UI showing itinerary
11-15s: "50% Off" CTA

**Tools:**
- After Effects (animation)
- Canva (simple alternative)
- Kapwing (online video editor)

### Step 13: Upload Assets to Facebook

1. Go to **Ads Manager** → **Images**
2. Upload all 5 carousel images
3. Go to **Videos** → Upload video
4. Wait for processing (can take 5-10 minutes)
5. Copy Image Hashes and Video ID for campaign setup

---

## Campaign Launch

### Step 14: Create Campaign 1 - Awareness

**In Ads Manager:**

1. Click **Create** → **Campaigns**
2. Campaign Objective: **Awareness**
3. Campaign Name: Cherry Blossom Japan Trip - Awareness 2026
4. Special Ad Category: None
5. Click **Continue**

**Ad Set 1: US/CA Carousel**
- Name: Cherry Blossom Carousel - US/CA
- Budget: $30/day
- Start Date: March 1, 2026
- End Date: April 30, 2026
- Locations: United States, Canada (25 mi radius of major cities)
- Age: 25-45
- Gender: All
- Detailed Targeting:
  - Interests: Travel, Japan, Cherry Blossoms, International Travel
  - Behaviors: Frequent Travelers
- Placements: Automatic (Facebook Feed, Instagram Feed, Stories)
- Optimization: Reach
- Bid Strategy: Lowest Cost

**Ad 1: Carousel**
- Format: Carousel
- Primary Text:
  ```
  🌸 Cherry Blossom Season 2026 is Coming!

  Discover Japan's most breathtaking hanami spots. From Tokyo's urban gardens to Kyoto's ancient temples, plan your perfect cherry blossom adventure with AI-powered routing and live bloom forecasts.

  ✨ What's Next mode shows you the perfect timing
  🗺️ Offline maps work without internet
  📱 Mobile-optimized for on-the-go planning

  Join 2,000+ travelers planning their dream Japan trip 👉
  ```
- Headline: Plan Your Cherry Blossom Trip in 5 Minutes
- Cards: (Upload 5 images with titles/descriptions)
- CTA: Learn More
- Website URL: https://japan-trip.com/early-access?utm_source=facebook&utm_medium=carousel&utm_campaign=awareness

**Repeat for International Ad Set**

### Step 15: Create Campaign 2 - Retargeting

**In Ads Manager:**

1. Click **Create** → **Campaigns**
2. Campaign Objective: **Conversions**
3. Campaign Name: Cherry Blossom Japan Trip - Retargeting 2026
4. Click **Continue**

**Ad Set 1: Website Visitors 7d**
- Name: Website Visitors - 7 Days
- Budget: $20/day
- Conversion Event: Lead (from pixel)
- Locations: All countries
- Age: 25-45
- Custom Audiences:
  - Include: websiteVisitors_7d
  - Exclude: existingCustomers, currentSubscribers
- Placements: Automatic
- Optimization: Conversions
- Bid Strategy: Lowest Cost with Bid Cap ($25)

**Ad 1: Urgency Video**
- Format: Video
- Video: cherry-blossom-map-animation.mp4
- Primary Text:
  ```
  ⏰ Your Japan Trip Is Waiting!

  You visited our cherry blossom trip planner. Don't miss out on peak bloom season!

  🎁 SPECIAL OFFER: 50% off this week only
  💰 Save $60/year → Just $4.99/month
  🌸 Plan your perfect 2-week trip in 5 minutes

  ✅ AI-powered itinerary optimization
  ✅ Live cherry blossom forecasts
  ✅ Offline maps that work in Japan
  ✅ Smart routing & timing

  Offer expires in 3 days. Claim your discount now 👇
  ```
- Headline: 50% Off Ends This Week - Plan Your Cherry Blossom Trip
- CTA: Sign Up
- Website URL: https://japan-trip.com/early-access?discount=COMEBACK50&utm_source=facebook&utm_medium=retargeting&utm_campaign=retargeting_2026

**Repeat for other ad sets**

### Step 16: Review & Publish

1. Review all campaigns in **Review** tab
2. Check:
   - [ ] Budget is correct ($50/day total)
   - [ ] Targeting is accurate
   - [ ] Pixel is set up
   - [ ] URLs have UTM parameters
   - [ ] Images/videos uploaded correctly
3. Submit for review
4. Wait for Facebook approval (usually 24 hours)
5. Once approved, set campaigns to **Active**

---

## Testing & Verification

### Step 17: Pre-Launch Testing

**Before going live:**

1. **Test Pixel Tracking**
   - Visit site with Meta Pixel Helper
   - Verify all events fire correctly
   - Check Events Manager for test events

2. **Test Landing Pages**
   - Click through ad preview
   - Verify UTM parameters captured
   - Test signup flow end-to-end
   - Check discount codes work

3. **Test Conversion Tracking**
   - Complete a test signup
   - Verify Lead event fires
   - Check in Events Manager within 20 minutes

4. **Budget Check**
   - Verify daily budget limits set
   - Check payment method valid
   - Set up budget alerts (spend >$75/day)

### Step 18: Post-Launch Monitoring

**First 24 Hours:**
- Check every 2 hours
- Verify ads are delivering (impressions >0)
- Check CTR >0.5%
- Monitor cost per result
- Watch for policy violations

**First Week:**
- Daily performance review
- Check CAC vs target ($50 max)
- Monitor conversion rate (target 10%+)
- Adjust bids if needed

---

## Monitoring & Optimization

### Step 19: Daily Checks (15 minutes)

1. **Open Analytics Dashboard**
   - `/marketing/facebook-ads/analytics/dashboard.html`

2. **Check Key Metrics:**
   - [ ] Spend: On track for $50/day?
   - [ ] CAC: Below $50?
   - [ ] CVR: Above 10%?
   - [ ] ROAS: Trending toward 1.0+?

3. **Review Alerts:**
   - Any ad sets with CAC >$100? → Pause
   - Any ad sets with 0 conversions after $50 spend? → Pause
   - Any ad sets with CVR >15%? → Increase budget

### Step 20: Weekly Optimization (1 hour)

**Every Monday:**

1. **Export Performance Data**
   ```bash
   node marketing/facebook-ads/scripts/campaign-manager.js report
   ```

2. **Analyze Results:**
   - Best performing ad sets (lowest CAC)
   - Worst performing ad sets (highest CAC, low CVR)
   - Platform performance (FB vs IG)
   - Creative performance (which ads win)

3. **Take Action:**
   - Pause ad sets with CAC >$100
   - Increase budget on CAC <$30 ad sets by 50%
   - Test new creative variants
   - Expand winning audiences

4. **A/B Test Review:**
   - Which variant won?
   - Make winning variant the control
   - Launch new test

### Step 21: Auto-Optimization Script

**Setup Daily Automation:**

```bash
# Add to crontab (run daily at 9 AM)
crontab -e

# Add this line:
0 9 * * * cd /Users/michaelguo/japan-trip && node marketing/facebook-ads/scripts/campaign-manager.js optimize
```

**What it does:**
- Checks all ad sets
- Pauses if CAC >$100
- Increases budget if CAC <$30 and conversions >5
- Sends daily report email

---

## Troubleshooting

### Common Issues

**Issue 1: Pixel Not Firing**
- Check: Meta Pixel Helper shows pixel
- Check: Pixel ID correct in code
- Check: JavaScript not blocked by ad blocker
- Solution: Test in incognito mode

**Issue 2: No Conversions**
- Check: Conversion event set up correctly
- Check: Event showing in Events Manager
- Check: Attribution window (7-day click, 1-day view)
- Solution: Verify pixel test events

**Issue 3: Ads Not Delivering**
- Check: Campaign status (Active?)
- Check: Payment method valid
- Check: Ad approved (not under review)
- Check: Audience size >1,000 people
- Solution: Wait 24-48 hours for delivery

**Issue 4: High CAC**
- Check: Landing page optimized for conversions?
- Check: Audience too broad or too narrow?
- Check: Ad relevance score
- Solution: Pause and optimize

**Issue 5: Low CTR**
- Check: Creative quality (image/video engaging?)
- Check: Ad copy compelling?
- Check: Audience relevant?
- Solution: Test new creatives

**Issue 6: Ad Rejected**
- Check: Policy violation (text >20% of image?)
- Check: Prohibited content
- Check: Landing page functional
- Solution: Edit ad per Facebook feedback

---

## Success Checklist

### Week 1
- [ ] Pixel installed and verified
- [ ] Custom audiences created (6 total)
- [ ] Creative assets prepared and uploaded
- [ ] Campaign 1 (Awareness) launched
- [ ] First 1,000 impressions delivered
- [ ] Events tracking correctly

### Week 2
- [ ] Campaign 2 (Retargeting) launched
- [ ] 7-day audiences populated
- [ ] First conversions tracked
- [ ] CAC measured
- [ ] Initial optimizations made

### Week 3
- [ ] Lookalike audiences created
- [ ] A/B tests running
- [ ] Winning ad sets scaled
- [ ] Losing ad sets paused
- [ ] Weekly report generated

### Week 4
- [ ] CAC below $50 OR decision to pivot
- [ ] CVR above 10%
- [ ] ROAS trending toward positive
- [ ] Optimization strategy finalized

---

## Next Steps After Launch

1. **If Successful (CAC <$50, ROAS >0.5):**
   - Scale budget to $100/day
   - Expand to more countries
   - Test new creative angles
   - Build lookalike audiences

2. **If Marginal (CAC $50-100, ROAS 0.3-0.5):**
   - Continue optimization
   - Focus on best performers
   - Improve landing page
   - Test bigger discounts

3. **If Failing (CAC >$100, ROAS <0.3):**
   - Pause all campaigns
   - Analyze root cause
   - Pivot to organic channels
   - Reallocate budget to SEO/content

---

## Contact & Support

**Facebook Ads Support:**
- Help Center: https://www.facebook.com/business/help
- Chat Support: Available in Ads Manager
- Email: ads@fb.com

**Internal Team:**
- Marketing: [Your Email]
- Development: [Developer Email]
- Analytics: [Analytics Email]

**Documentation:**
- Full README: `/marketing/facebook-ads/README.md`
- Creative Specs: `/marketing/facebook-ads/creatives/CREATIVE-SPECS.md`
- Campaign Configs: `/marketing/facebook-ads/campaigns/`

---

**Good luck with your cherry blossom campaign! 🌸**
