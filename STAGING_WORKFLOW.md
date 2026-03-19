# Staging Workflow - GitHub Pages

## Overview
GitHub Pages is now configured as the staging/preview environment. Every push to `main` automatically deploys to GitHub Pages for preview before manual production deployment.

## Workflow
1. **Code Changes** → Make your changes locally
2. **Build Success** → Code passes local testing
3. **Push to GitHub** → `git push origin main`
4. **Auto-Deploy to Staging** → GitHub Actions automatically deploys to GitHub Pages
5. **Preview** → Review the app at the staging URL
6. **Manual Production Deploy** → When satisfied, manually deploy to Vercel

## URLs
- **Staging (GitHub Pages)**: https://caffeinegmt.github.io/japan-trip/
- **Production (Vercel)**: Manually deployed by Michael

## Technical Details
- **Deployment**: GitHub Actions workflow (`.github/workflows/deploy-gh-pages.yml`)
- **Trigger**: Every push to `main` branch
- **Content**: Static HTML/CSS/JavaScript files from repository root
- **Path Fixes**: All absolute paths (`/file.html`) converted to relative paths (`file.html`) for subdirectory deployment

## What Was Changed
1. Created GitHub Actions workflow for automatic GitHub Pages deployment
2. Fixed all absolute paths to relative paths:
   - HTML navigation links (`/` → `index.html`, `/reservations.html` → `reservations.html`)
   - JavaScript fetch calls (`/data/file.json` → `data/file.json`)
   - Icon references
3. Configured proper permissions for GitHub Pages deployment

## Monitoring
- Check deployment status: https://github.com/caffeineGMT/japan-trip/actions
- View deployment history in the "Actions" tab

## Notes
- Vercel remains the **production-only** platform
- No automated Vercel deployments - all Vercel deploys are manual
- GitHub Pages preview allows testing before production
- All paths are now relative and work in both staging (subdirectory) and production (root domain)
