-- Create affiliate_clicks table for tracking outbound affiliate clicks

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT,
  url TEXT NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted BOOLEAN DEFAULT FALSE,
  conversion_date TIMESTAMP WITH TIME ZONE,
  conversion_amount DECIMAL(10, 2),
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_affiliate_clicks_user_id ON affiliate_clicks(user_id);
CREATE INDEX idx_affiliate_clicks_provider ON affiliate_clicks(provider);
CREATE INDEX idx_affiliate_clicks_clicked_at ON affiliate_clicks(clicked_at DESC);
CREATE INDEX idx_affiliate_clicks_location ON affiliate_clicks(location);
CREATE INDEX idx_affiliate_clicks_converted ON affiliate_clicks(converted);

-- Add RLS policies
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own clicks
CREATE POLICY "Users can view own clicks"
  ON affiliate_clicks
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Allow service role to insert clicks
CREATE POLICY "Service role can insert clicks"
  ON affiliate_clicks
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow service role to update conversions
CREATE POLICY "Service role can update conversions"
  ON affiliate_clicks
  FOR UPDATE
  TO service_role
  USING (true);

-- Create view for analytics
CREATE OR REPLACE VIEW affiliate_analytics AS
SELECT
  DATE(clicked_at) as date,
  provider,
  COUNT(*) as total_clicks,
  COUNT(CASE WHEN converted = true THEN 1 END) as conversions,
  ROUND(
    COUNT(CASE WHEN converted = true THEN 1 END)::numeric /
    NULLIF(COUNT(*)::numeric, 0) * 100,
    2
  ) as conversion_rate,
  SUM(COALESCE(conversion_amount, 0)) as total_revenue
FROM affiliate_clicks
GROUP BY DATE(clicked_at), provider
ORDER BY date DESC, provider;

-- Grant access to view
GRANT SELECT ON affiliate_analytics TO authenticated;
