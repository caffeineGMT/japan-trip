#!/usr/bin/env node

/**
 * Cron Job Script: Process Scheduled Follow-ups
 * Schedule this to run hourly: 0 * * * *
 * Or use the /api/outreach/follow-ups/process endpoint with cron authentication
 */

const BloggerOutreach = require('../lib/blogger-outreach');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function processFollowUps() {
  console.log(`\n[${new Date().toISOString()}] 📬 Processing follow-ups...`);

  try {
    const now = new Date().toISOString();

    // Get due follow-ups
    const { data: dueFollowUps, error: fetchError } = await supabase
      .from('follow_up_queue')
      .select(`
        *,
        bloggers(*)
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)
      .limit(50); // Process max 50 per run

    if (fetchError) {
      throw fetchError;
    }

    if (!dueFollowUps || dueFollowUps.length === 0) {
      console.log('No follow-ups due at this time.');
      return;
    }

    console.log(`Found ${dueFollowUps.length} follow-ups to process`);

    const outreach = new BloggerOutreach();
    let sent = 0;
    let failed = 0;

    for (const followUp of dueFollowUps) {
      const blogger = followUp.bloggers;

      console.log(`\nProcessing: ${blogger.email} (${followUp.email_type})`);

      try {
        // Generate personalized email
        const template = outreach.getEmailTemplate(followUp.email_type);
        const personalizedEmail = await outreach.personalizeEmail(blogger);

        // Send email
        const result = await outreach.sendEmail(blogger, personalizedEmail, followUp.email_type);

        if (result.success) {
          // Mark as sent in queue
          await supabase
            .from('follow_up_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', followUp.id);

          // Record in outreach_emails
          await supabase
            .from('outreach_emails')
            .insert({
              blogger_id: blogger.id,
              email_type: followUp.email_type,
              subject: outreach.getEmailSubject(followUp.email_type, blogger),
              body: personalizedEmail,
              message_id: result.messageId,
              status: result.mock ? 'sent' : 'delivered',
              sent_at: new Date().toISOString()
            });

          // Update blogger status
          await supabase
            .from('bloggers')
            .update({
              last_activity_at: new Date().toISOString()
            })
            .eq('id', blogger.id);

          sent++;
          console.log(`  ✅ Sent successfully`);
        } else {
          throw new Error(result.error || 'Send failed');
        }

        // Rate limiting: 1 minute between emails
        if (sent < dueFollowUps.length) {
          console.log(`  ⏱  Waiting 60 seconds before next email...`);
          await sleep(60000);
        }

      } catch (error) {
        console.error(`  ❌ Failed to send: ${error.message}`);
        failed++;

        // Mark as failed
        await supabase
          .from('follow_up_queue')
          .update({
            status: 'failed',
            sent_at: new Date().toISOString()
          })
          .eq('id', followUp.id);
      }
    }

    // Summary
    console.log(`\n${'='.repeat(50)}`);
    console.log('📊 Follow-up Processing Summary');
    console.log('='.repeat(50));
    console.log(`Total processed: ${dueFollowUps.length}`);
    console.log(`Sent: ${sent}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success rate: ${((sent / dueFollowUps.length) * 100).toFixed(1)}%`);
    console.log('');

    // Log to database (optional)
    await logCronRun(sent, failed, dueFollowUps.length);

  } catch (error) {
    console.error('\n❌ Follow-up processing error:', error);

    // Log failure
    await logCronRun(0, 0, 0, error.message);

    throw error;
  }
}

async function logCronRun(sent, failed, total, error = null) {
  try {
    await supabase
      .from('cron_logs')
      .insert({
        job_name: 'process_followups',
        status: error ? 'failed' : 'success',
        details: {
          sent,
          failed,
          total,
          error
        },
        run_at: new Date().toISOString()
      });
  } catch (logError) {
    console.error('Failed to log cron run:', logError);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the script
if (require.main === module) {
  processFollowUps()
    .then(() => {
      console.log('\n✅ Follow-up processing completed\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { processFollowUps };
