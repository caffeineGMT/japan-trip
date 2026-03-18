# PostHog Conversion Funnel Analytics - Setup Guide

Complete implementation guide for tracking the signup → trial → paid conversion funnel.

## Table of Contents
1. [PostHog Account Setup](#posthog-account-setup)
2. [Environment Configuration](#environment-configuration)
3. [Funnel Configuration](#funnel-configuration)
4. [Events Overview](#events-overview)
5. [Testing & Validation](#testing--validation)
6. [Dashboard Setup](#dashboard-setup)

---

## PostHog Account Setup

### Step 1: Create PostHog Cloud Account
1. Go to [https://posthog.com](https://posthog.com)
2. Click "Get started - free" or "Sign up"
3. Create account with email or GitHub
4. Select **Cloud** hosting option (recommended)
5. Complete onboarding wizard

### Step 2: Get Your API Key
1. In PostHog dashboard, click your profile → **Project Settings**
2. Copy your **Project API Key** (starts with `phc_`)
3. Note your **PostHog Host** (usually `https://app.posthog.com` for cloud)

Example:
```
Project API Key: phc_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
Host: https://app.posthog.com
```

---

## Environment Configuration

### Step 1: Update `.env` File
Add your PostHog credentials to `.env`:

```bash
# PostHog Analytics (Conversion Funnel Tracking)
POSTHOG_API_KEY=phc_your_actual_api_key_here
POSTHOG_HOST=https://app.posthog.com
```

### Step 2: Verify Configuration
Start your server:
```bash
npm start
```

Look for this confirmation in logs:
```
✓ PostHog server-side analytics initialized
📈 PostHog analytics: enabled
```

---

## Funnel Configuration

### Primary Conversion Funnel

Create this funnel in PostHog to track the complete conversion journey:

#### Funnel Name: **"Signup → Trial → Paid Conversion"**

#### Funnel Steps:
1. **App Loaded** (`app_loaded`)
   - First touchpoint, user lands on the app

2. **Day Selected** (`day_selected`)
   - Engagement signal, user interacts with content

3. **Upgrade Clicked** (`upgrade_clicked`)
   - Conversion intent, user clicks pricing/upgrade

4. **Checkout Started** (`checkout_started`)
   - High intent, user initiates payment flow

5. **Purchase Completed** (`purchase_completed`)
   - Conversion! Payment successful

#### How to Create Funnel in PostHog:

1. Navigate to **Insights** → **New Insight**
2. Select **Funnel** visualization type
3. Click **+ Add step** for each step above
4. Configure each step:
   - Step 1: Event = `app_loaded`
   - Step 2: Event = `day_selected`
   - Step 3: Event = `upgrade_clicked`
   - Step 4: Event = `checkout_started`
   - Step 5: Event = `purchase_completed`
5. Set **Conversion window**: 30 days
6. Set **Attribution**: First touch
7. Click **Save** and name it "Signup → Trial → Paid Conversion"

---

## Events Overview

### Frontend Events (Client-Side)

| Event Name | When Triggered | Properties | Location |
|------------|----------------|------------|----------|
| `app_loaded` | User lands on app | `template_id`, `utm_source`, `utm_medium`, `utm_campaign` | `script.js:63-72` |
| `day_selected` | User clicks day tab | `day_number`, `day_name`, `city` | `script.js:248-254` |
| `stop_clicked` | User clicks location | `stop_index`, `stop_name`, `stop_category`, `day_number` | `script.js:516-523` |
| `language_switched` | User changes language | `from_language`, `to_language` | `script.js:773-777` |
| `offline_mode_enabled` | App goes offline | `service_worker_active` | `script.js:1133-1139` |
| `upgrade_clicked` | User clicks upgrade CTA | `plan_type`, `page`, `ab_variant` | `pricing-v2.html:761-767` |
| `checkout_started` | Checkout session created | `plan_name`, `price`, `billing_cycle` | `pricing-v2.html:770-776` |

### Backend Events (Server-Side)

| Event Name | When Triggered | Properties | Location |
|------------|----------------|------------|----------|
| `checkout_session_created` | Stripe session created | `session_id`, `plan_name`, `price`, `trial_enabled` | `create-checkout-session.js:99-111` |
| `checkout_completed` | Checkout session paid | `session_id`, `amount`, `plan`, `payment_status` | `webhook.js:125-137` |
| `purchase_completed` | Payment succeeded | `transaction_id`, `amount`, `plan`, `currency` | `webhook.js:52-73` |
| `subscription_activated` | Subscription created | `subscription_id`, `amount`, `billing_cycle`, `trial_end` | `webhook.js:157-174` |

---

## Testing & Validation

### Test User Flow (20 Test Users Required)

To meet acceptance criteria, generate 20 test user journeys:

#### Manual Testing Steps:
1. **Clear cookies/localStorage** (or use incognito)
2. Navigate to `http://localhost:3000`
3. Click through 2-3 day tabs
4. Click 1-2 stops on the map
5. Click language switcher
6. Go to pricing page (`/pricing-v2.html`)
7. Click "Start Free Trial" button
8. Use Stripe test card: `4242 4242 4242 4242`
9. Complete checkout

#### Automated Testing Script:

Create `test-funnel.js`:
```javascript
const { PostHog } = require('posthog-node');

const posthog = new PostHog(process.env.POSTHOG_API_KEY);

async function generateTestData() {
  for (let i = 1; i <= 20; i++) {
    const userId = `test_user_${i}`;

    // Step 1: App loaded
    posthog.capture({
      distinctId: userId,
      event: 'app_loaded',
      properties: { utm_source: 'test', template_id: 'japan-cherry-blossom-2026' }
    });

    await sleep(2000);

    // Step 2: Day selected (80% proceed)
    if (Math.random() > 0.2) {
      posthog.capture({
        distinctId: userId,
        event: 'day_selected',
        properties: { day_number: 1, city: 'Tokyo' }
      });

      await sleep(3000);

      // Step 3: Upgrade clicked (50% proceed)
      if (Math.random() > 0.5) {
        posthog.capture({
          distinctId: userId,
          event: 'upgrade_clicked',
          properties: { plan_type: 'monthly', page: 'pricing_v2' }
        });

        await sleep(2000);

        // Step 4: Checkout started (70% proceed)
        if (Math.random() > 0.3) {
          posthog.capture({
            distinctId: userId,
            event: 'checkout_started',
            properties: { plan_name: 'monthly', price: 10 }
          });

          await sleep(5000);

          // Step 5: Purchase completed (60% proceed)
          if (Math.random() > 0.4) {
            posthog.capture({
              distinctId: userId,
              event: 'purchase_completed',
              properties: {
                transaction_id: `test_txn_${i}`,
                amount: 10,
                plan: 'monthly'
              }
            });
          }
        }
      }
    }
  }

  await posthog.shutdown();
  console.log('✅ Test data generated for 20 users');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

generateTestData();
```

Run test:
```bash
node test-funnel.js
```

### Verify in PostHog

1. Go to PostHog → **Events** page
2. Search for your events: `app_loaded`, `day_selected`, etc.
3. Verify events are appearing with correct properties
4. Check **Persons** tab to see test users

---

## Dashboard Setup

### Create Conversion Dashboard

1. Navigate to **Dashboards** → **New Dashboard**
2. Name it: "Conversion Funnel Analytics"

### Add These Insights:

#### 1. Main Funnel Visualization
- Type: **Funnel**
- Name: "Signup → Trial → Paid"
- Steps: All 5 funnel steps
- Breakdown: By `utm_source` for traffic source attribution

#### 2. Drop-off Points
- Type: **Funnel**
- Name: "Drop-off Analysis"
- Same steps as main funnel
- Display: **Show percentage**
- Highlight: Largest drop-off between steps

#### 3. Time to Convert
- Type: **Funnel**
- Name: "Time to Purchase"
- Settings: Enable **"Show time to convert"**
- View: Distribution histogram

#### 4. Revenue by Source
- Type: **Trends**
- Name: "Revenue by UTM Source"
- Event: `purchase_completed`
- Property: Sum of `amount`
- Breakdown: By `utm_source`
- Chart: **Bar** or **Table**

#### 5. Conversion Rate Trend
- Type: **Trends**
- Name: "Daily Conversion Rate"
- Formula: `(purchase_completed / app_loaded) * 100`
- Time range: Last 30 days
- Chart: **Line graph**

#### 6. Average Revenue Per User (ARPU)
- Type: **Trends**
- Name: "Average Revenue Per User"
- Event: `purchase_completed`
- Property: Average of `amount`
- Group by: Day

#### 7. Plan Distribution
- Type: **Trends**
- Name: "Plan Type Distribution"
- Event: `purchase_completed`
- Breakdown: By `plan`
- Chart: **Pie chart**

#### 8. A/B Test Performance (if running tests)
- Type: **Funnel**
- Name: "Conversion by Variant"
- Steps: All 5 funnel steps
- Breakdown: By `ab_variant`

---

## Acceptance Criteria Checklist

- [ ] PostHog account created and API key obtained
- [ ] Environment variables configured in `.env`
- [ ] Server shows "PostHog analytics: enabled" on startup
- [ ] Main funnel created with 5 steps in PostHog dashboard
- [ ] 20 test users completed (real or simulated)
- [ ] Events visible in PostHog Events page
- [ ] Funnel shows conversion rates for each step
- [ ] Drop-off points clearly identified
- [ ] Revenue tracked and attributed to correct sources
- [ ] Dashboard configured with all 8 insights

---

## Expected Metrics (Typical SaaS Funnels)

Based on industry benchmarks:

| Step | Conversion Rate | Drop-off |
|------|----------------|----------|
| App Loaded → Day Selected | 60-70% | 30-40% |
| Day Selected → Upgrade Clicked | 15-25% | 75-85% |
| Upgrade Clicked → Checkout Started | 70-85% | 15-30% |
| Checkout Started → Purchase Completed | 60-75% | 25-40% |

**Overall Conversion** (App Loaded → Purchase): **5-10%**

---

## Troubleshooting

### Events Not Appearing

1. **Check API Key**: Verify `POSTHOG_API_KEY` in `.env`
2. **Check Browser Console**: Look for PostHog errors
3. **Network Tab**: Verify POST requests to `app.posthog.com`
4. **Server Logs**: Check for initialization message

### Low Event Volume

- **Clear cache**: PostHog may batch events
- **Wait 5 minutes**: Events may be delayed
- **Check filters**: Ensure no date/property filters applied

### Revenue Not Tracking

- **Verify webhook**: Check Stripe webhook is configured
- **Check metadata**: Ensure `user_id` in Stripe metadata
- **Server logs**: Look for `[Analytics] Purchase tracked` messages

---

## Next Steps

1. **Set up alerts**: Configure PostHog alerts for conversion drops
2. **A/B testing**: Test pricing page variants
3. **Cohort analysis**: Segment users by acquisition source
4. **Session recordings**: Enable to watch user journeys
5. **Feature flags**: Test features with PostHog flags

---

## Support Resources

- PostHog Docs: https://posthog.com/docs
- Funnel Tutorial: https://posthog.com/docs/user-guides/funnels
- API Reference: https://posthog.com/docs/api

---

## Implementation Summary

**Files Modified:**
- `lib/analytics-init.js` - Read PostHog config from meta tags
- `script.js` - Added 5 client-side tracking events
- `pricing-v2.html` - Added upgrade and checkout tracking
- `api/stripe/webhook.js` - Added purchase completion tracking
- `api/stripe/create-checkout-session.js` - Added session creation tracking
- `server.js` - Added PostHog meta tag injection middleware

**Total Events Tracked:** 11 (7 frontend + 4 backend)

**Funnel Completion:** ✅ Ready to track 20+ test users and analyze conversion data!
