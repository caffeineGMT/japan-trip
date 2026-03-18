# Quick Start Guide
## Get Your Twitter Campaign Running in 30 Minutes

---

## 🚀 Fast Track Setup

### Step 1: Install Dependencies (2 min)

```bash
cd /Users/michaelguo/japan-trip/marketing/twitter-building-in-public
npm install
```

### Step 2: Twitter API Setup (10 min)

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Click "Create App" (or use existing)
3. Name it "Japan Trip Companion Bot"
4. Get your keys:
   - API Key & Secret
   - Access Token & Secret
5. Copy `.env.template` to `.env`:
   ```bash
   cp .env.template .env
   ```
6. Add your credentials to `.env`

### Step 3: Optimize Your Profile (5 min)

**Bio** (160 chars):
```
Building AI Japan trip planner in public 🇯🇵
Offline maps | Cherry blossom forecasts | Smart routing
Day X of building → japan-trip-companion.com
#buildinpublic
```

**Header Image**:
- Use app screenshot or Japan travel photo
- 1500 x 500px
- Include your value prop as text overlay

**Pinned Tweet** (create this first):
```
🧵 Building a Japan trip planner from scratch.

The problem: Spent 40 hours planning my own trip. There has to be a better way.

The solution: AI-powered planner with offline maps, live cherry blossom forecasts, and smart routing.

Goal: Ship MVP in 30 days. Follow along 👇

#buildinpublic
```

### Step 4: Your First Tweet (5 min)

Use Day 1 from content calendar:

```bash
node twitter_automation.js tweet "🇯🇵 Day 1: Building a Japan trip planner in public.

The problem: Spent 40 hours planning my own Japan trip. There had to be a better way.

The solution: AI-powered planner with offline maps, live cherry blossom forecasts, and smart routing.

Goal: Ship MVP in 30 days. Here we go.

#buildinpublic #traveltech"
```

### Step 5: Schedule Week 1 Content (5 min)

Open `30_DAY_CONTENT_CALENDAR.md` and copy Day 2-7 tweets.

Schedule them:

```bash
# Day 2 - Tuesday 7:00 AM
node twitter_automation.js schedule "2026-03-20T07:00:00" "Day 2: Shipped offline maps today. ✅ 500+ map tiles cached..."

# Day 3 - Wednesday 12:00 PM
node twitter_automation.js schedule "2026-03-21T12:00:00" "Day 3 problem: How do you predict cherry blossom blooms..."

# Continue for Days 4-7
```

### Step 6: Set Up Daily Engagement Routine (3 min)

Create a daily reminder on your phone:
- **9:00 AM**: Post daily tweet + engage (15 min)
- **6:00 PM**: Reply to all comments + engage (15 min)

Or automate with cron:

```bash
crontab -e
```

Add:
```cron
# Process scheduled tweets hourly
0 * * * * cd /Users/michaelguo/japan-trip/marketing/twitter-building-in-public && node twitter_automation.js process

# Daily engagement at 10 AM
0 10 * * * cd /Users/michaelguo/japan-trip/marketing/twitter-building-in-public && node twitter_automation.js routine
```

---

## ✅ Day 1 Checklist

Your first day tasks:

- [ ] Profile optimized (bio, header, pinned tweet)
- [ ] First tweet posted (Day 1 announcement)
- [ ] Week 1 tweets scheduled (Days 2-7)
- [ ] Daily reminder set
- [ ] Read `ENGAGEMENT_PLAYBOOK.md` (20 min)
- [ ] Create list of 20 #buildinpublic accounts to engage with
- [ ] Reply to 5 tweets in #buildinpublic
- [ ] Join Indie Hackers Twitter group

---

## 📅 Week 1 Routine

### Daily (30 min/day)

**Morning (15 min)**:
- Check scheduled tweet posted
- Reply to overnight comments
- Like/RT 5 #buildinpublic posts

**Evening (15 min)**:
- Reply to all comments (100% reply rate!)
- Engage with 5-10 new tweets
- Prep tomorrow's content (if not scheduled)

### Friday (Extra 30 min)

- Generate weekly report: `npm run report 1`
- Create thread: `npm run generate-thread 1`
- Post thread at 9:00 AM PT
- Review analytics: `npm run top engagementRate 5`

---

## 🎯 Week 1 Goals

Start small, build consistency:

- [ ] 7 tweets posted (one per day)
- [ ] 1 weekly thread (Friday)
- [ ] 50+ replies sent to community
- [ ] 20+ followers gained
- [ ] 100% reply rate to your comments
- [ ] Daily engagement habit formed

**Don't worry about**:
- Going viral
- Hundreds of followers
- Perfect content
- Revenue

**Focus on**:
- Showing up daily
- Being genuinely helpful
- Building relationships
- Documenting your work

---

## 💡 Quick Tips

### If You're Short on Time

**Minimum viable routine (15 min/day)**:
1. Post daily tweet (2 min)
2. Reply to all your comments (5 min)
3. Engage with 5 #buildinpublic tweets (8 min)

That's it. Consistency > intensity.

### If Engagement is Low

Week 1 engagement will be low. That's normal.

**To bootstrap**:
1. DM 10 friends: "Starting building in public, could you engage with my first few tweets?"
2. Post in relevant Slack/Discord: "Starting BIP on Twitter, would appreciate support"
3. Be the first to engage with big accounts (reply guy strategy)
4. Join Twitter Spaces (instant visibility)

### If You're Stuck on Content

**Emergency content ideas**:
1. Screenshot your code with explanation
2. Share a metric (any metric)
3. Ask a question to your audience
4. Share what you learned today
5. Retweet someone else with your commentary
6. Post a poll
7. Share a user testimonial
8. Show before/after of anything
9. Share a failure (very relatable)
10. Just say what you're working on right now

---

## 📊 Tracking Your Progress

### End of Week 1

Run these commands:

```bash
# Generate report
npm run report 1

# Create tweet thread
npm run generate-thread 1

# Check top performers
npm run top engagementRate 10
```

Review:
- What content got most engagement?
- What times had best performance?
- Which hashtags worked?
- Who engaged most with you?

**Adjust Week 2 based on learnings.**

---

## 🚨 Common Week 1 Mistakes

### Don't Do This:
- ❌ Posting 5 tweets Day 1, then nothing for a week
- ❌ Only talking about your product
- ❌ Ignoring comments on your tweets
- ❌ Buying followers or using bots
- ❌ Comparing yourself to accounts with 10K followers
- ❌ Quitting because you got 3 likes

### Do This Instead:
- ✅ Post once daily, consistently
- ✅ 80% helpful content, 20% product
- ✅ Reply to EVERY comment
- ✅ Organic growth only
- ✅ Compare to yourself yesterday
- ✅ Trust the process, give it 90 days

---

## 🎉 You're Ready!

You've got:
- ✅ Twitter API configured
- ✅ Profile optimized
- ✅ First tweet posted
- ✅ Week 1 scheduled
- ✅ Daily routine planned
- ✅ Metrics tracking set up

**Now execute.**

The hardest part is starting. You just did that.

The second hardest part is staying consistent. That's your job for the next 90 days.

Questions? Check:
- `CAMPAIGN_OVERVIEW.md` for strategy
- `ENGAGEMENT_PLAYBOOK.md` for tactics
- `30_DAY_CONTENT_CALENDAR.md` for content ideas
- `README.md` for full documentation

Let's build in public! 🚀

---

## 📞 Support

Stuck? Here's how to get help:

1. **Technical issues**: Check README.md troubleshooting section
2. **Content ideas**: Use 30_DAY_CONTENT_CALENDAR.md
3. **Engagement tactics**: See ENGAGEMENT_PLAYBOOK.md
4. **Analytics questions**: Run `npm run --help`

**Remember**: Building in public is about the journey, not the destination. Enjoy the process.

---

**Next step**: Post your first tweet. Right now. Go!
