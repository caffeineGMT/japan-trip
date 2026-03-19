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

**CRITICAL: NO AUTO-DEPLOYMENT. GitHub is the staging environment ONLY.**

### Engineer Workflow (YOU must follow this):

1. **Write code** — Make your changes locally
2. **Validate** — Run `npm run build` to check for syntax errors
3. **Fix errors** — Address any validation failures before proceeding
4. **Commit** — Commit your changes: `git add -A && git commit -m "description"`
5. **Push to GitHub** — Push to main branch: `git push origin main`

**STOP HERE.** Do NOT deploy to any hosting platform.

### What GitHub Is:
- GitHub = **Staging environment** (code repository only)
- Code is reviewed and tested here
- NOT the production site

### Production Deployment:
- **ONLY** Michael deploys to production manually
- **NEVER** auto-deploy to Vercel, Netlify, GitHub Pages, or any hosting platform
- **NEVER** run `vercel deploy` or any deployment CLI commands
- **NEVER** use GitHub Actions, CI/CD, or webhooks for deployment

### Forbidden:
- ❌ Vercel CLI commands (`vercel`, `vercel deploy`)
- ❌ GitHub Actions workflows that deploy
- ❌ Auto-deployment on git push
- ❌ CI/CD pipelines that trigger deployment
- ❌ Webhooks to hosting platforms

