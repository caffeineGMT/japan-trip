const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticateUser } = require('../../middleware/auth');
const { upsertUser, getUserById } = require('../../lib/supabase-auth');

// Template pricing configuration
const TEMPLATE_PRICES = {
  'japan-cherry-blossom': {
    name: 'Japan Cherry Blossom',
    priceId: process.env.STRIPE_PRICE_JAPAN_CHERRY_BLOSSOM,
    amount: 2900, // $29.00
  },
  'kyoto-food-tour': {
    name: 'Kyoto Food Tour',
    priceId: process.env.STRIPE_PRICE_KYOTO_FOOD_TOUR,
    amount: 4900, // $49.00
  },
  'full-japan-14day': {
    name: 'Full Japan 14-Day',
    priceId: process.env.STRIPE_PRICE_FULL_JAPAN_14DAY,
    amount: 9900, // $99.00
  }
};

// Premium subscription configuration
const PREMIUM_SUBSCRIPTION = {
  priceId: process.env.STRIPE_PRICE_PREMIUM_SUBSCRIPTION,
  name: 'Premium Subscription',
  amount: 999, // $9.99/month
};

/**
 * POST /api/stripe/checkout
 * Create a Stripe Checkout Session for template purchase or subscription
 *
 * Body:
 * - type: 'template' | 'subscription'
 * - templateId: string (required for type=template)
 */
router.post('/checkout', authenticateUser, async (req, res) => {
  try {
    const { type, templateId } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Validate request
    if (!type || !['template', 'subscription'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Type must be either "template" or "subscription"'
      });
    }

    if (type === 'template' && !templateId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'templateId is required for template purchases'
      });
    }

    // Get or create Stripe customer
    let stripeCustomerId;
    try {
      const user = await getUserById(userId);
      stripeCustomerId = user?.stripe_customer_id;
    } catch (error) {
      // User doesn't exist in database yet
      stripeCustomerId = null;
    }

    if (!stripeCustomerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: userId
        }
      });

      stripeCustomerId = customer.id;

      // Save customer ID to database
      await upsertUser(userId, userEmail, stripeCustomerId);
    }

    // Create Checkout Session based on type
    let sessionConfig = {
      customer: stripeCustomerId,
      mode: type === 'subscription' ? 'subscription' : 'payment',
      success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/pricing`,
      metadata: {
        user_id: userId,
        type: type
      }
    };

    if (type === 'template') {
      // Template purchase
      const template = TEMPLATE_PRICES[templateId];

      if (!template) {
        return res.status(400).json({
          error: 'Invalid template',
          message: `Template ${templateId} not found`
        });
      }

      sessionConfig.line_items = [{
        price: template.priceId,
        quantity: 1
      }];

      sessionConfig.metadata.template_id = templateId;
    } else {
      // Premium subscription
      sessionConfig.line_items = [{
        price: PREMIUM_SUBSCRIPTION.priceId,
        quantity: 1
      }];

      // Add subscription features to metadata
      sessionConfig.subscription_data = {
        metadata: {
          user_id: userId,
          features: JSON.stringify(['ai_optimizer', 'unlimited_downloads', 'offline_maps'])
        }
      };
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Return session ID to redirect user
    res.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      error: 'Checkout failed',
      message: error.message
    });
  }
});

/**
 * POST /api/stripe/create-checkout-session
 * Create a Stripe Checkout Session for pricing page (no auth required for trial)
 *
 * Body:
 * - priceId: string (optional, falls back to env vars)
 * - plan: 'premium' | 'lifetime'
 * - userId: string (optional)
 * - email: string (optional, for pre-filling)
 * - successUrl: string (optional)
 * - cancelUrl: string (optional)
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const {
      priceId,
      plan = 'premium',
      userId = null,
      email = null,
      successUrl,
      cancelUrl
    } = req.body;

    // Validate plan
    if (!['premium', 'lifetime'].includes(plan)) {
      return res.status(400).json({
        error: 'Invalid plan',
        message: 'Plan must be either "premium" or "lifetime"'
      });
    }

    // Price IDs from environment
    const PRICE_IDS = {
      premium: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || 'price_1QsxJ3D0b1uF6rEnMcdcg9j5',
      lifetime: process.env.STRIPE_PRICE_LIFETIME || 'price_1QsxJPD0b1uF6rEnYz6LKN8a'
    };

    // Use provided priceId or fall back to defaults
    const finalPriceId = priceId || PRICE_IDS[plan];

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

      // Metadata for tracking
      metadata: {
        plan,
        userId: userId || 'guest',
        source: 'pricing_page',
        timestamp: new Date().toISOString()
      },

      // Allow promotion codes
      allow_promotion_codes: true,
      automatic_tax: { enabled: false },
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

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`[Stripe] Checkout session created: ${session.id} (${plan})`);

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('[Stripe] Create checkout session error:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
});

module.exports = router;
