# Referral Program - Quick Start Guide

## 🚀 Quick Deploy (5 minutes)

### Step 1: Database Setup
Run this in Supabase SQL Editor:
```bash
# Copy contents of database-schema-referrals.sql
# Paste in Supabase > SQL Editor > New Query
# Click "Run"
```

Verify tables created:
- `referral_codes`
- `referrals`
- `referral_rewards`

### Step 2: Environment Check
Already configured in `.env`:
```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
MAILGUN_API_KEY=...
BASE_URL=https://trip.to
```

### Step 3: Start Server
```bash
npm start
```

Test endpoints:
```bash
# Leaderboard (public)
curl http://localhost:3000/api/referrals/leaderboard

# Health check
curl http://localhost:3000/api/health
```

### Step 4: Add to Frontend

**In your main app (index.html):**
```html
<!-- Add before </body> -->
<script src="lib/referral-client.js"></script>
<!-- Include banner -->
<?php include 'components/referral-banner.html'; ?>
```

**In account.html:**
```html
<!-- Add widget -->
<?php include 'components/referral-widget.html'; ?>
```

### Step 5: Test Flow

1. **Sign up** new user
2. **Visit** `/referral-dashboard`
3. **Copy** referral link
4. **Open** incognito window
5. **Click** referral link
6. **Sign up** as new user
7. **Make payment** (test mode)
8. **Check** original user sees +1 referral

---

## 📊 Monitor Performance

### Supabase Dashboard Queries

**Check total referrals:**
```sql
SELECT COUNT(*) FROM referrals;
```

**See top referrers:**
```sql
SELECT * FROM referral_leaderboard LIMIT 10;
```

**Count conversions today:**
```sql
SELECT COUNT(*)
FROM referrals
WHERE converted_at::date = CURRENT_DATE;
```

**Viral coefficient (last 30 days):**
```sql
SELECT
  AVG(referral_count) as avg_refs_per_user,
  SUM(successful_referrals)::float / NULLIF(COUNT(*), 0) as conversion_rate
FROM users
WHERE created_at > NOW() - INTERVAL '30 days';
```

---

## 🎯 URLs

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/referral-dashboard` | User's referral stats |
| Landing | `/ref/ABC12345` | Referred user landing |
| Leaderboard | `/api/referrals/leaderboard` | Public top 50 |

---

## 🎁 Reward Tiers

| Referrals | Reward | Auto-Granted |
|-----------|--------|--------------|
| 1 friend | $10 off for them | On signup |
| 3 friends | 1 month free for you | On 3rd payment |
| 6 friends | 2 months free | On 6th payment |
| 10 friends | **Lifetime Premium** | On 10th payment |

---

## 🔗 Integration Points

### Stripe Webhook
Already integrated in `/api/stripe/webhook`:
```javascript
// On checkout.session.completed
await fetch('/api/referrals/mark-conversion', {
  method: 'POST',
  headers: {
    'X-Internal-Secret': process.env.STRIPE_WEBHOOK_SECRET
  },
  body: JSON.stringify({ userId, stripeCustomerId, amount })
});
```

### Email Notifications
Templates ready in `email-templates.html`. Integrate with Mailgun:

```javascript
const mg = mailgun.client({ key: process.env.MAILGUN_API_KEY });

mg.messages.create(process.env.MAILGUN_DOMAIN, {
  from: 'Japan Trip <hello@trip.to>',
  to: userEmail,
  subject: 'You earned a reward! 🎉',
  html: renderTemplate('template-reward-unlocked', { ... })
});
```

---

## 🧪 Testing Checklist

- [ ] User can generate referral code
- [ ] Referral link tracks clicks
- [ ] Code stored in localStorage (30 days)
- [ ] $10 discount applies at checkout
- [ ] Payment marks conversion
- [ ] 3 conversions → 1 month free granted
- [ ] 10 conversions → Lifetime premium
- [ ] Leaderboard updates in real-time
- [ ] Email sent on reward unlock
- [ ] Social share buttons work
- [ ] Mobile responsive

---

## 📈 Expected Results

### Week 1
- 50+ codes generated
- 20+ clicks
- 5+ signups
- 1 conversion

### Month 1
- 200+ codes
- 100+ clicks
- 20+ signups
- 5 conversions
- **+$50 MRR**

### Month 6
- 500+ codes
- 1,000+ clicks
- 100+ signups
- 15 conversions
- **+$150 MRR**

**Viral coefficient target: 0.3-0.5**

---

## 🚨 Troubleshooting

### Referral code not generating
Check Supabase permissions:
```sql
-- Run as admin
SELECT create_user_referral_code('USER_UUID_HERE');
```

### Discount not applying
Verify Stripe coupon exists:
```javascript
const coupon = await stripe.coupons.retrieve('referral_10off');
console.log(coupon);
```

### Stats not updating
Check trigger is active:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'update_referral_stats_trigger';
```

### Email not sending
Test Mailgun:
```bash
curl -s --user 'api:YOUR_MAILGUN_API_KEY' \
  https://api.mailgun.net/v3/YOUR_DOMAIN/messages \
  -F from='Test <test@trip.to>' \
  -F to='you@email.com' \
  -F subject='Test' \
  -F text='Testing Mailgun'
```

---

## 🎨 Customization

### Change Reward Tiers
Edit `database-schema-referrals.sql`:
```sql
-- Line 185: Change "3 referrals = 1 month free" to 5
IF v_converted_count >= 5 THEN
```

### Change Discount Amount
Edit `api/referrals/apply-discount.js`:
```javascript
amount_off: 1500, // $15 instead of $10
```

### Change Colors
All components use these CSS variables:
```css
--primary: #667eea;
--secondary: #764ba2;
--success: #4caf50;
```

---

## 📞 Support

**Built by:** Japan Trip Companion Team
**Contact:** hello@tripcompanion.app
**Docs:** See `REFERRAL_PROGRAM_SUMMARY.md` for full documentation

---

## ✅ Launch Checklist

- [ ] Database migrated
- [ ] All endpoints tested
- [ ] Banner live on homepage
- [ ] Widget on account page
- [ ] Email templates configured
- [ ] Stripe webhook verified
- [ ] Analytics tracking setup
- [ ] Announcement email sent
- [ ] Social media posts published
- [ ] Monitoring dashboard created

**Ready to launch? Let's go viral! 🚀**
