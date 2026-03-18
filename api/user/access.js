const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../middleware/auth');
const { supabaseAdmin } = require('../../lib/supabase-auth');

/**
 * GET /api/user/access
 * Get user's access level, purchased templates, and subscription status
 */
router.get('/access', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data including subscription
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    // Get user's purchased templates
    const { data: userTemplates, error: templatesError } = await supabaseAdmin
      .from('user_templates')
      .select(`
        *,
        templates:template_id (
          id,
          name,
          description,
          price,
          days
        )
      `)
      .eq('user_id', userId);

    const hasPremium = user?.subscription_status === 'active';

    res.json({
      isAuthenticated: true,
      hasPremium,
      subscriptionStatus: user?.subscription_status || 'inactive',
      templates: userTemplates?.map(ut => ({
        id: ut.templates.id,
        name: ut.templates.name,
        description: ut.templates.description,
        days: ut.templates.days,
        purchased_at: ut.purchased_at
      })) || [],
      user: {
        email: req.user.email,
        hasStripeCustomer: !!user?.stripe_customer_id
      }
    });

  } catch (error) {
    console.error('Access check error:', error);
    res.status(500).json({
      error: 'Failed to check access',
      message: error.message
    });
  }
});

/**
 * GET /api/user/templates/:templateId/check
 * Check if user has access to a specific template
 */
router.get('/templates/:templateId/check', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { templateId } = req.params;

    // Check if template is free
    const FREE_TEMPLATES = ['japan-demo'];
    if (FREE_TEMPLATES.includes(templateId)) {
      return res.json({ hasAccess: true, accessType: 'free' });
    }

    // Check if user owns the template
    const { data: userTemplate } = await supabaseAdmin
      .from('user_templates')
      .select('id')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .single();

    if (userTemplate) {
      return res.json({ hasAccess: true, accessType: 'owned' });
    }

    // Check if user has premium subscription
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('subscription_status')
      .eq('id', userId)
      .single();

    if (user?.subscription_status === 'active') {
      return res.json({ hasAccess: true, accessType: 'premium' });
    }

    // No access
    res.json({ hasAccess: false, accessType: null });

  } catch (error) {
    console.error('Template access check error:', error);
    res.status(500).json({
      error: 'Failed to check template access',
      message: error.message
    });
  }
});

module.exports = router;
