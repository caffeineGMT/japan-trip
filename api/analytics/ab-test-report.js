/**
 * A/B Test Reporting Dashboard
 * View conversion metrics and performance by variant
 */

const fs = require('fs').promises;
const path = require('path');

const ANALYTICS_FILE = path.join(process.cwd(), 'data', 'ab-test-analytics.json');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Load analytics data
    let analyticsData = [];
    try {
      const fileContent = await fs.readFile(ANALYTICS_FILE, 'utf8');
      analyticsData = JSON.parse(fileContent);
    } catch (error) {
      return res.status(200).json({
        message: 'No analytics data yet',
        variants: {}
      });
    }

    // Process data by variant
    const variantStats = {};

    analyticsData.forEach(entry => {
      const { variant, event } = entry;

      if (!variantStats[variant]) {
        variantStats[variant] = {
          totalViews: 0,
          freeTrialClicks: 0,
          monthlyClicks: 0,
          annualClicks: 0,
          checkoutCreated: 0,
          scroll25: 0,
          scroll50: 0,
          scroll75: 0,
          scroll100: 0,
          events: {}
        };
      }

      // Count events
      if (!variantStats[variant].events[event]) {
        variantStats[variant].events[event] = 0;
      }
      variantStats[variant].events[event]++;

      // Track specific metrics
      if (event === 'pricing_view') variantStats[variant].totalViews++;
      if (event === 'free_trial_click') variantStats[variant].freeTrialClicks++;
      if (event === 'subscribe_monthly_click') variantStats[variant].monthlyClicks++;
      if (event === 'subscribe_annual_click') variantStats[variant].annualClicks++;
      if (event === 'scroll_25') variantStats[variant].scroll25++;
      if (event === 'scroll_50') variantStats[variant].scroll50++;
      if (event === 'scroll_75') variantStats[variant].scroll75++;
      if (event === 'scroll_100') variantStats[variant].scroll100++;
    });

    // Calculate conversion rates
    Object.keys(variantStats).forEach(variant => {
      const stats = variantStats[variant];
      const views = stats.totalViews || 1; // Avoid division by zero

      stats.conversionRate = {
        freeTrial: ((stats.freeTrialClicks / views) * 100).toFixed(2) + '%',
        monthly: ((stats.monthlyClicks / views) * 100).toFixed(2) + '%',
        annual: ((stats.annualClicks / views) * 100).toFixed(2) + '%',
        total: (((stats.freeTrialClicks + stats.monthlyClicks + stats.annualClicks) / views) * 100).toFixed(2) + '%'
      };

      stats.engagement = {
        scroll25: ((stats.scroll25 / views) * 100).toFixed(2) + '%',
        scroll50: ((stats.scroll50 / views) * 100).toFixed(2) + '%',
        scroll75: ((stats.scroll75 / views) * 100).toFixed(2) + '%',
        scroll100: ((stats.scroll100 / views) * 100).toFixed(2) + '%'
      };
    });

    // Generate HTML report
    const html = generateReportHTML(variantStats);

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);

  } catch (error) {
    console.error('Report generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate report',
      message: error.message
    });
  }
};

function generateReportHTML(variantStats) {
  const variants = Object.keys(variantStats);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A/B Test Report - Pricing Page</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      padding: 40px 20px;
      margin: 0;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      color: #333;
      margin-bottom: 32px;
    }
    .variant-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }
    .variant-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .variant-name {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 16px;
      text-transform: uppercase;
    }
    .metric {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #eee;
    }
    .metric:last-child {
      border-bottom: none;
    }
    .metric-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .metric-value {
      font-size: 32px;
      font-weight: 700;
      color: #333;
    }
    .metric-subvalue {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }
    .winner {
      border: 3px solid #10b981;
      position: relative;
    }
    .winner::before {
      content: '🏆 WINNER';
      position: absolute;
      top: -16px;
      left: 50%;
      transform: translateX(-50%);
      background: #10b981;
      color: white;
      padding: 4px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }
    .event-table {
      width: 100%;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .event-table th {
      background: #667eea;
      color: white;
      padding: 12px;
      text-align: left;
    }
    .event-table td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>A/B Test Report - Pricing Page</h1>
    <p style="color: #666; margin-bottom: 32px;">
      Last updated: ${new Date().toLocaleString()} |
      Testing: Control vs Variant A (Savings Emphasis)
    </p>

    <div class="variant-grid">
      ${variants.map((variant, index) => {
        const stats = variantStats[variant];
        const totalConversionRate = parseFloat(stats.conversionRate.total);
        const isWinner = variants.length > 1 &&
                        totalConversionRate === Math.max(...variants.map(v => parseFloat(variantStats[v].conversionRate.total)));

        return `
          <div class="variant-card ${isWinner ? 'winner' : ''}">
            <div class="variant-name">${variant}</div>

            <div class="metric">
              <div class="metric-label">Total Views</div>
              <div class="metric-value">${stats.totalViews.toLocaleString()}</div>
            </div>

            <div class="metric">
              <div class="metric-label">Total Conversion Rate</div>
              <div class="metric-value">${stats.conversionRate.total}</div>
              <div class="metric-subvalue">
                Free Trial: ${stats.conversionRate.freeTrial}<br>
                Monthly: ${stats.conversionRate.monthly}<br>
                Annual: ${stats.conversionRate.annual}
              </div>
            </div>

            <div class="metric">
              <div class="metric-label">Scroll Engagement</div>
              <div class="metric-subvalue">
                25%: ${stats.engagement.scroll25}<br>
                50%: ${stats.engagement.scroll50}<br>
                75%: ${stats.engagement.scroll75}<br>
                100%: ${stats.engagement.scroll100}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <h2 style="margin-bottom: 16px;">Detailed Event Breakdown</h2>
    ${variants.map(variant => {
      const stats = variantStats[variant];
      return `
        <h3 style="margin-top: 32px; color: #667eea;">${variant.toUpperCase()}</h3>
        <table class="event-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(stats.events)
              .sort((a, b) => b[1] - a[1])
              .map(([event, count]) => `
                <tr>
                  <td>${event}</td>
                  <td><strong>${count}</strong></td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      `;
    }).join('')}
  </div>
</body>
</html>
  `;
}
