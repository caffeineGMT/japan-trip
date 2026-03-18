# White-Label Multi-Tenant SaaS Platform

Complete white-label solution for boutique Japan travel agencies. Launch branded trip planning platforms in 24 hours with subdomain routing, custom branding, Stripe subscriptions, and automated DNS provisioning.

## 🚀 Quick Start

### 1. Database Setup

Run the migration in your Supabase SQL Editor:

```sql
-- Execute db/migrations/003_tenants.sql
-- This creates tenants, tenant_users, tenant_analytics, and affiliate_clicks tables
```

### 2. Environment Configuration

Add to your `.env` file:

```bash
# Multi-Tenant White-Label
MAIN_DOMAIN=tripcompanion.app
SERVER_IP=your_production_ip_address

# Cloudflare DNS (get from Cloudflare dashboard)
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ZONE_ID=your_zone_id

# Stripe White-Label Pricing (create these products in Stripe)
STRIPE_PRICE_STARTER=price_xxxxxxxxx  # $499/mo
STRIPE_PRICE_GROWTH=price_xxxxxxxxx   # $999/mo
STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxx  # $2499/mo
```

### 3. Create Stripe Products

In your Stripe Dashboard:

1. **Starter Plan** - $499/month recurring
   - Name: "White-Label Starter"
   - 100 monthly active users
   - Custom subdomain
   - Remove "Powered by" branding

2. **Growth Plan** - $999/month recurring
   - Name: "White-Label Growth"
   - 500 monthly active users
   - Custom logo & colors
   - Priority support

3. **Enterprise Plan** - $2,499/month recurring
   - Name: "White-Label Enterprise"
   - Unlimited users
   - Custom domain
   - API access
   - Dedicated support

Copy the Price IDs into your `.env` file.

### 4. Configure Cloudflare DNS

1. Go to Cloudflare Dashboard
2. Select your domain zone (e.g., tripcompanion.app)
3. Get your Zone ID from the right sidebar
4. Create an API token:
   - Go to Profile → API Tokens → Create Token
   - Use "Edit zone DNS" template
   - Select your zone
   - Copy the token

### 5. Start Server

```bash
npm install
npm start
```

The server will report multi-tenant status:
```
🔐 Multi-tenant: enabled
☁️  Cloudflare configured: true
```

---

## 📋 System Architecture

### Multi-Tenant Routing

**Subdomain Resolution:**
```
acme.tripcompanion.app → tenant with subdomain='acme'
customagency.com → tenant with custom_domain='customagency.com'
tripcompanion.app → main platform (no tenant)
```

**Request Flow:**
1. `multiTenantMiddleware` extracts subdomain/custom domain
2. Queries `tenants` table in Supabase
3. Injects `req.tenant` with configuration
4. `injectTenantBranding` modifies HTML with custom CSS

**Branding Injection:**
```javascript
req.tenant = {
  id: 'uuid',
  agencyName: 'Sakura Travel Co.',
  branding: {
    colors: { primary: '#4f46e5', secondary: '#7c3aed', accent: '#db2777' },
    logoUrl: '/uploads/logos/tenant-uuid.png',
    customCss: '/* Agency CSS */'
  },
  limits: { maxMonthlyUsers: 100 },
  isWhiteLabel: true
}
```

### Database Schema

**tenants** - Agency white-label instances
- `subdomain` - e.g., 'sakura' → sakura.tripcompanion.app
- `custom_domain` - e.g., 'sakuratravel.com' (Enterprise only)
- `tier` - starter | growth | enterprise
- `brand_colors` - JSONB { primary, secondary, accent }
- `logo_url` - S3/local path to uploaded logo
- `stripe_subscription_id` - Linked Stripe subscription
- `max_monthly_users` - Tier-based limit

**tenant_users** - Many-to-many users → tenants
- `tenant_id` → `tenants.id`
- `user_id` → `users.id`
- `role` - admin | member

**tenant_analytics** - Daily aggregated metrics
- `active_users` - Daily active users
- `trips_created` - Trips created that day
- `booking_clicks` - Affiliate link clicks
- `estimated_commission_cents` - Revenue estimate

**affiliate_clicks** - Click tracking with tenant attribution
- `tenant_id` - Which white-label instance
- `provider` - booking | getyourguide | jrpass
- `destination_url` - Affiliate link
- `estimated_commission_cents` - Revenue per click

---

## 🎨 Agency Onboarding Flow

### Step 1: Signup (https://tripcompanion.app/partners)

Agency fills form:
- Agency name
- Desired subdomain (validated real-time)
- Tier selection
- Contact email

### Step 2: Provisioning (POST /api/white-label/provision)

Backend automatically:
1. ✅ Validates subdomain format & availability
2. 💳 Creates Stripe customer & subscription
3. 🌐 Creates Cloudflare DNS CNAME record
4. 💾 Inserts tenant record in Supabase
5. ✉️ Sends welcome email with dashboard link

Response:
```json
{
  "success": true,
  "tenant": {
    "id": "uuid",
    "url": "https://sakura.tripcompanion.app",
    "dashboardUrl": "/partners/dashboard?tenant=uuid",
    "trialEndsAt": "2026-04-01T00:00:00Z"
  }
}
```

### Step 3: Dashboard Access

Agency admin goes to `/partners/dashboard?tenant=uuid` to:
- Upload logo (processed with Sharp, max 5MB)
- Customize brand colors (hex picker)
- Add custom CSS
- View analytics (Chart.js charts)
- Set up custom domain (Enterprise)
- Generate API keys (Enterprise)

---

## 🔧 API Endpoints

### POST /api/white-label/provision
Create new white-label tenant.

**Request:**
```json
{
  "agencyName": "Sakura Travel Co.",
  "subdomain": "sakura",
  "tier": "growth",
  "contactEmail": "admin@sakura.travel",
  "contactName": "John Doe",
  "paymentMethodId": "pm_xxxxxxxxx"
}
```

**Response:**
```json
{
  "success": true,
  "tenant": {
    "id": "uuid",
    "url": "https://sakura.tripcompanion.app",
    "dashboardUrl": "/partners/dashboard?tenant=uuid"
  },
  "subscription": {
    "id": "sub_xxxxxxxxx",
    "status": "trialing",
    "trialEnd": 1712016000
  },
  "dns": {
    "success": true,
    "recordId": "cloudflare_record_id"
  }
}
```

### GET /api/white-label/check-subdomain/:subdomain
Check if subdomain is available.

**Response:**
```json
{
  "subdomain": "sakura",
  "available": true
}
```

### GET /api/white-label/config/:tenantId
Get tenant configuration and analytics.

**Response:**
```json
{
  "tenant": {
    "id": "uuid",
    "agencyName": "Sakura Travel Co.",
    "subdomain": "sakura",
    "tier": "growth",
    "branding": {
      "colors": { "primary": "#4f46e5", "secondary": "#7c3aed", "accent": "#db2777" },
      "logoUrl": "/uploads/logos/tenant-uuid.png"
    }
  },
  "analytics": [...],
  "stats": {
    "totalUsers": 45,
    "activeUsers": 28,
    "tripsCreated": 12,
    "bookingClicks": 34,
    "estimatedRevenue": 127.50
  }
}
```

### PUT /api/white-label/config/:tenantId
Update tenant branding.

**Request:**
```json
{
  "brandColors": {
    "primary": "#FF5733",
    "secondary": "#C70039",
    "accent": "#900C3F"
  },
  "customCss": ".custom-class { color: red; }",
  "customDomain": "sakuratravel.com"
}
```

### POST /api/white-label/config/:tenantId/logo
Upload tenant logo (multipart/form-data).

**Form fields:**
- `logo` - Image file (JPEG, PNG, SVG, WebP, max 5MB)

**Processing:**
- Resized to max 400x400px
- Compressed to PNG
- Saved to `/uploads/logos/`

### GET /api/white-label/config/:tenantId/analytics
Get detailed analytics for charts.

**Query params:**
- `days` - Number of days (default: 30)

**Response:**
```json
{
  "analytics": [
    {
      "date": "2026-03-18",
      "active_users": 28,
      "trips_created": 5,
      "booking_clicks": 12,
      "estimated_commission_cents": 4500
    }
  ],
  "totals": {
    "activeUsers": 28,
    "tripsCreated": 67,
    "bookingClicks": 134,
    "estimatedRevenue": 456.78
  }
}
```

---

## 💰 Pricing Tiers

| Feature | Starter ($499/mo) | Growth ($999/mo) | Enterprise ($2,499/mo) |
|---------|-------------------|------------------|------------------------|
| Monthly Active Users | 100 | 500 | Unlimited |
| Custom Subdomain | ✅ | ✅ | ✅ |
| Remove "Powered by" | ✅ | ✅ | ✅ |
| Custom Logo | ❌ | ✅ | ✅ |
| Custom Colors | ❌ | ✅ | ✅ |
| Custom Domain | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |
| Dedicated Support | ❌ | ❌ | ✅ |

### Revenue Model

**Agency keeps 100% of affiliate booking commissions.**

We charge a fixed SaaS fee:
- Starter: $499/month
- Growth: $999/month
- Enterprise: $2,499/month

**Revenue Projections:**
- **1 customer in 60 days** = $499 MRR
- **10 customers in 6 months** = $4,990 MRR
- **50 customers in 1 year** = $24,950 MRR

---

## 🌐 DNS & Custom Domains

### Subdomain Setup (Automatic)

When agency provisions:
1. Backend calls Cloudflare API
2. Creates CNAME: `subdomain.tripcompanion.app` → `tripcompanion.app`
3. Cloudflare proxy enabled (SSL + CDN)
4. DNS propagates in ~5 minutes

### Custom Domain Setup (Enterprise, Manual)

Agency must:
1. Add CNAME record in their DNS:
   ```
   @ → tripcompanion.app
   ```
   OR
   ```
   www → tripcompanion.app
   ```

2. Update tenant record in dashboard:
   ```
   Custom Domain: sakuratravel.com
   ```

3. Backend validates domain resolves correctly

4. SSL certificate auto-provisioned by Cloudflare

---

## 📊 Analytics & Reporting

### Daily Aggregation

Cron job runs daily:
```sql
SELECT aggregate_daily_tenant_analytics(CURRENT_DATE - INTERVAL '1 day');
```

Calculates per tenant:
- Active users (unique users who logged in)
- Trips created
- Booking clicks (tracked via affiliate middleware)
- Estimated commission (based on provider averages)

### Dashboard Charts

Built with Chart.js:
- 30-day active users trend
- Booking clicks over time
- Revenue estimates
- Conversion funnel (visits → trips → bookings)

---

## 🎯 Sales Strategy

### Target Market

Boutique Japan travel agencies:
- 50 agencies from Google/Yelp (Tokyo, Kyoto, Osaka specialists)
- Niche focus (cherry blossom tours, food tours, cultural experiences)
- No in-house dev team
- Currently using generic booking platforms

### Outbound Email Template

```
Subject: Launch Your Branded Japan Trip Planner in 24 Hours

Hi [Agency Name],

I noticed you specialize in [niche] Japan tours. What if you could offer your clients a fully-branded trip planning experience without hiring developers?

✨ See live demo: https://demo.tripcompanion.app
   Login: demo@agency.com / demo123

What you get:
• Your domain: youragency.tripcompanion.app
• Your logo + colors on every page
• 100% of booking commissions (we charge flat SaaS fee)
• Launch in 24 hours, not 6 months

14-day free trial, no credit card required.

Interested? Reply with your agency name + preferred subdomain.

Best,
[Your Name]
```

### Success Metrics

- **Week 1-2:** 50 outbound emails sent
- **Week 3-4:** 5 demo signups
- **Week 5-8:** 1 paying customer ($499 MRR)
- **Month 6:** 10 customers ($4,990 MRR)
- **Year 1:** 50 customers ($24,950 MRR)

---

## 🔐 Security Considerations

### API Key Generation (Enterprise)

```javascript
const apiKey = `tk_${crypto.randomBytes(32).toString('hex')}`;
const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
```

- Full key shown **only once** on generation
- Hash stored in database
- Prefix stored for display (`tk_abcd1234...`)

### Rate Limiting

Check tenant usage before serving:
```javascript
const { currentActiveUsers, limit } = await checkTenantLimits(req.tenant.id);
if (currentActiveUsers >= limit) {
  return res.status(429).json({ error: 'Usage limit reached' });
}
```

### Row-Level Security (RLS)

Supabase policies:
- Tenants can only read/update their own data
- Tenant admins can manage their tenant
- Service role has full access (backend only)

---

## 🚢 Deployment Checklist

- [ ] Run `db/migrations/003_tenants.sql` in Supabase
- [ ] Set all environment variables in `.env`
- [ ] Create 3 Stripe products (Starter, Growth, Enterprise)
- [ ] Configure Cloudflare API token + Zone ID
- [ ] Set up DNS wildcard: `*.tripcompanion.app` → your server IP
- [ ] Test subdomain provisioning: `http://localhost:3000/partners`
- [ ] Create demo tenant for sales: `demo.tripcompanion.app`
- [ ] Set up daily cron for analytics aggregation
- [ ] Configure email service for welcome emails
- [ ] Add Stripe webhook endpoint for subscription events
- [ ] Test custom domain flow (Enterprise)
- [ ] Document API for enterprise customers

---

## 🐛 Troubleshooting

### Subdomain not resolving

1. Check Cloudflare DNS records:
   ```bash
   dig sakura.tripcompanion.app
   ```

2. Verify CNAME created:
   - Go to Cloudflare Dashboard → DNS
   - Look for `sakura` → `tripcompanion.app`

3. Check proxy status (should be orange cloud = proxied)

4. DNS propagation can take 5-15 minutes

### Logo upload fails

1. Check file size < 5MB
2. Verify Sharp is installed: `npm list sharp`
3. Check uploads directory exists: `mkdir -p uploads/logos`
4. Verify write permissions: `chmod 755 uploads/`

### Branding not applying

1. Check `injectTenantBranding` middleware is registered
2. Verify tenant data loaded: `console.log(req.tenant)`
3. Inspect HTML source for `<style id="tenant-branding">`
4. Clear browser cache

### Analytics not updating

1. Run aggregation manually:
   ```sql
   SELECT aggregate_daily_tenant_analytics(CURRENT_DATE);
   ```

2. Check cron job is running:
   ```bash
   crontab -l | grep aggregate
   ```

3. Verify affiliate clicks are being tracked:
   ```sql
   SELECT COUNT(*) FROM affiliate_clicks WHERE tenant_id = 'uuid';
   ```

---

## 📚 Next Steps

### Phase 1: Core Platform (✅ Complete)
- [x] Multi-tenant middleware
- [x] Subdomain routing
- [x] Branding injection
- [x] Agency dashboard
- [x] DNS automation
- [x] Stripe subscriptions

### Phase 2: Sales & Growth
- [ ] Send 50 outbound emails to agencies
- [ ] Create demo video walkthrough
- [ ] Set up help documentation
- [ ] Build onboarding email sequence
- [ ] Add live chat support widget

### Phase 3: Enterprise Features
- [ ] White-label API with authentication
- [ ] Webhook integration for tenant events
- [ ] Advanced analytics (conversion funnels)
- [ ] Multi-language support for agencies
- [ ] SSO integration for enterprise

### Phase 4: Scale
- [ ] CDN optimization for global agencies
- [ ] Automated backup/restore
- [ ] High-availability setup
- [ ] Monitoring & alerting
- [ ] Self-service billing portal

---

## 📞 Support

**Questions?** Open an issue or contact support@tripcompanion.app

**Documentation:** Full API docs at `/docs/api`

**Status:** Check system status at `/api/health`
