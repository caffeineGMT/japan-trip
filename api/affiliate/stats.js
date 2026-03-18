const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * GET /api/affiliate/stats
 * Get affiliate statistics for partner dashboard
 *
 * Query params:
 * - userId: user ID (required)
 * - affiliateId: affiliate ID (optional, alternative to userId)
 */
router.get('/stats', async (req, res) => {
  try {
    const { userId, affiliateId } = req.query;

    if (!userId && !affiliateId) {
      return res.status(400).json({
        error: 'Missing required parameter',
        message: 'Either userId or affiliateId is required'
      });
    }

    // Get affiliate record
    let affiliate;
    if (affiliateId) {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('id', affiliateId)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Affiliate not found' });
      }
      affiliate = data;
    } else {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return res.status(404).json({
          error: 'No affiliate account found',
          message: 'This user does not have an affiliate account'
        });
      }
      affiliate = data;
    }

    // Get stats from materialized view (fast!)
    const { data: stats, error: statsError } = await supabase
      .from('affiliate_stats')
      .select('*')
      .eq('affiliate_id', affiliate.id)
      .single();

    if (statsError) {
      console.error('Error fetching affiliate stats:', statsError);
      // Return default stats if view hasn't been populated yet
      return res.json({
        affiliateId: affiliate.id,
        affiliateCode: affiliate.affiliate_code,
        commissionRate: parseFloat(affiliate.commission_rate),
        pendingPayout: parseFloat(affiliate.pending_payout),
        totalEarned: parseFloat(affiliate.total_earned),
        impressions: 0,
        clicks: 0,
        signups: 0,
        purchases: 0,
        totalSales: 0,
        revenue: 0,
        status: affiliate.status,
        paypalEmail: affiliate.paypal_email
      });
    }

    // Get earnings history (last 12 months)
    const { data: earningsHistory } = await supabase
      .from('affiliate_clicks')
      .select('created_at, purchase_amount')
      .eq('affiliate_id', affiliate.id)
      .eq('action_type', 'purchase')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    // Group earnings by month
    const monthlyEarnings = {};
    if (earningsHistory) {
      earningsHistory.forEach(record => {
        const month = new Date(record.created_at).toISOString().slice(0, 7); // YYYY-MM
        const commission = parseFloat(record.purchase_amount) * parseFloat(affiliate.commission_rate);
        monthlyEarnings[month] = (monthlyEarnings[month] || 0) + commission;
      });
    }

    // Format response
    const response = {
      affiliateId: affiliate.id,
      affiliateCode: affiliate.affiliate_code,
      commissionRate: parseFloat(affiliate.commission_rate),
      pendingPayout: parseFloat(affiliate.pending_payout),
      totalEarned: parseFloat(affiliate.total_earned),

      // Stats from materialized view
      impressions: stats.impressions || 0,
      clicks: stats.clicks || 0,
      signups: stats.signups || 0,
      purchases: stats.purchases || 0,
      totalSales: parseFloat(stats.total_sales || 0),
      revenue: parseFloat(stats.revenue_last_12_months || 0),

      // Additional info
      status: affiliate.status,
      paypalEmail: affiliate.paypal_email,
      websiteUrl: affiliate.website_url,
      companyName: affiliate.company_name,

      // Earnings history for chart
      earningsHistory: monthlyEarnings,

      // Last activity
      lastActivityAt: stats.last_activity_at
    };

    res.json(response);

  } catch (error) {
    console.error('Stats API error:', error);
    res.status(500).json({
      error: 'Failed to fetch stats',
      message: error.message
    });
  }
});

/**
 * GET /api/affiliate/dashboard-summary
 * Get summary stats for all affiliates (admin only)
 */
router.get('/dashboard-summary', async (req, res) => {
  try {
    // This would require admin authentication in production
    const { data: allStats, error } = await supabase
      .from('affiliate_stats')
      .select('*')
      .order('revenue_last_12_months', { ascending: false });

    if (error) {
      throw error;
    }

    const summary = {
      totalAffiliates: allStats.length,
      totalImpressions: allStats.reduce((sum, s) => sum + (s.impressions || 0), 0),
      totalClicks: allStats.reduce((sum, s) => sum + (s.clicks || 0), 0),
      totalSignups: allStats.reduce((sum, s) => sum + (s.signups || 0), 0),
      totalRevenue: allStats.reduce((sum, s) => sum + parseFloat(s.revenue_last_12_months || 0), 0),
      topAffiliates: allStats.slice(0, 10).map(a => ({
        code: a.affiliate_code,
        revenue: parseFloat(a.revenue_last_12_months || 0),
        signups: a.signups
      }))
    };

    res.json(summary);

  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router;
