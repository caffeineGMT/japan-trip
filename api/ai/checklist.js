const express = require('express');
const router = express.Router();
const openaiClient = require('../../lib/openai-client');
const contextBuilder = require('../../lib/context-builder');

/**
 * POST /api/ai/checklist
 * Generate smart packing checklist based on trip details
 */
router.post('/checklist', async (req, res) => {
  try {
    const { destination, activities, season, durationDays, cities, startDate, userId } = req.body;

    // Validate required fields
    if (!destination) {
      return res.status(400).json({
        error: 'Missing destination',
        message: 'Destination is required to generate checklist'
      });
    }

    if (!durationDays || durationDays < 1) {
      return res.status(400).json({
        error: 'Invalid duration',
        message: 'Trip duration must be at least 1 day'
      });
    }

    // Build trip context
    const tripContext = {
      destination,
      activities: activities || [],
      season: season || 'spring',
      durationDays,
      cities: cities || [],
      startDate
    };

    // Build checklist prompt
    const prompt = contextBuilder.buildChecklistPrompt(tripContext);
    const systemPrompt = 'You are a practical travel packing expert. Create comprehensive, organized packing lists.';

    // Generate checklist (free feature - no userId required, but track if provided)
    const responseText = await openaiClient.complete(prompt, {
      userId: userId || null,
      userTier: 'free', // Checklist generation is free for all users
      systemPrompt,
      jsonMode: true,
      endpoint: 'checklist',
      maxTokens: 800,
      temperature: 0.5
    });

    // Parse checklist
    let checklist;
    try {
      checklist = openaiClient.parseJSONResponse(responseText);

      // Ensure it's an array
      if (!Array.isArray(checklist)) {
        if (checklist.categories && Array.isArray(checklist.categories)) {
          checklist = checklist.categories;
        } else if (checklist.checklist && Array.isArray(checklist.checklist)) {
          checklist = checklist.checklist;
        } else {
          throw new Error('Response is not a valid checklist array');
        }
      }

      // Validate checklist structure
      checklist = checklist
        .filter(cat => cat.category && Array.isArray(cat.items))
        .map(cat => ({
          category: cat.category,
          items: cat.items.filter(item => typeof item === 'string')
        }))
        .filter(cat => cat.items.length > 0);

      // Ensure we have at least 20 items total
      const totalItems = checklist.reduce((sum, cat) => sum + cat.items.length, 0);
      if (totalItems < 15) {
        throw new Error('Checklist has too few items');
      }

    } catch (parseError) {
      console.error('Failed to parse checklist:', parseError);
      return res.status(500).json({
        error: 'Checklist generation failed',
        message: 'Unable to generate a valid checklist. Please try again.'
      });
    }

    // Return checklist
    res.json({
      success: true,
      checklist,
      metadata: {
        destination,
        durationDays,
        season,
        totalItems: checklist.reduce((sum, cat) => sum + cat.items.length, 0),
        categories: checklist.length
      }
    });

  } catch (error) {
    console.error('Checklist generation error:', error);

    if (error.message.includes('Rate limit')) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Please wait before generating another checklist'
      });
    }

    if (error.message.includes('OpenAI') || error.message.includes('API')) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'The checklist generator is temporarily unavailable'
      });
    }

    res.status(500).json({
      error: 'Checklist generation failed',
      message: 'An error occurred while generating your checklist'
    });
  }
});

/**
 * GET /api/ai/checklist/template
 * Get a basic checklist template (fallback if AI fails)
 */
router.get('/checklist/template', (req, res) => {
  const { destination, season } = req.query;

  // Basic template checklist
  const template = [
    {
      category: 'Documents & Money',
      items: [
        'Passport (valid 6+ months)',
        'Flight tickets / confirmations',
        'Hotel reservations',
        'Travel insurance documents',
        'Credit cards (Visa/Mastercard)',
        'Cash (local currency)',
        'Emergency contact list'
      ]
    },
    {
      category: 'Electronics',
      items: [
        'Phone & charger',
        'Power adapter (Type A for Japan)',
        'Power bank',
        'Camera & accessories',
        'Headphones',
        'E-reader or tablet'
      ]
    },
    {
      category: 'Clothing',
      items: season === 'spring' || season === 'fall' ? [
        'Light jacket or cardigan',
        'Comfortable walking shoes',
        'Casual daywear (5-7 outfits)',
        'Underwear & socks',
        'Sleepwear',
        'Light scarf',
        'Umbrella (compact)'
      ] : season === 'summer' ? [
        'Light, breathable clothing',
        'Comfortable walking shoes',
        'Sandals',
        'Sun hat',
        'Sunglasses',
        'Swimwear',
        'Underwear & socks'
      ] : [
        'Warm jacket',
        'Layers (sweaters, long sleeves)',
        'Comfortable walking shoes',
        'Warm socks',
        'Gloves & scarf',
        'Hat',
        'Underwear'
      ]
    },
    {
      category: 'Toiletries & Health',
      items: [
        'Toothbrush & toothpaste',
        'Shampoo & conditioner (travel size)',
        'Soap / body wash',
        'Deodorant',
        'Sunscreen',
        'Prescription medications',
        'Basic first aid kit',
        'Hand sanitizer',
        'Face masks'
      ]
    },
    {
      category: 'Travel Essentials',
      items: [
        'Day backpack',
        'Reusable water bottle',
        'Travel guidebook or app',
        'Pen',
        'Ziplock bags',
        'Laundry detergent packets',
        'Shopping bag (reusable)'
      ]
    }
  ];

  res.json({
    success: true,
    checklist: template,
    isTemplate: true,
    metadata: {
      destination: destination || 'General',
      season: season || 'any'
    }
  });
});

module.exports = router;
