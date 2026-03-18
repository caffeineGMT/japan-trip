/**
 * Marketing Materials API
 * Provides banners, links, and promotional content for affiliates
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get active marketing materials
    const { data: materials, error: materialsError } = await supabase
      .from('affiliate_materials')
      .select('*')
      .eq('active', true)
      .order('performance_score', { ascending: false });

    if (materialsError) throw materialsError;

    // If no materials in database, return default set
    if (!materials || materials.length === 0) {
      const defaultMaterials = [
        {
          id: 'banner-728x90',
          name: 'Leaderboard Banner',
          type: 'banner',
          category: 'japan',
          title: 'Plan Your Perfect Japan Trip',
          description: 'Cherry blossom season special - 728x90 banner',
          image_url: 'https://placehold.co/728x90/ef4444/ffffff?text=Japan+Trip+Companion',
          dimensions: '728x90',
          usage_count: 0,
          performance_score: 0,
          active: true
        },
        {
          id: 'banner-300x250',
          name: 'Medium Rectangle',
          type: 'banner',
          category: 'japan',
          title: 'Japan Cherry Blossom Trip',
          description: '300x250 medium rectangle banner',
          image_url: 'https://placehold.co/300x250/ef4444/ffffff?text=Japan+Trip',
          dimensions: '300x250',
          usage_count: 0,
          performance_score: 0,
          active: true
        },
        {
          id: 'banner-160x600',
          name: 'Skyscraper Banner',
          type: 'banner',
          category: 'kyoto',
          title: 'Explore Kyoto',
          description: '160x600 wide skyscraper',
          image_url: 'https://placehold.co/160x600/ef4444/ffffff?text=Kyoto',
          dimensions: '160x600',
          usage_count: 0,
          performance_score: 0,
          active: true
        },
        {
          id: 'text-link-1',
          name: 'Primary Text Link',
          type: 'text_link',
          category: 'japan',
          title: 'Plan your dream Japan trip with our complete guide',
          description: 'Main call-to-action text link',
          html_code: null,
          image_url: null,
          dimensions: null,
          usage_count: 0,
          performance_score: 0,
          active: true
        },
        {
          id: 'text-link-2',
          name: 'Cherry Blossom Link',
          type: 'text_link',
          category: 'cherry_blossom',
          title: 'See Japan's cherry blossoms - complete travel guide',
          description: 'Seasonal cherry blossom link',
          html_code: null,
          image_url: null,
          dimensions: null,
          usage_count: 0,
          performance_score: 0,
          active: true
        },
        {
          id: 'text-link-3',
          name: 'Kyoto Food Tour',
          type: 'text_link',
          category: 'kyoto',
          title: 'Ultimate Kyoto food and culture experience',
          description: 'Kyoto-specific link',
          html_code: null,
          image_url: null,
          dimensions: null,
          usage_count: 0,
          performance_score: 0,
          active: true
        }
      ];

      return res.status(200).json({
        success: true,
        materials: defaultMaterials
      });
    }

    return res.status(200).json({
      success: true,
      materials
    });

  } catch (error) {
    console.error('Materials API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
