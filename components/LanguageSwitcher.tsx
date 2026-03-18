'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n';

const languageNames = {
  en: 'English',
  ja: '日本語',
  zh: '中文'
} as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // Set cookie for locale persistence
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;

    // Extract the path without the locale prefix
    const segments = pathname.split('/');
    const pathWithoutLocale = segments.slice(2).join('/') || '';

    // Navigate to the new locale
    const newPath = newLocale === 'en'
      ? `/${pathWithoutLocale}`
      : `/${newLocale}/${pathWithoutLocale}`;

    router.push(newPath);
    router.refresh();
  };

  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
      background: '#f5f5f5',
      padding: '0.5rem',
      borderRadius: '8px'
    }}>
      <span style={{ fontSize: '0.875rem', color: '#666' }}>🌐</span>
      <select
        value={locale}
        onChange={(e) => handleLocaleChange(e.target.value)}
        style={{
          padding: '0.25rem 0.5rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          background: 'white',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {languageNames[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
