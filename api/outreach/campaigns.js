/**
 * Outreach Campaigns API
 * Handles affiliate partner recruitment campaigns
 */

const BloggerOutreach = require('../../lib/blogger-outreach');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/outreach/campaigns
 * List all campaigns
 */
async function listCampaigns(req, res) {
  try {
    const { data, error } = await supabase
      .from('outreach_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('List campaigns error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/outreach/campaigns/start
 * Start a new outreach campaign
 */
async function startCampaign(req, res) {
  try {
    const {
      name,
      targetCount = 50,
      emailDelay = 60,
      findEmails = true,
      sendEmails = true,
      scheduleFollowUps = true
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Campaign name is required' });
    }

    // Create campaign record
    const { data: campaign, error: campaignError } = await supabase
      .from('outreach_campaigns')
      .insert({
        name,
        target_count: targetCount,
        status: 'active',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (campaignError) throw campaignError;

    // Initialize outreach system
    const outreach = new BloggerOutreach();

    // Run campaign
    const bloggers = await outreach.runCampaign({
      findEmails,
      sendEmails,
      targetCount,
      delayBetweenEmails: emailDelay * 1000
    });

    // Save bloggers to database
    for (const blogger of bloggers) {
      const { data: existingBlogger } = await supabase
        .from('bloggers')
        .select('id')
        .eq('email', blogger.email)
        .single();

      if (!existingBlogger) {
        const { data: newBlogger, error: bloggerError } = await supabase
          .from('bloggers')
          .insert({
            email: blogger.email,
            first_name: blogger.firstName,
            blog_name: blogger.name,
            domain: blogger.domain,
            monthly_traffic: blogger.monthlyTraffic,
            confidence_score: blogger.confidence,
            status: 'contacted',
            referral_code: outreach.generateReferralCode(blogger.email)
          })
          .select()
          .single();

        if (!bloggerError) {
          // Link to campaign
          await supabase
            .from('campaign_bloggers')
            .insert({
              campaign_id: campaign.id,
              blogger_id: newBlogger.id
            });

          // Record email sent
          if (sendEmails) {
            await supabase
              .from('outreach_emails')
              .insert({
                blogger_id: newBlogger.id,
                email_type: 'initial',
                subject: outreach.getEmailSubject('initial', blogger),
                body: await outreach.personalizeEmail(blogger),
                status: 'sent',
                sent_at: new Date().toISOString()
              });
          }

          // Schedule follow-ups
          if (scheduleFollowUps) {
            const followUps = await outreach.scheduleFollowUps(blogger, new Date());
            for (const followUp of followUps) {
              await supabase
                .from('follow_up_queue')
                .insert({
                  blogger_id: newBlogger.id,
                  email_type: followUp.type,
                  scheduled_for: followUp.scheduledDate
                });
            }
          }
        }
      }
    }

    // Update campaign stats
    await supabase
      .from('outreach_campaigns')
      .update({
        emails_sent: sendEmails ? bloggers.length : 0,
        emails_delivered: sendEmails ? bloggers.length : 0
      })
      .eq('id', campaign.id);

    res.json({
      success: true,
      campaignId: campaign.id,
      bloggersFound: bloggers.length,
      emailsSent: sendEmails ? bloggers.length : 0,
      followUpsScheduled: scheduleFollowUps ? bloggers.length * 3 : 0
    });

  } catch (error) {
    console.error('Start campaign error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/outreach/bloggers
 * List all bloggers
 */
async function listBloggers(req, res) {
  try {
    const { status } = req.query;

    let query = supabase
      .from('bloggers')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('List bloggers error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/outreach/bloggers
 * Add a blogger manually
 */
async function addBlogger(req, res) {
  try {
    const {
      email,
      firstName,
      lastName,
      blogName,
      domain,
      monthlyTraffic
    } = req.body;

    if (!email || !blogName || !domain) {
      return res.status(400).json({ error: 'Email, blog name, and domain are required' });
    }

    const outreach = new BloggerOutreach();

    const { data, error } = await supabase
      .from('bloggers')
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        blog_name: blogName,
        domain,
        monthly_traffic: monthlyTraffic || 0,
        status: 'prospect',
        referral_code: outreach.generateReferralCode(email)
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Add blogger error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/outreach/follow-ups
 * List scheduled follow-ups
 */
async function listFollowUps(req, res) {
  try {
    const { data, error } = await supabase
      .from('follow_up_queue')
      .select(`
        *,
        bloggers(email, first_name, blog_name)
      `)
      .eq('status', 'scheduled')
      .order('scheduled_for', { ascending: true })
      .limit(50);

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('List follow-ups error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/outreach/follow-ups/process
 * Process due follow-ups
 */
async function processFollowUps(req, res) {
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
      .lte('scheduled_for', now);

    if (fetchError) throw fetchError;

    if (!dueFollowUps || dueFollowUps.length === 0) {
      return res.json({ sent: 0, message: 'No follow-ups due' });
    }

    const outreach = new BloggerOutreach();
    let sent = 0;

    for (const followUp of dueFollowUps) {
      const blogger = followUp.bloggers;

      // Generate personalized email
      const template = outreach.getEmailTemplate(followUp.email_type);
      const personalizedEmail = await outreach.personalizeEmail(blogger);

      // Send email
      const result = await outreach.sendEmail(blogger, personalizedEmail, followUp.email_type);

      if (result.success) {
        // Mark as sent
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
            status: 'sent',
            sent_at: new Date().toISOString()
          });

        sent++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute
    }

    res.json({ sent, total: dueFollowUps.length });
  } catch (error) {
    console.error('Process follow-ups error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/outreach/webhooks/mailgun
 * Handle Mailgun webhooks for email tracking
 */
async function mailgunWebhook(req, res) {
  try {
    const event = req.body;

    // Verify webhook signature (if configured)
    // const isValid = verifyMailgunWebhook(req);
    // if (!isValid) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    const eventType = event['event-data']?.event;
    const messageId = event['event-data']?.message?.headers?.['message-id'];
    const recipient = event['event-data']?.recipient;

    if (!eventType || !messageId) {
      return res.status(400).json({ error: 'Invalid webhook data' });
    }

    // Store event
    await supabase
      .from('mailgun_events')
      .insert({
        message_id: messageId,
        event_type: eventType,
        recipient,
        timestamp: new Date(event['event-data']?.timestamp * 1000).toISOString(),
        event_data: event['event-data']
      });

    // Update email record
    const { data: email } = await supabase
      .from('outreach_emails')
      .select('id, blogger_id')
      .eq('message_id', messageId)
      .single();

    if (email) {
      const updates = {};

      switch (eventType) {
        case 'delivered':
          updates.status = 'delivered';
          updates.delivered_at = new Date().toISOString();
          break;
        case 'opened':
          updates.status = 'opened';
          updates.opened_at = new Date().toISOString();
          updates.open_count = supabase.rpc('increment', { x: 1 });
          break;
        case 'clicked':
          updates.status = 'clicked';
          updates.clicked_at = new Date().toISOString();
          updates.click_count = supabase.rpc('increment', { x: 1 });
          break;
        case 'bounced':
        case 'failed':
          updates.status = 'bounced';
          updates.bounced_at = new Date().toISOString();
          break;
      }

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('outreach_emails')
          .update(updates)
          .eq('id', email.id);

        // Update campaign stats if needed
        if (eventType === 'opened' || eventType === 'clicked') {
          // Find campaign
          const { data: campaignBlogger } = await supabase
            .from('campaign_bloggers')
            .select('campaign_id')
            .eq('blogger_id', email.blogger_id)
            .single();

          if (campaignBlogger) {
            const field = eventType === 'opened' ? 'emails_opened' : 'emails_clicked';
            await supabase.rpc('increment_campaign_stat', {
              campaign_id: campaignBlogger.campaign_id,
              field_name: field
            });
          }
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Mailgun webhook error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  listCampaigns,
  startCampaign,
  listBloggers,
  addBlogger,
  listFollowUps,
  processFollowUps,
  mailgunWebhook
};
