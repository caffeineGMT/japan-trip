-- Affiliate Partner System Database Schema
-- Professional affiliate program for bloggers, influencers, and content creators

-- Affiliate partners table
CREATE TABLE IF NOT EXISTS public.affiliate_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,

  -- Partner info
  company_name TEXT,
  website_url TEXT,
  promotional_method TEXT, -- 'blog', 'youtube', 'instagram', 'twitter', 'email', 'paid_ads'

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'suspended', 'terminated'
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,

  -- Commission settings
  commission_rate DECIMAL DEFAULT 0.20, -- 20% default commission
  cookie_duration_days INTEGER DEFAULT 30,

  -- Payout settings
  payout_method TEXT DEFAULT 'paypal', -- 'paypal', 'stripe', 'wire'
  payout_email TEXT,
  payout_threshold_cents INTEGER DEFAULT 10000, -- $100 minimum payout
  tax_id TEXT,

  -- Tracking
  affiliate_code TEXT NOT NULL UNIQUE,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_revenue_cents INTEGER DEFAULT 0,
  total_commission_cents INTEGER DEFAULT 0,
  total_paid_cents INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate clicks table (detailed click tracking)
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,

  -- Click data
  ip_address TEXT,
  user_agent TEXT,
  referrer_url TEXT,
  landing_page TEXT,

  -- UTM parameters
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,

  -- Tracking
  session_id TEXT,
  converted BOOLEAN DEFAULT FALSE,
  conversion_id UUID,

  -- Geolocation (optional)
  country TEXT,
  city TEXT,

  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate conversions table
CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  click_id UUID REFERENCES public.affiliate_clicks(id) ON DELETE SET NULL,

  -- Conversion data
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  order_id TEXT,
  product_type TEXT, -- 'template', 'subscription'
  product_id TEXT,

  -- Revenue
  order_amount_cents INTEGER NOT NULL,
  commission_rate DECIMAL NOT NULL,
  commission_amount_cents INTEGER NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'refunded'
  approved_at TIMESTAMP WITH TIME ZONE,

  -- Payout
  payout_id UUID,
  paid_at TIMESTAMP WITH TIME ZONE,

  converted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate payouts table
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,

  -- Payout details
  amount_cents INTEGER NOT NULL,
  commission_count INTEGER NOT NULL, -- Number of commissions included
  payout_method TEXT NOT NULL,
  payout_email TEXT NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'

  -- Payment processor details
  processor TEXT, -- 'paypal', 'stripe'
  transaction_id TEXT,
  error_message TEXT,

  -- Dates
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate marketing materials table
CREATE TABLE IF NOT EXISTS public.affiliate_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Material info
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'banner', 'text_link', 'landing_page', 'email_template'
  category TEXT, -- 'japan', 'cherry_blossom', 'kyoto', 'tokyo'

  -- Content
  title TEXT,
  description TEXT,
  html_code TEXT,
  image_url TEXT,
  dimensions TEXT, -- '300x250', '728x90', etc.

  -- Stats
  usage_count INTEGER DEFAULT 0,
  performance_score DECIMAL DEFAULT 0,

  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_code ON public.affiliate_partners(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_email ON public.affiliate_partners(email);
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_status ON public.affiliate_partners(status);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON public.affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_session_id ON public.affiliate_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_clicked_at ON public.affiliate_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_converted ON public.affiliate_clicks(converted);

CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_affiliate_id ON public.affiliate_conversions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_status ON public.affiliate_conversions(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_payout_id ON public.affiliate_conversions(payout_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_converted_at ON public.affiliate_conversions(converted_at);

CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_id ON public.affiliate_payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_status ON public.affiliate_payouts(status);

-- Enable RLS
ALTER TABLE public.affiliate_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_materials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_partners
CREATE POLICY "Partners can read own data"
  ON public.affiliate_partners
  FOR SELECT
  USING (id = current_setting('app.current_affiliate_id', true)::UUID);

CREATE POLICY "Partners can update own data"
  ON public.affiliate_partners
  FOR UPDATE
  USING (id = current_setting('app.current_affiliate_id', true)::UUID);

CREATE POLICY "Service role full access to partners"
  ON public.affiliate_partners
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for affiliate_clicks
CREATE POLICY "Partners can read own clicks"
  ON public.affiliate_clicks
  FOR SELECT
  USING (affiliate_id = current_setting('app.current_affiliate_id', true)::UUID);

CREATE POLICY "Service role full access to clicks"
  ON public.affiliate_clicks
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for affiliate_conversions
CREATE POLICY "Partners can read own conversions"
  ON public.affiliate_conversions
  FOR SELECT
  USING (affiliate_id = current_setting('app.current_affiliate_id', true)::UUID);

CREATE POLICY "Service role full access to conversions"
  ON public.affiliate_conversions
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for affiliate_payouts
CREATE POLICY "Partners can read own payouts"
  ON public.affiliate_payouts
  FOR SELECT
  USING (affiliate_id = current_setting('app.current_affiliate_id', true)::UUID);

CREATE POLICY "Service role full access to payouts"
  ON public.affiliate_payouts
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for affiliate_materials
CREATE POLICY "Anyone can read active materials"
  ON public.affiliate_materials
  FOR SELECT
  USING (active = true);

CREATE POLICY "Service role full access to materials"
  ON public.affiliate_materials
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to generate unique affiliate code
CREATE OR REPLACE FUNCTION generate_affiliate_code(p_email TEXT)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
  v_base TEXT;
BEGIN
  -- Create base from email (first part before @)
  v_base := UPPER(REGEXP_REPLACE(SPLIT_PART(p_email, '@', 1), '[^A-Za-z0-9]', '', 'g'));
  v_base := SUBSTRING(v_base FROM 1 FOR 6);

  -- Try base + random suffix
  LOOP
    v_code := v_base || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM public.affiliate_partners WHERE affiliate_code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;

  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Function to track affiliate click
CREATE OR REPLACE FUNCTION track_affiliate_click(
  p_affiliate_code TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT,
  p_referrer_url TEXT,
  p_landing_page TEXT,
  p_utm_source TEXT DEFAULT NULL,
  p_utm_medium TEXT DEFAULT NULL,
  p_utm_campaign TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_affiliate_id UUID;
  v_click_id UUID;
BEGIN
  -- Get affiliate ID
  SELECT id INTO v_affiliate_id
  FROM public.affiliate_partners
  WHERE affiliate_code = p_affiliate_code AND status = 'active';

  IF v_affiliate_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or inactive affiliate code';
  END IF;

  -- Insert click
  INSERT INTO public.affiliate_clicks (
    affiliate_id, ip_address, user_agent, referrer_url, landing_page,
    utm_source, utm_medium, utm_campaign, session_id
  )
  VALUES (
    v_affiliate_id, p_ip_address, p_user_agent, p_referrer_url, p_landing_page,
    p_utm_source, p_utm_medium, p_utm_campaign, 'sess_' || gen_random_uuid()::TEXT
  )
  RETURNING id INTO v_click_id;

  -- Update partner stats
  UPDATE public.affiliate_partners
  SET total_clicks = total_clicks + 1
  WHERE id = v_affiliate_id;

  RETURN v_click_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record affiliate conversion
CREATE OR REPLACE FUNCTION record_affiliate_conversion(
  p_click_id UUID,
  p_user_id UUID,
  p_order_amount_cents INTEGER,
  p_product_type TEXT,
  p_product_id TEXT
)
RETURNS UUID AS $$
DECLARE
  v_affiliate_id UUID;
  v_commission_rate DECIMAL;
  v_commission_cents INTEGER;
  v_conversion_id UUID;
BEGIN
  -- Get affiliate info from click
  SELECT affiliate_id, ap.commission_rate INTO v_affiliate_id, v_commission_rate
  FROM public.affiliate_clicks ac
  JOIN public.affiliate_partners ap ON ac.affiliate_id = ap.id
  WHERE ac.id = p_click_id;

  IF v_affiliate_id IS NULL THEN
    RAISE EXCEPTION 'Invalid click ID';
  END IF;

  -- Calculate commission
  v_commission_cents := FLOOR(p_order_amount_cents * v_commission_rate);

  -- Insert conversion
  INSERT INTO public.affiliate_conversions (
    affiliate_id, click_id, user_id, order_amount_cents,
    commission_rate, commission_amount_cents, product_type, product_id
  )
  VALUES (
    v_affiliate_id, p_click_id, p_user_id, p_order_amount_cents,
    v_commission_rate, v_commission_cents, p_product_type, p_product_id
  )
  RETURNING id INTO v_conversion_id;

  -- Update click as converted
  UPDATE public.affiliate_clicks
  SET converted = TRUE, conversion_id = v_conversion_id
  WHERE id = p_click_id;

  -- Update partner stats
  UPDATE public.affiliate_partners
  SET
    total_conversions = total_conversions + 1,
    total_revenue_cents = total_revenue_cents + p_order_amount_cents,
    total_commission_cents = total_commission_cents + v_commission_cents
  WHERE id = v_affiliate_id;

  RETURN v_conversion_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for affiliate dashboard stats
CREATE OR REPLACE VIEW public.affiliate_dashboard_stats AS
SELECT
  ap.id,
  ap.email,
  ap.company_name,
  ap.affiliate_code,
  ap.status,
  ap.commission_rate,
  ap.total_clicks,
  ap.total_conversions,
  ap.total_revenue_cents,
  ap.total_commission_cents,
  ap.total_paid_cents,
  (ap.total_commission_cents - ap.total_paid_cents) as pending_commission_cents,
  CASE WHEN ap.total_clicks > 0 THEN
    ROUND((ap.total_conversions::DECIMAL / ap.total_clicks) * 100, 2)
  ELSE 0 END as conversion_rate,
  (
    SELECT COUNT(*) FROM public.affiliate_clicks
    WHERE affiliate_id = ap.id AND clicked_at >= NOW() - INTERVAL '30 days'
  ) as clicks_last_30_days,
  (
    SELECT COUNT(*) FROM public.affiliate_conversions
    WHERE affiliate_id = ap.id AND converted_at >= NOW() - INTERVAL '30 days'
  ) as conversions_last_30_days,
  (
    SELECT COALESCE(SUM(commission_amount_cents), 0) FROM public.affiliate_conversions
    WHERE affiliate_id = ap.id
      AND status = 'approved'
      AND payout_id IS NULL
  ) as available_for_payout_cents
FROM public.affiliate_partners ap;

COMMENT ON TABLE public.affiliate_partners IS 'Professional affiliate partners (bloggers, influencers, marketers)';
COMMENT ON TABLE public.affiliate_clicks IS 'Detailed tracking of all affiliate clicks';
COMMENT ON TABLE public.affiliate_conversions IS 'Conversions attributed to affiliate partners with commission tracking';
COMMENT ON TABLE public.affiliate_payouts IS 'Payout history for affiliate commissions';
COMMENT ON TABLE public.affiliate_materials IS 'Marketing materials (banners, links) for affiliates';
