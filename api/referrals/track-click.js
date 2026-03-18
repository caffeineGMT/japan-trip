// API endpoint: POST /api/referrals/track-click
// Track when someone clicks a referral link

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { referralCode, metadata } = req.body;

    if (!referralCode) {
      return res.status(400).json({ error: 'Referral code required' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify referral code exists and get referrer
    const { data: codeData, error: codeError } = await supabase
      .from('referral_codes')
      .select('user_id')
      .eq('code', referralCode.toUpperCase())
      .single();

    if (codeError || !codeData) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    // Extract metadata from request
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Track the click
    const { data: referral, error: trackError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: codeData.user_id,
        referral_code: referralCode.toUpperCase(),
        ip_address: ipAddress,
        user_agent: userAgent,
        utm_source: metadata?.utm_source,
        utm_medium: metadata?.utm_medium,
        utm_campaign: metadata?.utm_campaign
      })
      .select()
      .single();

    if (trackError) {
      console.error('Error tracking referral click:', trackError);
      return res.status(500).json({ error: 'Failed to track referral' });
    }

    // Store referral code in session/cookie for later signup
    // The frontend will handle this via localStorage

    return res.status(200).json({
      success: true,
      referralId: referral.id,
      message: 'Referral tracked successfully'
    });

  } catch (error) {
    console.error('Error in track-click:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
