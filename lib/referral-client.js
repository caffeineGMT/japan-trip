// Client-side Referral System Library
// Handles referral tracking, code generation, and stats display

class ReferralClient {
  constructor(apiBaseUrl = '') {
    this.apiBaseUrl = apiBaseUrl;
    this.supabaseClient = null;
  }

  // Initialize with Supabase client
  init(supabaseClient) {
    this.supabaseClient = supabaseClient;
  }

  // Get auth token for API calls
  async getAuthToken() {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    const { data: { session } } = await this.supabaseClient.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    return session.access_token;
  }

  // Generate or retrieve referral code
  async generateReferralCode() {
    const token = await this.getAuthToken();

    const response = await fetch(`${this.apiBaseUrl}/api/referrals/generate-code`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to generate referral code');
    }

    return await response.json();
  }

  // Track referral click (when someone visits via ref link)
  async trackClick(referralCode, metadata = {}) {
    const response = await fetch(`${this.apiBaseUrl}/api/referrals/track-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        referralCode,
        metadata
      })
    });

    if (!response.ok) {
      console.error('Failed to track referral click');
      return null;
    }

    const data = await response.json();

    // Store referral code in localStorage for signup
    if (data.success) {
      localStorage.setItem('referral_code', referralCode);
      localStorage.setItem('referral_tracked_at', new Date().toISOString());
    }

    return data;
  }

  // Get stored referral code from localStorage
  getStoredReferralCode() {
    const code = localStorage.getItem('referral_code');
    const trackedAt = localStorage.getItem('referral_tracked_at');

    // Check if code is still valid (within 30 days)
    if (code && trackedAt) {
      const trackedDate = new Date(trackedAt);
      const daysSince = (Date.now() - trackedDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSince <= 30) {
        return code;
      }
    }

    return null;
  }

  // Apply discount for referred user
  async applyDiscount(userId, referralCode) {
    const response = await fetch(`${this.apiBaseUrl}/api/referrals/apply-discount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        referralCode: referralCode || this.getStoredReferralCode()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to apply referral discount');
    }

    const data = await response.json();

    // Clear stored referral code after applying
    if (data.success) {
      localStorage.removeItem('referral_code');
      localStorage.removeItem('referral_tracked_at');
    }

    return data;
  }

  // Get user's referral stats
  async getStats() {
    const token = await this.getAuthToken();

    const response = await fetch(`${this.apiBaseUrl}/api/referrals/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch referral stats');
    }

    return await response.json();
  }

  // Get leaderboard
  async getLeaderboard() {
    const response = await fetch(`${this.apiBaseUrl}/api/referrals/leaderboard`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }

    return await response.json();
  }

  // Generate shareable URLs for social media
  generateShareUrls(referralCode, baseUrl = 'https://trip.to') {
    const referralUrl = `${baseUrl}/ref/${referralCode}`;
    const message = encodeURIComponent('Plan your perfect Japan trip with AI! Get $10 off when you sign up.');
    const title = encodeURIComponent('Japan Trip Companion - AI-Powered Travel Planning');

    return {
      referralUrl,
      twitter: `https://twitter.com/intent/tweet?text=${message}&url=${encodeURIComponent(referralUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`,
      whatsapp: `https://wa.me/?text=${message}%20${encodeURIComponent(referralUrl)}`,
      email: `mailto:?subject=${title}&body=${message}%0A%0A${referralUrl}`,
      copyLink: referralUrl
    };
  }

  // Copy referral link to clipboard
  async copyReferralLink(referralUrl) {
    try {
      await navigator.clipboard.writeText(referralUrl);
      return true;
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (error) {
        console.error('Failed to copy:', error);
        textArea.remove();
        return false;
      }
    }
  }
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.ReferralClient = ReferralClient;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReferralClient;
}
