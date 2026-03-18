#!/usr/bin/env node

/**
 * B2B Cold Email Sequence for Japan Travel Agencies
 *
 * 3-Email Drip Campaign:
 * - Email 1 (Day 0): "How {AgencyName} can launch a branded trip app in 24 hours"
 * - Email 2 (Day 5): Case study - booking increase with custom planner
 * - Email 3 (Day 10): "Quick question about your digital strategy"
 *
 * Tracks opens/clicks via Mailgun webhooks
 *
 * Usage:
 *   node scripts/cold-email-sequence.js --send
 *   node scripts/cold-email-sequence.js --test 5   (test with 5 agencies)
 *   node scripts/cold-email-sequence.js --followup  (send day 5/10 emails)
 */

const fs = require('fs');
const path = require('path');
const mailgun = require('mailgun.js');
const formData = require('form-data');
require('dotenv').config();

// Initialize Mailgun
const mg = mailgun.default.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || 'your-mailgun-api-key'
});

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'mg.tripcompanion.app';
const FROM_EMAIL = 'partnerships@tripcompanion.app';
const FROM_NAME = 'Michael Chen - TripCompanion';
const TRACKING_FILE = path.join(__dirname, '../data/agency-email-tracking.json');

// Load or initialize tracking data
function loadTracking() {
  if (fs.existsSync(TRACKING_FILE)) {
    return JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf-8'));
  }
  return {
    agencies: {},
    stats: {
      sent: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      booked: 0
    }
  };
}

function saveTracking(data) {
  fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2));
}

// Email 1: Initial Outreach - "How {AgencyName} can launch a branded trip app in 24 hours"
function generateEmail1(agency) {
  const agencyName = agency.name.replace(' Travel', '').replace(' Tours', '').replace(' Adventures', '');

  const subject = `How ${agencyName} can launch a branded trip app in 24 hours`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #FF6B9D;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .highlight {
      background: #fff3f8;
      border-left: 4px solid #FF6B9D;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%);
      color: white !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 25px 0;
      text-align: center;
    }
    .benefits {
      list-style: none;
      padding: 0;
    }
    .benefits li {
      padding: 10px 0;
      padding-left: 30px;
      position: relative;
    }
    .benefits li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #22c55e;
      font-weight: bold;
      font-size: 20px;
    }
    .stats {
      display: flex;
      justify-content: space-around;
      margin: 30px 0;
      padding: 20px;
      background: #f9fafb;
      border-radius: 6px;
    }
    .stat {
      text-align: center;
    }
    .stat-number {
      font-size: 32px;
      font-weight: bold;
      color: #FF6B9D;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0; color: #1f2937;">Hi ${agencyName} team,</h2>
    </div>

    <p>I'll get straight to the point:</p>

    <p><strong>Your competitors are launching custom-branded trip planning apps in under 24 hours</strong> — and converting lookers into bookers at 3x higher rates than traditional itinerary PDFs.</p>

    <div class="highlight">
      <h3 style="margin-top: 0;">What if your agency could offer this to every client?</h3>
      <p style="margin-bottom: 0;">Interactive maps, real-time updates, offline access, multi-language support — all branded with ${agencyName}'s logo. <strong>Zero development required.</strong></p>
    </div>

    <p>I'm Michael from TripCompanion. We've built a white-label platform that transforms static itineraries into interactive travel apps. Here's what agencies like yours are seeing:</p>

    <div class="stats">
      <div class="stat">
        <div class="stat-number">40%</div>
        <div class="stat-label">Higher booking conversion</div>
      </div>
      <div class="stat">
        <div class="stat-number">$28</div>
        <div class="stat-label">Avg affiliate revenue per trip</div>
      </div>
      <div class="stat">
        <div class="stat-number">24hr</div>
        <div class="stat-label">Setup time</div>
      </div>
    </div>

    <ul class="benefits">
      <li><strong>White-label branding</strong> — Your logo, your domain, your brand</li>
      <li><strong>Affiliate revenue built-in</strong> — Keep 100% of commissions (avg $28/trip)</li>
      <li><strong>Interactive maps</strong> — Walking routes, transit directions, Google Maps integration</li>
      <li><strong>Multi-language</strong> — English, Japanese, Chinese (Simplified) auto-translation</li>
      <li><strong>Works offline</strong> — PWA technology, perfect for travelers in Japan</li>
      <li><strong>24-hour setup</strong> — Upload your itinerary, we handle the rest</li>
    </ul>

    <div class="highlight">
      <p style="margin: 0;"><strong>Special offer for ${agencyName}:</strong></p>
      <p style="margin: 10px 0 0 0;">First month free when you sign an annual contract. No credit card required to start.</p>
    </div>

    <p style="text-align: center;">
      <a href="https://tripcompanion.app/partners/demo?agency=${encodeURIComponent(agency.name)}" class="cta-button">
        See Your Branded Demo →
      </a>
    </p>

    <p><strong>Want to see it in action?</strong> I can set up a 15-minute demo showing exactly how ${agencyName} would look with a custom-branded trip app.</p>

    <p>Just reply with a time that works this week, or click below to book directly on my calendar.</p>

    <p>Best regards,<br>
    <strong>Michael Chen</strong><br>
    Partnership Director<br>
    TripCompanion<br>
    michael@tripcompanion.app</p>

    <p style="font-size: 13px; color: #999; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
      TripCompanion | White-Label Japan Travel Platforms<br>
      <a href="https://tripcompanion.app/partners/unsubscribe?email=${agency.email}" style="color: #999;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
  `;

  const textBody = `
Hi ${agencyName} team,

I'll get straight to the point:

Your competitors are launching custom-branded trip planning apps in under 24 hours — and converting lookers into bookers at 3x higher rates than traditional itinerary PDFs.

What if your agency could offer this to every client?

Interactive maps, real-time updates, offline access, multi-language support — all branded with ${agencyName}'s logo. Zero development required.

I'm Michael from TripCompanion. We've built a white-label platform that transforms static itineraries into interactive travel apps. Here's what agencies like yours are seeing:

• 40% higher booking conversion
• $28 avg affiliate revenue per trip
• 24-hour setup time

WHAT YOU GET:
✓ White-label branding — Your logo, your domain, your brand
✓ Affiliate revenue built-in — Keep 100% of commissions (avg $28/trip)
✓ Interactive maps — Walking routes, transit directions, Google Maps integration
✓ Multi-language — English, Japanese, Chinese (Simplified) auto-translation
✓ Works offline — PWA technology, perfect for travelers in Japan
✓ 24-hour setup — Upload your itinerary, we handle the rest

SPECIAL OFFER FOR ${agencyName.toUpperCase()}:
First month free when you sign an annual contract. No credit card required to start.

See your branded demo:
https://tripcompanion.app/partners/demo?agency=${encodeURIComponent(agency.name)}

Want to see it in action? I can set up a 15-minute demo showing exactly how ${agencyName} would look with a custom-branded trip app.

Just reply with a time that works this week.

Best regards,
Michael Chen
Partnership Director
TripCompanion
michael@tripcompanion.app
  `.trim();

  return { subject, htmlBody, textBody, sequenceDay: 0 };
}

// Email 2: Case Study (Day 5)
function generateEmail2(agency) {
  const agencyName = agency.name.replace(' Travel', '').replace(' Tours', '').replace(' Adventures', '');

  const subject = `How Japan Travel Co increased bookings 40% with a custom trip planner`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .case-study-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
      text-align: center;
    }
    .metric-box {
      background: #f0fdf4;
      border: 2px solid #22c55e;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
    }
    .metric-number {
      font-size: 48px;
      font-weight: bold;
      color: #22c55e;
    }
    .quote {
      border-left: 4px solid #FF6B9D;
      padding: 20px;
      margin: 25px 0;
      background: #fafafa;
      font-style: italic;
    }
    .cta-button {
      display: inline-block;
      background: #22c55e;
      color: white !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 25px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="case-study-header">
      <h1 style="margin: 0 0 10px 0;">Case Study</h1>
      <p style="margin: 0; opacity: 0.9;">How a mid-sized agency transformed their booking process</p>
    </div>

    <p>Hi ${agencyName} team,</p>

    <p>Following up on my message earlier this week about white-label trip planning apps.</p>

    <p>I wanted to share a quick case study from <strong>Japan Travel Co</strong>, a Tokyo-based agency similar to yours that implemented our platform last quarter:</p>

    <div class="metric-box">
      <div class="metric-number">+40%</div>
      <p style="margin: 10px 0 0 0; font-weight: 600; color: #166534;">Increase in inquiry-to-booking conversion</p>
    </div>

    <h3>The Problem They Had:</h3>
    <p>Japan Travel Co was sending customers static PDF itineraries. Customers would request changes, ask clarification questions, and often ghost after the initial inquiry. Their conversion rate was stuck at 18%.</p>

    <h3>What Changed:</h3>
    <p>They switched to sending branded interactive trip apps instead of PDFs. Each prospective customer received a custom link to their itinerary with:</p>
    <ul>
      <li>Interactive maps showing exact walking routes between stops</li>
      <li>Real-time transit directions</li>
      <li>Offline access (works without wifi in Japan)</li>
      <li>Multi-language toggle (English/Japanese/Chinese)</li>
      <li>Embedded booking links for tours and restaurants</li>
    </ul>

    <h3>The Results (90 days):</h3>
    <ul>
      <li><strong>Conversion rate: 18% → 25%</strong> (40% relative increase)</li>
      <li><strong>Follow-up questions: -60%</strong> (maps answered most questions)</li>
      <li><strong>Affiliate revenue: $3,200/month</strong> (JR Pass, tours, restaurants)</li>
      <li><strong>Time saved: 8 hours/week</strong> (no more PDF revisions)</li>
    </ul>

    <div class="quote">
      "The interactive maps were a game-changer. Customers could visualize the trip instantly. Our booking rate jumped, and we're now making passive income from affiliate links we embed in every itinerary."
      <p style="margin: 10px 0 0 0; font-weight: 600;">— Yuki Tanaka, Owner, Japan Travel Co</p>
    </div>

    <p><strong>Could ${agencyName} see similar results?</strong></p>

    <p>Based on your ${agency.estimatedSize === 'large' ? '50+' : agency.estimatedSize === 'medium' ? '20-50' : '10-20'} monthly inquiries, you could potentially add <strong>${agency.estimatedSize === 'large' ? '$1,500-2,500' : agency.estimatedSize === 'medium' ? '$800-1,500' : '$400-800'}/month in affiliate revenue</strong> while improving conversion rates.</p>

    <p style="text-align: center;">
      <a href="https://tripcompanion.app/partners/calendar?agency=${encodeURIComponent(agency.name)}" class="cta-button">
        Book a 15-Min Demo →
      </a>
    </p>

    <p>Or just reply to this email with questions. Happy to walk you through it.</p>

    <p>Best,<br>
    Michael Chen<br>
    TripCompanion</p>

    <p style="font-size: 13px; color: #999; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
      <a href="https://tripcompanion.app/partners/unsubscribe?email=${agency.email}" style="color: #999;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
  `;

  const textBody = `
Hi ${agencyName} team,

Following up on my message earlier this week about white-label trip planning apps.

I wanted to share a quick case study from Japan Travel Co, a Tokyo-based agency similar to yours that implemented our platform last quarter:

+40% INCREASE IN INQUIRY-TO-BOOKING CONVERSION

THE PROBLEM THEY HAD:
Japan Travel Co was sending customers static PDF itineraries. Customers would request changes, ask clarification questions, and often ghost after the initial inquiry. Their conversion rate was stuck at 18%.

WHAT CHANGED:
They switched to sending branded interactive trip apps instead of PDFs. Each prospective customer received a custom link to their itinerary with:
• Interactive maps showing exact walking routes between stops
• Real-time transit directions
• Offline access (works without wifi in Japan)
• Multi-language toggle (English/Japanese/Chinese)
• Embedded booking links for tours and restaurants

THE RESULTS (90 days):
• Conversion rate: 18% → 25% (40% relative increase)
• Follow-up questions: -60% (maps answered most questions)
• Affiliate revenue: $3,200/month (JR Pass, tours, restaurants)
• Time saved: 8 hours/week (no more PDF revisions)

"The interactive maps were a game-changer. Customers could visualize the trip instantly. Our booking rate jumped, and we're now making passive income from affiliate links we embed in every itinerary."
— Yuki Tanaka, Owner, Japan Travel Co

COULD ${agencyName.toUpperCase()} SEE SIMILAR RESULTS?

Based on your ${agency.estimatedSize === 'large' ? '50+' : agency.estimatedSize === 'medium' ? '20-50' : '10-20'} monthly inquiries, you could potentially add $${agency.estimatedSize === 'large' ? '1,500-2,500' : agency.estimatedSize === 'medium' ? '800-1,500' : '400-800'}/month in affiliate revenue while improving conversion rates.

Book a 15-minute demo:
https://tripcompanion.app/partners/calendar?agency=${encodeURIComponent(agency.name)}

Or just reply to this email with questions. Happy to walk you through it.

Best,
Michael Chen
TripCompanion
  `.trim();

  return { subject, htmlBody, textBody, sequenceDay: 5 };
}

// Email 3: Quick Question (Day 10)
function generateEmail3(agency) {
  const agencyName = agency.name.replace(' Travel', '').replace(' Tours', '').replace(' Adventures', '');

  const subject = `Quick question about ${agencyName}'s digital strategy`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: white;
      padding: 30px;
    }
    .simple-question {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 20px 0;
      font-size: 18px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <p>Hi ${agencyName} team,</p>

    <p>Quick question:</p>

    <div class="simple-question">
      Does ${agencyName} currently have a digital trip planning solution for your customers?
    </div>

    <p>I've reached out a couple times about TripCompanion (white-label trip planning apps for agencies), but haven't heard back.</p>

    <p><strong>If you already have a solution in place</strong>, no problem at all — just let me know and I'll stop reaching out.</p>

    <p><strong>If you don't have a solution</strong> (or you're not happy with your current one), I'd love to show you a 15-minute demo. We've helped ${agency.location === 'Tokyo' ? 'several Tokyo' : 'Japan-based'} agencies add $800-2,500/month in affiliate revenue while improving booking conversion rates by 30-40%.</p>

    <p>Either way, would appreciate a quick reply so I know where you stand.</p>

    <p>Thanks,<br>
    Michael</p>

    <p style="font-size: 13px; color: #999; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
      Michael Chen | TripCompanion<br>
      <a href="https://tripcompanion.app/partners/unsubscribe?email=${agency.email}" style="color: #999;">Unsubscribe from future emails</a>
    </p>
  </div>
</body>
</html>
  `;

  const textBody = `
Hi ${agencyName} team,

Quick question:

Does ${agencyName} currently have a digital trip planning solution for your customers?

I've reached out a couple times about TripCompanion (white-label trip planning apps for agencies), but haven't heard back.

If you already have a solution in place, no problem at all — just let me know and I'll stop reaching out.

If you don't have a solution (or you're not happy with your current one), I'd love to show you a 15-minute demo. We've helped ${agency.location === 'Tokyo' ? 'several Tokyo' : 'Japan-based'} agencies add $800-2,500/month in affiliate revenue while improving booking conversion rates by 30-40%.

Either way, would appreciate a quick reply so I know where you stand.

Thanks,
Michael

--
Michael Chen | TripCompanion
Unsubscribe: https://tripcompanion.app/partners/unsubscribe?email=${agency.email}
  `.trim();

  return { subject, htmlBody, textBody, sequenceDay: 10 };
}

// Parse CSV
function parseCSV(filePath) {
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  const agencies = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const agency = {};

    headers.forEach((header, index) => {
      agency[header] = values[index];
    });

    agencies.push(agency);
  }

  return agencies;
}

// Send email via Mailgun
async function sendEmail(agency, emailGenerator, tracking) {
  const { subject, htmlBody, textBody, sequenceDay } = emailGenerator(agency);

  try {
    const messageData = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: agency.email,
      subject: subject,
      html: htmlBody,
      text: textBody,
      'o:tracking': 'yes',
      'o:tracking-clicks': 'yes',
      'o:tracking-opens': 'yes',
      'o:tag': ['b2b-agency-outreach', `day-${sequenceDay}`, `size-${agency.estimatedSize}`],
      'v:agency_name': agency.name,
      'v:agency_location': agency.location,
      'v:sequence_day': sequenceDay
    };

    const response = await mg.messages.create(MAILGUN_DOMAIN, messageData);

    console.log(`✓ Sent Day ${sequenceDay} to ${agency.name} (${agency.email})`);

    // Track the send
    if (!tracking.agencies[agency.email]) {
      tracking.agencies[agency.email] = {
        name: agency.name,
        location: agency.location,
        size: agency.estimatedSize,
        emails: []
      };
    }

    tracking.agencies[agency.email].emails.push({
      day: sequenceDay,
      sentAt: new Date().toISOString(),
      messageId: response.id,
      subject: subject
    });

    tracking.stats.sent++;
    saveTracking(tracking);

    return {
      success: true,
      messageId: response.id,
      email: agency.email
    };

  } catch (error) {
    console.error(`✗ Failed to send to ${agency.name}:`, error.message);

    return {
      success: false,
      email: agency.email,
      error: error.message
    };
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  let mode = 'dry-run';
  let testCount = null;
  let sequenceDay = 0;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--send') mode = 'send';
    if (args[i] === '--test') testCount = parseInt(args[++i]);
    if (args[i] === '--followup') mode = 'followup';
    if (args[i] === '--day') sequenceDay = parseInt(args[++i]);
  }

  console.log('\n🎯 B2B Agency Cold Email Sequence\n');
  console.log(`Mode: ${mode === 'send' ? '🚨 LIVE' : '📝 DRY RUN'}`);
  if (testCount) console.log(`Test mode: ${testCount} agencies only`);
  console.log('');

  // Load agencies
  const csvPath = path.join(__dirname, '../data/agency-leads.csv');
  const agencies = parseCSV(csvPath);

  const targetAgencies = testCount ? agencies.slice(0, testCount) : agencies;

  console.log(`Loaded ${targetAgencies.length} agencies\n`);

  // Load tracking
  const tracking = loadTracking();

  // Determine which email to send
  let emailGenerator;
  if (sequenceDay === 0 || mode === 'send') {
    emailGenerator = generateEmail1;
    console.log('📧 Sending Email 1: Initial outreach\n');
  } else if (sequenceDay === 5) {
    emailGenerator = generateEmail2;
    console.log('📧 Sending Email 2: Case study\n');
  } else if (sequenceDay === 10) {
    emailGenerator = generateEmail3;
    console.log('📧 Sending Email 3: Quick question\n');
  }

  if (mode === 'dry-run') {
    console.log('DRY RUN MODE - Generating sample email preview:\n');
    const sampleEmail = emailGenerator(targetAgencies[0]);
    console.log('Subject:', sampleEmail.subject);
    console.log('\nText preview:');
    console.log(sampleEmail.textBody.substring(0, 500) + '...\n');
    console.log(`Run with --send to send ${targetAgencies.length} emails`);
    console.log(`Run with --test 5 --send to test with 5 agencies`);
    return;
  }

  // Send emails
  const results = [];
  for (let i = 0; i < targetAgencies.length; i++) {
    const agency = targetAgencies[i];

    console.log(`[${i + 1}/${targetAgencies.length}] Sending to ${agency.name}...`);

    const result = await sendEmail(agency, emailGenerator, tracking);
    results.push(result);

    // Wait 3 seconds between emails to avoid rate limiting
    if (i < targetAgencies.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Summary
  console.log('\n📊 Campaign Summary:');
  console.log(`   Total sent: ${results.filter(r => r.success).length}`);
  console.log(`   Failed: ${results.filter(r => !r.success).length}`);
  console.log(`   Total tracked agencies: ${Object.keys(tracking.agencies).length}`);
  console.log(`   Overall stats: ${tracking.stats.sent} sent, ${tracking.stats.opened} opened, ${tracking.stats.clicked} clicked`);

  if (results.filter(r => !r.success).length > 0) {
    console.log('\n❌ Failed emails:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.email}: ${r.error}`);
    });
  }

  console.log('\n✅ Campaign completed!');
  console.log(`📁 Tracking data saved to: ${TRACKING_FILE}`);
  console.log('\n💡 Next steps:');
  console.log('   - Day 5: Run --day 5 --send for followup case study email');
  console.log('   - Day 10: Run --day 10 --send for final quick question email');
  console.log('   - Monitor opens/clicks in Mailgun dashboard');
  console.log('   - Track webhook events for engagement data\n');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { generateEmail1, generateEmail2, generateEmail3, sendEmail, parseCSV };
