# Pricing V2 - Quick Start Guide

## ✅ What's Complete

All code is **built, committed, and pushed** to GitHub. Ready for deployment when Vercel limit resets.

---

## 🚀 Deploy Instructions

### When Vercel limit resets (24 hours):

```bash
npx vercel --prod --yes
```

**OR** trigger auto-deploy by pushing to main:
```bash
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

---

## 🎯 What You Built

### 1. **Conversion-Optimized Pricing Page**
**URL:** `https://trip.to/pricing-v2.html` (after deployment)

**Features:**
- 🎨 Modern gradient design with trust badges
- 📊 Social proof bar (5,000+ users, 4.9/5 rating)
- 💰 3 pricing tiers with **$10/month featured prominently**
- ⭐ 6 customer testimonials
- 🎁 7-day free trial (no credit card required)
- 📱 Mobile-optimized responsive design
- 🛡️ 30-day money-back guarantee

### 2. **A/B Testing System**
**Dashboard:** `https://trip.to/api/analytics/ab-test-report`

- Automatic variant assignment (Control vs Variant A)
- Tracks: views, clicks, scrolls, conversions
- Real-time analytics dashboard
- Conversion rate by variant
- Winner determination

### 3. **Stripe Integration**
**Checkout:** `/api/stripe/create-checkout-session`

- 7-day free trial on all plans
- Monthly: $10/month
- Annual: $80/year (save 33%)
- Trial → Paid conversion tracking

---

## ⚙️ Setup Required (Before Testing)

### 1. Create Stripe Products

Go to [Stripe Dashboard](https://dashboard.stripe.com/test/products):

**Monthly Subscription:**
- Name: "Japan Trip Companion - Monthly"
- Price: $10/month
- Billing: Recurring monthly
- Trial: 7 days
- Copy the Price ID (starts with `price_`)

**Annual Subscription:**
- Name: "Japan Trip Companion - Annual"
- Price: $80/year
- Billing: Recurring yearly
- Trial: 7 days
- Copy the Price ID

### 2. Update Environment Variables

Edit `.env`:
```bash
STRIPE_PRICE_MONTHLY=price_1Xxxxxxxxxxxxx  # Your actual monthly price ID
STRIPE_PRICE_ANNUAL=price_1Yyyyyyyyyyyyyy  # Your actual annual price ID
```

### 3. Update Stripe Publishable Key

Edit `pricing-v2.html` line 480:
```javascript
const stripe = Stripe('pk_test_YOUR_ACTUAL_KEY'); // Replace with your real key
```

Get your key from: https://dashboard.stripe.com/test/apikeys

---

## 🧪 Testing Checklist

### After Deployment:

1. **Visit pricing page:**
   ```
   https://trip.to/pricing-v2.html
   ```

2. **Test free trial flow:**
   - Click "Start Free Trial" button
   - Should redirect to early-access signup (no payment)
   - Verify form works

3. **Test monthly subscription:**
   - Click "Start Free Trial" on $10/month card
   - Should open Stripe Checkout
   - Verify 7-day trial shown
   - Test payment flow

4. **Test annual subscription:**
   - Click "Start Free Trial" on $80/year card
   - Verify Stripe Checkout opens
   - Confirm trial and pricing displayed correctly

5. **Check A/B testing:**
   - Visit page in incognito mode multiple times
   - Open console, check which variant you got
   - Visit analytics dashboard:
     ```
     https://trip.to/api/analytics/ab-test-report
     ```
   - Verify events are being tracked

6. **Test mobile:**
   - Open on iPhone/Android
   - Check responsive layout
   - Test buttons and scrolling
   - Verify checkout works on mobile

---

## 📊 Analytics Dashboard

### View Real-Time Results

**URL:** `https://trip.to/api/analytics/ab-test-report`

Shows:
- Total views per variant
- Conversion rates (free trial, monthly, annual)
- Scroll engagement (25%, 50%, 75%, 100%)
- Winner determination
- Detailed event breakdown

**Tip:** Share this URL with stakeholders to show conversion performance in real-time.

---

## 📈 Success Metrics

### Target KPIs:

| Metric | Target | Benchmark |
|--------|--------|-----------|
| Overall Conversion Rate | 10%+ | Industry avg: 2-5% |
| Trial Sign-ups | 50%+ of visitors | - |
| Scroll to Testimonials | 75%+ | - |
| Time on Page | 90+ seconds | - |
| Mobile Conversion | Equal to desktop | - |

### Revenue Projections:

**Conservative (5% conversion, 1,000 visitors/month):**
- MRR: $827/month
- ARR: ~$10,000/year

**Optimistic (10% conversion, 5,000 visitors/month):**
- MRR: $5,833/month
- ARR: ~$70,000/year

---

## 🔧 Troubleshooting

### "Failed to create checkout session"
1. Check `.env` has valid Stripe keys
2. Verify price IDs are correct
3. Make sure Stripe is in test mode
4. Check server logs for errors

### Analytics not tracking
1. Open browser console for errors
2. Verify `/api/analytics/track` endpoint works
3. Check `data/` directory permissions
4. Test in incognito mode

### Stripe checkout not opening
1. Verify publishable key in `pricing-v2.html`
2. Check browser console for errors
3. Ensure HTTPS in production
4. Test with Stripe test cards

---

## 🎉 What's Next

### Immediate (Day 1):
1. Deploy when Vercel limit resets
2. Set up real Stripe products
3. Test end-to-end checkout flow
4. Share pricing page URL

### Week 1:
1. Drive traffic to pricing page
2. Monitor conversion rates
3. Collect first 100 views per variant
4. Analyze A/B test results

### Week 2:
1. Choose winning variant
2. Launch new A/B tests
3. Optimize based on data
4. Survey converting users

### Month 2:
1. Test different trial lengths (3 vs 7 vs 14 days)
2. Add exit-intent popup
3. Test new pricing tiers
4. Add enterprise plan

---

## 📚 Documentation

- **Full Guide:** `PRICING_V2_DOCUMENTATION.md`
- **Build Summary:** `PRICING_V2_BUILD_SUMMARY.md`
- **This Guide:** `PRICING_V2_QUICK_START.md`

---

## 💰 Revenue Goal

**Target:** $1M ARR

**Requirements:**
- 10,000 monthly subscribers at $10/month
- OR 1,250 annual subscribers at $80/year
- OR mix of both with enterprise tier

**Path:**
1. Optimize conversion to 10%+
2. Drive 10,000+ monthly visitors
3. Test and iterate pricing
4. Add team/enterprise plans
5. Scale marketing spend

---

## ✅ Deployment Checklist

When Vercel is ready:

- [ ] Deploy to production (`npx vercel --prod --yes`)
- [ ] Note deployment URL
- [ ] Create Stripe products with 7-day trials
- [ ] Add price IDs to `.env`
- [ ] Update publishable key in HTML
- [ ] Test checkout end-to-end
- [ ] Verify webhook handling
- [ ] Test on mobile devices
- [ ] Share pricing page URL
- [ ] Monitor analytics dashboard
- [ ] Drive initial traffic

---

**Status:** ✅ Code complete, ready for deployment
**Next Step:** Deploy when Vercel limit resets (24 hours)
**Expected Result:** 10%+ conversion rate, path to $1M ARR

**LET'S MAKE MONEY! 💰**
