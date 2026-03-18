const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Supabase for rate limiting and caching
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Rate limiting config
const RATE_LIMITS = {
  free: { requests: 10, period: 30 * 24 * 60 * 60 * 1000 }, // 10 per month
  premium: { requests: 1000, period: 30 * 24 * 60 * 60 * 1000 } // 1000 per month
};

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

class OpenAIClient {
  constructor() {
    this.model = 'gpt-4-turbo';
    this.defaultMaxTokens = 1000;
    this.defaultTemperature = 0.7;
  }

  /**
   * Check if user has exceeded rate limit
   */
  async checkRateLimit(userId, userTier = 'free') {
    const limit = RATE_LIMITS[userTier];
    const periodStart = new Date(Date.now() - limit.period);

    // Count requests in the current period
    const { data, error } = await supabase
      .from('ai_usage')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', periodStart.toISOString());

    if (error) {
      console.error('Rate limit check error:', error);
      throw new Error('Failed to check rate limit');
    }

    const requestCount = data?.length || 0;
    const remaining = limit.requests - requestCount;

    return {
      allowed: requestCount < limit.requests,
      remaining,
      limit: limit.requests,
      resetAt: new Date(Date.now() + limit.period)
    };
  }

  /**
   * Log AI usage for rate limiting
   */
  async logUsage(userId, endpoint, promptTokens, completionTokens, cached = false) {
    const { error } = await supabase
      .from('ai_usage')
      .insert({
        user_id: userId,
        endpoint,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens,
        cached,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Usage logging error:', error);
    }
  }

  /**
   * Get cached response if available
   */
  async getCachedResponse(cacheKey) {
    const { data, error } = await supabase
      .from('ai_cache')
      .select('response, created_at')
      .eq('cache_key', cacheKey)
      .single();

    if (error || !data) return null;

    // Check if cache is still valid
    const cacheAge = Date.now() - new Date(data.created_at).getTime();
    if (cacheAge > CACHE_DURATION) {
      // Delete expired cache
      await supabase.from('ai_cache').delete().eq('cache_key', cacheKey);
      return null;
    }

    return data.response;
  }

  /**
   * Cache AI response
   */
  async cacheResponse(cacheKey, response) {
    await supabase
      .from('ai_cache')
      .upsert({
        cache_key: cacheKey,
        response,
        created_at: new Date().toISOString()
      });
  }

  /**
   * Generate cache key from prompt
   */
  generateCacheKey(prompt, params = {}) {
    const crypto = require('crypto');
    const data = JSON.stringify({ prompt, ...params });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Make GPT-4 completion request with rate limiting and caching
   */
  async complete(prompt, options = {}) {
    const {
      userId,
      userTier = 'free',
      maxTokens = this.defaultMaxTokens,
      temperature = this.defaultTemperature,
      systemPrompt = 'You are a helpful travel assistant.',
      jsonMode = false,
      cacheKey = null,
      endpoint = 'completion'
    } = options;

    // Check rate limit if userId provided
    if (userId) {
      const rateLimitCheck = await this.checkRateLimit(userId, userTier);
      if (!rateLimitCheck.allowed) {
        const error = new Error('Rate limit exceeded');
        error.rateLimit = rateLimitCheck;
        throw error;
      }
    }

    // Check cache if cacheKey provided
    const finalCacheKey = cacheKey || this.generateCacheKey(prompt, { systemPrompt, maxTokens, temperature });
    const cachedResponse = await this.getCachedResponse(finalCacheKey);

    if (cachedResponse) {
      // Log cached usage
      if (userId) {
        await this.logUsage(userId, endpoint, 0, 0, true);
      }
      return cachedResponse;
    }

    try {
      // Make OpenAI API call
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature,
        ...(jsonMode && { response_format: { type: 'json_object' } })
      });

      const response = completion.choices[0].message.content;

      // Log usage
      if (userId) {
        await this.logUsage(
          userId,
          endpoint,
          completion.usage.prompt_tokens,
          completion.usage.completion_tokens,
          false
        );
      }

      // Cache response
      await this.cacheResponse(finalCacheKey, response);

      return response;
    } catch (error) {
      console.error('OpenAI API error:', error);

      // Handle specific error types
      if (error.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      } else if (error.status === 401) {
        throw new Error('Invalid OpenAI API key');
      } else {
        throw new Error('AI service temporarily unavailable');
      }
    }
  }

  /**
   * Parse JSON response safely
   */
  parseJSONResponse(response) {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error('Invalid JSON response from AI');
    }
  }
}

module.exports = new OpenAIClient();
