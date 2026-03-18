/**
 * Conversion Funnel Analytics
 * Tracks user journey: signup → free trial → paid conversion
 * Integrates with PostHog for event tracking and funnel analysis
 */

class Analytics {
  constructor() {
    this.initialized = false;
    this.userId = null;
    this.sessionId = null;
    this.posthog = null;
  }

  /**
   * Initialize PostHog analytics
   */
  init(apiKey, options = {}) {
    if (this.initialized) return;

    const defaultOptions = {
      api_host: options.api_host || 'https://app.posthog.com',
      loaded: (posthog) => {
        console.log('PostHog analytics loaded');
        this.posthog = posthog;
        this.sessionId = posthog.get_session_id();
      },
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage',
      autocapture: false, // We'll track events manually for better control
      session_recording: {
        recordCrossOriginIframes: true,
      },
      disable_session_recording: false,
      enable_recording_console_log: true,
    };

    if (typeof posthog !== 'undefined') {
      posthog.init(apiKey, { ...defaultOptions, ...options });
      this.initialized = true;
    } else {
      console.warn('PostHog not loaded. Analytics disabled.');
    }
  }

  /**
   * Identify user after signup/login
   */
  identify(userId, traits = {}) {
    if (!this.initialized || !userId) return;

    this.userId = userId;
    posthog.identify(userId, {
      ...traits,
      first_seen: traits.first_seen || new Date().toISOString(),
    });
  }

  /**
   * Track page view
   */
  trackPageView(pageName, properties = {}) {
    if (!this.initialized) return;

    posthog.capture('$pageview', {
      page_name: pageName,
      ...properties,
    });
  }

  // ==================== FUNNEL STAGE 1: AWARENESS ====================

  /**
   * Landing page view
   */
  trackLandingView(source = 'direct', campaign = null) {
    this.track('landing_viewed', {
      funnel_stage: 'awareness',
      source,
      campaign,
      utm_source: this.getUTMParam('utm_source'),
      utm_medium: this.getUTMParam('utm_medium'),
      utm_campaign: this.getUTMParam('utm_campaign'),
    });
  }

  /**
   * Feature interaction on landing
   */
  trackFeatureInteraction(featureName, action = 'clicked') {
    this.track('feature_interaction', {
      funnel_stage: 'awareness',
      feature_name: featureName,
      action,
    });
  }

  // ==================== FUNNEL STAGE 2: SIGNUP ====================

  /**
   * Signup form viewed
   */
  trackSignupViewed(location = 'unknown') {
    this.track('signup_viewed', {
      funnel_stage: 'signup',
      location,
    });
  }

  /**
   * Signup form started (user entered email)
   */
  trackSignupStarted(email) {
    this.track('signup_started', {
      funnel_stage: 'signup',
      email_domain: email.split('@')[1],
    });
  }

  /**
   * Signup completed
   */
  trackSignupCompleted(userId, email, signupMethod = 'email') {
    this.identify(userId, {
      email,
      signup_method: signupMethod,
      signup_date: new Date().toISOString(),
    });

    this.track('signup_completed', {
      funnel_stage: 'signup',
      signup_method: signupMethod,
      email_domain: email.split('@')[1],
    });
  }

  /**
   * Email verification sent
   */
  trackEmailVerificationSent(email) {
    this.track('email_verification_sent', {
      funnel_stage: 'signup',
      email_domain: email.split('@')[1],
    });
  }

  /**
   * Email verified
   */
  trackEmailVerified() {
    this.track('email_verified', {
      funnel_stage: 'signup',
    });
  }

  // ==================== FUNNEL STAGE 3: ACTIVATION ====================

  /**
   * First login after signup
   */
  trackFirstLogin() {
    this.track('first_login', {
      funnel_stage: 'activation',
    });
  }

  /**
   * Onboarding started
   */
  trackOnboardingStarted() {
    this.track('onboarding_started', {
      funnel_stage: 'activation',
    });
  }

  /**
   * Onboarding step completed
   */
  trackOnboardingStep(stepNumber, stepName) {
    this.track('onboarding_step_completed', {
      funnel_stage: 'activation',
      step_number: stepNumber,
      step_name: stepName,
    });
  }

  /**
   * Onboarding completed
   */
  trackOnboardingCompleted(timeSpent) {
    this.track('onboarding_completed', {
      funnel_stage: 'activation',
      time_spent_seconds: timeSpent,
    });
  }

  // ==================== FUNNEL STAGE 4: FREE TRIAL ====================

  /**
   * Free trial started
   */
  trackFreeTrialStarted(planName = 'free') {
    this.track('free_trial_started', {
      funnel_stage: 'trial',
      plan_name: planName,
      trial_start_date: new Date().toISOString(),
    });

    // Set user property
    if (this.initialized) {
      posthog.people.set({
        trial_status: 'active',
        trial_start_date: new Date().toISOString(),
      });
    }
  }

  /**
   * Free feature used
   */
  trackFreeFeatureUsed(featureName) {
    this.track('free_feature_used', {
      funnel_stage: 'trial',
      feature_name: featureName,
    });
  }

  /**
   * Premium feature attempted (paywall hit)
   */
  trackPaywallHit(featureName, context = 'feature_access') {
    this.track('paywall_hit', {
      funnel_stage: 'trial',
      feature_name: featureName,
      context,
    });
  }

  // ==================== FUNNEL STAGE 5: CONVERSION ====================

  /**
   * Pricing page viewed
   */
  trackPricingViewed(source = 'unknown') {
    this.track('pricing_viewed', {
      funnel_stage: 'conversion',
      source,
    });
  }

  /**
   * Plan selected
   */
  trackPlanSelected(planName, price, billingCycle = 'monthly') {
    this.track('plan_selected', {
      funnel_stage: 'conversion',
      plan_name: planName,
      price,
      billing_cycle: billingCycle,
    });
  }

  /**
   * Checkout initiated
   */
  trackCheckoutInitiated(planName, price, billingCycle = 'monthly') {
    this.track('checkout_initiated', {
      funnel_stage: 'conversion',
      plan_name: planName,
      price,
      billing_cycle: billingCycle,
      checkout_start_time: new Date().toISOString(),
    });
  }

  /**
   * Payment info entered
   */
  trackPaymentInfoEntered() {
    this.track('payment_info_entered', {
      funnel_stage: 'conversion',
    });
  }

  /**
   * Purchase completed
   */
  trackPurchaseCompleted(planName, price, billingCycle, transactionId) {
    this.track('purchase_completed', {
      funnel_stage: 'conversion',
      plan_name: planName,
      price,
      billing_cycle: billingCycle,
      transaction_id: transactionId,
      revenue: price,
      currency: 'USD',
    });

    // Set user properties
    if (this.initialized) {
      posthog.people.set({
        is_paying_customer: true,
        plan_name: planName,
        plan_price: price,
        billing_cycle: billingCycle,
        conversion_date: new Date().toISOString(),
      });
    }
  }

  /**
   * Purchase failed
   */
  trackPurchaseFailed(planName, price, errorMessage) {
    this.track('purchase_failed', {
      funnel_stage: 'conversion',
      plan_name: planName,
      price,
      error_message: errorMessage,
    });
  }

  // ==================== FUNNEL STAGE 6: RETENTION ====================

  /**
   * Subscription renewed
   */
  trackSubscriptionRenewed(planName, price) {
    this.track('subscription_renewed', {
      funnel_stage: 'retention',
      plan_name: planName,
      price,
      revenue: price,
    });
  }

  /**
   * Subscription cancelled
   */
  trackSubscriptionCancelled(planName, reason = 'unknown') {
    this.track('subscription_cancelled', {
      funnel_stage: 'retention',
      plan_name: planName,
      cancellation_reason: reason,
    });

    // Update user properties
    if (this.initialized) {
      posthog.people.set({
        is_paying_customer: false,
        cancellation_date: new Date().toISOString(),
        cancellation_reason: reason,
      });
    }
  }

  /**
   * Churn risk detected
   */
  trackChurnRisk(riskScore, indicators = []) {
    this.track('churn_risk_detected', {
      funnel_stage: 'retention',
      risk_score: riskScore,
      indicators: indicators.join(', '),
    });
  }

  // ==================== A/B TESTING ====================

  /**
   * Get feature flag value
   */
  getFeatureFlag(flagName, defaultValue = false) {
    if (!this.initialized) return defaultValue;
    return posthog.getFeatureFlag(flagName) || defaultValue;
  }

  /**
   * Track A/B test variant view
   */
  trackVariantViewed(experimentName, variantName) {
    this.track('experiment_variant_viewed', {
      experiment_name: experimentName,
      variant_name: variantName,
    });
  }

  // ==================== ENGAGEMENT METRICS ====================

  /**
   * Track time on page
   */
  trackTimeOnPage(pageName, timeSpent) {
    this.track('time_on_page', {
      page_name: pageName,
      time_spent_seconds: timeSpent,
    });
  }

  /**
   * Track button click
   */
  trackButtonClick(buttonName, location) {
    this.track('button_clicked', {
      button_name: buttonName,
      location,
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmit(formName, success = true) {
    this.track('form_submitted', {
      form_name: formName,
      success,
    });
  }

  /**
   * Track search
   */
  trackSearch(query, resultsCount) {
    this.track('search_performed', {
      query,
      results_count: resultsCount,
    });
  }

  // ==================== HELPER METHODS ====================

  /**
   * Generic event tracking
   */
  track(eventName, properties = {}) {
    if (!this.initialized) return;

    const enrichedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      page_url: window.location.href,
      page_path: window.location.pathname,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
    };

    posthog.capture(eventName, enrichedProperties);
  }

  /**
   * Get UTM parameter from URL
   */
  getUTMParam(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
  }

  /**
   * Set user properties
   */
  setUserProperties(properties) {
    if (!this.initialized) return;
    posthog.people.set(properties);
  }

  /**
   * Increment user property
   */
  incrementUserProperty(propertyName, incrementBy = 1) {
    if (!this.initialized) return;
    posthog.people.increment(propertyName, incrementBy);
  }

  /**
   * Reset analytics (e.g., on logout)
   */
  reset() {
    if (!this.initialized) return;
    posthog.reset();
    this.userId = null;
  }

  /**
   * Start session recording
   */
  startRecording() {
    if (!this.initialized) return;
    posthog.startSessionRecording();
  }

  /**
   * Stop session recording
   */
  stopRecording() {
    if (!this.initialized) return;
    posthog.stopSessionRecording();
  }

  /**
   * Create funnel cohort
   */
  createFunnelCohort(cohortName, properties = {}) {
    if (!this.initialized) return;
    posthog.group('cohort', cohortName, properties);
  }
}

// Export singleton instance
const analytics = new Analytics();

// Auto-initialize if PostHog key is set in config
if (typeof window !== 'undefined' && window.POSTHOG_API_KEY) {
  analytics.init(window.POSTHOG_API_KEY);
}

// Make available globally
if (typeof window !== 'undefined') {
  window.Analytics = analytics;
}
