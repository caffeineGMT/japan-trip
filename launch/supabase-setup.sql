-- Supabase Setup for ProductHunt Launch
-- Run this SQL in your Supabase SQL Editor

-- Table for early access signups
CREATE TABLE IF NOT EXISTS early_access_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  signup_date TIMESTAMPTZ DEFAULT NOW(),
  source TEXT, -- 'early-access-landing', 'producthunt', 'twitter', etc.
  referrer TEXT, -- HTTP referrer
  user_agent TEXT, -- Browser user agent
  ip_address INET, -- For analytics (be GDPR compliant)
  converted_to_paid BOOLEAN DEFAULT FALSE,
  conversion_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_early_access_email ON early_access_signups(email);
CREATE INDEX IF NOT EXISTS idx_early_access_signup_date ON early_access_signups(signup_date);
CREATE INDEX IF NOT EXISTS idx_early_access_source ON early_access_signups(source);

-- Enable Row Level Security
ALTER TABLE early_access_signups ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for signup form)
CREATE POLICY "Allow anonymous signups" ON early_access_signups
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow authenticated reads (for admin dashboard)
CREATE POLICY "Allow authenticated reads" ON early_access_signups
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_early_access_signups_updated_at
  BEFORE UPDATE ON early_access_signups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table for ProductHunt launch metrics tracking
CREATE TABLE IF NOT EXISTS launch_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ph_rank INTEGER,
  ph_upvotes INTEGER,
  ph_comments INTEGER,
  website_visits INTEGER,
  total_signups INTEGER,
  paid_customers INTEGER,
  mrr DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for time-series queries
CREATE INDEX IF NOT EXISTS idx_launch_metrics_timestamp ON launch_metrics(timestamp DESC);

-- Enable RLS
ALTER TABLE launch_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated inserts and reads
CREATE POLICY "Allow authenticated access" ON launch_metrics
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Table for user feedback collected during launch
CREATE TABLE IF NOT EXISTS launch_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT,
  feedback_type TEXT, -- 'bug', 'feature_request', 'praise', 'complaint'
  message TEXT NOT NULL,
  source TEXT, -- 'producthunt', 'twitter', 'email', 'direct'
  priority TEXT, -- 'high', 'medium', 'low'
  status TEXT DEFAULT 'new', -- 'new', 'reviewing', 'planned', 'completed', 'wont_fix'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_launch_feedback_type ON launch_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_launch_feedback_status ON launch_feedback(status);

ALTER TABLE launch_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for feedback form)
CREATE POLICY "Allow anonymous feedback" ON launch_feedback
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow authenticated reads
CREATE POLICY "Allow authenticated feedback reads" ON launch_feedback
  FOR SELECT
  TO authenticated
  USING (true);

-- Trigger for feedback updated_at
CREATE TRIGGER update_launch_feedback_updated_at
  BEFORE UPDATE ON launch_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View for launch dashboard (combines multiple metrics)
CREATE OR REPLACE VIEW launch_dashboard AS
SELECT
  (SELECT COUNT(*) FROM early_access_signups) AS total_signups,
  (SELECT COUNT(*) FROM early_access_signups WHERE signup_date >= NOW() - INTERVAL '24 hours') AS signups_last_24h,
  (SELECT COUNT(*) FROM early_access_signups WHERE converted_to_paid = TRUE) AS paid_conversions,
  (SELECT COUNT(*) FROM early_access_signups WHERE converted_to_paid = TRUE)::FLOAT /
    NULLIF(COUNT(*), 0)::FLOAT * 100 AS conversion_rate,
  (SELECT ph_rank FROM launch_metrics ORDER BY timestamp DESC LIMIT 1) AS current_ph_rank,
  (SELECT ph_upvotes FROM launch_metrics ORDER BY timestamp DESC LIMIT 1) AS current_ph_upvotes,
  (SELECT SUM(mrr) FROM launch_metrics ORDER BY timestamp DESC LIMIT 1) AS current_mrr
FROM early_access_signups;

-- Grant access to the view
GRANT SELECT ON launch_dashboard TO authenticated;

-- Sample query to get signup sources breakdown
-- Run this to see where your signups are coming from
/*
SELECT
  source,
  COUNT(*) AS count,
  ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER () * 100, 2) AS percentage
FROM early_access_signups
GROUP BY source
ORDER BY count DESC;
*/

-- Sample query to track hourly signups on launch day
/*
SELECT
  DATE_TRUNC('hour', signup_date) AS hour,
  COUNT(*) AS signups
FROM early_access_signups
WHERE signup_date >= '2026-04-01 00:00:00'
  AND signup_date < '2026-04-02 00:00:00'
GROUP BY hour
ORDER BY hour;
*/

-- Sample query to get conversion funnel
/*
SELECT
  COUNT(*) AS total_signups,
  COUNT(*) FILTER (WHERE converted_to_paid = TRUE) AS paid_customers,
  ROUND(COUNT(*) FILTER (WHERE converted_to_paid = TRUE)::NUMERIC / COUNT(*)::NUMERIC * 100, 2) AS conversion_rate
FROM early_access_signups;
*/

-- Function to mark a signup as converted
CREATE OR REPLACE FUNCTION mark_signup_converted(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE early_access_signups
  SET
    converted_to_paid = TRUE,
    conversion_date = NOW()
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track metrics (call this every hour during launch)
CREATE OR REPLACE FUNCTION track_launch_metrics(
  p_ph_rank INTEGER,
  p_ph_upvotes INTEGER,
  p_ph_comments INTEGER,
  p_website_visits INTEGER,
  p_paid_customers INTEGER,
  p_mrr DECIMAL(10, 2)
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_total_signups INTEGER;
BEGIN
  -- Get current total signups
  SELECT COUNT(*) INTO v_total_signups FROM early_access_signups;

  -- Insert metrics record
  INSERT INTO launch_metrics (
    ph_rank,
    ph_upvotes,
    ph_comments,
    website_visits,
    total_signups,
    paid_customers,
    mrr
  ) VALUES (
    p_ph_rank,
    p_ph_upvotes,
    p_ph_comments,
    p_website_visits,
    v_total_signups,
    p_paid_customers,
    p_mrr
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage:
/*
SELECT track_launch_metrics(
  p_ph_rank := 3,
  p_ph_upvotes := 152,
  p_ph_comments := 34,
  p_website_visits := 1200,
  p_paid_customers := 12,
  p_mrr := 59.88
);
*/

-- Create a simple email validation function
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add email validation constraint
ALTER TABLE early_access_signups
  ADD CONSTRAINT valid_email_format
  CHECK (is_valid_email(email));

-- Table for hunter relationships tracking
CREATE TABLE IF NOT EXISTS hunter_outreach (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hunter_name TEXT NOT NULL,
  hunter_twitter TEXT,
  hunter_email TEXT,
  outreach_date DATE,
  response_status TEXT, -- 'no_response', 'interested', 'declined', 'agreed'
  notes TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hunter_response ON hunter_outreach(response_status);

ALTER TABLE hunter_outreach ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated hunter access" ON hunter_outreach
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_hunter_outreach_updated_at
  BEFORE UPDATE ON hunter_outreach
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample hunters (from our outreach list)
INSERT INTO hunter_outreach (hunter_name, hunter_twitter, response_status) VALUES
  ('Ryan Hoover', '@rrhoover', 'no_response'),
  ('Chris Messina', '@chris_messina', 'no_response'),
  ('Ben Tossell', '@bentossell', 'no_response'),
  ('Traf', '@traf', 'no_response'),
  ('Jack Smith', '@_jacksmith', 'no_response'),
  ('Justin Jackson', '@mijustin', 'no_response'),
  ('Dickie Bush', '@dickiebush', 'no_response'),
  ('Easlo', '@heyeaslo', 'no_response'),
  ('Matt Brockwell', '@mattbrockwell', 'no_response'),
  ('KP', '@thisiskp_', 'no_response')
ON CONFLICT DO NOTHING;

-- Analytics: Signup velocity (signups per hour)
CREATE OR REPLACE VIEW signup_velocity AS
SELECT
  DATE_TRUNC('hour', signup_date) AS hour,
  COUNT(*) AS signups,
  source
FROM early_access_signups
WHERE signup_date >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', signup_date), source
ORDER BY hour DESC;

GRANT SELECT ON signup_velocity TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE early_access_signups IS 'Stores email signups from early access landing page';
COMMENT ON TABLE launch_metrics IS 'Tracks ProductHunt launch metrics hourly';
COMMENT ON TABLE launch_feedback IS 'Collects user feedback during launch';
COMMENT ON TABLE hunter_outreach IS 'Tracks hunter outreach status';
COMMENT ON VIEW launch_dashboard IS 'Real-time launch metrics dashboard';
COMMENT ON VIEW signup_velocity IS 'Signup rate over time by source';

-- Setup complete!
-- Next steps:
-- 1. Update early-access.html with your Supabase credentials
-- 2. Test the signup form
-- 3. Create a simple admin dashboard to view metrics
-- 4. Set up email notifications for new signups (optional)
