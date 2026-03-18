-- Affiliate Partner System
-- Migration 005: Add affiliate program tables for embeddable widgets and partner dashboard

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add referral_id to users table to track who referred them
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS referral_id TEXT,
ADD COLUMN IF NOT EXISTS affiliate_signup_date TIMESTAMP WITH TIME ZONE;

-- Affiliates table (partner accounts with commission tracking)
CREATE TABLE IF NOT EXISTS public.affiliates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Affiliate identification
  affiliate_code TEXT NOT NULL UNIQUE, -- Unique referral code (e.g., "TRAVELBLOGGER")

  -- Commission and payout
  commission_rate DECIMAL(5,4) DEFAULT 0.2500, -- 25% commission default
  pending_payout DECIMAL(10,2) DEFAULT 0.00, -- Pending payout amount in USD
  total_earned DECIMAL(10,2) DEFAULT 0.00, -- All-time earnings

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),

  -- Marketing info
  website_url TEXT,
  company_name TEXT,
  bio TEXT,

  -- PayPal payout info
  paypal_email TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Affiliate clicks tracking (widget impressions and clicks)
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,

  -- Widget context
  trip_id TEXT, -- Which trip template was shown
  action_type TEXT NOT NULL CHECK (action_type IN ('impression', 'click', 'signup', 'purchase')),

  -- User context
  referrer TEXT, -- Referring page URL
  ip_address TEXT,
  user_agent TEXT,

  -- Conversion tracking
  converted_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  purchase_amount DECIMAL(10,2), -- For purchase events

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate payouts (payment history)
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,

  -- Payout details
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),

  -- PayPal transaction details
  paypal_batch_id TEXT,
  paypal_payout_id TEXT,
  paypal_status TEXT,

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliates_affiliate_code ON public.affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON public.affiliates(status);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON public.affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_action_type ON public.affiliate_clicks(action_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON public.affiliate_clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_converted_user_id ON public.affiliate_clicks(converted_user_id);

CREATE INDEX IF NOT EXISTS idx_payouts_affiliate_id ON public.payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created_at ON public.payouts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_referral_id ON public.users(referral_id);

-- Row Level Security (RLS)
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Affiliates policies
CREATE POLICY "Service role full access to affiliates"
  ON public.affiliates FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can read own affiliate account"
  ON public.affiliates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate account"
  ON public.affiliates FOR UPDATE
  USING (auth.uid() = user_id);

-- Affiliate clicks policies (service role only for tracking)
CREATE POLICY "Service role full access to affiliate_clicks"
  ON public.affiliate_clicks FOR ALL
  USING (auth.role() = 'service_role');

-- Payouts policies
CREATE POLICY "Service role full access to payouts"
  ON public.payouts FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Affiliates can read own payouts"
  ON public.payouts FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
  );

-- Trigger for updated_at on affiliates
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updated_at on payouts
CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON public.payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Materialized view for affiliate stats (refreshed hourly)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.affiliate_stats AS
SELECT
  a.id as affiliate_id,
  a.affiliate_code,
  a.user_id,

  -- Impressions and clicks
  COUNT(DISTINCT CASE WHEN ac.action_type = 'impression' THEN ac.id END) as impressions,
  COUNT(DISTINCT CASE WHEN ac.action_type = 'click' THEN ac.id END) as clicks,

  -- Signups and conversions
  COUNT(DISTINCT CASE WHEN ac.action_type = 'signup' THEN ac.converted_user_id END) as signups,
  COUNT(DISTINCT CASE WHEN ac.action_type = 'purchase' THEN ac.id END) as purchases,

  -- Revenue calculations
  COALESCE(SUM(CASE WHEN ac.action_type = 'purchase' THEN ac.purchase_amount END), 0) as total_sales,
  COALESCE(SUM(CASE
    WHEN ac.action_type = 'purchase' AND ac.created_at > NOW() - INTERVAL '12 months'
    THEN ac.purchase_amount * a.commission_rate
  END), 0) as revenue_last_12_months,

  -- Current balances
  a.pending_payout,
  a.total_earned,

  -- Last activity
  MAX(ac.created_at) as last_activity_at

FROM public.affiliates a
LEFT JOIN public.affiliate_clicks ac ON a.id = ac.affiliate_id
GROUP BY a.id, a.affiliate_code, a.user_id, a.pending_payout, a.total_earned;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliate_stats_affiliate_id ON public.affiliate_stats(affiliate_id);

-- Function to refresh affiliate stats (call this hourly via cron)
CREATE OR REPLACE FUNCTION refresh_affiliate_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.affiliate_stats;
END;
$$ LANGUAGE plpgsql;

-- Function to track affiliate conversion and update commission
CREATE OR REPLACE FUNCTION track_affiliate_conversion(
  p_affiliate_code TEXT,
  p_user_id UUID,
  p_purchase_amount DECIMAL
)
RETURNS void AS $$
DECLARE
  v_affiliate_id UUID;
  v_commission_rate DECIMAL;
  v_commission DECIMAL;
BEGIN
  -- Get affiliate ID and commission rate
  SELECT id, commission_rate INTO v_affiliate_id, v_commission_rate
  FROM public.affiliates
  WHERE affiliate_code = p_affiliate_code AND status = 'active';

  IF v_affiliate_id IS NULL THEN
    RETURN;
  END IF;

  -- Calculate commission
  v_commission := p_purchase_amount * v_commission_rate;

  -- Record the purchase click
  INSERT INTO public.affiliate_clicks (
    affiliate_id,
    action_type,
    converted_user_id,
    purchase_amount,
    created_at
  ) VALUES (
    v_affiliate_id,
    'purchase',
    p_user_id,
    p_purchase_amount,
    NOW()
  );

  -- Update affiliate balances
  UPDATE public.affiliates
  SET
    pending_payout = pending_payout + v_commission,
    total_earned = total_earned + v_commission,
    updated_at = NOW()
  WHERE id = v_affiliate_id;

END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE public.affiliates IS 'Affiliate partner accounts with commission tracking and payout info';
COMMENT ON TABLE public.affiliate_clicks IS 'Tracks widget impressions, clicks, signups, and purchases for commission attribution';
COMMENT ON TABLE public.payouts IS 'Affiliate payout history with PayPal integration';
COMMENT ON MATERIALIZED VIEW public.affiliate_stats IS 'Pre-computed affiliate stats (refreshed hourly) for partner dashboard';
COMMENT ON FUNCTION refresh_affiliate_stats IS 'Refresh the affiliate_stats materialized view - run hourly via cron';
COMMENT ON FUNCTION track_affiliate_conversion IS 'Track purchase conversion and calculate commission for affiliate';
