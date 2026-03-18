/**
 * Transport Widget - JR Pass & Rail Affiliates
 * Displays JR Pass and other transport affiliate options
 */

const TransportWidget = {
  // JR Pass Affiliate ID
  // To join: Apply at https://www.jrpass.com/affiliate
  JRPASS_AFFILIATE_ID: process.env.JRPASS_AFFILIATE_ID || 'japan_trip_demo', // Replace with your own

  // Configuration
  config: {
    showForCountry: 'Japan',  // Only show JR Pass for Japan trips
    minDaysForPass: 3         // Show pass recommendation if trip >= 3 days
  },

  /**
   * Render transport widget
   * @param {Object} tripData - Full TRIP_DATA array
   * @param {number} currentDayIndex - Current day being viewed
   * @returns {string} HTML for transport widget
   */
  render: function(tripData, currentDayIndex) {
    // Only show on first few days or when relevant
    if (currentDayIndex > 2) {
      return ''; // Don't spam every day
    }

    // Check if this is a Japan trip
    const currentDay = tripData[currentDayIndex];
    const cityName = typeof currentDay.city === 'object' ? currentDay.city.en : currentDay.city;

    // Only show for Japan
    if (!this.isJapanCity(cityName)) {
      return '';
    }

    // Calculate trip duration
    const tripDays = tripData.length;

    if (tripDays < this.config.minDaysForPass) {
      return '';
    }

    // Build widget HTML
    return this.buildWidgetHTML(tripDays, currentDayIndex);
  },

  /**
   * Check if city is in Japan
   */
  isJapanCity: function(city) {
    const japanCities = ['Tokyo', 'Kyoto', 'Osaka', 'Nara', 'Hiroshima', 'Fukuoka', 'Sapporo', 'Nagoya', 'Yokohama'];
    return japanCities.some(c => city.includes(c));
  },

  /**
   * Recommend JR Pass type based on trip duration
   */
  recommendPass: function(tripDays) {
    if (tripDays <= 7) {
      return {
        type: '7-Day JR Pass',
        price: 280,
        description: 'Perfect for 1 week trips. Unlimited JR trains including Shinkansen.',
        savings: 'Save up to $200 vs individual tickets'
      };
    } else if (tripDays <= 14) {
      return {
        type: '14-Day JR Pass',
        price: 445,
        description: 'Ideal for 2 week trips. Unlimited JR trains nationwide.',
        savings: 'Save up to $400 vs individual tickets'
      };
    } else {
      return {
        type: '21-Day JR Pass',
        price: 570,
        description: 'Best for extended stays. Maximum flexibility.',
        savings: 'Save up to $600 vs individual tickets'
      };
    }
  },

  /**
   * Build JR Pass affiliate link
   */
  buildJRPassLink: function() {
    return `https://www.jrpass.com/passes?ref=${this.JRPASS_AFFILIATE_ID}`;
  },

  /**
   * Build widget HTML
   */
  buildWidgetHTML: function(tripDays, currentDayIndex) {
    const passRecommendation = this.recommendPass(tripDays);
    const affiliateLink = this.buildJRPassLink();

    let html = `
      <div class="affiliate-widget transport-widget">
        <div class="widget-header">
          <h4><span class="widget-icon">🚄</span> Save on Train Travel</h4>
          <span class="widget-badge">Partner</span>
        </div>
        <div class="widget-content">
          <div class="jr-pass-banner">
            <div class="jr-pass-image">
              <img src="https://images.unsplash.com/photo-1569437061238-3cf61084f487?w=600&h=300&fit=crop" alt="Shinkansen" />
              <div class="pass-type-badge">${passRecommendation.type}</div>
            </div>
            <div class="jr-pass-info">
              <h5 class="pass-title">Japan Rail Pass</h5>
              <p class="pass-description">${passRecommendation.description}</p>
              <div class="pass-benefits">
                <div class="benefit-item">
                  <span class="benefit-icon">✓</span>
                  <span>Unlimited Shinkansen (Bullet Train)</span>
                </div>
                <div class="benefit-item">
                  <span class="benefit-icon">✓</span>
                  <span>All JR local trains & buses</span>
                </div>
                <div class="benefit-item">
                  <span class="benefit-icon">✓</span>
                  <span>Narita Express to/from airport</span>
                </div>
              </div>
              <div class="pass-savings">
                <span class="savings-icon">💰</span>
                <span class="savings-text">${passRecommendation.savings}</span>
              </div>
            </div>
            <div class="jr-pass-action">
              <div class="pass-price">
                <span class="price-from">From</span>
                <span class="price-amount">$${passRecommendation.price}</span>
                <span class="price-unit">for ${passRecommendation.type}</span>
              </div>
              <a href="${affiliateLink}"
                 target="_blank"
                 class="pass-cta-btn"
                 onclick="AffiliateTracker.trackClick('jrpass', {
                   dayNumber: ${currentDayIndex + 1},
                   itemName: '${passRecommendation.type}',
                   itemPrice: ${passRecommendation.price}
                 }); return true;">
                Get JR Pass
                <svg class="btn-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3l5 5-5 5M13 8H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          <div class="transport-tips">
            <h6>Travel Tips</h6>
            <ul class="tips-list">
              <li><strong>Activate before first use:</strong> Exchange voucher at airport JR office</li>
              <li><strong>Reserve seats:</strong> Free seat reservations at any JR ticket office</li>
              <li><strong>Not valid for Nozomi:</strong> Use Hikari or Sakura Shinkansen instead</li>
            </ul>
          </div>

          <div class="alternative-options">
            <h6>Other Options</h6>
            <div class="alt-option">
              <span class="alt-icon">🎫</span>
              <span class="alt-name">Suica/PASMO IC Card</span>
              <span class="alt-desc">For local trains & buses (set up via Apple Pay)</span>
            </div>
            <div class="alt-option">
              <span class="alt-icon">📱</span>
              <span class="alt-name">SmartEX App</span>
              <span class="alt-desc">Book individual Shinkansen tickets online</span>
            </div>
          </div>
        </div>
        <div class="widget-footer">
          <span class="affiliate-disclosure">Affiliate Partner • Commission earned on purchases</span>
        </div>
      </div>
    `;

    return html;
  }
};

// Expose globally
window.TransportWidget = TransportWidget;
