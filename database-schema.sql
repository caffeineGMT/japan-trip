-- Supabase Database Schema for Japan Trip App
-- Run this in the Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'inactive', -- active, canceled, past_due, inactive
  subscription_tier TEXT DEFAULT 'free', -- free, premium
  subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table (available itinerary templates)
CREATE TABLE IF NOT EXISTS public.templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price in cents
  is_premium BOOLEAN DEFAULT FALSE,
  days INTEGER NOT NULL,
  destinations TEXT[], -- Array of destination names
  features JSONB, -- Template-specific features
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User templates (purchased templates)
CREATE TABLE IF NOT EXISTS public.user_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_templates_user_id ON public.user_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_templates_template_id ON public.user_templates(template_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_templates ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Service role can do everything (for backend operations)
CREATE POLICY "Service role full access to users"
  ON public.users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Templates table policies
-- Everyone can read templates (to browse available options)
CREATE POLICY "Anyone can read templates"
  ON public.templates
  FOR SELECT
  TO public
  USING (true);

-- Only service role can modify templates
CREATE POLICY "Service role full access to templates"
  ON public.templates
  FOR ALL
  USING (auth.role() = 'service_role');

-- User templates policies
-- Users can read their own purchases
CREATE POLICY "Users can read own templates"
  ON public.user_templates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can create/modify user templates (via backend)
CREATE POLICY "Service role full access to user_templates"
  ON public.user_templates
  FOR ALL
  USING (auth.role() = 'service_role');

-- Insert default templates
INSERT INTO public.templates (id, name, description, price, days, destinations, features) VALUES
  ('japan-demo', 'Japan Demo (Free)', 'Free 3-day Tokyo preview', 0, 3, ARRAY['Tokyo'], '{"ai_optimizer": false, "offline_maps": false}'),
  ('japan-cherry-blossom', 'Japan Cherry Blossom', 'Complete 14-day cherry blossom itinerary for Tokyo, Kyoto, Osaka, and Nara', 2900, 14, ARRAY['Tokyo', 'Kyoto', 'Osaka', 'Nara'], '{"ai_optimizer": false, "offline_maps": true}'),
  ('kyoto-food-tour', 'Kyoto Food Tour', 'Ultimate 5-day Kyoto food and culture experience', 4900, 5, ARRAY['Kyoto'], '{"ai_optimizer": false, "offline_maps": true}'),
  ('full-japan-14day', 'Full Japan 14-Day', 'Premium all-inclusive 14-day Japan itinerary with AI optimization', 9900, 14, ARRAY['Tokyo', 'Kyoto', 'Osaka', 'Nara', 'Hakone', 'Nikko'], '{"ai_optimizer": true, "offline_maps": true}')
ON CONFLICT (id) DO NOTHING;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Analytics view (optional - for tracking purchases and subscriptions)
CREATE OR REPLACE VIEW public.analytics_summary AS
SELECT
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT CASE WHEN u.subscription_status = 'active' THEN u.id END) as active_subscribers,
  COUNT(ut.id) as total_template_purchases,
  SUM(t.price) as total_revenue_cents
FROM public.users u
LEFT JOIN public.user_templates ut ON u.id = ut.user_id
LEFT JOIN public.templates t ON ut.template_id = t.id;

COMMENT ON TABLE public.users IS 'User accounts with Stripe integration';
COMMENT ON TABLE public.templates IS 'Available itinerary templates for purchase';
COMMENT ON TABLE public.user_templates IS 'User-owned templates (purchases)';
COMMENT ON VIEW public.analytics_summary IS 'Summary analytics for revenue and user metrics';

-- ===== AI ASSISTANT TABLES =====

-- AI usage tracking (for rate limiting)
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL, -- optimize, recommend, edit, checklist
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cached BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI response cache (24h TTL)
CREATE TABLE IF NOT EXISTS public.ai_cache (
  cache_key TEXT PRIMARY KEY,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for AI tables
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON public.ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON public.ai_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_endpoint ON public.ai_usage(endpoint);
CREATE INDEX IF NOT EXISTS idx_ai_cache_created_at ON public.ai_cache(created_at);

-- Enable RLS on AI tables
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;

-- AI usage policies (users can read their own usage)
CREATE POLICY "Users can read own ai usage"
  ON public.ai_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access to ai_usage"
  ON public.ai_usage
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to ai_cache"
  ON public.ai_cache
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to clean up old cache entries (run daily)
CREATE OR REPLACE FUNCTION cleanup_ai_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.ai_cache
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.ai_usage IS 'AI API usage tracking for rate limiting';
COMMENT ON TABLE public.ai_cache IS 'Cached AI responses (24h TTL for cost optimization)';
COMMENT ON FUNCTION cleanup_ai_cache IS 'Removes AI cache entries older than 24 hours';
