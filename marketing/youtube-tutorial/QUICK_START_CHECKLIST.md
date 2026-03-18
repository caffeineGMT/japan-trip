# YouTube Tutorial - Quick Start Checklist

**Goal:** Film, edit, and publish "I Planned My Japan Trip in 10 Minutes" tutorial in 7 days.

**Expected Outcome:** 5,000 views → 100 clicks → 10 signups → 1 paid user → $10 MRR (Month 1)

---

## 📅 DAY-BY-DAY EXECUTION PLAN

### DAY 1: Pre-Production (3 hours)

**Morning (2 hours):**
- [ ] Read VIDEO_SCRIPT.md completely (internalize flow)
- [ ] Read PRODUCTION_GUIDE.md (technical setup)
- [ ] Watch 3 similar YouTube tutorials for inspiration:
  - [ ] Travel planning tutorials
  - [ ] Tech demo tutorials
  - [ ] Screen recording tutorials
- [ ] Note what works (pacing, B-roll, graphics)

**Afternoon (1 hour):**
- [ ] Download OBS Studio: https://obsproject.com/
- [ ] Test screen recording (record 30 seconds, play back)
- [ ] Test webcam (check lighting, framing)
- [ ] Test microphone (record voice, check for echo)
- [ ] Clean desktop (close apps, hide clutter)

**Setup Checklist:**
- [ ] OBS installed and configured (1080p, 30fps)
- [ ] Webcam positioned (eye level, well-lit)
- [ ] Microphone 6-8 inches from mouth
- [ ] Browser ready (Chrome incognito, 125% zoom)
- [ ] App loaded at http://localhost:3000 or deployed URL
- [ ] Script outline visible (phone or secondary monitor)

---

### DAY 2: Prepare Demo Data (2 hours)

**Create BEFORE Screenshot:**
- [ ] Open Google Docs
- [ ] Create messy trip planning doc:
  ```
  Title: "Japan Trip Planning Notes 😫"

  Tokyo - April 1-5???
  - Senso-ji temple (opening time?)
  - Shibuya crossing
  - teamLab? (tickets sold out?)
  - Hotel: need to book!!!

  Kyoto - when???
  - Fushimi Inari
  - Bamboo forest (where exactly?)
  - Train from Tokyo (how much? JR pass worth it?)

  Osaka - 2 days?
  - Osaka Castle
  - Dotonbori

  Random notes:
  - Cherry blossom timing CHECK WEATHER
  - WiFi rental or SIM card???
  - Restaurant reservations (which ones?)
  - Currency exchange
  ```
- [ ] Make it visually messy (mixed fonts, colors, strikethrough)
- [ ] Add Google Docs comments with questions
- [ ] Take screenshot (Cmd+Shift+4 on Mac)
- [ ] Save as: `before-screenshot.png`

**Create AFTER Screenshot:**
- [ ] Open app in browser
- [ ] Load "Tokyo Cherry Blossom 7 Days" template
- [ ] Customize to show perfect state:
  - [ ] Map zoomed to show Tokyo with markers
  - [ ] Sidebar showing Day 3 or 4 (middle of trip)
  - [ ] Cherry blossom widget visible in header
  - [ ] 8-10 markers visible on map
  - [ ] Route polyline connecting markers
- [ ] Take screenshot (full app window)
- [ ] Save as: `after-screenshot.png`

**Prepare App for Demo:**
- [ ] Test all features work smoothly:
  - [ ] Template selection
  - [ ] Date customization
  - [ ] Search & add stop (teamLab Borderless)
  - [ ] Cherry blossom forecast widget
  - [ ] Offline map download
  - [ ] PDF export (pre-generate to save time)
- [ ] Clear any test data (start fresh for recording)

---

### DAY 3: Filming (4 hours)

**Morning: Dry Run (1 hour)**
- [ ] Run through entire script with timer
- [ ] Note sections that take longer than expected
- [ ] Adjust pacing (speed up slow parts)
- [ ] Practice verbal delivery (no "um", "uh")
- [ ] Test all app features one more time

**Afternoon: Record (3 hours)**

**Take 1: Full Run (no stopping)**
- [ ] Hit record in OBS
- [ ] Do full 8-minute script
- [ ] Don't stop for small mistakes
- [ ] Mark mistakes verbally: "Let me redo that"
- [ ] Build confidence and rhythm
- [ ] Save file: `take1-full.mp4`

**Take 2: Segment Recording (best quality)**
- [ ] Record intro (full webcam) - 3 takes
- [ ] Record Step 1: Template selection - 2 takes
- [ ] Record Step 2: Customize dates - 2 takes
- [ ] Record Step 3: AI optimization - 3 takes (most important)
- [ ] Record Step 4: Add custom stop - 2 takes
- [ ] Record Step 5: Cherry blossom - 2 takes
- [ ] Record Step 6: Offline maps - 2 takes
- [ ] Record Step 7: Export PDF - 2 takes
- [ ] Record Step 8: Book hotel - 2 takes
- [ ] Record outro (full webcam) - 3 takes

**B-Roll Shots (30 min):**
- [ ] Messy Google Doc on screen (30 sec)
- [ ] Browser with 47 tabs open (15 sec)
- [ ] Excel spreadsheet with trip times (30 sec)
- [ ] Before/after side-by-side (record both screens)

**Post-Recording:**
- [ ] Review all clips (note best takes)
- [ ] Rename files clearly:
  - `intro-take1.mp4`, `intro-take2.mp4`
  - `step1-template.mp4`
  - `step2-dates.mp4`, etc.
- [ ] Backup to cloud (Google Drive or Dropbox)

---

### DAY 4: Video Editing - Assembly (3 hours)

**Import to DaVinci Resolve (Free):**
- [ ] Download DaVinci Resolve: https://www.blackmagicdesign.com/products/davinciresolve
- [ ] Create new project: "Japan Trip Tutorial"
- [ ] Import all clips to Media Pool
- [ ] Create folders: raw-footage, b-roll, music, sfx

**Editing Pass 1: Assembly Cut**
- [ ] Drag intro (best take) to timeline
- [ ] Add Step 1-8 (best takes of each)
- [ ] Add outro (best take)
- [ ] Cut dead air (pauses over 2 seconds)
- [ ] Cut "um", "uh", retakes
- [ ] Trim to ~8:00 total length

**Rough Timeline Should Look Like:**
```
0:00 - 0:20: Intro (full webcam)
0:20 - 0:45: Hook (screen + webcam)
0:45 - 1:30: Step 1 Template
1:30 - 2:15: Step 2 Dates
2:15 - 3:30: Step 3 AI Optimizer
3:30 - 4:45: Step 4 Custom Stop
4:45 - 5:30: Step 5 Cherry Blossom
5:30 - 6:15: Step 6 Offline Maps
6:15 - 7:00: Step 7 Export PDF
7:00 - 7:45: Step 8 Book Hotel
7:45 - 8:00: Outro (full webcam)
```

**Watch Through:**
- [ ] Play entire timeline
- [ ] Note jarring cuts
- [ ] Note pacing issues (too slow? too fast?)
- [ ] Save project

---

### DAY 5: Video Editing - Polish (4 hours)

**Editing Pass 2: Add Graphics**

**Timer Overlay:**
- [ ] Go to Fusion tab in DaVinci
- [ ] Add Text+ node
- [ ] Content: "0:00" (will animate)
- [ ] Font: SF Pro Display Bold, 48pt
- [ ] Color: Yellow (#FFD60A)
- [ ] Position: Bottom-left corner
- [ ] Add drop shadow (black, 50% opacity)
- [ ] Animate: Start at 00:45, count up to 07:30
  - (Use keyframes or expression: `timecode()`)

**Checklist Animation (optional - can skip if time-pressed):**
- [ ] Create checklist graphic in Canva
- [ ] Export as PNG with transparency
- [ ] Import to DaVinci
- [ ] Add at 0:20 (intro section)
- [ ] Animate items appearing (fade in, one by one)

**Before/After Comparison:**
- [ ] Import before-screenshot.png and after-screenshot.png
- [ ] Add at 2:15 (Step 3 - AI optimization)
- [ ] Split screen: 50/50
- [ ] Add labels: "BEFORE" (left), "AFTER" (right)
- [ ] Add arrow graphic pointing right: "Much better!"
- [ ] Duration: 5 seconds

**Editing Pass 3: Add Audio**

**Background Music:**
- [ ] Download royalty-free music:
  - YouTube Audio Library: "Tokyo Lights" by Lukrembo
  - OR Epidemic Sound (30-day free trial)
- [ ] Import to DaVinci (Music folder)
- [ ] Add to timeline (below voice track)
- [ ] Volume: -25dB (subtle, not overpowering)
- [ ] Fade in: 3 seconds at start
- [ ] Fade out: 3 seconds at end
- [ ] Audio ducking: -10dB when speaking (auto-duck or keyframe)

**Sound Effects:**
- [ ] Download from YouTube Audio Library:
  - Click sound (for button clicks)
  - Whoosh (for transitions)
  - Success chime (for end)
- [ ] Add subtle clicks when clicking buttons (-15dB)
- [ ] Add whoosh on step transitions (0.5s)
- [ ] Add chime when timer stops (8:00)

**Editing Pass 4: Color Grading**
- [ ] Go to Color tab
- [ ] Select all screen recording clips
- [ ] Adjust:
  - Lift (shadows): +5
  - Gamma (mid-tones): +3
  - Saturation: +10
  - Vibrance: +5
- [ ] Optional: Apply LUT (Tech Review LUT)

**Editing Pass 5: Captions**

**Quick Method (Auto-captions on YouTube):**
- [ ] Upload video to YouTube (unlisted)
- [ ] Let YouTube auto-generate captions
- [ ] Download .srt file
- [ ] Manually fix errors (proper nouns, technical terms)
- [ ] Re-upload to final video

**Pro Method (Descript):**
- [ ] Export audio from DaVinci (MP3)
- [ ] Upload to Descript.com (free trial)
- [ ] Auto-transcribe
- [ ] Fix errors:
  - "teamLab" not "team lab"
  - "Shibuya" not "she boo ya"
  - "Kyoto" not "key oh toe"
- [ ] Export as .srt
- [ ] Import .srt to DaVinci
- [ ] Style: White text, black outline, bottom third

**Final Export:**
- [ ] Go to Deliver tab
- [ ] Format: MP4
- [ ] Resolution: 1920x1080
- [ ] Frame rate: 30fps
- [ ] Quality: High (or "YouTube 1080p" preset)
- [ ] Export filename: `japan-trip-tutorial-final.mp4`
- [ ] Render (takes 10-30 minutes)

---

### DAY 6: Thumbnail & Metadata (2 hours)

**Create Thumbnail:**

**Option A: Photoshop (if you have it)**
- [ ] Follow THUMBNAIL_ASSETS.md guide
- [ ] Canvas: 1280 x 720px
- [ ] Import before-screenshot.png (left half)
- [ ] Import after-screenshot.png (right half)
- [ ] Add "BEFORE" label (red, top-left)
- [ ] Add "AFTER" label (green, top-right)
- [ ] Add "10 MINUTES" text (yellow, 120pt, center-bottom)
- [ ] Add "AI Trip Planner" subtitle (gray, 48pt)
- [ ] Add emojis: 😫 (left), ✨ (right)
- [ ] Export as PNG: `thumbnail-final.png`

**Option B: Canva (easier, free)**
- [ ] Go to Canva.com
- [ ] Create design → YouTube Thumbnail (1280x720)
- [ ] Upload before-screenshot.png and after-screenshot.png
- [ ] Use "Before and After" template
- [ ] Customize text: "10 MINUTES" (large, yellow)
- [ ] Add labels: BEFORE / AFTER
- [ ] Add emojis: 😫 / ✨
- [ ] Download as PNG

**Test Thumbnail:**
- [ ] Resize to 320x180 (mobile size)
- [ ] Can you still read "10 MINUTES"? (If no, make text larger)
- [ ] Is before/after contrast clear? (If no, increase color difference)

**Write Metadata:**

**Title (58 characters):**
```
I Planned My Japan Trip in 10 Minutes With This AI Tool
```

**Description (copy/paste this):**
```
I planned my entire 14-day Japan cherry blossom trip in under 10 minutes using this AI-powered trip planner. Here's exactly how it works.

🌸 Try it yourself (FREE): https://JapanTripCompanion.com?utm_source=youtube&utm_medium=video&utm_campaign=tutorial_main&utm_content=description

⏱️ Timestamps:
0:00 - Intro
0:45 - Choose template
1:30 - Customize dates
2:15 - AI route optimization
3:30 - Add custom stops
4:45 - Cherry blossom forecast
5:30 - Download offline maps
6:15 - Export PDF itinerary
7:00 - Book hotels

What's included:
✅ Pre-built itineraries (Tokyo, Kyoto, Osaka, Nara)
✅ AI route optimizer
✅ Live cherry blossom forecasts
✅ Offline maps (works without WiFi!)
✅ Trilingual support (English, Chinese, Japanese)
✅ Reservation tracking
✅ PDF export

This tool saved me literally 10+ hours of planning. If you're going to Japan in 2026, check it out.

---
💡 Disclosure: The app uses affiliate links for hotel bookings. Using them helps support the tool (and costs you nothing extra). You can also book directly - totally your choice.

#JapanTravel #JapanTrip #TravelPlanning #TokyoTravel #CherryBlossom
```

**Tags (copy these exactly):**
```
japan trip planning
japan travel guide
tokyo travel
kyoto travel
cherry blossom japan
japan itinerary
trip planner
travel app
ai travel planner
japan trip planner
how to plan japan trip
tokyo itinerary
kyoto itinerary
japan 2026
sakura forecast
offline travel maps
japan travel tips
travel technology
vacation planning
```

---

### DAY 7: Upload & Promote (2 hours)

**Upload to YouTube:**
- [ ] Go to YouTube Studio: https://studio.youtube.com/
- [ ] Click "Create" → "Upload video"
- [ ] Select: `japan-trip-tutorial-final.mp4`
- [ ] While uploading, add metadata:

**Video Details:**
- [ ] Paste title
- [ ] Paste description
- [ ] Upload thumbnail: `thumbnail-final.png`
- [ ] Select playlist: Create "Japan Travel Planning"
- [ ] Add tags (paste all 19 tags)

**End Screen:**
- [ ] Click "End screen" tab
- [ ] Add at 7:50 (last 10 seconds)
- [ ] Element 1: Subscribe button (top-left)
- [ ] Element 2: Best for viewer (auto-suggest video)
- [ ] Element 3: Link → External website
  - URL: `https://JapanTripCompanion.com?utm_source=youtube&utm_medium=video&utm_campaign=tutorial_main&utm_content=endscreen`
  - Call to action: "Try It Free"

**Cards:**
- [ ] Click "Cards" tab
- [ ] Add card at 2:00:
  - Type: Link
  - URL: `https://JapanTripCompanion.com?utm_source=youtube&utm_medium=video&utm_campaign=tutorial_main&utm_content=card_2min`
  - Teaser text: "Try the tool"
- [ ] Add card at 5:00:
  - Type: Link
  - URL: `https://JapanTripCompanion.com?utm_source=youtube&utm_medium=video&utm_campaign=tutorial_main&utm_content=card_5min`
  - Teaser text: "Download now"

**Captions:**
- [ ] Upload .srt file (if you created one)
- [ ] Set language: English
- [ ] OR let YouTube auto-generate (then review/edit)

**Advanced Settings:**
- [ ] Visibility: Public (or Schedule for Tuesday 2pm PT)
- [ ] Comments: Enabled
- [ ] Category: Travel & Events
- [ ] Not made for kids: Yes
- [ ] Enable monetization (if eligible)

**Publish:**
- [ ] Click "Publish" (or "Schedule" for optimal time)
- [ ] Copy video URL

**Pin Top Comment:**
- [ ] Go to video page
- [ ] Post comment:
  ```
  🌸 Where are YOU planning to go in Japan? Drop your dates below and I'll tell you if they're cherry blossom season!

  Try the tool: https://JapanTripCompanion.com?utm_source=youtube&utm_medium=video&utm_campaign=tutorial_main&utm_content=pinned_comment
  ```
- [ ] Pin comment (3-dot menu → Pin)

---

## 📱 PROMOTION PLAN (Same Day)

**Hour 1: Social Media Blitz**

**Facebook (15 min):**
- [ ] Share to personal timeline
  ```
  I just published a video showing how I planned my entire Japan trip in 10 minutes using AI.

  If you're thinking about visiting Japan (or know someone who is), this might help:
  [YouTube link]

  Would love your feedback! 🇯🇵✈️
  ```
- [ ] Tag friends who mentioned Japan trips
- [ ] Share to 5 travel groups:
  - [ ] Japan Travel
  - [ ] Tokyo Travel Tips
  - [ ] Solo Travel
  - [ ] Budget Travel
  - [ ] Digital Nomads

  Post format:
  ```
  Hey everyone! I created a detailed tutorial on using AI to plan Japan trips.

  Shows how to:
  • Build a 14-day itinerary in 10 minutes
  • Optimize routes with AI
  • Download offline maps
  • Time your trip for cherry blossoms

  Thought this community might find it useful. Not selling anything, just sharing what worked for me.

  [YouTube link]
  ```

**Reddit (15 min):**
- [ ] r/JapanTravel (12M members)
  ```
  Title: [Video Guide] How I planned my 2-week Japan trip in 10 minutes using AI

  Body:
  I spent weeks planning my last Japan trip and it was overwhelming. This time I tried an AI trip planner and it was SO much faster.

  Made a video showing the full workflow:
  - Choosing templates (Tokyo, Kyoto, Osaka)
  - AI route optimization (catches inefficient routes)
  - Cherry blossom forecast integration
  - Offline map downloads

  [YouTube link]

  Happy to answer questions about the tool or my trip planning process!
  ```

- [ ] r/solotravel (2M members)
  ```
  Title: AI trip planner saved me 10+ hours planning my Japan trip [video tutorial]

  Body:
  As a solo traveler, planning can be exhausting. Found this AI tool that built my entire 14-day Japan itinerary in 10 minutes.

  Made a tutorial showing exactly how it works: [YouTube link]

  Covers route optimization, offline maps, cherry blossom timing. Game-changer for solo planning.
  ```

**Instagram (10 min):**
- [ ] Post to Stories:
  - Screenshot of video thumbnail
  - Text: "New video: How I planned my Japan trip in 10 min 🤯"
  - Swipe up link: YouTube URL
  - Poll sticker: "Planning a Japan trip?" Yes/No

- [ ] Post to Feed:
  - Carousel: 3 slides
    1. Thumbnail screenshot
    2. "10 MINUTES" graphic
    3. "Watch now" CTA
  - Caption:
    ```
    Just dropped a tutorial on YouTube showing how I planned my entire 2-week Japan trip in 10 minutes using AI 🇯🇵✨

    • Cherry blossom timing ✅
    • Offline maps ✅
    • Route optimization ✅

    Full video link in bio!

    #JapanTravel #TravelPlanning #TokyoTravel #CherryBlossom #TravelTech
    ```

**Twitter/X (5 min):**
```
I planned my entire 14-day Japan trip in 10 minutes using this AI tool.

Just made a full tutorial showing exactly how:
• Template selection
• AI route optimization
• Cherry blossom forecasts
• Offline maps

[YouTube link]

Going to Japan in 2026? This will save you hours. 🇯🇵✨
```

**LinkedIn (5 min):**
```
I just published a case study: How AI reduced my Japan trip planning from 3 weeks to 10 minutes.

Built a video tutorial demonstrating:
• AI-powered route optimization
• Real-time cherry blossom forecast integration
• Offline-first PWA architecture
• Trilingual support (EN/CN/JP)

For anyone building travel tech or planning a Japan trip: [YouTube link]

The future of trip planning is automated, personalized, and delightful.
```

**Email Personal Network (15 min):**
- [ ] Subject: "I planned my Japan trip in 10 minutes 🤯"
- [ ] To: Friends, family, colleagues (BCC 200 people)
- [ ] Body:
  ```
  Hey!

  I just made a YouTube video showing how I planned my entire 2-week Japan trip in under 10 minutes using an AI trip planner.

  If you're thinking about visiting Japan (or know someone who is), this might be helpful:
  [YouTube link]

  It covers cherry blossom timing, route optimization, offline maps - all the stuff I wish I knew on my last trip.

  Would love to know what you think!

  [Your name]

  P.S. The tool is free to use: JapanTripCompanion.com
  ```

---

## 📊 DAY 8-30: MONITORING & OPTIMIZATION

**Daily (5 min):**
- [ ] Check YouTube Analytics (views, CTR, avg duration)
- [ ] Reply to ALL comments (be helpful, build community)
- [ ] Note common questions (might create follow-up video)

**Weekly (30 min):**
- [ ] Update tracking spreadsheet (see ANALYTICS_TRACKING.md)
- [ ] Pin new top comment (keep fresh)
- [ ] Share to 2 more Facebook groups
- [ ] Create 1 YouTube Short from main video

**Week 2: Create YouTube Shorts**
- [ ] Short 1: Hook (0:00-0:20) - "I spent 3 weeks planning last time..."
- [ ] Short 2: AI Demo (2:15-3:00) - "This AI caught my routing mistakes"
- [ ] Short 3: Cherry Blossom (4:45-5:15) - "Perfect timing for sakura"

**Week 3: A/B Test Thumbnail**
- [ ] If CTR < 6%, create new thumbnail variant
- [ ] Test for 3 days, keep winner

**Week 4: Analyze & Iterate**
- [ ] Review analytics (see ANALYTICS_TRACKING.md)
- [ ] Did we hit 5,000 views? (If not, increase promotion)
- [ ] Did we get 50 signups? (If not, optimize landing page)
- [ ] Did we get 5 paid users? (If not, improve onboarding)

---

## 🎯 SUCCESS CRITERIA (Month 1)

**YouTube Metrics:**
- [ ] 5,000 views
- [ ] 6%+ CTR (good thumbnail)
- [ ] 4:00+ avg view duration (50% retention)
- [ ] 250 likes (5% engagement)
- [ ] 50 comments (active discussion)
- [ ] 30% traffic from YouTube search (SEO working)

**Website Metrics:**
- [ ] 500 visitors from YouTube
- [ ] 3:00+ avg session duration
- [ ] 15% bounce rate (engaged visitors)

**Business Metrics:**
- [ ] 50 signups (10% conversion)
- [ ] 5 paid users (10% of signups)
- [ ] $50 MRR (5 users × $10/month)

**If You Hit These:** Congrats! Scale by creating more videos.
**If You Don't:** Diagnose (see ANALYTICS_TRACKING.md troubleshooting section).

---

## 💡 QUICK TIPS

**Time-Saving Hacks:**
1. **Skip captions for v1** - Let YouTube auto-generate, fix later
2. **Use Canva for thumbnail** - Faster than Photoshop
3. **Record in segments** - Easier to perfect each part
4. **Don't over-edit** - Good enough > perfect
5. **Ship on Day 7** - Don't polish for weeks, get feedback

**Common Mistakes:**
1. ❌ Intro too long (lose viewers) → Keep to 20 seconds
2. ❌ Speaking too fast (hard to follow) → Breathe, pause
3. ❌ No CTA (viewers don't click) → Say "link in description" 3 times
4. ❌ Thumbnail too busy (low CTR) → Keep it simple
5. ❌ Not promoting (no views) → Share everywhere Day 1

**Mindset:**
- **Done > Perfect** - Your first video will be imperfect. Ship it anyway.
- **Long-term game** - Month 1 may disappoint. Year 1 will compound.
- **Compound content** - Evergreen tutorial brings customers for years.

---

## ✅ FINAL CHECKLIST (Before Publishing)

- [ ] Video exported (1080p, MP4, under 10 min)
- [ ] Thumbnail created (1280x720, under 2MB)
- [ ] Title written (58 chars, includes "Japan trip planning")
- [ ] Description written (link in first 2 lines, timestamps added)
- [ ] Tags added (all 19 tags)
- [ ] End screen configured (subscribe + link)
- [ ] Cards added (2:00 and 5:00)
- [ ] Captions uploaded or auto-generated
- [ ] Top comment drafted (pinned after publishing)
- [ ] Social media posts drafted (Facebook, Reddit, Instagram)
- [ ] Email to personal network drafted
- [ ] YouTube Analytics access confirmed
- [ ] Google Analytics tracking confirmed (UTM parameters)

**You're ready to launch! 🚀**

---

## 🆘 NEED HELP?

**Stuck on filming?**
- Watch: "How I Record My Screen" by Ali Abdaal (YouTube)
- Watch: "OBS Tutorial for Beginners" by Gaming Careers (YouTube)

**Stuck on editing?**
- Watch: "DaVinci Resolve 18 - Full Tutorial for Beginners" by MrAlexTech (YouTube)
- Duration: 20 minutes (worth it)

**Stuck on thumbnail?**
- Use Canva template: Search "YouTube Before After"
- Copy exactly, customize text

**Stuck on promotion?**
- Minimum: Post to personal Facebook + email 50 friends
- That alone can get 200 views (your network)

**Questions?**
- Email: support@japantripcompanion.com
- Or: Ask in comments of the video (I'll help!)

---

**Remember:** The goal isn't a perfect video. The goal is SHIPPING a useful tutorial that helps people and drives signups.

**Week 1 target:** 500 views + 5 signups
**Month 1 target:** 5,000 views + 50 signups + 5 paid

**Let's do this! 🎬**
