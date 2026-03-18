// API endpoint: POST /api/referrals/generate-code
// Generate or retrieve user's unique referral code

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const baseUrl = process.env.BASE_URL || 'https://trip.to';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client with user's token
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false
      }
    });

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    // Check if user already has a referral code
    const { data: existingCode } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('user_id', user.id)
      .single();

    if (existingCode) {
      return res.status(200).json({
        success: true,
        code: existingCode.code,
        referralUrl: `${baseUrl}/ref/${existingCode.code}`,
        shareUrl: `${baseUrl}/share?ref=${existingCode.code}`
      });
    }

    // Generate new code using database function
    const { data: newCode, error: generateError } = await supabase
      .rpc('create_user_referral_code', { p_user_id: user.id });

    if (generateError) {
      console.error('Error generating referral code:', generateError);
      return res.status(500).json({ error: 'Failed to generate referral code' });
    }

    return res.status(200).json({
      success: true,
      code: newCode,
      referralUrl: `${baseUrl}/ref/${newCode}`,
      shareUrl: `${baseUrl}/share?ref=${newCode}`,
      newlyCreated: true
    });

  } catch (error) {
    console.error('Error in generate-code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
