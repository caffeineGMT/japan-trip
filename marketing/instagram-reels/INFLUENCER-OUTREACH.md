# Micro-Influencer Outreach Campaign

## Campaign Overview

**Goal:** Partner with 10-15 micro-influencers (10K-50K followers) for authentic Reels featuring our Japan trip planner

**Offer:**
- ✅ Lifetime Premium access (worth $99)
- ✅ Early access to new features
- ✅ 30% commission on all referrals (via custom affiliate code)
- ✅ Featured on our Instagram & website

**Ask:**
- 1-2 authentic Reels during their Japan trip
- Full creative freedom (no scripted content)
- Tag @JapanTripCompanion + use provided link

**Timeline:** 4 weeks (2 weeks outreach, 2 weeks execution)

---

## Influencer Prospect List

### Tier 1: High Priority (Planning Japan Trip Soon)

| Name | Handle | Followers | Engagement Rate | Niche | Trip Dates | Status | Notes |
|------|--------|-----------|-----------------|-------|------------|--------|-------|
| [Example] | @example | 25K | 7.2% | Japan travel | April 2026 | ⬜ Not Contacted | Active, posts daily |
| | | | | | | | |
| | | | | | | | |
| | | | | | | | |
| | | | | | | | |

### Tier 2: Medium Priority (General Asia Travel)

| Name | Handle | Followers | Engagement Rate | Niche | Status | Notes |
|------|--------|-----------|-----------------|-------|--------|-------|
| | | | | | | |
| | | | | | | |
| | | | | | | |

### Tier 3: Low Priority (Digital Nomads)

| Name | Handle | Followers | Engagement Rate | Niche | Status | Notes |
|------|--------|-----------|-----------------|-------|--------|-------|
| | | | | | | |
| | | | | | | |

**Status Legend:**
- ⬜ Not Contacted
- 📧 DM Sent
- 💬 In Conversation
- ✅ Agreed
- 🎥 Content Created
- 📊 Live & Tracking
- ❌ Declined/No Response

---

## How to Find Influencers

### Method 1: Hashtag Search
1. Search Instagram hashtags: #japantravel #tokyoguide #japantravelblogger
2. Filter by "Recent" to find active creators
3. Click on profiles with 10K-50K followers
4. Check engagement rate: (Likes + Comments) / Followers × 100
5. Target: 5%+ engagement rate
6. Add to prospect list if criteria met

### Method 2: Competitor Analysis
1. Find competitors or Japan travel apps
2. Check their tagged posts and collaborations
3. Identify influencers who've worked with similar products
4. Reach out with differentiated offer

### Method 3: Instagram Explore
1. Like/save 20-30 Japan travel Reels
2. Instagram will show similar content creators in Explore
3. Find micro-influencers in suggested content
4. Evaluate and add to list

### Method 4: Direct Search
Search Instagram for these accounts:
- Bio contains: "Japan travel" + "creator" or "blogger"
- Location: Tokyo, Kyoto, Osaka
- Recently active (posted within 7 days)

---

## Outreach Message Templates

### Initial DM (Personalized)

```
Hey [First Name]! 👋

Just watched your Reel about [specific content] - loved how you [specific compliment about their style/approach].

Quick intro: I'm [Your Name] from JapanTripCompanion.com. We built an AI-powered trip planner specifically for Japan with:
• Offline maps that work everywhere (subway, trains, rural areas)
• Live cherry blossom forecasts
• Smart routing that saves hours of planning

I noticed you're [planning a Japan trip / passionate about Japan travel], and I'd love to collaborate!

What I'm offering:
✅ Lifetime Premium access (normally $99)
✅ 30% commission on every referral (your unique code)
✅ Feature on our Instagram (3K followers, growing fast)
✅ Early access to new features

What I'm asking:
📱 1-2 authentic Reels using the app during your trip
🎨 Full creative freedom - show what genuinely helps you
🔗 Tag @JapanTripCompanion + share your affiliate link

No scripts, no forced reviews - just real value if it actually helps your trip.

Interested? I can send you access today and we can chat details!

- [Your Name]
www.JapanTripCompanion.com
```

### Follow-Up (If No Response After 3 Days)

```
Hey [Name],

Following up on my message about partnering for your Japan trip!

I totally get if you're swamped with DMs - just wanted to make sure you saw this because the offer is genuinely valuable:

🎁 $99 Lifetime Premium for FREE
💰 30% recurring commission on all referrals
📱 Perfect for your upcoming Japan trip

Would love to chat if you're interested. If not, no worries at all!

- [Your Name]
```

### Second Follow-Up (After 1 Week)

```
Last try! 😊

Saw you just posted about [recent content].

The offer stands if you change your mind - I think our app would genuinely make your Japan trip smoother (offline maps alone are a game-changer).

Either way, safe travels!

- [Your Name]
```

### After They Say Yes

```
Amazing! 🎉

Here's what happens next:

1️⃣ I'll send you a Lifetime Premium access code (check DMs)
2️⃣ Create your unique affiliate link: JapanTripCompanion.com/[yourname]
3️⃣ Set up your 30% commission tracking dashboard

For content:
📱 Use the app during your trip however is most helpful
🎥 Capture 1-2 Reels showing features you actually find useful
🔗 Tag @JapanTripCompanion + mention link in caption
🎨 Full creative control - authentic beats perfect!

Timeline: Whenever works for your trip! No rush.

Questions?

And here's your access code: [INSERT CODE]

- [Your Name]
```

---

## Influencer Partnership Agreement (Casual)

### Send After They Accept

```
Quick Partnership Details 📋

Just to make sure we're aligned:

**You Get:**
✅ Lifetime Premium Access (code: [INSERT])
✅ Affiliate Dashboard: [LINK]
✅ Your unique link: JapanTripCompanion.com/[name]
✅ 30% commission on ALL signups using your link (forever)
✅ Featured on our Instagram when you post

**You'll Create:**
📱 1-2 Reels showing the app during your Japan trip
🎥 Authentic, not scripted - show what actually helps you
🔗 Tag @JapanTripCompanion + share your affiliate link
📅 Post whenever works for your trip (we're flexible!)

**Commission Structure:**
• Free signups: $0 (but grows your audience for future $$)
• Paid signups ($99/year): You get $29.70 per signup
• They stay subscribed: You get 30% recurring (passive income!)

**Our Promise:**
💯 No micromanaging - you control the creative
📈 We'll boost your content in our Stories (3K+ audience)
🤝 Long-term partnership if it goes well

Sound good? Let me know if you have any questions!

- [Your Name]
```

---

## Affiliate Code Generation System

### Format
`JapanTripCompanion.com/[influencer-firstname]`

**Examples:**
- JapanTripCompanion.com/sarah
- JapanTripCompanion.com/mike
- JapanTripCompanion.com/travelwithalex

### Tracking Setup (Backend)
```javascript
// URL parameter tracking
const affiliateCode = new URLSearchParams(window.location.search).get('ref') ||
                      window.location.pathname.split('/')[1];

// Store in cookie for 30 days
if (affiliateCode) {
  document.cookie = `affiliate=${affiliateCode}; max-age=2592000; path=/`;
}

// Attribute signup to affiliate
function trackSignup(email, plan) {
  const affiliate = getCookie('affiliate');
  if (affiliate) {
    // Send to backend: { email, plan, affiliate, commission: 0.30 }
    logAffiliateConversion(email, plan, affiliate);
  }
}
```

### Commission Dashboard (Simple Version)
**What influencers see:**
- Total clicks: 156
- Signups: 12 (7.7% conversion)
- Paid conversions: 3
- Total earnings: $89.10
- Next payout: $89.10 (processes on 1st of month)

---

## Influencer Performance Tracking

### Individual Influencer Metrics

| Name | Handle | Reach | Clicks | Signups | Paid | Revenue | Commission Owed | Status |
|------|--------|-------|--------|---------|------|---------|-----------------|--------|
| Example | @example | 25K | 87 | 6 | 2 | $198 | $59.40 | Active |
| | | | | | | | | |
| | | | | | | | | |

### Top Performers (Update Monthly)
1. [Name] - [X signups, $X commission]
2. [Name] - [X signups, $X commission]
3. [Name] - [X signups, $X commission]

**Reward top performers:**
- Bonus payment ($50-100)
- Featured collaboration announcement
- First access to new features
- Higher commission tier (40-50%)

---

## Content Collaboration Guidelines

### What to Send Influencers

**Brand Assets Package:**
- Logo files (PNG, white & color versions)
- Color palette: #FF6B6B (coral), #4ECDC4 (teal), #F7FFF7 (off-white)
- App screenshots (high-res)
- Sample Reels for inspiration (NOT to copy)

**Content Guidance (Not Rules):**
```
💡 Content Ideas (Pick what resonates!)

1. "Here's how I'm navigating Tokyo with ZERO WiFi"
   → Show offline map feature

2. "I planned my entire 2-week Japan trip in under 10 minutes"
   → Screen record itinerary building

3. "This app told me EXACTLY when cherry blossoms would peak"
   → Show forecast widget, compare to reality

4. "Hidden spots feature saved me from tourist traps"
   → Show hidden gem recommendations

5. "The Google Maps of Japan travel (but better)"
   → Side-by-side comparison

Remember: Authentic beats perfect! Show what genuinely helps you.
```

---

## Response to Common Objections

### "I usually charge $X per post"
```
Totally understand! We're a startup so can't match your usual rates yet.

Instead, we're offering:
• 30% recurring commission (passive income potential)
• Lifetime value if your audience loves it
• Early partnership before we scale pricing

But if it's not a fit right now, I get it! Maybe we can revisit when we have more budget?
```

### "I need to see the product first"
```
100%! Would never ask you to promote something you haven't tried.

Let me send you Premium access right now - use it for your next trip planning (or upcoming Japan trip).

If you love it, we collaborate. If not, no hard feelings and you keep the Premium access as a gift!

Sound fair?
```

### "My audience might not be interested"
```
No pressure at all!

But quick question - what % of your audience asks about Japan travel? Even if it's 10-20%, that could be 1,000-5,000 people who'd find this super useful.

And with 30% commission, even 3-5 conversions = $100+ for a single Reel.

Worth considering?
```

### "I'm busy / don't have time"
```
Totally get it - I know you're juggling a lot!

Good news: This is super low-effort:
• Use the app naturally during your trip
• Capture one 15-second Reel showing it
• Post when convenient (no deadline)

That's it! If that still sounds like too much, no worries at all 🙂
```

---

## Success Milestones

### Week 1-2: Outreach Phase
- [ ] Identify 50 potential influencers
- [ ] Personalize and send 50 DMs
- [ ] Follow up with non-responders after 3 days
- **Goal:** 10 positive responses (20% response rate)

### Week 3-4: Activation Phase
- [ ] Send Premium access codes to all partners
- [ ] Set up affiliate tracking links
- [ ] Share brand assets and content guidelines
- [ ] Schedule check-in messages
- **Goal:** 7-10 Reels posted (70% activation rate)

### Month 2: Results & Optimization
- [ ] Track performance by influencer
- [ ] Identify top 3 performers
- [ ] Offer bonus incentives to top performers
- [ ] Request testimonials from successful partners
- **Goal:** 20+ signups from influencer traffic

---

## Long-Term Partnership Playbook

### Tier System (After First Collaboration)

**Bronze Tier** (First-time partners)
- 30% commission
- Standard support

**Silver Tier** (5+ conversions)
- 40% commission
- Priority support
- Quarterly bonus payments
- Featured on website

**Gold Tier** (20+ conversions)
- 50% commission
- Dedicated account manager
- Exclusive early access
- Annual partnership bonus ($500+)

---

## Notes & Learnings

### What Messages Get Responses
*(Update as you learn)*

### What Messages Get Ignored
*(Update as you learn)*

### Best Influencer Profiles
*(Update as you learn)*

---

*Campaign Start: [Insert Date]*
*Campaign Manager: [Insert Name]*
*Last Updated: March 18, 2026*
