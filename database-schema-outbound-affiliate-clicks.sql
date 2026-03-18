-- Outbound Affiliate Click Tracking
-- Tracks clicks from our site to external affiliate partners (Booking.com, GetYourGuide, JR Pass)

CREATE TABLE IF NOT EXISTS public.outbound_affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Click metadata
  source TEXT NOT NULL, -- 'booking.com', 'getyourguide', 'jrpass'
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  template_id TEXT, -- e.g., 'japan-cherry-blossom-2026'
  day_index INTEGER, -- Day number (0-indexed)

  -- Item details
  item_name TEXT,
  item_price DECIMAL,
  city TEXT,

  -- Session tracking
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,

  -- Timestamp
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Conversion tracking (optional, for future use)
  converted BOOLEAN DEFAULT FALSE,
  conversion_value_cents INTEGER,
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_outbound_affiliate_clicks_source ON public.outbound_affiliate_clicks(source);
CREATE INDEX IF NOT EXISTS idx_outbound_affiliate_clicks_user_id ON public.outbound_affiliate_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_outbound_affiliate_clicks_template_id ON public.outbound_affiliate_clicks(template_id);
CREATE INDEX IF NOT EXISTS idx_outbound_affiliate_clicks_clicked_at ON public.outbound_affiliate_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_outbound_affiliate_clicks_session_id ON public.outbound_affiliate_clicks(session_id);

-- Enable RLS
ALTER TABLE public.outbound_affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can insert clicks (tracking)
CREATE POLICY "Anyone can insert outbound clicks"
  ON public.outbound_affiliate_clicks
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Only service role can read all clicks
CREATE POLICY "Service role can read all outbound clicks"
  ON public.outbound_affiliate_clicks
  FOR SELECT
  USING (auth.role() = 'service_role');

-- RLS Policy: Users can read their own clicks
CREATE POLICY "Users can read own outbound clicks"
  ON public.outbound_affiliate_clicks
  FOR SELECT
  USING (user_id = auth.uid());

COMMENT ON TABLE public.outbound_affiliate_clicks IS 'Tracks clicks from our site to external affiliate partners (Booking.com, GetYourGuide, JR Pass)';
