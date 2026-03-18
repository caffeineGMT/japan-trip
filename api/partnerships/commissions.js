/**
 * Affiliate Commissions API
 * Lists all commissions for a partner with pagination
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
    const { id: affiliateId, limit = '50', offset = '0' } = req.query;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limitInt = parseInt(limit);
    const offsetInt = parseInt(offset);

    // Get commissions
    const { data: commissions, error: commissionsError } = await supabase
      .from('affiliate_conversions')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('converted_at', { ascending: false })
      .range(offsetInt, offsetInt + limitInt - 1);

    if (commissionsError) throw commissionsError;

    // Get total count
    const { count, error: countError } = await supabase
      .from('affiliate_conversions')
      .select('*', { count: 'exact', head: true })
      .eq('affiliate_id', affiliateId);

    if (countError) throw countError;

    return res.status(200).json({
      success: true,
      commissions: commissions || [],
      total: count || 0,
      limit: limitInt,
      offset: offsetInt
    });

  } catch (error) {
    console.error('Commissions API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
