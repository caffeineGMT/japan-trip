/**
 * Affiliate Partner Outreach Email Script
 *
 * Sends personalized emails to potential affiliate partners (travel bloggers, influencers)
 * using Mailgun API with open/click tracking
 *
 * Usage:
 *   node scripts/outreach-email.js
 *
 * Data source: /data/bloggers.csv
 * Format: name,email,niche,monthly_traffic,website
 */

const fs = require('fs');
const path = require('path');
const mailgun = require('mailgun.js');
const formData = require('form-data');

// Initialize Mailgun
const mg = mailgun.default.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || 'your-mailgun-api-key'
});

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'mg.tripcompanion.app';
const FROM_EMAIL = 'partnerships@tripcompanion.app';
const FROM_NAME = 'Sarah Chen - TripCompanion Partnerships';

// Email template
function generateEmailTemplate(blogger) {
  const { name, niche, monthly_traffic, website } = blogger;

  const subject = `Partnership opportunity for ${name}`;

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
        .header {
          background: linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          background: #ffffff;
          padding: 30px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }
        .highlight {
          background: #fff3f8;
          border-left: 4px solid #FF6B9D;
          padding: 15px;
          margin: 20px 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%);
          color: white;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .benefits {
          list-style: none;
          padding: 0;
        }
        .benefits li {
          padding: 8px 0;
          padding-left: 28px;
          position: relative;
        }
        .benefits li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #22c55e;
          font-weight: bold;
          font-size: 18px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #999;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🌸 TripCompanion</div>
        <p style="margin: 10px 0 0 0;">Premium Japan Travel Guides</p>
      </div>

      <div class="content">
        <p>Hi ${name},</p>

        <p>I've been following your ${niche} content and I'm really impressed with the value you provide to your ${monthly_traffic ? `${monthly_traffic.toLocaleString()}+ monthly` : ''} readers.</p>

        <p>I'm reaching out because we've just launched <strong>TripCompanion</strong> — an interactive Japan travel planning platform that I think would be a perfect fit for your audience.</p>

        <div class="highlight">
          <p style="margin: 0;"><strong>Why partner with us?</strong></p>
        </div>

        <ul class="benefits">
          <li><strong>25% commission</strong> on all sales (industry-leading)</li>
          <li><strong>Easy integration</strong> — just add one line of code to your blog</li>
          <li><strong>Interactive widgets</strong> that boost engagement</li>
          <li><strong>Real-time dashboard</strong> to track your earnings</li>
          <li><strong>Monthly payouts</strong> via PayPal (minimum $100)</li>
          <li><strong>Marketing support</strong> — banners, copy, and promotional materials</li>
        </ul>

        <p>Our Japan cherry blossom itinerary template ($29) converts at 8-12% for partners in the travel niche. With your traffic, that could mean <strong>$${calculateProjectedEarnings(monthly_traffic)}/month in passive income</strong>.</p>

        <div class="highlight">
          <p style="margin: 0;"><strong>Here's what it looks like in action:</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 14px;">
            Check out our demo widget: <a href="https://tripcompanion.app/partners/demo">tripcompanion.app/partners/demo</a>
          </p>
        </div>

        <p>I'd love to set you up with early access to our partner program. No obligations — just see if it's a good fit.</p>

        <p style="text-align: center;">
          <a href="https://tripcompanion.app/partners/signup?ref=outreach&source=${encodeURIComponent(name)}" class="cta-button">
            Join the Partner Program →
          </a>
        </p>

        <p>Have questions? Just hit reply — I personally read every email.</p>

        <p>Best regards,<br>
        <strong>Sarah Chen</strong><br>
        Partnership Manager<br>
        TripCompanion</p>

        <p style="font-size: 13px; color: #666; margin-top: 20px;">
          P.S. We're accepting a limited number of partners for our initial launch. If you're interested, I'd recommend signing up soon to lock in the 25% commission rate (we may adjust this as the program scales).
        </p>
      </div>

      <div class="footer">
        <p>TripCompanion | Premium Japan Travel Guides</p>
        <p><a href="https://tripcompanion.app/partners/unsubscribe">Unsubscribe</a></p>
      </div>
    </body>
    </html>
  `;

  const textBody = `
Hi ${name},

I've been following your ${niche} content and I'm really impressed with the value you provide to your readers.

I'm reaching out because we've just launched TripCompanion — an interactive Japan travel planning platform that I think would be a perfect fit for your audience.

WHY PARTNER WITH US?

✓ 25% commission on all sales (industry-leading)
✓ Easy integration — just add one line of code to your blog
✓ Interactive widgets that boost engagement
✓ Real-time dashboard to track your earnings
✓ Monthly payouts via PayPal (minimum $100)
✓ Marketing support — banners, copy, and promotional materials

Our Japan cherry blossom itinerary template ($29) converts at 8-12% for partners in the travel niche. With your traffic, that could mean $${calculateProjectedEarnings(monthly_traffic)}/month in passive income.

I'd love to set you up with early access to our partner program. No obligations — just see if it's a good fit.

Join here: https://tripcompanion.app/partners/signup?ref=outreach&source=${encodeURIComponent(name)}

Have questions? Just hit reply — I personally read every email.

Best regards,
Sarah Chen
Partnership Manager
TripCompanion

P.S. We're accepting a limited number of partners for our initial launch. If you're interested, I'd recommend signing up soon to lock in the 25% commission rate.
  `.trim();

  return { subject, htmlBody, textBody };
}

// Calculate projected earnings based on traffic
function calculateProjectedEarnings(monthlyTraffic) {
  if (!monthlyTraffic) return '200-500';

  // Assumptions:
  // - 2% of visitors see the widget
  // - 10% CTR on widget
  // - 8% conversion rate
  // - $29 average order value
  // - 25% commission

  const widgetViews = monthlyTraffic * 0.02;
  const clicks = widgetViews * 0.10;
  const conversions = clicks * 0.08;
  const revenue = conversions * 29;
  const commission = revenue * 0.25;

  return Math.round(commission);
}

// Parse CSV file
function parseCSV(filePath) {
  try {
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const bloggers = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const blogger = {};

      headers.forEach((header, index) => {
        blogger[header] = values[index];
      });

      // Parse monthly_traffic as number
      if (blogger.monthly_traffic) {
        blogger.monthly_traffic = parseInt(blogger.monthly_traffic.replace(/,/g, ''));
      }

      bloggers.push(blogger);
    }

    return bloggers;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
}

// Send email via Mailgun
async function sendEmail(blogger) {
  const { subject, htmlBody, textBody } = generateEmailTemplate(blogger);

  try {
    const messageData = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: blogger.email,
      subject: subject,
      html: htmlBody,
      text: textBody,
      'o:tracking': 'yes',
      'o:tracking-clicks': 'yes',
      'o:tracking-opens': 'yes',
      'o:tag': ['affiliate-outreach', 'initial-contact'],
      'v:blogger_name': blogger.name,
      'v:blogger_website': blogger.website || '',
      'v:niche': blogger.niche || ''
    };

    const response = await mg.messages.create(MAILGUN_DOMAIN, messageData);

    console.log(`✓ Sent to ${blogger.name} (${blogger.email})`);
    console.log(`  Message ID: ${response.id}`);

    return {
      success: true,
      messageId: response.id,
      email: blogger.email
    };

  } catch (error) {
    console.error(`✗ Failed to send to ${blogger.name} (${blogger.email}):`, error.message);

    return {
      success: false,
      email: blogger.email,
      error: error.message
    };
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting affiliate partner outreach...\n');

  // Check if CSV file exists, if not create sample
  const csvPath = path.join(__dirname, '../data/bloggers.csv');

  if (!fs.existsSync(csvPath)) {
    console.log('Creating sample bloggers.csv file...');

    const sampleCSV = `name,email,niche,monthly_traffic,website
Jane Smith,jane@travelblog.com,Japan Travel,50000,https://japantravelblog.com
John Doe,john@wanderlust.com,Budget Travel,35000,https://wanderlustbudget.com
Sarah Lee,sarah@foodietravels.com,Food & Travel,80000,https://foodietravels.com
Mike Chen,mike@digitalnomad.com,Digital Nomad,25000,https://digitalnomadlife.com
Emma Watson,emma@familytravel.com,Family Travel,45000,https://familytravelguide.com`;

    fs.writeFileSync(csvPath, sampleCSV);
    console.log(`✓ Created sample CSV at ${csvPath}\n`);
  }

  // Parse CSV
  const bloggers = parseCSV(csvPath);

  if (bloggers.length === 0) {
    console.error('No bloggers found in CSV file');
    process.exit(1);
  }

  console.log(`Found ${bloggers.length} potential partners\n`);

  // Send emails with rate limiting (avoid spam filters)
  const results = [];
  for (let i = 0; i < bloggers.length; i++) {
    const blogger = bloggers[i];

    console.log(`[${i + 1}/${bloggers.length}] Sending to ${blogger.name}...`);

    const result = await sendEmail(blogger);
    results.push(result);

    // Wait 2 seconds between emails to avoid rate limiting
    if (i < bloggers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log('\n📊 Campaign Summary:');
  console.log(`   Total sent: ${results.filter(r => r.success).length}`);
  console.log(`   Failed: ${results.filter(r => !r.success).length}`);

  if (results.filter(r => !r.success).length > 0) {
    console.log('\n❌ Failed emails:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.email}: ${r.error}`);
    });
  }

  console.log('\n✅ Outreach campaign completed!');
  console.log('Track opens and clicks in your Mailgun dashboard.\n');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { generateEmailTemplate, sendEmail, parseCSV };
