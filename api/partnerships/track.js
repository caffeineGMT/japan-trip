/**
 * Partnership Tracking API
 * Tracks visits, clicks, signups, and conversions from partner landing pages
 * Used for commission calculation and analytics
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'placeholder-key'
);

/**
 * Track partnership event
 * POST /api/partnerships/track
 */
async function trackEvent(req, res) {
  try {
    const { partner, event, source, userId, amount, metadata } = req.body;

    if (!partner || !event) {
      return res.status(400).json({ error: 'Missing required fields: partner, event' });
    }

    // Valid partners
    const validPartners = ['jal', 'ana', 'zipair', 'peach', 'jrpass', 'klook'];
    if (!validPartners.includes(partner)) {
      return res.status(400).json({ error: 'Invalid partner' });
    }

    // Valid events
    const validEvents = [
      'landing_page_view',
      'cta_click',
      'signup',
      'purchase',
      'subscription'
    ];
    if (!validEvents.includes(event)) {
      return res.status(400).json({ error: 'Invalid event type' });
    }

    // Store event
    const { data, error } = await supabase
      .from('partnership_events')
      .insert({
        partner,
        event_type: event,
        source: source || 'direct',
        user_id: userId || null,
        amount: amount || null,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    // Update partner stats
    await updatePartnerStats(partner, event, amount);

    res.json({ success: true, message: 'Event tracked' });
  } catch (error) {
    console.error('Partnership tracking error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
}

/**
 * Update partner aggregated stats
 */
async function updatePartnerStats(partner, event, amount) {
  try {
    // Get current stats
    const { data: existing } = await supabase
      .from('partner_stats')
      .select('*')
      .eq('partner', partner)
      .single();

    const stats = existing || {
      partner,
      views: 0,
      clicks: 0,
      signups: 0,
      purchases: 0,
      revenue: 0,
      commission_owed: 0
    };

    // Update based on event
    switch (event) {
      case 'landing_page_view':
        stats.views += 1;
        break;
      case 'cta_click':
        stats.clicks += 1;
        break;
      case 'signup':
        stats.signups += 1;
        break;
      case 'purchase':
      case 'subscription':
        stats.purchases += 1;
        if (amount) {
          stats.revenue += amount;
          // 20% commission
          stats.commission_owed += amount * 0.20;
        }
        break;
    }

    // Upsert stats
    await supabase
      .from('partner_stats')
      .upsert(stats, { onConflict: 'partner' });

  } catch (error) {
    console.error('Stats update error:', error);
  }
}

/**
 * Get partner analytics
 * GET /api/partnerships/analytics?partner=jal&days=30
 */
async function getAnalytics(req, res) {
  try {
    const { partner, days = 30 } = req.query;

    if (!partner) {
      return res.status(400).json({ error: 'Partner parameter required' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get events
    const { data: events, error: eventsError } = await supabase
      .from('partnership_events')
      .select('*')
      .eq('partner', partner)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (eventsError) throw eventsError;

    // Get aggregated stats
    const { data: stats, error: statsError } = await supabase
      .from('partner_stats')
      .select('*')
      .eq('partner', partner)
      .single();

    if (statsError && statsError.code !== 'PGRST116') throw statsError;

    // Group events by day
    const dailyStats = {};
    events.forEach(event => {
      const date = event.created_at.split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { views: 0, clicks: 0, signups: 0, purchases: 0, revenue: 0 };
      }

      if (event.event_type === 'landing_page_view') dailyStats[date].views++;
      if (event.event_type === 'cta_click') dailyStats[date].clicks++;
      if (event.event_type === 'signup') dailyStats[date].signups++;
      if (event.event_type === 'purchase' || event.event_type === 'subscription') {
        dailyStats[date].purchases++;
        dailyStats[date].revenue += event.amount || 0;
      }
    });

    // Calculate conversion metrics
    const metrics = {
      totalViews: stats?.views || 0,
      totalClicks: stats?.clicks || 0,
      totalSignups: stats?.signups || 0,
      totalPurchases: stats?.purchases || 0,
      totalRevenue: stats?.revenue || 0,
      commissionOwed: stats?.commission_owed || 0,
      ctr: stats?.views > 0 ? ((stats.clicks / stats.views) * 100).toFixed(2) : 0,
      conversionRate: stats?.clicks > 0 ? ((stats.purchases / stats.clicks) * 100).toFixed(2) : 0,
      avgOrderValue: stats?.purchases > 0 ? (stats.revenue / stats.purchases).toFixed(2) : 0
    };

    res.json({
      partner,
      metrics,
      dailyStats: Object.entries(dailyStats).map(([date, data]) => ({
        date,
        ...data
      }))
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

/**
 * Mark conversion (called from Stripe webhook)
 * POST /api/partnerships/convert
 */
async function markConversion(req, res) {
  try {
    const { userId, amount, productId } = req.body;

    // Check if user has partner source
    const { data: user } = await supabase
      .from('users')
      .select('partner_source, partner_code')
      .eq('id', userId)
      .single();

    if (user && user.partner_source) {
      // Track purchase
      await trackEvent({
        body: {
          partner: user.partner_source,
          event: 'purchase',
          userId,
          amount,
          metadata: {
            productId,
            partnerCode: user.partner_code
          }
        }
      }, { json: () => {} });

      console.log(`Conversion tracked for partner: ${user.partner_source}, amount: $${amount}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Conversion tracking error:', error);
    res.status(500).json({ error: 'Failed to mark conversion' });
  }
}

/**
 * Get commission report
 * GET /api/partnerships/commissions?partner=jal
 */
async function getCommissions(req, res) {
  try {
    const { partner } = req.query;

    if (!partner) {
      return res.status(400).json({ error: 'Partner parameter required' });
    }

    // Get all purchases
    const { data: purchases, error } = await supabase
      .from('partnership_events')
      .select('*')
      .eq('partner', partner)
      .in('event_type', ['purchase', 'subscription'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate commissions
    const commissions = purchases.map(p => ({
      date: p.created_at,
      userId: p.user_id,
      amount: p.amount,
      commission: p.amount * 0.20, // 20% commission
      status: 'pending',
      metadata: p.metadata
    }));

    const totalCommission = commissions.reduce((sum, c) => sum + c.commission, 0);

    res.json({
      partner,
      totalCommission: totalCommission.toFixed(2),
      commissionRate: '20%',
      commissions
    });

  } catch (error) {
    console.error('Commissions error:', error);
    res.status(500).json({ error: 'Failed to fetch commissions' });
  }
}

module.exports = {
  trackEvent,
  getAnalytics,
  markConversion,
  getCommissions
};
