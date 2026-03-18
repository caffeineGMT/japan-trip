/**
 * Affiliate Click Tracker
 * Logs affiliate clicks to analytics and tracks revenue attribution
 */

const AffiliateTracker = {
  // Track affiliate click event
  trackClick: function(source, metadata = {}) {
    const clickData = {
      source: source,              // 'booking.com', 'getyourguide', 'jrpass'
      timestamp: new Date().toISOString(),
      day_number: metadata.dayNumber || null,
      city: metadata.city || null,
      item_name: metadata.itemName || null,
      item_price: metadata.itemPrice || null,
      session_id: this.getSessionId(),
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      url: window.location.href
    };

    // Log to console in development
    console.log('[Affiliate Click]', clickData);

    // Send to Google Analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'affiliate_click', {
        event_category: 'monetization',
        event_label: source,
        value: metadata.itemPrice || 0,
        ...metadata
      });
    }

    // Store in localStorage for local tracking
    this.storeClickLocally(clickData);

    // Send to backend analytics endpoint (when available)
    this.sendToBackend(clickData);

    return clickData;
  },

  // Generate or retrieve session ID
  getSessionId: function() {
    let sessionId = localStorage.getItem('affiliate_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('affiliate_session_id', sessionId);
    }
    return sessionId;
  },

  // Store click locally for analytics
  storeClickLocally: function(clickData) {
    try {
      let clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
      clicks.push(clickData);

      // Keep only last 100 clicks to avoid storage issues
      if (clicks.length > 100) {
        clicks = clicks.slice(-100);
      }

      localStorage.setItem('affiliate_clicks', JSON.stringify(clicks));
      localStorage.setItem('total_affiliate_clicks', clicks.length);
    } catch (error) {
      console.error('Error storing click locally:', error);
    }
  },

  // Send to backend analytics endpoint
  sendToBackend: function(clickData) {
    // This would send to a backend API endpoint like Supabase
    // For now, we'll prepare the structure for future integration
    const endpoint = '/api/affiliate-clicks'; // Future endpoint

    if (window.fetch && false) { // Disabled until backend is ready
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clickData)
      })
      .then(response => response.json())
      .then(data => {
        console.log('[Affiliate] Click logged to backend:', data);
      })
      .catch(error => {
        console.warn('[Affiliate] Backend logging failed:', error);
      });
    }
  },

  // Get click statistics
  getStats: function() {
    try {
      const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
      const stats = {
        total_clicks: clicks.length,
        by_source: {},
        by_day: {},
        total_estimated_revenue: 0
      };

      clicks.forEach(click => {
        // Count by source
        stats.by_source[click.source] = (stats.by_source[click.source] || 0) + 1;

        // Count by day
        if (click.day_number) {
          stats.by_day[click.day_number] = (stats.by_day[click.day_number] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  },

  // Export clicks data for analysis
  exportClicks: function() {
    try {
      const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
      const blob = new Blob([JSON.stringify(clicks, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `affiliate_clicks_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting clicks:', error);
    }
  }
};

// Expose globally
window.AffiliateTracker = AffiliateTracker;
