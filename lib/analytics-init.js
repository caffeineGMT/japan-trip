/**
 * Analytics Initialization Script
 * Loads PostHog and initializes tracking
 */

(function() {
  'use strict';

  // PostHog configuration
  const POSTHOG_CONFIG = {
    apiKey: 'phc_YOUR_PROJECT_API_KEY', // Replace with your actual PostHog API key
    apiHost: 'https://app.posthog.com', // Or your self-hosted instance
  };

  // Make config globally available
  window.POSTHOG_API_KEY = POSTHOG_CONFIG.apiKey;

  // Load PostHog script
  function loadPostHog() {
    return new Promise((resolve, reject) => {
      if (typeof posthog !== 'undefined') {
        resolve(posthog);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/posthog-js@1.118.0/dist/array.full.js';
      script.async = true;
      script.onload = () => {
        if (typeof posthog !== 'undefined') {
          resolve(posthog);
        } else {
          reject(new Error('PostHog failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load PostHog script'));
      document.head.appendChild(script);
    });
  }

  // Initialize analytics when PostHog is loaded
  async function initializeAnalytics() {
    try {
      await loadPostHog();

      if (window.Analytics) {
        window.Analytics.init(POSTHOG_CONFIG.apiKey, {
          api_host: POSTHOG_CONFIG.apiHost,
        });

        console.log('✓ Analytics initialized');

        // Auto-track page view
        trackPageView();

        // Track user if logged in
        checkAuthAndIdentify();

        // Setup auto-tracking
        setupAutoTracking();
      }
    } catch (error) {
      console.error('Analytics initialization failed:', error);
    }
  }

  // Track current page view
  function trackPageView() {
    const pageName = getPageName();
    const source = new URLSearchParams(window.location.search).get('utm_source') || 'direct';
    const campaign = new URLSearchParams(window.location.search).get('utm_campaign');

    if (window.Analytics) {
      // Track different page types
      if (pageName === 'index' || pageName === 'home') {
        window.Analytics.trackLandingView(source, campaign);
      } else if (pageName === 'pricing') {
        window.Analytics.trackPricingViewed(document.referrer ? 'internal' : 'direct');
      } else if (pageName === 'early-access') {
        window.Analytics.trackSignupViewed('early_access_page');
      } else if (pageName === 'account') {
        window.Analytics.trackPageView('account_page');
      } else if (pageName === 'analytics-dashboard') {
        window.Analytics.trackPageView('analytics_dashboard');
      } else {
        window.Analytics.trackPageView(pageName);
      }
    }
  }

  // Get page name from URL
  function getPageName() {
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html') return 'index';
    return path.replace(/^\//, '').replace(/\.html$/, '') || 'unknown';
  }

  // Check if user is authenticated and identify them
  async function checkAuthAndIdentify() {
    // Check for Supabase session
    if (typeof supabase !== 'undefined') {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          window.Analytics.identify(session.user.id, {
            email: session.user.email,
            user_metadata: session.user.user_metadata,
          });
        }
      } catch (error) {
        console.error('Failed to identify user:', error);
      }
    }
  }

  // Setup automatic event tracking
  function setupAutoTracking() {
    // Track all CTA button clicks
    document.addEventListener('click', (e) => {
      const button = e.target.closest('button, a.btn, .cta-button');
      if (button) {
        const buttonText = button.textContent.trim();
        const buttonId = button.id || 'unknown';
        const location = getPageName();

        // Track specific actions
        if (buttonText.toLowerCase().includes('sign up') || buttonText.toLowerCase().includes('get started')) {
          window.Analytics.trackSignupViewed(location);
        } else if (buttonText.toLowerCase().includes('purchase') || buttonText.toLowerCase().includes('buy')) {
          const planName = button.getAttribute('data-plan') || 'unknown';
          window.Analytics.trackButtonClick(`purchase_${planName}`, location);
        } else if (buttonText.toLowerCase().includes('subscribe')) {
          window.Analytics.trackButtonClick('subscribe', location);
        } else {
          window.Analytics.trackButtonClick(buttonId || buttonText, location);
        }
      }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target;
      const formId = form.id || 'unknown_form';
      window.Analytics.trackFormSubmit(formId, true);
    });

    // Track time on page
    let startTime = Date.now();
    window.addEventListener('beforeunload', () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      window.Analytics.trackTimeOnPage(getPageName(), timeSpent);
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll > 25 && maxScroll < 26) {
          window.Analytics.track('scroll_depth', { depth: '25%', page: getPageName() });
        } else if (maxScroll > 50 && maxScroll < 51) {
          window.Analytics.track('scroll_depth', { depth: '50%', page: getPageName() });
        } else if (maxScroll > 75 && maxScroll < 76) {
          window.Analytics.track('scroll_depth', { depth: '75%', page: getPageName() });
        } else if (maxScroll > 90) {
          window.Analytics.track('scroll_depth', { depth: '100%', page: getPageName() });
        }
      }
    });

    // Track external link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.hostname !== window.location.hostname) {
        window.Analytics.track('external_link_clicked', {
          url: link.href,
          text: link.textContent.trim(),
          page: getPageName(),
        });
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAnalytics);
  } else {
    initializeAnalytics();
  }

  // Make initialization function available globally
  window.initializeAnalytics = initializeAnalytics;
})();
