# CLAUDE.md — Rules for ALL agents working in this repo

## FORBIDDEN — Do NOT add any of the following:

1. **No monetization** — no Stripe, Paddle, payments, pricing tiers, checkout, subscriptions
2. **No affiliate systems** — no affiliate tracking, partner dashboards, payout processing
3. **No marketing** — no SEO landing pages, meta descriptions, social proof, testimonials
4. **No white-label** — no multi-tenant, branding injection, tenant provisioning
5. **No analytics services** — no PostHog, Google Analytics, conversion funnels
6. **No marketplace** — no template marketplace, selling, purchasing
7. **No auth/accounts** — no login, signup, user accounts, sessions
8. **No Chrome extensions** — no browser extensions or extension landing pages
9. **No PWA** — no manifest.json, service workers, install prompts, or offline caching. This is a plain website.

## What this project IS:

This is a **PERSONAL Japan trip planner**. It is for the owner's own use. It is NOT a product. It is NOT meant to have paying customers or users.

## What you SHOULD work on:

- Interactive map with Leaflet (fix map display issues)
- Itinerary display and day-by-day navigation
- Budget tracking
- Weather integration
- Route planning
- Mobile-responsive design

## If you find existing monetization/marketing code:

DELETE IT. Do not preserve it. Do not refactor it. Remove it entirely.

## DEPLOYMENT RULES

**NEW WORKFLOW: GitHub Pages for Staging, Vercel for Production**

### Engineer Workflow (YOU must follow this):

1. **Write code** — Make your changes locally
2. **Commit** — Commit your changes: `git add -A && git commit -m "description"`
3. **Push to GitHub** — Push to main branch: `git push origin main`
4. **Auto-deploy to staging** — GitHub Actions automatically deploys to GitHub Pages
5. **Preview** — Review the app at https://caffeinegmt.github.io/japan-trip/

**STOP HERE.** Do NOT deploy to Vercel. Michael handles production deployment manually.

### Environments:
- **Staging (GitHub Pages)**: https://caffeinegmt.github.io/japan-trip/ - Auto-deployed on every push
- **Production (Vercel)**: Manually deployed by Michael only

### What IS automated:
- ✅ GitHub Pages deployment (staging preview only)
- ✅ GitHub Actions workflow (for GitHub Pages only)

### What is NOT automated (manual only):
- ❌ Vercel deployment (production)
- ❌ **NEVER** run `vercel deploy` or any Vercel CLI commands
- ❌ **NEVER** auto-deploy to Vercel via webhooks or CI/CD

