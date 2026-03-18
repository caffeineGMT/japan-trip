/**
 * Payment System Test Script
 * Validates Stripe and Supabase configuration
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { supabaseAdmin } = require('./lib/supabase-auth');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

function success(msg) {
  console.log(`${colors.green}✓${colors.reset} ${msg}`);
}

function error(msg) {
  console.log(`${colors.red}✗${colors.reset} ${msg}`);
}

function info(msg) {
  console.log(`${colors.blue}ℹ${colors.reset} ${msg}`);
}

function warn(msg) {
  console.log(`${colors.yellow}⚠${colors.reset} ${msg}`);
}

function section(msg) {
  console.log(`\n${colors.bold}${msg}${colors.reset}`);
}

async function testEnvironmentVariables() {
  section('1. Testing Environment Variables');

  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'APP_URL'
  ];

  const optional = [
    'STRIPE_PRICE_JAPAN_CHERRY_BLOSSOM',
    'STRIPE_PRICE_KYOTO_FOOD_TOUR',
    'STRIPE_PRICE_FULL_JAPAN_14DAY',
    'STRIPE_PRICE_PREMIUM_SUBSCRIPTION'
  ];

  let allPresent = true;

  for (const key of required) {
    if (process.env[key]) {
      success(`${key} is set`);
    } else {
      error(`${key} is missing`);
      allPresent = false;
    }
  }

  for (const key of optional) {
    if (process.env[key]) {
      success(`${key} is set`);
    } else {
      warn(`${key} is not set (optional)`);
    }
  }

  return allPresent;
}

async function testStripeConnection() {
  section('2. Testing Stripe Connection');

  try {
    const account = await stripe.accounts.retrieve();
    success(`Connected to Stripe account: ${account.email || account.id}`);
    info(`  Business name: ${account.business_profile?.name || 'Not set'}`);
    info(`  Country: ${account.country}`);
    return true;
  } catch (err) {
    error(`Failed to connect to Stripe: ${err.message}`);
    return false;
  }
}

async function testStripeProducts() {
  section('3. Testing Stripe Products');

  const priceIds = [
    { id: process.env.STRIPE_PRICE_JAPAN_CHERRY_BLOSSOM, name: 'Japan Cherry Blossom' },
    { id: process.env.STRIPE_PRICE_KYOTO_FOOD_TOUR, name: 'Kyoto Food Tour' },
    { id: process.env.STRIPE_PRICE_FULL_JAPAN_14DAY, name: 'Full Japan 14-Day' },
    { id: process.env.STRIPE_PRICE_PREMIUM_SUBSCRIPTION, name: 'Premium Subscription' }
  ];

  let allValid = true;

  for (const { id, name } of priceIds) {
    if (!id) {
      warn(`${name} price ID not configured`);
      continue;
    }

    try {
      const price = await stripe.prices.retrieve(id);
      const amount = price.unit_amount / 100;
      const currency = price.currency.toUpperCase();
      const type = price.type === 'recurring' ? 'subscription' : 'one-time';
      success(`${name}: ${currency} $${amount} (${type})`);
    } catch (err) {
      error(`${name}: Invalid price ID - ${err.message}`);
      allValid = false;
    }
  }

  return allValid;
}

async function testSupabaseConnection() {
  section('4. Testing Supabase Connection');

  try {
    // Test connection by querying templates table
    const { data, error } = await supabaseAdmin
      .from('templates')
      .select('count');

    if (error) {
      error(`Supabase query failed: ${error.message}`);
      return false;
    }

    success('Connected to Supabase successfully');
    return true;
  } catch (err) {
    error(`Failed to connect to Supabase: ${err.message}`);
    return false;
  }
}

async function testSupabaseTables() {
  section('5. Testing Supabase Database Schema');

  const tables = ['users', 'templates', 'user_templates'];
  let allPresent = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('count')
        .limit(1);

      if (error) {
        error(`Table '${table}' is missing or inaccessible: ${error.message}`);
        allPresent = false;
      } else {
        success(`Table '${table}' exists`);

        // Check row count
        const { count } = await supabaseAdmin
          .from(table)
          .select('*', { count: 'exact', head: true });

        info(`  Rows: ${count || 0}`);
      }
    } catch (err) {
      error(`Error checking table '${table}': ${err.message}`);
      allPresent = false;
    }
  }

  return allPresent;
}

async function testWebhookEndpoint() {
  section('6. Testing Webhook Configuration');

  try {
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });

    if (webhooks.data.length === 0) {
      warn('No webhook endpoints configured');
      info('  Set up webhook at: https://dashboard.stripe.com/webhooks');
      return false;
    }

    let found = false;
    for (const webhook of webhooks.data) {
      if (webhook.url.includes('/api/stripe/webhook')) {
        success(`Webhook configured: ${webhook.url}`);
        info(`  Status: ${webhook.status}`);
        info(`  Events: ${webhook.enabled_events.join(', ')}`);
        found = true;
      }
    }

    if (!found) {
      warn('No webhook endpoint found for /api/stripe/webhook');
      info('  Configure at: https://dashboard.stripe.com/webhooks');
    }

    return found;
  } catch (err) {
    error(`Failed to check webhooks: ${err.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log(`${colors.bold}${colors.blue}`);
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   Payment System Validation Test     ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log(colors.reset);

  const results = {
    env: await testEnvironmentVariables(),
    stripe: await testStripeConnection(),
    products: await testStripeProducts(),
    supabase: await testSupabaseConnection(),
    schema: await testSupabaseTables(),
    webhook: await testWebhookEndpoint()
  };

  section('Test Summary');

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  console.log(`\nTests passed: ${passed}/${total}\n`);

  if (passed === total) {
    success('All tests passed! Your payment system is ready. 🚀');
    console.log('\nNext steps:');
    info('  1. Run `npm start` to start the server');
    info('  2. Visit http://localhost:3000/pricing.html');
    info('  3. Test checkout with card 4242424242424242');
  } else {
    warn(`${total - passed} test(s) failed. Please fix the issues above.`);
    console.log('\nRefer to STRIPE_SETUP.md for detailed setup instructions.');
  }

  console.log('');
  process.exit(passed === total ? 0 : 1);
}

// Run tests
runAllTests().catch(err => {
  error(`Unexpected error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
