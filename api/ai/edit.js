const express = require('express');
const router = express.Router();
const openaiClient = require('../../lib/openai-client');
const contextBuilder = require('../../lib/context-builder');
const geocoder = require('../../lib/geocoder');

/**
 * POST /api/ai/edit
 * Natural language itinerary editing
 */
router.post('/edit', async (req, res) => {
  try {
    const { command, itinerary, userId } = req.body;

    // Validate input
    if (!command || !command.trim()) {
      return res.status(400).json({
        error: 'Invalid command',
        message: 'Please provide a command to edit the itinerary'
      });
    }

    if (!itinerary || !itinerary.days) {
      return res.status(400).json({
        error: 'Invalid itinerary',
        message: 'Itinerary data is required'
      });
    }

    if (!userId) {
      return res.status(400).json({
        error: 'Authentication required',
        message: 'User ID is required for natural language editing'
      });
    }

    // This feature is premium only
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier, subscription_status')
      .eq('id', userId)
      .single();

    const isPremium = userData?.subscription_tier === 'premium' &&
                     userData?.subscription_status === 'active';

    if (!isPremium) {
      return res.status(403).json({
        error: 'Premium feature',
        message: 'Natural language editing is available for Premium subscribers only',
        upgradeUrl: '/pricing.html'
      });
    }

    // Build prompt to parse the command
    const prompt = contextBuilder.buildEditPrompt(command, itinerary);
    const systemPrompt = 'You are a precise itinerary editor. Extract user intent and return valid JSON only.';

    const responseText = await openaiClient.complete(prompt, {
      userId,
      userTier: 'premium',
      systemPrompt,
      jsonMode: true,
      endpoint: 'edit',
      maxTokens: 500,
      temperature: 0.3 // Lower temperature for more precise parsing
    });

    // Parse the intent
    let intent;
    try {
      intent = openaiClient.parseJSONResponse(responseText);
    } catch (parseError) {
      console.error('Failed to parse intent:', parseError);
      return res.status(400).json({
        error: 'Unable to understand command',
        message: 'Could not parse your command. Please try rephrasing it.',
        examples: [
          'Add sushi dinner in Shibuya on Day 3',
          'Remove teamLab visit',
          'Move Senso-ji to Day 2 morning',
          'Replace lunch with ramen shop in Shinjuku'
        ]
      });
    }

    // Validate intent structure
    if (!intent.action || !intent.what) {
      return res.status(400).json({
        error: 'Incomplete command',
        message: 'Please specify what you want to do and what item to modify'
      });
    }

    // Execute the edit based on action type
    let updatedItinerary;
    try {
      switch (intent.action) {
        case 'add':
          updatedItinerary = await handleAddAction(intent, itinerary);
          break;
        case 'remove':
          updatedItinerary = await handleRemoveAction(intent, itinerary);
          break;
        case 'move':
          updatedItinerary = await handleMoveAction(intent, itinerary);
          break;
        case 'replace':
          updatedItinerary = await handleReplaceAction(intent, itinerary);
          break;
        default:
          throw new Error(`Unsupported action: ${intent.action}`);
      }
    } catch (editError) {
      console.error('Edit execution error:', editError);
      return res.status(400).json({
        error: 'Edit failed',
        message: editError.message
      });
    }

    res.json({
      success: true,
      intent,
      updatedItinerary,
      message: generateSuccessMessage(intent)
    });

  } catch (error) {
    console.error('Natural language edit error:', error);

    if (error.message.includes('Rate limit')) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Please wait before making another edit'
      });
    }

    res.status(500).json({
      error: 'Edit failed',
      message: 'An error occurred while editing your itinerary'
    });
  }
});

/**
 * Handle ADD action
 */
async function handleAddAction(intent, itinerary) {
  const { what, where, when, category, duration } = intent;
  const dayIndex = (when?.day || 1) - 1;

  if (dayIndex < 0 || dayIndex >= itinerary.days.length) {
    throw new Error(`Invalid day number. Itinerary has ${itinerary.days.length} days.`);
  }

  // Geocode the location if 'where' is provided
  let coordinates = null;
  if (where) {
    try {
      const geoResult = await geocoder.geocode(where);
      if (geoResult && geoResult.length > 0) {
        coordinates = {
          lat: geoResult[0].latitude,
          lng: geoResult[0].longitude
        };
      }
    } catch (geoError) {
      console.error('Geocoding failed:', geoError);
      // Continue without coordinates
    }
  }

  // Create new stop
  const newStop = {
    name: { en: what, zh: what, ja: what },
    time: when?.time || 'TBD',
    desc: { en: `Added via AI assistant`, zh: '通过AI助手添加', ja: 'AIアシスタントで追加' },
    category: category || 'activity',
    icon: getCategoryIcon(category),
    ...(coordinates && { lat: coordinates.lat, lng: coordinates.lng }),
    ...(duration && { duration })
  };

  // Add to the specified day
  const updatedItinerary = JSON.parse(JSON.stringify(itinerary));
  updatedItinerary.days[dayIndex].stops.push(newStop);

  return updatedItinerary;
}

/**
 * Handle REMOVE action
 */
async function handleRemoveAction(intent, itinerary) {
  const { what } = intent;
  const updatedItinerary = JSON.parse(JSON.stringify(itinerary));

  let found = false;
  for (const day of updatedItinerary.days) {
    const originalLength = day.stops.length;
    day.stops = day.stops.filter(stop => {
      const stopName = typeof stop.name === 'object' ? stop.name.en : stop.name;
      return !stopName.toLowerCase().includes(what.toLowerCase());
    });
    if (day.stops.length < originalLength) {
      found = true;
    }
  }

  if (!found) {
    throw new Error(`Could not find "${what}" in itinerary`);
  }

  return updatedItinerary;
}

/**
 * Handle MOVE action
 */
async function handleMoveAction(intent, itinerary) {
  const { what, when } = intent;
  const targetDayIndex = (when?.day || 1) - 1;

  if (targetDayIndex < 0 || targetDayIndex >= itinerary.days.length) {
    throw new Error(`Invalid day number. Itinerary has ${itinerary.days.length} days.`);
  }

  const updatedItinerary = JSON.parse(JSON.stringify(itinerary));

  // Find and remove the stop from its current location
  let stopToMove = null;
  for (const day of updatedItinerary.days) {
    const stopIndex = day.stops.findIndex(stop => {
      const stopName = typeof stop.name === 'object' ? stop.name.en : stop.name;
      return stopName.toLowerCase().includes(what.toLowerCase());
    });

    if (stopIndex !== -1) {
      stopToMove = day.stops[stopIndex];
      day.stops.splice(stopIndex, 1);
      break;
    }
  }

  if (!stopToMove) {
    throw new Error(`Could not find "${what}" in itinerary`);
  }

  // Update time if specified
  if (when?.time) {
    stopToMove.time = when.time;
  }

  // Add to target day
  updatedItinerary.days[targetDayIndex].stops.push(stopToMove);

  return updatedItinerary;
}

/**
 * Handle REPLACE action
 */
async function handleReplaceAction(intent, itinerary) {
  const { what, replaceExisting } = intent;
  const targetName = replaceExisting || what;

  // First remove the old item
  const afterRemove = await handleRemoveAction({ what: targetName }, itinerary);

  // Then add the new item
  return await handleAddAction(intent, afterRemove);
}

/**
 * Get icon for category
 */
function getCategoryIcon(category) {
  const iconMap = {
    food: 'food',
    restaurant: 'food',
    attraction: 'attraction',
    hotel: 'hotel',
    transport: 'transport',
    activity: 'activity',
    shopping: 'shopping',
    nature: 'nature',
    temple: 'temple',
    shrine: 'temple'
  };
  return iconMap[category?.toLowerCase()] || 'pin';
}

/**
 * Generate success message
 */
function generateSuccessMessage(intent) {
  switch (intent.action) {
    case 'add':
      return `Added "${intent.what}" to your itinerary`;
    case 'remove':
      return `Removed "${intent.what}" from your itinerary`;
    case 'move':
      return `Moved "${intent.what}" to Day ${intent.when?.day}`;
    case 'replace':
      return `Replaced "${intent.replaceExisting || 'item'}" with "${intent.what}"`;
    default:
      return 'Itinerary updated successfully';
  }
}

module.exports = router;
