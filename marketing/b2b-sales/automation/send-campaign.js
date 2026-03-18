#!/usr/bin/env node

/**
 * B2B Email Campaign Automation
 *
 * Sends personalized cold email campaigns to travel agencies
 * Supports batch sending, rate limiting, and tracking
 *
 * Usage:
 *   node send-campaign.js --batch 1 --email 1
 *   node send-campaign.js --test michael@tripcompanion.app
 *   node send-campaign.js --batch all --email 2 --delay 3
 *
 * Requirements:
 *   - Sendgrid API key in .env file
 *   - Agency database CSV
 *   - Email templates
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
require('dotenv').config();

// Configuration
const CONFIG = {
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || 'michael@tripcompanion.app',
  SENDGRID_FROM_NAME: 'Michael Guo - TripCompanion',
  CALENDLY_LINK: 'https://calendly.com/tripcompanion/demo',
  DEMO_BASE_URL: 'https://tripcompanion.app/demo',
  AGENCY_DATABASE: path.join(__dirname, '../agencies/agency-database.csv'),
  TRACKING_FILE: path.join(__dirname, '../tracking/outreach-tracker.csv'),
  EMAIL_TEMPLATES_DIR: path.join(__dirname, '../emails'),
  BATCH_SIZE: 50,
  RATE_LIMIT_DELAY: 100, // ms between emails
  DAY_DELAY: 3, // days between email sequences
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    batch: 1,
    emailNumber: 1,
    test: null,
    delay: CONFIG.DAY_DELAY,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--batch') options.batch = args[++i];
    if (args[i] === '--email') options.emailNumber = parseInt(args[++i]);
    if (args[i] === '--test') options.test = args[++i];
    if (args[i] === '--delay') options.delay = parseInt(args[++i]);
    if (args[i] === '--dry-run') options.dryRun = true;
  }

  return options;
}

// Load agency database
async function loadAgencies() {
  return new Promise((resolve, reject) => {
    const agencies = [];
    fs.createReadStream(CONFIG.AGENCY_DATABASE)
      .pipe(csv())
      .on('data', (row) => agencies.push(row))
      .on('end', () => resolve(agencies))
      .on('error', reject);
  });
}

// Load tracking data
async function loadTracking() {
  const trackingFile = CONFIG.TRACKING_FILE;
  if (!fs.existsSync(trackingFile)) {
    return {};
  }

  return new Promise((resolve, reject) => {
    const tracking = {};
    fs.createReadStream(trackingFile)
      .pipe(csv())
      .on('data', (row) => {
        tracking[row.contact_email] = row;
      })
      .on('end', () => resolve(tracking))
      .on('error', reject);
  });
}

// Update tracking data
async function updateTracking(email, updates) {
  const tracking = await loadTracking();
  const agencies = await loadAgencies();

  // Merge updates
  tracking[email] = {
    ...(tracking[email] || {}),
    ...updates,
  };

  // Write back to CSV
  const records = agencies.map(agency => ({
    company_name: agency.company_name,
    contact_email: agency.contact_email,
    decision_maker: agency.decision_maker,
    ...(tracking[agency.contact_email] || {}),
  }));

  const csvWriter = createObjectCsvWriter({
    path: CONFIG.TRACKING_FILE,
    header: [
      { id: 'company_name', title: 'company_name' },
      { id: 'contact_email', title: 'contact_email' },
      { id: 'decision_maker', title: 'decision_maker' },
      { id: 'email_1_sent', title: 'email_1_sent' },
      { id: 'email_1_opened', title: 'email_1_opened' },
      { id: 'email_1_clicked', title: 'email_1_clicked' },
      { id: 'email_2_sent', title: 'email_2_sent' },
      { id: 'email_2_opened', title: 'email_2_opened' },
      { id: 'email_2_clicked', title: 'email_2_clicked' },
      { id: 'email_3_sent', title: 'email_3_sent' },
      { id: 'email_3_opened', title: 'email_3_opened' },
      { id: 'email_3_clicked', title: 'email_3_clicked' },
      { id: 'replied', title: 'replied' },
      { id: 'demo_booked', title: 'demo_booked' },
      { id: 'demo_completed', title: 'demo_completed' },
      { id: 'status', title: 'status' },
      { id: 'next_action', title: 'next_action' },
      { id: 'next_action_date', title: 'next_action_date' },
      { id: 'notes', title: 'notes' },
    ],
  });

  await csvWriter.writeRecords(records);
}

// Personalize email template
function personalizeTemplate(template, agency) {
  const firstName = agency.decision_maker.split(' ')[0];
  const tierPrice = getTierPrice(agency.estimated_annual_trips);
  const tier = getTier(agency.estimated_annual_trips);

  const projectedAffiliateRevenue = Math.round((agency.estimated_annual_trips * 28) / 12);
  const projectedTimeS avings = Math.round((agency.estimated_annual_trips / 12) * 12);
  const projectedBookingIncrease = 40;

  return template
    .replace(/{{COMPANY_NAME}}/g, agency.company_name)
    .replace(/{{FIRST_NAME}}/g, firstName)
    .replace(/{{DECISION_MAKER}}/g, agency.decision_maker)
    .replace(/{{TIER_PRICE}}/g, tierPrice)
    .replace(/{{TIER}}/g, tier)
    .replace(/{{ANNUAL_TRIPS}}/g, agency.estimated_annual_trips)
    .replace(/{{PROJECTED_AFFILIATE_REVENUE}}/g, projectedAffiliateRevenue)
    .replace(/{{PROJECTED_TIME_SAVINGS}}/g, projectedTimeSavings)
    .replace(/{{PROJECTED_BOOKING_INCREASE}}/g, projectedBookingIncrease)
    .replace(/{{CALENDLY_LINK}}/g, CONFIG.CALENDLY_LINK)
    .replace(/{{DEMO_LINK}}/g, `${CONFIG.DEMO_BASE_URL}?agency=${encodeURIComponent(agency.company_name)}`);
}

// Get pricing tier based on annual trips
function getTier(annualTrips) {
  if (annualTrips >= 200) return 'Enterprise';
  if (annualTrips >= 100) return 'Premium';
  return 'Standard';
}

function getTierPrice(annualTrips) {
  if (annualTrips >= 200) return 2499;
  if (annualTrips >= 100) return 999;
  return 499;
}

// Load email template
function loadEmailTemplate(emailNumber, format = 'html') {
  const templateFiles = {
    1: `email-1-launch-in-24h.${format}`,
    2: `email-2-case-study.${format}`,
    3: `email-3-quick-question.${format}`,
  };

  const templatePath = path.join(CONFIG.EMAIL_TEMPLATES_DIR, templateFiles[emailNumber]);
  return fs.readFileSync(templatePath, 'utf-8');
}

// Get email subject
function getEmailSubject(emailNumber, companyName) {
  const subjects = {
    1: `How ${companyName} can launch a branded trip app in 24 hours`,
    2: `Case Study: How Sakura Journeys increased bookings 40% in 90 days`,
    3: `Quick question about your digital strategy`,
  };
  return subjects[emailNumber];
}

// Send email via SendGrid
async function sendEmail(to, subject, htmlContent, textContent) {
  // In production, use SendGrid API
  // For now, simulate sending
  console.log(`\n📧 Sending email:`);
  console.log(`   To: ${to}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Content length: ${htmlContent.length} chars`);

  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, messageId: `msg_${Date.now()}` });
    }, CONFIG.RATE_LIMIT_DELAY);
  });

  /* Production code with SendGrid:
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(CONFIG.SENDGRID_API_KEY);

  const msg = {
    to,
    from: {
      email: CONFIG.SENDGRID_FROM_EMAIL,
      name: CONFIG.SENDGRID_FROM_NAME,
    },
    subject,
    text: textContent,
    html: htmlContent,
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
  };

  return sgMail.send(msg);
  */
}

// Calculate next action date
function calculateNextActionDate(emailNumber, delay) {
  const date = new Date();
  date.setDate(date.getDate() + delay);
  return date.toISOString().split('T')[0];
}

// Send campaign
async function sendCampaign(options) {
  console.log('🚀 B2B Email Campaign Automation\n');
  console.log(`Configuration:`);
  console.log(`  Batch: ${options.batch}`);
  console.log(`  Email: #${options.emailNumber}`);
  console.log(`  Delay: ${options.delay} days`);
  console.log(`  Dry Run: ${options.dryRun ? 'YES' : 'NO'}\n`);

  // Load data
  const agencies = await loadAgencies();
  const tracking = await loadTracking();

  // Filter agencies for this batch
  let targetAgencies = [];
  if (options.test) {
    // Test mode: send to specified email
    targetAgencies = [{
      company_name: 'Test Company',
      contact_email: options.test,
      decision_maker: 'Test User',
      estimated_annual_trips: 100,
      tier: 'Premium',
    }];
  } else if (options.batch === 'all') {
    targetAgencies = agencies;
  } else {
    const batchNum = parseInt(options.batch);
    const startIdx = (batchNum - 1) * CONFIG.BATCH_SIZE;
    const endIdx = startIdx + CONFIG.BATCH_SIZE;
    targetAgencies = agencies.slice(startIdx, endIdx);
  }

  console.log(`📊 Target: ${targetAgencies.length} agencies\n`);

  // Load templates
  const htmlTemplate = loadEmailTemplate(options.emailNumber, 'html');
  const textTemplate = loadEmailTemplate(options.emailNumber, 'txt');

  // Extract subject from text template (first line)
  const subjectMatch = textTemplate.match(/^Subject: (.+)$/m);
  const subjectTemplate = subjectMatch ? subjectMatch[1] : '';

  // Send emails
  let sent = 0;
  let skipped = 0;

  for (const agency of targetAgencies) {
    // Check if already sent
    const agencyTracking = tracking[agency.contact_email] || {};
    const emailField = `email_${options.emailNumber}_sent`;

    if (agencyTracking[emailField] && !options.test) {
      console.log(`⏭️  Skipping ${agency.company_name} (already sent)`);
      skipped++;
      continue;
    }

    // Personalize content
    const htmlContent = personalizeTemplate(htmlTemplate, agency);
    const textContent = personalizeTemplate(textTemplate, agency);
    const subject = personalizeTemplate(subjectTemplate, agency);

    if (options.dryRun) {
      console.log(`\n🔍 DRY RUN - Would send to ${agency.company_name}:`);
      console.log(`   Email: ${agency.contact_email}`);
      console.log(`   Subject: ${subject}`);
    } else {
      // Send email
      try {
        const result = await sendEmail(
          agency.contact_email,
          subject,
          htmlContent,
          textContent
        );

        // Update tracking
        const updates = {
          [emailField]: new Date().toISOString().split('T')[0],
          status: 'contacted',
          next_action: `Send Email ${options.emailNumber + 1}`,
          next_action_date: calculateNextActionDate(options.emailNumber, options.delay),
        };

        if (!options.test) {
          await updateTracking(agency.contact_email, updates);
        }

        console.log(`✅ Sent to ${agency.company_name}`);
        sent++;
      } catch (error) {
        console.error(`❌ Failed to send to ${agency.company_name}:`, error.message);
      }
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_DELAY));
  }

  console.log(`\n📈 Campaign Summary:`);
  console.log(`   Sent: ${sent}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${targetAgencies.length}`);
  console.log(`\n✅ Campaign completed!\n`);
}

// Main execution
async function main() {
  try {
    const options = parseArgs();
    await sendCampaign(options);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { sendCampaign, loadAgencies, personalizeTemplate };