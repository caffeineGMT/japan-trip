#!/usr/bin/env node

/**
 * Response Tracking Script
 *
 * Monitors email responses and updates CRM tracking
 * Integrates with Gmail API or email webhook
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

const TRACKING_FILE = path.join(__dirname, '../tracking/outreach-tracker.csv');
const PIPELINE_FILE = path.join(__dirname, '../tracking/pipeline-tracker.csv');

// Load tracking data
async function loadTracking() {
  return new Promise((resolve, reject) => {
    const tracking = {};
    fs.createReadStream(TRACKING_FILE)
      .pipe(csv())
      .on('data', (row) => {
        tracking[row.contact_email] = row;
      })
      .on('end', () => resolve(tracking))
      .on('error', reject);
  });
}

// Mark email as replied
async function markReplied(email, replyType = 'interested') {
  const tracking = await loadTracking();

  if (!tracking[email]) {
    console.log(`❌ Email not found in tracking: ${email}`);
    return;
  }

  tracking[email].replied = new Date().toISOString().split('T')[0];
  tracking[email].status = replyType === 'interested' ? 'replied_interested' : 'replied_not_interested';

  if (replyType === 'interested') {
    tracking[email].next_action = 'Book Demo Call';
  } else {
    tracking[email].next_action = 'Closed - Not Interested';
    tracking[email].status = 'lost';
  }

  // Write back
  const records = Object.values(tracking);
  const csvWriter = createObjectCsvWriter({
    path: TRACKING_FILE,
    header: Object.keys(records[0]).map(key => ({ id: key, title: key })),
  });

  await csvWriter.writeRecords(records);
  console.log(`✅ Updated tracking for ${email}: ${replyType}`);
}

// Mark demo as booked
async function markDemoBooked(email, demoDate) {
  const tracking = await loadTracking();

  if (!tracking[email]) {
    console.log(`❌ Email not found in tracking: ${email}`);
    return;
  }

  tracking[email].demo_booked = demoDate;
  tracking[email].status = 'demo_booked';
  tracking[email].next_action = 'Complete Demo Call';

  const records = Object.values(tracking);
  const csvWriter = createObjectCsvWriter({
    path: TRACKING_FILE,
    header: Object.keys(records[0]).map(key => ({ id: key, title: key })),
  });

  await csvWriter.writeRecords(records);
  console.log(`✅ Demo booked for ${email} on ${demoDate}`);
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

if (command === 'replied') {
  const email = args[1];
  const type = args[2] || 'interested';
  markReplied(email, type);
} else if (command === 'demo') {
  const email = args[1];
  const date = args[2] || new Date().toISOString().split('T')[0];
  markDemoBooked(email, date);
} else {
  console.log('Usage:');
  console.log('  node track-responses.js replied email@example.com [interested|not_interested]');
  console.log('  node track-responses.js demo email@example.com [YYYY-MM-DD]');
}

module.exports = { markReplied, markDemoBooked };