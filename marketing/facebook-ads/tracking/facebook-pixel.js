/**
 * Facebook Pixel Integration for Japan Trip Companion
 * Tracks user behavior for retargeting campaigns
 */

class FacebookPixelTracker {
  constructor(pixelId) {
    this.pixelId = pixelId;
    this.initialized = false;
    this.events = [];
    this.customAudiences = {
      cherryBlossomSearchers: 'CHERRY_BLOSSOM_SEARCHERS',
      websiteVisitors: 'WEBSITE_VISITORS',
      signupAbandoners: 'SIGNUP_ABANDONERS',
      premiumViewers: 'PREMIUM_VIEWERS',
      highIntentUsers: 'HIGH_INTENT_USERS'
    };
  }

  /**
   * Initialize Facebook Pixel
   */
  init() {
    if (this.initialized) return;

    // Load Facebook Pixel script
    !function(f,b,e,v,n,t,s) {
      if(f.fbq) return;
      n=f.fbq=function(){
        n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments)
      };
      if(!f._fbq) f._fbq=n;
      n.push=n;
      n.loaded=!0;
      n.version='2.0';
      n.queue=[];
      t=b.createElement(e);
      t.async=!0;
      t.src=v;
      s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');

    // Initialize pixel
    fbq('init', this.pixelId);
    fbq('track', 'PageView');

    this.initialized = true;
    this.setupEventListeners();
    console.log('✓ Facebook Pixel initialized:', this.pixelId);
  }

  /**
   * Setup automatic event tracking
   */
  setupEventListeners() {
    // Track page views
    this.trackPageView();

    // Track scroll depth
    this.trackScrollDepth();

    // Track time on page
    this.trackTimeOnPage();

    // Track clicks on key elements
    this.trackClicks();

    // Track form interactions
    this.trackFormInteractions();

    // Track video plays
    this.trackVideoPlays();

    // Track search behavior
    this.trackSearch();
  }

  /**
   * Track page view with custom parameters
   */
  trackPageView() {
    const pageData = {
      page_title: document.title,
      page_url: window.location.href,
      referrer: document.referrer,
      user_agent: navigator.userAgent
    };

    // Check if user came from cherry blossom search
    const referrer = document.referrer.toLowerCase();
    const searchTerms = ['cherry blossom', 'sakura', 'japan spring', 'hanami'];

    if (searchTerms.some(term => referrer.includes(term))) {
      this.trackCustomEvent('CherryBlossomSearcher', {
        search_source: this.getSearchSource(referrer),
        ...pageData
      });
    }

    // Track custom page view
    this.trackCustomEvent('ViewContent', pageData);
  }

  /**
   * Track scroll depth for engagement
   */
  trackScrollDepth() {
    let maxScroll = 0;
    const milestones = [25, 50, 75, 90];
    const tracked = new Set();

    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
      }

      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !tracked.has(milestone)) {
          tracked.add(milestone);
          this.trackCustomEvent('ScrollDepth', {
            depth: milestone,
            page: window.location.pathname
          });

          // Mark high-intent users (90% scroll)
          if (milestone === 90) {
            this.addToCustomAudience('highIntentUsers', {
              engagement_level: 'high',
              scroll_depth: 90
            });
          }
        }
      });
    });
  }

  /**
   * Track time spent on page
   */
  trackTimeOnPage() {
    const startTime = Date.now();
    const intervals = [30, 60, 120, 300]; // seconds
    const tracked = new Set();

    setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      intervals.forEach(interval => {
        if (timeSpent >= interval && !tracked.has(interval)) {
          tracked.add(interval);
          this.trackCustomEvent('TimeOnPage', {
            duration: interval,
            page: window.location.pathname
          });

          // High intent: 5+ minutes
          if (interval === 300) {
            this.addToCustomAudience('highIntentUsers', {
              time_on_page: interval,
              engagement: 'very_high'
            });
          }
        }
      });
    }, 1000);
  }

  /**
   * Track clicks on important elements
   */
  trackClicks() {
    // Track CTA clicks
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (!target) return;

      const text = target.textContent.trim();
      const href = target.href || '';

      // Sign up button clicks
      if (text.match(/sign up|get started|try free/i)) {
        this.trackCustomEvent('InitiateCheckout', {
          button_text: text,
          button_location: this.getElementPath(target)
        });
        this.addToCustomAudience('premiumViewers', { intent: 'signup' });
      }

      // Pricing page clicks
      if (href.includes('/pricing')) {
        this.trackCustomEvent('ViewPricing', {
          source: window.location.pathname
        });
        this.addToCustomAudience('premiumViewers', { page: 'pricing' });
      }

      // Cherry blossom related clicks
      if (text.match(/cherry blossom|sakura|hanami/i)) {
        this.trackCustomEvent('CherryBlossomInterest', {
          element: text,
          type: target.tagName
        });
        this.addToCustomAudience('cherryBlossomSearchers', { interaction: 'click' });
      }

      // External links
      if (href && !href.includes(window.location.hostname)) {
        this.trackCustomEvent('OutboundClick', {
          url: href,
          text: text
        });
      }
    });
  }

  /**
   * Track form interactions
   */
  trackFormInteractions() {
    // Track form starts
    document.addEventListener('focus', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        const form = e.target.closest('form');
        if (form && !form.dataset.pixelTracked) {
          form.dataset.pixelTracked = 'true';
          this.trackCustomEvent('FormStart', {
            form_id: form.id || 'unknown',
            field: e.target.name || e.target.id
          });
        }
      }
    }, true);

    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target;
      this.trackCustomEvent('Lead', {
        form_id: form.id || 'unknown',
        form_action: form.action
      });
    });

    // Track signup abandonment
    let formInteraction = false;
    document.addEventListener('focus', (e) => {
      if (e.target.closest('form[data-signup]')) {
        formInteraction = true;
      }
    }, true);

    window.addEventListener('beforeunload', () => {
      if (formInteraction) {
        this.addToCustomAudience('signupAbandoners', {
          page: window.location.pathname,
          timestamp: Date.now()
        });
      }
    });
  }

  /**
   * Track video plays
   */
  trackVideoPlays() {
    document.addEventListener('play', (e) => {
      if (e.target.tagName === 'VIDEO') {
        this.trackCustomEvent('VideoPlay', {
          video_src: e.target.src || e.target.currentSrc,
          video_title: e.target.title || 'unknown'
        });
      }
    }, true);
  }

  /**
   * Track search behavior
   */
  trackSearch() {
    const searchInputs = document.querySelectorAll('input[type="search"], input[name*="search"], input[placeholder*="search"]');

    searchInputs.forEach(input => {
      input.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          const query = input.value.toLowerCase();
          this.trackCustomEvent('Search', {
            search_string: query,
            location: window.location.pathname
          });

          // Track cherry blossom searches
          if (query.includes('cherry') || query.includes('sakura') || query.includes('blossom')) {
            this.addToCustomAudience('cherryBlossomSearchers', {
              search_query: query,
              source: 'on_site'
            });
          }
        }
      });
    });
  }

  /**
   * Track custom event
   */
  trackCustomEvent(eventName, parameters = {}) {
    if (!this.initialized) {
      console.warn('Facebook Pixel not initialized');
      return;
    }

    // Add timestamp and session data
    const eventData = {
      ...parameters,
      timestamp: new Date().toISOString(),
      session_id: this.getSessionId(),
      page_path: window.location.pathname
    };

    fbq('trackCustom', eventName, eventData);

    // Store event locally for analytics
    this.events.push({
      event: eventName,
      data: eventData,
      time: Date.now()
    });

    console.log('Tracked:', eventName, eventData);
  }

  /**
   * Add user to custom audience
   */
  addToCustomAudience(audienceName, data = {}) {
    const audience = this.customAudiences[audienceName];
    if (!audience) {
      console.warn('Unknown custom audience:', audienceName);
      return;
    }

    this.trackCustomEvent(`CustomAudience_${audience}`, {
      audience_name: audienceName,
      ...data
    });

    // Store in localStorage for persistent tracking
    const audiences = JSON.parse(localStorage.getItem('fb_custom_audiences') || '[]');
    if (!audiences.includes(audience)) {
      audiences.push(audience);
      localStorage.setItem('fb_custom_audiences', JSON.stringify(audiences));
    }
  }

  /**
   * Track purchase (conversion)
   */
  trackPurchase(value, currency = 'USD', data = {}) {
    fbq('track', 'Purchase', {
      value: value,
      currency: currency,
      ...data
    });

    this.trackCustomEvent('ConversionComplete', {
      conversion_value: value,
      ...data
    });
  }

  /**
   * Track add to cart
   */
  trackAddToCart(productName, value, data = {}) {
    fbq('track', 'AddToCart', {
      content_name: productName,
      value: value,
      currency: 'USD',
      ...data
    });
  }

  /**
   * Get search source from referrer
   */
  getSearchSource(referrer) {
    if (referrer.includes('google')) return 'google';
    if (referrer.includes('bing')) return 'bing';
    if (referrer.includes('yahoo')) return 'yahoo';
    if (referrer.includes('duckduckgo')) return 'duckduckgo';
    return 'other';
  }

  /**
   * Get element path for tracking
   */
  getElementPath(element) {
    const path = [];
    while (element) {
      let selector = element.tagName.toLowerCase();
      if (element.id) {
        selector += `#${element.id}`;
      } else if (element.className) {
        selector += `.${element.className.split(' ')[0]}`;
      }
      path.unshift(selector);
      element = element.parentElement;
      if (path.length > 3) break;
    }
    return path.join(' > ');
  }

  /**
   * Get or create session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('fb_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('fb_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get all tracked events
   */
  getEvents() {
    return this.events;
  }

  /**
   * Get custom audiences user belongs to
   */
  getCustomAudiences() {
    return JSON.parse(localStorage.getItem('fb_custom_audiences') || '[]');
  }
}

// Auto-initialize if pixel ID is set
if (typeof FB_PIXEL_ID !== 'undefined') {
  window.fbPixelTracker = new FacebookPixelTracker(FB_PIXEL_ID);
  window.fbPixelTracker.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FacebookPixelTracker;
}
