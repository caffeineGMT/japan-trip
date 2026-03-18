-- Referral System Database Schema Extension
-- Add this to your existing Supabase database

-- Referral codes table (unique codes for each user)
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Referrals table (track referral relationships and rewards)
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  referred_email TEXT,

  -- Tracking
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  signed_up_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE, -- When referred user made first payment

  -- Rewards
  discount_applied BOOLEAN DEFAULT FALSE,
  discount_amount INTEGER DEFAULT 1000, -- $10 in cents
  referrer_rewarded BOOLEAN DEFAULT FALSE,
  reward_type TEXT, -- 'month_free', 'lifetime_premium', etc.
  reward_granted_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral rewards table (track reward grants)
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL, -- 'month_free', 'lifetime_premium'
  referral_count INTEGER NOT NULL, -- How many referrals earned this
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  used BOOLEAN DEFAULT FALSE,

  -- Stripe integration
  stripe_coupon_id TEXT,
  stripe_promotion_code TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add referral stats to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS successful_referrals INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_earnings_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.users(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_converted_at ON public.referrals(converted_at);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user_id ON public.referral_rewards(user_id);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
CREATE POLICY "Users can read own referral code"
  ON public.referral_codes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral code"
  ON public.referral_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to referral_codes"
  ON public.referral_codes
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for referrals
CREATE POLICY "Users can read own referrals"
  ON public.referrals
  FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "Service role full access to referrals"
  ON public.referrals
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for referral_rewards
CREATE POLICY "Users can read own rewards"
  ON public.referral_rewards
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to referral_rewards"
  ON public.referral_rewards
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed ambiguous chars
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to create referral code for user
CREATE OR REPLACE FUNCTION create_user_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  -- Check if user already has a code
  SELECT code INTO v_code FROM public.referral_codes WHERE user_id = p_user_id;

  IF v_code IS NOT NULL THEN
    RETURN v_code;
  END IF;

  -- Generate unique code
  LOOP
    v_code := generate_referral_code();
    SELECT EXISTS(SELECT 1 FROM public.referral_codes WHERE code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;

  -- Insert code
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (p_user_id, v_code);

  RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and grant rewards
CREATE OR REPLACE FUNCTION check_and_grant_referral_rewards(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_converted_count INTEGER;
  v_total_referrals INTEGER;
  v_rewards_granted JSONB := '[]'::JSONB;
  v_new_reward JSONB;
BEGIN
  -- Count converted referrals (referred users who paid)
  SELECT COUNT(*) INTO v_converted_count
  FROM public.referrals
  WHERE referrer_id = p_user_id
    AND converted_at IS NOT NULL
    AND referrer_rewarded = FALSE;

  -- Count total referrals
  SELECT COUNT(*) INTO v_total_referrals
  FROM public.referrals
  WHERE referrer_id = p_user_id
    AND converted_at IS NOT NULL;

  -- Grant "3 referrals = 1 month free" reward
  IF v_converted_count >= 3 THEN
    -- Mark referrals as rewarded
    UPDATE public.referrals
    SET referrer_rewarded = TRUE,
        reward_type = 'month_free',
        reward_granted_at = NOW()
    WHERE referrer_id = p_user_id
      AND converted_at IS NOT NULL
      AND referrer_rewarded = FALSE
      AND id IN (
        SELECT id FROM public.referrals
        WHERE referrer_id = p_user_id
          AND converted_at IS NOT NULL
          AND referrer_rewarded = FALSE
        ORDER BY converted_at ASC
        LIMIT 3
      );

    -- Create reward record
    INSERT INTO public.referral_rewards (user_id, reward_type, referral_count, expires_at)
    VALUES (p_user_id, 'month_free', 3, NOW() + INTERVAL '90 days')
    RETURNING jsonb_build_object(
      'type', reward_type,
      'count', referral_count,
      'granted_at', granted_at
    ) INTO v_new_reward;

    v_rewards_granted := v_rewards_granted || v_new_reward;
  END IF;

  -- Grant "10 referrals = lifetime premium" reward
  IF v_total_referrals >= 10 THEN
    -- Check if already granted
    IF NOT EXISTS (
      SELECT 1 FROM public.referral_rewards
      WHERE user_id = p_user_id AND reward_type = 'lifetime_premium'
    ) THEN
      INSERT INTO public.referral_rewards (user_id, reward_type, referral_count, expires_at)
      VALUES (p_user_id, 'lifetime_premium', 10, NULL)
      RETURNING jsonb_build_object(
        'type', reward_type,
        'count', referral_count,
        'granted_at', granted_at
      ) INTO v_new_reward;

      v_rewards_granted := v_rewards_granted || v_new_reward;

      -- Update user to premium
      UPDATE public.users
      SET subscription_tier = 'premium',
          subscription_status = 'active'
      WHERE id = p_user_id;
    END IF;
  END IF;

  -- Update user stats
  UPDATE public.users
  SET successful_referrals = v_total_referrals
  WHERE id = p_user_id;

  RETURN v_rewards_granted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update referral stats
CREATE OR REPLACE FUNCTION update_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update referrer's stats when referral converts
  IF NEW.converted_at IS NOT NULL AND OLD.converted_at IS NULL THEN
    UPDATE public.users
    SET referral_count = (
      SELECT COUNT(*) FROM public.referrals WHERE referrer_id = NEW.referrer_id
    ),
    successful_referrals = (
      SELECT COUNT(*) FROM public.referrals
      WHERE referrer_id = NEW.referrer_id AND converted_at IS NOT NULL
    )
    WHERE id = NEW.referrer_id;

    -- Check for rewards
    PERFORM check_and_grant_referral_rewards(NEW.referrer_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_referral_stats_trigger
  AFTER UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_stats();

-- View for referral leaderboard
CREATE OR REPLACE VIEW public.referral_leaderboard AS
SELECT
  u.id,
  u.email,
  COALESCE(u.successful_referrals, 0) as successful_referrals,
  COALESCE(u.referral_count, 0) as total_referrals,
  (
    SELECT COUNT(*) FROM public.referral_rewards rr
    WHERE rr.user_id = u.id
  ) as rewards_earned,
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'type', reward_type,
        'granted_at', granted_at
      ) ORDER BY granted_at DESC
    )
    FROM public.referral_rewards rr
    WHERE rr.user_id = u.id
  ) as rewards
FROM public.users u
WHERE u.successful_referrals > 0
ORDER BY u.successful_referrals DESC, u.created_at ASC
LIMIT 100;

COMMENT ON TABLE public.referral_codes IS 'Unique referral codes for each user';
COMMENT ON TABLE public.referrals IS 'Tracks referral relationships, clicks, signups, and conversions';
COMMENT ON TABLE public.referral_rewards IS 'Tracks granted referral rewards (free months, lifetime premium)';
COMMENT ON VIEW public.referral_leaderboard IS 'Top 100 referrers by successful conversions';
