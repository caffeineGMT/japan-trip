-- White-Label Multi-Tenant Schema
-- Migration 003: Add tenant management tables

-- Tenants table (agencies/white-label partners)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  custom_domain TEXT UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('starter', 'growth', 'enterprise')),

  -- Branding configuration
  brand_colors JSONB DEFAULT '{
    "primary": "#4f46e5",
    "secondary": "#7c3aed",
    "accent": "#db2777"
  }'::jsonb,
  logo_url TEXT,
  custom_css TEXT,

  -- Stripe subscription
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing')),

  -- Contact info
  contact_email TEXT NOT NULL,
  contact_name TEXT,

  -- Usage limits based on tier
  max_monthly_users INTEGER NOT NULL DEFAULT 100,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_ends_at TIMESTAMP WITH TIME ZONE,

  -- Status
  is_active BOOLEAN DEFAULT TRUE
);

-- Tenant users (many-to-many: users can belong to multiple tenants)
CREATE TABLE IF NOT EXISTS public.tenant_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Tenant analytics (daily aggregated metrics)
CREATE TABLE IF NOT EXISTS public.tenant_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- User metrics
  active_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,

  -- Trip metrics
  trips_created INTEGER DEFAULT 0,
  trips_viewed INTEGER DEFAULT 0,

  -- Booking metrics
  booking_clicks INTEGER DEFAULT 0,
  estimated_commission_cents INTEGER DEFAULT 0,

  -- Calculated at end of day
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(tenant_id, date)
);

-- Affiliate tracking with tenant attribution
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Affiliate details
  provider TEXT NOT NULL, -- 'booking', 'getyourguide', 'jrpass'
  destination_url TEXT NOT NULL,
  affiliate_id TEXT,

  -- Tracking
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT,

  -- Commission tracking (estimated)
  estimated_commission_cents INTEGER DEFAULT 0,
  conversion_tracked BOOLEAN DEFAULT FALSE
);

-- Tenant API keys (for enterprise tier)
CREATE TABLE IF NOT EXISTS public.tenant_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  api_key_hash TEXT NOT NULL UNIQUE,
  api_key_prefix TEXT NOT NULL, -- First 8 chars for display

  -- Permissions
  scopes TEXT[] DEFAULT ARRAY['read'],

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON public.tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain ON public.tenants(custom_domain);
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_subscription ON public.tenants(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON public.tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON public.tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_analytics_tenant_date ON public.tenant_analytics(tenant_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_tenant_id ON public.affiliate_clicks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_clicked_at ON public.affiliate_clicks(clicked_at DESC);

-- Row Level Security (RLS)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Tenant policies
-- Service role has full access
CREATE POLICY "Service role full access to tenants"
  ON public.tenants FOR ALL
  USING (auth.role() = 'service_role');

-- Tenant admins can read their own tenant
CREATE POLICY "Tenant admins can read own tenant"
  ON public.tenants FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Tenant admins can update their own tenant
CREATE POLICY "Tenant admins can update own tenant"
  ON public.tenants FOR UPDATE
  USING (
    id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Tenant users policies
CREATE POLICY "Service role full access to tenant_users"
  ON public.tenant_users FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can read tenant memberships"
  ON public.tenant_users FOR SELECT
  USING (user_id = auth.uid() OR tenant_id IN (
    SELECT tenant_id FROM public.tenant_users
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Tenant analytics policies
CREATE POLICY "Service role full access to analytics"
  ON public.tenant_analytics FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Tenant admins can read analytics"
  ON public.tenant_analytics FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Affiliate clicks policies
CREATE POLICY "Service role full access to affiliate_clicks"
  ON public.affiliate_clicks FOR ALL
  USING (auth.role() = 'service_role');

-- API keys policies
CREATE POLICY "Service role full access to api_keys"
  ON public.tenant_api_keys FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Tenant admins can manage api_keys"
  ON public.tenant_api_keys FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed pricing tiers (reference data)
COMMENT ON TABLE public.tenants IS 'White-label agency partners with tier-based pricing: Starter $499/mo (100 users, subdomain, remove branding), Growth $999/mo (500 users, custom logo/colors), Enterprise $2499/mo (unlimited users, API access, custom domain)';
COMMENT ON TABLE public.tenant_analytics IS 'Daily aggregated metrics per tenant for dashboard analytics';
COMMENT ON TABLE public.affiliate_clicks IS 'Track affiliate link clicks with tenant attribution for commission reporting';
COMMENT ON TABLE public.tenant_api_keys IS 'API keys for enterprise tier tenants to access white-label API';

-- Function to aggregate daily analytics
CREATE OR REPLACE FUNCTION aggregate_daily_tenant_analytics(target_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS void AS $$
BEGIN
  INSERT INTO public.tenant_analytics (tenant_id, date, active_users, trips_created, booking_clicks, estimated_commission_cents)
  SELECT
    t.id as tenant_id,
    target_date as date,
    COUNT(DISTINCT tu.user_id) as active_users,
    0 as trips_created, -- TODO: Track from user activity
    COUNT(DISTINCT ac.id) as booking_clicks,
    COALESCE(SUM(ac.estimated_commission_cents), 0) as estimated_commission_cents
  FROM public.tenants t
  LEFT JOIN public.tenant_users tu ON t.id = tu.tenant_id
  LEFT JOIN public.affiliate_clicks ac ON t.id = ac.tenant_id
    AND DATE(ac.clicked_at) = target_date
  WHERE t.is_active = TRUE
  GROUP BY t.id
  ON CONFLICT (tenant_id, date) DO UPDATE SET
    active_users = EXCLUDED.active_users,
    trips_created = EXCLUDED.trips_created,
    booking_clicks = EXCLUDED.booking_clicks,
    estimated_commission_cents = EXCLUDED.estimated_commission_cents;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION aggregate_daily_tenant_analytics IS 'Run daily to aggregate tenant metrics for analytics dashboard';
