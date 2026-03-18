/**
 * Share functionality for Japan Trip Companion
 * Handles trip sharing, social media integration, and referral tracking
 */

class ShareManager {
  constructor() {
    this.modal = null;
    this.shareBtn = null;
    this.shareLink = null;
    this.shortCode = null;
    this.tripId = 'japan-trip-2026'; // Default trip ID
    this.userId = null;

    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Get elements
    this.modal = document.getElementById('share-modal');
    this.shareBtn = document.getElementById('share-btn');

    if (!this.modal || !this.shareBtn) {
      console.warn('Share elements not found');
      return;
    }

    // Get user ID from localStorage or session
    this.userId = localStorage.getItem('user_id') || this.generateGuestId();

    // Set up event listeners
    this.setupEventListeners();

    // Load referral stats
    this.loadReferralStats();
  }

  setupEventListeners() {
    // Open modal
    this.shareBtn.addEventListener('click', () => this.openModal());

    // Close modal
    const closeBtn = this.modal.querySelector('.close-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    // Close on outside click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Copy link button
    const copyBtn = document.getElementById('copy-link-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyLink());
    }

    // Social share buttons
    const shareButtons = this.modal.querySelectorAll('.share-btn');
    shareButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const platform = e.currentTarget.dataset.platform;
        this.shareToSocial(platform);
      });
    });

    // Retry button
    const retryBtn = document.getElementById('retry-share-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.generateShareLink());
    }
  }

  async openModal() {
    this.modal.style.display = 'block';

    // Generate share link if not already generated
    if (!this.shareLink) {
      await this.generateShareLink();
    }

    // Track modal open
    this.trackEvent('share_modal_opened');
  }

  closeModal() {
    this.modal.style.display = 'none';
  }

  async generateShareLink() {
    const loadingEl = document.getElementById('share-loading');
    const contentEl = document.getElementById('share-content');
    const errorEl = document.getElementById('share-error');

    // Show loading
    loadingEl.style.display = 'block';
    contentEl.style.display = 'none';
    errorEl.style.display = 'none';

    try {
      // Get auth token (if user is logged in)
      const token = localStorage.getItem('auth_token');

      // Call API to generate share link
      const response = await fetch('/api/share/generate-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          tripId: this.tripId,
          userId: this.userId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate share link: ${response.status}`);
      }

      const data = await response.json();
      this.shareLink = data.shortUrl;
      this.shortCode = data.shortCode;

      // Update UI
      const inputEl = document.getElementById('share-link-input');
      if (inputEl) {
        inputEl.value = this.shareLink;
      }

      // Show content
      loadingEl.style.display = 'none';
      contentEl.style.display = 'block';

      // Track successful generation
      this.trackEvent('share_link_generated', {
        short_code: this.shortCode,
        existing: data.existing || false
      });

    } catch (error) {
      console.error('Error generating share link:', error);

      // Show error
      loadingEl.style.display = 'none';
      errorEl.style.display = 'block';

      // Track error
      this.trackEvent('share_link_error', { error: error.message });
    }
  }

  async copyLink() {
    const inputEl = document.getElementById('share-link-input');
    if (!inputEl || !this.shareLink) return;

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(this.shareLink);
      } else {
        // Fallback for older browsers
        inputEl.select();
        inputEl.setSelectionRange(0, 99999); // For mobile
        document.execCommand('copy');
      }

      // Visual feedback
      const copyBtn = document.getElementById('copy-link-btn');
      if (copyBtn) {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#10b981';
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.style.background = '';
        }, 2000);
      }

      // Track copy event
      this.trackEvent('share_link_copied', {
        platform: 'copy_link',
        short_code: this.shortCode
      });

    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Failed to copy link. Please copy manually.');
    }
  }

  shareToSocial(platform) {
    if (!this.shareLink) return;

    const shareText = '🌸 Check out my Japan Cherry Blossom trip itinerary! Plan your perfect adventure with this amazing travel companion.';
    const hashtags = 'JapanTrip,CherryBlossom,TravelJapan';

    let shareUrl;

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(this.shareLink)}&hashtags=${hashtags}`;
        break;

      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.shareLink)}&quote=${encodeURIComponent(shareText)}`;
        break;

      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + this.shareLink)}`;
        break;

      case 'email':
        const subject = '🌸 Japan Cherry Blossom Trip Itinerary';
        const body = `${shareText}\n\nView the full itinerary here: ${this.shareLink}`;
        shareUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        break;

      default:
        console.warn('Unknown share platform:', platform);
        return;
    }

    // Open share URL
    window.open(shareUrl, '_blank', 'width=600,height=400');

    // Track share event
    this.trackEvent('trip_shared', {
      platform,
      short_code: this.shortCode
    });

    // Call backend to track share event
    this.trackShareEvent(platform);
  }

  async trackShareEvent(platform) {
    try {
      const response = await fetch('/api/share/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shortCode: this.shortCode,
          platform,
          userId: this.userId,
          metadata: {
            userAgent: navigator.userAgent,
            referrer: document.referrer
          }
        })
      });

      if (!response.ok) {
        console.warn('Failed to track share event:', response.status);
      }
    } catch (error) {
      console.error('Error tracking share event:', error);
      // Don't throw - analytics failures shouldn't break user flow
    }
  }

  async loadReferralStats() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        // Guest user - show default stats
        return;
      }

      const response = await fetch('/api/referral/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.warn('Failed to load referral stats:', response.status);
        return;
      }

      const stats = await response.json();

      // Update UI
      const referralCountEl = document.getElementById('referral-count');
      const rewardsEarnedEl = document.getElementById('rewards-earned');

      if (referralCountEl) {
        referralCountEl.textContent = stats.completedReferrals || 0;
      }

      if (rewardsEarnedEl) {
        rewardsEarnedEl.textContent = stats.premiumMonthsEarned || 0;
      }

    } catch (error) {
      console.error('Error loading referral stats:', error);
    }
  }

  trackEvent(eventName, properties = {}) {
    // Use PostHog if available
    if (window.Analytics && window.Analytics.track) {
      window.Analytics.track(eventName, {
        ...properties,
        trip_id: this.tripId,
        user_id: this.userId
      });
    }

    // Also log to console in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[Share Event]', eventName, properties);
    }
  }

  generateGuestId() {
    // Generate a guest ID for non-logged-in users
    let guestId = localStorage.getItem('guest_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('guest_id', guestId);
    }
    return guestId;
  }
}

// Initialize share manager when script loads
window.shareManager = new ShareManager();
