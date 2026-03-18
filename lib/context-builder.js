const { formatInTimeZone } = require('date-fns-tz');
const { format, parseISO, isAfter, isBefore, addHours } = require('date-fns');

/**
 * Build comprehensive context for GPT prompts
 */
class ContextBuilder {
  /**
   * Format itinerary data for AI analysis
   */
  formatItinerary(itinerary) {
    if (!itinerary || !itinerary.days) {
      throw new Error('Invalid itinerary format');
    }

    const formatted = {
      destination: itinerary.destination || 'Japan',
      totalDays: itinerary.days.length,
      startDate: itinerary.startDate,
      endDate: itinerary.endDate,
      days: itinerary.days.map((day, index) => this.formatDay(day, index))
    };

    return formatted;
  }

  /**
   * Format individual day
   */
  formatDay(day, index) {
    return {
      dayNumber: index + 1,
      date: day.date,
      weekday: day.weekday,
      city: typeof day.city === 'object' ? day.city.en : day.city,
      theme: typeof day.theme === 'object' ? day.theme.en : day.theme,
      stops: (day.stops || []).map(stop => this.formatStop(stop)),
      hotel: typeof day.hotel === 'object' ? day.hotel.en : day.hotel,
      culturalTips: day.culturalTips || []
    };
  }

  /**
   * Format individual stop/activity
   */
  formatStop(stop) {
    return {
      name: typeof stop.name === 'object' ? stop.name.en : stop.name,
      time: stop.time,
      description: typeof stop.desc === 'object' ? stop.desc.en : stop.desc,
      category: stop.category,
      coordinates: stop.lat && stop.lng ? { lat: stop.lat, lng: stop.lng } : null,
      duration: stop.duration
    };
  }

  /**
   * Build optimization prompt
   */
  buildOptimizationPrompt(itinerary, userPreferences = {}) {
    const formatted = this.formatItinerary(itinerary);
    const destination = formatted.destination;

    let prompt = `You are an expert ${destination} travel planner. Analyze this ${formatted.totalDays}-day itinerary and provide optimization suggestions.\n\n`;

    prompt += `ITINERARY:\n${JSON.stringify(formatted, null, 2)}\n\n`;

    if (userPreferences.travelStyle) {
      prompt += `TRAVEL STYLE: ${userPreferences.travelStyle}\n`;
    }
    if (userPreferences.interests) {
      prompt += `INTERESTS: ${userPreferences.interests.join(', ')}\n`;
    }
    if (userPreferences.pacing) {
      prompt += `PREFERRED PACING: ${userPreferences.pacing}\n`;
    }

    prompt += `\nANALYZE FOR:\n`;
    prompt += `1. Route Efficiency: Identify backtracking or inefficient routing between locations. Consider geographic clusters.\n`;
    prompt += `2. Timing Issues: Check for rush hour conflicts (7-9 AM, 5-7 PM), closed venues, or unrealistic time allocations.\n`;
    prompt += `3. Crowd Management: Flag popular spots that will have long queues (temples, museums, restaurants).\n`;
    prompt += `4. Missing Essentials: Identify missing meals, rest breaks, or transportation gaps.\n`;
    prompt += `5. Seasonal Considerations: Account for cherry blossom timing, weather, and seasonal events.\n\n`;

    prompt += `RETURN FORMAT (JSON only, no markdown):\n`;
    prompt += `[\n`;
    prompt += `  {\n`;
    prompt += `    "type": "routing|timing|addition|warning|crowd",\n`;
    prompt += `    "dayNumber": 1,\n`;
    prompt += `    "description": "Clear explanation of the issue",\n`;
    prompt += `    "action": "Specific recommendation to fix it",\n`;
    prompt += `    "priority": "high|medium|low",\n`;
    prompt += `    "estimatedTimeSaved": "15 minutes" (optional)\n`;
    prompt += `  }\n`;
    prompt += `]\n\n`;

    prompt += `Maximum 5 most impactful suggestions. Be specific and actionable.`;

    return prompt;
  }

  /**
   * Build real-time recommendation prompt
   */
  buildRecommendationPrompt(context) {
    const {
      currentLocation,
      nearbyPOI,
      dayIndex,
      currentTime,
      weather,
      userLocation
    } = context;

    const poi = nearbyPOI;
    const distance = poi.distance || 'nearby';
    const closingTime = poi.closingTime || 'unknown';

    let prompt = `You are a real-time travel assistant. A traveler is currently in ${currentLocation.city}.\n\n`;

    prompt += `CURRENT CONTEXT:\n`;
    prompt += `- Location: ${currentLocation.address || currentLocation.name}\n`;
    prompt += `- Day ${dayIndex + 1} of their trip\n`;
    prompt += `- Time: ${currentTime}\n`;
    if (weather) {
      prompt += `- Weather: ${weather.condition}, ${weather.temperature}°C\n`;
    }
    prompt += `\nNEARBY DISCOVERY:\n`;
    prompt += `- Place: ${poi.name} (${poi.category})\n`;
    prompt += `- Distance: ${distance}\n`;
    if (poi.rating) {
      prompt += `- Rating: ${poi.rating}/5 (${poi.reviewCount || 0} reviews)\n`;
    }
    if (closingTime !== 'unknown') {
      prompt += `- Hours: Open until ${closingTime}\n`;
    }
    prompt += `- Description: ${poi.description || 'Popular local spot'}\n\n`;

    prompt += `Should the traveler visit this place? Consider:\n`;
    prompt += `1. Is it worth a detour from their current itinerary?\n`;
    prompt += `2. Do they have enough time before it closes?\n`;
    prompt += `3. Does it fit their interests and current energy level?\n`;
    prompt += `4. Weather appropriateness\n\n`;

    prompt += `Provide a concise recommendation (2-3 sentences max). Be conversational and helpful.`;

    return prompt;
  }

  /**
   * Build natural language edit prompt
   */
  buildEditPrompt(command, itinerary) {
    const formatted = this.formatItinerary(itinerary);

    let prompt = `Extract the user's intent from this natural language command:\n\n`;
    prompt += `COMMAND: "${command}"\n\n`;
    prompt += `CURRENT ITINERARY CONTEXT:\n`;
    prompt += `${JSON.stringify(formatted, null, 2)}\n\n`;

    prompt += `Parse the command and return JSON (no markdown):\n`;
    prompt += `{\n`;
    prompt += `  "action": "add|remove|move|replace",\n`;
    prompt += `  "what": "Name of place/activity",\n`;
    prompt += `  "category": "food|attraction|hotel|activity|transport",\n`;
    prompt += `  "where": "City or area name",\n`;
    prompt += `  "when": {\n`;
    prompt += `    "day": 1,\n`;
    prompt += `    "time": "18:00" (24h format, or "morning|afternoon|evening")\n`;
    prompt += `  },\n`;
    prompt += `  "duration": "1.5h" (optional),\n`;
    prompt += `  "replaceExisting": "Name of item to replace" (optional)\n`;
    prompt += `}\n\n`;

    prompt += `Examples:\n`;
    prompt += `"Add sushi dinner in Shibuya on Day 3" → {action: "add", what: "Sushi dinner", category: "food", where: "Shibuya", when: {day: 3, time: "evening"}}\n`;
    prompt += `"Remove teamLab visit" → {action: "remove", what: "teamLab", category: "attraction"}\n`;
    prompt += `"Move Senso-ji to Day 2 morning" → {action: "move", what: "Senso-ji", when: {day: 2, time: "morning"}}\n`;

    return prompt;
  }

  /**
   * Build checklist generation prompt
   */
  buildChecklistPrompt(tripContext) {
    const {
      destination,
      activities = [],
      season,
      durationDays,
      cities = [],
      startDate
    } = tripContext;

    let prompt = `Generate a comprehensive packing list for this trip:\n\n`;
    prompt += `TRIP DETAILS:\n`;
    prompt += `- Destination: ${destination}\n`;
    prompt += `- Duration: ${durationDays} days\n`;
    prompt += `- Season: ${season}\n`;
    if (startDate) {
      prompt += `- Start Date: ${startDate}\n`;
    }
    if (cities.length > 0) {
      prompt += `- Cities: ${cities.join(', ')}\n`;
    }
    prompt += `- Activities: ${activities.join(', ')}\n\n`;

    prompt += `Create a detailed packing list organized by category. Include:\n`;
    prompt += `1. Clothing appropriate for ${season} weather\n`;
    prompt += `2. Electronics and chargers\n`;
    prompt += `3. Important documents and travel items\n`;
    prompt += `4. Toiletries and medications\n`;
    prompt += `5. Activity-specific gear\n`;
    prompt += `6. ${destination}-specific recommendations (currency, adapters, etc.)\n\n`;

    prompt += `RETURN FORMAT (JSON only, no markdown):\n`;
    prompt += `[\n`;
    prompt += `  {\n`;
    prompt += `    "category": "Clothing",\n`;
    prompt += `    "items": ["Light jacket", "Comfortable walking shoes", ...]\n`;
    prompt += `  },\n`;
    prompt += `  ...\n`;
    prompt += `]\n\n`;

    prompt += `Be specific and practical. Include 20+ essential items total.`;

    return prompt;
  }

  /**
   * Extract trip context from itinerary
   */
  extractTripContext(itinerary) {
    const formatted = this.formatItinerary(itinerary);

    // Extract unique cities
    const cities = [...new Set(formatted.days.map(d => d.city))].filter(Boolean);

    // Extract activity types
    const activities = [...new Set(
      formatted.days.flatMap(d =>
        d.stops.map(s => s.category)
      )
    )].filter(Boolean);

    // Determine season from start date
    let season = 'spring';
    if (formatted.startDate) {
      const month = new Date(formatted.startDate).getMonth();
      if (month >= 2 && month <= 4) season = 'spring';
      else if (month >= 5 && month <= 7) season = 'summer';
      else if (month >= 8 && month <= 10) season = 'fall';
      else season = 'winter';
    }

    return {
      destination: formatted.destination,
      durationDays: formatted.totalDays,
      cities,
      activities,
      season,
      startDate: formatted.startDate
    };
  }
}

module.exports = new ContextBuilder();
