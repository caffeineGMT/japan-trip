-- Viral Sharing & Referral System Schema
-- Supabase tables for trip sharing, OG images, and referral rewards

-- Table: trips_shared
-- Stores shared trip links with short codes
CREATE TABLE IF NOT EXISTS trips_shared (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT trips_shared_short_code_length CHECK (char_length(short_code) = 8)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_shared_short_code ON trips_shared(short_code);
CREATE INDEX IF NOT EXISTS idx_trips_shared_user_id ON trips_shared(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_shared_trip_id ON trips_shared(trip_id);

-- Table: share_events
-- Tracks individual share events for analytics
CREATE TABLE IF NOT EXISTS share_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code TEXT NOT NULL,
  platform TEXT NOT NULL,
  user_id UUID,
  user_agent TEXT,
  referrer TEXT,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT share_events_platform_check CHECK (platform IN ('twitter', 'facebook', 'whatsapp', 'email', 'copy_link', 'other'))
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_share_events_short_code ON share_events(short_code);
CREATE INDEX IF NOT EXISTS idx_share_events_platform ON share_events(platform);
CREATE INDEX IF NOT EXISTS idx_share_events_shared_at ON share_events(shared_at);

-- Table: referrals
-- Tracks user referrals for reward system
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_user_id UUID NOT NULL,
  short_code TEXT,
  source TEXT DEFAULT 'direct_invite',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT referrals_status_check CHECK (status IN ('pending', 'completed', 'rewarded')),
  CONSTRAINT referrals_unique UNIQUE (referrer_id, referred_user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Table: referral_rewards
-- Tracks referral rewards and premium status
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_referrals INTEGER DEFAULT 0,
  completed_referrals INTEGER DEFAULT 0,
  pending_referrals INTEGER DEFAULT 0,
  premium_months_earned INTEGER DEFAULT 0,
  premium_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user_id ON referral_rewards(user_id);

-- Function: check_referral_rewards
-- Automatically checks and grants premium access when user reaches 3 referrals
CREATE OR REPLACE FUNCTION check_referral_rewards(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_completed_count INTEGER;
  v_current_rewards RECORD;
  v_new_months INTEGER;
  v_premium_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Count completed referrals
  SELECT COUNT(*) INTO v_completed_count
  FROM referrals
  WHERE referrer_id = p_user_id
    AND status IN ('completed', 'rewarded');

  -- Get current rewards
  SELECT * INTO v_current_rewards
  FROM referral_rewards
  WHERE user_id = p_user_id;

  -- Calculate new premium months (1 month per 3 referrals)
  v_new_months := FLOOR(v_completed_count / 3);

  -- If no rewards record exists, create one
  IF v_current_rewards IS NULL THEN
    INSERT INTO referral_rewards (
      user_id,
      total_referrals,
      completed_referrals,
      premium_months_earned,
      premium_until
    ) VALUES (
      p_user_id,
      v_completed_count,
      v_completed_count,
      v_new_months,
      CASE
        WHEN v_new_months > 0 THEN NOW() + (v_new_months || ' months')::INTERVAL
        ELSE NULL
      END
    );
  ELSE
    -- Update existing record if earned months have increased
    IF v_new_months > v_current_rewards.premium_months_earned THEN
      -- Calculate new premium_until
      IF v_current_rewards.premium_until IS NULL OR v_current_rewards.premium_until < NOW() THEN
        -- Start from now if no active premium
        v_premium_until := NOW() + ((v_new_months - v_current_rewards.premium_months_earned) || ' months')::INTERVAL;
      ELSE
        -- Extend existing premium
        v_premium_until := v_current_rewards.premium_until + ((v_new_months - v_current_rewards.premium_months_earned) || ' months')::INTERVAL;
      END IF;

      -- Update rewards
      UPDATE referral_rewards
      SET
        completed_referrals = v_completed_count,
        premium_months_earned = v_new_months,
        premium_until = v_premium_until,
        updated_at = NOW()
      WHERE user_id = p_user_id;

      -- Mark referrals as rewarded
      UPDATE referrals
      SET status = 'rewarded'
      WHERE referrer_id = p_user_id
        AND status = 'completed';
    ELSE
      -- Just update counts
      UPDATE referral_rewards
      SET
        completed_referrals = v_completed_count,
        updated_at = NOW()
      WHERE user_id = p_user_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE trips_shared ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view shared trips
CREATE POLICY "Public read access to active shares"
  ON trips_shared FOR SELECT
  USING (is_active = true);

-- Policy: Users can create shares for their own trips
CREATE POLICY "Users can create their own shares"
  ON trips_shared FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own shares
CREATE POLICY "Users can update their own shares"
  ON trips_shared FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Public can insert share events (for tracking)
CREATE POLICY "Public can track share events"
  ON share_events FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own referrals
CREATE POLICY "Users can view their own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

-- Policy: Users can view their own rewards
CREATE POLICY "Users can view their own rewards"
  ON referral_rewards FOR SELECT
  USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE trips_shared IS 'Stores shared trip links with unique short codes for viral sharing';
COMMENT ON TABLE share_events IS 'Tracks share events across different platforms for analytics';
COMMENT ON TABLE referrals IS 'Tracks user referrals for reward system (3 referrals = 1 month premium)';
COMMENT ON TABLE referral_rewards IS 'Aggregates referral rewards and premium access for users';
COMMENT ON FUNCTION check_referral_rewards IS 'Automatically grants premium access when user reaches 3 completed referrals';
