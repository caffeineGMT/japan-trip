# Stripe Payment Integration Setup Guide

Complete setup guide for Stripe payment processing with Supabase authentication for the Japan Trip Companion app.

## Overview

This implementation provides:
- ✅ Template purchases (one-time payments)
- ✅ Premium subscription ($9.99/month)
- ✅ Customer portal for subscription management
- ✅ Webhook handling for automatic access grants
- ✅ Free tier with 3-day limit
- ✅ Supabase Row Level Security (RLS)

## Prerequisites

- Node.js 16+ installed
- Stripe account ([stripe.com](https://stripe.com))
- Supabase account ([supabase.com](https://supabase.com))
- Git for version control

## Step 1: Stripe Setup

### 1.1 Create Products in Stripe Dashboard

1. Log into [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** → **Add product**
3. Create the following products:

**Template Products (One-time Payment):**

| Product Name | Price | Metadata |
|--------------|-------|----------|
| Japan Cherry Blossom | $29.00 | `template_id: japan-cherry-blossom` |
| Kyoto Food Tour | $49.00 | `template_id: kyoto-food-tour` |
| Full Japan 14-Day | $99.00 | `template_id: full-japan-14day` |

**Premium Subscription (Recurring):**

| Product Name | Price | Billing | Metadata |
|--------------|-------|---------|----------|
| Premium Subscription | $9.99/month | Recurring monthly | `features: ["ai_optimizer", "unlimited_downloads", "offline_maps"]` |

4. Copy each **Price ID** (starts with `price_...`) - you'll need these for `.env`

### 1.2 Get API Keys

1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Copy:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Keep this secure!

### 1.3 Set Up Webhook

1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
   - For local testing: use [Stripe CLI](https://stripe.com/docs/stripe-cli) or [ngrok](https://ngrok.com)
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the **Webhook signing secret** (starts with `whsec_...`)

## Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Log into [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Wait for database provisioning (2-3 minutes)

### 2.2 Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy contents of `database-schema.sql` from this repo
4. Click **Run** to execute
5. Verify tables created: `users`, `templates`, `user_templates`

### 2.3 Get Supabase Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (`https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (Keep this secure!)

### 2.4 Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable desired auth providers:
   - Email/Password (recommended)
   - Google OAuth (optional)
   - GitHub OAuth (optional)
3. Configure email templates under **Authentication** → **Email Templates**

## Step 3: Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Stripe Price IDs (from Step 1.1)
STRIPE_PRICE_JAPAN_CHERRY_BLOSSOM=price_xxxxxxxxxxxxx
STRIPE_PRICE_KYOTO_FOOD_TOUR=price_xxxxxxxxxxxxx
STRIPE_PRICE_FULL_JAPAN_14DAY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PREMIUM_SUBSCRIPTION=price_xxxxxxxxxxxxx

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration
APP_URL=http://localhost:3000
PORT=3000
NODE_ENV=development
```

**⚠️ IMPORTANT:** Add `.env` to `.gitignore` - never commit secrets to git!

## Step 4: Update Frontend Configuration

### 4.1 Update Pricing Page

Edit `pricing.html` at lines 229-231:

```javascript
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const paymentClient = new PaymentClient();
paymentClient.initializeStripe('pk_test_YOUR_PUBLISHABLE_KEY');
```

### 4.2 Update Account Page

Edit `account.html` at lines 123-124:

```javascript
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## Step 5: Install Dependencies

```bash
npm install
```

This installs:
- `stripe` - Stripe Node.js library
- `@supabase/supabase-js` - Supabase client
- `express` - Web server
- `dotenv` - Environment variables
- `cors` - Cross-origin requests

## Step 6: Test Locally

### 6.1 Start Server

```bash
npm start
```

Server runs at `http://localhost:3000`

### 6.2 Test Webhook Locally

In a separate terminal, run Stripe CLI:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret and update `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 6.3 Test Payment Flow

1. **Create Test User**
   - Go to `http://localhost:3000`
   - Sign up with email/password in Supabase

2. **Test Template Purchase**
   - Navigate to `/pricing.html`
   - Click "Purchase" on any template
   - Use test card: `4242 4242 4242 4242`
   - Expiry: any future date
   - CVC: any 3 digits
   - Should redirect to `/success.html`

3. **Verify Access Granted**
   - Check Stripe Dashboard → Payments (should show successful payment)
   - Check Supabase → Table Editor → `user_templates` (should have new row)
   - Go to `/account.html` (should show purchased template)

4. **Test Subscription**
   - Click "Subscribe Now" on pricing page
   - Complete checkout with test card
   - Verify in Stripe Dashboard → Subscriptions
   - Check Supabase `users` table → `subscription_status` = 'active'

5. **Test Customer Portal**
   - Go to `/account.html`
   - Click "Manage Subscription"
   - Should open Stripe Customer Portal
   - Test updating payment method, canceling subscription

## Step 7: Deploy to Production

### 7.1 Environment Variables

Set production environment variables on your hosting platform (Vercel, Heroku, Railway, etc.):

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_JAPAN_CHERRY_BLOSSOM=price_...
STRIPE_PRICE_KYOTO_FOOD_TOUR=price_...
STRIPE_PRICE_FULL_JAPAN_14DAY=price_...
STRIPE_PRICE_PREMIUM_SUBSCRIPTION=price_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
APP_URL=https://your-production-domain.com
NODE_ENV=production
```

### 7.2 Update Webhook URL

In Stripe Dashboard, update webhook endpoint URL to your production domain:
`https://your-domain.com/api/stripe/webhook`

### 7.3 Deploy

```bash
git add .
git commit -m "Add Stripe payment processing"
git push origin main
```

Follow your hosting platform's deployment instructions.

## Step 8: Monitoring & Testing

### Production Checklist

- [ ] Test card `4242424242424242` completes checkout in <30s
- [ ] Webhook delivery rate is 100% (check Stripe Dashboard → Webhooks)
- [ ] Template access granted immediately after purchase
- [ ] Subscription status updates correctly
- [ ] Customer Portal works (cancel, update payment method)
- [ ] Free tier enforces 3-day limit
- [ ] Premium features require active subscription
- [ ] Email receipts sent automatically

### Monitoring

1. **Stripe Dashboard**
   - Monitor payments, subscriptions, failed charges
   - Check webhook delivery success rate
   - Review disputes and refunds

2. **Supabase Dashboard**
   - Monitor database growth
   - Check for errors in logs
   - Review Row Level Security policies

3. **Server Logs**
   - Monitor API errors
   - Track webhook processing
   - Watch for authentication failures

## Troubleshooting

### Webhook Not Firing

- Verify webhook URL is correct
- Check webhook signing secret matches `.env`
- Ensure endpoint is publicly accessible (use ngrok for local testing)
- Check Stripe Dashboard → Webhooks for delivery attempts

### Payment Not Granting Access

- Check webhook processed successfully
- Verify `user_id` in session metadata
- Check Supabase logs for insert errors
- Ensure Row Level Security policies allow service role

### Subscription Not Activating

- Verify subscription.created event is being received
- Check metadata includes `user_id`
- Ensure Stripe customer ID is saved in database

### Authentication Issues

- Verify Supabase JWT token is being sent in Authorization header
- Check token hasn't expired
- Ensure user exists in auth.users table

## Security Best Practices

1. **Never expose secret keys** - Use environment variables
2. **Verify webhook signatures** - Prevents fake events
3. **Use HTTPS in production** - Required for PCI compliance
4. **Implement rate limiting** - Prevent abuse
5. **Enable Stripe Radar** - Fraud detection
6. **Use Row Level Security** - Protect user data in Supabase
7. **Validate amounts** - Don't trust client-side prices
8. **Log security events** - Monitor for suspicious activity

## Support

- **Stripe Docs:** https://stripe.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Stripe Support:** https://support.stripe.com
- **Supabase Support:** https://supabase.com/support

## Revenue Metrics

Track these KPIs:
- Monthly Recurring Revenue (MRR)
- Customer Lifetime Value (LTV)
- Churn rate
- Conversion rate (free → paid)
- Average order value

**Target:** $83K+ MRR → $1M ARR

---

**Next Steps:**
1. Complete Stripe product setup
2. Run database schema in Supabase
3. Configure environment variables
4. Test locally with Stripe test cards
5. Deploy to production
6. Monitor first transactions

Good luck building your $1M revenue engine! 🚀💰
