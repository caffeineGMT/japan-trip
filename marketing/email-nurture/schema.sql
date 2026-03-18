-- Email Nurture Sequence Database Schema
-- Run this in Supabase SQL editor

-- Email subscribers table
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active', -- active, unsubscribed, bounced, complained
  source VARCHAR(100), -- landing_page, widget, referral, etc.
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  subscription_tier VARCHAR(50) DEFAULT 'free', -- free, premium
  stripe_customer_id VARCHAR(255),
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  preview_text VARCHAR(255),
  email_sequence_number INTEGER, -- 1-9 for drip sequence
  delay_days INTEGER DEFAULT 0, -- days after subscription
  template_id VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- active, paused, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email sends table (tracks each individual email sent)
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID REFERENCES email_subscribers(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  mailgun_message_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'queued', -- queued, sent, delivered, failed, bounced
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  complained_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email events table (detailed tracking)
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  send_id UUID REFERENCES email_sends(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES email_subscribers(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- opened, clicked, unsubscribed, bounced, complained
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  link_url TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email links table (track click-through URLs)
CREATE TABLE IF NOT EXISTS email_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  label VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email conversions table
CREATE TABLE IF NOT EXISTS email_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID REFERENCES email_subscribers(id) ON DELETE CASCADE,
  send_id UUID REFERENCES email_sends(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE SET NULL,
  conversion_type VARCHAR(50) NOT NULL, -- free_to_paid, template_purchase, affiliate_click
  revenue_amount DECIMAL(10, 2),
  stripe_payment_id VARCHAR(255),
  converted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON email_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_tier ON email_subscribers(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_sends_subscriber ON email_sends(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_sends_campaign ON email_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sends_status ON email_sends(status);
CREATE INDEX IF NOT EXISTS idx_events_send ON email_events(send_id);
CREATE INDEX IF NOT EXISTS idx_events_subscriber ON email_events(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_conversions_subscriber ON email_conversions(subscriber_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_email_subscribers_updated_at BEFORE UPDATE ON email_subscribers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_sends_updated_at BEFORE UPDATE ON email_sends FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed the 9-email drip campaign
INSERT INTO email_campaigns (name, subject, preview_text, email_sequence_number, delay_days, template_id, status) VALUES
  ('Welcome Email', 'Welcome to Japan Trip Companion! 🌸 Here''s your itinerary template', 'Get started planning your perfect Japan trip', 1, 0, 'email-1-welcome', 'active'),
  ('Offline Maps Guide', 'How to use offline maps in Tokyo (no WiFi needed!) 🗺️', 'Never get lost in Japan - download before you go', 2, 2, 'email-2-offline-maps', 'active'),
  ('AI Itinerary Review', '3 mistakes in your itinerary (our AI spotted these) ⚠️', 'Your itinerary could be 30% more efficient', 3, 5, 'email-3-ai-review', 'active'),
  ('Case Study', 'How Sarah saved 12 hours planning with our AI optimizer ⏱️', 'Real traveler, real results', 4, 7, 'email-4-case-study', 'active'),
  ('Cherry Blossom Update', 'Cherry blossom forecast update for your dates 🌸', 'Plan around peak bloom', 5, 10, 'email-5-sakura-forecast', 'active'),
  ('Premium Upgrade Offer', 'Upgrade to Premium: Unlock AI optimizer (50% off for 48 hours) 🎁', 'Limited time: $4.99/month instead of $9.99', 6, 14, 'email-6-premium-offer', 'active'),
  ('Social Proof', '10,000 travelers trust us for their Japan trips ⭐', 'Join the community', 7, 17, 'email-7-social-proof', 'active'),
  ('Last Chance', 'Your 50% discount expires in 24 hours ⏰', 'Don''t miss out on AI-powered planning', 8, 21, 'email-8-last-chance', 'active'),
  ('Final Value Email', 'Still planning? Here''s a free JR Pass guide 🚄', 'Ultimate guide to saving money on trains', 9, 30, 'email-9-jr-pass', 'active')
ON CONFLICT DO NOTHING;

-- Create view for campaign analytics
CREATE OR REPLACE VIEW email_campaign_analytics AS
SELECT
  c.id AS campaign_id,
  c.name AS campaign_name,
  c.email_sequence_number,
  COUNT(DISTINCT s.id) AS total_sends,
  COUNT(DISTINCT CASE WHEN s.status = 'delivered' THEN s.id END) AS delivered_count,
  COUNT(DISTINCT CASE WHEN s.opened_at IS NOT NULL THEN s.id END) AS opened_count,
  COUNT(DISTINCT CASE WHEN s.clicked_at IS NOT NULL THEN s.id END) AS clicked_count,
  COUNT(DISTINCT CASE WHEN s.unsubscribed_at IS NOT NULL THEN s.id END) AS unsubscribed_count,
  COUNT(DISTINCT conv.id) AS conversion_count,
  COALESCE(SUM(conv.revenue_amount), 0) AS total_revenue,
  CASE
    WHEN COUNT(DISTINCT s.id) > 0
    THEN ROUND((COUNT(DISTINCT CASE WHEN s.opened_at IS NOT NULL THEN s.id END)::DECIMAL / COUNT(DISTINCT s.id)) * 100, 2)
    ELSE 0
  END AS open_rate,
  CASE
    WHEN COUNT(DISTINCT s.id) > 0
    THEN ROUND((COUNT(DISTINCT CASE WHEN s.clicked_at IS NOT NULL THEN s.id END)::DECIMAL / COUNT(DISTINCT s.id)) * 100, 2)
    ELSE 0
  END AS click_rate,
  CASE
    WHEN COUNT(DISTINCT s.id) > 0
    THEN ROUND((COUNT(DISTINCT conv.id)::DECIMAL / COUNT(DISTINCT s.id)) * 100, 2)
    ELSE 0
  END AS conversion_rate
FROM email_campaigns c
LEFT JOIN email_sends s ON c.id = s.campaign_id
LEFT JOIN email_conversions conv ON c.id = conv.campaign_id
GROUP BY c.id, c.name, c.email_sequence_number
ORDER BY c.email_sequence_number;

-- Create view for subscriber journey
CREATE OR REPLACE VIEW subscriber_journey AS
SELECT
  sub.id AS subscriber_id,
  sub.email,
  sub.status,
  sub.subscription_tier,
  sub.subscribed_at,
  sub.converted_at,
  COUNT(DISTINCT s.id) AS emails_received,
  COUNT(DISTINCT CASE WHEN s.opened_at IS NOT NULL THEN s.id END) AS emails_opened,
  COUNT(DISTINCT CASE WHEN s.clicked_at IS NOT NULL THEN s.id END) AS emails_clicked,
  MAX(s.sent_at) AS last_email_sent,
  CASE
    WHEN sub.converted_at IS NOT NULL THEN 'converted'
    WHEN sub.unsubscribed_at IS NOT NULL THEN 'unsubscribed'
    WHEN COUNT(DISTINCT s.id) >= 9 THEN 'completed_sequence'
    ELSE 'in_sequence'
  END AS journey_stage
FROM email_subscribers sub
LEFT JOIN email_sends s ON sub.id = s.subscriber_id
GROUP BY sub.id, sub.email, sub.status, sub.subscription_tier, sub.subscribed_at, sub.converted_at;

COMMENT ON TABLE email_subscribers IS 'Email subscribers with subscription status and conversion tracking';
COMMENT ON TABLE email_campaigns IS '9-email drip campaign configuration';
COMMENT ON TABLE email_sends IS 'Individual email send records with delivery tracking';
COMMENT ON TABLE email_events IS 'Detailed email events (opens, clicks, unsubscribes)';
COMMENT ON TABLE email_conversions IS 'Revenue attribution from email campaigns';
