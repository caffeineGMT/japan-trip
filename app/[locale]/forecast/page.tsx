'use client';

import { useTranslations } from 'next-intl';

export default function ForecastPage() {
  const t = useTranslations('forecast');

  const regions = ['hokkaido', 'tohoku', 'kanto', 'chubu', 'kansai', 'chugoku', 'shikoku', 'kyushu'];

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{t('title')}</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        {regions.map((region) => (
          <div key={region} style={{
            padding: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: '#f9f9f9'
          }}>
            <h3>{t(`regions.${region}`)}</h3>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              <p><strong>{t('bloomStatus')}:</strong> {t('blooming')}</p>
              <p>{t('peakDate', { date: '2026-04-05' })}</p>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#666' }}>
        {t('lastUpdated', { date: new Date().toLocaleDateString() })}
      </p>
    </div>
  );
}
