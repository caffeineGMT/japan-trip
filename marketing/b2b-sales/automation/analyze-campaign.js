#!/usr/bin/env node

/**
 * Campaign Analytics
 *
 * Analyzes email campaign performance and generates reports
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const TRACKING_FILE = path.join(__dirname, '../tracking/outreach-tracker.csv');
const PIPELINE_FILE = path.join(__dirname, '../tracking/pipeline-tracker.csv');

async function loadData(file) {
  return new Promise((resolve, reject) => {
    const data = [];
    fs.createReadStream(file)
      .pipe(csv())
      .on('data', (row) => data.push(row))
      .on('end', () => resolve(data))
      .on('error', reject);
  });
}

async function analyzecamp() {
  console.log('📊 B2B Campaign Analytics\n');

  const tracking = await loadData(TRACKING_FILE);
  const pipeline = await loadData(PIPELINE_FILE);

  // Email metrics
  const email1Sent = tracking.filter(r => r.email_1_sent).length;
  const email1Opened = tracking.filter(r => r.email_1_opened).length;
  const email1Clicked = tracking.filter(r => r.email_1_clicked).length;

  const email2Sent = tracking.filter(r => r.email_2_sent).length;
  const email2Opened = tracking.filter(r => r.email_2_opened).length;
  const email2Clicked = tracking.filter(r => r.email_2_clicked).length;

  const email3Sent = tracking.filter(r => r.email_3_sent).length;
  const email3Opened = tracking.filter(r => r.email_3_opened).length;
  const email3Clicked = tracking.filter(r => r.email_3_clicked).length;

  const replied = tracking.filter(r => r.replied).length;
  const demosBooked = tracking.filter(r => r.demo_booked).length;
  const demosCompleted = tracking.filter(r => r.demo_completed).length;

  // Pipeline metrics
  const prospects = pipeline.filter(r => r.stage === 'Prospect').length;
  const contacted = pipeline.filter(r => r.stage === 'Contacted').length;
  const qualified = pipeline.filter(r => r.stage === 'Qualified').length;
  const demoStage = pipeline.filter(r => r.stage === 'Demo').length;
  const proposal = pipeline.filter(r => r.stage === 'Proposal').length;
  const negotiation = pipeline.filter(r => r.stage === 'Negotiation').length;
  const closed = pipeline.filter(r => r.stage === 'Closed Won').length;
  const lost = pipeline.filter(r => r.stage === 'Closed Lost').length;

  // Calculate revenue
  const totalPipelineValue = pipeline.reduce((sum, r) => sum + (parseFloat(r.arr_value) || 0), 0);
  const closedMRR = pipeline
    .filter(r => r.stage === 'Closed Won')
    .reduce((sum, r) => sum + (parseFloat(r.mrr_value) || 0), 0);

  // Print report
  console.log('═══════════════════════════════════════');
  console.log('  EMAIL CAMPAIGN PERFORMANCE');
  console.log('═══════════════════════════════════════\n');

  console.log(`Email #1: "Launch in 24 Hours"`);
  console.log(`  Sent: ${email1Sent}`);
  console.log(`  Opened: ${email1Opened} (${email1Sent > 0 ? ((email1Opened / email1Sent) * 100).toFixed(1) : 0}%)`);
  console.log(`  Clicked: ${email1Clicked} (${email1Sent > 0 ? ((email1Clicked / email1Sent) * 100).toFixed(1) : 0}%)\n`);

  console.log(`Email #2: "Case Study"`);
  console.log(`  Sent: ${email2Sent}`);
  console.log(`  Opened: ${email2Opened} (${email2Sent > 0 ? ((email2Opened / email2Sent) * 100).toFixed(1) : 0}%)`);
  console.log(`  Clicked: ${email2Clicked} (${email2Sent > 0 ? ((email2Clicked / email2Sent) * 100).toFixed(1) : 0}%)\n`);

  console.log(`Email #3: "Quick Question"`);
  console.log(`  Sent: ${email3Sent}`);
  console.log(`  Opened: ${email3Opened} (${email3Sent > 0 ? ((email3Opened / email3Sent) * 100).toFixed(1) : 0}%)`);
  console.log(`  Clicked: ${email3Clicked} (${email3Sent > 0 ? ((email3Clicked / email3Sent) * 100).toFixed(1) : 0}%)\n`);

  console.log('═══════════════════════════════════════');
  console.log('  CONVERSION FUNNEL');
  console.log('═══════════════════════════════════════\n');

  const totalContacted = Math.max(email1Sent, email2Sent, email3Sent);
  console.log(`Total Contacted: ${totalContacted}`);
  console.log(`Replied: ${replied} (${totalContacted > 0 ? ((replied / totalContacted) * 100).toFixed(1) : 0}%)`);
  console.log(`Demos Booked: ${demosBooked} (${replied > 0 ? ((demosBooked / replied) * 100).toFixed(1) : 0}% of replies)`);
  console.log(`Demos Completed: ${demosCompleted} (${demosBooked > 0 ? ((demosCompleted / demosBooked) * 100).toFixed(1) : 0}% show rate)\n`);

  console.log('═══════════════════════════════════════');
  console.log('  SALES PIPELINE');
  console.log('═══════════════════════════════════════\n');

  console.log(`Prospects: ${prospects}`);
  console.log(`Contacted: ${contacted}`);
  console.log(`Qualified: ${qualified}`);
  console.log(`Demo Stage: ${demoStage}`);
  console.log(`Proposal Sent: ${proposal}`);
  console.log(`Negotiation: ${negotiation}`);
  console.log(`Closed Won: ${closed} 🎉`);
  console.log(`Closed Lost: ${lost}\n`);

  console.log('═══════════════════════════════════════');
  console.log('  REVENUE METRICS');
  console.log('═══════════════════════════════════════\n');

  console.log(`Total Pipeline Value: $${totalPipelineValue.toLocaleString()}`);
  console.log(`Closed MRR: $${closedMRR.toLocaleString()}`);
  console.log(`Closed ARR: $${(closedMRR * 12).toLocaleString()}\n`);

  console.log('═══════════════════════════════════════');
  console.log('  GOAL PROGRESS');
  console.log('═══════════════════════════════════════\n');

  const demoGoal = 20;
  const closeGoal = 5;
  const mrrGoal = 2495;

  console.log(`Demos Booked: ${demosBooked} / ${demoGoal} (${((demosBooked / demoGoal) * 100).toFixed(0)}%)`);
  console.log(`Deals Closed: ${closed} / ${closeGoal} (${((closed / closeGoal) * 100).toFixed(0)}%)`);
  console.log(`MRR Target: $${closedMRR.toLocaleString()} / $${mrrGoal.toLocaleString()} (${((closedMRR / mrrGoal) * 100).toFixed(0)}%)\n`);

  // Recommendations
  console.log('═══════════════════════════════════════');
  console.log('  RECOMMENDATIONS');
  console.log('═══════════════════════════════════════\n');

  if (email1Sent === 0) {
    console.log('❗ Action Required: Start the email campaign (Email #1)');
  } else if (replied / totalContacted < 0.10) {
    console.log('⚠️  Response rate below 10% - consider A/B testing subject lines');
  }

  if (demosBooked > 0 && demosCompleted / demosBooked < 0.80) {
    console.log('⚠️  Demo show rate below 80% - send reminder emails 24hrs before');
  }

  if (closed > 0 && closed / demosCompleted < 0.25) {
    console.log('⚠️  Close rate below 25% - review demo script and objection handling');
  }

  if (closedMRR >= mrrGoal) {
    console.log('🎉 Congratulations! You hit the MRR target!');
  }

  console.log('');
}

analyzeCampaign().catch(console.error);