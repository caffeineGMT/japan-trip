const Cloudflare = require('cloudflare');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const cloudflare = new Cloudflare({
  apiToken: process.env.CLOUDFLARE_API_TOKEN
});

const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const MAIN_DOMAIN = process.env.MAIN_DOMAIN || 'tripcompanion.app';
const SERVER_IP = process.env.SERVER_IP || '0.0.0.0';

/**
 * Validate subdomain format
 * - Only lowercase letters, numbers, and hyphens
 * - Must start with letter
 * - 3-63 characters
 */
function validateSubdomain(subdomain) {
  const regex = /^[a-z][a-z0-9-]{2,62}$/;

  if (!regex.test(subdomain)) {
    throw new Error('Invalid subdomain format. Must be 3-63 characters, start with letter, and contain only lowercase letters, numbers, and hyphens.');
  }

  // Reserved subdomains
  const reserved = ['www', 'api', 'app', 'admin', 'dashboard', 'partners', 'partner', 'auth', 'mail', 'email', 'cdn', 'static', 'assets'];
  if (reserved.includes(subdomain)) {
    throw new Error(`Subdomain '${subdomain}' is reserved and cannot be used.`);
  }

  return true;
}

/**
 * Check if subdomain is available
 */
async function checkSubdomainAvailable(subdomain) {
  const { data, error } = await supabase
    .from('tenants')
    .select('id')
    .eq('subdomain', subdomain)
    .single();

  return !data; // Available if no existing tenant found
}

/**
 * Create Cloudflare DNS record for subdomain
 * Creates CNAME: subdomain.tripcompanion.app → main-server-ip
 */
async function createDnsRecord(subdomain) {
  if (!CLOUDFLARE_ZONE_ID || !process.env.CLOUDFLARE_API_TOKEN) {
    console.warn('Cloudflare not configured - skipping DNS creation');
    return { success: false, manual: true };
  }

  try {
    const recordName = `${subdomain}.${MAIN_DOMAIN}`;

    // Check if record already exists
    const existingRecords = await cloudflare.dnsRecords.browse(CLOUDFLARE_ZONE_ID, {
      name: recordName
    });

    if (existingRecords.result && existingRecords.result.length > 0) {
      console.log(`DNS record already exists for ${recordName}`);
      return { success: true, recordId: existingRecords.result[0].id };
    }

    // Create CNAME record pointing to main domain
    const record = await cloudflare.dnsRecords.add(CLOUDFLARE_ZONE_ID, {
      type: 'CNAME',
      name: subdomain,
      content: MAIN_DOMAIN,
      ttl: 3600,
      proxied: true // Cloudflare proxy for SSL/CDN
    });

    console.log(`DNS record created: ${recordName} → ${MAIN_DOMAIN}`);

    return {
      success: true,
      recordId: record.result.id,
      name: recordName
    };
  } catch (error) {
    console.error('Cloudflare DNS error:', error);
    throw new Error(`Failed to create DNS record: ${error.message}`);
  }
}

/**
 * Provision new tenant
 * 1. Validate subdomain
 * 2. Create Stripe customer & subscription
 * 3. Create DNS record
 * 4. Insert tenant record
 * 5. Create admin user association
 */
async function provisionTenant({
  agencyName,
  subdomain,
  tier,
  contactEmail,
  contactName,
  stripeCustomerId = null,
  stripeSubscriptionId = null,
  trialDays = 14
}) {
  try {
    // Step 1: Validate subdomain
    validateSubdomain(subdomain);

    const available = await checkSubdomainAvailable(subdomain);
    if (!available) {
      throw new Error(`Subdomain '${subdomain}' is already taken`);
    }

    // Step 2: Set tier limits
    const tierLimits = {
      starter: { maxUsers: 100, price: 49900 }, // $499/mo
      growth: { maxUsers: 500, price: 99900 },  // $999/mo
      enterprise: { maxUsers: 999999, price: 249900 } // $2499/mo
    };

    const limits = tierLimits[tier];
    if (!limits) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    // Step 3: Create DNS record (non-blocking if fails)
    let dnsResult;
    try {
      dnsResult = await createDnsRecord(subdomain);
    } catch (dnsError) {
      console.error('DNS creation failed (continuing):', dnsError);
      dnsResult = { success: false, manual: true };
    }

    // Step 4: Calculate trial end date
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

    // Step 5: Insert tenant record
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        agency_name: agencyName,
        subdomain: subdomain,
        tier: tier,
        contact_email: contactEmail,
        contact_name: contactName,
        max_monthly_users: limits.maxUsers,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        subscription_status: stripeSubscriptionId ? 'active' : 'trialing',
        trial_ends_at: trialEndsAt.toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (tenantError) {
      throw new Error(`Failed to create tenant: ${tenantError.message}`);
    }

    console.log(`✅ Tenant provisioned: ${subdomain}.${MAIN_DOMAIN}`);

    return {
      success: true,
      tenant: {
        id: tenant.id,
        agencyName: tenant.agency_name,
        subdomain: tenant.subdomain,
        tier: tenant.tier,
        url: `https://${subdomain}.${MAIN_DOMAIN}`,
        dashboardUrl: `/partners/dashboard?tenant=${tenant.id}`,
        trialEndsAt: tenant.trial_ends_at
      },
      dns: dnsResult
    };
  } catch (error) {
    console.error('Tenant provisioning error:', error);
    throw error;
  }
}

/**
 * Update tenant branding configuration
 */
async function updateTenantBranding(tenantId, updates) {
  const allowedUpdates = {};

  if (updates.brandColors) {
    allowedUpdates.brand_colors = updates.brandColors;
  }

  if (updates.logoUrl) {
    allowedUpdates.logo_url = updates.logoUrl;
  }

  if (updates.customCss) {
    allowedUpdates.custom_css = updates.customCss;
  }

  if (updates.customDomain) {
    // Validate domain format
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    if (!domainRegex.test(updates.customDomain)) {
      throw new Error('Invalid custom domain format');
    }
    allowedUpdates.custom_domain = updates.customDomain;
  }

  const { data, error } = await supabase
    .from('tenants')
    .update(allowedUpdates)
    .eq('id', tenantId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update tenant: ${error.message}`);
  }

  return data;
}

/**
 * Generate API key for enterprise tier
 */
async function generateApiKey(tenantId, keyName, scopes = ['read']) {
  // Verify tenant has enterprise tier
  const { data: tenant } = await supabase
    .from('tenants')
    .select('tier')
    .eq('id', tenantId)
    .single();

  if (!tenant || tenant.tier !== 'enterprise') {
    throw new Error('API keys are only available for Enterprise tier');
  }

  // Generate random API key
  const apiKey = `tk_${crypto.randomBytes(32).toString('hex')}`;
  const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  const apiKeyPrefix = apiKey.substring(0, 12);

  // Store hash in database
  const { data, error } = await supabase
    .from('tenant_api_keys')
    .insert({
      tenant_id: tenantId,
      key_name: keyName,
      api_key_hash: apiKeyHash,
      api_key_prefix: apiKeyPrefix,
      scopes: scopes,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create API key: ${error.message}`);
  }

  // Return full key only once
  return {
    id: data.id,
    name: keyName,
    key: apiKey, // Only shown once!
    prefix: apiKeyPrefix,
    scopes: scopes,
    createdAt: data.created_at
  };
}

/**
 * Track affiliate click with tenant attribution
 */
async function trackAffiliateClick({
  tenantId,
  userId,
  provider,
  destinationUrl,
  affiliateId,
  estimatedCommissionCents = 0,
  userAgent,
  referrer
}) {
  const { data, error } = await supabase
    .from('affiliate_clicks')
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      provider: provider,
      destination_url: destinationUrl,
      affiliate_id: affiliateId,
      estimated_commission_cents: estimatedCommissionCents,
      user_agent: userAgent,
      referrer: referrer
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to track affiliate click:', error);
    return null;
  }

  return data;
}

module.exports = {
  validateSubdomain,
  checkSubdomainAvailable,
  createDnsRecord,
  provisionTenant,
  updateTenantBranding,
  generateApiKey,
  trackAffiliateClick
};
