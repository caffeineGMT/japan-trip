import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function getAffiliateStats() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get total clicks
  const { count: totalClicks } = await supabase
    .from('affiliate_clicks')
    .select('*', { count: 'exact', head: true });

  // Get clicks by provider
  const { data: allClicks } = await supabase
    .from('affiliate_clicks')
    .select('provider');

  const clicksByProvider = allClicks?.reduce((acc, row) => {
    acc[row.provider] = (acc[row.provider] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Get recent clicks
  const { data: recentClicks } = await supabase
    .from('affiliate_clicks')
    .select('*')
    .order('clicked_at', { ascending: false })
    .limit(10);

  // Get conversions
  const { count: conversions } = await supabase
    .from('affiliate_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('converted', true);

  return {
    totalClicks: totalClicks || 0,
    clicksByProvider,
    recentClicks: recentClicks || [],
    conversions: conversions || 0,
  };
}

export default async function DashboardPage() {
  const stats = await getAffiliateStats();

  if (!stats) {
    return (
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#FF6B9D', fontSize: '2rem', marginBottom: '1rem' }}>
          Affiliate Dashboard
        </h1>
        <div style={{
          padding: '2rem',
          background: '#FFF3CD',
          border: '1px solid #FFE69C',
          borderRadius: '8px'
        }}>
          <p>Database not configured. Please set up Supabase credentials to view analytics.</p>
        </div>
      </main>
    );
  }

  const conversionRate = stats.totalClicks > 0
    ? ((stats.conversions / stats.totalClicks) * 100).toFixed(2)
    : '0.00';

  // Estimate revenue (conservative estimates)
  const estimatedRevenue: Record<string, number> = {
    'booking.com': (stats.clicksByProvider['booking.com'] || 0) * 0.02 * 400 * 0.04,
    'agoda': (stats.clicksByProvider['agoda'] || 0) * 0.02 * 350 * 0.05,
    'klook': (stats.clicksByProvider['klook'] || 0) * 0.03 * 80 * 0.08,
    'jrpass': (stats.clicksByProvider['jrpass'] || 0) * 0.02 * 400 * 0.05,
  };

  const totalEstimatedRevenue = Object.values(estimatedRevenue).reduce((sum, val) => sum + val, 0);

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ color: '#FF6B9D', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Affiliate Revenue Dashboard
        </h1>
        <p style={{ fontSize: '1rem', color: '#666' }}>
          Track clicks, conversions, and estimated revenue from affiliate links
        </p>
      </header>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <MetricCard
          title="Total Clicks"
          value={stats.totalClicks.toString()}
          icon="🖱️"
        />
        <MetricCard
          title="Conversions"
          value={stats.conversions.toString()}
          subtitle={`${conversionRate}% conversion rate`}
          icon="✅"
        />
        <MetricCard
          title="Estimated Revenue"
          value={`$${totalEstimatedRevenue.toFixed(2)}`}
          subtitle="Based on industry averages"
          icon="💰"
        />
        <MetricCard
          title="Avg. per Click"
          value={`$${stats.totalClicks > 0 ? (totalEstimatedRevenue / stats.totalClicks).toFixed(2) : '0.00'}`}
          subtitle="Revenue per click"
          icon="📊"
        />
      </div>

      {/* Clicks by Provider */}
      <section style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Clicks by Provider</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {Object.entries(stats.clicksByProvider).map(([provider, count]) => (
            <ProviderRow
              key={provider}
              provider={provider}
              clicks={count as number}
              estimatedRevenue={estimatedRevenue[provider] || 0}
            />
          ))}
          {Object.keys(stats.clicksByProvider).length === 0 && (
            <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>
              No clicks yet. Start by visiting the locations or itinerary pages!
            </p>
          )}
        </div>
      </section>

      {/* Recent Clicks */}
      <section style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #e0e0e0'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recent Clicks</h2>
        {stats.recentClicks.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>Time</th>
                  <th style={{ padding: '0.75rem' }}>Provider</th>
                  <th style={{ padding: '0.75rem' }}>Location</th>
                  <th style={{ padding: '0.75rem' }}>City</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentClicks.map((click: any) => (
                  <tr key={click.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '0.75rem' }}>
                      {new Date(click.clicked_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem' }}>{click.provider}</td>
                    <td style={{ padding: '0.75rem' }}>{click.location}</td>
                    <td style={{ padding: '0.75rem' }}>{click.city || '-'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      {click.converted ? '✅ Converted' : '⏳ Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>
            No clicks tracked yet
          </p>
        )}
      </section>
    </main>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
}) {
  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid #e0e0e0'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <h3 style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
        {title}
      </h3>
      <div style={{ fontSize: '2rem', fontWeight: '700', color: '#333', marginBottom: '0.25rem' }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.8rem', color: '#999' }}>{subtitle}</div>
      )}
    </div>
  );
}

function ProviderRow({
  provider,
  clicks,
  estimatedRevenue
}: {
  provider: string;
  clicks: number;
  estimatedRevenue: number;
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      background: '#f9f9f9',
      borderRadius: '8px'
    }}>
      <div>
        <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem' }}>
          {provider}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#666' }}>
          {clicks} clicks
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FF6B9D' }}>
          ${estimatedRevenue.toFixed(2)}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#999' }}>
          estimated
        </div>
      </div>
    </div>
  );
}
