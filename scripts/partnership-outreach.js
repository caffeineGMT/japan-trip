#!/usr/bin/env node
/**
 * Partnership Outreach Automation
 * Automates email outreach to airline and travel partners
 */

const { emailTemplates, researchKeywords } = require('../marketing/partnerships/email-templates.js');
const mailgun = require('mailgun.js');
const Mailgun = require('mailgun.js');
const formData = require('form-data');

// Initialize Mailgun
const mg = new Mailgun(formData);
const mailgunClient = mg.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || 'your-mailgun-key'
});

/**
 * Partner Contact Database
 * In production, this would come from a CRM or database
 */
const partnerContacts = {
  jal: [
    {
      name: 'Kenji Tanaka',
      title: 'Director of Partnerships',
      email: 'k.tanaka@jal.com', // Placeholder
      company: 'Japan Airlines',
      linkedin: 'linkedin.com/in/kenji-tanaka-jal'
    },
    {
      name: 'Yuki Nakamura',
      title: 'Customer Experience Manager',
      email: 'y.nakamura@jal.com', // Placeholder
      company: 'Japan Airlines',
      linkedin: 'linkedin.com/in/yuki-nakamura-jal'
    }
  ],
  ana: [
    {
      name: 'Hiroshi Yamamoto',
      title: 'Head of Business Development',
      email: 'h.yamamoto@ana.co.jp', // Placeholder
      company: 'All Nippon Airways',
      linkedin: 'linkedin.com/in/hiroshi-yamamoto-ana'
    },
    {
      name: 'Sakura Kobayashi',
      title: 'Partnerships Director',
      email: 's.kobayashi@ana.co.jp', // Placeholder
      company: 'All Nippon Airways',
      linkedin: 'linkedin.com/in/sakura-kobayashi-ana'
    }
  ],
  zipair: [
    {
      name: 'Mark Johnson',
      title: 'Marketing Director',
      email: 'mark.j@flyzipair.com', // Placeholder
      company: 'Zipair',
      linkedin: 'linkedin.com/in/mark-johnson-zipair'
    }
  ],
  peach: [
    {
      name: 'Takeshi Sato',
      title: 'Business Development',
      email: 't.sato@flypeach.com', // Placeholder
      company: 'Peach Aviation',
      linkedin: 'linkedin.com/in/takeshi-sato-peach'
    }
  ],
  jrpass: [
    {
      name: 'Sarah Williams',
      title: 'Founder',
      email: 'sarah@jrpass.com', // Placeholder
      company: 'JRPass.com',
      linkedin: 'linkedin.com/in/sarah-williams-jrpass'
    }
  ],
  klook: [
    {
      name: 'David Chen',
      title: 'Supplier Partnerships Manager',
      email: 'd.chen@klook.com', // Placeholder
      company: 'Klook',
      linkedin: 'linkedin.com/in/david-chen-klook'
    }
  ]
};

/**
 * Send outreach email
 */
async function sendOutreachEmail(contact, template, dryRun = true) {
  try {
    // Personalize template
    let subject = template.subject;
    let body = template.body;

    // Replace placeholders
    body = body
      .replace(/\[BD Contact Name\]/g, contact.name.split(' ')[0])
      .replace(/\[Name\]/g, contact.name.split(' ')[0])
      .replace(/\[JAL\/ANA\]/g, contact.company)
      .replace(/\[Company\]/g, contact.company)
      .replace(/\[Your Name\]/g, 'Michael Guo')
      .replace(/\[email@tripcompanion.app\]/g, 'partnerships@tripcompanion.app')
      .replace(/\[email\]/g, 'partnerships@tripcompanion.app')
      .replace(/\[phone\]/g, '+1-555-TRIP-PLAN');

    if (dryRun) {
      console.log('\n=== DRY RUN - Email Preview ===');
      console.log(`To: ${contact.email}`);
      console.log(`Subject: ${subject}`);
      console.log(`\n${body}`);
      console.log('\n==============================\n');
      return { success: true, dryRun: true };
    }

    // Send via Mailgun
    const result = await mailgunClient.messages.create(
      process.env.MAILGUN_DOMAIN || 'tripcompanion.app',
      {
        from: 'TripCompanion Partnerships <partnerships@tripcompanion.app>',
        to: contact.email,
        subject: subject,
        text: body,
        html: formatEmailHTML(body),
        'o:tag': ['partnership-outreach', contact.company.toLowerCase()],
        'o:tracking': true
      }
    );

    console.log(`✓ Email sent to ${contact.name} (${contact.company})`);
    return { success: true, messageId: result.id };

  } catch (error) {
    console.error(`✗ Failed to send to ${contact.name}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Format email as HTML
 */
function formatEmailHTML(text) {
  return `
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
    strong {
      color: #000;
    }
    ul {
      margin: 16px 0;
    }
    li {
      margin: 8px 0;
    }
    .signature {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  ${text.split('\n').map(line => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return `<h3>${line.replace(/\*\*/g, '')}</h3>`;
    } else if (line.startsWith('• ')) {
      return `<li>${line.substring(2)}</li>`;
    } else if (line.trim() === '') {
      return '<br>';
    } else {
      return `<p>${line}</p>`;
    }
  }).join('\n')}
</body>
</html>
  `;
}

/**
 * Run outreach campaign
 */
async function runCampaign(options = {}) {
  const {
    partners = ['all'], // 'all', 'jal', 'ana', 'boutique', etc.
    template = 'initial', // 'initial', 'followUp1', 'followUp2'
    dryRun = true,
    delay = 5000 // 5 seconds between emails
  } = options;

  console.log('\n🚀 Starting Partnership Outreach Campaign');
  console.log(`Template: ${template}`);
  console.log(`Dry Run: ${dryRun ? 'YES' : 'NO'}\n`);

  // Select template
  let emailTemplate;
  switch (template) {
    case 'initial':
      emailTemplate = emailTemplates.jalAnaPitch;
      break;
    case 'followUp1':
      emailTemplate = emailTemplates.followUp1;
      break;
    case 'followUp2':
      emailTemplate = emailTemplates.followUp2;
      break;
    case 'boutique':
      emailTemplate = emailTemplates.boutiqueAirlinePitch;
      break;
    case 'jrpass':
      emailTemplate = emailTemplates.jrPassResellerPitch;
      break;
    default:
      emailTemplate = emailTemplates.jalAnaPitch;
  }

  // Build contact list
  let contacts = [];
  if (partners.includes('all')) {
    Object.values(partnerContacts).forEach(list => contacts.push(...list));
  } else {
    partners.forEach(partner => {
      if (partnerContacts[partner]) {
        contacts.push(...partnerContacts[partner]);
      }
    });
  }

  console.log(`📧 ${contacts.length} contacts to email\n`);

  // Send emails
  const results = [];
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    console.log(`[${i + 1}/${contacts.length}] Processing ${contact.name}...`);

    const result = await sendOutreachEmail(contact, emailTemplate, dryRun);
    results.push({ contact, result });

    // Delay between emails (to avoid spam filters)
    if (i < contacts.length - 1 && !dryRun) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Summary
  console.log('\n=== Campaign Summary ===');
  const successful = results.filter(r => r.result.success).length;
  const failed = results.filter(r => !r.result.success).length;
  console.log(`✓ Successful: ${successful}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Total: ${results.length}`);

  return results;
}

/**
 * LinkedIn Contact Finder
 * Searches for decision-makers at target companies
 */
function findLinkedInContacts(company) {
  const keywords = researchKeywords[company.toLowerCase()] || [];

  console.log(`\n🔍 LinkedIn Search Queries for ${company}:`);
  console.log('Copy these into LinkedIn Sales Navigator or regular search:\n');

  keywords.forEach((keyword, i) => {
    console.log(`${i + 1}. "${keyword}"`);
  });

  console.log('\n📋 Sample LinkedIn Message:');
  console.log('---');
  console.log(`Hi [Name], I noticed you work in partnerships at ${company}. I run a Japan trip planning platform and think there might be a mutually beneficial opportunity. Would love to connect!`);
  console.log('---\n');
}

/**
 * Track outreach status
 */
async function trackOutreach(contact, status, notes = '') {
  // In production, save to database
  const record = {
    contact_name: contact.name,
    contact_email: contact.email,
    company: contact.company,
    status, // 'sent', 'opened', 'replied', 'meeting_scheduled', 'deal_closed'
    notes,
    timestamp: new Date().toISOString()
  };

  console.log('Tracking:', record);
  // await supabase.from('outreach_tracking').insert(record);
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'campaign') {
    // Run outreach campaign
    const partners = args[1] ? args[1].split(',') : ['all'];
    const template = args[2] || 'initial';
    const dryRun = !args.includes('--live');

    runCampaign({ partners, template, dryRun });

  } else if (command === 'linkedin') {
    // Find LinkedIn contacts
    const company = args[1] || 'jal';
    findLinkedInContacts(company);

  } else {
    console.log(`
Partnership Outreach Tool

Usage:
  node scripts/partnership-outreach.js campaign [partners] [template] [--live]
  node scripts/partnership-outreach.js linkedin [company]

Examples:
  # Dry run to all partners (preview emails)
  node scripts/partnership-outreach.js campaign all initial

  # Send to JAL/ANA only (dry run)
  node scripts/partnership-outreach.js campaign jal,ana initial

  # LIVE send to boutique airlines
  node scripts/partnership-outreach.js campaign zipair,peach boutique --live

  # Find LinkedIn contacts for JAL
  node scripts/partnership-outreach.js linkedin jal

Templates:
  - initial: First outreach email
  - followUp1: Follow-up after 7 days
  - followUp2: Final follow-up after 14 days
  - boutique: For smaller airlines (Zipair, Peach)
  - jrpass: For JR Pass resellers

Partners:
  - all: All partners
  - jal, ana: Major airlines
  - zipair, peach: Boutique airlines
  - jrpass, klook: Travel service providers
    `);
  }
}

module.exports = {
  runCampaign,
  sendOutreachEmail,
  findLinkedInContacts,
  trackOutreach,
  partnerContacts
};
