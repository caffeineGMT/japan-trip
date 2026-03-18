# Deployment Checklist

## Pre-Deployment

### Stripe Configuration
- [ ] Create production Stripe account
- [ ] Create 4 products in Stripe Dashboard:
  - [ ] Japan Cherry Blossom ($29)
  - [ ] Kyoto Food Tour ($49)
  - [ ] Full Japan 14-Day ($99)
  - [ ] Premium Subscription ($9.99/month)
- [ ] Copy all Price IDs
- [ ] Get production API keys (pk_live_..., sk_live_...)
- [ ] Configure webhook endpoint URL
- [ ] Copy webhook secret (whsec_...)
- [ ] Enable Stripe Radar for fraud detection
- [ ] Configure email receipts

### Supabase Configuration
- [ ] Create production Supabase project
- [ ] Run `database-schema.sql` in SQL Editor
- [ ] Verify all tables created (users, templates, user_templates)
- [ ] Copy Project URL
- [ ] Copy anon key
- [ ] Copy service_role key
- [ ] Enable email authentication
- [ ] Configure email templates
- [ ] Set up custom domain (optional)

### Environment Variables
- [ ] Set all production environment variables:
  ```
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_PUBLISHABLE_KEY=pk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  STRIPE_PRICE_JAPAN_CHERRY_BLOSSOM=price_...
  STRIPE_PRICE_KYOTO_FOOD_TOUR=price_...
  STRIPE_PRICE_FULL_JAPAN_14DAY=price_...
  STRIPE_PRICE_PREMIUM_SUBSCRIPTION=price_...
  SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_ANON_KEY=eyJ...
  SUPABASE_SERVICE_ROLE_KEY=eyJ...
  APP_URL=https://your-domain.com
  NODE_ENV=production
  ```

### Code Updates
- [ ] Update `pricing.html` with production Supabase URL and Stripe key
- [ ] Update `account.html` with production Supabase URL
- [ ] Verify `.env` is in `.gitignore`
- [ ] Remove any test/debug code
- [ ] Run `npm test` locally (should pass)

## Deployment

### Deploy Application
- [ ] Push code to git repository
- [ ] Deploy to hosting platform (Vercel/Heroku/Railway/etc.)
- [ ] Verify environment variables set correctly
- [ ] Check build logs for errors
- [ ] Verify deployment URL is live

### Post-Deployment Testing
- [ ] Visit production URL
- [ ] Test health check: `https://your-domain.com/api/health`
- [ ] Create test user account
- [ ] Test free tier access (3 days)
- [ ] Test template purchase flow:
  - [ ] Use test card in production mode: 4242424242424242
  - [ ] Verify checkout completes
  - [ ] Check Stripe Dashboard for payment
  - [ ] Verify webhook fired successfully
  - [ ] Confirm access granted in account page
  - [ ] Check Supabase user_templates table
- [ ] Test subscription flow:
  - [ ] Subscribe with test card
  - [ ] Verify subscription active in Stripe
  - [ ] Check user subscription_status in Supabase
  - [ ] Test Customer Portal access
  - [ ] Test canceling subscription
- [ ] Test with real card (small amount)
- [ ] Verify email receipts sent

## Monitoring Setup

### Stripe Dashboard
- [ ] Set up email alerts for:
  - [ ] Failed payments
  - [ ] Disputes/chargebacks
  - [ ] High-value transactions
- [ ] Enable webhook failure notifications
- [ ] Set up Stripe Radar rules
- [ ] Configure billing thresholds

### Supabase Dashboard
- [ ] Enable database backup
- [ ] Set up usage alerts
- [ ] Monitor active connections
- [ ] Check Row Level Security policies active

### Application Monitoring
- [ ] Set up error tracking (Sentry/LogRocket)
- [ ] Configure uptime monitoring (UptimeRobot/Pingdom)
- [ ] Set up performance monitoring
- [ ] Create dashboard for key metrics:
  - [ ] Daily revenue
  - [ ] Active subscriptions
  - [ ] Conversion rate
  - [ ] Webhook success rate

## Security Checks

- [ ] HTTPS enabled on production domain
- [ ] Webhook signature verification working
- [ ] JWT tokens being validated
- [ ] Row Level Security policies active
- [ ] Service role key not exposed to frontend
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (optional but recommended)

## Documentation

- [ ] Update README with production URL
- [ ] Document any custom configuration
- [ ] Create runbook for common issues
- [ ] Document backup/recovery procedures

## Launch Preparation

### Marketing
- [ ] Landing page live
- [ ] Pricing page live
- [ ] Payment flow tested end-to-end
- [ ] Refund policy documented
- [ ] Terms of service
- [ ] Privacy policy

### Support
- [ ] Set up support email
- [ ] Create FAQ
- [ ] Document common payment issues
- [ ] Set up customer notification system

### Analytics
- [ ] Google Analytics installed
- [ ] Conversion tracking setup
- [ ] Revenue tracking configured
- [ ] Funnel analysis setup

## Post-Launch

### First Week
- [ ] Monitor webhook delivery rate (target: 100%)
- [ ] Check payment success rate (target: >95%)
- [ ] Monitor customer support tickets
- [ ] Review first customer feedback
- [ ] Check for any error spikes
- [ ] Verify automated emails working

### First Month
- [ ] Review revenue vs. projections
- [ ] Analyze conversion rates
- [ ] Identify drop-off points
- [ ] A/B test pricing/messaging
- [ ] Gather customer testimonials
- [ ] Optimize based on data

## Rollback Plan

If issues occur:

1. **Payment failures:**
   - [ ] Check Stripe Dashboard webhook logs
   - [ ] Verify webhook secret matches
   - [ ] Test with Stripe CLI locally
   - [ ] Check server logs for errors

2. **Access not granted:**
   - [ ] Verify webhook fired
   - [ ] Check Supabase logs
   - [ ] Manually grant access if needed
   - [ ] Refund if can't resolve quickly

3. **Critical bugs:**
   - [ ] Rollback deployment
   - [ ] Disable payment temporarily
   - [ ] Notify affected customers
   - [ ] Fix issue in staging
   - [ ] Redeploy when verified

## Success Metrics

Track these KPIs weekly:

- [ ] Total revenue (daily/weekly/monthly)
- [ ] MRR (Monthly Recurring Revenue)
- [ ] Number of active subscriptions
- [ ] Template purchases per day
- [ ] Conversion rate (free → paid)
- [ ] Churn rate
- [ ] Customer Lifetime Value (LTV)
- [ ] Payment success rate
- [ ] Webhook delivery rate
- [ ] Support ticket volume

## Targets

**Month 1:**
- 100+ visitors
- 10% conversion rate
- $1,000+ revenue
- <5% churn rate

**Month 3:**
- 1,000+ visitors
- 15% conversion rate
- $5,000+ MRR
- Webhook success 99%+

**Month 12:**
- $83,000 MRR ($1M ARR)
- 8,000+ customers
- <3% churn rate
- 5-star reviews

---

## Final Pre-Launch Check

**Everything working?**
- [ ] ✅ Payments processing
- [ ] ✅ Access granted automatically
- [ ] ✅ Subscriptions recurring
- [ ] ✅ Webhooks firing 100%
- [ ] ✅ Customer Portal working
- [ ] ✅ Free tier limits enforced
- [ ] ✅ All tests passing
- [ ] ✅ Monitoring configured
- [ ] ✅ Team trained on support issues

**Ready to launch?** 🚀

Deploy with confidence. You've built a production-quality payment system ready for real customers and real revenue.

**Good luck reaching $1M ARR!** 💰
