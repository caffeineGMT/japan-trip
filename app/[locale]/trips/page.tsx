import { useTranslations } from 'next-intl';

export default function TripsPage() {
  const t = useTranslations('trips');

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{t('title')}</h1>
      <p>{t('noTrips')}</p>
      <button style={{
        padding: '0.75rem 1.5rem',
        background: '#FF6B9D',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        marginTop: '1rem'
      }}>
        {t('createNew')}
      </button>

      <div style={{ marginTop: '2rem' }}>
        <h2>{t('tripCount', { count: 0 })}</h2>
        <h2>{t('tripCount', { count: 1 })}</h2>
        <h2>{t('tripCount', { count: 5 })}</h2>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <p>{t('duration', { days: 1 })}</p>
        <p>{t('duration', { days: 7 })}</p>
      </div>
    </div>
  );
}
