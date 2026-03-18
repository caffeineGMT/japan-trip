/**
 * i18n Editor Component
 * Provides language tab switching for multilingual content editing
 */

class I18nEditor {
  constructor() {
    this.currentLang = 'en';
    this.languages = {
      en: 'English',
      zh: '中文',
      ja: '日本語'
    };
  }

  /**
   * Create language tabs for an input field
   * @param {HTMLElement} container - Container element
   * @param {Object} i18nValue - Object with en/zh/ja keys
   * @param {Function} onChange - Callback when value changes
   * @returns {HTMLElement} Tab container
   */
  createTabs(container, i18nValue = {}, onChange) {
    const wrapper = document.createElement('div');
    wrapper.className = 'i18n-editor';

    // Language tabs
    const tabs = document.createElement('div');
    tabs.className = 'i18n-tabs';

    Object.entries(this.languages).forEach(([code, name]) => {
      const tab = document.createElement('button');
      tab.className = `i18n-tab ${code === this.currentLang ? 'active' : ''}`;
      tab.textContent = name;
      tab.dataset.lang = code;

      // Show indicator if translation exists
      if (i18nValue[code]) {
        tab.classList.add('has-content');
      }

      tab.addEventListener('click', () => {
        this.switchLanguage(code, wrapper);
      });

      tabs.appendChild(tab);
    });

    // Input field
    const input = container.tagName === 'TEXTAREA'
      ? document.createElement('textarea')
      : document.createElement('input');

    input.className = container.className + ' i18n-input';
    input.placeholder = container.placeholder;
    input.value = i18nValue[this.currentLang] || '';
    input.dataset.lang = this.currentLang;

    if (container.tagName === 'TEXTAREA') {
      input.rows = container.rows || 3;
    } else {
      input.type = container.type || 'text';
    }

    input.addEventListener('input', (e) => {
      const lang = e.target.dataset.lang;
      const value = e.target.value;

      // Update has-content indicator
      const tab = tabs.querySelector(`[data-lang="${lang}"]`);
      if (value) {
        tab.classList.add('has-content');
      } else {
        tab.classList.remove('has-content');
      }

      if (onChange) {
        onChange(lang, value);
      }
    });

    wrapper.appendChild(tabs);
    wrapper.appendChild(input);

    return wrapper;
  }

  /**
   * Switch active language
   */
  switchLanguage(lang, wrapper) {
    this.currentLang = lang;

    // Update tab states
    wrapper.querySelectorAll('.i18n-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.lang === lang);
    });

    // Update input
    const input = wrapper.querySelector('.i18n-input');
    input.dataset.lang = lang;

    // Focus input
    input.focus();
  }

  /**
   * Auto-translate using browser API or external service
   * @param {string} text - Text to translate
   * @param {string} fromLang - Source language
   * @param {string} toLang - Target language
   * @returns {Promise<string>} Translated text
   */
  async translate(text, fromLang, toLang) {
    // In production, integrate with Google Cloud Translation API
    // For now, return a placeholder
    console.log(`Translation requested: ${fromLang} → ${toLang}`, text);

    // Mock translation (in real app, call /api/translate)
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, from: fromLang, to: toLang })
      });

      if (!response.ok) {
        throw new Error('Translation service unavailable');
      }

      const data = await response.json();
      return data.translated;
    } catch (error) {
      console.error('Translation failed:', error);
      return `[${toLang.toUpperCase()}] ${text}`;
    }
  }

  /**
   * Create translation button
   * @param {Function} onTranslate - Callback when translation is requested
   * @returns {HTMLElement} Button element
   */
  createTranslateButton(onTranslate) {
    const button = document.createElement('button');
    button.className = 'btn-text translate-btn';
    button.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286H4.545zm1.634-.736L5.5 3.956h-.049l-.679 2.022H6.18z"/>
        <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm7.138 9.995c.193.301.402.583.63.846-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6.066 6.066 0 0 1-.415-.492 1.988 1.988 0 0 1-.94.31z"/>
      </svg>
      Auto-translate
    `;
    button.title = 'Translate to other languages';

    button.addEventListener('click', onTranslate);

    return button;
  }

  /**
   * Batch translate all empty fields
   * @param {string} sourceLang - Source language (e.g., 'en')
   * @param {Array<string>} targetLangs - Target languages (e.g., ['zh', 'ja'])
   * @param {Object} data - Data object with i18n fields
   * @returns {Promise<Object>} Updated data with translations
   */
  async batchTranslate(sourceLang, targetLangs, data) {
    const updated = JSON.parse(JSON.stringify(data));

    const translateField = async (obj, field) => {
      if (!obj[field] || typeof obj[field] !== 'object') return;

      const sourceText = obj[field][sourceLang];
      if (!sourceText) return;

      for (const targetLang of targetLangs) {
        if (!obj[field][targetLang]) {
          obj[field][targetLang] = await this.translate(sourceText, sourceLang, targetLang);
        }
      }
    };

    // Translate trip metadata
    if (updated.days) {
      for (const day of updated.days) {
        await translateField(day, 'city');
        await translateField(day, 'theme');

        if (day.stops) {
          for (const stop of day.stops) {
            await translateField(stop, 'name');
            await translateField(stop, 'desc');
          }
        }
      }
    }

    return updated;
  }
}

// Make available globally
window.I18nEditor = I18nEditor;
