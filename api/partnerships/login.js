/**
 * Affiliate Partner Login API
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Get affiliate partner by email
    const { data: partner, error: partnerError } = await supabase
      .from('affiliate_partners')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (partnerError || !partner) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, partner.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (partner.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: partner.status === 'pending'
          ? 'Your account is pending approval. You will be notified when approved.'
          : 'Your account has been suspended. Please contact support.'
      });
    }

    // Generate session token (simplified - in production use JWT)
    const token = Buffer.from(`${partner.id}:${Date.now()}`).toString('base64');

    return res.status(200).json({
      success: true,
      affiliate_id: partner.id,
      token: token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
