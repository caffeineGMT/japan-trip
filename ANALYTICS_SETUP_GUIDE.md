# Conversion Funnel Analytics Setup Guide

## Overview

This project now includes a comprehensive conversion funnel analytics system powered by **PostHog**. Track every step of the user journey from signup through paid conversion, identify drop-off points, and optimize for revenue.

## What's Included

### 1. Client-Side Analytics (`lib/analytics.js`)
- Complete event tracking library
- Automatic page view tracking
- Custom funnel stage events
- User identification and properties
- A/B testing support

### 2. Server-Side Analytics (`api/analytics.js`)
- Backend event tracking for payment events
- Subscription lifecycle tracking
- Server-side event validation
- PostHog Node.js SDK integration

### 3. Auto-Initialization (`lib/analytics-init.js`)
- Automatic PostHog loading
- Page view auto-tracking
- Button click tracking
- Form submission tracking
- Scroll depth tracking
- Time on page tracking

### 4. Analytics Dashboard (`analytics-dashboard.html`)
- Visual funnel representation
- Key conversion metrics
- Drop-off analysis
- Revenue tracking
- Time-series charts

## Setup Instructions

### Step 1: Create PostHog Account

1. Go to [PostHog.com](https://posthog.com) and sign up for a free account
2. Create a new project
3. Get your **Project API Key** from Settings → Project → API Keys
4. Copy your API key (starts with `phc_`)

### Step 2: Configure Environment Variables

Add to your `.env` file:

```bash
# PostHog Analytics
POSTHOG_API_KEY=phc_your_actual_api_key_here
POSTHOG_HOST=https://app.posthog.com
```

Or for self-hosted PostHog:
```bash
POSTHOG_API_KEY=phc_your_actual_api_key_here
POSTHOG_HOST=https://posthog.yourdomain.com
```

### Step 3: Update Analytics Configuration

Edit `lib/analytics-init.js` and replace the placeholder:

```javascript
const POSTHOG_CONFIG = {
  apiKey: 'phc_YOUR_PROJECT_API_KEY', // Replace with your actual key
  apiHost: 'https://app.posthog.com',
};
```

### Step 4: Start the Server

```bash
npm start
```

The server will log:
```
✓ PostHog server-side analytics initialized
📈 PostHog analytics: enabled
```

### Step 5: Verify Installation

1. Visit any page on your site
2. Open browser console - you should see: `✓ Analytics initialized`
3. Go to PostHog dashboard → Live Events
4. You should see `landing_viewed` or `$pageview` events appearing

## Conversion Funnel Stages

The analytics system tracks 8 key stages:

### 1. Awareness
- **landing_viewed** - User views landing page
- **feature_interaction** - User clicks features/demos

### 2. Signup
- **signup_viewed** - Signup form displayed
- **signup_started** - User enters email
- **signup_completed** - Account created
- **email_verification_sent** - Verification email sent
- **email_verified** - Email confirmed

### 3. Activation
- **first_login** - First login after signup
- **onboarding_started** - Onboarding flow begins
- **onboarding_step_completed** - Each onboarding step
- **onboarding_completed** - Onboarding finished

### 4. Free Trial
- **free_trial_started** - User begins free trial
- **free_feature_used** - Free feature usage
- **paywall_hit** - User tries premium feature

### 5. Conversion
- **pricing_viewed** - Pricing page viewed
- **plan_selected** - User selects a plan
- **checkout_initiated** - Checkout begins
- **payment_info_entered** - Payment details entered
- **purchase_completed** - Payment successful ✅
- **purchase_failed** - Payment failed ❌

### 6. Retention
- **subscription_renewed** - Subscription auto-renewed
- **subscription_cancelled** - User cancels
- **churn_risk_detected** - Churn risk identified

## Usage Examples

### Track Signup
```javascript
// User starts signup
Analytics.trackSignupStarted('user@example.com');

// User completes signup
Analytics.trackSignupCompleted(
  userId,
  'user@example.com',
  'email' // or 'google', 'facebook'
);
```

### Track Purchase
```javascript
// User views pricing
Analytics.trackPricingViewed('sidebar_cta');

// User selects plan
Analytics.trackPlanSelected('Premium', 29.99, 'monthly');

// User initiates checkout
Analytics.trackCheckoutInitiated('Premium', 29.99, 'monthly');

// Purchase completes
Analytics.trackPurchaseCompleted(
  'Premium',
  29.99,
  'monthly',
  'txn_abc123'
);
```

### Track Paywall Hits
```javascript
// User tries premium feature
Analytics.trackPaywallHit('route_optimization', 'itinerary_builder');
```

### Identify Users
```javascript
// After signup/login
Analytics.identify(userId, {
  email: 'user@example.com',
  signup_method: 'email',
  plan: 'free'
});
```

## Integration Points

### Already Integrated Pages

1. **index.html** - Landing page tracking
2. **pricing.html** - Pricing views and plan selection
3. **early-access.html** - Signup tracking with email capture
4. **account.html** - Account activity tracking

### Payment Integration

The analytics system automatically tracks Stripe webhook events:

- `checkout.session.completed` → `purchase_completed`
- `customer.subscription.created` → `subscription_created`
- `customer.subscription.deleted` → `subscription_cancelled`
- `invoice.payment_succeeded` → `subscription_renewed`

This happens in `api/stripe/webhook.js` via the server-side analytics.

## Viewing Analytics

### PostHog Dashboard

1. **Live Events**: Real-time event stream
2. **Funnels**: Create conversion funnels
   - Go to Insights → New Insight → Funnel
   - Add steps: signup_started → signup_completed → free_trial_started → purchase_completed
3. **Dashboards**: Create custom dashboards
4. **Session Recordings**: Watch user sessions
5. **Feature Flags**: A/B test experiments

### Local Dashboard

Visit `http://localhost:3000/analytics-dashboard.html` to see:
- Total signups, trials, conversions
- Conversion rate
- Revenue metrics
- Visual funnel with drop-off rates
- Charts and trends

**Note**: The local dashboard shows demo data. Connect it to PostHog API for real data.

## Creating Funnels in PostHog

### Standard Conversion Funnel

1. Go to PostHog → Insights → New Insight → Funnel
2. Add these steps in order:
   - `landing_viewed`
   - `signup_started`
   - `signup_completed`
   - `email_verified`
   - `free_trial_started`
   - `pricing_viewed`
   - `checkout_initiated`
   - `purchase_completed`
3. Save as "Full Conversion Funnel"

### Quick Signup Funnel

- `signup_viewed` → `signup_started` → `signup_completed`
- Shows signup form completion rate

### Purchase Funnel

- `pricing_viewed` → `plan_selected` → `checkout_initiated` → `purchase_completed`
- Shows payment conversion rate

## Analyzing Drop-offs

### High-Value Drop-off Points to Monitor

1. **Signup Started → Completed** (Should be >60%)
   - If low: Simplify signup form, reduce required fields

2. **Email Verified** (Should be >80% of signups)
   - If low: Improve email deliverability, resend options

3. **Free Trial → Pricing Viewed** (Should be >40%)
   - If low: Add more paywalls, improve value communication

4. **Checkout Initiated → Purchase Completed** (Should be >70%)
   - If low: Check payment errors, simplify checkout

### Using PostHog to Investigate

1. Click on any funnel step in PostHog
2. See "Dropped off users"
3. Watch session recordings of users who dropped
4. Identify UX issues, errors, or friction

## Revenue Metrics

PostHog automatically calculates:

- **Total Revenue**: Sum of all `purchase_completed` events
- **Average Revenue Per User (ARPU)**
- **Customer Lifetime Value (LTV)**
- **Monthly Recurring Revenue (MRR)** from subscriptions

Access via: PostHog → Dashboards → Revenue Dashboard

## A/B Testing

Use PostHog feature flags for A/B testing:

```javascript
// Check variant
const pricingVariant = Analytics.getFeatureFlag('pricing_page_test');

if (pricingVariant === 'variant_b') {
  // Show variant B pricing
  showDiscountPricing();
} else {
  // Show control pricing
  showStandardPricing();
}

// Track which variant user saw
Analytics.trackVariantViewed('pricing_page_test', pricingVariant);
```

## Best Practices

### 1. Track User Properties
```javascript
Analytics.setUserProperties({
  plan: 'premium',
  signup_date: '2026-03-18',
  country: 'US',
  utm_source: 'facebook'
});
```

### 2. Track Custom Events
```javascript
Analytics.track('custom_event_name', {
  property1: 'value1',
  property2: 123,
  timestamp: new Date().toISOString()
});
```

### 3. Track Errors
```javascript
window.addEventListener('error', (e) => {
  Analytics.track('javascript_error', {
    message: e.message,
    stack: e.error?.stack,
    page: window.location.pathname
  });
});
```

### 4. Track Performance
```javascript
window.addEventListener('load', () => {
  const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
  Analytics.track('page_load_time', {
    load_time_ms: loadTime,
    page: window.location.pathname
  });
});
```

## Privacy & Compliance

### GDPR Compliance

PostHog is GDPR-compliant. To respect user privacy:

1. Add cookie consent banner (use a library like `cookie-consent`)
2. Only initialize analytics after consent:

```javascript
if (userConsentedToAnalytics()) {
  Analytics.init(POSTHOG_API_KEY);
}
```

3. Provide opt-out mechanism:
```javascript
function optOutOfAnalytics() {
  Analytics.reset();
  posthog.opt_out_capturing();
}
```

### Data Retention

Configure in PostHog → Settings → Data Retention
- Events: 90 days (free tier) / unlimited (paid)
- Session recordings: 30 days

## Troubleshooting

### Analytics Not Loading

1. Check browser console for errors
2. Verify `POSTHOG_API_KEY` is set correctly
3. Check network tab - should see requests to `app.posthog.com`
4. Ensure no ad blockers are blocking PostHog

### Events Not Appearing

1. Check PostHog dashboard → Live Events
2. Wait 30 seconds (events are batched)
3. Verify user is identified: `posthog.identify(userId)`
4. Check browser console: `posthog.debug()` for debugging

### Server-Side Tracking Not Working

1. Check server logs for PostHog initialization
2. Verify `POSTHOG_API_KEY` in `.env`
3. Check Node.js version (requires 14+)
4. Ensure `posthog-node` package is installed

## Production Checklist

- [ ] Replace `phc_YOUR_PROJECT_API_KEY` with real API key
- [ ] Set `NODE_ENV=production` in production environment
- [ ] Configure PostHog data retention policies
- [ ] Set up alerts for critical funnel drop-offs
- [ ] Create conversion funnel dashboards
- [ ] Enable session recordings
- [ ] Configure feature flags for A/B tests
- [ ] Test all tracking events in staging
- [ ] Add cookie consent banner
- [ ] Document custom events for team

## Support

- PostHog Docs: https://posthog.com/docs
- PostHog Slack: https://posthog.com/slack
- PostHog GitHub: https://github.com/PostHog/posthog

## Next Steps

1. **Set up your first funnel** in PostHog
2. **Watch session recordings** to understand user behavior
3. **Create A/B tests** for pricing, CTAs, signup flow
4. **Set up alerts** for when conversion rate drops
5. **Integrate with Stripe** for automated revenue tracking (already done!)

---

**Goal**: Achieve 10%+ signup-to-paid conversion rate through data-driven optimization.
