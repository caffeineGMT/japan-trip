const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Multi-tenant middleware - Resolves tenant from subdomain or custom domain
 * Injects tenant config into req.tenant for downstream use
 *
 * Subdomain routing:
 *   - acme.tripcompanion.app → tenant with subdomain='acme'
 *   - customagency.com → tenant with custom_domain='customagency.com'
 *   - localhost / tripcompanion.app → no tenant (main platform)
 */
async function multiTenantMiddleware(req, res, next) {
  try {
    const hostname = req.hostname;
    const mainDomain = process.env.MAIN_DOMAIN || 'tripcompanion.app';
    const isLocalhost = hostname === 'localhost' || hostname.startsWith('127.0.0.1');

    // Extract subdomain if on main domain
    let subdomain = null;
    let customDomain = null;

    if (isLocalhost) {
      // In development, check for subdomain query param for testing
      subdomain = req.query.tenant || null;
    } else if (hostname.endsWith(`.${mainDomain}`)) {
      // Extract subdomain: acme.tripcompanion.app → 'acme'
      subdomain = hostname.replace(`.${mainDomain}`, '');
    } else if (hostname !== mainDomain) {
      // Custom domain: customagency.com
      customDomain = hostname;
    }

    // No tenant - main platform
    if (!subdomain && !customDomain) {
      req.tenant = null;
      return next();
    }

    // Query tenant from database
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('*')
      .or(`subdomain.eq.${subdomain || ''},custom_domain.eq.${customDomain || ''}`)
      .eq('is_active', true)
      .single();

    if (error || !tenant) {
      // Tenant not found or inactive
      return res.status(404).render('tenant-not-found', {
        subdomain: subdomain || customDomain,
        message: 'This white-label instance could not be found. Please contact support.'
      });
    }

    // Check subscription status
    if (tenant.subscription_status !== 'active' && tenant.subscription_status !== 'trialing') {
      return res.status(403).render('tenant-suspended', {
        agency: tenant.agency_name,
        message: 'This white-label instance has been suspended due to payment issues. Please contact the agency.'
      });
    }

    // Inject tenant config into request
    req.tenant = {
      id: tenant.id,
      agencyName: tenant.agency_name,
      subdomain: tenant.subdomain,
      customDomain: tenant.custom_domain,
      tier: tenant.tier,
      branding: {
        colors: tenant.brand_colors || {
          primary: '#4f46e5',
          secondary: '#7c3aed',
          accent: '#db2777'
        },
        logoUrl: tenant.logo_url,
        customCss: tenant.custom_css
      },
      limits: {
        maxMonthlyUsers: tenant.max_monthly_users
      },
      isWhiteLabel: true
    };

    // Track tenant context for analytics
    res.locals.tenantId = tenant.id;
    res.locals.isWhiteLabel = true;

    next();
  } catch (error) {
    console.error('Multi-tenant middleware error:', error);
    res.status(500).json({
      error: 'Failed to resolve tenant',
      message: error.message
    });
  }
}

/**
 * Inject tenant branding into HTML response
 * Use as a post-processing middleware to modify HTML with tenant colors/logo
 */
function injectTenantBranding(req, res, next) {
  if (!req.tenant) {
    return next();
  }

  // Override res.send to inject branding CSS
  const originalSend = res.send;

  res.send = function(data) {
    if (typeof data === 'string' && data.includes('</head>')) {
      const { colors, logoUrl, customCss } = req.tenant.branding;

      // Build custom CSS
      const brandingStyles = `
        <style id="tenant-branding">
          :root {
            --primary-color: ${colors.primary};
            --secondary-color: ${colors.secondary};
            --accent-color: ${colors.accent};
            --tenant-logo: url('${logoUrl || ''}');
          }

          /* Apply branding colors */
          .btn-primary, .bg-primary {
            background-color: ${colors.primary} !important;
          }

          .btn-secondary, .bg-secondary {
            background-color: ${colors.secondary} !important;
          }

          .text-accent, .border-accent {
            color: ${colors.accent} !important;
            border-color: ${colors.accent} !important;
          }

          /* Replace logo if provided */
          ${logoUrl ? `.brand-logo { content: var(--tenant-logo); }` : ''}

          /* Hide "Powered by Trip Companion" for paid tiers */
          ${req.tenant.tier !== 'starter' ? '.powered-by { display: none !important; }' : ''}

          /* Custom CSS from tenant */
          ${customCss || ''}
        </style>
      `;

      // Inject before </head>
      data = data.replace('</head>', `${brandingStyles}\n</head>`);
    }

    originalSend.call(this, data);
  };

  next();
}

/**
 * Check if tenant has reached usage limits
 */
async function checkTenantLimits(req, res, next) {
  if (!req.tenant) {
    return next();
  }

  try {
    // Get current month's active users
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: analytics } = await supabase
      .from('tenant_analytics')
      .select('active_users')
      .eq('tenant_id', req.tenant.id)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(1)
      .single();

    const currentActiveUsers = analytics?.active_users || 0;

    // Check limits based on tier
    if (currentActiveUsers >= req.tenant.limits.maxMonthlyUsers) {
      return res.status(429).json({
        error: 'Usage limit reached',
        message: `Your ${req.tenant.tier} plan allows ${req.tenant.limits.maxMonthlyUsers} monthly active users. Please upgrade your plan.`,
        currentUsage: currentActiveUsers,
        limit: req.tenant.limits.maxMonthlyUsers
      });
    }

    // Attach usage info to request
    req.tenantUsage = {
      activeUsers: currentActiveUsers,
      limit: req.tenant.limits.maxMonthlyUsers,
      percentUsed: Math.round((currentActiveUsers / req.tenant.limits.maxMonthlyUsers) * 100)
    };

    next();
  } catch (error) {
    console.error('Error checking tenant limits:', error);
    // Don't block request on error
    next();
  }
}

module.exports = {
  multiTenantMiddleware,
  injectTenantBranding,
  checkTenantLimits
};
