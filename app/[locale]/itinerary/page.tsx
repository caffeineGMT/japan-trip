'use client';

import BookingCTA from '@/components/BookingCTA';

interface ItineraryDay {
  day: number;
  location: string;
  city: string;
  activities: string[];
}

const sampleItinerary: ItineraryDay[] = [
  {
    day: 1,
    location: 'Asakusa & Tokyo Skytree',
    city: 'Tokyo',
    activities: [
      'Visit Senso-ji Temple',
      'Explore Nakamise Shopping Street',
      'View from Tokyo Skytree',
    ],
  },
  {
    day: 2,
    location: 'Shibuya & Harajuku',
    city: 'Tokyo',
    activities: [
      'Shibuya Crossing',
      'Meiji Shrine',
      'Takeshita Street shopping',
    ],
  },
  {
    day: 3,
    location: 'Kyoto Arrival',
    city: 'Kyoto',
    activities: [
      'Fushimi Inari Shrine',
      'Gion District',
      'Traditional kaiseki dinner',
    ],
  },
];

export default function ItineraryPage() {
  // Calculate dates for each day (starting 7 days from now)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 7);

  const handleJRPassClick = async () => {
    try {
      await fetch('/api/track-affiliate-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'jrpass',
          location: 'JR Pass',
          city: 'Japan',
          url: 'https://www.jrpass.com/buy?affiliate=demo_jrpass_abc',
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to track JR Pass click:', error);
    }
    window.open('https://www.jrpass.com/buy?affiliate=demo_jrpass_abc', '_blank');
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ color: '#FF6B9D', fontSize: '2.5rem', marginBottom: '1rem' }}>
          Your Japan Itinerary
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>
          14-day cherry blossom tour with booking options
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {sampleItinerary.map((day) => {
          const dayDate = new Date(startDate);
          dayDate.setDate(dayDate.getDate() + day.day - 1);

          const checkIn = dayDate.toISOString().split('T')[0];
          const checkOutDate = new Date(dayDate);
          checkOutDate.setDate(checkOutDate.getDate() + 1);
          const checkOut = checkOutDate.toISOString().split('T')[0];

          return (
            <div
              key={day.day}
              style={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'inline-block',
                  background: '#FF6B9D',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  marginBottom: '1rem'
                }}>
                  Day {day.day}
                </div>
                <h2 style={{ fontSize: '1.75rem', color: '#333', marginBottom: '0.5rem' }}>
                  {day.location}
                </h2>
                <p style={{ color: '#999', fontSize: '0.95rem' }}>
                  📍 {day.city} • {dayDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#666' }}>
                  Activities
                </h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {day.activities.map((activity, idx) => (
                    <li
                      key={idx}
                      style={{
                        padding: '0.5rem 0',
                        borderBottom: idx < day.activities.length - 1 ? '1px solid #f0f0f0' : 'none'
                      }}
                    >
                      ✓ {activity}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hotel booking CTA */}
              <div style={{
                borderTop: '2px solid #f0f0f0',
                paddingTop: '1.5rem',
                marginTop: '1.5rem'
              }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#666' }}>
                  🏨 Find Hotels in {day.city}
                </h4>
                <BookingCTA
                  location={day.location}
                  city={day.city}
                  type="hotel"
                  checkIn={checkIn}
                  checkOut={checkOut}
                />
              </div>

              {/* Activity booking CTA for specific days */}
              {day.day === 1 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#666' }}>
                    🎯 Book Activities
                  </h4>
                  <BookingCTA
                    location={day.location}
                    city={day.city}
                    type="activity"
                    activityId="tokyo-skytree-ticket"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* JR Pass CTA */}
      <div style={{
        marginTop: '3rem',
        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
          🚄 Save Money with a JR Pass
        </h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.95 }}>
          Unlimited travel on Japan Railways trains. Essential for multi-city trips!
        </p>
        <button
          onClick={handleJRPassClick}
          style={{
            background: 'white',
            color: '#4CAF50',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          Get Your JR Pass →
        </button>
        <p style={{ fontSize: '0.85rem', marginTop: '1rem', opacity: 0.9 }}>
          We earn a small commission at no extra cost to you
        </p>
      </div>
    </main>
  );
}
