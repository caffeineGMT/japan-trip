# Visual Assets Guide
## Creating Engaging Visuals for Twitter

Visual content gets **2-3x more engagement** than text-only tweets. This guide covers how to create compelling visuals for your building in public campaign.

---

## 📸 Types of Visual Content

### 1. Screenshots
**Use for**: Code snippets, UI updates, dashboard metrics, user testimonials

**Best practices**:
- Clean, uncluttered background
- High contrast (dark mode or light mode, pick one)
- Highlight important parts (arrows, boxes, circles)
- Include context (file name, line numbers for code)
- Crop tightly - no wasted space
- Use consistent dimensions (16:9 or 1:1)

**Tools**:
- **CleanShot X** ($29, Mac) - Best for annotations, backgrounds, scrolling captures
- **Shottr** (Free, Mac) - Fast, lightweight, OCR support
- **ShareX** (Free, Windows) - Feature-rich, automations
- **Flameshot** (Free, Linux) - Powerful annotations

**Example tweets**:
```
Just shipped offline maps!

Here's the service worker caching strategy:
[Screenshot of code with syntax highlighting]

90% faster on repeat loads 🚀

#buildinpublic
```

### 2. Code Snippets
**Use for**: Technical deep-dives, tutorials, learning in public

**Best practices**:
- Use syntax highlighting
- Keep snippets short (< 20 lines)
- Include language indicator
- Add brief explanation
- Light or dark theme (be consistent)

**Tools**:
- **Carbon.now.sh** (Free, web) - Beautiful code images, many themes
- **Ray.so** (Free, web) - Clean, minimal, fast
- **Chalk.ist** (Free, web) - Gradient backgrounds, customizable
- **Snappify** (Freemium, web) - Animated code, presentations

**Settings for Carbon.now.sh**:
- Theme: `Monokai` or `One Dark`
- Font: `Fira Code` or `JetBrains Mono`
- Padding: `64px`
- Background: ON (with gradient)
- Shadow: ON

**Example tweets**:
```
How to cache 500+ map tiles in a service worker:

[Code snippet screenshot]

This powers the offline mode. No wifi needed on the Shinkansen 🚄

#webdev #buildinpublic
```

### 3. GIFs & Screen Recordings
**Use for**: Feature demos, UI interactions, workflows

**Best practices**:
- Keep under 10 seconds
- Show one feature/action clearly
- Add cursor highlighting
- Smooth, not janky (60fps if possible)
- File size < 15 MB (Twitter limit)
- Loop naturally if possible
- No sound needed (most watch muted)

**Tools**:
- **Loom** (Free) - Record, then convert to GIF
- **Gifox** ($20, Mac) - Direct GIF recording, great controls
- **LICEcap** (Free, cross-platform) - Simple, lightweight
- **Screen Studio** ($89, Mac) - Cinematic quality, auto-zoom
- **Kap** (Free, Mac) - Open source, plugins

**Conversion**:
```bash
# Use ffmpeg to convert video to optimized GIF
ffmpeg -i input.mp4 -vf "fps=30,scale=800:-1:flags=lanczos" -c:v gif output.gif

# Further optimize with gifsicle
gifsicle -O3 --lossy=80 output.gif -o optimized.gif
```

**Example tweets**:
```
New feature: Multi-route planner

Toggle between walk, transit, or taxi with live pricing.

[GIF of feature in action]

Which would you choose? 🚶🚇🚕

#buildinpublic
```

### 4. Charts & Graphs
**Use for**: Metrics, growth, comparisons, trends

**Best practices**:
- Simple, clear labels
- High contrast colors
- One chart per tweet (don't overwhelm)
- Annotate key points
- Include source/timeframe
- Export at 2x resolution for retina

**Tools**:
- **Chart.js** (Free, web) - Programmatic charts
- **Google Sheets** (Free) - Quick charts, export as PNG
- **Flourish** (Free, web) - Beautiful, animated charts
- **Datawrapper** (Free, web) - Publication-quality charts
- **Figma** (Free) - Custom designs

**Example chart types**:
- Line chart: Growth over time
- Bar chart: Comparisons
- Pie chart: Distribution (use sparingly)
- Area chart: Cumulative metrics

**Example tweets**:
```
Week 3 revenue breakdown:

[Bar chart showing feature-based revenue]

AI optimizer: $119 (12 users)
Offline maps: $49 (5 users)
Trilingual: $29 (3 users)

AI features convert 3x better.

#buildinpublic
```

### 5. Before/After Comparisons
**Use for**: Redesigns, performance improvements, optimizations

**Best practices**:
- Side-by-side or slider format
- Label clearly (BEFORE / AFTER)
- Highlight what changed
- Consistent framing/angle
- Same color scheme for fair comparison

**Tools**:
- **Figma** (Free) - Design side-by-side
- **Photoshop** (Paid) - Advanced editing
- **Canva** (Free) - Templates available

**Example tweets**:
```
UI redesign complete!

[Before/After screenshot]

Before: Cluttered, 12-step booking
After: Clean, 3-step booking

Conversion rate: 8% → 19% 🚀

#buildinpublic #design
```

### 6. Infographics
**Use for**: Guides, comparisons, processes, tips

**Best practices**:
- Vertical format (mobile-friendly)
- Clear hierarchy
- Use icons for visual interest
- Brand colors
- Readable on mobile (large text)
- Include your handle/logo

**Tools**:
- **Canva** (Free) - Templates, drag-and-drop
- **Figma** (Free) - Full design control
- **Piktochart** (Freemium) - Infographic-focused

**Example tweets**:
```
JR Pass: Worth it or skip it?

[Infographic flowchart]

✅ Worth it if:
- Tokyo → Kyoto → Osaka
- 3+ long-distance trips
- 7-day or 14-day pass

❌ Skip if:
- Staying in one city
- Using regional passes

Built a calculator: [link]

#JapanTravel
```

### 7. Memes & Humor
**Use for**: Relatability, virality, community bonding

**Best practices**:
- Relevant to your niche (dev/travel/startup)
- Not offensive
- Good timing (trends move fast)
- Credit original if remixing
- Your own spin (don't just repost)

**Tools**:
- **Imgflip** (Free, web) - Meme generator
- **Kapwing** (Free, web) - Video memes
- **Photoshop/Figma** - Custom memes

**Example tweets**:
```
Me: "I'll just add one small feature"

[Meme of person drowning in code]

Me 3 days later: Still debugging edge cases

#buildinpublic #devlife
```

---

## 🎨 Design System

### Color Palette

Create a consistent visual brand:

**Primary Color**: `#FF6B6B` (Coral - energy, passion)
**Secondary Color**: `#4ECDC4` (Teal - trust, calm)
**Accent**: `#FFE66D` (Yellow - optimism)
**Dark**: `#2D3748` (Dark gray - text)
**Light**: `#F7FAFC` (Off-white - backgrounds)

Use in all graphics for brand recognition.

### Typography

**Headings**: `Inter Bold` or `Montserrat Bold`
**Body**: `Inter Regular` or `Open Sans`
**Code**: `Fira Code` or `JetBrains Mono`

Always readable on mobile (min 14px).

### Logo Usage

If you have a logo:
- Bottom right corner
- 10-20% opacity watermark
- OR small in corner (not distracting)
- Include Twitter handle

### Consistent Dimensions

**Optimal sizes for Twitter**:
- Single image: `1200 x 675px` (16:9)
- Square: `1200 x 1200px` (1:1)
- Portrait: `1200 x 1500px` (4:5)
- Header image: `1500 x 500px`

**Why consistency matters**: Builds brand recognition, looks professional in feed.

---

## 📐 Templates

### Daily Update Template (Figma/Canva)

```
+----------------------------------+
|  DAY 7                           |
|  What I Shipped Today            |
|----------------------------------|
|                                  |
|  [Screenshot or visual]          |
|                                  |
|----------------------------------|
|  Feature: Offline Maps           |
|  Impact: 90% faster loads        |
|  Next: Trilingual support        |
|                                  |
|  @yourhandle  #buildinpublic     |
+----------------------------------+
```

### Metrics Dashboard Template

```
+----------------------------------+
|  WEEK 3 METRICS                  |
+==================================+
|  👥 Followers       127 (+40)    |
|  💰 Revenue      $289 (+$279)    |
|  📈 Visitors        423 (+334)   |
|  ⚡ Conversions      12 (+11)    |
+----------------------------------+
|  Conversion Rate: 19% ▲          |
+----------------------------------+
|  @yourhandle                     |
+----------------------------------+
```

### Feature Announcement Template

```
+----------------------------------+
|  ✨ NEW FEATURE                  |
+==================================+
|                                  |
|  [Feature screenshot/GIF]        |
|                                  |
+----------------------------------+
|  AI Itinerary Optimizer          |
|                                  |
|  ✅ 14-day trip in 30 seconds    |
|  ✅ Budget-aware routing         |
|  ✅ Cherry blossom optimized     |
|                                  |
|  Try it: [link]                  |
+----------------------------------+
```

---

## 🛠️ Production Workflow

### Quick Daily Screenshot
1. Take screenshot (CMD+Shift+4 on Mac)
2. Open in CleanShot → Add arrow/annotation
3. Export → Twitter-optimized size
4. Upload with tweet
**Time**: 2 minutes

### Code Snippet Share
1. Copy code to clipboard
2. Paste in Carbon.now.sh
3. Adjust theme/settings
4. Download PNG (2x resolution)
5. Tweet with explanation
**Time**: 3 minutes

### Feature Demo GIF
1. Open Gifox, set recording area
2. Demonstrate feature (< 10 seconds)
3. Stop recording → auto-optimized
4. Preview → Export
5. Tweet with context
**Time**: 5 minutes

### Weekly Metrics Chart
1. Update data in Google Sheets
2. Create chart (Insert → Chart)
3. Customize (colors, labels)
4. Download as PNG
5. Upload to tweet thread
**Time**: 10 minutes

---

## 📱 Mobile Optimization

**Critical**: 80%+ of Twitter users are on mobile.

### Checklist for every visual:
- [ ] Text is readable at phone screen size
- [ ] Important elements not cut off
- [ ] High contrast (readable in sunlight)
- [ ] File size < 5 MB (loads fast on 4G)
- [ ] Doesn't require zooming to read
- [ ] Looks good in timeline (cropped preview)

### Test before posting:
1. Upload to Twitter
2. View on your phone
3. Check timeline preview
4. View full image
5. Adjust if needed

---

## 🎯 Visual Content Calendar

### Daily visuals to mix in:

**Monday**: Metrics dashboard (weekend progress)
**Tuesday**: Code snippet (technical deep-dive)
**Wednesday**: Before/After comparison
**Thursday**: User testimonial screenshot
**Friday**: Weekly chart (for thread)
**Saturday**: Feature demo GIF
**Sunday**: Infographic or guide

Variety keeps feed interesting.

---

## ✅ Pre-Post Checklist

Before posting any visual:

- [ ] Image is clear and high-quality
- [ ] Text is readable on mobile
- [ ] Brand colors used (if applicable)
- [ ] No typos in text overlays
- [ ] Proper dimensions (1200x675 or 1200x1200)
- [ ] File size optimized (< 5 MB)
- [ ] Alt text added (accessibility!)
- [ ] Watermark/handle visible
- [ ] Saved copy for later repurposing

---

## 🔥 Viral Visual Patterns

### What tends to go viral:

1. **Metrics transparency** - Real revenue numbers with chart
2. **Before/After** - Dramatic improvements
3. **Code snippets** - Clever solutions to common problems
4. **Failure posts** - Showing vulnerability (with lesson learned)
5. **Memes** - Relatable developer/founder humor
6. **User testimonials** - Real people, real results
7. **Live updates** - "Just hit X milestone!" with screenshot

### Viral formula:
```
Relatable problem or achievement
+ Visual proof (screenshot/chart)
+ Clear insight/lesson
+ Engagement hook (question/poll)
= High engagement
```

---

## 🎬 Video Content (Advanced)

Once you're comfortable with images, add video:

### Twitter-Native Video
- Max length: 2:20 (but aim for < 1:00)
- Format: MP4 (H.264 codec)
- Resolution: 1280x720 or 1920x1080
- File size: < 512 MB
- Aspect ratio: 16:9 or 1:1
- Captions: Always (80% watch without sound)

### Types of videos:

**Product demos** (30-60 sec):
- Show feature in action
- No talking needed
- On-screen text explains
- Clear call-to-action

**Quick tips** (15-30 sec):
- One actionable tip
- Fast-paced
- Text overlay
- Hook in first 2 seconds

**Behind-the-scenes** (60-120 sec):
- Screen recording of you working
- Narration optional
- Show process
- Raw, authentic

### Tools:
- **Loom** (Free) - Screen + face recording
- **Screen Studio** ($89) - Cinematic screen recordings
- **OBS** (Free) - Professional streaming/recording
- **ScreenFlow** (Paid, Mac) - Advanced editing

---

## 📊 Visual Performance Tracking

Track which visuals perform best:

### Metrics to track:
- Impressions per visual type
- Engagement rate by format
- Click-through rate (for visuals with links)
- Saves/bookmarks (high intent)

### Create a spreadsheet:
```
Date | Type | Impressions | Engagements | CTR | Best Performer
-------------------------------------------------------------
3/19 | Screenshot | 1,234 | 89 | 7.2% | ✅
3/20 | Code snippet | 892 | 67 | 7.5% | ✅
3/21 | GIF | 2,341 | 234 | 10.0% | ✅✅✅
3/22 | Chart | 1,567 | 112 | 7.1% | ✅
```

### Insights:
- GIFs get 2-3x more engagement
- Code snippets attract technical audience
- Charts show authority
- Memes get shares (but less conversions)

Double down on what works.

---

## 🚀 Advanced Tactics

### 1. Visual Threads
Create carousel-style threads where each tweet has a visual:

```
Tweet 1: Title card with hook
Tweet 2: Screenshot 1 with explanation
Tweet 3: Screenshot 2 with explanation
Tweet 4: Chart showing results
Tweet 5: CTA with final visual
```

Higher engagement than text-only threads.

### 2. Animated GIFs
Show progression/time-lapse:
- Dashboard updating in real-time
- Code being written
- Deployment process
- User count increasing

**Tools**: After Effects, Keynote, Figma (prototype mode)

### 3. Stop-Motion Updates
Post same screenshot daily, slight changes:
- Day 1: 10 users
- Day 2: 15 users
- Day 3: 23 users

Followers anticipate daily update.

### 4. Community-Generated Content
Repost user screenshots:
- Feature requests
- Bug reports
- Success stories
- Creative uses

With permission, credit them.

---

## 🎨 Brand Assets

Create a folder with:
```
brand-assets/
├── logo.png (transparent background)
├── logo-dark.png
├── logo-light.png
├── color-palette.png
├── font-pack/ (ttf files)
├── templates/
│   ├── daily-update.fig
│   ├── metrics-dashboard.fig
│   ├── feature-announcement.fig
│   └── weekly-thread.fig
└── icons/
    ├── feature-icons/
    └── social-icons/
```

Speeds up daily creation.

---

## 📝 Alt Text Best Practices

Always add alt text (accessibility + SEO):

**Good alt text**:
- Describe what's shown
- Include text in image
- Mention colors if relevant
- Keep under 1,000 characters

**Examples**:

*For code snippet*:
```
"JavaScript code showing service worker caching strategy with cache-first method for map tiles"
```

*For metrics chart*:
```
"Bar chart showing revenue breakdown: AI optimizer $119, Offline maps $49, Trilingual $29"
```

*For screenshot*:
```
"Screenshot of Japan trip planner showing Tokyo to Kyoto route with 3 options: walk 6hrs, train 2hrs $140, taxi 6hrs $450"
```

---

## 🔄 Content Repurposing

Get 10x value from each visual:

**One screenshot can become**:
1. Twitter post
2. LinkedIn post
3. Instagram story
4. Blog post illustration
5. Email newsletter image
6. Landing page screenshot
7. Product Hunt launch image
8. Reddit post
9. Facebook group share
10. YouTube thumbnail

**Batch creation**:
- Create 5-10 visuals in one session
- Schedule throughout the week
- Repurpose across platforms
- Archive for future use

---

## 🎯 Visual Audit

Monthly review:

1. **Export top 10 tweets** (by engagement)
2. **Identify patterns**: What visuals worked?
3. **Note what flopped**: What to avoid?
4. **Adjust strategy**: Double down on winners
5. **Update templates**: Improve based on learnings

---

## 💡 Inspiration Sources

Follow these accounts for visual inspiration:

**Technical/Code**:
- @cassidoo - Code snippets, tutorials
- @swyx - Visual explanations
- @jhooks - Educational content

**Building in Public**:
- @levelsio - Metrics transparency
- @dvassallo - Charts & graphs
- @dinkydani21 - Dashboard screenshots

**Design**:
- @steveschoger - UI tips
- @gregisenberg - Visual storytelling
- @thisiskp - Beautiful layouts

**Travel Tech**:
- @airbnb - Product visuals
- @googlemaps - Feature demos

---

## ✅ Visual Content Checklist

Daily:
- [ ] At least 1 visual per tweet (when relevant)
- [ ] Alt text added
- [ ] Optimized file size
- [ ] Consistent branding

Weekly:
- [ ] Metrics chart for Friday thread
- [ ] At least 3 GIFs/demos
- [ ] 2-3 code snippets
- [ ] 1 before/after or comparison

Monthly:
- [ ] Audit top performers
- [ ] Update templates
- [ ] Batch create visuals
- [ ] Archive best content

---

**Remember**: Visuals should enhance your message, not replace it. The best tweets combine strong copy with compelling visuals.

Now go create some scroll-stopping content! 🎨
