-- Migration: Viral Sharing System with Dynamic OG Images and Referral Rewards
-- Created: 2026-03-18
-- Description: Tables for trip sharing, referral tracking, and reward management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. trips_shared table - Track shared trip links
CREATE TABLE IF NOT EXISTS trips_shared (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id VARCHAR(255) NOT NULL, -- Reference to trip (flexible for MVP)
  user_id VARCHAR(255) NOT NULL, -- User who created the share
  short_code VARCHAR(8) UNIQUE NOT NULL, -- 8-character nanoid
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_viewed_at TIMESTAMP WITH TIME ZONE
);

-- Index for fast lookups by short_code
CREATE INDEX IF NOT EXISTS idx_trips_shared_short_code ON trips_shared(short_code);
CREATE INDEX IF NOT EXISTS idx_trips_shared_user_id ON trips_shared(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_shared_trip_id ON trips_shared(trip_id);

-- 2. share_events table - Track share actions for analytics
CREATE TABLE IF NOT EXISTS share_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_code VARCHAR(8) NOT NULL REFERENCES trips_shared(short_code) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- twitter, facebook, whatsapp, email, copy_link
  user_id VARCHAR(255), -- Optional: user who shared
  user_agent TEXT,
  referrer TEXT,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_share_events_short_code ON share_events(short_code);
CREATE INDEX IF NOT EXISTS idx_share_events_platform ON share_events(platform);
CREATE INDEX IF NOT EXISTS idx_share_events_shared_at ON share_events(shared_at);

-- 3. referrals table - Track user referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id VARCHAR(255) NOT NULL, -- User who referred
  referred_user_id VARCHAR(255) NOT NULL, -- User who signed up
  short_code VARCHAR(8) REFERENCES trips_shared(short_code) ON DELETE SET NULL, -- Optional: which share link was used
  source VARCHAR(100) DEFAULT 'share_link', -- share_link, direct_invite, etc.
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, rewarded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE, -- When referred user signed up
  rewarded_at TIMESTAMP WITH TIME ZONE, -- When referred user made payment
  UNIQUE(referrer_id, referred_user_id) -- Prevent duplicate referrals
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_short_code ON referrals(short_code);

-- 4. referral_rewards table - Track earned rewards
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) UNIQUE NOT NULL, -- User earning rewards
  total_referrals INTEGER DEFAULT 0, -- Total referrals made
  completed_referrals INTEGER DEFAULT 0, -- Referrals who signed up
  pending_referrals INTEGER DEFAULT 0, -- Referrals not yet completed
  premium_months_earned INTEGER DEFAULT 0, -- Months of premium earned (3 referrals = 1 month)
  premium_until TIMESTAMP WITH TIME ZONE, -- Premium expiration date
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_user_id ON referral_rewards(user_id);

-- 5. Database function: Check and grant referral rewards
-- Runs when a referral is completed to check if user qualifies for premium
CREATE OR REPLACE FUNCTION check_referral_rewards(p_user_id VARCHAR)
RETURNS VOID AS $$
DECLARE
  v_completed_count INTEGER;
  v_current_months INTEGER;
  v_new_months INTEGER;
  v_premium_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Count completed referrals
  SELECT COUNT(*) INTO v_completed_count
  FROM referrals
  WHERE referrer_id = p_user_id
    AND (status = 'completed' OR status = 'rewarded');

  -- Calculate months earned (3 referrals = 1 month)
  v_new_months := FLOOR(v_completed_count / 3);

  -- Get current premium months
  SELECT COALESCE(premium_months_earned, 0) INTO v_current_months
  FROM referral_rewards
  WHERE user_id = p_user_id;

  -- Only grant new months if count increased
  IF v_new_months > v_current_months THEN
    -- Calculate new premium expiration
    SELECT COALESCE(premium_until, NOW()) INTO v_premium_until
    FROM referral_rewards
    WHERE user_id = p_user_id;

    -- If already expired, start from now
    IF v_premium_until < NOW() THEN
      v_premium_until := NOW();
    END IF;

    -- Add the difference in months
    v_premium_until := v_premium_until + INTERVAL '1 month' * (v_new_months - v_current_months);

    -- Update rewards record
    INSERT INTO referral_rewards (user_id, premium_months_earned, premium_until)
    VALUES (p_user_id, v_new_months, v_premium_until)
    ON CONFLICT (user_id)
    DO UPDATE SET
      premium_months_earned = v_new_months,
      premium_until = v_premium_until,
      updated_at = NOW();

    -- Mark referrals as rewarded
    UPDATE referrals
    SET status = 'rewarded', rewarded_at = NOW()
    WHERE referrer_id = p_user_id
      AND status = 'completed';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trips_shared_updated_at
  BEFORE UPDATE ON trips_shared
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_rewards_updated_at
  BEFORE UPDATE ON referral_rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Sample data for testing (optional - comment out for production)
-- INSERT INTO trips_shared (trip_id, user_id, short_code)
-- VALUES ('japan-trip-2026', 'test-user-1', 'ABC12345');

COMMENT ON TABLE trips_shared IS 'Shared trip links with view/share counters';
COMMENT ON TABLE share_events IS 'Analytics events for share actions';
COMMENT ON TABLE referrals IS 'User referral tracking';
COMMENT ON TABLE referral_rewards IS 'Earned premium months from referrals (3 referrals = 1 month free)';
COMMENT ON FUNCTION check_referral_rewards IS 'Auto-grants premium when user reaches 3 completed referrals';
