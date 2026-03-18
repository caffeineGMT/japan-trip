# PostHog Conversion Funnel Analytics - Complete Setup & Optimization Guide

## 🎯 Executive Summary

This guide provides a complete implementation of conversion funnel analytics using PostHog to track the user journey from first visit to paid conversion. Target: **15% free-to-trial conversion**, **25% trial-to-paid conversion** = **3.75% overall free-to-paid conversion rate**.

**Current Implementation Status:** ✅ COMPLETE
- Analytics library: ✅ `/lib/analytics.js`
- PostHog initialization: ✅ `/lib/analytics-init.js`
- Frontend tracking: ✅ Integrated in `script.js`, `pricing-v2.html`, `success.html`
- Backend tracking: ✅ Stripe webhook with PostHog
- Server-side API: ✅ `/api/analytics.js`

---

## 📊 Conversion Funnel Structure

### Primary Funnel (5 Stages)

```
1. app_loaded (100%)
   ↓ (Engagement Gate - should be 40%+)
2. day_selected (40%)
   ↓ (Interest - should be 20%+)
3. upgrade_clicked (20%)
   ↓ (Trial - should be 75%+)
4. trial_started (15%)
   ↓ (Purchase - should be 25%+)
5. purchase_completed (3.75%)
```

### Event Definitions

| Event Name | Description | Where Tracked | Properties |
|------------|-------------|---------------|------------|
| `app_loaded` | User loads the app for first time | `script.js:77` | `template_id`, UTM params |
| `day_selected` | User interacts with day tabs | `script.js:329` | `day_index`, `city`, `engagement_time` |
| `upgrade_clicked` | User clicks any upgrade/pricing CTA | `pricing-v2.html:766` | `plan_type`, `page`, `ab_variant` |
| `trial_started` | User completes free trial signup | `early-access.html` | `plan_name`, `signup_method` |
| `checkout_completed` | Stripe checkout session completed | `webhook.js:184` | `session_id`, `amount`, `plan` |
| `purchase_completed` | Payment processed successfully | `webhook.js:68` + `success.html:125` | `transaction_id`, `amount`, `plan`, `billing_cycle` |

---

## 🔧 PostHog Setup Instructions

### Step 1: Create Your PostHog Account

1. Go to [posthog.com](https://posthog.com) and sign up
2. Create a new project: "Japan Trip Companion - Production"
3. Copy your API key from Project Settings → API Keys
4. **Save it securely** - you'll need it for environment variables

### Step 2: Configure Environment Variables

Add to your `.env` file:

```bash
# PostHog Analytics
POSTHOG_API_KEY=phc_YOUR_ACTUAL_API_KEY_HERE
POSTHOG_HOST=https://app.posthog.com
```

Add to Vercel environment variables:
```
Production: POSTHOG_API_KEY = phc_YOUR_KEY
Preview: POSTHOG_API_KEY = phc_YOUR_KEY (or separate dev key)
```

### Step 3: Create the Conversion Funnel in PostHog

1. **Navigate to Insights** → **New Insight** → **Funnel**

2. **Configure Funnel Steps:**
   ```
   Step 1: Event: app_loaded
   Step 2: Event: day_selected
   Step 3: Event: upgrade_clicked
   Step 4: Event: trial_started
   Step 5: Event: purchase_completed
   ```

3. **Set Conversion Window:**
   - Window: **14 days** (users may research before purchasing)
   - Attribution: **First touch** (credit the original source)

4. **Add Breakdowns:**
   - By `utm_source` (track which channels convert best)
   - By `utm_campaign` (track which campaigns work)
   - By `ab_variant` (A/B test performance)
   - By `plan_type` (monthly vs annual conversion)

5. **Save as Dashboard Widget:**
   - Name: "Primary Conversion Funnel"
   - Add to dashboard: "Revenue Dashboard"

### Step 4: Set Up Critical Metrics Dashboard

Create a new dashboard called **"Revenue Acceleration Dashboard"** with these widgets:

#### 1. Conversion Rates (Trends)
```
Metric: purchase_completed / app_loaded * 100
Time Range: Last 30 days
Granularity: Daily
Goal Line: 3.75%
```

#### 2. Drop-off Analysis (Funnel)
```
Same funnel as above
View: Conversion rate between steps
Highlight: Steps with >50% drop-off
```

#### 3. Time to Convert (Trends)
```
Formula: Average time between app_loaded and purchase_completed
Segment by: utm_source
Target: <7 days
```

#### 4. Revenue Attribution (Trends)
```
Event: purchase_completed
Property: amount
Group by: utm_source
Display: Total revenue per source
```

#### 5. Trial-to-Paid Conversion (Trends)
```
Metric: purchase_completed / trial_started * 100
Target: 25%
```

#### 6. Upgrade Click Rate (Trends)
```
Metric: upgrade_clicked / day_selected * 100
Target: 50% (engagement to interest)
```

### Step 5: Configure Alerts

Set up PostHog alerts for anomalies:

1. **Drop-off Alert:**
   - Trigger: Conversion rate drops below 2.5%
   - Action: Email + Slack notification
   - Frequency: Daily

2. **Revenue Alert:**
   - Trigger: Daily revenue < $100 (adjust based on volume)
   - Action: Email notification
   - Frequency: Daily at 9 AM

3. **Trial Abandonment Alert:**
   - Trigger: Trial-to-paid conversion < 20%
   - Action: Investigate and optimize
   - Frequency: Weekly

---

## 📈 Funnel Optimization Playbook

### Drop-off Point #1: app_loaded → day_selected (Target: 40%+)

**Problem:** Users land but don't engage with content

**Diagnosis Queries:**
```sql
-- In PostHog Insights
Event: app_loaded
Filter: day_selected NOT performed within 2 minutes
Breakdown: utm_source
```

**Optimizations:**
1. **Add Interactive Tutorial:** Show first-time users how to explore days
2. **Auto-select Day 1:** Don't require user action to see content
3. **Sticky What's Next Widget:** Highlight current activity immediately
4. **Reduce Initial Load Time:** Lazy load maps/images
5. **A/B Test:** Hero CTA "Explore Day 1" vs "See Full Itinerary"

**Implementation:**
```javascript
// In script.js, after template loads
if (isFirstVisit()) {
  showOnboardingTooltip('Click any day to explore!');
  setTimeout(() => selectDay(0), 500); // Auto-select first day
}
```

**Success Metric:** Increase to 50% engagement rate

---

### Drop-off Point #2: day_selected → upgrade_clicked (Target: 50%+)

**Problem:** Users engage but don't show purchase intent

**Diagnosis Queries:**
```sql
-- Users who engaged but didn't click upgrade
Event: day_selected
Count: >= 3 (engaged users)
Filter: upgrade_clicked NOT performed within session
Breakdown: session_duration
```

**Optimizations:**
1. **Paywall After 3 Days:** "Unlock 11 more days with Premium"
2. **Feature Teasers:** Show locked features (offline mode, AI assistant)
3. **Social Proof:** "5,243 travelers planning trips this month"
4. **Exit Intent Popup:** Offer 20% discount when user tries to leave
5. **Contextual CTAs:** "Save this itinerary (Premium)" on map

**A/B Test - Paywall Copy:**
- **Variant A (Scarcity):** "Limited spots: 7-day trial ending soon"
- **Variant B (Value):** "Unlock all 20 destinations + offline mode"
- **Variant C (Social Proof):** "Join 5K+ happy travelers"

**Implementation:**
```javascript
// Track engagement depth
let daysViewed = new Set();

function selectDay(index) {
  daysViewed.add(index);

  // Show paywall after 3 days
  if (daysViewed.size === 3 && !isPremiumUser()) {
    showPaywallModal({
      trigger: 'engagement_limit',
      daysViewed: daysViewed.size,
    });

    Analytics.track('paywall_shown', {
      trigger: 'day_limit_3',
      days_viewed: daysViewed.size,
    });
  }
}
```

**Success Metric:** 50% of engaged users click upgrade

---

### Drop-off Point #3: upgrade_clicked → trial_started (Target: 75%+)

**Problem:** Users interested but don't complete signup

**Diagnosis Queries:**
```sql
-- Checkout abandonment
Event: upgrade_clicked
Filter: trial_started NOT performed within 10 minutes
Breakdown: device_type (mobile vs desktop)
```

**Optimizations:**
1. **Remove Friction:**
   - No credit card for free trial
   - Email-only signup (no password initially)
   - Social login (Google, Apple)
   - Auto-fill from URL params

2. **Reduce Form Fields:**
   - **Before:** Email, Password, Name, Country (4 fields)
   - **After:** Email only (1 field, verify later)

3. **Clear Value Props:**
   - "7 days free, cancel anytime"
   - "No credit card required"
   - "Instant access"

4. **Trust Signals:**
   - "Join 5,243 travelers"
   - Testimonials on signup page
   - Money-back guarantee badge

**A/B Test - Signup Flow:**
- **Variant A:** Email → Password → Start trial (2 steps)
- **Variant B:** Email only → Magic link → Start trial (1 step)
- **Variant C:** Google OAuth → Start trial (0 steps)

**Implementation:**
```javascript
// Simplified trial signup
async function startFreeTrial(email) {
  // Track trial initiation
  Analytics.track('trial_started', {
    email_domain: email.split('@')[1],
    signup_method: 'email_only',
    friction_reduced: true,
  });

  // Send magic link instead of password
  await sendMagicLink(email);

  // Redirect immediately to app with temp session
  window.location.href = '/?trial=active&new=true';
}
```

**Success Metric:** 80% of upgrade clicks convert to trial starts

---

### Drop-off Point #4: trial_started → purchase_completed (Target: 25%+)

**Problem:** Users try trial but don't convert to paid

**Diagnosis Queries:**
```sql
-- Trial users who didn't convert
Event: trial_started
Filter: purchase_completed NOT performed within 7 days
Breakdown: feature_usage (which features they used)
```

**Optimizations:**

#### **1. Activation Sequence (Days 1-7)**

**Day 1:** Welcome email + Quick wins
- Subject: "Your Japan trip just got easier ✈️"
- Show 3 quick features: Offline maps, weather, phrases
- CTA: "Explore your first destination"

**Day 2:** Feature highlight
- Subject: "Hidden gem: AI-powered restaurant recs"
- Showcase premium feature in action
- Social proof: "347 reservations made this week"

**Day 3:** Engagement check
- If low usage: "Need help getting started?"
- If high usage: "Loving it? Upgrade now for 20% off"

**Day 5:** Urgency reminder
- Subject: "2 days left in your trial"
- Show what they'll lose: "Your saved places will be deleted"
- CTA: "Keep full access for $8/month"

**Day 6:** Last chance offer
- Subject: "Final day: Lock in your discount"
- Time-limited 30% off for trial users
- Testimonials from converted users

**Day 8:** Win-back campaign (if not converted)
- Subject: "We miss you! Here's 40% off to come back"
- Reactivation offer valid for 48 hours

#### **2. In-App Conversion Triggers**

```javascript
// Progressive disclosure of premium value
const conversionTriggers = {
  day1: 'welcome_tour',        // Onboarding completed
  day2: 'saved_3_places',      // User is engaged
  day3: 'used_offline_mode',   // Experienced premium feature
  day4: 'viewed_5_days',       // Deep engagement
  day5: 'trial_expiring_soon', // Urgency
  day6: 'last_chance',         // FOMO
};

function checkConversionTrigger() {
  const userActions = getUserTrialActions();
  const dayInTrial = getDaysSinceTrialStart();

  if (dayInTrial === 3 && userActions.savedPlaces >= 3) {
    showUpgradeModal({
      variant: 'engaged_user',
      message: "You're crushing it! Save your progress forever",
      discount: 20,
      urgency: `${7 - dayInTrial} days left`,
    });
  }
}
```

#### **3. Feature Usage Correlation**

Track which features predict conversion:

```javascript
// In PostHog, create correlation analysis
Event: purchase_completed
Correlate with: All feature usage events
Sort by: Correlation strength

// Hypothesis: Users who use offline mode convert 3x more
// Double down on promoting offline mode during trial
```

#### **4. Retargeting Campaigns**

- **Facebook/Instagram Ads:** Target trial users who didn't convert
  - Creative: "Missing your trip plans? Your Japan itinerary is waiting"
  - Offer: 25% lifetime discount
  - Frequency cap: 3 impressions over 14 days

- **Email Retargeting:**
  - Segment: `trial_started` but not `purchase_completed` within 30 days
  - Campaign: 3-email sequence with escalating discounts (20% → 30% → 40%)

**Success Metric:** 30% trial-to-paid conversion

---

## 🔬 A/B Testing Strategy

### Test #1: Paywall Timing
- **Hypothesis:** Earlier paywall increases trial starts but may reduce engagement
- **Variants:**
  - A: Paywall after 2 days viewed (control)
  - B: Paywall after 3 days viewed
  - C: Paywall after 5 days viewed
  - D: No paywall, only pricing page CTA
- **Metric:** Overall conversion rate (app_loaded → purchase_completed)
- **Sample size:** 200 conversions per variant (800 total)
- **Duration:** ~14 days at 50 conversions/week

### Test #2: Pricing Page Copy
- **Hypothesis:** Value-focused copy converts better than urgency
- **Variants:**
  - A: "Join 5,000+ travelers" (social proof)
  - B: "Last chance: Trial ending soon" (urgency)
  - C: "Unlock all 20 destinations" (value)
- **Metric:** upgrade_clicked → trial_started conversion
- **Sample size:** 100 conversions per variant
- **Duration:** ~7 days

### Test #3: Trial Length
- **Hypothesis:** 7-day trial converts better than 14-day
- **Variants:**
  - A: 7-day trial (control)
  - B: 14-day trial
  - C: 3-day trial with urgency
- **Metric:** trial_started → purchase_completed
- **Sample size:** 150 conversions per variant
- **Duration:** 21 days (need full trial period + conversion window)

### Test #4: Checkout Flow
- **Hypothesis:** 1-click checkout increases conversion
- **Variants:**
  - A: Standard Stripe checkout (control)
  - B: Apple Pay / Google Pay fast checkout
  - C: Email-only, payment after trial
- **Metric:** upgrade_clicked → purchase_completed
- **Sample size:** 100 conversions per variant

---

## 📊 Revenue Attribution & ROI Tracking

### UTM Parameter Strategy

```
Landing page URL structure:
https://tripcompanion.app/?utm_source=facebook&utm_medium=cpc&utm_campaign=japan_cherry_blossom_2026&utm_content=video_ad_v2

Required UTM tags:
- utm_source: facebook, google, instagram, reddit, producthunt, organic
- utm_medium: cpc, social, email, referral, affiliate
- utm_campaign: japan_cherry_blossom_2026, hokkaido_winter_2026
- utm_content: ad_variant (A/B test creative tracking)
```

### Channel Performance Dashboard

Create PostHog dashboard "Channel ROI":

```
1. Conversions by Source (Table)
   - Columns: utm_source, Users, Conversions, Conv Rate, Revenue, Cost, ROI
   - Sort by: ROI descending

2. Customer Acquisition Cost (Formula)
   - CAC = Total Ad Spend / Conversions
   - Breakdown: By utm_source
   - Target: <$30 per customer

3. Lifetime Value (Trends)
   - LTV = Average subscription length × Monthly price
   - Current assumption: 6 months × $10 = $60 LTV
   - Track: Actual retention to refine

4. ROI by Campaign (Table)
   - Formula: (Revenue - Cost) / Cost × 100
   - Filter: Last 30 days
   - Highlight: Campaigns with ROI > 200%
```

### Weekly Review Checklist

Every Monday, review:

1. ✅ **Funnel conversion rates** - Any drop-offs >50%?
2. ✅ **Channel performance** - Which sources driving conversions?
3. ✅ **A/B test results** - Any winners to ship?
4. ✅ **Revenue trends** - On track for $6K MRR goal?
5. ✅ **User feedback** - What are trial users saying?

---

## 🎯 30-Day Optimization Roadmap

### Week 1: Foundation
- [x] ✅ Analytics implementation complete
- [ ] Configure PostHog funnel
- [ ] Set up alerts and dashboards
- [ ] Run baseline measurement (no optimizations)
- **Goal:** Establish 100 conversions baseline

### Week 2: High-Impact Optimizations
- [ ] Implement paywall after 3 days
- [ ] Add exit-intent popup with discount
- [ ] Simplify trial signup (email-only)
- [ ] Launch Day 1-7 email sequence
- **Goal:** Improve conv rate to 2.5%

### Week 3: A/B Testing
- [ ] Launch paywall timing test (2 vs 3 vs 5 days)
- [ ] Test pricing page copy variants
- [ ] Test 7-day vs 14-day trial
- **Goal:** Find 10%+ improvement from winning variants

### Week 4: Scale
- [ ] Ship winning A/B test variants
- [ ] Launch retargeting campaigns
- [ ] Optimize top-performing channels
- [ ] Implement feature usage correlation
- **Goal:** Hit 3.75% overall conversion rate, $1K MRR

---

## 🚀 Expected Results

### Conservative Projections (30 days)

```
Baseline (Week 1):
- Traffic: 5,000 visitors
- Conversions: 50 (1% rate)
- Revenue: $500 MRR

Optimized (Week 4):
- Traffic: 5,000 visitors (same)
- Conversions: 187 (3.75% rate)
- Revenue: $1,870 MRR

Improvement: +3.7x revenue from same traffic
```

### Aggressive Projections (with paid acquisition)

```
With $2,000 ad spend:
- Additional traffic: 10,000 visitors ($0.20 CPC)
- Conversions at 3.75%: 375 new customers
- Revenue: $3,750 MRR
- CAC: $5.33 per customer
- LTV/CAC ratio: 11.3x (excellent)

Payback period: <1 month
Net profit: $1,750 after ad spend
```

---

## 📞 Support & Troubleshooting

### PostHog Not Tracking Events?

1. **Check API key:** Verify `POSTHOG_API_KEY` in `.env`
2. **Check browser console:** Look for PostHog errors
3. **Verify script loaded:** Open DevTools → Network → Filter "posthog"
4. **Test event manually:**
   ```javascript
   // In browser console
   window.Analytics.track('test_event', { test: true });
   // Check PostHog dashboard for event in ~1 minute
   ```

### Events Tracked but Not in Funnel?

1. **Check conversion window:** 14 days may be too short
2. **Verify event names:** Must match exactly (case-sensitive)
3. **Check user identification:** All events tied to same `distinctId`?

### Low Conversion Rates?

1. **Review drop-off analysis** in PostHog
2. **Watch session recordings** of users who churned
3. **Run user surveys** on exit: "Why didn't you upgrade?"
4. **Check mobile performance** - 70% of traffic is mobile

---

## 📚 Additional Resources

- [PostHog Funnels Documentation](https://posthog.com/docs/user-guides/funnels)
- [Conversion Rate Optimization Guide](https://cxl.com/conversion-rate-optimization/)
- [SaaS Metrics Dashboard Template](https://posthog.com/templates/saas-dashboard)

---

**Built by:** Japan Trip Companion Team
**Last Updated:** March 2026
**Status:** ✅ Production Ready
