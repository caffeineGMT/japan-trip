import { useTranslations } from 'next-intl';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Home() {
  const t = useTranslations('common');

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{
        marginBottom: '3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #FF6B9D',
        paddingBottom: '1rem'
      }}>
        <h1 style={{ color: '#FF6B9D', fontSize: '2rem' }}>{t('appName')}</h1>
        <LanguageSwitcher />
      </header>

      <nav style={{ marginBottom: '3rem' }}>
        <ul style={{
          listStyle: 'none',
          display: 'flex',
          gap: '2rem',
          padding: 0,
          flexWrap: 'wrap'
        }}>
          <li>
            <Link href="/trips" style={{
              textDecoration: 'none',
              color: '#333',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              background: '#f5f5f5',
              display: 'block',
              transition: 'background 0.2s'
            }}>
              {t('nav.myTrips')}
            </Link>
          </li>
          <li>
            <Link href="/forecast" style={{
              textDecoration: 'none',
              color: '#333',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              background: '#f5f5f5',
              display: 'block'
            }}>
              {t('nav.cherryBlossomForecast')}
            </Link>
          </li>
          <li>
            <Link href="/places" style={{
              textDecoration: 'none',
              color: '#333',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              background: '#f5f5f5',
              display: 'block'
            }}>
              {t('nav.savedPlaces')}
            </Link>
          </li>
        </ul>
      </nav>

      <section style={{
        background: 'linear-gradient(135deg, #FFE5EF 0%, #E3F2FD 100%)',
        padding: '3rem',
        borderRadius: '16px',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{t('welcome')}</h2>
        <p style={{ fontSize: '1.25rem', lineHeight: '1.8', color: '#555' }}>
          {t('description')}
        </p>
      </section>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        <div style={{
          padding: '2rem',
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#FF6B9D' }}>
            {t('nav.offlineMode')}
          </h3>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>
            {t('status.offline')} - {t('status.syncComplete')}
          </p>
        </div>

        <div style={{
          padding: '2rem',
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#FF6B9D' }}>
            {t('buttons.addTrip')}
          </h3>
          <button style={{
            padding: '0.75rem 1.5rem',
            background: '#FF6B9D',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            width: '100%'
          }}>
            {t('buttons.addTrip')}
          </button>
        </div>
      </div>
    </main>
  );
}
