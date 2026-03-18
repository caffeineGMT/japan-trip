# Payment Processing System

Production-ready Stripe payment integration for the Japan Trip Companion app.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Stripe and Supabase credentials
```

### 3. Set Up Database
- Open Supabase SQL Editor
- Run `database-schema.sql`

### 4. Test Configuration
```bash
npm test
```

### 5. Start Server
```bash
npm start
```

## What's Included

✅ **Backend API**
- Stripe Checkout integration
- Webhook handlers
- Customer Portal
- Access control middleware

✅ **Frontend Pages**
- Pricing page (`/pricing.html`)
- Account page (`/account.html`)
- Success page (`/success.html`)

✅ **Database Schema**
- User management
- Template ownership
- Subscription tracking

✅ **Documentation**
- Complete setup guide (`STRIPE_SETUP.md`)
- Implementation details (`PAYMENT_IMPLEMENTATION.md`)
- Test script (`test-payment.js`)

## Revenue Streams

1. **Template Purchases** (One-time)
   - Japan Cherry Blossom: $29
   - Kyoto Food Tour: $49
   - Full Japan 14-Day: $99

2. **Premium Subscription** (Recurring)
   - $9.99/month
   - AI optimizer, unlimited downloads, offline maps

3. **Free Tier**
   - 3-day Tokyo demo
   - No premium features

## File Structure

```
api/
├── stripe/
│   ├── checkout.js    # Create payment sessions
│   ├── webhook.js     # Handle Stripe events
│   └── portal.js      # Customer Portal
└── user/
    └── access.js      # Check user access

lib/
├── supabase-auth.js   # Auth helpers
└── payment-client.js  # Frontend library

middleware/
├── auth.js            # JWT verification
└── access-control.js  # Permission checks

database-schema.sql    # Supabase setup
test-payment.js        # Validation tests
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/stripe/checkout` | POST | Create checkout session |
| `/api/stripe/webhook` | POST | Process Stripe events |
| `/api/stripe/portal` | POST | Open Customer Portal |
| `/api/user/access` | GET | Get user access level |
| `/api/health` | GET | Health check |

## Testing

### Run Tests
```bash
npm test
```

### Test Payment Flow
1. Sign up at `/` (Supabase auth)
2. Go to `/pricing.html`
3. Click "Purchase" on any template
4. Use test card: `4242 4242 4242 4242`
5. Complete checkout
6. Verify access at `/account.html`

## Environment Variables

Required in `.env`:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://....supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
APP_URL=http://localhost:3000
```

## Security

✅ Webhook signature verification
✅ JWT authentication
✅ Row Level Security (RLS)
✅ Environment variables for secrets
✅ CORS configuration
✅ Rate limiting ready

## Deployment

See `STRIPE_SETUP.md` for complete deployment instructions.

**Quick steps:**
1. Set production environment variables
2. Create production Stripe products
3. Configure production webhook
4. Deploy to hosting platform
5. Test end-to-end

## Support

- **Setup Guide:** `STRIPE_SETUP.md`
- **Implementation Details:** `PAYMENT_IMPLEMENTATION.md`
- **Stripe Docs:** https://stripe.com/docs
- **Supabase Docs:** https://supabase.com/docs

## Target Revenue

**Goal:** $1M ARR ($83K MRR)

**Path:**
- 8,300 premium subscribers OR
- 1,660 template sales/month OR
- Mix of both

---

**Status:** Production Ready ✅

**Built for real users, real money.**
