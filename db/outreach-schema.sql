-- Blogger Outreach Database Schema
-- Tracks affiliate partner recruitment, emails, and conversions

-- Blogger prospects and partners
CREATE TABLE IF NOT EXISTS bloggers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  blog_name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  position VARCHAR(100),
  monthly_traffic INTEGER,
  confidence_score INTEGER,

  -- Status: prospect, contacted, interested, activated, inactive
  status VARCHAR(50) DEFAULT 'prospect',

  -- Affiliate details
  referral_code VARCHAR(50) UNIQUE,
  commission_rate DECIMAL(5,2) DEFAULT 25.00,

  -- Revenue tracking
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0.00,
  total_commission DECIMAL(10,2) DEFAULT 0.00,

  -- Featured on homepage (first 10 partners)
  is_featured BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activated_at TIMESTAMP,
  last_activity_at TIMESTAMP,

  -- Contact info
  phone VARCHAR(50),
  website_url VARCHAR(500),
  social_media JSONB,

  -- Notes
  notes TEXT,

  INDEX idx_status (status),
  INDEX idx_email (email),
  INDEX idx_referral_code (referral_code)
);

-- Outreach emails sent
CREATE TABLE IF NOT EXISTS outreach_emails (
  id SERIAL PRIMARY KEY,
  blogger_id INTEGER REFERENCES bloggers(id) ON DELETE CASCADE,

  -- Email details
  email_type VARCHAR(50) NOT NULL, -- initial, followUp1, followUp2, followUp3
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,

  -- Mailgun tracking
  message_id VARCHAR(255) UNIQUE,

  -- Status: scheduled, sent, delivered, opened, clicked, replied, bounced, failed
  status VARCHAR(50) DEFAULT 'scheduled',

  -- Tracking
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  replied_at TIMESTAMP,
  bounced_at TIMESTAMP,

  -- Stats
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Follow-up scheduling
  scheduled_for TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_blogger_id (blogger_id),
  INDEX idx_status (status),
  INDEX idx_scheduled (scheduled_for),
  INDEX idx_message_id (message_id)
);

-- Email responses/interactions
CREATE TABLE IF NOT EXISTS outreach_responses (
  id SERIAL PRIMARY KEY,
  blogger_id INTEGER REFERENCES bloggers(id) ON DELETE CASCADE,
  email_id INTEGER REFERENCES outreach_emails(id) ON DELETE CASCADE,

  -- Response details
  response_type VARCHAR(50), -- interested, not_interested, needs_info, out_of_office
  response_text TEXT,
  sentiment VARCHAR(50), -- positive, neutral, negative

  -- Action taken
  action_taken VARCHAR(100), -- scheduled_demo, sent_materials, activated, rejected

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_blogger_id (blogger_id),
  INDEX idx_response_type (response_type)
);

-- Outreach campaigns
CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Campaign stats
  target_count INTEGER,
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  emails_replied INTEGER DEFAULT 0,

  -- Conversion stats
  partners_interested INTEGER DEFAULT 0,
  partners_activated INTEGER DEFAULT 0,

  -- Status: draft, active, paused, completed
  status VARCHAR(50) DEFAULT 'draft',

  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_status (status)
);

-- Link blogger to campaign
CREATE TABLE IF NOT EXISTS campaign_bloggers (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
  blogger_id INTEGER REFERENCES bloggers(id) ON DELETE CASCADE,

  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(campaign_id, blogger_id),
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_blogger_id (blogger_id)
);

-- Affiliate conversions (from embed widget)
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id SERIAL PRIMARY KEY,
  blogger_id INTEGER REFERENCES bloggers(id) ON DELETE SET NULL,

  -- Conversion details
  referral_code VARCHAR(50),
  conversion_type VARCHAR(50), -- hotel, activity, transport, trip_plan

  -- Revenue
  booking_value DECIMAL(10,2),
  commission_amount DECIMAL(10,2),
  commission_rate DECIMAL(5,2),

  -- Tracking
  user_id VARCHAR(255),
  session_id VARCHAR(255),

  -- Attribution
  click_timestamp TIMESTAMP,
  conversion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Payout
  payout_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, paid
  payout_date TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_blogger_id (blogger_id),
  INDEX idx_referral_code (referral_code),
  INDEX idx_payout_status (payout_status)
);

-- Scheduled follow-ups queue
CREATE TABLE IF NOT EXISTS follow_up_queue (
  id SERIAL PRIMARY KEY,
  blogger_id INTEGER REFERENCES bloggers(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL,
  scheduled_for TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, sent, cancelled

  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_scheduled (scheduled_for, status),
  INDEX idx_blogger_id (blogger_id)
);

-- Mailgun webhooks (for tracking opens, clicks, etc.)
CREATE TABLE IF NOT EXISTS mailgun_events (
  id SERIAL PRIMARY KEY,
  message_id VARCHAR(255),
  event_type VARCHAR(50), -- delivered, opened, clicked, bounced, failed, unsubscribed

  recipient VARCHAR(255),
  timestamp TIMESTAMP,

  -- Event data
  event_data JSONB,

  -- Link to our email
  email_id INTEGER REFERENCES outreach_emails(id) ON DELETE SET NULL,

  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_message_id (message_id),
  INDEX idx_event_type (event_type),
  INDEX idx_processed (processed)
);

-- Views for analytics

-- Campaign performance overview
CREATE OR REPLACE VIEW campaign_performance AS
SELECT
  c.id,
  c.name,
  c.status,
  c.emails_sent,
  c.emails_delivered,
  c.emails_opened,
  c.emails_clicked,
  c.emails_replied,
  c.partners_activated,
  CASE
    WHEN c.emails_sent > 0
    THEN ROUND((c.emails_opened::DECIMAL / c.emails_sent) * 100, 2)
    ELSE 0
  END as open_rate,
  CASE
    WHEN c.emails_sent > 0
    THEN ROUND((c.emails_clicked::DECIMAL / c.emails_sent) * 100, 2)
    ELSE 0
  END as click_rate,
  CASE
    WHEN c.emails_sent > 0
    THEN ROUND((c.emails_replied::DECIMAL / c.emails_sent) * 100, 2)
    ELSE 0
  END as response_rate,
  CASE
    WHEN c.emails_sent > 0
    THEN ROUND((c.partners_activated::DECIMAL / c.emails_sent) * 100, 2)
    ELSE 0
  END as activation_rate
FROM outreach_campaigns c;

-- Top performing partners
CREATE OR REPLACE VIEW top_partners AS
SELECT
  b.id,
  b.email,
  b.first_name,
  b.last_name,
  b.blog_name,
  b.referral_code,
  b.total_clicks,
  b.total_conversions,
  b.total_revenue,
  b.total_commission,
  CASE
    WHEN b.total_clicks > 0
    THEN ROUND((b.total_conversions::DECIMAL / b.total_clicks) * 100, 2)
    ELSE 0
  END as conversion_rate,
  b.activated_at,
  EXTRACT(DAY FROM (CURRENT_TIMESTAMP - b.activated_at)) as days_active
FROM bloggers b
WHERE b.status = 'activated'
ORDER BY b.total_commission DESC
LIMIT 20;

-- Pending follow-ups
CREATE OR REPLACE VIEW pending_followups AS
SELECT
  f.id,
  b.email,
  b.first_name,
  b.blog_name,
  f.email_type,
  f.scheduled_for,
  EXTRACT(HOUR FROM (f.scheduled_for - CURRENT_TIMESTAMP)) as hours_until_send
FROM follow_up_queue f
JOIN bloggers b ON f.blogger_id = b.id
WHERE f.status = 'scheduled'
  AND f.scheduled_for <= CURRENT_TIMESTAMP + INTERVAL '24 hours'
ORDER BY f.scheduled_for ASC;
