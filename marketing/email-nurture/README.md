# Email Nurture Sequence - Implementation Guide

**9-Email Drip Campaign** to convert free signups to $9.99/month premium subscribers.

## Overview

Automated email sequence designed to achieve:
- **35% open rate** (target)
- **8% click rate** (target)
- **12% free-to-paid conversion rate** (target)
- **$1.20 LTV per free signup** (12% × $9.99/month)

## Email Sequence

| # | Subject | Delay | Purpose |
|---|---------|-------|---------|
| 1 | Welcome + free itinerary template | Day 0 | Onboarding, set expectations |
| 2 | How to use offline maps in Tokyo | Day 2 | Product education, value delivery |
| 3 | 3 mistakes in your itinerary (AI spotted) | Day 5 | Problem awareness, AI preview |
| 4 | Case study: Sarah saved 12 hours | Day 7 | Social proof, conversion intent |
| 5 | Cherry blossom forecast update | Day 10 | Value delivery, engagement |
| 6 | **Premium upgrade offer (50% off)** | Day 14 | **Primary conversion** |
| 7 | 10,000 travelers trust us | Day 17 | Social proof, FOMO |
| 8 | **Last chance: 50% expires tomorrow** | Day 21 | **Urgency conversion** |
| 9 | Free JR Pass guide (value email) | Day 30 | Goodwill, long-term nurture |

## Setup Instructions

### 1. Database Schema

Run the SQL schema in Supabase:

```bash
# Copy schema to Supabase SQL editor
cat marketing/email-nurture/schema.sql
```

This creates:
- `email_subscribers` - Subscriber management
- `email_campaigns` - 9 drip emails
- `email_sends` - Individual send tracking
- `email_events` - Opens, clicks, unsubscribes
- `email_conversions` - Revenue attribution
- Analytics views

### 2. Mailgun Configuration

1. Sign up at [mailgun.com](https://www.mailgun.com)
2. Verify your domain (e.g., `mg.tripcompanion.app`)
3. Add to `.env`:

```bash
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=mg.tripcompanion.app
```

### 3. Configure Webhooks

Add webhook in Mailgun dashboard:

**URL:** `https://yourdomain.com/api/email/webhook`

**Events:**
- ✅ Delivered
- ✅ Opened
- ✅ Clicked
- ✅ Unsubscribed
- ✅ Complained
- ✅ Bounced

### 4. Set Up Cron Job

Run daily to send drip emails:

**Option A: Vercel Cron (recommended for production)**

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/email/cron/process-drip",
    "schedule": "0 10 * * *"
  }]
}
```

**Option B: Manual cron (development)**

```bash
# Add to crontab
0 10 * * * curl -X POST http://localhost:3000/api/email/cron/process-drip -H "X-Cron-Secret: YOUR_SECRET"
```

**Option C: GitHub Actions (free)**

Create `.github/workflows/email-drip.yml`:

```yaml
name: Email Drip Campaign
on:
  schedule:
    - cron: '0 10 * * *'  # 10 AM UTC daily

jobs:
  send-emails:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger drip campaign
        run: |
          curl -X POST https://yourdomain.com/api/email/cron/process-drip \
            -H "X-Cron-Secret: ${{ secrets.CRON_SECRET }}"
```

### 5. Generate Cron Secret

```bash
# Add to .env
CRON_SECRET=$(openssl rand -hex 32)
echo "CRON_SECRET=$CRON_SECRET"
```

## API Endpoints

### Subscribe User

```bash
POST /api/email/subscribe
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "source": "landing_page",
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "japan_trip"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed",
  "subscriberId": "uuid"
}
```

### Unsubscribe

```bash
GET /api/email/unsubscribe?token={subscriber_id}
```

Shows unsubscribe confirmation page.

### Track Conversion

```javascript
// When user upgrades to premium
const emailScheduler = require('./lib/email-scheduler');

await emailScheduler.trackConversion(
  subscriberId,
  stripePaymentId,
  9.99  // amount in USD
);
```

### Analytics

```bash
GET /api/email/analytics
```

Returns:
- Overall stats (subscribers, open rate, click rate, conversion rate)
- Campaign performance (all 9 emails)
- Revenue and LTV

### Dashboard

```
http://localhost:3000/email-dashboard
```

Real-time analytics dashboard with:
- Total subscribers
- Open/click/conversion rates vs targets
- Campaign-by-campaign breakdown
- Revenue tracking

## Embedding Subscribe Form

### Option 1: Simple Form

```html
<form action="/api/email/subscribe" method="POST">
  <input type="email" name="email" placeholder="Enter your email" required>
  <input type="text" name="firstName" placeholder="First name">
  <button type="submit">Get Free Template</button>
</form>
```

### Option 2: JavaScript Widget

```html
<div id="email-subscribe-widget"></div>
<script>
(async function() {
  const email = prompt('Enter your email to get the free Japan itinerary template:');
  if (!email) return;

  const response = await fetch('/api/email/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source: 'popup_widget' })
  });

  const result = await response.json();
  if (result.success) {
    alert('✅ Check your email! Your template is on the way.');
  }
})();
</script>
```

## Email Template Customization

Edit templates in `marketing/email-nurture/templates/`:

- `email-1-welcome.html` - Welcome email
- `email-2-offline-maps.html` - Offline maps guide
- `email-3-ai-review.html` - AI review of itinerary
- `email-4-case-study.html` - Customer case study
- `email-5-sakura-forecast.html` - Cherry blossom forecast
- `email-6-premium-offer.html` - **50% discount offer**
- `email-7-social-proof.html` - Social proof
- `email-8-last-chance.html` - **Urgency close**
- `email-9-jr-pass.html` - Free JR Pass guide

**Variables available:**
- `{{firstName}}` - Subscriber first name (or "there")
- `{{email}}` - Subscriber email
- `{{appUrl}}` - App URL from .env

Templates automatically include unsubscribe footer.

## Testing

### Send Test Email

```bash
curl -X POST http://localhost:3000/api/email/cron/test-email \
  -H "X-Cron-Secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriberId": "uuid-here",
    "campaignSequence": 1
  }'
```

### Manually Trigger Drip

```bash
curl -X POST http://localhost:3000/api/email/cron/process-drip \
  -H "X-Cron-Secret: YOUR_SECRET"
```

## Expected Results

Based on industry benchmarks for SaaS email nurture:

### Engagement Metrics (30 days)
- **Open rate:** 35% (target), 45% (optimistic)
- **Click rate:** 8% (target), 12% (optimistic)
- **Unsubscribe rate:** <2% acceptable

### Conversion Metrics
- **Free-to-paid conversion:** 12% (target)
  - Email 6 (Day 14): 7% convert
  - Email 8 (Day 21): 3% convert
  - Later (Email 9+): 2% convert

### Revenue Impact
- **1,000 free signups** → **120 paid customers** (12% conversion)
- **120 customers × $9.99/month** = **$1,199/month MRR**
- **LTV per free signup:** $1.20 (12% × $9.99)

### 12-Month Projection
- **10,000 free signups** (launch campaign)
- **1,200 conversions** (12%)
- **$11,988/month MRR** = **$143,856 annual revenue**

## Optimization Tips

1. **A/B test subject lines** - Test urgency vs. value-driven
2. **Personalize send times** - Track when user is most active
3. **Segment by engagement** - Send extra nudge to clickers who didn't convert
4. **Update cherry blossom dates** - Email 5 should have current year forecast
5. **Rotate case studies** - Update Email 4 with real customer stories
6. **Test discount amounts** - 50% vs. $5 flat discount
7. **Extend urgency window** - If Day 21 performs well, add Day 28 final offer

## Troubleshooting

**No emails sending:**
- Check Mailgun API key in .env
- Verify domain is verified in Mailgun
- Check cron job is running

**Low open rates (<20%):**
- Check subject lines (A/B test)
- Verify sender email is not marked as spam
- Clean bounced emails from list

**Low click rates (<5%):**
- Make CTAs more prominent
- Add more links to upgrade page
- Test different discount offers

**Webhooks not working:**
- Verify webhook URL in Mailgun dashboard
- Check server logs for errors
- Test webhook with Mailgun test events

## Revenue Attribution

Conversions are automatically attributed to the last email sent before upgrade.

**Example:**
- User subscribes → Email 1 sent (Day 0)
- Email 2 sent (Day 2)
- Email 3 sent (Day 5)
- **User upgrades** → Conversion attributed to Email 3

This helps identify which emails drive the most revenue.

## Support

- Dashboard: `http://localhost:3000/email-dashboard`
- API docs: See above
- Logs: Check server console for email sending
- Analytics: Supabase `email_campaign_analytics` view

---

**Target achieved when:**
- ✅ 35%+ open rate across all campaigns
- ✅ 8%+ click rate across all campaigns
- ✅ 12%+ free-to-paid conversion rate
- ✅ $1.20+ LTV per free signup
