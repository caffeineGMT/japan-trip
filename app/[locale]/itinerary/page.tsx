'use client';

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
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 7);

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ color: '#FF6B9D', fontSize: '2.5rem', marginBottom: '1rem' }}>
          Your Japan Itinerary
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>
          14-day cherry blossom tour
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {sampleItinerary.map((day) => {
          const dayDate = new Date(startDate);
          dayDate.setDate(dayDate.getDate() + day.day - 1);

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
                  {day.city} - {dayDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div>
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
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
