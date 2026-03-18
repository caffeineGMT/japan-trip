/**
 * Payment Client Library
 * Client-side JavaScript for Stripe integration with Supabase auth
 */

class PaymentClient {
  constructor(apiBaseUrl = '') {
    this.apiBaseUrl = apiBaseUrl;
    this.stripePublishableKey = null;
    this.stripe = null;
  }

  /**
   * Initialize Stripe.js
   * @param {string} publishableKey - Stripe publishable key
   */
  async initializeStripe(publishableKey) {
    this.stripePublishableKey = publishableKey;

    // Load Stripe.js dynamically if not already loaded
    if (typeof Stripe === 'undefined') {
      await this.loadStripeScript();
    }

    this.stripe = Stripe(publishableKey);
  }

  /**
   * Load Stripe.js script
   */
  loadStripeScript() {
    return new Promise((resolve, reject) => {
      if (typeof Stripe !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Get auth token from Supabase session
   * @returns {Promise<string|null>}
   */
  async getAuthToken() {
    // Assumes Supabase client is available globally as 'supabaseClient'
    if (typeof supabaseClient === 'undefined') {
      throw new Error('Supabase client not initialized');
    }

    const { data: { session } } = await supabaseClient.auth.getSession();
    return session?.access_token || null;
  }

  /**
   * Create checkout session for template purchase
   * @param {string} templateId - Template ID to purchase
   * @returns {Promise<void>}
   */
  async purchaseTemplate(templateId) {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Please sign in to purchase templates');
      }

      const response = await fetch(`${this.apiBaseUrl}/api/stripe/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'template',
          templateId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;

    } catch (error) {
      console.error('Purchase error:', error);
      throw error;
    }
  }

  /**
   * Create checkout session for premium subscription
   * @returns {Promise<void>}
   */
  async subscribeToPremium() {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Please sign in to subscribe');
      }

      const response = await fetch(`${this.apiBaseUrl}/api/stripe/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'subscription'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;

    } catch (error) {
      console.error('Subscription error:', error);
      throw error;
    }
  }

  /**
   * Open Stripe Customer Portal
   * Allows users to manage subscription, payment methods, invoices
   * @returns {Promise<void>}
   */
  async openCustomerPortal() {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Please sign in to access your account');
      }

      const response = await fetch(`${this.apiBaseUrl}/api/stripe/portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create portal session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Customer Portal
      window.location.href = url;

    } catch (error) {
      console.error('Portal error:', error);
      throw error;
    }
  }

  /**
   * Check user's access level and purchased templates
   * @returns {Promise<object>}
   */
  async checkUserAccess() {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return {
          isAuthenticated: false,
          hasPremium: false,
          templates: []
        };
      }

      // This endpoint would need to be implemented on the backend
      const response = await fetch(`${this.apiBaseUrl}/api/user/access`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check access');
      }

      return await response.json();

    } catch (error) {
      console.error('Access check error:', error);
      return {
        isAuthenticated: false,
        hasPremium: false,
        templates: []
      };
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaymentClient;
}
