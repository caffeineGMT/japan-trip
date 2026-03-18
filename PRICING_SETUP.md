# Pricing Page & Stripe Checkout Setup Guide

## Overview

This guide explains how to set up the conversion-optimized pricing page with Stripe checkout for the Japan Trip Companion app.

## Features Implemented

✅ **Conversion-Optimized Pricing Page** (`/pricing.html`)
- Hero section with value prop: "Plan your perfect Japan trip in 5 minutes, not 5 days"
- 3-tier pricing table (Free, Premium, Lifetime)
- Social proof section with 5 beta user testimonials
- FAQ accordion with 8 common questions
- Sticky CTA bar that appears after scrolling
- Mobile-responsive design with smooth animations
- PostHog analytics integration

✅ **Stripe Checkout Integration** (`/api/stripe/create-checkout-session`)
- Premium: $9.99/month recurring with 7-day free trial
- Lifetime: $99 one-time payment
- Secure payment processing via Stripe
- Session retrieval endpoint for post-purchase tracking

✅ **Paywall & Upgrade Prompts** (in `index.html`)
- Upgrade banner for free users on Day 4+
- Paywall overlay blocking premium features
- LocalStorage-based plan tracking

✅ **Analytics Tracking**
- Page view tracking
- Checkout initiation
- Purchase completion
- Paywall hit events
- Time on page metrics

---

## Stripe Dashboard Setup

### 1. Create Products in Stripe Dashboard

Go to https://dashboard.stripe.com/products and create the following products:

#### Premium Plan (Recurring Subscription)
- **Name**: Premium Subscription
- **Description**: Unlimited days, AI optimizer, offline maps
- **Pricing**:
  - Amount: $9.99
  - Billing period: Monthly
  - Currency: USD
- **Free Trial**: 7 days
- After creating, copy the **Price ID** (starts with `price_...`)

#### Lifetime Plan (One-Time Payment)
- **Name**: Lifetime Access
- **Description**: Pay once, use forever with all Premium features
- **Pricing**:
  - Amount: $99.00
  - Type: One-time
  - Currency: USD
- After creating, copy the **Price ID** (starts with `price_...`)

### 2. Update Environment Variables

Add the price IDs to your `.env` file:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY

# Pricing Page Price IDs
STRIPE_PRICE_PREMIUM_MONTHLY=price_XXXXXXXXXXXXX  # Replace with actual Premium price ID
STRIPE_PRICE_LIFETIME=price_XXXXXXXXXXXXX         # Replace with actual Lifetime price ID

# PostHog Analytics
POSTHOG_API_KEY=phc_XXXXXXXXXXXXX                 # Replace with your PostHog project API key

# App Configuration
APP_URL=http://localhost:3000                      # Update for production
```

### 3. Update Stripe Publishable Key in pricing.html

Edit `/pricing.html` line ~537:

```javascript
const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY'); // Replace with your actual key
```

Or better yet, load it from a config file or inline script tag that reads from environment.

---

## Testing the Checkout Flow

### Test with Stripe Test Cards

Use these test card numbers in Stripe Checkout (test mode):

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Other Test Scenarios:**
- **Declined**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`
- **Insufficient Funds**: `4000 0000 0000 9995`

Full list: https://stripe.com/docs/testing#cards

### Testing Flow

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Visit pricing page:**
   ```
   http://localhost:3000/pricing.html
   ```

3. **Click "Start 7-Day Free Trial" (Premium):**
   - Should redirect to Stripe Checkout
   - Fill in test card details
   - Complete purchase
   - Should redirect to `/success.html` with session ID

4. **Verify success page:**
   - Should show confirmation message
   - Analytics should track `purchase_completed` event
   - LocalStorage should update with `user_plan: 'premium'`

5. **Test paywall (optional):**
   - Set localStorage: `localStorage.setItem('user_plan', 'free')`
   - Visit: `http://localhost:3000/?day=4`
   - Should see upgrade banner at top
   - Premium features should show paywall overlay

---

## Acceptance Criteria

✅ **Performance:**
- [ ] Pricing page loads in <1.5s
- [ ] Lighthouse score >90
- [ ] Mobile-responsive (tested on iPhone/Android)

✅ **Checkout Flow:**
- [ ] Test card `4242424242424242` completes in <30s
- [ ] Successful payment redirects to `/success.html`
- [ ] Success page shows correct plan details
- [ ] PostHog tracks `purchase_completed` event

✅ **Paywall:**
- [ ] Free users see upgrade banner on Day 4+
- [ ] Premium features blocked with paywall overlay
- [ ] "Upgrade to Premium" CTA redirects to `/pricing.html`

✅ **Analytics:**
- [ ] `pricing_page_view` tracked on page load
- [ ] `checkout_initiated` tracked on button click
- [ ] `purchase_completed` tracked after successful payment
- [ ] `paywall_hit` tracked when free users hit limit

---

## File Structure

```
/pricing.html                              # Conversion-optimized pricing page
/success.html                              # Post-purchase success page
/index.html                                # Main app (with paywall overlay & upgrade banner)
/api/stripe/checkout.js                    # Stripe checkout router
/api/checkout/create-session.js            # Standalone checkout endpoint
/lib/analytics.js                          # PostHog analytics wrapper
/.env                                      # Environment variables (Stripe keys, price IDs)
/PRICING_SETUP.md                          # This file
```

---

## Analytics Events Reference

| Event | When Triggered | Properties |
|-------|----------------|------------|
| `pricing_page_view` | User visits `/pricing.html` | `source`, UTM params |
| `checkout_initiated` | User clicks "Start Trial" or "Buy Lifetime" | `plan`, `price`, `billing_cycle` |
| `purchase_completed` | Payment succeeds, webhook fires | `plan`, `price`, `transaction_id`, `revenue` |
| `paywall_hit` | Free user encounters Day 4 limit or premium feature | `feature_name`, `context` |

---

## Deployment Checklist

Before deploying to production:

1. **Stripe:**
   - [ ] Switch from test mode to live mode in Stripe Dashboard
   - [ ] Create live products and prices
   - [ ] Update `.env` with live API keys and price IDs
   - [ ] Set up webhook endpoint: `/api/stripe/webhook`
   - [ ] Add webhook signing secret to `.env`

2. **Analytics:**
   - [ ] Create production PostHog project
   - [ ] Update `POSTHOG_API_KEY` in `.env`
   - [ ] Test event tracking in PostHog dashboard

3. **App Configuration:**
   - [ ] Update `APP_URL` to production domain
   - [ ] Update Stripe publishable key in `pricing.html`
   - [ ] Test checkout flow end-to-end in production
   - [ ] Set up SSL certificate (Stripe requires HTTPS)

4. **Performance:**
   - [ ] Run Lighthouse audit
   - [ ] Optimize images and assets
   - [ ] Enable caching and CDN
   - [ ] Test on slow 3G connection

---

## Troubleshooting

### "Stripe not configured" error
- Make sure `STRIPE_SECRET_KEY` is set in `.env`
- Verify price IDs are correct and not placeholders
- Restart the server after updating `.env`

### Checkout redirect fails
- Check `APP_URL` matches your domain
- Ensure success/cancel URLs are correct
- Check browser console for errors

### Analytics not tracking
- Verify `POSTHOG_API_KEY` is set
- Check PostHog project is active
- Open browser DevTools → Network → Filter by `posthog`
- Ensure `analytics.js` and `analytics-init.js` are loaded

### Paywall not showing
- Check `localStorage.getItem('user_plan')` returns `'free'`
- Verify you're on Day 4+ (URL param: `?day=4`)
- Check browser console for JavaScript errors

---

## Revenue Targets

**Goal:** First 100 paying customers within 30 days generating $1K+ MRR

**Conversion Funnel:**
1. Landing page view → Pricing page (30% click-through)
2. Pricing page → Checkout initiated (10% conversion)
3. Checkout initiated → Purchase completed (60% completion)

**Expected Revenue:**
- 70% choose Premium ($9.99/month) = $699/month
- 30% choose Lifetime ($99 one-time) = $2,970 total

**Total MRR after 100 customers:** ~$700 + amortized Lifetime sales

---

## Next Steps

1. Set up Stripe products and copy price IDs
2. Update `.env` with real API keys
3. Test checkout flow with test card
4. Configure PostHog analytics
5. Deploy to staging for QA
6. Run final production tests
7. Launch! 🚀

---

## Support

For questions or issues:
- Stripe Docs: https://stripe.com/docs
- PostHog Docs: https://posthog.com/docs
- File an issue in the project repository
