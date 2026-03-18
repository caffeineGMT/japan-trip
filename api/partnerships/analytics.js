/**
 * Affiliate Analytics API
 * Provides time-series data for clicks, conversions, and earnings
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id: affiliateId, days = '30' } = req.query;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const daysInt = parseInt(days);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysInt);

    // Get daily clicks
    const { data: clicksData, error: clicksError } = await supabase
      .from('affiliate_clicks')
      .select('clicked_at')
      .eq('affiliate_id', affiliateId)
      .gte('clicked_at', startDate.toISOString());

    if (clicksError) throw clicksError;

    // Get daily conversions
    const { data: conversionsData, error: conversionsError } = await supabase
      .from('affiliate_conversions')
      .select('converted_at, commission_amount_cents, status')
      .eq('affiliate_id', affiliateId)
      .gte('converted_at', startDate.toISOString());

    if (conversionsError) throw conversionsError;

    // Aggregate by day
    const analytics = [];
    for (let i = 0; i < daysInt; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (daysInt - 1 - i));
      const dateStr = date.toISOString().split('T')[0];

      const dayClicks = clicksData.filter(c =>
        c.clicked_at.startsWith(dateStr)
      ).length;

      const dayConversions = conversionsData.filter(c =>
        c.converted_at.startsWith(dateStr)
      );

      const dayEarnings = dayConversions
        .filter(c => c.status === 'approved' || c.status === 'pending')
        .reduce((sum, c) => sum + (c.commission_amount_cents || 0), 0);

      analytics.push({
        date: dateStr,
        clicks: dayClicks,
        conversions: dayConversions.length,
        earnings_cents: dayEarnings
      });
    }

    return res.status(200).json({
      success: true,
      analytics,
      period_days: daysInt
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
