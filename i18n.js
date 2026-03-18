// Internationalization module for Japan Trip Companion
window.I18N = {
  currentLang: 'en',

  /**
   * Translate an object or return the value if it's a string
   * @param {Object|String} obj - Either {en, zh, ja} or a plain string
   * @returns {String} - The translated text
   */
  t(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[this.currentLang] || obj.en || obj;
  },

  /**
   * Set the current language and persist to localStorage
   * @param {String} lang - Language code: 'en', 'zh', or 'ja'
   */
  setLang(lang) {
    if (!['en', 'zh', 'ja'].includes(lang)) {
      console.warn(`Invalid language: ${lang}. Defaulting to 'en'.`);
      lang = 'en';
    }
    this.currentLang = lang;
    localStorage.setItem('tripLang', lang);

    // Update HTML lang attribute for proper CJK font rendering
    const langMap = {
      'en': 'en',
      'zh': 'zh-CN',
      'ja': 'ja-JP'
    };
    document.documentElement.lang = langMap[lang];
  },

  /**
   * Initialize the language from localStorage or default to English
   */
  init() {
    const saved = localStorage.getItem('tripLang');
    this.currentLang = saved && ['en', 'zh', 'ja'].includes(saved) ? saved : 'en';

    // Set HTML lang attribute on init for proper CJK font rendering
    const langMap = {
      'en': 'en',
      'zh': 'zh-CN',
      'ja': 'ja-JP'
    };
    document.documentElement.lang = langMap[this.currentLang];
  }
};
