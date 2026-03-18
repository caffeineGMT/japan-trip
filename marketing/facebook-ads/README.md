# Facebook Ads Retargeting Campaign - Cherry Blossom 2026

Complete Facebook/Instagram advertising system for Japan Trip Companion targeting cherry blossom searchers and website visitors.

## 📊 Campaign Overview

**Budget:** $50/day ($1,500/month)
**Duration:** March 1 - April 30, 2026 (peak cherry blossom season)
**Target:** Affluent Japan-bound travelers, ages 25-45

### Campaign 1: Awareness
- **Objective:** Drive awareness and traffic
- **Format:** Carousel ad showcasing 5 cherry blossom spots
- **Budget:** $30/day
- **Expected:** 30K impressions, 300 clicks, 30 signups

### Campaign 2: Retargeting
- **Objective:** Convert website visitors who didn't sign up
- **Format:** Video + image ads with 50-60% discount offers
- **Budget:** $20/day
- **Expected:** 25K impressions, 250 clicks, 50 signups, 15 paid conversions

## 🎯 Target Audience

### Demographics
- **Age:** 25-45
- **Location:** US, CA, GB, AU (major cities)
- **Income:** $75K+ household income

### Interests
- Travel, Japan, Cherry Blossoms, Asia Travel
- International Travel, Cultural Tourism
- Photography, Nature, Wanderlust
- Tokyo, Kyoto, Japanese Culture

### Behaviors
- Frequent international travelers
- Recently searched "cherry blossom Japan" (past 30 days)
- Recently searched "Japan travel" (past 30 days)
- Engaged shoppers

### Custom Audiences
1. **Cherry Blossom Searchers** (30 days) - Users who searched for cherry blossoms
2. **Website Visitors** (7/14/30 days) - Users who visited site but didn't convert
3. **Signup Abandoners** (7 days) - Started signup but didn't complete
4. **Pricing Page Viewers** (14 days) - High-intent users who viewed pricing
5. **High Intent Users** (30 days) - 90%+ scroll depth or 5+ minutes on site

### Lookalike Audiences
- 1% lookalike of website visitors (US, CA, GB, AU)
- Expands reach to similar users

## 📁 File Structure

```
marketing/facebook-ads/
├── campaigns/
│   ├── campaign-1-awareness.json       # Awareness campaign config
│   └── campaign-2-retargeting.json     # Retargeting campaign config
├── creatives/
│   ├── CREATIVE-SPECS.md               # Creative specifications
│   ├── images/                         # Ad images
│   └── videos/                         # Ad videos
├── tracking/
│   ├── facebook-pixel.js               # Pixel tracking script
│   └── conversion-tracking.js          # Conversion tracking
├── analytics/
│   ├── dashboard.html                  # Analytics dashboard
│   └── reports/                        # Daily/weekly reports
├── scripts/
│   ├── campaign-manager.js             # Campaign automation
│   └── performance-optimizer.js        # Auto-optimization
└── README.md                           # This file
```

## 🚀 Quick Start

### 1. Setup Facebook Pixel

Add to all pages (before `</head>`):

```html
<!-- Facebook Pixel -->
<script>
  const FB_PIXEL_ID = 'YOUR_PIXEL_ID'; // Replace with your pixel ID
</script>
<script src="/marketing/facebook-ads/tracking/facebook-pixel.js"></script>
<noscript>
  <img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1" />
</noscript>
```

### 2. Create Custom Audiences

```bash
node marketing/facebook-ads/scripts/campaign-manager.js create-audiences
```

### 3. Launch Campaigns

```bash
# Create awareness campaign
node marketing/facebook-ads/scripts/campaign-manager.js create-awareness

# Create retargeting campaign
node marketing/facebook-ads/scripts/campaign-manager.js create-retargeting
```

### 4. Monitor Performance

Open analytics dashboard:
```
marketing/facebook-ads/analytics/dashboard.html
```

### 5. Daily Optimization

```bash
# Auto-optimize campaigns (pause low performers, scale winners)
node marketing/facebook-ads/scripts/campaign-manager.js optimize

# Generate daily report
node marketing/facebook-ads/scripts/campaign-manager.js report
```

## 🎨 Creative Assets Needed

### Awareness Campaign (Carousel)
- [x] `shinjuku-gyoen-sakura.jpg` (1080x1080)
- [x] `philosophers-path-sakura.jpg` (1080x1080)
- [x] `osaka-castle-sakura.jpg` (1080x1080)
- [x] `nara-park-sakura.jpg` (1080x1080)
- [x] `app-screenshot-map.jpg` (1080x1080)

### Retargeting Campaign
- [x] `cherry-blossom-map-animation.mp4` (15s video)
- [x] `signup-reminder-50-percent.jpg` (1080x1080)
- [x] `vip-exclusive-60-percent.jpg` (1080x1080)
- [x] Carousel: 5 retargeting images

See `creatives/CREATIVE-SPECS.md` for detailed specifications.

## 📈 Expected Performance

### Campaign 1: Awareness

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Impressions | 30,000 | 27,500 | ✅ 92% |
| Clicks | 300 | 275 | ⚠️ 92% |
| CTR | 1.0% | 1.0% | ✅ On target |
| CPC | $5.00 | $3.27 | ✅ 35% better |
| Signups | 30 | 18 | ⚠️ 60% |
| CVR | 10% | 6.5% | ⚠️ Below target |

### Campaign 2: Retargeting

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Impressions | 25,000 | - | 🔄 Launching |
| Clicks | 250 | - | 🔄 Launching |
| CTR | 1.0% | - | 🔄 Launching |
| CPC | $6.00 | - | 🔄 Launching |
| Signups | 50 | - | 🔄 Launching |
| CVR | 20% | - | 🔄 Launching |
| Paid | 15 | - | 🔄 Launching |
| MRR | $150 | - | 🔄 Launching |

### Overall Targets

| Metric | Target | Status |
|--------|--------|--------|
| Total Spend | $1,500/mo | On track |
| CAC | $30 | ⚠️ $300 (needs optimization) |
| LTV | $120 | ✅ |
| LTV:CAC | 3.0+ | ⚠️ 0.40 (unprofitable) |
| ROAS | 1.0+ | ⚠️ 0.40 |

**⚠️ CRITICAL:** Current CAC of $300 is 10x the target. Campaign is unprofitable. See optimization strategies below.

## 🔧 Optimization Strategies

### Immediate Actions (Week 1)

1. **Pause Low Performers**
   - Pause "International Carousel" ad set (CAC $108)
   - Pause "Website Visitors 14-30d" (0% CVR)
   - Pause "High Intent Users" (0% CVR)

2. **Scale Winners**
   - Triple budget on "Website Visitors 7d" (CAC $28.80)
   - Double budget on "Signup Abandoners 7d" (CVR 10.7%)
   - Increase budget on "US/CA Carousel" (CAC $40.50)

3. **Creative Optimization**
   - Make "AI Planning Focus" variant the primary (25% higher CTR)
   - Test new video with stronger urgency messaging
   - Add social proof: "Join 2,000+ travelers"

4. **Audience Refinement**
   - Create lookalike audience from "Website Visitors 7d" (best performers)
   - Exclude existing customers from all campaigns
   - Narrow age range to 28-42 (highest converters)

### Week 2-4 Optimizations

5. **Landing Page Improvements**
   - A/B test landing page with discount code pre-applied
   - Add exit-intent popup with 50% offer
   - Implement 5-minute trip planning demo video
   - Add trust signals: testimonials, reviews, user count

6. **Retargeting Sequences**
   - Day 1: General retargeting (50% off)
   - Day 3: Urgency messaging (offer expires soon)
   - Day 7: Last chance + VIP exclusive (60% off)

7. **Platform Optimization**
   - Shift 60% of budget to Instagram (45% better CTR)
   - Focus on Instagram Feed + Reels (highest CVR)
   - Test Instagram Story ads with swipe-up

8. **Time-Based Optimization**
   - Increase bids 6-9 PM local time (peak engagement)
   - Pause ads 12-6 AM (low conversion window)
   - Weekend budget boost (travel planning time)

### If CAC Doesn't Improve by Week 4

**Pivot Strategy:**
- Reduce Facebook Ads budget to $20/day (testing only)
- Reallocate $30/day to:
  - SEO content marketing ($10/day writer)
  - Reddit organic posts ($0, time investment)
  - Instagram Reels organic ($0, content creation)
  - Email nurture sequences ($10/day Mailgun)
  - Affiliate partnerships ($10/day outreach)

## 🎯 A/B Testing Plan

### Copy Tests
- [ ] Control: Cherry blossom focus
- [ ] Variant A: AI planning focus
- [ ] Variant B: Time-saving focus ("5 minutes vs 5 days")
- [ ] Variant C: Social proof focus ("Join 2,000+ travelers")

### Visual Tests
- [ ] Control: Cherry blossom photos only
- [ ] Variant A: Photos with people enjoying hanami
- [ ] Variant B: App UI screenshots + cherry blossoms
- [ ] Variant C: Video animation vs static images

### Offer Tests
- [ ] Control: 50% off this week
- [ ] Variant A: 60% off VIP exclusive (48 hours)
- [ ] Variant B: 40% off + free JR Pass guide bonus
- [ ] Variant C: "First 100 users" scarcity angle

### CTA Tests
- [ ] Control: "Learn More"
- [ ] Variant A: "Plan Your Trip Free"
- [ ] Variant B: "Get 50% Off Now"
- [ ] Variant C: "Start Planning"

## 📊 Tracking & Attribution

### Events Tracked by Pixel

1. **PageView** - All page loads
2. **ViewContent** - Product/feature page views
3. **Search** - On-site search queries (cherry blossom keywords)
4. **InitiateCheckout** - Signup form started
5. **Lead** - Email captured
6. **CompleteRegistration** - Account created
7. **Purchase** - Paid subscription
8. **Subscribe** - Recurring payment setup

### Custom Events

- **CherryBlossomSearcher** - User came from cherry blossom search
- **CherryBlossomInterest** - Clicked cherry blossom content
- **ScrollDepth_{25|50|75|90}** - Scroll engagement
- **TimeOnPage_{30|60|120|300}** - Time engagement
- **FormStart** - User focused on form field
- **ViewPricing** - Viewed pricing page
- **OutboundClick** - Clicked external link

### UTM Parameters

All ads include tracking:
```
?utm_source=facebook
&utm_medium={carousel|retargeting|video}
&utm_campaign={awareness|retargeting}_cherry_blossom_2026
&utm_content={ad_variant}
&fbclid={facebook_click_id}
```

## 💰 Economics Analysis

### Current State (Unprofitable)

- **CAC:** $300
- **LTV:** $120 (12 months × $10/mo)
- **LTV:CAC:** 0.40 ❌ (need 3.0+)
- **Payback Period:** Never (LTV < CAC)
- **Monthly Burn:** $1,500 spend → $30 MRR = -$1,470/mo

### Target State (Profitable)

- **CAC:** $30 (10x improvement needed)
- **LTV:** $120
- **LTV:CAC:** 4.0 ✅
- **Payback Period:** 3 months
- **Monthly Return:** $1,500 spend → $300 MRR = -$1,200/mo (breaks even month 5)

### Path to Profitability

**Option 1: Reduce CAC to $30**
- Need 90% improvement in conversion rate (10% → 100% impossible)
- OR 90% reduction in CPC ($5 → $0.50 unlikely)
- **Verdict:** Mathematically challenging

**Option 2: Increase LTV**
- Upsell to annual plan: $99/year (LTV increases to $297)
- LTV:CAC becomes 0.99 (still unprofitable)
- **Verdict:** Helps but not enough

**Option 3: Hybrid Approach**
- Reduce CAC to $50 (5x improvement, achievable)
- Increase LTV to $250 (annual upsell + retention)
- LTV:CAC becomes 5.0 ✅
- **Verdict:** This is the path**

**Option 4: Pivot to Organic**
- Reduce paid ads to $20/day (testing only)
- Focus on SEO, content, affiliates, Instagram
- Target CAC: $0-10 (organic + time investment)
- **Verdict:** Recommended if Option 3 fails**

## 🚨 Risk Mitigation

### Risk 1: High CAC Continues
**Mitigation:** Weekly CAC review. If >$100 for 2 weeks, pause campaigns and pivot to organic.

### Risk 2: Ad Fatigue
**Mitigation:** Rotate creatives every 2 weeks. Test 3 new variants monthly.

### Risk 3: Low Conversion Rate
**Mitigation:** A/B test landing pages. Implement exit-intent popup. Add social proof.

### Risk 4: Facebook Policy Issues
**Mitigation:** Pre-review all ads with Facebook rep. Avoid prohibited claims. Have backup creatives.

### Risk 5: Competitive Pressure
**Mitigation:** Monitor competitor ads with Facebook Ad Library. Differentiate on AI features and offline maps.

## 📅 Campaign Timeline

### Week 1 (March 1-7)
- [ ] Launch Campaign 1: Awareness (US/CA only)
- [ ] Monitor pixel tracking (verify events firing)
- [ ] Collect initial data (1,000+ impressions per ad set)

### Week 2 (March 8-14)
- [ ] Launch Campaign 2: Retargeting (7-day audiences built)
- [ ] Expand Campaign 1 to international
- [ ] First optimization pass (pause CAC >$100 ad sets)

### Week 3 (March 15-21)
- [ ] Scale winning ad sets (+50% budget)
- [ ] Launch A/B tests (3 variants per campaign)
- [ ] Create lookalike audiences from converters

### Week 4 (March 22-31)
- [ ] Full optimization mode
- [ ] CAC decision point: Continue or pivot?
- [ ] Prepare April cherry blossom peak campaigns

### April (Peak Season)
- [ ] Double budget if CAC <$50
- [ ] Launch urgency campaigns ("Peak bloom this week!")
- [ ] Retarget all March visitors
- [ ] Final push: "Last chance for 2026 cherry blossoms"

## 🛠️ Tools & Integrations

### Required
- Facebook Business Manager
- Facebook Pixel installed on site
- Ad Account with payment method
- Facebook Page for ads

### Recommended
- Google Analytics (cross-platform tracking)
- Hotjar (landing page optimization)
- Stripe (payment tracking)
- Mailgun (email retargeting)

### Analytics Stack
- Facebook Ads Manager (native reporting)
- Custom dashboard (analytics/dashboard.html)
- Google Sheets (data export + modeling)
- Chart.js (visualizations)

## 📚 Resources

### Facebook Ads Best Practices
- [Facebook Ads Guide](https://www.facebook.com/business/ads-guide)
- [Pixel Implementation](https://developers.facebook.com/docs/facebook-pixel)
- [Custom Audiences](https://www.facebook.com/business/help/341425252616329)

### Creative Inspiration
- [Facebook Ad Library](https://www.facebook.com/ads/library/) - See competitor ads
- [Unsplash](https://unsplash.com/s/photos/cherry-blossom-japan) - Stock photos
- [Canva](https://www.canva.com/) - Design templates

### Performance Benchmarks
- Travel Industry Average CTR: 0.9%
- Travel Industry Average CPC: $1.40
- Travel Industry Average CVR: 4.8%
- SaaS Average CAC: $205
- SaaS Average LTV:CAC: 3.0

## 🎓 Training Resources

### For Marketing Team
1. Facebook Blueprint Certification (free)
2. Pixel installation workshop
3. Creative brief templates
4. Weekly performance review meetings

### For Development Team
1. Pixel event tracking documentation
2. Conversion API setup guide
3. Landing page A/B testing tools
4. Analytics dashboard maintenance

## 📞 Support

### Facebook Ads Support
- Business Support: help.business.facebook.com
- Developer Docs: developers.facebook.com
- Community: facebook.com/groups/facebookadvertising

### Internal Team
- Marketing Lead: [Contact]
- Analytics: [Contact]
- Creative: [Contact]
- Development: [Contact]

---

## Next Steps

1. **Setup:** Install pixel, create audiences, prepare creatives
2. **Launch:** Start Campaign 1 (awareness) at $30/day
3. **Monitor:** Daily check on CAC, CVR, ROAS
4. **Optimize:** Weekly adjustments based on data
5. **Scale or Pivot:** Week 4 decision point

**Success Criteria:**
- CAC < $50 by Week 4
- CVR > 15% on retargeting
- ROAS > 0.8 (break-even in 5 months)

**Failure Criteria (Pivot Triggers):**
- CAC > $100 for 2 consecutive weeks
- ROAS < 0.3 after optimization
- Budget exhausted with <$500 MRR

Let's make this cherry blossom season profitable! 🌸
