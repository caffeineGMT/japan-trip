# Affiliate Partner System - Quick Start Guide

## 🚀 What This Is

A complete affiliate marketing system for TripCompanion that lets travel bloggers and influencers earn 25% commission on trip sales through easy-to-embed widgets.

## 📦 What's Included

1. **Embeddable Widget** - One-line code snippet partners add to their sites
2. **Partner Dashboard** - Real-time stats, earnings, and widget generator
3. **Tracking System** - Impressions, clicks, signups, and purchases
4. **Automated Payouts** - Monthly PayPal payments for balances over $100
5. **Outreach Tools** - Email campaign system for partner recruitment

## 🎯 Quick Test

### 1. Embed a Widget

Create `test.html`:
```html
<script src="http://localhost:3000/embed.js"
        data-trip="japan-cherry-blossom"
        data-affiliate="YOURCODE"></script>
```

### 2. Access Partner Dashboard

Visit: `http://localhost:3000/partners`

### 3. Send Outreach Emails

```bash
node scripts/outreach-email.js
```

## 📊 Key Features

- **25% commission** on all sales
- **$100 minimum** payout threshold
- **Monthly automatic** PayPal transfers
- **Real-time tracking** with detailed analytics
- **One-line integration** - no complex setup

## 🛠 Setup Checklist

- [ ] Run database migration: `005_affiliates.sql`
- [ ] Add PayPal credentials to `.env`
- [ ] Add Mailgun credentials to `.env`
- [ ] Create test affiliate account
- [ ] Test widget embedding
- [ ] Test dashboard login
- [ ] Test payout flow (sandbox)

## 📈 Revenue Model

With 500 active affiliates:
- **$87,000/month** in sales
- **$21,750/month** in commissions
- **$65,250/month** net revenue
- **$783,000/year** recurring

## 📖 Full Documentation

See `AFFILIATE_WIDGET_IMPLEMENTATION.md` for complete technical docs.

## 🔗 Key URLs

- Widget embed: `/embed/:tripId`
- Partner dashboard: `/partners`
- API tracking: `/api/affiliate/track`
- API stats: `/api/affiliate/stats`
- Payout cron: `/api/affiliate/payout/process-monthly`

## ⚡ Commands

```bash
# Run development server
npm start

# Test outreach emails
node scripts/outreach-email.js

# Trigger manual payout (testing)
curl -X POST localhost:3000/api/affiliate/payout/manual \
  -H "Content-Type: application/json" \
  -d '{"affiliateId":"uuid","amount":100}'
```

## 💡 Tips

1. Start with 5-10 test partners before scaling
2. Use PayPal sandbox for all testing
3. Monitor conversion rates weekly
4. Optimize widget placement with A/B tests
5. Respond to partner emails within 24 hours

## 🎓 For Partners

Your affiliate link format:
```
https://tripcompanion.app/trip/{tripId}?ref={YOURCODE}
```

Your widget code:
```html
<script src="https://tripcompanion.app/embed.js"
        data-trip="japan-cherry-blossom"
        data-affiliate="{YOURCODE}"></script>
```

Track your stats: `https://tripcompanion.app/partners`

---

**Questions?** partnerships@tripcompanion.app
