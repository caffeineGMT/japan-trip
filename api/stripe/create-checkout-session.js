/**
 * Create Stripe Checkout Session with 7-day Free Trial
 * Supports A/B testing tracking and conversion optimization
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Price IDs for different plans
const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || 'price_monthly_placeholder',
  annual: process.env.STRIPE_PRICE_ANNUAL || 'price_annual_placeholder'
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planType, trial = true, abTestVariant = 'control', email } = req.body;

    if (!planType || !['monthly', 'annual'].includes(planType)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    const priceId = PRICE_IDS[planType];

    if (!priceId || priceId.includes('placeholder')) {
      return res.status(500).json({
        error: 'Stripe not configured. Please set up your Stripe price IDs in environment variables.'
      });
    }

    // Build checkout session config
    const sessionConfig = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.APP_URL || 'http://localhost:3001'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3001'}/pricing-v2.html`,

      // Metadata for tracking
      metadata: {
        planType,
        abTestVariant,
        source: 'pricing_v2'
      },

      // Allow promotion codes
      allow_promotion_codes: true,

      // Automatic tax calculation
      automatic_tax: {
        enabled: false, // Enable in production with Stripe Tax
      },
    };

    // Add 7-day free trial if requested
    if (trial) {
      sessionConfig.subscription_data = {
        trial_period_days: 7,
        metadata: {
          trial_started: new Date().toISOString(),
          abTestVariant
        }
      };
    }

    // Pre-fill email if provided
    if (email) {
      sessionConfig.customer_email = email;
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Track conversion event
    await trackConversion({
      event: 'checkout_session_created',
      planType,
      trial,
      abTestVariant,
      sessionId: session.id,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
};

/**
 * Track conversion events to analytics
 */
async function trackConversion(data) {
  try {
    // In production, send to analytics service (Mixpanel, Amplitude, etc.)
    console.log('[CONVERSION]', JSON.stringify(data, null, 2));

    // TODO: Send to analytics platform
    // await fetch('https://api.analytics-service.com/track', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
}
