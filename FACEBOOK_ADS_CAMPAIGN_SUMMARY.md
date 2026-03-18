# Facebook Ads Retargeting Campaign - Executive Summary

## 🎯 Campaign Overview

**Objective:** Acquire paying customers for Japan Trip Companion by targeting cherry blossom searchers and retargeting website visitors.

**Budget:** $1,500/month ($50/day)
**Duration:** March 1 - April 30, 2026 (peak cherry blossom season)
**Target Market:** Affluent travelers planning Japan trips (ages 25-45)

---

## 📊 Two-Campaign Strategy

### Campaign 1: Awareness ($30/day)
- **Goal:** Drive awareness and website traffic
- **Format:** Carousel ad featuring 5 cherry blossom locations
- **Audience:** Cherry blossom searchers (past 30 days), Japan travel enthusiasts
- **Expected:** 30K impressions → 300 clicks → 30 signups

### Campaign 2: Retargeting ($20/day)
- **Goal:** Convert website visitors who didn't sign up
- **Format:** Video + image ads with 50-60% discount offers
- **Audience:** Website visitors (7/14/30 days), signup abandoners
- **Expected:** 25K impressions → 250 clicks → 50 signups → 15 paid conversions

---

## 💰 Financial Projections

### Target Economics (GOAL)
- **CAC:** $30
- **LTV:** $120 (12 months × $10/mo)
- **LTV:CAC Ratio:** 4.0x ✅
- **Monthly Revenue:** $300 MRR from 30 paid users
- **Payback Period:** 3 months

### Current Reality (CHALLENGE)
- **Actual CAC:** $300 ⚠️
- **Actual LTV:CAC:** 0.40x (unprofitable)
- **Monthly Revenue:** $30 MRR (90% below target)

**Action Required:** Reduce CAC by 10x OR pivot to organic channels

---

## 🚀 Implementation Files Created

### Core System Files

1. **`marketing/facebook-ads/tracking/facebook-pixel.js`**
   - Complete pixel tracking implementation
   - Auto-tracks: page views, clicks, scroll depth, form interactions, video plays
   - Custom audience tagging (cherry blossom searchers, high-intent users)

2. **`marketing/facebook-ads/campaigns/campaign-1-awareness.json`**
   - Awareness campaign configuration
   - Carousel ad specs (5 cards)
   - Targeting: cherry blossom searchers, Japan travel enthusiasts
   - A/B test variants (cherry blossom focus, AI focus, time-saving focus)

3. **`marketing/facebook-ads/campaigns/campaign-2-retargeting.json`**
   - Retargeting campaign configuration
   - Video + image ad specs
   - 4 ad sets targeting different audience segments
   - Discount offers: 50% (general), 60% (VIP), 40% + bonus

4. **`marketing/facebook-ads/creatives/CREATIVE-SPECS.md`**
   - Detailed creative specifications
   - Image requirements (1080x1080, <20% text)
   - Video storyboard (15-second animation)
   - Brand guidelines and asset checklist

5. **`marketing/facebook-ads/analytics/dashboard.html`**
   - Real-time analytics dashboard
   - Key metrics: impressions, clicks, CTR, CPC, CAC, CVR, ROAS
   - Campaign breakdown table
   - Performance charts (Chart.js)
   - AI-powered insights and recommendations

6. **`marketing/facebook-ads/scripts/campaign-manager.js`**
   - Campaign automation script
   - Create campaigns via API
   - Auto-optimize based on performance
   - Generate daily reports
   - Pause low performers, scale winners

7. **`marketing/facebook-ads/README.md`**
   - Complete documentation
   - Setup instructions
   - Optimization strategies
   - Risk mitigation
   - Success/failure criteria

8. **`marketing/facebook-ads/IMPLEMENTATION-GUIDE.md`**
   - Step-by-step setup guide
   - Facebook Business Manager setup
   - Pixel installation instructions
   - Custom audience creation
   - Campaign launch checklist
   - Testing and troubleshooting

9. **`marketing/facebook-ads/.env.example`**
   - Environment configuration template
   - Facebook API credentials
   - Campaign settings
   - Optimization thresholds

---

## 📋 Setup Checklist

### Phase 1: Facebook Business Setup (Day 1)
- [ ] Create Facebook Business Manager account
- [ ] Create Facebook Page for Japan Trip Companion
- [ ] Create Ad Account with payment method
- [ ] Create Facebook Pixel
- [ ] Note Pixel ID, Ad Account ID, Page ID

### Phase 2: Pixel Installation (Day 1-2)
- [ ] Add pixel code to `index.html` (before `</head>`)
- [ ] Add pixel to `/early-access`, `/pricing`, `/success`
- [ ] Install Meta Pixel Helper Chrome extension
- [ ] Test pixel firing (PageView, ViewContent, Lead)
- [ ] Verify events in Facebook Events Manager

### Phase 3: Audience Creation (Day 2)
- [ ] Create custom audiences (6 total):
  - websiteVisitors_7d
  - websiteVisitors_30d
  - cherryBlossomSearchers_30d
  - signupAbandoners_7d
  - pricingPageViewers_14d
  - highIntentUsers_30d
- [ ] Create lookalike audiences (1% US, CA, GB, AU)
- [ ] Create exclusion audiences (existing customers)

### Phase 4: Creative Preparation (Day 2-3)
- [ ] Prepare 5 carousel images (1080x1080):
  - Shinjuku Gyoen cherry blossoms
  - Philosopher's Path, Kyoto
  - Osaka Castle Park
  - Nara Park with deer
  - App screenshot
- [ ] Create 15-second video animation
- [ ] Upload assets to Facebook Ads Manager
- [ ] Note image hashes and video ID

### Phase 5: Campaign Launch (Day 3)
- [ ] Create Campaign 1: Awareness ($30/day)
  - Ad Set 1: US/CA Carousel
  - Ad Set 2: International Carousel
- [ ] Create Campaign 2: Retargeting ($20/day)
  - Ad Set 1: Website Visitors 7d ($20/day)
  - Ad Set 2: Signup Abandoners 7d ($15/day)
  - Ad Set 3: Website Visitors 14-30d ($10/day)
  - Ad Set 4: High Intent Users ($5/day)
- [ ] Submit for Facebook review
- [ ] Set campaigns to Active after approval

### Phase 6: Monitoring & Optimization (Ongoing)
- [ ] Daily: Check dashboard, review CAC/CVR
- [ ] Weekly: Optimize campaigns, pause low performers
- [ ] Week 4: CAC decision - continue or pivot?

---

## 🎨 Creative Assets Required

### Images (All 1080 x 1080 px, JPG, <5MB)
1. `shinjuku-gyoen-sakura.jpg` - Cherry blossoms at Shinjuku Gyoen
2. `philosophers-path-sakura.jpg` - Canal path in Kyoto
3. `osaka-castle-sakura.jpg` - Castle with cherry blossoms
4. `nara-park-sakura.jpg` - Deer with cherry blossoms
5. `app-screenshot-map.jpg` - App UI showing map
6. `signup-reminder-50-percent.jpg` - Retargeting urgency
7. `vip-exclusive-60-percent.jpg` - VIP offer
8. `retargeting-visited-site.jpg` - Welcome back message
9. `retargeting-ai-planning.jpg` - AI features
10. `retargeting-forecast.jpg` - Forecast widget

### Video
- `cherry-blossom-map-animation.mp4` (15s, 1080x1080 or 1080x1920)
  - Scenes: Blossoms blooming → Map animation → App UI → CTA

**Source Options:**
- Stock: Unsplash, Pexels, Pixabay (free, high quality)
- Hire: Fiverr photographer in Japan ($50-100)
- DIY: Canva templates + screen recordings

---

## 📈 Success Metrics

### Week 1 Targets
- Impressions: 7,500
- Clicks: 75
- CTR: 1.0%
- Signups: 7-8
- CAC: <$100 (acceptable for week 1)

### Week 2 Targets
- Impressions: 15,000
- Clicks: 150
- Signups: 15
- CAC: <$75

### Week 3 Targets
- Impressions: 22,500
- Clicks: 225
- Signups: 23
- CAC: <$60

### Week 4 Targets (DECISION POINT)
- Impressions: 30,000
- Clicks: 300
- Signups: 30
- **CAC: <$50 OR PIVOT**

### End of Month (April 30)
- Total Spend: $3,000
- Total Signups: 80+
- Paid Conversions: 20+
- MRR: $200+
- CAC: <$50
- ROAS: >0.8

---

## ⚠️ Risk Factors & Mitigation

### Risk 1: High CAC (>$100)
**Impact:** Unprofitable, burn cash
**Probability:** HIGH (currently at $300)
**Mitigation:**
- Weekly CAC review and optimization
- Pause ad sets with CAC >$100
- Scale winners (CAC <$30)
- If CAC stays >$100 for 2 weeks → PIVOT

### Risk 2: Low Conversion Rate (<5%)
**Impact:** High CAC, low signups
**Probability:** MEDIUM
**Mitigation:**
- A/B test landing pages
- Add exit-intent popup with offer
- Improve social proof (testimonials, user count)
- Test different discount amounts

### Risk 3: Ad Fatigue
**Impact:** Declining CTR over time
**Probability:** MEDIUM
**Mitigation:**
- Rotate creatives every 2 weeks
- Test 3 new variants monthly
- Refresh copy and offers
- Expand to new audiences

### Risk 4: Facebook Policy Violations
**Impact:** Ads rejected or account banned
**Probability:** LOW
**Mitigation:**
- Pre-review ads with Facebook rep
- Avoid prohibited claims ("lose weight", "get rich")
- Keep text overlay <20% of image
- Ensure landing page functional

### Risk 5: Budget Overruns
**Impact:** Overspend, negative ROI
**Probability:** LOW
**Mitigation:**
- Daily budget caps ($50/day max)
- Account spending limit ($1,500/month)
- Daily monitoring and alerts
- Auto-pause scripts if spend >$75/day

---

## 🔄 Optimization Playbook

### If CAC >$100 (Red Alert)
1. **Immediate:** Pause worst 50% of ad sets
2. **Today:** Increase budget on best performers
3. **This Week:** Test new creative variants
4. **Week 2:** If still >$100, pivot to organic

### If CAC $50-100 (Yellow Alert)
1. **This Week:** Optimize targeting (narrow or broaden)
2. **This Week:** Test discount increase (50% → 60%)
3. **This Week:** Improve landing page (add demo video)
4. **Next Week:** Create lookalike of converters

### If CAC <$50 (Green Light)
1. **Today:** Increase budget by 50%
2. **This Week:** Expand to new countries
3. **This Week:** Test premium tier upsell
4. **Next Week:** Scale to $100/day

### If CVR <5% (Conversion Problem)
1. **Today:** A/B test landing page
2. **This Week:** Add exit-intent popup
3. **This Week:** Implement discount code auto-apply
4. **Next Week:** Add social proof + urgency

### If CVR >15% (Excellent)
1. **Today:** Increase budget by 100%
2. **This Week:** Expand audiences
3. **This Week:** Test higher pricing
4. **Next Week:** Build lookalikes

---

## 🔀 Pivot Strategy (If Facebook Ads Fail)

**Trigger Conditions:**
- CAC >$100 after 4 weeks of optimization
- Total spend >$2,000 with <$200 MRR
- ROAS <0.3 consistently

**Pivot Plan:**

1. **Reduce Facebook Ads to $10/day** (testing only)
2. **Reallocate $40/day to:**
   - SEO Content ($15/day) - 100 destination landing pages
   - Reddit Organic ($0) - 3 posts/week in r/JapanTravel
   - Instagram Reels ($0) - 5 reels/week showcasing features
   - Email Nurture ($10/day) - 9-email drip campaign
   - Affiliate Partners ($15/day) - 50 travel blogger outreach

3. **Focus on Organic Growth:**
   - Target CAC: $0-10 (time investment)
   - Timeline: 3-6 months to see results
   - Goal: 500 organic signups, 100 paid users

---

## 📞 Support & Resources

### Documentation
- **Full README:** `/marketing/facebook-ads/README.md`
- **Implementation Guide:** `/marketing/facebook-ads/IMPLEMENTATION-GUIDE.md`
- **Creative Specs:** `/marketing/facebook-ads/creatives/CREATIVE-SPECS.md`

### Tools
- **Analytics Dashboard:** `/marketing/facebook-ads/analytics/dashboard.html`
- **Campaign Manager Script:** `/marketing/facebook-ads/scripts/campaign-manager.js`
- **Pixel Tracking:** `/marketing/facebook-ads/tracking/facebook-pixel.js`

### External Resources
- Facebook Business Help: https://www.facebook.com/business/help
- Facebook Ads Guide: https://www.facebook.com/business/ads-guide
- Pixel Documentation: https://developers.facebook.com/docs/facebook-pixel
- Facebook Ad Library: https://www.facebook.com/ads/library (spy on competitors)

---

## 🎯 Bottom Line

**The Challenge:**
Current CAC of $300 is 10x higher than the $30 target, making the campaign unprofitable. We need a 90% reduction in CAC to achieve profitability.

**The Plan:**
1. **Week 1-2:** Launch both campaigns, collect data
2. **Week 3:** Aggressive optimization - pause losers, scale winners
3. **Week 4:** CAC decision point - continue if <$50, pivot if >$100
4. **Month 2:** If successful, scale to $100/day; if not, pivot to organic

**The Opportunity:**
If we can achieve $50 CAC with 20% retargeting conversion rate, this campaign becomes profitable with a 2.4x LTV:CAC ratio, generating $500+ MRR by month 3.

**The Reality Check:**
Based on current performance ($300 CAC), we're on track to lose money. Facebook Ads may not be the right channel for Japan Trip Companion. Be prepared to pivot to SEO, content marketing, and organic social media if optimization doesn't dramatically improve results.

**Next Steps:**
1. Complete Phase 1-5 setup (3 days)
2. Launch campaigns March 1
3. Monitor daily for first week
4. Week 4 decision: scale or pivot

---

**Let's make cherry blossom season 2026 profitable! 🌸**

Campaign built and ready to launch. All files in `/marketing/facebook-ads/`.
