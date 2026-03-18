# PostHog Conversion Funnel - 5-Minute Setup Card

> **Quick reference for setting up the conversion funnel in PostHog dashboard**

---

## ⚡ Prerequisites (2 minutes)

1. **Get PostHog Account:** [posthog.com](https://posthog.com) (free tier works)
2. **Get API Key:** Project Settings → API Keys → Copy key
3. **Add to .env:**
   ```bash
   POSTHOG_API_KEY=phc_your_key_here
   POSTHOG_HOST=https://app.posthog.com
   ```
4. **Deploy:** `git push origin main` (Vercel auto-deploys)

---

## 📊 Create Funnel (3 minutes)

### In PostHog Dashboard:

**1. Navigate to Insights**
```
Dashboard → Insights → New Insight → Funnel
```

**2. Add These 5 Steps:**
```
1. app_loaded
2. day_selected
3. upgrade_clicked
4. trial_started
5. purchase_completed
```

**3. Configure Settings:**
```
Conversion Window: 14 days
Breakdown 1: utm_source
Breakdown 2: plan_type
Step Order: Sequential
```

**4. Save:**
```
Name: "Primary Conversion Funnel"
Dashboard: "Revenue Dashboard" (create new)
```

---

## 🎯 Expected Funnel (Healthy SaaS)

```
┌─────────────────────────────────────┐
│ app_loaded          100%  (5,000)   │ ← First visit
├─────────────────────────────────────┤
│ day_selected         40%  (2,000)   │ ← Engagement
├─────────────────────────────────────┤
│ upgrade_clicked      20%  (1,000)   │ ← Interest
├─────────────────────────────────────┤
│ trial_started        15%    (750)   │ ← Trial start
├─────────────────────────────────────┤
│ purchase_completed  3.75%   (187)   │ ← $$ Revenue
└─────────────────────────────────────┘

Revenue: 187 × $10/mo = $1,870 MRR
```

---

## 🚨 Red Flags to Monitor

| Drop-off Stage | Threshold | Action |
|----------------|-----------|--------|
| app_loaded → day_selected | <30% | Fix onboarding/UX |
| day_selected → upgrade_clicked | <15% | Add paywall/CTAs |
| upgrade_clicked → trial_started | <60% | Reduce signup friction |
| trial_started → purchase_completed | <20% | Email nurture sequence |

---

## 📈 Key Metrics Dashboard (Add These Widgets)

### Widget 1: Overall Conversion Rate
```
Type: Trends → Formula
Formula: (purchase_completed / app_loaded) * 100
Goal: 3.75%
Alert: < 2.5%
```

### Widget 2: Daily Revenue
```
Event: purchase_completed
Property: amount (sum)
Breakdown: By day
Visualization: Bar chart
```

### Widget 3: Channel Performance
```
Event: purchase_completed
Breakdown: utm_source
Show: Count + Total Revenue
Sort: Revenue DESC
```

### Widget 4: Trial Conversion
```
Type: Trends → Formula
Formula: (purchase_completed / trial_started) * 100
Target: 25%
Visualization: Line chart
```

---

## ⚙️ Alert Setup (Catch Issues Early)

**Alert 1: Low Conversion**
```
Trigger: Overall conversion rate < 2.5%
Notification: Email daily at 9 AM
Action: Investigate drop-off points
```

**Alert 2: No Revenue**
```
Trigger: 0 purchase_completed events today
Notification: Email immediately
Action: Check payment system
```

**Alert 3: High Drop-off**
```
Trigger: Any funnel step drops >60%
Notification: Slack #analytics
Action: Review that step's UX
```

---

## 🔬 A/B Test Setup (Feature Flags)

**Create Feature Flag:**
```
Name: paywall_timing
Variants:
  - variant_a: "2_days" (33%)
  - variant_b: "3_days" (33%)
  - variant_c: "5_days" (34%)
Rollout: 100% of users
```

**Track in Code:**
```javascript
const variant = window.Analytics.getFeatureFlag('paywall_timing');
// variant will be "2_days", "3_days", or "5_days"

// Track which variant user saw
window.Analytics.trackVariantViewed('paywall_timing', variant);
```

**Analyze Results:**
```
Insights → Trends
Event: purchase_completed
Breakdown: property "ab_variant"
Compare: Conversion rates by variant
Winner: Highest conversion rate with p<0.05
```

---

## 🎯 First Week Checklist

- [ ] **Day 1:** Deploy with PostHog API key
- [ ] **Day 1:** Verify events in Live Events tab
- [ ] **Day 1:** Create Primary Conversion Funnel
- [ ] **Day 2:** Add Revenue Dashboard widgets
- [ ] **Day 2:** Set up 3 alerts
- [ ] **Day 3:** Review first 100 events
- [ ] **Day 5:** Identify biggest drop-off
- [ ] **Day 7:** Implement first optimization

---

## 📞 Quick Links

- **PostHog Dashboard:** [app.posthog.com](https://app.posthog.com)
- **Live Events:** Dashboard → Live Events
- **Funnels:** Dashboard → Insights → Funnels
- **Session Replay:** Dashboard → Recordings
- **Documentation:** [posthog.com/docs](https://posthog.com/docs)

---

## 🆘 Troubleshooting One-Liners

**Events not showing?**
```javascript
// In browser console:
console.log(window.Analytics.initialized); // Should be true
window.Analytics.track('test', {}); // Check Live Events
```

**Funnel shows zero?**
- Wait 24 hours for data
- Check event names (case-sensitive!)
- Extend conversion window to 30 days

**Conversion rate too high?**
- Filter out internal team by email domain
- Check for bot traffic

**Need help?**
- PostHog Slack: [posthog.com/slack](https://posthog.com/slack)
- Community: [posthog.com/questions](https://posthog.com/questions)

---

**✅ Ready to track conversions and grow revenue!**

Full guide: `POSTHOG_FUNNEL_OPTIMIZATION.md`
