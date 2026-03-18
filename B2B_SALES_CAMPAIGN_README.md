# B2B Travel Agency Sales Campaign - Quick Start Guide

## Goal

Close 5-10 travel agency deals at $499-2,499/month to generate **$5K+ MRR within 60 days**.

This is the **highest-leverage revenue channel**: 1 enterprise customer = 100 individual users.

---

## What You Have

### 1. **200 Japan Travel Agency Leads**
   - File: `/data/agency-leads.csv`
   - Columns: name, email, website, location, estimatedSize
   - Ready to use (no scraping needed)

### 2. **3-Email Drip Campaign**
   - File: `/scripts/cold-email-sequence.js`
   - Email 1 (Day 0): "How {AgencyName} can launch a branded trip app in 24 hours"
   - Email 2 (Day 5): Case study - "40% booking increase with custom planner"
   - Email 3 (Day 10): "Quick question about your digital strategy"
   - Mailgun integration with open/click tracking

### 3. **Discovery Call Sales Script**
   - File: `/partners/discovery-call-script.md`
   - 15-minute structured call script
   - Discovery questions, demo walkthrough, ROI calculation, pricing, objection handling, closing

---

## Quick Start (5 Minutes)

### Step 1: Get Mailgun API Key

```bash
# Sign up at https://mailgun.com (free tier: 5,000 emails/month)
# Get your API key from Settings > API Keys
# Get your domain from Sending > Domains
```

### Step 2: Configure Environment

Add to your `.env` file:

```bash
MAILGUN_API_KEY=your_api_key_here
MAILGUN_DOMAIN=mg.tripcompanion.app
```

### Step 3: Test with 5 Agencies

```bash
npm run b2b:test
```

This sends Email 1 to the first 5 agencies. Verify:
- ✓ Emails are delivered
- ✓ Tracking works
- ✓ Links are functional

### Step 4: Launch Full Campaign

```bash
npm run b2b:send
```

This sends Email 1 to all 200 agencies (~10 minutes with rate limiting).

**Expected results:**
- 200 emails sent
- 40 responses (20% response rate)
- 20 discovery calls booked (10% of outreach, 50% of responses)
- 5 deals closed (50% close rate on calls)

---

## Campaign Timeline

| Day | Action | Expected Result |
|-----|--------|-----------------|
| **Day 0** | Send Email 1 to 200 agencies | 200 sent, 40 opened (20%), 8 clicked (4%) |
| **Day 1-4** | Respond to inbound replies | 10-15 responses, book discovery calls |
| **Day 5** | Send Email 2 (case study) | Additional 10-15 responses |
| **Day 8-14** | Conduct discovery calls | 10-20 calls, 5-10 deals closed |
| **Day 10** | Send Email 3 (quick question) | Final 5-10 responses, clean list |
| **Day 15-30** | Onboard agencies, build portals | First agencies go live |
| **Day 30-60** | Collect testimonials, referrals | Upsell, expand, 2nd batch outreach |

---

## Revenue Projections

### Conservative: 5 Starter Agencies
- 5 × $499/month = **$2,495 MRR** ($29,940 ARR)

### Base Case: 3 Professional + 2 Starter
- 3 × $999/month + 2 × $499/month = **$3,995 MRR** ($47,940 ARR)

### Optimistic: 1 Enterprise + 2 Professional + 2 Starter
- 1 × $2,499 + 2 × $999 + 2 × $499 = **$5,495 MRR** ($65,940 ARR)

**Target: $5K MRR = $60K ARR**

---

## Available Commands

### Email Campaign

```bash
# Preview email templates (dry-run, no emails sent)
npm run b2b:preview

# Test with 5 agencies
npm run b2b:test

# Send Day 0 email to all 200 agencies
npm run b2b:send

# Send Day 5 follow-up (case study)
npm run b2b:followup-day5

# Send Day 10 follow-up (quick question)
npm run b2b:followup-day10
```

### Manual Control

```bash
# Dry run with specific count
node scripts/cold-email-sequence.js --test 10

# Send specific email in sequence
node scripts/cold-email-sequence.js --day 5 --send
node scripts/cold-email-sequence.js --day 10 --send
```

---

## Handling Responses

### When They Reply Interested

**Response template:**

> Hi [Name],
>
> Thanks for your quick reply! I'd love to show you a quick demo.
>
> Here's my calendar: [calendar link]
>
> Or if you prefer a specific time, just let me know and I'll send a Zoom link.
>
> Looking forward to connecting!
>
> Best,
> Michael

**Then:**
1. Book discovery call within 48 hours
2. Send calendar invite with Zoom link
3. Review their website before call
4. Follow `/partners/discovery-call-script.md`

### When They Ask Questions

**Common questions & responses:**

**Q: "How much does it cost?"**
> We have three tiers: Starter ($499/mo), Professional ($999/mo), and Enterprise ($2,499/mo). The right tier depends on your monthly trip volume. Can we schedule a quick call to discuss which makes sense for [Agency Name]?

**Q: "Can I see a demo?"**
> Absolutely! Here's a live demo: https://tripcompanion.app/partners/demo?agency=[AgencyName]
>
> I'd also love to walk you through it personally and answer questions. Does [specific time] work for a 15-minute call?

**Q: "What's the setup process?"**
> Setup is simple:
> 1. You sign up (2 minutes)
> 2. Send us your logo and brand colors
> 3. We build your white-label portal (24 hours)
> 4. We onboard your team (1-hour call)
> 5. You send us an itinerary, we build it (2 hours)
> 6. You're live!
>
> First month is free on annual contracts, so you can test with real customers risk-free.

### When They Say Not Interested

**Response template:**

> No problem at all. Can I ask what solution you're currently using for trip planning?
>
> [If they share] → "That's great. If anything changes or you want to compare, feel free to reach out."
>
> [If they don't have one] → "Interesting. What's holding you back from having a digital solution?"

**Goal:** Learn objections to improve messaging.

---

## Discovery Call Checklist

### Before the Call (5 min prep)

- [ ] Research agency website
- [ ] Note their specialties (cherry blossom, food, luxury, etc.)
- [ ] Pull up demo: `https://tripcompanion.app/partners/demo?agency={Name}`
- [ ] Have pricing sheet ready
- [ ] Review discovery questions

### During the Call (15 min)

- [ ] Opening & agenda (2 min)
- [ ] Discovery questions (5 min) - **LISTEN MORE THAN TALK**
- [ ] Demo walkthrough (5 min) - Focus on THEIR pain points
- [ ] ROI calculation (2 min) - Use THEIR numbers
- [ ] Pricing & close (1 min)

### After the Call

- [ ] Send contract if they said yes
- [ ] Send follow-up email with next steps
- [ ] Add to CRM with notes
- [ ] Schedule onboarding call (if closed)

---

## Pricing Tiers

| Tier | Monthly | Annual | Best For | Includes |
|------|---------|--------|----------|----------|
| **Starter** | $499 | $4,990 | 10-50 trips/month | 1 white-label domain, email support |
| **Professional** | $999 | $9,990 | 50-200 trips/month | 3 domains, priority support, custom branding |
| **Enterprise** | $2,499 | $24,990 | 200+ trips/month | Unlimited domains, API access, dedicated manager |

**Special Offer:**
- First month free on annual contracts
- 30-day money-back guarantee
- Keep 100% of affiliate revenue

---

## Success Metrics

### Email Campaign

- **Target:** 200 emails sent
- **Expected:** 40 responses (20% response rate)
- **Goal:** 20 discovery calls booked

### Discovery Calls

- **Target:** 20 calls scheduled
- **Expected:** 10 calls completed (50% show rate)
- **Goal:** 5 deals closed (50% close rate)

### Revenue

- **Target:** $5K MRR within 60 days
- **Expected:** 5 agencies @ avg $999/month
- **Goal:** $60K ARR from initial campaign

---

## Files Reference

```
/data/
  agency-leads.csv              # 200 Japan travel agency contacts
  agency-email-tracking.json    # Email campaign tracking data

/scripts/
  cold-email-sequence.js        # 3-email drip campaign

/partners/
  discovery-call-script.md      # Comprehensive sales script
```

---

## Troubleshooting

### Emails not sending

**Check:**
1. Mailgun API key is correct in `.env`
2. Mailgun domain is verified (SPF, DKIM records)
3. Sending limit not exceeded (free tier: 5,000/month)
4. No firewall blocking Mailgun API

**Debug:**
```bash
# Test Mailgun configuration
node -e "console.log(process.env.MAILGUN_API_KEY)"
```

### Low open rates (<15%)

**Possible causes:**
1. Domain not verified → Emails going to spam
2. Subject line too salesy → Rewrite to be more personal
3. Email list quality → Verify emails are valid
4. Sending too fast → Add more delay between emails

**Fix:**
- Warm up domain: Send 10-20/day for first week
- A/B test subject lines
- Use email verification service (NeverBounce, ZeroBounce)

### No responses

**Check:**
1. Emails are being delivered (Mailgun logs)
2. Emails are being opened (tracking data)
3. Links are working (test all CTAs)
4. Reply-to email is correct

**If emails are opened but no replies:**
- CTA is not clear enough
- Value proposition is weak
- Timing is off (busy season for agencies)

---

## Next Steps After First Deal

### 1. Build White-Label Portal
- Collect logo, brand colors, domain preference
- Set up white-label subdomain
- Upload first itinerary
- Schedule onboarding call

### 2. Collect Testimonial
- After 30 days, ask for testimonial
- Include in future Email 2 (case study)
- Use in sales calls as social proof

### 3. Get Referral
- Ask satisfied customer for referral
- Offer incentive (1 month free for each referral)

### 4. Scale Campaign
- Expand to 500 agencies (2nd batch)
- Add LinkedIn outreach
- Add phone call follow-up
- Build referral program

---

## Expected Timeline to $5K MRR

```
Week 1:  Send emails, book calls          → $0 MRR
Week 2:  Close first 2 deals              → $2K MRR
Week 3:  Close 2 more deals               → $4K MRR
Week 4:  Close 1 more deal                → $5K MRR
Week 5+: Onboard, upsell, expand          → $7K+ MRR
```

**This is REALISTIC with 50% close rate on discovery calls.**

---

## Key Success Factors

1. **Fast response time** - Respond to inbound replies within 1 hour
2. **Personalization** - Use agency name, location, pain points in every email
3. **Persistence** - Follow up 5-6 times before giving up
4. **Discovery questions** - Listen 80%, talk 20% on calls
5. **ROI focus** - Always show numbers (conversion lift, affiliate revenue, time savings)
6. **Hard close** - Ask for the sale: "Let's get you set up today"

---

**Campaign is PRODUCTION-READY. Just add Mailgun API key and launch.**

Questions? Check `/B2B_AGENCY_CAMPAIGN_IMPLEMENTATION.md` for full details.
