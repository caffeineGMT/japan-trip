/**
 * Partnership Outreach Email Templates
 * Templates for JAL, ANA, and smaller partner outreach
 */

const emailTemplates = {
  // JAL/ANA Tier 1 - Large Airline Pitch
  jalAnaPitch: {
    subject: "Partnership Opportunity: Increase Customer Satisfaction with Free Trip Planning Tool",
    body: `Dear [BD Contact Name],

I hope this email finds you well. My name is [Your Name], and I'm reaching out from TripCompanion, an AI-powered Japan trip planning platform used by over 10,000 travelers.

**Why This Partnership Makes Sense**

We've noticed that [JAL/ANA] passengers often struggle with trip planning after booking their flights. Our platform solves this by providing:

• Interactive offline maps for Japan (works without data)
• Real-time cherry blossom forecasts
• AI-powered route optimization
• Trilingual support (English, Chinese, Japanese)
• Pre-saved restaurant reservations

**The Partnership Structure**

We'd like to offer TripCompanion to your passengers with:
1. **20% exclusive discount** for [JAL/ANA] customers
2. **Co-branded landing page** (tripcompanion.app/[jal/ana])
3. **Post-booking email integration** - Link sent after ticket purchase
4. **20% revenue share** on all conversions from your passengers
5. **Anonymized travel data insights** to help optimize routes

**The Numbers**

• [JAL/ANA] flies 10M+ passengers to Japan annually
• 1% email conversion = 100,000 potential users
• 1% paid conversion = 1,000 customers = $10,000 MRR
• Zero cost to [JAL/ANA] - pure upside with revenue share

**Low-Risk Pilot**

We propose a 3-month pilot with:
- 10,000 passenger sample size
- Shared analytics dashboard
- No exclusivity required
- Easy opt-out if results don't meet expectations

**Data Partnership Value**

We'll share anonymized insights like:
- Most popular destinations among your passengers
- Optimal trip durations by season
- Booking patterns and preferences

This helps you optimize future route planning and marketing.

**Next Steps**

Would you be open to a 20-minute call next week to discuss this further? I can share our demo, case studies, and specific integration details.

Our platform is ready to launch immediately - we just need your blessing and a simple email integration.

Looking forward to helping [JAL/ANA] passengers have the best Japan experience possible.

Best regards,
[Your Name]
Founder, TripCompanion
[email@tripcompanion.app]
[phone]

P.S. I've attached a demo video and sample co-branded landing page mockup for your review.`,
    attachments: [
      'demo-video.mp4',
      'jal-landing-mockup.pdf',
      'case-study-travel-partners.pdf'
    ]
  },

  // Follow-up Email (7 days later)
  followUp1: {
    subject: "Re: Partnership Opportunity - Quick Question",
    body: `Hi [Name],

Just wanted to follow up on my previous email about the TripCompanion partnership.

I understand you're likely very busy, so I'll keep this brief:

**One Question:** Would a partnership that increases customer satisfaction at zero cost to [JAL/ANA] be worth a 15-minute conversation?

If yes, I'm happy to work around your schedule. If not, no worries at all - just let me know and I won't follow up further.

Either way, thanks for your time!

Best,
[Your Name]`
  },

  // Final Follow-up (14 days later)
  followUp2: {
    subject: "Last note - TripCompanion Partnership",
    body: `Hi [Name],

This will be my last email on this topic - I don't want to be a pest!

I wanted to share one quick update: We just launched partnerships with [Competitor Airline] and [Travel Agency], and early results are strong (22% email open rate, 3.2% conversion).

If you'd like to explore this for [JAL/ANA] before cherry blossom season peaks, I'm here. Otherwise, I'll assume the timing isn't right and won't reach out again.

Best of luck with your Q2 initiatives!

Best,
[Your Name]`
  },

  // Smaller Partners (Zipair, Peach, etc.)
  boutiqueAirlinePitch: {
    subject: "Partnership Opportunity: Add Value to Your Japan Routes",
    body: `Hi [Name],

I'm reaching out from TripCompanion because I noticed [Zipair/Peach] is growing rapidly in the Japan market.

**The Problem We Solve**

Budget airline passengers often book flights early but struggle with trip planning. We provide a complete Japan trip companion that works offline (perfect for travelers who don't buy expensive data plans).

**Partnership Proposal**

Simple integration:
1. Add TripCompanion link to your booking confirmation email
2. Your passengers get 25% off (better than JAL/ANA's 20%)
3. You earn 20% commission on every sale
4. Zero setup cost, zero ongoing work

**Why This Works for Budget Airlines**

• Adds value without increasing ticket prices
• Differentiates you from competitors
• Generates passive income stream
• Improves customer experience

**Quick Pilot**

Let's test with your next 5,000 passengers. I'll:
- Build a co-branded landing page this week
- Provide you with email template copy
- Set up tracking dashboard
- Share all data transparently

If it works, great. If not, we part as friends.

**Numbers**

Based on other airline partnerships:
- 12-18% email open rate
- 2-4% conversion rate
- $23.20 per sale × 20% commission = $4.64 per conversion
- 5,000 emails × 2% = 100 sales = $464 in pure commission

Interested in a quick 15-minute call?

Best,
[Your Name]
TripCompanion
[email]`
  },

  // JR Pass Reseller Pitch
  jrPassResellerPitch: {
    subject: "Upsell Opportunity: Trip Planning Tool for JR Pass Customers",
    body: `Hi [Name],

I run TripCompanion, a Japan trip planning platform, and I think we could create value together.

**The Insight**

Anyone buying a JR Pass is clearly planning extensive Japan travel. They need:
• Itinerary planning
• Route optimization (to maximize JR Pass value)
• Offline maps
• Station navigation

**The Opportunity**

Add TripCompanion as an upsell on your checkout page:
"Maximize your JR Pass value - Get AI-powered trip planning for $23 (20% off)"

**Revenue Share**

- You keep 30% of every sale (higher than airline partnerships)
- Average order value: $23.20
- Your cut: $6.96 per sale
- Zero work after initial setup

**Integration**

Super simple:
1. Add checkout page banner (I'll provide design)
2. OR post-purchase email (I'll provide copy)
3. Use your unique partner code for tracking
4. Get monthly commission payouts

**Why It Works**

Your customers are HIGHLY qualified - they're already spending money on Japan travel. Conversion rates with JR Pass sellers are 3-5× higher than cold traffic.

**Example Math**

If you sell 1,000 JR Passes per month:
- 5% take the upsell = 50 sales
- 50 × $6.96 = $348/month passive income
- $4,176/year for a one-time 30-minute setup

Want to test it with your next 500 customers?

Best,
[Your Name]`
  },

  // Success/Thank You Email (after partnership agreement)
  partnerWelcome: {
    subject: "Welcome to TripCompanion Partnerships! Next Steps",
    body: `Hi [Name],

Excited to get started! Here's everything you need:

**Your Partner Assets**

1. **Landing Page:** tripcompanion.app/[partner-code]
2. **Discount Code:** [CODE20] (20% off)
3. **Commission Rate:** 20% on all sales
4. **Tracking Dashboard:** [dashboard-link]

**Email Copy**

Subject: Plan Your Japan Trip with Our Recommended Tool

[I'll provide 3 versions for you to choose from]

**What Happens Next**

1. You send the email to your next batch of customers
2. They click through to your co-branded page
3. Purchases are automatically tracked to your account
4. You get monthly commission payouts (NET 30)

**Analytics Access**

Real-time dashboard showing:
- Clicks
- Signups
- Purchases
- Commission earned

**Support**

Any questions? Email me directly at [email] or text [phone].

Let's make this a huge win for both of us!

Best,
[Your Name]`
  }
};

/**
 * LinkedIn Outreach Templates
 */
const linkedInTemplates = {
  connectionRequest: {
    message: `Hi [Name], I noticed you work in partnerships at [Company]. I run a Japan trip planning platform and think there might be a mutually beneficial opportunity. Would love to connect!`
  },

  followUpMessage: {
    message: `Hi [Name],

Thanks for connecting! I wanted to reach out because I think [Company] and TripCompanion could create value together.

We help Japan travelers plan their trips (10,000+ users), and we're looking to partner with airlines/travel companies to add value to their customers.

Simple idea: You send our planning tool to your customers, they get 20% off, you earn commission on sales.

Zero cost, zero risk, just upside.

Worth a quick call to explore?

Best,
[Your Name]`
  }
};

/**
 * Partner Research Keywords (for LinkedIn/Web searches)
 */
const researchKeywords = {
  jal: [
    'Japan Airlines business development',
    'JAL partnerships manager',
    'JAL customer experience director',
    'Japan Airlines digital innovation'
  ],
  ana: [
    'All Nippon Airways partnerships',
    'ANA business development',
    'ANA customer experience',
    'All Nippon Airways innovation'
  ],
  zipair: [
    'Zipair partnerships',
    'Zipair marketing director',
    'Zipair business development'
  ],
  peach: [
    'Peach Aviation partnerships',
    'Peach Aviation marketing',
    'Peach Aviation business development'
  ],
  jrpass: [
    'JRPass.com founder',
    'JR Pass reseller contact',
    'Japan Rail Pass business development'
  ],
  klook: [
    'Klook partnerships Japan',
    'Klook business development',
    'Klook supplier partnerships'
  ]
};

module.exports = {
  emailTemplates,
  linkedInTemplates,
  researchKeywords
};
