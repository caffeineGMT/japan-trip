/**
 * Create Stripe Checkout Session
 * Handles Premium ($9.99/month) and Lifetime ($99 one-time) plans
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Price IDs for different plans (set these in your .env file)
const PRICE_IDS = {
  premium: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || 'price_premium_monthly',
  lifetime: process.env.STRIPE_PRICE_LIFETIME || 'price_lifetime'
};

module.exports = async (req, res) => {
  // CORS headers
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
    const {
      priceId,
      plan = 'premium',
      userId = null,
      successUrl,
      cancelUrl,
      email = null
    } = req.body;

    // Validate plan
    if (!['premium', 'lifetime'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan. Must be "premium" or "lifetime"' });
    }

    // Use provided priceId or fall back to defaults
    const finalPriceId = priceId || PRICE_IDS[plan];

    if (!finalPriceId || finalPriceId.includes('placeholder')) {
      return res.status(500).json({
        error: 'Stripe not configured',
        message: 'Please set STRIPE_PRICE_PREMIUM_MONTHLY and STRIPE_PRICE_LIFETIME in environment variables'
      });
    }

    // Build base session config
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.APP_URL || 'http://localhost:3000'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.APP_URL || 'http://localhost:3000'}/pricing.html`,

      // Metadata for tracking and webhooks
      metadata: {
        plan,
        userId: userId || 'guest',
        source: 'pricing_page',
        timestamp: new Date().toISOString()
      },

      // Allow promotion codes
      allow_promotion_codes: true,

      // Automatic tax calculation (enable in production with Stripe Tax)
      automatic_tax: {
        enabled: false,
      },
    };

    // Configure based on plan type
    if (plan === 'premium') {
      // Premium: Recurring subscription with 7-day free trial
      sessionConfig.mode = 'subscription';
      sessionConfig.subscription_data = {
        trial_period_days: 7,
        metadata: {
          plan: 'premium',
          trial_started: new Date().toISOString()
        }
      };
    } else if (plan === 'lifetime') {
      // Lifetime: One-time payment
      sessionConfig.mode = 'payment';
    }

    // Pre-fill customer email if provided
    if (email) {
      sessionConfig.customer_email = email;
    }

    // Link to existing customer if userId provided
    if (userId && userId !== 'guest') {
      // In production, you'd look up the Stripe customer ID from your database
      // sessionConfig.customer = stripeCustomerId;
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`[Stripe] Checkout session created: ${session.id} (${plan})`);

    // Track to analytics (PostHog)
    trackCheckoutEvent({
      event: 'checkout_session_created',
      plan,
      priceId: finalPriceId,
      sessionId: session.id,
      userId,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('[Stripe] Checkout error:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
};

/**
 * Track checkout events to PostHog analytics
 */
function trackCheckoutEvent(data) {
  try {
    // Log for debugging
    console.log('[Analytics] Checkout event:', JSON.stringify(data, null, 2));

    // In production with PostHog Node SDK:
    // const { PostHog } = require('posthog-node');
    // const posthog = new PostHog(process.env.POSTHOG_API_KEY);
    // posthog.capture({
    //   distinctId: data.userId || data.sessionId,
    //   event: data.event,
    //   properties: data
    // });

  } catch (error) {
    console.error('[Analytics] Tracking failed:', error);
    // Don't fail the request if analytics fails
  }
}
