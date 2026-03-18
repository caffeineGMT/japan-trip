/**
 * GetYourGuide Activities Widget
 * Fetches and displays curated tours and experiences with affiliate links
 */

const ActivitiesWidget = {
  // GetYourGuide Partner API credentials
  // To get your credentials: Apply at https://partner.getyourguide.com
  API_KEY: process.env.GETYOURGUIDE_API_KEY || 'GYG_DEMO_KEY', // Replace with your own
  PARTNER_ID: process.env.GETYOURGUIDE_PARTNER_ID || 'DEMO_PARTNER', // Replace with your own

  // Configuration
  config: {
    limit: 3,           // Number of activities to show
    radius: 5000,       // Search radius in meters (5km)
    minRating: 4.0      // Minimum rating (out of 5)
  },

  /**
   * Render activities widget for a specific day
   * @param {Object} day - Day data from TRIP_DATA
   * @param {number} dayIndex - Index of the day
   * @returns {string} HTML for activities widget
   */
  render: async function(day, dayIndex) {
    if (!day || !day.stops || day.stops.length === 0) {
      return '';
    }

    // Get first stop as reference point
    const referencePoint = day.stops[0];

    // Determine activity category based on day content
    const categories = this.detectCategories(day);

    try {
      // Fetch activities
      const activities = await this.fetchActivities(referencePoint, day.city, categories);

      if (!activities || activities.length === 0) {
        return '';
      }

      // Build widget HTML
      return this.buildWidgetHTML(activities, dayIndex, day);
    } catch (error) {
      console.error('[Activities Widget] Error:', error);
      return '';
    }
  },

  /**
   * Detect relevant activity categories from day data
   */
  detectCategories: function(day) {
    const categories = [];

    // Analyze stops for category hints
    day.stops.forEach(stop => {
      const stopName = typeof stop.name === 'object' ? stop.name.en.toLowerCase() : stop.name.toLowerCase();
      const stopDesc = typeof stop.desc === 'object' ? stop.desc.en.toLowerCase() : stop.desc.toLowerCase();
      const combined = stopName + ' ' + stopDesc;

      if (combined.includes('temple') || combined.includes('shrine') || combined.includes('garden')) {
        categories.push('culture');
      }
      if (combined.includes('food') || combined.includes('restaurant') || combined.includes('ramen') || combined.includes('sushi')) {
        categories.push('food');
      }
      if (combined.includes('museum') || combined.includes('art')) {
        categories.push('museum');
      }
      if (combined.includes('park') || combined.includes('nature') || combined.includes('cherry blossom')) {
        categories.push('nature');
      }
    });

    // Remove duplicates
    return [...new Set(categories)];
  },

  /**
   * Fetch activities from GetYourGuide API or mock data
   */
  fetchActivities: async function(referencePoint, city, categories) {
    // Mock data for demonstration
    // In production, you would call GetYourGuide Partner API:
    // GET https://api.getyourguide.com/activities
    //   ?partner_id={YOUR_ID}
    //   &lat={LAT}&lng={LON}
    //   &limit=3
    //   &category={CATEGORY}

    const cityName = typeof city === 'object' ? city.en : city;

    // Generate mock activities based on city and categories
    const mockActivities = this.generateMockActivities(cityName, categories);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return mockActivities.slice(0, this.config.limit);
  },

  /**
   * Generate mock activity data for demonstration
   */
  generateMockActivities: function(cityName, categories) {
    const activityTemplates = {
      'Tokyo': {
        'culture': [
          {
            title: 'Tokyo: Meiji Shrine & Sensoji Temple Walking Tour',
            duration: '3 hours',
            price: 45,
            rating: 4.8,
            reviewCount: 1234,
            image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=250&fit=crop',
            description: 'Explore Tokyo\'s most sacred shrines with an expert guide',
            includes: ['English guide', 'Entry tickets', 'Snacks']
          },
          {
            title: 'Tokyo Imperial Palace Historical Tour',
            duration: '2.5 hours',
            price: 38,
            rating: 4.7,
            reviewCount: 890,
            image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=250&fit=crop',
            description: 'Discover the history of Japan\'s Imperial family',
            includes: ['Expert historian guide', 'Palace grounds access']
          }
        ],
        'food': [
          {
            title: 'Tokyo: Tsukiji Fish Market Food & Culture Tour',
            duration: '3.5 hours',
            price: 89,
            rating: 4.9,
            reviewCount: 2156,
            image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=250&fit=crop',
            description: 'Taste the freshest sushi and explore Tokyo\'s food culture',
            includes: ['Local guide', '10+ food tastings', 'Market tour']
          },
          {
            title: 'Shibuya Street Food & Night Tour',
            duration: '3 hours',
            price: 75,
            rating: 4.8,
            reviewCount: 1678,
            image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop',
            description: 'Experience Tokyo\'s vibrant night food scene',
            includes: ['Local foodie guide', '6 food stops', 'Drinks included']
          }
        ],
        'nature': [
          {
            title: 'Mt. Fuji & Hakone Day Trip from Tokyo',
            duration: 'Full day',
            price: 145,
            rating: 4.6,
            reviewCount: 3421,
            image: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=400&h=250&fit=crop',
            description: 'See Japan\'s iconic mountain and scenic lake',
            includes: ['Transportation', 'Lunch', 'Cruise ticket']
          }
        ]
      },
      'Kyoto': {
        'culture': [
          {
            title: 'Kyoto: Golden Pavilion & Bamboo Forest Tour',
            duration: '4 hours',
            price: 68,
            rating: 4.9,
            reviewCount: 2890,
            image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=250&fit=crop',
            description: 'Visit Kyoto\'s most iconic temples and gardens',
            includes: ['Expert guide', 'Temple entry', 'Transportation']
          },
          {
            title: 'Fushimi Inari Shrine Private Morning Tour',
            duration: '2.5 hours',
            price: 55,
            rating: 4.8,
            reviewCount: 1567,
            image: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=250&fit=crop',
            description: 'Explore 10,000 torii gates before the crowds',
            includes: ['Private guide', 'Early morning access', 'Photography tips']
          },
          {
            title: 'Geisha District Walking Tour',
            duration: '2 hours',
            price: 42,
            rating: 4.7,
            reviewCount: 1123,
            image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=250&fit=crop',
            description: 'Discover Gion\'s geisha culture and history',
            includes: ['Local guide', 'Tea ceremony', 'Gion district tour']
          }
        ],
        'food': [
          {
            title: 'Kyoto: Traditional Kaiseki Dinner Experience',
            duration: '2.5 hours',
            price: 120,
            rating: 4.9,
            reviewCount: 567,
            image: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400&h=250&fit=crop',
            description: 'Experience authentic multi-course Japanese cuisine',
            includes: ['7-course kaiseki meal', 'Sake pairing', 'Traditional setting']
          }
        ]
      },
      'Osaka': {
        'food': [
          {
            title: 'Osaka: Dotonbori Street Food Tour',
            duration: '3 hours',
            price: 72,
            rating: 4.9,
            reviewCount: 1890,
            image: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400&h=250&fit=crop',
            description: 'Taste Osaka\'s best street food with a local guide',
            includes: ['Local guide', '8+ food tastings', 'Drinks']
          },
          {
            title: 'Osaka: Kuromon Market Food Tour',
            duration: '2.5 hours',
            price: 58,
            rating: 4.8,
            reviewCount: 1234,
            image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=250&fit=crop',
            description: 'Explore Osaka\'s kitchen with tastings',
            includes: ['Market tour', 'Food samples', 'Local guide']
          }
        ],
        'culture': [
          {
            title: 'Osaka Castle & History Tour',
            duration: '3 hours',
            price: 48,
            rating: 4.6,
            reviewCount: 2134,
            image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&h=250&fit=crop',
            description: 'Discover the history of Osaka Castle',
            includes: ['Castle entry', 'Expert guide', 'Museum access']
          }
        ]
      }
    };

    // Get activities for this city
    const cityActivities = activityTemplates[cityName] || activityTemplates['Tokyo'];

    // Prefer activities matching detected categories
    let results = [];
    categories.forEach(cat => {
      if (cityActivities[cat]) {
        results = results.concat(cityActivities[cat]);
      }
    });

    // If no category matches, use culture activities as default
    if (results.length === 0 && cityActivities['culture']) {
      results = cityActivities['culture'];
    }

    return results;
  },

  /**
   * Build GetYourGuide deep link
   */
  buildGetYourGuideLink: function(activity, city) {
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    // GetYourGuide affiliate link format
    // Replace with actual partner tracking parameters
    return `https://www.getyourguide.com/${citySlug}-l57/?partner_id=${this.PARTNER_ID}&utm_medium=online_publisher&placement=other`;
  },

  /**
   * Build widget HTML
   */
  buildWidgetHTML: function(activities, dayIndex, day) {
    const cityName = typeof day.city === 'object' ? day.city.en : day.city;

    let html = `
      <div class="affiliate-widget activities-widget">
        <div class="widget-header">
          <h4><span class="widget-icon">🎯</span> Tours & Experiences</h4>
          <span class="widget-badge">Partner</span>
        </div>
        <div class="widget-content">
    `;

    activities.forEach((activity, index) => {
      const link = this.buildGetYourGuideLink(activity, cityName);

      html += `
        <div class="activity-card" data-activity-index="${index}">
          <div class="activity-image" style="background-image: url('${activity.image}')">
            <div class="activity-duration">${activity.duration}</div>
          </div>
          <div class="activity-info">
            <h5 class="activity-title">${activity.title}</h5>
            <div class="activity-rating">
              <span class="rating-stars">${'★'.repeat(Math.floor(activity.rating))}${'☆'.repeat(5 - Math.floor(activity.rating))}</span>
              <span class="rating-score">${activity.rating}</span>
              <span class="review-count">(${activity.reviewCount})</span>
            </div>
            <p class="activity-description">${activity.description}</p>
            <div class="activity-includes">
              ${activity.includes.slice(0, 2).map(inc => `<span class="include-item">✓ ${inc}</span>`).join('')}
            </div>
            <div class="activity-footer">
              <div class="activity-price">
                <span class="price-label">From</span>
                <span class="price-amount">$${activity.price}</span>
                <span class="price-unit">per person</span>
              </div>
              <a href="${link}"
                 target="_blank"
                 class="activity-book-btn"
                 onclick="AffiliateTracker.trackClick('getyourguide', {
                   dayNumber: ${dayIndex + 1},
                   city: '${cityName}',
                   itemName: '${activity.title.replace(/'/g, "\\'")}',
                   itemPrice: ${activity.price}
                 }); return true;">
                Book Now
              </a>
            </div>
          </div>
        </div>
      `;
    });

    html += `
        </div>
        <div class="widget-footer">
          <span class="affiliate-disclosure">Affiliate Partner • Prices subject to change</span>
        </div>
      </div>
    `;

    return html;
  }
};

// Expose globally
window.ActivitiesWidget = ActivitiesWidget;
