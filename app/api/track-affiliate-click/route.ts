import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { trackEvent } from '@/lib/posthog';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, location, city, url, timestamp } = body;

    if (!provider || !location || !url) {
      return NextResponse.json(
        { error: 'Missing required fields: provider, location, url' },
        { status: 400 }
      );
    }

    // Generate user ID (from session or anonymous)
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Track with PostHog
    await trackEvent(userId, 'affiliate_click', {
      provider,
      location,
      city,
      url,
      timestamp,
      user_agent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer'),
    });

    // Store in Supabase
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data, error } = await supabase
        .from('affiliate_clicks')
        .insert([
          {
            user_id: userId,
            provider,
            location,
            city,
            url,
            clicked_at: timestamp || new Date().toISOString(),
            user_agent: request.headers.get('user-agent'),
            referrer: request.headers.get('referer'),
          },
        ])
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        // Don't fail the request if Supabase fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Click tracked successfully',
    });
  } catch (error) {
    console.error('Track affiliate click error:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}
