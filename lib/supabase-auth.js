const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with anon key (for client-side operations)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for user-authenticated operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Verify user session from JWT token
 * @param {string} token - JWT token from Authorization header
 * @returns {Promise<{user: object, error: null} | {user: null, error: object}>}
 */
async function verifySession(token) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      return { user: null, error };
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

/**
 * Get user by ID using admin client
 * @param {string} userId - User ID
 * @returns {Promise<object>}
 */
async function getUserById(userId) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Create or update user with Stripe customer ID
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} stripeCustomerId - Stripe customer ID
 * @returns {Promise<object>}
 */
async function upsertUser(userId, email, stripeCustomerId) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert({
      id: userId,
      email,
      stripe_customer_id: stripeCustomerId,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Update user subscription status
 * @param {string} userId - User ID
 * @param {string} subscriptionStatus - Subscription status (active, canceled, past_due, etc.)
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<object>}
 */
async function updateUserSubscription(userId, subscriptionStatus, subscriptionId) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({
      subscription_status: subscriptionStatus,
      subscription_id: subscriptionId,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Add template purchase to user
 * @param {string} userId - User ID
 * @param {string} templateId - Template ID
 * @returns {Promise<object>}
 */
async function addUserTemplate(userId, templateId) {
  const { data, error } = await supabaseAdmin
    .from('user_templates')
    .insert({
      user_id: userId,
      template_id: templateId,
      purchased_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    // Ignore duplicate key errors (user already owns this template)
    if (error.code === '23505') {
      const { data: existing } = await supabaseAdmin
        .from('user_templates')
        .select('*')
        .eq('user_id', userId)
        .eq('template_id', templateId)
        .single();
      return existing;
    }
    throw error;
  }

  return data;
}

/**
 * Check if user owns a specific template
 * @param {string} userId - User ID
 * @param {string} templateId - Template ID
 * @returns {Promise<boolean>}
 */
async function userOwnsTemplate(userId, templateId) {
  const { data, error } = await supabaseAdmin
    .from('user_templates')
    .select('id')
    .eq('user_id', userId)
    .eq('template_id', templateId)
    .single();

  return !error && data !== null;
}

/**
 * Check if user has active premium subscription
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
async function userHasPremium(userId) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('subscription_status')
    .eq('id', userId)
    .single();

  if (error) {
    return false;
  }

  return data?.subscription_status === 'active';
}

module.exports = {
  supabase,
  supabaseAdmin,
  verifySession,
  getUserById,
  upsertUser,
  updateUserSubscription,
  addUserTemplate,
  userOwnsTemplate,
  userHasPremium
};
