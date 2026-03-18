const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { provisionTenant, checkSubdomainAvailable } = require('../../lib/tenant-provisioner');

/**
 * POST /api/white-label/provision
 * Create new white-label tenant with Stripe subscription
 *
 * Body:
 *   - agencyName: string
 *   - subdomain: string (3-63 chars, lowercase, alphanumeric + hyphens)
 *   - tier: 'starter' | 'growth' | 'enterprise'
 *   - contactEmail: string
 *   - contactName: string (optional)
 *   - paymentMethodId: string (Stripe payment method ID)
 */
router.post('/provision', async (req, res) => {
  try {
    const {
      agencyName,
      subdomain,
      tier,
      contactEmail,
      contactName,
      paymentMethodId
    } = req.body;

    // Validation
    if (!agencyName || !subdomain || !tier || !contactEmail) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['agencyName', 'subdomain', 'tier', 'contactEmail']
      });
    }

    const validTiers = ['starter', 'growth', 'enterprise'];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({
        error: 'Invalid tier',
        validTiers: validTiers
      });
    }

    // Check subdomain availability
    const available = await checkSubdomainAvailable(subdomain);
    if (!available) {
      return res.status(409).json({
        error: 'Subdomain already taken',
        subdomain: subdomain
      });
    }

    // Tier pricing
    const tierPricing = {
      starter: {
        priceId: process.env.STRIPE_PRICE_STARTER || 'price_starter',
        amount: 49900, // $499/mo
        description: 'Starter - 100 monthly users, custom subdomain'
      },
      growth: {
        priceId: process.env.STRIPE_PRICE_GROWTH || 'price_growth',
        amount: 99900, // $999/mo
        description: 'Growth - 500 monthly users, custom branding'
      },
      enterprise: {
        priceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
        amount: 249900, // $2499/mo
        description: 'Enterprise - Unlimited users, API access'
      }
    };

    const pricing = tierPricing[tier];

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: contactEmail,
      name: agencyName,
      metadata: {
        subdomain: subdomain,
        tier: tier,
        contactName: contactName || ''
      }
    });

    // Attach payment method
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id
      });

      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });
    }

    // Create Stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: pricing.priceId
      }],
      metadata: {
        subdomain: subdomain,
        tier: tier,
        agencyName: agencyName
      },
      trial_period_days: 14, // 14-day trial
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });

    // Provision tenant (creates DNS, database record)
    const result = await provisionTenant({
      agencyName,
      subdomain,
      tier,
      contactEmail,
      contactName,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription.id,
      trialDays: 14
    });

    res.status(201).json({
      success: true,
      tenant: result.tenant,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        trialEnd: subscription.trial_end,
        currentPeriodEnd: subscription.current_period_end
      },
      dns: result.dns,
      message: `White-label instance provisioned successfully. Your site will be available at https://${subdomain}.tripcompanion.app within 5 minutes.`
    });

  } catch (error) {
    console.error('Provisioning error:', error);
    res.status(500).json({
      error: 'Provisioning failed',
      message: error.message
    });
  }
});

/**
 * GET /api/white-label/check-subdomain/:subdomain
 * Check if subdomain is available
 */
router.get('/check-subdomain/:subdomain', async (req, res) => {
  try {
    const { subdomain } = req.params;

    const available = await checkSubdomainAvailable(subdomain);

    res.json({
      subdomain: subdomain,
      available: available
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check subdomain',
      message: error.message
    });
  }
});

module.exports = router;
