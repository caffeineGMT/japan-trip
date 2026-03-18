const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticateUser } = require('../../middleware/auth');
const { getUserById } = require('../../lib/supabase-auth');

/**
 * POST /api/stripe/portal
 * Create a Stripe Customer Portal session
 * Allows users to manage their subscription, update payment methods, view invoices, etc.
 */
router.post('/portal', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's Stripe customer ID
    const user = await getUserById(userId);

    if (!user || !user.stripe_customer_id) {
      return res.status(400).json({
        error: 'No customer found',
        message: 'You do not have a Stripe customer account yet. Please make a purchase first.'
      });
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.APP_URL}/account`,
    });

    res.json({
      url: session.url
    });

  } catch (error) {
    console.error('Portal creation error:', error);
    res.status(500).json({
      error: 'Portal creation failed',
      message: error.message
    });
  }
});

module.exports = router;
