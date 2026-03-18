import { useTranslations } from 'next-intl';

export default function PlacesPage() {
  const t = useTranslations('places');

  const categories = ['temple', 'shrine', 'restaurant', 'hotel', 'viewpoint', 'shopping', 'museum', 'park'];

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{t('title')}</h1>
      <p>{t('noPlaces')}</p>

      <div style={{ marginTop: '2rem' }}>
        <h2>{t('category')}</h2>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginTop: '1rem'
        }}>
          {categories.map((category) => (
            <span key={category} style={{
              padding: '0.5rem 1rem',
              background: '#e3f2fd',
              borderRadius: '20px',
              fontSize: '0.875rem'
            }}>
              {t(`categories.${category}`)}
            </span>
          ))}
        </div>
      </div>

      <button style={{
        padding: '0.75rem 1.5rem',
        background: '#FF6B9D',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        marginTop: '2rem'
      }}>
        {t('addPlace')}
      </button>
    </div>
  );
}
