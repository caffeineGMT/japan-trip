# Reddit Value Post Blitz - r/JapanTravel Campaign

Complete marketing campaign for driving traffic and signups from r/JapanTravel (640K members).

**Strategy**: Lead with genuine value, NOT promotion. 2 high-value posts per week + daily response engagement.

**Target**: 5,000 post views → 500 site clicks → 50 beta signups → 5 paid conversions ($50 MRR)

**Campaign Duration**: 8 weeks (March 18 - May 13, 2026)

---

## 📁 Directory Structure

```
marketing/reddit/
├── posts/                          # 13 pre-written Reddit posts
│   ├── 01-cherry-blossom-forecast.md
│   ├── 02-ai-optimized-itinerary.md
│   ├── 03-ama-ai-trip-planner.md
│   └── 04-route-template.md
│
├── templates/                      # Response templates & emails
│   ├── response-templates.md       # 8 templates for common questions
│   └── beta-access-email.md        # 7 email drip campaign templates
│
├── assets/                         # Embeddable content
│   └── cherry-blossom-embed.html   # Interactive forecast widget
│
├── tracking/                       # Analytics & tracking
│   ├── campaign-tracker.csv        # Post performance metrics
│   ├── response-tracker.csv        # Daily response engagement
│   ├── conversion-funnel.csv       # Week-by-week funnel metrics
│   └── content-calendar.md         # 8-week posting schedule
│
└── README.md                       # This file
```

---

## 🚀 Quick Start

### Week 1 (March 18-24)

**Tuesday, March 18 - 8:00 AM EST**
1. Post `01-cherry-blossom-forecast.md` to r/JapanTravel
2. Include link to `/marketing/reddit/assets/cherry-blossom-embed.html`
3. Monitor for 2 hours, respond to ALL comments
4. Track metrics in `campaign-tracker.csv`

**Friday, March 21 - 10:00 AM EST**
1. Post `02-ai-optimized-itinerary.md`
2. Respond to comments within 2 hours
3. DM beta access links to requesters

**Daily (Mon-Sun)**
1. Find 5-10 "Planning first Japan trip" posts
2. Use templates from `response-templates.md`
3. Track in `response-tracker.csv`
4. Send beta access emails using `beta-access-email.md`

---

## 📊 Tracking & Analytics

### Daily Checklist
- [ ] Check r/JapanTravel new posts (sort by "New")
- [ ] Respond to 5-10 posts with helpful advice
- [ ] Reply to all comments on your posts
- [ ] Send beta access to DM requesters
- [ ] Update `response-tracker.csv`

### Weekly Checklist
- [ ] Create 2 new posts (Tue + Fri)
- [ ] Update `campaign-tracker.csv` with metrics
- [ ] Update `conversion-funnel.csv` with weekly totals
- [ ] Review content calendar for next week
- [ ] Adjust strategy if needed

### Metrics to Track

**Post Metrics** (update `campaign-tracker.csv`):
- Upvotes
- Comments
- Estimated views (upvotes × 20)
- Site clicks (check Google Analytics)
- DMs received
- Beta signups from post
- Paid conversions

**Response Metrics** (update `response-tracker.csv`):
- Thread URL
- Response type (used which template)
- Upvotes on your response
- Replies to your response
- DMs from that thread
- Beta signups

**Funnel Metrics** (update `conversion-funnel.csv` weekly):
- Post views
- Site visits
- Beta signups
- Activated users (logged in + created itinerary)
- Paid conversions
- Revenue
- Conversion rate (signups / visits)

---

## 📝 Reddit Posts

### Value Posts (Lead with Value)

**Post 1: Cherry Blossom Forecast** ✅
- Type: Data aggregation + interactive map
- CTA: Link to forecast widget
- Best for: Attracting cherry blossom planners
- Template: `posts/01-cherry-blossom-forecast.md`

**Post 2: AI Optimization Before/After** ✅
- Type: Case study with numbers
- CTA: Beta access to optimizer
- Best for: Showing ROI of tool
- Template: `posts/02-ai-optimized-itinerary.md`

**Post 3: AMA** ✅
- Type: Interactive Q&A
- CTA: GitHub repo + beta access
- Best for: Building credibility
- Template: `posts/03-ama-ai-trip-planner.md`

**Post 4: Route Template** ✅
- Type: Copy-paste resource
- CTA: Interactive version with offline maps
- Best for: Practical immediate value
- Template: `posts/04-route-template.md`

**Post 5+**: See `tracking/content-calendar.md` for full 8-week schedule

---

## 💬 Response Templates

8 templates for common questions:

1. **First-time visitor** (cherry blossom season)
2. **Route optimization** (itinerary help)
3. **JR Pass worth it?** (ROI calculation)
4. **Cherry blossom forecast** (timing questions)
5. **Hotel recommendations** (location advice)
6. **Food recommendations** (restaurant suggestions)
7. **Mobile data / SIM card** (connectivity)
8. **Beta access offer** (P.S. after value)

**File**: `templates/response-templates.md`

**Usage**:
1. Find a thread asking one of these questions
2. Copy the relevant template
3. Customize with specific details from their post
4. Add personal touch (reference their username, specific questions)
5. Post response
6. Track in `response-tracker.csv`

---

## 📧 Email Drip Campaign

7 email templates for beta users:

1. **Beta access** (Day 0) - Immediate access + instructions
2. **Follow-up** (Day 3) - Check-in, answer questions
3. **Conversion nudge** (Day 7) - If inactive, help them start
4. **Success story** (After trip) - Request testimonial
5. **Re-engagement** (Day 30) - New features, what's new
6. **Referral request** (Day 60) - Ask for shares
7. **Launch announcement** (Day 90) - Pricing, upgrade

**File**: `templates/beta-access-email.md`

**Usage**:
1. When someone DMs for beta access, get their email
2. Send Template 1 immediately
3. Schedule follow-ups based on timeline
4. Track open/click rates
5. Adjust based on engagement

---

## 🌸 Cherry Blossom Forecast Widget

**File**: `assets/cherry-blossom-embed.html`

**Features**:
- Interactive Leaflet map
- Real-time forecast data (pulls from `/data/sakura-forecast.json`)
- City cards with bloom status
- Confidence percentages
- CTA to main site

**Deployment**:
1. Upload to `/public/cherry-blossom-forecast` or deploy separately
2. Update links in Reddit posts
3. Track pageviews with Google Analytics
4. Add UTM parameters: `?utm_source=reddit&utm_campaign=forecast_post`

**Updating Data**:
1. Edit `/data/sakura-forecast.json`
2. Change `lastUpdated` date
3. Update city statuses, peak dates, confidence
4. Widget auto-refreshes on page load

---

## ✅ Best Practices

### DO:
- ✅ Lead with genuine, detailed advice
- ✅ Include specific prices, times, locations
- ✅ Share personal experiences
- ✅ Answer the exact question asked
- ✅ Mention tool ONLY as P.S. after providing value
- ✅ Respond to ALL comments within 2 hours
- ✅ Track EVERY metric
- ✅ Ask permission before using testimonials
- ✅ Be honest about when other tools are better

### DON'T:
- ❌ Start responses with "Check out my tool"
- ❌ Copy-paste same response everywhere
- ❌ Post more than 2x per week (looks spammy)
- ❌ DM people unsolicited
- ❌ Argue with critics (respond politely once, disengage)
- ❌ Delete posts that don't perform well
- ❌ Violate r/JapanTravel self-promotion rules

---

## 🎯 Success Metrics

### Week-by-Week Targets

| Week | Post Views | Site Visits | Signups | Paid | Revenue |
|------|-----------|-------------|---------|------|---------|
| 1 | 900 | 80 | 8 | 0 | $0 |
| 2 | 1,300 | 120 | 12 | 1 | $15 |
| 3 | 1,500 | 150 | 15 | 2 | $30 |
| 4 | 1,100 | 100 | 10 | 1 | $15 |
| 5 | 1,600 | 140 | 12 | 1 | $15 |
| 6 | 1,300 | 110 | 8 | 0 | $0 |
| 7 | 1,000 | 80 | 5 | 0 | $0 |
| 8 | 700 | 50 | 3 | 0 | $0 |
| **TOTAL** | **9,400** | **830** | **73** | **5** | **$75** |

### Conversion Rates to Optimize

- **Post views → Site visits**: 8-10%
- **Site visits → Signups**: 8-10%
- **Signups → Activated**: 60%
- **Activated → Paid**: 10%

---

## 🛠️ Tools & Resources

### Required Accounts
- [ ] Reddit account (aged 30+ days, 100+ karma)
- [ ] Google Analytics (track site visits)
- [ ] Email service (Mailgun, SendGrid, or manual)
- [ ] Spreadsheet software (Google Sheets, Excel)

### Recommended Tools
- [ ] **Pushshift Reddit Search** - Find relevant threads
- [ ] **Reddit Enhancement Suite** - Better Reddit UX
- [ ] **Later for Reddit** - Schedule posts
- [ ] **Google Sheets** - Track metrics
- [ ] **Calendly** - Schedule user calls
- [ ] **Loom** - Record video testimonials

### Analytics Setup

**Google Analytics Events** (track these):
```javascript
// When user clicks forecast link from Reddit
gtag('event', 'click', {
  'event_category': 'reddit_campaign',
  'event_label': 'forecast_widget',
  'value': 1
});

// When user signs up for beta from Reddit
gtag('event', 'signup', {
  'event_category': 'reddit_campaign',
  'event_label': 'beta_access',
  'value': 1
});
```

**UTM Parameters** (use consistently):
- Source: `utm_source=reddit`
- Medium: `utm_medium=organic_post` or `utm_medium=comment`
- Campaign: `utm_campaign=japan_travel_blitz`
- Content: `utm_content=[post_id]` or `utm_content=[template_name]`

---

## 🚨 Emergency Procedures

### If Post Gets Removed for Self-Promotion
1. Remove all CTAs and tool links
2. Message mods politely asking for reinstatement
3. Repost as 100% value (no mentions)
4. Offer help via DMs only

### If Engagement Lower Than Expected
1. Shift to 100% response-based (no new posts)
2. Focus on quality over quantity
3. Post in smaller subreddits (r/solotravel, r/travel)
4. Analyze what's not working (check competitor posts)

### If Engagement Higher Than Expected
1. Increase response frequency (3x per day)
2. Create bonus content (YouTube, Instagram)
3. Launch referral program
4. Scale up email campaign

---

## 📅 Timeline Overview

**Weeks 1-2**: Launch + AMA (high engagement phase)
**Weeks 3-4**: Peak cherry blossom season (urgency-driven)
**Weeks 5-6**: Post-trip reports + comparisons
**Weeks 7-8**: Wind-down + launch announcement

**Daily**: Response engagement (5-10 posts per day)
**Weekly**: 2 value posts (Tuesday + Friday mornings)
**Monthly**: Review metrics, adjust strategy

---

## 🎓 Learning Resources

**Study these subreddits**:
- r/JapanTravel (main target)
- r/Travel (broader audience)
- r/solotravel (solo travelers)
- r/churning (travel hackers)

**Study these posts** (top all-time):
- Sort r/JapanTravel by "Top" → "All Time"
- Analyze what makes them successful:
  - Titles (how they grab attention)
  - Formatting (how they present info)
  - CTAs (if any, how subtle)
  - Comment engagement (how OP responds)

**Competitive Analysis**:
- Search r/JapanTravel for "trip planner"
- See what others have posted
- Note what worked vs didn't
- Position yours differently

---

## 📞 Support

**Questions about this campaign?**
- Check `tracking/content-calendar.md` for weekly schedule
- Check `templates/response-templates.md` for common Q&A
- Check `templates/beta-access-email.md` for email copy

**Need to update assets?**
- Cherry blossom data: Edit `/data/sakura-forecast.json`
- Reddit posts: Edit files in `posts/` directory
- Response templates: Edit `templates/response-templates.md`
- Tracking: Update CSV files in `tracking/` directory

---

## ✨ Success Tips

1. **Be genuinely helpful first** - People can smell promotion from a mile away
2. **Respond to EVERYTHING** - Every comment is a potential conversion
3. **Track religiously** - What gets measured gets managed
4. **Iterate based on data** - If something's not working, change it
5. **Build relationships** - This is a long game, not a one-time blast
6. **Be patient** - Week 1 won't be huge. Week 3-4 will peak.
7. **Stay authentic** - Share real experiences, admit when you don't know
8. **Celebrate small wins** - Each signup is a real person trusting you

---

**Good luck! You're about to help a lot of people plan amazing Japan trips. 🌸**
