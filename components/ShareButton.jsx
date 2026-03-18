/**
 * ShareButton Component
 * Viral sharing with platform-specific links and clipboard copy
 * Tracks share events via Google Analytics
 */

class ShareButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSharing: false,
      shortUrl: null,
      showToast: false,
      toastMessage: '',
      showShareMenu: false
    };
  }

  async createShareLink() {
    const { tripId, userId, authToken } = this.props;

    if (!authToken) {
      this.showToast('Please sign in to share your trip');
      return null;
    }

    this.setState({ isSharing: true });

    try {
      const response = await fetch('/api/share/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ tripId, userId })
      });

      if (!response.ok) {
        throw new Error('Failed to create share link');
      }

      const data = await response.json();
      this.setState({ shortUrl: data.shortUrl });
      return data.shortUrl;

    } catch (error) {
      console.error('Error creating share link:', error);
      this.showToast('Failed to create share link');
      return null;
    } finally {
      this.setState({ isSharing: false });
    }
  }

  async handleShare(platform) {
    const { tripId } = this.props;
    let { shortUrl } = this.state;

    // Create share link if not already created
    if (!shortUrl) {
      shortUrl = await this.createShareLink();
      if (!shortUrl) return;
    }

    // Track share event in Google Analytics
    if (window.gtag) {
      window.gtag('event', 'share_trip', {
        platform,
        trip_id: tripId,
        event_category: 'engagement',
        event_label: platform
      });
    }

    // Track in backend for analytics
    try {
      await fetch('/api/analytics/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortCode: shortUrl.split('/').pop(),
          platform,
          tripId
        })
      });
    } catch (error) {
      console.error('Error tracking share:', error);
    }

    const shareText = 'Check out my Japan trip itinerary!';
    const encodedUrl = encodeURIComponent(shortUrl);
    const encodedText = encodeURIComponent(shareText);

    let shareUrl;

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        window.open(shareUrl, '_blank', 'width=550,height=420');
        break;

      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        window.open(shareUrl, '_blank', 'width=550,height=420');
        break;

      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        window.open(shareUrl, '_blank');
        break;

      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        window.open(shareUrl, '_blank', 'width=550,height=420');
        break;

      case 'email':
        shareUrl = `mailto:?subject=${encodedText}&body=${encodedText}%0A%0A${encodedUrl}`;
        window.location.href = shareUrl;
        break;

      case 'copy':
        await this.copyToClipboard(shortUrl);
        return;

      default:
        console.error('Unknown platform:', platform);
        return;
    }

    this.setState({ showShareMenu: false });
    this.showToast(`Shared to ${platform}!`);
  }

  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        this.showToast('Link copied to clipboard!');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showToast('Link copied to clipboard!');
      }

      // Track copy event
      this.handleShare('copy');

    } catch (error) {
      console.error('Error copying to clipboard:', error);
      this.showToast('Failed to copy link');
    }
  }

  showToast(message) {
    this.setState({ showToast: true, toastMessage: message });
    setTimeout(() => {
      this.setState({ showToast: false });
    }, 3000);
  }

  toggleShareMenu() {
    this.setState({ showShareMenu: !this.state.showShareMenu });
  }

  render() {
    const { isSharing, showToast, toastMessage, showShareMenu } = this.state;
    const { className = '' } = this.props;

    return (
      <div className={`share-button-container ${className}`}>
        <button
          className="share-button"
          onClick={() => this.toggleShareMenu()}
          disabled={isSharing}
        >
          {isSharing ? (
            <>
              <span className="spinner"></span>
              Creating link...
            </>
          ) : (
            <>
              <svg className="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.59003 13.51L15.42 17.49" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.41 6.51001L8.59003 10.49" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Share Trip
            </>
          )}
        </button>

        {showShareMenu && (
          <div className="share-menu">
            <div className="share-menu-header">Share your trip</div>
            <button className="share-option" onClick={() => this.handleShare('copy')}>
              <span className="share-emoji">📋</span>
              Copy Link
            </button>
            <button className="share-option" onClick={() => this.handleShare('twitter')}>
              <span className="share-emoji">🐦</span>
              Twitter
            </button>
            <button className="share-option" onClick={() => this.handleShare('facebook')}>
              <span className="share-emoji">👥</span>
              Facebook
            </button>
            <button className="share-option" onClick={() => this.handleShare('whatsapp')}>
              <span className="share-emoji">💬</span>
              WhatsApp
            </button>
            <button className="share-option" onClick={() => this.handleShare('linkedin')}>
              <span className="share-emoji">💼</span>
              LinkedIn
            </button>
            <button className="share-option" onClick={() => this.handleShare('email')}>
              <span className="share-emoji">📧</span>
              Email
            </button>
          </div>
        )}

        {showToast && (
          <div className="share-toast">
            {toastMessage}
          </div>
        )}

        <style jsx>{`
          .share-button-container {
            position: relative;
          }

          .share-button {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .share-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          }

          .share-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .share-icon {
            width: 20px;
            height: 20px;
          }

          .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .share-menu {
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 8px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            min-width: 220px;
            z-index: 1000;
            overflow: hidden;
          }

          .share-menu-header {
            padding: 16px;
            font-weight: 600;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
            color: #374151;
          }

          .share-option {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            padding: 12px 16px;
            background: none;
            border: none;
            text-align: left;
            cursor: pointer;
            transition: background 0.2s ease;
            font-size: 15px;
            color: #374151;
          }

          .share-option:hover {
            background: #f3f4f6;
          }

          .share-emoji {
            font-size: 20px;
          }

          .share-toast {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: #1f2937;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideUp 0.3s ease;
            font-size: 14px;
            font-weight: 500;
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }
}

// Make component available globally
window.ShareButton = ShareButton;
