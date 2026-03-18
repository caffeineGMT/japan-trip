const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {
  updateUserSubscription,
  addUserTemplate,
  supabaseAdmin
} = require('../../lib/supabase-auth');

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 *
 * Events handled:
 * - payment_intent.succeeded: Mark template as purchased
 * - checkout.session.completed: Process completed checkout
 * - customer.subscription.created: Activate subscription
 * - customer.subscription.updated: Update subscription status
 * - customer.subscription.deleted: Cancel subscription
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('Invoice payment succeeded:', invoice.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.error('Invoice payment failed:', invoice.id);
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message
    });
  }
});

/**
 * Handle checkout.session.completed event
 * Process template purchases and subscription activations
 */
async function handleCheckoutCompleted(session) {
  const userId = session.metadata.user_id;
  const type = session.metadata.type;

  console.log('Checkout completed:', {
    sessionId: session.id,
    userId,
    type,
    paymentStatus: session.payment_status
  });

  // Only process if payment was successful
  if (session.payment_status !== 'paid') {
    console.log('Payment not completed yet, skipping...');
    return;
  }

  if (type === 'template') {
    // Template purchase
    const templateId = session.metadata.template_id;

    if (!templateId) {
      console.error('Template ID missing from session metadata');
      return;
    }

    // Grant access to template
    await addUserTemplate(userId, templateId);
    console.log(`Template ${templateId} granted to user ${userId}`);

  } else if (type === 'subscription') {
    // Subscription will be handled by subscription.created event
    console.log('Subscription checkout completed, waiting for subscription.created event');
  }
}

/**
 * Handle customer.subscription.created event
 * Activate premium subscription for user
 */
async function handleSubscriptionCreated(subscription) {
  const userId = subscription.metadata.user_id;

  if (!userId) {
    console.error('User ID missing from subscription metadata');
    return;
  }

  // Update user subscription status
  await updateUserSubscription(userId, subscription.status, subscription.id);

  console.log(`Subscription ${subscription.id} created for user ${userId}`, {
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000)
  });
}

/**
 * Handle customer.subscription.updated event
 * Update subscription status (active, past_due, canceled, etc.)
 */
async function handleSubscriptionUpdated(subscription) {
  const userId = subscription.metadata.user_id;

  if (!userId) {
    // Try to find user by customer ID
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('stripe_customer_id', subscription.customer)
      .single();

    if (!user) {
      console.error('Could not find user for subscription:', subscription.id);
      return;
    }

    await updateUserSubscription(user.id, subscription.status, subscription.id);
  } else {
    await updateUserSubscription(userId, subscription.status, subscription.id);
  }

  console.log(`Subscription ${subscription.id} updated`, {
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end
  });
}

/**
 * Handle customer.subscription.deleted event
 * Deactivate premium subscription
 */
async function handleSubscriptionDeleted(subscription) {
  const userId = subscription.metadata.user_id;

  if (!userId) {
    // Try to find user by customer ID
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('stripe_customer_id', subscription.customer)
      .single();

    if (!user) {
      console.error('Could not find user for subscription:', subscription.id);
      return;
    }

    await updateUserSubscription(user.id, 'canceled', subscription.id);
  } else {
    await updateUserSubscription(userId, 'canceled', subscription.id);
  }

  console.log(`Subscription ${subscription.id} canceled for user ${userId}`);
}

/**
 * Handle invoice.payment_failed event
 * Update subscription status to past_due
 */
async function handlePaymentFailed(invoice) {
  if (!invoice.subscription) {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata.user_id;

  if (!userId) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('stripe_customer_id', subscription.customer)
      .single();

    if (user) {
      await updateUserSubscription(user.id, 'past_due', subscription.id);
    }
  } else {
    await updateUserSubscription(userId, 'past_due', subscription.id);
  }

  console.log(`Payment failed for subscription ${subscription.id}`);
}

module.exports = router;
