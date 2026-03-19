# Deployment Guide

## Overview

This document describes the deployment workflow for the Japan Trip Planner.

## Architecture

```
Local Development → GitHub (Staging) → Production (Manual)
```

- **Local Development**: Where code is written and tested
- **GitHub (main branch)**: Staging environment, code review happens here
- **Production**: Manually deployed by Michael when ready

## Engineer Workflow

When working on this project, AI agents and engineers follow this process:

### 1. Write Code
Make changes locally in your development environment.

### 2. Validate Build
```bash
npm run build
```

This runs syntax validation on all JavaScript files. **You must fix any errors** before committing.

### 3. Commit Changes
```bash
git add -A
git commit -m "Descriptive commit message"
```

### 4. Push to GitHub
```bash
git push origin main
```

**STOP HERE.** The code is now on GitHub (staging). Do NOT deploy.

## Production Deployment (Michael Only)

Michael will manually deploy to production when ready. This is intentional to:
- Review code before it goes live
- Test in staging environment first
- Control when changes go live
- Avoid accidental deployments

## What NOT to Do

❌ **DO NOT** run Vercel CLI commands:
```bash
vercel          # ❌ Don't run
vercel deploy   # ❌ Don't run
```

❌ **DO NOT** set up auto-deployment:
- No GitHub Actions for deployment
- No webhooks to hosting platforms
- No CI/CD pipelines that trigger deployment

❌ **DO NOT** deploy to any hosting platform:
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages
- Any other hosting service

## Why This Workflow?

This is a **personal project** for Michael's Japan trip planning. It's not a product with multiple users or continuous deployment needs. The manual deployment process ensures:

1. **Control**: Michael decides when changes go live
2. **Review**: All code is reviewed on GitHub before production
3. **Safety**: No accidental deployments or breaking changes
4. **Simplicity**: No complex CI/CD infrastructure needed

## Questions?

If you need to deploy urgently, contact Michael directly. Otherwise, push to GitHub and he'll handle deployment manually.
