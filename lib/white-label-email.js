const fs = require('fs');
const path = require('path');
const mailgunClient = require('./mailgun-client');

/**
 * Send welcome email to new white-label agency
 * @param {Object} tenant - Tenant data from provisioning
 * @param {string} tenant.agencyName - Agency name
 * @param {string} tenant.subdomain - Subdomain
 * @param {string} tenant.tier - Plan tier (starter/growth/enterprise)
 * @param {string} tenant.contactEmail - Contact email
 * @param {string} tenant.url - Platform URL
 * @param {string} tenant.dashboardUrl - Dashboard URL
 * @param {Date} tenant.trialEndsAt - Trial end date
 * @returns {Promise<Object>}
 */
async function sendWelcomeEmail(tenant) {
  try {
    // Load email template
    const templatePath = path.join(__dirname, '../templates/email/white-label-welcome.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    // Tier pricing map
    const tierPricing = {
      starter: { price: '$499', maxUsers: '100' },
      growth: { price: '$999', maxUsers: '500' },
      enterprise: { price: '$2,499', maxUsers: 'Unlimited' }
    };

    const tierInfo = tierPricing[tenant.tier] || tierPricing.starter;

    // Format trial end date
    const trialEndDate = new Date(tenant.trialEndsAt);
    const formattedTrialEnd = trialEndDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    // Replace template variables
    const replacements = {
      '{{agencyName}}': tenant.agencyName,
      '{{platformUrl}}': tenant.url,
      '{{dashboardUrl}}': `${process.env.APP_URL}${tenant.dashboardUrl}`,
      '{{tier}}': tenant.tier.charAt(0).toUpperCase() + tenant.tier.slice(1),
      '{{trialEndDate}}': formattedTrialEnd,
      '{{maxUsers}}': tierInfo.maxUsers,
      '{{monthlyPrice}}': tierInfo.price
    };

    Object.keys(replacements).forEach(key => {
      htmlContent = htmlContent.replace(new RegExp(key, 'g'), replacements[key]);
    });

    // Send email via Mailgun
    const result = await mailgunClient.sendEmail({
      to: tenant.contactEmail,
      subject: 'Your white-label trip planner is ready! 🎉',
      html: htmlContent,
      trackingData: {
        type: 'white_label_welcome',
        tenant_id: tenant.id,
        subdomain: tenant.subdomain,
        tier: tenant.tier
      }
    });

    console.log(`✅ Welcome email sent to ${tenant.contactEmail} for ${tenant.subdomain}`);

    return {
      success: true,
      messageId: result.messageId,
      recipient: tenant.contactEmail
    };

  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);

    // Don't fail provisioning if email fails
    // Just log the error and continue
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send trial ending reminder (7 days before trial ends)
 * @param {Object} tenant - Tenant data
 * @returns {Promise<Object>}
 */
async function sendTrialEndingReminder(tenant) {
  try {
    const subject = `Your trial ends in 7 days - ${tenant.agencyName}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a202c; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px; margin-bottom: 30px; }
          .content { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #718096; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">⏰ Trial Ending Soon</h1>
          </div>
          <div class="content">
            <p>Hi ${tenant.agencyName} team,</p>
            <p>Just a friendly reminder that your 14-day trial ends in <strong>7 days</strong>.</p>
            <p>To ensure uninterrupted service for your customers, your payment method on file will be charged automatically when your trial ends.</p>
            <p><strong>What happens next:</strong></p>
            <ul>
              <li>Your site at <a href="${tenant.url}">${tenant.url}</a> stays live</li>
              <li>Billing begins at ${tierPricing[tenant.tier]?.price || '$499'}/month</li>
              <li>You can upgrade or downgrade your plan anytime</li>
            </ul>
            <p>Want to make changes or have questions?</p>
            <a href="${process.env.APP_URL}${tenant.dashboardUrl}" class="cta-button">Manage Subscription →</a>
            <p>Thanks for choosing Trip Companion!</p>
            <p><strong>The Trip Companion Team</strong></p>
          </div>
          <div class="footer">
            <p>Questions? Email us at support@tripcompanion.app</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await mailgunClient.sendEmail({
      to: tenant.contactEmail,
      subject,
      html: htmlContent,
      trackingData: {
        type: 'trial_ending_reminder',
        tenant_id: tenant.id,
        days_remaining: 7
      }
    });

    console.log(`✅ Trial reminder sent to ${tenant.contactEmail}`);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Failed to send trial reminder:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send subscription confirmation email
 * @param {Object} tenant - Tenant data
 * @param {Object} subscription - Stripe subscription object
 * @returns {Promise<Object>}
 */
async function sendSubscriptionConfirmation(tenant, subscription) {
  try {
    const subject = `Subscription Confirmed - ${tenant.agencyName}`;

    const tierInfo = tierPricing[tenant.tier] || tierPricing.starter;
    const nextBillingDate = new Date(subscription.current_period_end * 1000).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a202c; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 12px; margin-bottom: 30px; }
          .content { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .info-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .footer { text-align: center; margin-top: 30px; color: #718096; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✅ Subscription Active</h1>
          </div>
          <div class="content">
            <p>Hi ${tenant.agencyName} team,</p>
            <p>Your subscription is now active! Thank you for choosing Trip Companion as your white-label travel platform.</p>
            <div class="info-box">
              <p style="margin: 0 0 12px 0;"><strong>Subscription Details:</strong></p>
              <p style="margin: 4px 0;">Plan: <strong>${tenant.tier.charAt(0).toUpperCase() + tenant.tier.slice(1)}</strong></p>
              <p style="margin: 4px 0;">Monthly Rate: <strong>${tierInfo.price}</strong></p>
              <p style="margin: 4px 0;">Next Billing Date: <strong>${nextBillingDate}</strong></p>
              <p style="margin: 4px 0;">Status: <strong style="color: #10b981;">Active ✓</strong></p>
            </div>
            <p>Your platform is live at <a href="${tenant.url}" style="color: #667eea; font-weight: 600;">${tenant.url}</a></p>
            <p>Need to make changes to your subscription?</p>
            <p><a href="${process.env.APP_URL}${tenant.dashboardUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 10px 0;">Manage Subscription →</a></p>
            <p>Thank you for your business!</p>
            <p><strong>The Trip Companion Team</strong></p>
          </div>
          <div class="footer">
            <p>Questions? Email us at support@tripcompanion.app</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await mailgunClient.sendEmail({
      to: tenant.contactEmail,
      subject,
      html: htmlContent,
      trackingData: {
        type: 'subscription_confirmation',
        tenant_id: tenant.id,
        subscription_id: subscription.id
      }
    });

    console.log(`✅ Subscription confirmation sent to ${tenant.contactEmail}`);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Failed to send subscription confirmation:', error);
    return { success: false, error: error.message };
  }
}

// Tier pricing for email templates
const tierPricing = {
  starter: { price: '$499', maxUsers: '100' },
  growth: { price: '$999', maxUsers: '500' },
  enterprise: { price: '$2,499', maxUsers: 'Unlimited' }
};

module.exports = {
  sendWelcomeEmail,
  sendTrialEndingReminder,
  sendSubscriptionConfirmation
};
