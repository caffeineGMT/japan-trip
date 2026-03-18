-- Share and Referral System
-- Migration 004: Add trip sharing and referral tracking tables

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trips shared table (short links for viral sharing)
CREATE TABLE IF NOT EXISTS public.trips_shared (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL, -- Reference to user's trip data
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  short_code TEXT NOT NULL UNIQUE,

  -- Analytics
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_viewed_at TIMESTAMP WITH TIME ZONE,

  -- Status
  is_active BOOLEAN DEFAULT TRUE
);

-- Referral tracking table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Referral source
  source TEXT DEFAULT 'share_link', -- 'share_link', 'direct_invite', 'social_media'
  short_code TEXT REFERENCES public.trips_shared(short_code) ON DELETE SET NULL,

  -- Reward status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  reward_type TEXT, -- 'premium_month', 'template_unlock', 'credit'

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE, -- When referred user signs up
  rewarded_at TIMESTAMP WITH TIME ZONE, -- When referrer gets reward

  UNIQUE(referrer_id, referred_user_id)
);

-- Referral rewards tracking (cumulative rewards per user)
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Reward counters
  total_referrals INTEGER DEFAULT 0,
  completed_referrals INTEGER DEFAULT 0,
  pending_referrals INTEGER DEFAULT 0,

  -- Premium rewards
  premium_months_earned INTEGER DEFAULT 0,
  premium_until TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Share analytics (track individual share events)
CREATE TABLE IF NOT EXISTS public.share_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_code TEXT NOT NULL REFERENCES public.trips_shared(short_code) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'twitter', 'facebook', 'whatsapp', 'copy_link', 'email'

  -- User context
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_agent TEXT,
  referrer TEXT,

  -- Timestamps
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_shared_short_code ON public.trips_shared(short_code);
CREATE INDEX IF NOT EXISTS idx_trips_shared_user_id ON public.trips_shared(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_shared_created_at ON public.trips_shared(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_short_code ON public.referrals(short_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_user_id ON public.referral_rewards(user_id);

CREATE INDEX IF NOT EXISTS idx_share_events_short_code ON public.share_events(short_code);
CREATE INDEX IF NOT EXISTS idx_share_events_platform ON public.share_events(platform);
CREATE INDEX IF NOT EXISTS idx_share_events_shared_at ON public.share_events(shared_at DESC);

-- Row Level Security (RLS)
ALTER TABLE public.trips_shared ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_events ENABLE ROW LEVEL SECURITY;

-- Trips shared policies
CREATE POLICY "Service role full access to trips_shared"
  ON public.trips_shared FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can read own shared trips"
  ON public.trips_shared FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create shared trips"
  ON public.trips_shared FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shared trips"
  ON public.trips_shared FOR UPDATE
  USING (auth.uid() = user_id);

-- Referrals policies
CREATE POLICY "Service role full access to referrals"
  ON public.referrals FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can read own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

-- Referral rewards policies
CREATE POLICY "Service role full access to referral_rewards"
  ON public.referral_rewards FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can read own referral rewards"
  ON public.referral_rewards FOR SELECT
  USING (auth.uid() = user_id);

-- Share events policies
CREATE POLICY "Service role full access to share_events"
  ON public.share_events FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger for updated_at on referral_rewards
CREATE TRIGGER update_referral_rewards_updated_at
  BEFORE UPDATE ON public.referral_rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check and grant referral rewards
CREATE OR REPLACE FUNCTION check_referral_rewards(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_completed_count INTEGER;
  v_current_rewards RECORD;
BEGIN
  -- Count completed referrals
  SELECT COUNT(*) INTO v_completed_count
  FROM public.referrals
  WHERE referrer_id = p_user_id AND status = 'completed';

  -- Get current rewards record or create one
  INSERT INTO public.referral_rewards (user_id, completed_referrals)
  VALUES (p_user_id, v_completed_count)
  ON CONFLICT (user_id) DO UPDATE SET
    completed_referrals = v_completed_count,
    updated_at = NOW()
  RETURNING * INTO v_current_rewards;

  -- Grant premium month for every 3 completed referrals
  IF v_completed_count > 0 AND v_completed_count % 3 = 0 THEN
    -- Calculate premium months earned
    DECLARE
      v_months_earned INTEGER := v_completed_count / 3;
      v_new_premium_until TIMESTAMP WITH TIME ZONE;
    BEGIN
      -- Calculate new premium expiration
      IF v_current_rewards.premium_until IS NULL OR v_current_rewards.premium_until < NOW() THEN
        v_new_premium_until := NOW() + (v_months_earned || ' months')::INTERVAL;
      ELSE
        v_new_premium_until := v_current_rewards.premium_until + (v_months_earned - v_current_rewards.premium_months_earned || ' months')::INTERVAL;
      END IF;

      -- Update rewards and user premium status
      UPDATE public.referral_rewards
      SET
        premium_months_earned = v_months_earned,
        premium_until = v_new_premium_until,
        updated_at = NOW()
      WHERE user_id = p_user_id;

      -- Update user table with premium status
      UPDATE public.users
      SET
        subscription_status = 'active',
        updated_at = NOW()
      WHERE id = p_user_id;

      -- Mark referrals as rewarded
      UPDATE public.referrals
      SET
        status = 'rewarded',
        rewarded_at = NOW()
      WHERE referrer_id = p_user_id AND status = 'completed';
    END;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE public.trips_shared IS 'Short links for viral trip sharing with analytics tracking';
COMMENT ON TABLE public.referrals IS 'Referral tracking: users earn premium access for successful referrals (3 signups = 1 month premium)';
COMMENT ON TABLE public.referral_rewards IS 'Cumulative referral rewards per user';
COMMENT ON TABLE public.share_events IS 'Individual share event tracking for analytics (platform breakdown)';
COMMENT ON FUNCTION check_referral_rewards IS 'Check referral count and auto-grant premium rewards (1 month per 3 completed referrals)';
