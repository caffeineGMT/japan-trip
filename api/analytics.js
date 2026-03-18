/**
 * Server-side Analytics API
 * Handles backend event tracking for conversion funnel
 */

const { PostHog } = require('posthog-node');

class ServerAnalytics {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  /**
   * Initialize PostHog client
   */
  init(apiKey, options = {}) {
    if (this.initialized) return;

    this.client = new PostHog(apiKey, {
      host: options.host || 'https://app.posthog.com',
    });

    this.initialized = true;
    console.log('Server-side analytics initialized');
  }

  /**
   * Track server-side event
   */
  async track(userId, eventName, properties = {}) {
    if (!this.initialized || !this.client) {
      console.warn('Analytics not initialized');
      return;
    }

    try {
      this.client.capture({
        distinctId: userId,
        event: eventName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'production',
        },
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  /**
   * Identify user
   */
  async identify(userId, traits = {}) {
    if (!this.initialized || !this.client) return;

    try {
      this.client.identify({
        distinctId: userId,
        properties: traits,
      });
    } catch (error) {
      console.error('Analytics identify error:', error);
    }
  }

  /**
   * Track payment events
   */
  async trackPayment(userId, eventType, paymentData) {
    const events = {
      initiated: 'checkout_initiated_server',
      succeeded: 'purchase_completed_server',
      failed: 'purchase_failed_server',
      refunded: 'purchase_refunded',
    };

    await this.track(userId, events[eventType] || eventType, {
      ...paymentData,
      funnel_stage: 'conversion',
      revenue: eventType === 'succeeded' ? paymentData.amount : undefined,
    });
  }

  /**
   * Track subscription events
   */
  async trackSubscription(userId, eventType, subscriptionData) {
    const events = {
      created: 'subscription_created',
      renewed: 'subscription_renewed_server',
      cancelled: 'subscription_cancelled_server',
      trial_started: 'free_trial_started_server',
      trial_ended: 'trial_ended',
    };

    await this.track(userId, events[eventType] || eventType, {
      ...subscriptionData,
      funnel_stage: eventType.includes('trial') ? 'trial' : 'retention',
    });
  }

  /**
   * Flush events before shutdown
   */
  async shutdown() {
    if (this.client) {
      await this.client.shutdown();
    }
  }
}

// Export singleton
const serverAnalytics = new ServerAnalytics();

// Express middleware for API endpoint
const analyticsMiddleware = async (req, res, next) => {
  try {
    const { event, userId, properties } = req.body;

    if (!event || !userId) {
      return res.status(400).json({ error: 'Missing event or userId' });
    }

    await serverAnalytics.track(userId, event, properties);
    res.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    res.status(500).json({ error: 'Analytics tracking failed' });
  }
};

module.exports = {
  serverAnalytics,
  analyticsMiddleware,
};
