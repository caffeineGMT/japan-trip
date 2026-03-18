#!/usr/bin/env node

/**
 * CLI Tool for Running Affiliate Outreach Campaigns
 * Usage: node scripts/run-outreach-campaign.js [options]
 */

const BloggerOutreach = require('../lib/blogger-outreach');
require('dotenv').config();

const args = process.argv.slice(2);

// Parse command line arguments
const options = {
  targetCount: 50,
  findEmails: true,
  sendEmails: false, // Default to dry-run for safety
  emailDelay: 60
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--target':
    case '-t':
      options.targetCount = parseInt(args[++i]);
      break;
    case '--no-find':
      options.findEmails = false;
      break;
    case '--send':
    case '-s':
      options.sendEmails = true;
      break;
    case '--delay':
    case '-d':
      options.emailDelay = parseInt(args[++i]);
      break;
    case '--help':
    case '-h':
      printHelp();
      process.exit(0);
  }
}

function printHelp() {
  console.log(`
🎯 Affiliate Outreach Campaign CLI

Usage: node scripts/run-outreach-campaign.js [options]

Options:
  -t, --target <count>    Number of bloggers to target (default: 50)
  --no-find               Skip email finding, use existing data
  -s, --send              Actually send emails (default: dry-run)
  -d, --delay <seconds>   Delay between emails in seconds (default: 60)
  -h, --help              Show this help message

Environment Variables Required:
  HUNTER_API_KEY          Hunter.io API key for email finding
  MAILGUN_API_KEY         Mailgun API key for sending emails
  MAILGUN_DOMAIN          Your Mailgun domain

Examples:
  # Dry run - find emails but don't send
  node scripts/run-outreach-campaign.js --target 20

  # Find and send emails to 50 bloggers
  node scripts/run-outreach-campaign.js --target 50 --send

  # Send using existing blogger list
  node scripts/run-outreach-campaign.js --no-find --send

Safety Features:
  - Dry-run by default (use --send to actually send emails)
  - Rate limiting between emails to avoid spam filters
  - Mock mode if API keys not configured
  - Detailed logging of all actions

Target Metrics:
  - Response Rate: 15%
  - Activated Partners: 5
  - Monthly Revenue per Partner: $363
  - Total MRR Goal: $1,813
  `);
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 Affiliate Outreach Campaign');
  console.log('='.repeat(60) + '\n');

  console.log('Configuration:');
  console.log(`  Target Count: ${options.targetCount}`);
  console.log(`  Find Emails: ${options.findEmails ? 'Yes' : 'No'}`);
  console.log(`  Send Emails: ${options.sendEmails ? 'YES (LIVE)' : 'No (DRY RUN)'}`);
  console.log(`  Email Delay: ${options.emailDelay}s`);
  console.log('');

  // Check API keys
  const hunterConfigured = process.env.HUNTER_API_KEY &&
    process.env.HUNTER_API_KEY !== 'your_hunter_api_key_here';
  const mailgunConfigured = process.env.MAILGUN_API_KEY &&
    process.env.MAILGUN_API_KEY !== 'your_mailgun_api_key_here';

  console.log('API Configuration:');
  console.log(`  Hunter.io: ${hunterConfigured ? '✅ Configured' : '⚠️  Mock Mode'}`);
  console.log(`  Mailgun: ${mailgunConfigured ? '✅ Configured' : '⚠️  Mock Mode'}`);
  console.log('');

  if (!options.sendEmails) {
    console.log('⚠️  DRY RUN MODE - No emails will be sent');
    console.log('   Use --send flag to actually send emails\n');
  } else if (!mailgunConfigured) {
    console.log('⚠️  Mailgun not configured - Running in mock mode');
    console.log('   Set MAILGUN_API_KEY in .env to send real emails\n');
  } else {
    console.log('🚨 LIVE MODE - Emails will be sent!');
    console.log('   Press Ctrl+C within 5 seconds to cancel...\n');
    await sleep(5000);
  }

  // Initialize outreach system
  const outreach = new BloggerOutreach();

  try {
    // Run campaign
    const bloggers = await outreach.runCampaign({
      findEmails: options.findEmails,
      sendEmails: options.sendEmails,
      targetCount: options.targetCount,
      delayBetweenEmails: options.emailDelay * 1000
    });

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Campaign Summary');
    console.log('='.repeat(60) + '\n');

    console.log(`Total Bloggers: ${bloggers.length}`);
    console.log(`Emails Found: ${bloggers.filter(b => b.email).length}`);
    console.log(`Emails Sent: ${options.sendEmails ? bloggers.length : 0}`);
    console.log(`Follow-ups Scheduled: ${options.sendEmails ? bloggers.length * 3 : 0}`);
    console.log('');

    console.log('Expected Results (at 15% response rate):');
    const expectedResponses = Math.round(bloggers.length * 0.15);
    const expectedActivated = Math.min(5, expectedResponses);
    const expectedMRR = expectedActivated * 10 * 29 * 0.25;

    console.log(`  Responses: ${expectedResponses}`);
    console.log(`  Activated Partners: ${expectedActivated}`);
    console.log(`  Monthly Revenue: $${Math.round(expectedMRR)}`);
    console.log('');

    // Export results
    const exportPath = `./outreach-results-${new Date().toISOString().split('T')[0]}.json`;
    const fs = require('fs');
    fs.writeFileSync(exportPath, JSON.stringify(bloggers, null, 2));
    console.log(`📁 Results exported to: ${exportPath}\n`);

    console.log('✅ Campaign completed successfully!\n');

    if (!options.sendEmails) {
      console.log('💡 Next Steps:');
      console.log('   1. Review the exported JSON file');
      console.log('   2. Verify email templates are correct');
      console.log('   3. Configure Mailgun API keys in .env');
      console.log('   4. Run with --send flag to send emails');
      console.log('   5. Monitor responses in the dashboard\n');
    } else {
      console.log('💡 Next Steps:');
      console.log('   1. Monitor Mailgun dashboard for delivery rates');
      console.log('   2. Check /outreach/dashboard.html for responses');
      console.log('   3. Follow up manually with interested bloggers');
      console.log('   4. Set up cron job for automated follow-ups');
      console.log('   5. Track conversions in affiliate dashboard\n');
    }

  } catch (error) {
    console.error('\n❌ Campaign failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the campaign
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
