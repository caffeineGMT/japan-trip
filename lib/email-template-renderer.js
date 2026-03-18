const fs = require('fs');
const path = require('path');

class EmailTemplateRenderer {
  constructor() {
    this.templateCache = new Map();
    this.templatesDir = path.join(__dirname, '..', 'marketing', 'email-nurture', 'templates');
  }

  /**
   * Load and cache email template
   * @param {string} templateId - Template ID (e.g., 'email-1-welcome')
   * @returns {string} HTML template
   */
  loadTemplate(templateId) {
    if (this.templateCache.has(templateId)) {
      return this.templateCache.get(templateId);
    }

    const templatePath = path.join(this.templatesDir, `${templateId}.html`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const template = fs.readFileSync(templatePath, 'utf-8');
    this.templateCache.set(templateId, template);
    return template;
  }

  /**
   * Render email template with variables
   * @param {string} templateId - Template ID
   * @param {Object} variables - Variables to replace
   * @returns {string} Rendered HTML
   */
  render(templateId, variables = {}) {
    const template = this.loadTemplate(templateId);

    // Default variables
    const defaultVars = {
      appUrl: process.env.APP_URL || 'http://localhost:3000',
      firstName: 'there',
      email: ''
    };

    const allVars = { ...defaultVars, ...variables };

    // Replace {{variable}} placeholders
    let rendered = template;
    for (const [key, value] of Object.entries(allVars)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, value || '');
    }

    return rendered;
  }

  /**
   * Clear template cache
   */
  clearCache() {
    this.templateCache.clear();
  }
}

module.exports = new EmailTemplateRenderer();
