const { userOwnsTemplate, userHasPremium } = require('../lib/supabase-auth');

// Free tier template IDs that don't require purchase
const FREE_TEMPLATES = ['japan-demo'];

// Maximum days allowed for free tier
const FREE_TIER_MAX_DAYS = 3;

/**
 * Middleware to check if user has access to a specific template
 * Checks if:
 * 1. Template is in free tier
 * 2. User owns the template (purchased)
 * 3. User has active premium subscription
 */
async function checkTemplateAccess(req, res, next) {
  try {
    const { templateId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please sign in to access templates'
      });
    }

    // Check if template is in free tier
    if (FREE_TEMPLATES.includes(templateId)) {
      req.accessLevel = 'free';
      return next();
    }

    // Check if user owns the template
    const ownsTemplate = await userOwnsTemplate(userId, templateId);
    if (ownsTemplate) {
      req.accessLevel = 'template';
      return next();
    }

    // Check if user has premium subscription
    const hasPremium = await userHasPremium(userId);
    if (hasPremium) {
      req.accessLevel = 'premium';
      return next();
    }

    // No access
    return res.status(403).json({
      error: 'Access denied',
      message: 'This template requires a purchase or premium subscription',
      templateId,
      upgrade: {
        purchase: `/checkout?type=template&templateId=${templateId}`,
        subscribe: '/checkout?type=subscription'
      }
    });
  } catch (error) {
    console.error('Access control error:', error);
    return res.status(500).json({
      error: 'Access check failed',
      message: 'An error occurred while checking your access'
    });
  }
}

/**
 * Middleware to check if user has access to premium features
 * Requires active premium subscription
 */
async function checkPremiumAccess(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please sign in to access premium features'
      });
    }

    const hasPremium = await userHasPremium(userId);

    if (!hasPremium) {
      return res.status(403).json({
        error: 'Premium subscription required',
        message: 'This feature is only available for premium subscribers',
        upgrade: {
          subscribe: '/checkout?type=subscription'
        }
      });
    }

    next();
  } catch (error) {
    console.error('Premium access check error:', error);
    return res.status(500).json({
      error: 'Access check failed',
      message: 'An error occurred while checking your subscription'
    });
  }
}

/**
 * Middleware to enforce free tier limits
 * Checks day count and feature access
 */
function checkFreeTierLimits(req, res, next) {
  const { dayNumber, feature } = req.query;
  const userId = req.user?.id;

  // Premium features list
  const premiumFeatures = ['ai_optimizer', 'unlimited_downloads', 'offline_maps'];

  // Check day limit for free tier
  if (dayNumber && parseInt(dayNumber) > FREE_TIER_MAX_DAYS) {
    return res.status(403).json({
      error: 'Free tier limit exceeded',
      message: `Free tier is limited to ${FREE_TIER_MAX_DAYS} days. Upgrade to access the full itinerary.`,
      currentDay: dayNumber,
      maxDays: FREE_TIER_MAX_DAYS,
      upgrade: {
        purchase: '/checkout?type=template',
        subscribe: '/checkout?type=subscription'
      }
    });
  }

  // Check premium feature access
  if (feature && premiumFeatures.includes(feature)) {
    return res.status(403).json({
      error: 'Premium feature',
      message: `${feature} is a premium feature. Upgrade to unlock.`,
      feature,
      upgrade: {
        subscribe: '/checkout?type=subscription'
      }
    });
  }

  next();
}

module.exports = {
  checkTemplateAccess,
  checkPremiumAccess,
  checkFreeTierLimits,
  FREE_TEMPLATES,
  FREE_TIER_MAX_DAYS
};
