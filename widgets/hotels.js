/**
 * Booking.com Hotels Widget
 * Fetches and displays nearby hotels with affiliate links
 */

const HotelsWidget = {
  // Booking.com Affiliate Partner ID
  // To get your ID: Sign up at https://affiliate.booking.com
  PARTNER_AID: process.env.BOOKING_AFFILIATE_ID || '2891748', // Example ID - replace with your own

  // Configuration
  config: {
    radius: 1000,        // Search radius in meters (1km)
    limit: 3,            // Number of hotels to show
    minRating: 7.5       // Minimum review score
  },

  /**
   * Render hotel widget for a specific day
   * @param {Object} day - Day data from TRIP_DATA
   * @param {number} dayIndex - Index of the day
   * @returns {string} HTML for hotel widget
   */
  render: async function(day, dayIndex) {
    if (!day || !day.stops || day.stops.length === 0) {
      return '';
    }

    // Calculate center point from all stops
    const centerPoint = this.calculateCenter(day.stops);

    // Get check-in date (parse from day.date)
    const checkInDate = this.parseCheckInDate(day.date);
    const checkOutDate = this.getNextDay(checkInDate);

    try {
      // Fetch hotels (using mock data for now, replace with real API)
      const hotels = await this.fetchHotels(centerPoint, checkInDate, checkOutDate, day.city);

      if (!hotels || hotels.length === 0) {
        return ''; // No hotels found
      }

      // Build widget HTML
      return this.buildWidgetHTML(hotels, dayIndex, day);
    } catch (error) {
      console.error('[Hotels Widget] Error:', error);
      return '';
    }
  },

  /**
   * Calculate center point from stops
   */
  calculateCenter: function(stops) {
    let totalLat = 0;
    let totalLng = 0;
    let count = 0;

    stops.forEach(stop => {
      if (stop.lat && stop.lng) {
        totalLat += stop.lat;
        totalLng += stop.lng;
        count++;
      }
    });

    return {
      lat: totalLat / count,
      lng: totalLng / count
    };
  },

  /**
   * Parse check-in date from day.date string
   */
  parseCheckInDate: function(dateString) {
    // Format: "Mar 31", "Apr 1", "Mar 29-30"
    const datePart = dateString.split('-')[0].trim();
    const parts = datePart.split(' ');

    const monthMap = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };

    const month = monthMap[parts[0]];
    const day = parseInt(parts[1]);
    const year = 2026; // Trip year

    return new Date(year, month, day);
  },

  /**
   * Get next day for checkout
   */
  getNextDay: function(date) {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  },

  /**
   * Format date to YYYY-MM-DD for Booking.com API
   */
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Fetch hotels from Booking.com API
   * Note: Booking.com doesn't have a public API, so we use deep links
   * For production, consider using alternative APIs or web scraping
   */
  fetchHotels: async function(centerPoint, checkIn, checkOut, city) {
    // Mock data for demonstration
    // In production, you would:
    // 1. Use Booking.com Affiliate API (if available)
    // 2. Use alternative hotel APIs (Hotels.com, Expedia, Agoda)
    // 3. Build a backend scraper
    // 4. Use third-party hotel aggregator APIs

    const cityName = typeof city === 'object' ? city.en : city;

    // Generate realistic mock hotels based on city
    const mockHotels = this.generateMockHotels(cityName, centerPoint);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return mockHotels.slice(0, this.config.limit);
  },

  /**
   * Generate mock hotel data for demonstration
   */
  generateMockHotels: function(cityName, centerPoint) {
    const hotelTemplates = {
      'Tokyo': [
        {
          name: 'Grand Hyatt Tokyo',
          rating: 9.2,
          reviewCount: 3420,
          price: 350,
          currency: 'USD',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop',
          amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant']
        },
        {
          name: 'Hotel Gracery Shinjuku',
          rating: 8.8,
          reviewCount: 2156,
          price: 180,
          currency: 'USD',
          image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=250&fit=crop',
          amenities: ['Free WiFi', 'Restaurant', 'Bar']
        },
        {
          name: 'Keio Plaza Hotel',
          rating: 8.5,
          reviewCount: 1890,
          price: 220,
          currency: 'USD',
          image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=250&fit=crop',
          amenities: ['Free WiFi', 'Pool', 'Multiple Restaurants']
        }
      ],
      'Kyoto': [
        {
          name: 'The Ritz-Carlton Kyoto',
          rating: 9.5,
          reviewCount: 1234,
          price: 550,
          currency: 'USD',
          image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=250&fit=crop',
          amenities: ['Luxury Spa', 'River Views', 'Fine Dining']
        },
        {
          name: 'Hotel Granvia Kyoto',
          rating: 8.9,
          reviewCount: 2789,
          price: 240,
          currency: 'USD',
          image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=250&fit=crop',
          amenities: ['Station Access', 'Restaurant', 'Free WiFi']
        },
        {
          name: 'Kyoto Century Hotel',
          rating: 8.6,
          reviewCount: 1567,
          price: 190,
          currency: 'USD',
          image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=250&fit=crop',
          amenities: ['Central Location', 'Free WiFi', 'Restaurant']
        }
      ],
      'Osaka': [
        {
          name: 'St. Regis Osaka',
          rating: 9.3,
          reviewCount: 987,
          price: 420,
          currency: 'USD',
          image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=250&fit=crop',
          amenities: ['Luxury Spa', 'Fine Dining', 'Butler Service']
        },
        {
          name: 'Hotel Monterey Grasmere Osaka',
          rating: 8.7,
          reviewCount: 1456,
          price: 160,
          currency: 'USD',
          image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=250&fit=crop',
          amenities: ['Central Location', 'Restaurant', 'Free WiFi']
        },
        {
          name: 'Swissotel Nankai Osaka',
          rating: 9.0,
          reviewCount: 2234,
          price: 280,
          currency: 'USD',
          image: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=400&h=250&fit=crop',
          amenities: ['Station Access', 'Skyline Views', 'Pool']
        }
      ]
    };

    return hotelTemplates[cityName] || hotelTemplates['Tokyo'];
  },

  /**
   * Build Booking.com deep link
   */
  buildBookingLink: function(hotel, centerPoint, checkIn, checkOut) {
    const checkinDate = this.formatDate(checkIn);
    const checkoutDate = this.formatDate(checkOut);

    // Booking.com deep link format
    return `https://www.booking.com/searchresults.html?aid=${this.PARTNER_AID}&latitude=${centerPoint.lat}&longitude=${centerPoint.lng}&checkin=${checkinDate}&checkout=${checkoutDate}&selected_currency=USD`;
  },

  /**
   * Build widget HTML
   */
  buildWidgetHTML: function(hotels, dayIndex, day) {
    const cityName = typeof day.city === 'object' ? day.city.en : day.city;

    let html = `
      <div class="affiliate-widget hotels-widget">
        <div class="widget-header">
          <h4><span class="widget-icon">🏨</span> Hotels in ${cityName}</h4>
          <span class="widget-badge">Partner</span>
        </div>
        <div class="widget-content">
    `;

    hotels.forEach((hotel, index) => {
      const centerPoint = this.calculateCenter(day.stops);
      const checkIn = this.parseCheckInDate(day.date);
      const checkOut = this.getNextDay(checkIn);
      const bookingLink = this.buildBookingLink(hotel, centerPoint, checkIn, checkOut);

      html += `
        <div class="hotel-card" data-hotel-index="${index}">
          <div class="hotel-image" style="background-image: url('${hotel.image}')"></div>
          <div class="hotel-info">
            <h5 class="hotel-name">${hotel.name}</h5>
            <div class="hotel-rating">
              <span class="rating-score">${hotel.rating}</span>
              <span class="rating-text">Excellent</span>
              <span class="review-count">(${hotel.reviewCount} reviews)</span>
            </div>
            <div class="hotel-amenities">
              ${hotel.amenities.slice(0, 2).map(a => `<span class="amenity">${a}</span>`).join('')}
            </div>
            <div class="hotel-footer">
              <div class="hotel-price">
                <span class="price-label">From</span>
                <span class="price-amount">${hotel.currency} $${hotel.price}</span>
                <span class="price-unit">/night</span>
              </div>
              <a href="${bookingLink}"
                 target="_blank"
                 class="hotel-book-btn"
                 onclick="AffiliateTracker.trackClick('booking.com', {
                   dayNumber: ${dayIndex + 1},
                   city: '${cityName}',
                   itemName: '${hotel.name}',
                   itemPrice: ${hotel.price}
                 }); return true;">
                View Deals
              </a>
            </div>
          </div>
        </div>
      `;
    });

    html += `
        </div>
        <div class="widget-footer">
          <span class="affiliate-disclosure">Affiliate Partner • Prices may vary</span>
        </div>
      </div>
    `;

    return html;
  }
};

// Expose globally
window.HotelsWidget = HotelsWidget;
