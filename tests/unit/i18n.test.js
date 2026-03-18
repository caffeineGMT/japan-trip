// Unit tests for i18n.js (language switching)
const fs = require('fs');
const path = require('path');

describe('I18N Module', () => {
  let I18N;

  beforeEach(() => {
    // Clear localStorage before each test
    global.localStorage.clear();

    // Load the i18n module
    const i18nCode = fs.readFileSync(path.join(__dirname, '../../i18n.js'), 'utf8');
    eval(i18nCode);
    I18N = global.I18N;
  });

  describe('Initialization', () => {
    test('should default to English', () => {
      I18N.init();
      expect(I18N.currentLang).toBe('en');
    });

    test('should load saved language from localStorage', () => {
      localStorage.setItem('tripLang', 'ja');
      I18N.init();
      expect(I18N.currentLang).toBe('ja');
    });

    test('should ignore invalid saved language', () => {
      localStorage.setItem('tripLang', 'invalid');
      I18N.init();
      expect(I18N.currentLang).toBe('en');
    });
  });

  describe('Language Setting', () => {
    test('should set language and persist to localStorage', () => {
      I18N.setLang('zh');
      expect(I18N.currentLang).toBe('zh');
      expect(localStorage.getItem('tripLang')).toBe('zh');
    });

    test('should update HTML lang attribute', () => {
      I18N.setLang('ja');
      expect(document.documentElement.lang).toBe('ja-JP');

      I18N.setLang('zh');
      expect(document.documentElement.lang).toBe('zh-CN');

      I18N.setLang('en');
      expect(document.documentElement.lang).toBe('en');
    });

    test('should reject invalid language codes', () => {
      I18N.setLang('fr');
      expect(I18N.currentLang).toBe('en');
    });

    test('should accept all valid language codes', () => {
      const validLangs = ['en', 'zh', 'ja'];
      validLangs.forEach(lang => {
        I18N.setLang(lang);
        expect(I18N.currentLang).toBe(lang);
      });
    });
  });

  describe('Translation Function', () => {
    beforeEach(() => {
      I18N.currentLang = 'en';
    });

    test('should return empty string for null/undefined', () => {
      expect(I18N.t(null)).toBe('');
      expect(I18N.t(undefined)).toBe('');
    });

    test('should return plain strings unchanged', () => {
      expect(I18N.t('Hello')).toBe('Hello');
    });

    test('should translate object to current language', () => {
      const obj = {
        en: 'Hello',
        zh: '你好',
        ja: 'こんにちは'
      };

      I18N.currentLang = 'en';
      expect(I18N.t(obj)).toBe('Hello');

      I18N.currentLang = 'zh';
      expect(I18N.t(obj)).toBe('你好');

      I18N.currentLang = 'ja';
      expect(I18N.t(obj)).toBe('こんにちは');
    });

    test('should fallback to English if translation missing', () => {
      const obj = {
        en: 'Hello',
        zh: '你好'
        // ja missing
      };

      I18N.currentLang = 'ja';
      expect(I18N.t(obj)).toBe('Hello');
    });

    test('should return object if no translation available', () => {
      const obj = { fr: 'Bonjour' };
      I18N.currentLang = 'en';
      expect(I18N.t(obj)).toEqual(obj);
    });
  });
});
