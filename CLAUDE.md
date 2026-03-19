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
- Do NOT deploy to Vercel. Do NOT run `vercel`, `vercel deploy`, or any Vercel CLI commands.
- You MAY commit and push to GitHub — that is fine.
- Do NOT run `npm run build` for deployment purposes.
- All deployments to hosting platforms are handled manually by the human. Never auto-deploy.
