const formData = require('form-data');
const Mailgun = require('mailgun.js');

class MailgunClient {
  constructor() {
    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
      console.warn('⚠️  Mailgun not configured. Email sending will fail.');
      this.configured = false;
      return;
    }

    const mailgun = new Mailgun(formData);
    this.client = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY
    });
    this.domain = process.env.MAILGUN_DOMAIN;
    this.configured = true;
    this.fromEmail = `Japan Trip Companion <hello@${this.domain}>`;
  }

  /**
   * Send a transactional email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML content
   * @param {string} options.text - Plain text content
   * @param {Object} options.trackingData - Custom tracking data
   * @returns {Promise<Object>} Mailgun response
   */
  async sendEmail({ to, subject, html, text, trackingData = {} }) {
    if (!this.configured) {
      throw new Error('Mailgun is not configured');
    }

    try {
      const messageData = {
        from: this.fromEmail,
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
        'o:tracking': 'yes',
        'o:tracking-clicks': 'yes',
        'o:tracking-opens': 'yes',
        'v:tracking_data': JSON.stringify(trackingData)
      };

      const response = await this.client.messages.create(this.domain, messageData);

      console.log(`📧 Email sent to ${to}: ${subject}`);
      console.log(`   Message ID: ${response.id}`);

      return {
        success: true,
        messageId: response.id,
        response
      };
    } catch (error) {
      console.error('❌ Mailgun send error:', error);
      throw error;
    }
  }

  /**
   * Send email campaign to subscriber
   * @param {Object} subscriber - Subscriber data
   * @param {Object} campaign - Campaign data
   * @param {string} templateHtml - Rendered email template
   * @returns {Promise<Object>}
   */
  async sendCampaignEmail(subscriber, campaign, templateHtml) {
    const trackingData = {
      subscriber_id: subscriber.id,
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      sequence_number: campaign.email_sequence_number
    };

    // Add unsubscribe footer
    const unsubscribeUrl = `${process.env.APP_URL}/api/email/unsubscribe?token=${subscriber.id}`;
    const finalHtml = templateHtml.replace(
      '</body>',
      `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
        <p>You're receiving this because you signed up for Japan Trip Companion.</p>
        <p><a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a></p>
      </div>
      </body>
      `
    );

    return this.sendEmail({
      to: subscriber.email,
      subject: campaign.subject,
      html: finalHtml,
      trackingData
    });
  }

  /**
   * Parse webhook event from Mailgun
   * @param {Object} eventData - Webhook payload
   * @returns {Object} Parsed event
   */
  parseWebhookEvent(eventData) {
    const { event, recipient, 'user-variables': userVars, timestamp, message } = eventData;

    let trackingData = {};
    if (userVars && userVars.tracking_data) {
      try {
        trackingData = JSON.parse(userVars.tracking_data);
      } catch (e) {
        console.warn('Failed to parse tracking data:', e);
      }
    }

    return {
      eventType: event, // delivered, opened, clicked, unsubscribed, complained, failed
      email: recipient,
      messageId: message?.headers?.['message-id'],
      timestamp: new Date(timestamp * 1000),
      trackingData,
      rawData: eventData
    };
  }

  /**
   * Verify Mailgun webhook signature
   * @param {Object} payload - Webhook payload
   * @returns {boolean}
   */
  verifyWebhookSignature(payload) {
    if (!this.configured) return false;

    const crypto = require('crypto');
    const { timestamp, token, signature } = payload;

    const encodedToken = crypto
      .createHmac('sha256', process.env.MAILGUN_API_KEY)
      .update(timestamp.concat(token))
      .digest('hex');

    return encodedToken === signature;
  }

  /**
   * Strip HTML tags for plain text fallback
   * @param {string} html
   * @returns {string}
   */
  stripHtml(html) {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Get email statistics
   * @param {string} domain
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async getStats(options = {}) {
    if (!this.configured) {
      throw new Error('Mailgun is not configured');
    }

    try {
      const stats = await this.client.stats.getDomain(this.domain, options);
      return stats;
    } catch (error) {
      console.error('Failed to get Mailgun stats:', error);
      throw error;
    }
  }
}

module.exports = new MailgunClient();
