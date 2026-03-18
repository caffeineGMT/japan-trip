const express = require('express');
const router = express.Router();
const openaiClient = require('../../lib/openai-client');
const contextBuilder = require('../../lib/context-builder');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/ai/optimize
 * Analyze itinerary and provide optimization suggestions
 */
router.post('/optimize', async (req, res) => {
  try {
    const { itinerary, userId, userPreferences = {} } = req.body;

    // Validate required fields
    if (!itinerary || !itinerary.days) {
      return res.status(400).json({
        error: 'Invalid itinerary format',
        message: 'Itinerary must include days array'
      });
    }

    if (!userId) {
      return res.status(400).json({
        error: 'User ID required',
        message: 'Authentication required to use AI optimizer'
      });
    }

    // Check user premium status
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_tier, subscription_status')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return res.status(500).json({
        error: 'Failed to verify user status'
      });
    }

    const isPremium = userData?.subscription_tier === 'premium' &&
                     userData?.subscription_status === 'active';
    const userTier = isPremium ? 'premium' : 'free';

    // Check rate limit
    try {
      const rateLimit = await openaiClient.checkRateLimit(userId, userTier);

      if (!rateLimit.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: isPremium
            ? `You've reached your monthly limit of ${rateLimit.limit} optimizations. Please try again next month.`
            : `You've used all ${rateLimit.limit} free optimizations this month. Upgrade to Premium for unlimited optimizations.`,
          rateLimit: {
            limit: rateLimit.limit,
            remaining: rateLimit.remaining,
            resetAt: rateLimit.resetAt
          },
          upgradeUrl: isPremium ? null : '/pricing.html'
        });
      }

      // Include rate limit info in response headers
      res.set({
        'X-RateLimit-Limit': rateLimit.limit,
        'X-RateLimit-Remaining': rateLimit.remaining,
        'X-RateLimit-Reset': rateLimit.resetAt.toISOString()
      });

    } catch (rateLimitError) {
      console.error('Rate limit check failed:', rateLimitError);
      // Continue anyway - don't block on rate limit failures
    }

    // Build optimization prompt
    const prompt = contextBuilder.buildOptimizationPrompt(itinerary, userPreferences);

    // Get AI suggestions
    const systemPrompt = `You are an expert travel planner specializing in ${itinerary.destination || 'Japan'}. Analyze itineraries for efficiency, timing, and traveler experience. Always return valid JSON arrays.`;

    const responseText = await openaiClient.complete(prompt, {
      userId,
      userTier,
      systemPrompt,
      jsonMode: true,
      endpoint: 'optimize',
      maxTokens: 1500,
      temperature: 0.7
    });

    // Parse JSON response
    let suggestions;
    try {
      suggestions = openaiClient.parseJSONResponse(responseText);

      // Ensure it's an array
      if (!Array.isArray(suggestions)) {
        if (suggestions.suggestions && Array.isArray(suggestions.suggestions)) {
          suggestions = suggestions.suggestions;
        } else {
          throw new Error('Response is not an array');
        }
      }

      // Validate suggestion structure and limit to 5
      suggestions = suggestions
        .filter(s => s.type && s.description && s.action)
        .slice(0, 5)
        .map(s => ({
          type: s.type,
          dayNumber: s.dayNumber || null,
          description: s.description,
          action: s.action,
          priority: s.priority || 'medium',
          estimatedTimeSaved: s.estimatedTimeSaved || null
        }));

    } catch (parseError) {
      console.error('Failed to parse suggestions:', parseError);
      return res.status(500).json({
        error: 'Failed to generate suggestions',
        message: 'The AI returned an invalid response. Please try again.'
      });
    }

    // Return suggestions with metadata
    res.json({
      success: true,
      suggestions,
      metadata: {
        itineraryDays: itinerary.days.length,
        destination: itinerary.destination || 'Unknown',
        suggestionsCount: suggestions.length,
        userTier,
        cached: false // Will be true if response was cached
      }
    });

  } catch (error) {
    console.error('Optimization error:', error);

    // Handle rate limit errors
    if (error.message === 'Rate limit exceeded' && error.rateLimit) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'You have reached your optimization limit. Please upgrade or try again later.',
        rateLimit: error.rateLimit
      });
    }

    // Handle OpenAI errors
    if (error.message.includes('OpenAI') || error.message.includes('API')) {
      return res.status(503).json({
        error: 'AI service unavailable',
        message: 'The AI optimization service is temporarily unavailable. Please try again later.'
      });
    }

    // Generic error
    res.status(500).json({
      error: 'Optimization failed',
      message: 'An unexpected error occurred while optimizing your itinerary.'
    });
  }
});

module.exports = router;
