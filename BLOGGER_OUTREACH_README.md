# 🎯 Blogger Outreach System - Complete Guide

## Overview

Automated affiliate partner recruitment system targeting Japan travel bloggers with 10K+ monthly traffic.

**Target Metrics:**
- 50 bloggers contacted
- 15% response rate (7 interested)
- 5 activated partners
- $363/partner/month average
- **$1,813 MRR total**

## 🚀 Quick Start (5 Minutes)

### 1. Set Up API Keys

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add:
HUNTER_API_KEY=your_hunter_api_key_here        # Get from hunter.io
MAILGUN_API_KEY=your_mailgun_api_key_here      # Get from mailgun.com
MAILGUN_DOMAIN=mg.tripcompanion.app             # Your Mailgun domain
SUPABASE_URL=https://your-project.supabase.co   # Already configured
SUPABASE_SERVICE_ROLE_KEY=your_key_here         # Already configured
```

### 2. Set Up Database

```bash
# Run the outreach schema migration
psql $DATABASE_URL -f db/outreach-schema.sql

# Or via Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Paste contents of db/outreach-schema.sql
# 3. Run
```

### 3. Run Your First Campaign (Dry Run)

```bash
# Test mode - finds emails but doesn't send
node scripts/run-outreach-campaign.js --target 10

# Review the exported JSON file
cat outreach-results-*.json
```

### 4. Send Real Emails

```bash
# LIVE MODE - Actually sends emails
node scripts/run-outreach-campaign.js --target 50 --send

# Monitor in dashboard
open http://localhost:3000/outreach/dashboard.html
```

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────┐
│  Blogger Outreach System                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Email Finding (Hunter.io)                      │
│     ↓                                              │
│  2. Email Personalization (Templates + AI)         │
│     ↓                                              │
│  3. Email Sending (Mailgun)                        │
│     ↓                                              │
│  4. Tracking (Mailgun Webhooks)                    │
│     ↓                                              │
│  5. Follow-ups (Automated Schedule)                │
│     ↓                                              │
│  6. Activation (Partner Dashboard)                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
japan-trip/
├── lib/
│   └── blogger-outreach.js          # Core outreach engine
├── api/
│   └── outreach/
│       └── campaigns.js             # API endpoints
├── outreach/
│   └── dashboard.html               # Admin dashboard
├── scripts/
│   ├── run-outreach-campaign.js     # CLI tool
│   └── process-followups-cron.js    # Cron job
└── db/
    └── outreach-schema.sql          # Database schema
```

## 🔑 API Keys Setup

### Hunter.io (Email Finding)

1. Sign up: https://hunter.io
2. Get 25 free searches/month (enough for initial testing)
3. Paid: $49/month for 500 searches (recommended for scale)
4. Add to `.env`: `HUNTER_API_KEY=your_key`

### Mailgun (Email Sending)

1. Sign up: https://mailgun.com
2. Verify your domain (mg.tripcompanion.app)
3. Add DNS records (MX, TXT, CNAME)
4. Get API key from dashboard
5. Add to `.env`:
   ```
   MAILGUN_API_KEY=your_key
   MAILGUN_DOMAIN=mg.tripcompanion.app
   ```

### Supabase (Database)

Already configured! Uses existing Supabase instance.

## 📧 Email Templates

### Initial Email
- Subject: `Quick question about [Blog Name]`
- Focus: Value proposition + specific compliment
- CTA: 15-minute demo
- Incentive: First 10 partners featured on homepage

### Follow-up 1 (Day 3)
- Subject: `Re: [Blog Name] partnership opportunity`
- Focus: Social proof (other partners)
- CTA: Quick "yes" to get details

### Follow-up 2 (Day 7)
- Subject: `Last chance: $2K+/month opportunity for [Blog Name]`
- Focus: Quick wins + revenue potential
- CTA: 5-minute setup walkthrough

### Follow-up 3 (Day 14)
- Subject: `Closing the loop on Trip Companion partnership`
- Focus: Final offer + scarcity (50 partner cap)
- CTA: Grab remaining spot

## 🛠 CLI Commands

### Run Campaign

```bash
# Dry run (default)
node scripts/run-outreach-campaign.js --target 20

# Send emails
node scripts/run-outreach-campaign.js --target 50 --send

# Custom delay between emails
node scripts/run-outreach-campaign.js --target 30 --send --delay 120

# Use existing blogger list (skip finding)
node scripts/run-outreach-campaign.js --no-find --send

# Help
node scripts/run-outreach-campaign.js --help
```

### Process Follow-ups

```bash
# Manual run
node scripts/process-followups-cron.js

# Set up cron (runs hourly)
crontab -e
# Add: 0 * * * * /usr/bin/node /path/to/japan-trip/scripts/process-followups-cron.js
```

## 🌐 API Endpoints

### Start Campaign
```bash
POST /api/outreach/campaigns/start
{
  "name": "Japan Bloggers March 2026",
  "targetCount": 50,
  "emailDelay": 60,
  "findEmails": true,
  "sendEmails": true,
  "scheduleFollowUps": true
}
```

### List Campaigns
```bash
GET /api/outreach/campaigns
```

### List Bloggers
```bash
GET /api/outreach/bloggers?status=activated
```

### Add Blogger
```bash
POST /api/outreach/bloggers
{
  "email": "sarah@japanguide.com",
  "firstName": "Sarah",
  "blogName": "Japan Guide",
  "domain": "japanguide.com",
  "monthlyTraffic": 50000
}
```

### Process Follow-ups
```bash
POST /api/outreach/follow-ups/process
```

### Mailgun Webhook
```bash
POST /api/outreach/webhooks/mailgun
# Automatically called by Mailgun
# Configure at: https://app.mailgun.com/app/sending/domains/[domain]/webhooks
```

## 📈 Dashboard

Access at: `http://localhost:3000/outreach/dashboard.html`

**Features:**
- Real-time KPIs (emails sent, open rate, response rate)
- Blogger status table (prospect → contacted → interested → activated)
- Campaign management
- Follow-up queue
- Manual blogger addition
- Data export (JSON)

**Key Metrics:**
- Open Rate: Target 21% (industry average)
- Response Rate: Target 15%
- Activation Rate: Target 10%

## 🔄 Automated Follow-ups

### How It Works

1. **Initial Email Sent**
   → 3 follow-ups automatically scheduled (Day 3, 7, 14)

2. **Cron Job Runs Hourly**
   → Checks for due follow-ups
   → Sends emails with rate limiting (1 min between)
   → Logs results to database

3. **Tracking**
   → Mailgun webhooks update email status (opened, clicked, replied)
   → Dashboard shows real-time stats
   → Auto-stop follow-ups if blogger replies

### Setup Cron

```bash
# Option 1: System cron
crontab -e
0 * * * * cd /path/to/japan-trip && node scripts/process-followups-cron.js >> logs/followups.log 2>&1

# Option 2: Vercel cron (vercel.json)
{
  "crons": [{
    "path": "/api/outreach/follow-ups/process",
    "schedule": "0 * * * *"
  }]
}

# Option 3: Manual trigger
curl -X POST http://localhost:3000/api/outreach/follow-ups/process
```

## 💰 Revenue Model

### Per-Partner Economics

| Metric | Value |
|--------|-------|
| Monthly traffic | 50,000 |
| Click-through rate | 2% |
| Clicks per month | 1,000 |
| Booking rate | 10% |
| Bookings per month | 10 |
| Average booking | $29 |
| Gross revenue | $290 |
| Commission (25%) | **$72.50** |

### Scale Projections

| Partners | MRR | ARR |
|----------|-----|-----|
| 5 | $363 | $4,350 |
| 10 | $725 | $8,700 |
| 25 | $1,813 | $21,750 |
| 50 | $3,625 | $43,500 |

## 🎯 Success Metrics

### Email Performance

- **Deliverability**: >95% (good domain reputation)
- **Open Rate**: 21-30% (personalized subject lines)
- **Click Rate**: 5-10% (clear CTA)
- **Response Rate**: 15-20% (strong value prop)

### Conversion Funnel

```
50 emails sent
  ↓ 21% open rate
10 emails opened
  ↓ 7% click rate
3 links clicked
  ↓ 50% response rate (of clickers)
2 interested responses
  ↓ 50% activation rate
1 activated partner
```

**Target**: 5 activated partners from 50 emails = 10% overall conversion

## 🚨 Troubleshooting

### "Hunter.io API error"
- Check `HUNTER_API_KEY` in .env
- Verify account has available searches
- System falls back to mock mode if key missing

### "Mailgun send failed"
- Verify `MAILGUN_API_KEY` and `MAILGUN_DOMAIN`
- Check domain is verified in Mailgun dashboard
- Ensure DNS records are correct (MX, TXT, CNAME)

### "No follow-ups due"
- Check `follow_up_queue` table has scheduled entries
- Verify `scheduled_for` timestamp is in the past
- Run: `SELECT * FROM pending_followups;`

### "Database connection error"
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Run schema: `psql $DATABASE_URL -f db/outreach-schema.sql`
- Check Supabase dashboard for table existence

### Low Response Rate
- Personalize more (mention specific blog posts)
- Test different subject lines
- Shorten email body (aim for <150 words)
- Improve value proposition
- Add more social proof

## 📋 Checklist for First Campaign

- [ ] Set up Hunter.io account and get API key
- [ ] Set up Mailgun domain and verify DNS
- [ ] Add API keys to .env file
- [ ] Run database migration (outreach-schema.sql)
- [ ] Test dry run: `node scripts/run-outreach-campaign.js --target 5`
- [ ] Review exported blogger data
- [ ] Customize email templates in `lib/blogger-outreach.js`
- [ ] Send test campaign: `--target 3 --send`
- [ ] Verify emails received and tracked
- [ ] Set up Mailgun webhooks
- [ ] Configure cron job for follow-ups
- [ ] Monitor dashboard for responses
- [ ] Prepare partner onboarding materials

## 🎓 Best Practices

### Email Deliverability

1. **Warm up domain**: Send 5-10 emails/day for first week
2. **SPF/DKIM/DMARC**: Ensure DNS records are correct
3. **Engagement**: High open rates improve reputation
4. **Bounces**: Remove bounced emails immediately
5. **Rate limiting**: 60-120 seconds between emails

### Personalization

1. **Research**: Find recent blog post to mention
2. **Traffic**: Reference their actual monthly traffic (SimilarWeb)
3. **Compliment**: Be specific (not generic "great blog")
4. **Relevance**: Show you understand their audience
5. **Urgency**: Limited spots (first 10, cap at 50)

### Response Handling

1. **Speed**: Respond within 4 hours
2. **Calendar**: Send Calendly link immediately
3. **Demo**: 15-minute screen share walkthrough
4. **Materials**: Send commission calculator + partner examples
5. **Activation**: Set up account during call

## 📞 Support

- **Dashboard**: http://localhost:3000/outreach/dashboard.html
- **API Docs**: See `/api/outreach/` directory
- **Logs**: Check Supabase dashboard → Logs
- **Mailgun**: https://app.mailgun.com/app/logs

## 🔒 Security

- Never commit .env file
- Use service role key (not anon key) for server-side
- Verify Mailgun webhook signatures
- Rate limit API endpoints
- Sanitize email input to prevent injection

## 📊 Analytics Integration

Track in Google Analytics:

```javascript
// Add to dashboard.html
gtag('event', 'campaign_started', {
  'campaign_name': 'Japan Bloggers March 2026',
  'target_count': 50
});

gtag('event', 'blogger_activated', {
  'blogger_email': 'sarah@japanguide.com',
  'monthly_traffic': 50000
});
```

## 🚀 Next Steps After Launch

1. **Week 1**: Monitor response rate, adjust templates
2. **Week 2**: Follow up manually with interested bloggers
3. **Week 3**: Activate first 5 partners
4. **Week 4**: Measure partner performance
5. **Month 2**: Scale to 25 partners
6. **Month 3**: Hit $1,813 MRR goal

---

**Built by**: Michael Guo
**Date**: March 18, 2026
**Status**: Production Ready
**Goal**: $1,813 MRR from 5 activated partners
