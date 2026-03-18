const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/email/analytics
 * Get email campaign analytics overview
 */
router.get('/analytics', async (req, res) => {
  try {
    // Get campaign analytics from view
    const { data: campaignStats, error: campaignError } = await supabase
      .from('email_campaign_analytics')
      .select('*')
      .order('email_sequence_number', { ascending: true });

    if (campaignError) throw campaignError;

    // Get overall subscriber stats
    const { data: subscriberStats } = await supabase
      .rpc('get_subscriber_stats');

    // If RPC doesn't exist, calculate manually
    let overallStats = subscriberStats;
    if (!overallStats) {
      const { count: totalSubscribers } = await supabase
        .from('email_subscribers')
        .select('*', { count: 'exact', head: true });

      const { count: activeSubscribers } = await supabase
        .from('email_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: conversions } = await supabase
        .from('email_subscribers')
        .select('*', { count: 'exact', head: true })
        .not('converted_at', 'is', null);

      const { data: revenueData } = await supabase
        .from('email_conversions')
        .select('revenue_amount');

      const totalRevenue = revenueData?.reduce((sum, conv) => sum + parseFloat(conv.revenue_amount || 0), 0) || 0;

      overallStats = {
        total_subscribers: totalSubscribers || 0,
        active_subscribers: activeSubscribers || 0,
        total_conversions: conversions || 0,
        total_revenue: totalRevenue,
        conversion_rate: totalSubscribers > 0 ? ((conversions / totalSubscribers) * 100).toFixed(2) : 0
      };
    }

    // Calculate overall email metrics
    const { data: emailMetrics } = await supabase
      .from('email_sends')
      .select('status, opened_at, clicked_at');

    const totalSent = emailMetrics?.filter(e => e.status === 'sent' || e.status === 'delivered').length || 0;
    const totalOpened = emailMetrics?.filter(e => e.opened_at).length || 0;
    const totalClicked = emailMetrics?.filter(e => e.clicked_at).length || 0;

    const overallOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(2) : 0;
    const overallClickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          ...overallStats,
          overall_open_rate: overallOpenRate,
          overall_click_rate: overallClickRate,
          ltv_per_subscriber: overallStats.total_subscribers > 0
            ? (overallStats.total_revenue / overallStats.total_subscribers).toFixed(2)
            : 0
        },
        campaigns: campaignStats || [],
        targets: {
          open_rate: 35,
          click_rate: 8,
          conversion_rate: 12,
          ltv_per_subscriber: 1.20
        }
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      error: 'Failed to load analytics',
      message: error.message
    });
  }
});

/**
 * GET /api/email/analytics/subscribers
 * Get subscriber journey data
 */
router.get('/analytics/subscribers', async (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;

    let query = supabase
      .from('subscriber_journey')
      .select('*')
      .order('subscribed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: subscribers, error } = await query;

    if (error) throw error;

    // Get total count
    let countQuery = supabase
      .from('subscriber_journey')
      .select('*', { count: 'exact', head: true });

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    const { count } = await countQuery;

    res.json({
      success: true,
      data: subscribers,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Subscribers analytics error:', error);
    res.status(500).json({
      error: 'Failed to load subscriber data',
      message: error.message
    });
  }
});

/**
 * GET /api/email/analytics/campaign/:id
 * Get detailed analytics for a specific campaign
 */
router.get('/analytics/campaign/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (campaignError) throw campaignError;

    // Get sends for this campaign
    const { data: sends } = await supabase
      .from('email_sends')
      .select('*')
      .eq('campaign_id', id);

    // Get events for this campaign
    const { data: events } = await supabase
      .from('email_events')
      .select('*')
      .in('send_id', sends.map(s => s.id));

    // Calculate metrics
    const totalSends = sends.length;
    const delivered = sends.filter(s => s.status === 'delivered' || s.opened_at).length;
    const opened = sends.filter(s => s.opened_at).length;
    const clicked = sends.filter(s => s.clicked_at).length;
    const unsubscribed = sends.filter(s => s.unsubscribed_at).length;

    // Top links clicked
    const linkClicks = events
      .filter(e => e.event_type === 'clicked' && e.link_url)
      .reduce((acc, e) => {
        acc[e.link_url] = (acc[e.link_url] || 0) + 1;
        return acc;
      }, {});

    const topLinks = Object.entries(linkClicks)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([url, clicks]) => ({ url, clicks }));

    res.json({
      success: true,
      data: {
        campaign,
        metrics: {
          total_sends: totalSends,
          delivered,
          opened,
          clicked,
          unsubscribed,
          delivery_rate: totalSends > 0 ? ((delivered / totalSends) * 100).toFixed(2) : 0,
          open_rate: totalSends > 0 ? ((opened / totalSends) * 100).toFixed(2) : 0,
          click_rate: totalSends > 0 ? ((clicked / totalSends) * 100).toFixed(2) : 0,
          unsubscribe_rate: totalSends > 0 ? ((unsubscribed / totalSends) * 100).toFixed(2) : 0
        },
        top_links: topLinks
      }
    });

  } catch (error) {
    console.error('Campaign analytics error:', error);
    res.status(500).json({
      error: 'Failed to load campaign analytics',
      message: error.message
    });
  }
});

module.exports = router;
