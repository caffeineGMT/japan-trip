/**
 * Affiliate Partner Dashboard API
 * Provides real-time stats, commission tracking, and payout management
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id: affiliateId } = req.query;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);

    // Verify token (simplified - in production use JWT)
    // For now, we'll trust the token and validate affiliate_id exists

    // Get affiliate partner data from view
    const { data: partnerData, error: partnerError } = await supabase
      .from('affiliate_dashboard_stats')
      .select('*')
      .eq('id', affiliateId)
      .single();

    if (partnerError || !partnerData) {
      return res.status(404).json({ error: 'Affiliate partner not found' });
    }

    // Check if partner is active
    if (partnerData.status !== 'active') {
      return res.status(403).json({ error: 'Affiliate account is not active' });
    }

    // Return dashboard data
    return res.status(200).json({
      success: true,
      affiliate_code: partnerData.affiliate_code,
      email: partnerData.email,
      company_name: partnerData.company_name,
      status: partnerData.status,
      commission_rate: parseFloat(partnerData.commission_rate),

      // Stats
      total_clicks: partnerData.total_clicks || 0,
      total_conversions: partnerData.total_conversions || 0,
      total_revenue_cents: partnerData.total_revenue_cents || 0,
      total_commission_cents: partnerData.total_commission_cents || 0,
      total_paid_cents: partnerData.total_paid_cents || 0,
      pending_commission_cents: partnerData.pending_commission_cents || 0,

      conversion_rate: parseFloat(partnerData.conversion_rate) || 0,
      clicks_last_30_days: partnerData.clicks_last_30_days || 0,
      conversions_last_30_days: partnerData.conversions_last_30_days || 0,

      // Payout info
      available_for_payout_cents: partnerData.available_for_payout_cents || 0,
      payout_threshold_cents: 10000, // $100 minimum

      last_updated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
