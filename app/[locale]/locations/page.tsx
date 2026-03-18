'use client';

import LocationCard from '@/components/LocationCard';

const sampleLocations = [
  {
    name: 'Senso-ji Temple',
    city: 'Tokyo',
    description: 'Ancient Buddhist temple in Asakusa, one of Tokyo\'s most colorful and popular temples.',
    lat: 35.7148,
    lng: 139.7967,
    imageUrl: '/images/sensoji.jpg',
  },
  {
    name: 'Fushimi Inari Shrine',
    city: 'Kyoto',
    description: 'Iconic shrine famous for thousands of vermilion torii gates along mountain trails.',
    lat: 34.9671,
    lng: 135.7727,
    imageUrl: '/images/fushimi-inari.jpg',
  },
  {
    name: 'Nara Park',
    city: 'Nara',
    description: 'Historic park where over 1,000 free-roaming deer are considered sacred messengers.',
    lat: 34.685,
    lng: 135.843,
    imageUrl: '/images/nara-park.jpg',
  },
];

export default function LocationsPage() {
  // Calculate check-in/out dates (7 days from now)
  const checkInDate = new Date();
  checkInDate.setDate(checkInDate.getDate() + 7);
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + 2);

  const checkIn = checkInDate.toISOString().split('T')[0];
  const checkOut = checkOutDate.toISOString().split('T')[0];

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ color: '#FF6B9D', fontSize: '2.5rem', marginBottom: '1rem' }}>
          Popular Locations
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>
          Discover amazing places in Japan with hotel booking options
        </p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem'
      }}>
        {sampleLocations.map((location) => (
          <LocationCard
            key={location.name}
            location={location}
            checkIn={checkIn}
            checkOut={checkOut}
          />
        ))}
      </div>

      <section style={{
        marginTop: '4rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, #FFE5EF 0%, #E3F2FD 100%)',
        borderRadius: '12px'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          About Affiliate Bookings
        </h2>
        <p style={{ fontSize: '1rem', color: '#666', lineHeight: '1.6' }}>
          When you book hotels through our links, we receive a small commission from Booking.com
          or Agoda at no additional cost to you. This helps us maintain this free service and
          continue improving our travel planning tools. We only recommend services we trust and
          believe will enhance your Japan travel experience.
        </p>
      </section>
    </main>
  );
}
