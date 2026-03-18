# 30-Day Twitter Content Calendar
## Japan Trip Companion - Building in Public

---

## Week 1: Launch & Foundation (Days 1-7)

### Day 1 - Monday, March 19
**Tweet Type**: Launch Announcement
**Time**: 9:00 AM PT
```
🇯🇵 Day 1: Building a Japan trip planner in public.

The problem: Spent 40 hours planning my own Japan trip. There had to be a better way.

The solution: AI-powered planner with offline maps, live cherry blossom forecasts, and smart routing.

Goal: Ship MVP in 30 days. Here we go.

#buildinpublic #traveltech
```

### Day 2 - Tuesday, March 20
**Tweet Type**: Technical Achievement
**Time**: 7:00 AM PT
```
Day 2: Shipped offline maps today.

✅ 500+ map tiles cached
✅ Service worker implemented
✅ Works in airplane mode

Users can now plan their route while riding the Shinkansen with no wifi.

Here's the caching strategy: [screenshot of code]

#buildinpublic #PWA #webdev
```

### Day 3 - Wednesday, March 21
**Tweet Type**: Problem-Solution Story
**Time**: 12:00 PM PT
```
Day 3 problem: How do you predict cherry blossom blooms 6 months in advance?

❌ Tried 3 APIs - all had stale data
✅ Built a scraper that pulls from Japan Meteorological Agency
✅ Historical data + AI forecasting

Accuracy: 85% within 3-day window

Sometimes you gotta build it yourself.

#buildinpublic #AI
```

### Day 4 - Thursday, March 22
**Tweet Type**: User Research Insight
**Time**: 6:00 PM PT
```
Day 4: Interviewed 5 people planning Japan trips.

Top pain points:
1. JR Pass confusion (all 5 mentioned this)
2. Train route optimization
3. Temple/shrine differences
4. Restaurant reservations
5. Language barrier

Building a JR Pass calculator next. What else am I missing?

#buildinpublic #traveltech
```

### Day 5 - Friday, March 23
**Tweet Type**: First Weekly Thread (see separate section)
**Time**: 9:00 AM PT

### Day 6 - Saturday, March 24
**Tweet Type**: Visual Demo
**Time**: 10:00 AM PT
```
Day 6: Weekend shipping doesn't stop.

Just added walking directions between all stops with estimated times:

🚶 Senso-ji → Skytree: 23 min
🚇 Or take Ginza line: 8 min

Every route now has 3 options: walk, transit, or taxi with time + cost.

[GIF of route selector in action]

#buildinpublic
```

### Day 7 - Sunday, March 25
**Tweet Type**: Reflection + Milestone
**Time**: 7:00 PM PT
```
Day 7: First week done.

What shipped:
✅ Offline maps (500 tiles)
✅ Cherry blossom forecasts
✅ Multi-route planner
✅ JR Pass calculator

What's next:
🔜 Restaurant reservation tracker
🔜 Trilingual support (EN/CN/JP)
🔜 Weather widgets

Thanks for following along. This is fun.

#buildinpublic
```

---

## Week 2: Growth & Validation (Days 8-14)

### Day 8 - Monday, March 26
**Tweet Type**: Technical Deep Dive
**Time**: 9:00 AM PT
```
Day 8: How to make a PWA work offline.

Three caching strategies I'm using:

1. Cache-first for map tiles (never change)
2. Network-first for API data (freshness matters)
3. Stale-while-revalidate for images (best of both)

Code: [screenshot of service worker strategies]

Result: 90% faster on repeat visits.

#webdev #buildinpublic
```

### Day 9 - Tuesday, March 27
**Tweet Type**: First User Milestone
**Time**: 12:00 PM PT
```
Day 9: First real user (who's not my wife)!

Sarah from Portland is using it to plan her April cherry blossom trip.

Her feedback: "The JR Pass calculator alone saved me $200"

THIS is why we build.

Still 100% free. Building features before pricing.

#buildinpublic #indiehackers
```

### Day 10 - Wednesday, March 28
**Tweet Type**: Learning in Public
**Time**: 7:00 AM PT
```
Day 10 lesson: Don't optimize too early.

Spent 3 hours making route algorithm 40ms faster.

Then realized users only calculate routes 2-3 times total.

Better use of time: Adding more destinations.

Lesson: Speed matters, but features matter more early on.

#buildinpublic
```

### Day 11 - Thursday, March 29
**Tweet Type**: Community Question
**Time**: 6:00 PM PT
```
Day 11 question for travelers:

What's the ONE thing you wish you knew before going to Japan?

Building a "First-Timer Tips" section. Need your wisdom.

Best answers get featured in the app (with credit).

#JapanTravel #buildinpublic
```

### Day 12 - Friday, March 30
**Tweet Type**: Weekly Thread
**Time**: 9:00 AM PT

### Day 13 - Saturday, March 31
**Tweet Type**: Feature Tease
**Time**: 11:00 AM PT
```
Day 13: Sneak peek at trilingual mode.

🇺🇸 English
🇨🇳 简体中文
🇯🇵 日本語

Toggle between all three with one click. Every place name, description, and travel phrase.

Targeting Chinese tourists - $258B annual Japan travel market.

Ships Monday.

[Screenshot of language toggle]

#buildinpublic
```

### Day 14 - Sunday, April 1
**Tweet Type**: Weekend Reflection
**Time**: 8:00 PM PT
```
Day 14: Two weeks in.

Stats so far:
👥 12 active users
📧 24 email signups
⭐ 100% positive feedback
💰 $0 revenue (still free)

Most requested feature: AI itinerary optimizer

"Just tell me where to go and the app plans everything"

Guess what I'm building this week?

#buildinpublic
```

---

## Week 3: Monetization Validation (Days 15-21)

### Day 15 - Monday, April 2
**Tweet Type**: Feature Launch
**Time**: 9:00 AM PT
```
Day 15: Trilingual support is LIVE.

Switch between English, Chinese, and Japanese instantly.

Every destination, phrase, and instruction translated.

Try it: [link with UTM]

Thanks to everyone who tested the beta!

#buildinpublic #traveltech
```

### Day 16 - Tuesday, April 3
**Tweet Type**: Revenue Experiment
**Time**: 12:00 PM PT
```
Day 16: First pricing experiment.

Adding "Pro" tier this week:
• AI itinerary optimizer
• Unlimited saved trips
• Export to Google Maps
• Priority support

Price: $9.99 one-time (lifetime access)

Too cheap? Too expensive? Hit me with feedback.

#buildinpublic #indiehackers
```

### Day 17 - Wednesday, April 4
**Tweet Type**: Validation Win
**Time**: 7:00 AM PT
```
Day 17: Someone just paid.

$9.99. My first dollar.

It was Sarah from Day 9. She said:
"This saved me 20 hours of planning. Absolute steal."

Building products people actually want to pay for feels incredible.

#buildinpublic #indiehackers
```

### Day 18 - Thursday, April 5
**Tweet Type**: Problem Solving
**Time**: 6:00 PM PT
```
Day 18: Payment provider drama.

Stripe rejected my account: "High risk travel category"

PayPal: 5% fees + 21-day hold
Paddle: $500/mo minimum

Went with Lemon Squeezy: 5% + $0.50, instant payout, no minimums.

Indie-friendly payment processors exist. Don't settle.

#buildinpublic
```

### Day 19 - Friday, April 6
**Tweet Type**: Weekly Thread
**Time**: 9:00 AM PT

### Day 20 - Saturday, April 7
**Tweet Type**: User Testimonial
**Time**: 10:00 AM PT
```
Day 20: User story that made my week.

Mike used the app to plan his honeymoon:

"We wanted to visit 8 cities in 14 days. Your route optimizer showed us it was too rushed. We cut to 5 cities and had the trip of our lives. Thanks for saving our honeymoon."

This > any revenue milestone.

#buildinpublic
```

### Day 21 - Sunday, April 8
**Tweet Type**: 3-Week Milestone
**Time**: 7:00 PM PT
```
Day 21: Three weeks of building in public.

Numbers:
👥 47 users (+35)
💰 $89.91 revenue (9 paid users)
📧 103 email signups
⭐ 4.8/5 average rating

Conversion rate: 19% (!!)

Small sample size but wow. Building something people want feels different.

#buildinpublic #indiehackers
```

---

## Week 4: Growth & Authority (Days 22-30)

### Day 22 - Monday, April 9
**Tweet Type**: Technical Challenge
**Time**: 9:00 AM PT
```
Day 22: The AI itinerary optimizer is harder than I thought.

Challenge: Balance travel time, preferences, opening hours, and cherry blossom timing.

Current approach: Genetic algorithm with 6 parameters.

Result: Generates 50 itineraries, picks best one.

Takes 2.3 seconds. Needs to be under 1 second.

Optimizing the optimizer. Meta.

#buildinpublic #AI
```

### Day 23 - Tuesday, April 10
**Tweet Type**: Community Engagement
**Time**: 12:00 PM PT
```
Day 23 poll:

What's your biggest Japan trip planning frustration?

🗾 Finding hidden gems (not touristy spots)
💴 Budgeting and costs
🍱 Restaurant reservations
🚇 Transit navigation

Vote below - building next features based on results!

#JapanTravel #buildinpublic
```

### Day 24 - Wednesday, April 11
**Tweet Type**: Partnership Announcement
**Time**: 7:00 AM PT
```
Day 24: First partnership.

Teamed up with @JapanGuideOfficial to integrate their 4,000+ destination database.

Users now get:
✅ Verified opening hours
✅ Real-time closure alerts
✅ Professional photos
✅ Expert tips

Win-win: They get traffic, users get better data.

#buildinpublic #traveltech
```

### Day 25 - Thursday, April 12
**Tweet Type**: Founder Struggle
**Time**: 6:00 PM PT
```
Day 25 reality check:

Been working nights + weekends while keeping my day job.

Sleep: 5-6 hours
Coffee: Too much
Family time: Not enough

Is it sustainable? No.
Is it worth it? Time will tell.

To all the side hustle builders out there: I see you.

#buildinpublic #indiehackers
```

### Day 26 - Friday, April 13
**Tweet Type**: Weekly Thread
**Time**: 9:00 AM PT

### Day 27 - Saturday, April 14
**Tweet Type**: Feature Demo
**Time**: 11:00 AM PT
```
Day 27: The AI optimizer is done.

Tell it:
• Budget
• Interests (food/culture/nature)
• Pace (relaxed/moderate/packed)

It generates a complete 14-day itinerary in 0.8 seconds.

This took 40 hours manually. Now it's 30 seconds.

Demo video: [Loom link]

#buildinpublic #AI
```

### Day 28 - Sunday, April 15
**Tweet Type**: Revenue Milestone
**Time**: 8:00 PM PT
```
Day 28: Hit $200 total revenue today.

20 paid users at $9.99 each.

Breakdown by feature:
• 12 - AI optimizer
• 5 - Offline maps
• 3 - Trilingual support

Learning: AI features convert 3x better than utility features.

Next: Doubling down on AI.

#buildinpublic #indiehackers
```

### Day 29 - Monday, April 16
**Tweet Type**: Press Mention
**Time**: 9:00 AM PT
```
Day 29: Got featured!

@TravelHackerHQ mentioned us in their "Top 10 Japan Planning Tools" article.

Traffic spike: 847 visitors in one day (usual: 50)
Signups: 62 (usual: 3-4)
Sales: 7 (usual: 0-1)

Lesson: One good mention > 100 social posts.

How to get press: Build something genuinely useful, then ask nicely.

#buildinpublic
```

### Day 30 - Tuesday, April 17
**Tweet Type**: 30-Day Reflection Thread
**Time**: 9:00 AM PT
```
Day 30: One month of building in public.

Final numbers:
👥 234 users
💰 $289.65 revenue (29 paid users)
📧 318 email signups
🌟 47 Twitter followers (hey, it's a start)
⚡ 12 features shipped

Biggest lesson: Ship fast, listen harder.

Tomorrow: Month 2 begins. Let's 10x this.

Full thread on what I learned 👇

[thread continues below]

#buildinpublic #indiehackers
```

---

## Weekly Thread Format (Fridays, 9:00 AM PT)

### Week 1 Thread - March 23

```
🧵 Week 1 Building in Public: Japan Trip Planner

Stats:
👥 7 users (all friends/family)
💰 $0 revenue (100% free)
🚀 4 features shipped
⏰ 32 hours invested

What shipped: 👇

1/8
```

```
Feature 1: Offline Maps

✅ 500+ cached map tiles
✅ Service worker implementation
✅ Works with zero connectivity

Why it matters: Japan subway has spotty wifi. Users can plan anywhere.

[Screenshot of offline indicator]

2/8
```

```
Feature 2: Cherry Blossom Forecasts

Built custom scraper for Japan Meteorological Agency data.

Accuracy: 85% within 3-day window
Updates: Daily at 6 AM JST

[Screenshot of bloom tracker map]

3/8
```

```
Feature 3: Multi-Route Planner

Every destination now shows:
🚶 Walking (time + distance)
🚇 Transit (time + cost)
🚕 Taxi (time + cost)

Users choose based on preference.

4/8
```

```
Feature 4: JR Pass Calculator

Input: Your planned routes
Output: Buy JR Pass? Yes/No + savings amount

Beta tester Sarah saved $200 on her trip.

5/8
```

```
Biggest Challenge:

Service worker caching strategies. Took 6 hours to get right.

Cache-first vs Network-first vs Stale-while-revalidate.

Wrote a guide: [link]

6/8
```

```
Biggest Win:

First user who's not my wife.

Sarah from Portland. Planning April trip. Gave incredible feedback.

"The calculator alone is worth paying for"

Note to self: Add payment soon.

7/8
```

```
Next Week Goals:

🎯 Get to 20 users
🎯 Add trilingual support
🎯 Build restaurant tracker
🎯 Set up payment processing

Follow along if you're into travel tech or building in public!

#buildinpublic #traveltech

8/8
```

### Week 2 Thread - March 30

```
🧵 Week 2: The numbers are moving.

Stats this week:
👥 47 users (+40)
💰 $9.99 revenue (first dollar!)
📧 103 email signups
📈 Website visits: 423

Big moments + lessons learned 👇

1/9
```

```
Shipped This Week:

✅ Trilingual support (EN/CN/JP)
✅ Weather widgets for each day
✅ Pro tier pricing ($9.99)
✅ AI itinerary hints

From idea to production in 7 days.

[Screenshot of language toggle]

2/9
```

```
Revenue Milestone: First Dollar

Sarah (my Day 9 user) became first paying customer.

Her words: "This saved me 20 hours of planning. Absolute steal."

I cried a little. Not gonna lie.

3/9
```

```
Pricing Strategy:

$9.99 one-time (lifetime access)

Why not subscription?
• Travel planning is one-time
• Better value perception
• Lower barrier to entry

May add subscription for agencies later.

4/9
```

```
Payment Provider Drama:

❌ Stripe: Rejected (high-risk category)
❌ PayPal: 5% + 21-day holds
❌ Paddle: $500/mo minimum
✅ Lemon Squeezy: 5% + $0.50, instant

Indie-friendly exists. Don't settle.

5/9
```

```
User Research Insights:

Interviewed 20 travelers.

Top requests:
1. AI optimizer (12 mentions)
2. Restaurant reservations (9)
3. Hidden gems list (7)
4. Budget tracker (5)

Building AI optimizer next.

6/9
```

```
Traffic Breakdown:

🔍 Google: 12%
🐦 Twitter: 8%
📧 Email: 3%
👤 Direct: 77%

Direct = friends sharing.

Need better SEO + social presence.

7/9
```

```
Biggest Mistake:

Spent 3 hours optimizing route algorithm (40ms → 28ms).

Users calculate routes 2-3 times TOTAL.

Lesson: Optimize where users feel it. That wasn't here.

8/9
```

```
Week 3 Goals:

🎯 Hit 100 users
🎯 $200 revenue milestone
🎯 Launch AI itinerary optimizer
🎯 Start SEO push
🎯 Get first press mention

Let's go.

#buildinpublic #indiehackers

9/9
```

### Week 3 Thread - April 6

```
🧵 Week 3: Revenue is real.

This week:
👥 127 users (+80)
💰 $289.65 revenue (+$279.66)
📈 29 paid users
💳 19% conversion rate

From side project to real product.

Thread on what's working 👇

1/10
```

```
Feature That Converted:

AI Itinerary Optimizer

• Tell it budget, interests, pace
• Generates full 14-day plan
• Optimizes for cherry blossoms
• Takes 0.8 seconds

12 of 29 paid users cited this as reason.

AI features convert 3x better.

[Demo GIF]

2/10
```

```
Revenue by Feature:

📊 Breakdown of what made people pay:

• AI optimizer: $119.88 (12 users)
• Offline maps: $49.95 (5 users)
• Trilingual: $29.97 (3 users)
• Export to Google Maps: $89.85 (9 users)

Lesson: Multiple value props > single killer feature.

3/10
```

```
User Testimonial of the Week:

"Used your app to plan our honeymoon. You showed us 8 cities was too rushed. We cut to 5 and had the trip of our lives. Thanks for saving our honeymoon." - Mike

This > money.

4/10
```

```
Partnership Win:

Integrated @JapanGuideOfficial's database.

• 4,000+ verified destinations
• Real-time closure alerts
• Professional photos
• Expert tips

They get traffic. Users get better data.

Win-win partnerships > going solo.

5/10
```

```
Traffic Growth:

Week 1: 89 visits
Week 2: 423 visits
Week 3: 1,247 visits

Sources:
🔍 Google: 34% (SEO starting to work)
📰 Referral: 28% (TravelHacker article)
🐦 Twitter: 12%
📧 Email: 11%
👤 Direct: 15%

6/10
```

```
Press Mention Impact:

@TravelHackerHQ featured us.

Before: 50 visits/day
Day of mention: 847 visits
Signups: 62 vs usual 3-4
Sales: 7 vs usual 0-1

One good mention = 2 weeks of social posting.

7/10
```

```
Technical Challenge:

AI optimizer was HARD.

Balancing:
• Travel time between spots
• Opening hours
• Cherry blossom timing
• User preferences
• Budget constraints

Solution: Genetic algorithm.

Took 40 hours to build. Worth it.

8/10
```

```
Reality Check:

Working nights + weekends.
Sleep: 5-6 hours.
Day job still full-time.

Sustainable? No.
Profitable enough to quit? Not yet.
Worth it? Ask me in 3 months.

9/10
```

```
Week 4 Goals:

🎯 Hit $500 total revenue
🎯 100 paid users
🎯 Launch budget tracker
🎯 Start affiliate program
🎯 Reddit marketing push

One month down. Let's scale.

#buildinpublic #indiehackers

10/10
```

### Week 4 Thread - April 13

```
🧵 Month 1 Complete: Building in Public

30 days of daily shipping.

Final numbers:
👥 234 users
💰 $539.65 revenue
📧 318 email signups
⭐ 4.8/5 rating (47 reviews)
🐦 127 Twitter followers

Everything I learned 👇

1/12
```

```
What Actually Worked:

1. Shipping daily (momentum compounds)
2. Being genuinely helpful (80% education, 20% promotion)
3. Real metrics transparency (people love real numbers)
4. Replying to EVERY comment
5. Building what users asked for

Consistency > intensity.

2/12
```

```
What Flopped:

1. Trying to go viral (5 attempts, 0 hits)
2. Over-optimizing performance (users didn't care)
3. Perfect code (ship fast > ship perfect)
4. Complex pricing (simple won)
5. Targeting everyone (niche is better)

3/12
```

```
Revenue Breakdown:

$9.99 one-time purchase × 54 users = $539.46

By source:
📧 Email: $239.76 (24 users)
🔍 Google: $139.86 (14 users)
🐦 Twitter: $59.94 (6 users)
👤 Direct: $99.90 (10 users)

Email > everything else.

4/12
```

```
Conversion Funnel:

2,847 visitors
→ 318 signups (11.2% conversion)
→ 54 paid users (17.0% conversion)

Landing page → signup: Need work
Signup → paid: Actually good

Focus: Improve top of funnel.

5/12
```

```
Most Valuable Features:

By user feedback:
1. AI itinerary optimizer (38 mentions)
2. Offline maps (29 mentions)
3. JR Pass calculator (24 mentions)
4. Cherry blossom forecast (21 mentions)
5. Trilingual support (18 mentions)

AI is the differentiator.

6/12
```

```
Time Investment:

Week 1: 32 hours
Week 2: 28 hours
Week 3: 41 hours
Week 4: 35 hours

Total: 136 hours

Revenue: $539.65
Effective rate: $3.97/hour

Not profitable yet. But it's growing.

7/12
```

```
User Demographics:

Age: 72% are 28-42
Gender: 58% female
Location: 47% USA, 22% EU, 18% Asia, 13% other

Planning window: 3-6 months before trip

Insight: Target anxious planners 4 months out.

8/12
```

```
Traffic Sources Deep Dive:

Organic search (34%):
• "japan trip planner AI" - #8 → #3
• "cherry blossom forecast 2026" - not ranked → #12
• "jr pass calculator" - #4 → #2

SEO works. It's slow but it works.

9/12
```

```
Community Building:

Replies sent: 247
DMs answered: 38
User interviews: 23
Feature requests implemented: 12

Talking to users > everything else.

They tell you what to build.

10/12
```

```
Mistakes I'd Fix:

1. Should've launched with payment (lost 2 weeks)
2. Should've done SEO from Day 1
3. Should've picked a niche sooner (Japan-only)
4. Should've built email list earlier
5. Should've asked for testimonials daily

11/12
```

```
Month 2 Goals:

🎯 1,000 total users
🎯 $2,000 revenue
🎯 200 paid users
🎯 Launch affiliate program
🎯 Get to 500 Twitter followers
🎯 Profitable enough to go part-time

Let's 4x this thing.

#buildinpublic #indiehackers

12/12
```

---

## Daily Engagement Tasks

### Morning Routine (7:00 AM PT, 15 min)
1. Post scheduled daily tweet
2. Check notifications, reply to comments from overnight
3. Like/retweet 5 posts from #buildinpublic feed
4. Check analytics from previous day

### Midday Check (12:00 PM PT, 10 min)
1. Post midday tweet (if planned)
2. Reply to any new comments
3. Engage with 3-5 tweets from target audience
4. Check website traffic from Twitter

### Evening Routine (6:00 PM PT, 20 min)
1. Post evening tweet (if planned)
2. Comprehensive reply session - clear all notifications
3. Deep engagement: Find 10 tweets to reply to meaningfully
4. Join relevant Twitter Spaces if available
5. Plan tomorrow's content

### Weekly Review (Friday, 30 min)
1. Analyze week's performance (engagement, clicks, followers)
2. Identify top performing tweets
3. Adjust strategy based on data
4. Prepare weekly thread
5. Schedule next week's core tweets

---

## Content Recycling

High-performing tweets can be:
- Expanded into threads
- Turned into blog posts
- Repurposed for LinkedIn
- Made into YouTube videos
- Added to email newsletter
- Compiled into guides/ebooks

**Never waste good content on a single platform.**

---

## Emergency Content (When You're Stuck)

1. **Behind-the-scenes code screenshot** - Always interesting
2. **"Today I learned" technical insight** - Educational
3. **User testimonial quote** - Social proof
4. **Metric update** - Transparency
5. **Ask a question** - Engagement driver
6. **Share a failure** - Relatability
7. **Poll about next feature** - Community involvement
8. **Retweet user success story** - User spotlight
9. **Quick tip for Japan travelers** - Value-add
10. **Progress screenshot comparison** - Visual proof

---

## Notes

- All times in US Pacific (Vancouver local time)
- UTM tracking on all links: ?utm_source=twitter&utm_medium=social&utm_campaign=buildinpublic
- Screenshots should be clean, well-cropped, with good contrast
- GIFs should be < 15 MB, < 10 seconds
- Videos should be < 2:20 (Twitter optimal length)
- Always include alt text for images (accessibility + SEO)
- Pin best-performing tweet each week
- Update bio weekly with latest milestone
