const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { updateTenantBranding, generateApiKey } = require('../../lib/tenant-provisioner');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configure multer for logo uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|svg|webp/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPEG, PNG, SVG, WebP) are allowed'));
  }
});

/**
 * GET /api/white-label/config/:tenantId
 * Fetch tenant configuration for admin dashboard
 */
router.get('/config/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;

    // TODO: Add authentication check - verify user is admin of this tenant

    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error || !tenant) {
      return res.status(404).json({
        error: 'Tenant not found'
      });
    }

    // Get latest analytics
    const { data: analytics } = await supabase
      .from('tenant_analytics')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false })
      .limit(30);

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('tenant_users')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    res.json({
      tenant: {
        id: tenant.id,
        agencyName: tenant.agency_name,
        subdomain: tenant.subdomain,
        customDomain: tenant.custom_domain,
        tier: tenant.tier,
        branding: {
          colors: tenant.brand_colors,
          logoUrl: tenant.logo_url,
          customCss: tenant.custom_css
        },
        subscription: {
          status: tenant.subscription_status,
          stripeCustomerId: tenant.stripe_customer_id,
          stripeSubscriptionId: tenant.stripe_subscription_id
        },
        limits: {
          maxMonthlyUsers: tenant.max_monthly_users
        },
        contact: {
          email: tenant.contact_email,
          name: tenant.contact_name
        },
        createdAt: tenant.created_at,
        trialEndsAt: tenant.trial_ends_at,
        isActive: tenant.is_active
      },
      analytics: analytics || [],
      stats: {
        totalUsers: totalUsers || 0,
        activeUsers: analytics?.[0]?.active_users || 0,
        tripsCreated: analytics?.[0]?.trips_created || 0,
        bookingClicks: analytics?.[0]?.booking_clicks || 0,
        estimatedRevenue: (analytics?.[0]?.estimated_commission_cents || 0) / 100
      }
    });

  } catch (error) {
    console.error('Config fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch configuration',
      message: error.message
    });
  }
});

/**
 * PUT /api/white-label/config/:tenantId
 * Update tenant branding configuration
 */
router.put('/config/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { brandColors, customCss, customDomain } = req.body;

    // TODO: Add authentication check - verify user is admin of this tenant

    const updates = {};

    if (brandColors) {
      // Validate color format
      const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (brandColors.primary && !colorRegex.test(brandColors.primary)) {
        return res.status(400).json({ error: 'Invalid primary color format' });
      }
      if (brandColors.secondary && !colorRegex.test(brandColors.secondary)) {
        return res.status(400).json({ error: 'Invalid secondary color format' });
      }
      if (brandColors.accent && !colorRegex.test(brandColors.accent)) {
        return res.status(400).json({ error: 'Invalid accent color format' });
      }

      updates.brandColors = brandColors;
    }

    if (customCss !== undefined) {
      updates.customCss = customCss;
    }

    if (customDomain !== undefined) {
      updates.customDomain = customDomain;
    }

    const updatedTenant = await updateTenantBranding(tenantId, updates);

    res.json({
      success: true,
      tenant: {
        id: updatedTenant.id,
        branding: {
          colors: updatedTenant.brand_colors,
          logoUrl: updatedTenant.logo_url,
          customCss: updatedTenant.custom_css
        },
        customDomain: updatedTenant.custom_domain
      },
      message: 'Configuration updated successfully'
    });

  } catch (error) {
    console.error('Config update error:', error);
    res.status(500).json({
      error: 'Failed to update configuration',
      message: error.message
    });
  }
});

/**
 * POST /api/white-label/config/:tenantId/logo
 * Upload tenant logo
 */
router.post('/config/:tenantId/logo', upload.single('logo'), async (req, res) => {
  try {
    const { tenantId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No logo file provided' });
    }

    // TODO: Add authentication check - verify user is admin of this tenant

    // Process image with sharp (compress, resize, optimize)
    const processedImage = await sharp(req.file.buffer)
      .resize(400, 400, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toBuffer();

    // In production, upload to S3/Cloudinary/etc.
    // For now, save locally
    const uploadsDir = path.join(__dirname, '../../uploads/logos');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${tenantId}-${Date.now()}.png`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, processedImage);

    // Generate public URL
    const logoUrl = `/uploads/logos/${filename}`;

    // Update tenant
    const updatedTenant = await updateTenantBranding(tenantId, {
      logoUrl: logoUrl
    });

    res.json({
      success: true,
      logoUrl: logoUrl,
      message: 'Logo uploaded successfully'
    });

  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({
      error: 'Failed to upload logo',
      message: error.message
    });
  }
});

/**
 * POST /api/white-label/config/:tenantId/api-key
 * Generate API key for enterprise tier
 */
router.post('/config/:tenantId/api-key', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { keyName, scopes } = req.body;

    // TODO: Add authentication check - verify user is admin of this tenant

    if (!keyName) {
      return res.status(400).json({ error: 'Key name is required' });
    }

    const apiKey = await generateApiKey(
      tenantId,
      keyName,
      scopes || ['read']
    );

    res.json({
      success: true,
      apiKey: apiKey,
      message: 'API key generated. Save this key - it will only be shown once!'
    });

  } catch (error) {
    console.error('API key generation error:', error);
    res.status(500).json({
      error: 'Failed to generate API key',
      message: error.message
    });
  }
});

/**
 * GET /api/white-label/config/:tenantId/analytics
 * Get detailed analytics for dashboard charts
 */
router.get('/config/:tenantId/analytics', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { days = 30 } = req.query;

    // TODO: Add authentication check

    const { data: analytics, error } = await supabase
      .from('tenant_analytics')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false })
      .limit(parseInt(days));

    if (error) {
      throw error;
    }

    // Calculate totals
    const totals = analytics.reduce((acc, day) => ({
      activeUsers: Math.max(acc.activeUsers, day.active_users || 0),
      tripsCreated: acc.tripsCreated + (day.trips_created || 0),
      bookingClicks: acc.bookingClicks + (day.booking_clicks || 0),
      estimatedRevenue: acc.estimatedRevenue + (day.estimated_commission_cents || 0)
    }), {
      activeUsers: 0,
      tripsCreated: 0,
      bookingClicks: 0,
      estimatedRevenue: 0
    });

    res.json({
      analytics: analytics.reverse(), // Oldest first for charts
      totals: {
        ...totals,
        estimatedRevenue: totals.estimatedRevenue / 100 // Convert to dollars
      }
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

module.exports = router;
