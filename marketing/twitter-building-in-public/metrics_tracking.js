/**
 * Twitter Building in Public - Metrics Tracking System
 *
 * Tracks Twitter performance, website traffic, and conversions
 * Generates weekly reports and insights
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  dataDir: path.join(__dirname, 'data'),
  reportsDir: path.join(__dirname, 'reports'),
  twitterHandle: '@japantripai', // Replace with actual handle
  websiteUrl: 'https://japan-trip-companion.com',
  utmSource: 'twitter',
  utmMedium: 'social',
  utmCampaign: 'buildinpublic',

  // Targets
  targets: {
    month1: {
      followers: 150,
      clicksPerWeek: 20,
      signupsPerMonth: 2,
      mrr: 5
    },
    month2: {
      followers: 300,
      clicksPerWeek: 40,
      signupsPerMonth: 5,
      mrr: 20
    },
    month3: {
      followers: 500,
      clicksPerWeek: 50,
      signupsPerMonth: 10,
      mrr: 50
    }
  }
};

// Ensure directories exist
[CONFIG.dataDir, CONFIG.reportsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Data structure for daily metrics
 */
class DailyMetrics {
  constructor(date = new Date()) {
    this.date = date.toISOString().split('T')[0];
    this.twitter = {
      followers: 0,
      impressions: 0,
      engagements: 0,
      likes: 0,
      retweets: 0,
      replies: 0,
      bookmarks: 0,
      profileVisits: 0,
      linkClicks: 0,
      tweets: []
    };
    this.website = {
      visitors: 0,
      sessions: 0,
      pageviews: 0,
      signups: 0,
      conversions: 0,
      revenue: 0
    };
    this.engagement = {
      repliesSent: 0,
      dmsSent: 0,
      spacesAttended: 0,
      timeInvested: 0 // minutes
    };
  }
}

/**
 * Calculate derived metrics
 */
function calculateMetrics(dailyData) {
  const metrics = {
    engagementRate: 0,
    replyRate: 0,
    clickThroughRate: 0,
    conversionRate: 0,
    revenuePerFollower: 0,
    engagementQualityScore: 0
  };

  if (dailyData.twitter.impressions > 0) {
    const totalEngagements =
      dailyData.twitter.likes +
      dailyData.twitter.retweets +
      dailyData.twitter.replies +
      dailyData.twitter.bookmarks;

    metrics.engagementRate = (totalEngagements / dailyData.twitter.impressions * 100).toFixed(2);
    metrics.replyRate = (dailyData.twitter.replies / dailyData.twitter.impressions * 100).toFixed(2);
    metrics.clickThroughRate = (dailyData.twitter.linkClicks / dailyData.twitter.impressions * 100).toFixed(2);
  }

  if (dailyData.website.visitors > 0) {
    metrics.conversionRate = (dailyData.website.conversions / dailyData.website.visitors * 100).toFixed(2);
  }

  if (dailyData.twitter.followers > 0) {
    metrics.revenuePerFollower = (dailyData.website.revenue / dailyData.twitter.followers).toFixed(2);
  }

  // Custom engagement quality score
  // Bookmarks (4x) + Replies (3x) + RTs (2x) + Likes (1x)
  metrics.engagementQualityScore =
    (dailyData.twitter.bookmarks * 4) +
    (dailyData.twitter.replies * 3) +
    (dailyData.twitter.retweets * 2) +
    (dailyData.twitter.likes * 1);

  return metrics;
}

/**
 * Record daily metrics
 */
function recordDailyMetrics(data) {
  const filename = path.join(CONFIG.dataDir, `${data.date}.json`);

  // Calculate derived metrics
  const derived = calculateMetrics(data);
  data.derived = derived;

  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`✅ Recorded metrics for ${data.date}`);

  return data;
}

/**
 * Load metrics for a date range
 */
function loadMetricsRange(startDate, endDate) {
  const metrics = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const filename = path.join(CONFIG.dataDir, `${dateStr}.json`);

    if (fs.existsSync(filename)) {
      const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
      metrics.push(data);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return metrics;
}

/**
 * Generate weekly report
 */
function generateWeeklyReport(weekNumber) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 7);

  const metrics = loadMetricsRange(startDate, today);

  if (metrics.length === 0) {
    console.log('❌ No data available for weekly report');
    return null;
  }

  // Aggregate metrics
  const totals = metrics.reduce((acc, day) => {
    // Twitter
    acc.impressions += day.twitter.impressions;
    acc.engagements += day.twitter.engagements;
    acc.likes += day.twitter.likes;
    acc.retweets += day.twitter.retweets;
    acc.replies += day.twitter.replies;
    acc.bookmarks += day.twitter.bookmarks;
    acc.linkClicks += day.twitter.linkClicks;
    acc.profileVisits += day.twitter.profileVisits;

    // Website
    acc.visitors += day.website.visitors;
    acc.signups += day.website.signups;
    acc.conversions += day.website.conversions;
    acc.revenue += day.website.revenue;

    // Engagement
    acc.repliesSent += day.engagement.repliesSent;
    acc.dmsSent += day.engagement.dmsSent;
    acc.timeInvested += day.engagement.timeInvested;

    return acc;
  }, {
    impressions: 0,
    engagements: 0,
    likes: 0,
    retweets: 0,
    replies: 0,
    bookmarks: 0,
    linkClicks: 0,
    profileVisits: 0,
    visitors: 0,
    signups: 0,
    conversions: 0,
    revenue: 0,
    repliesSent: 0,
    dmsSent: 0,
    timeInvested: 0
  });

  // Get follower count (from most recent day)
  const latestDay = metrics[metrics.length - 1];
  const previousDay = metrics[0];
  const followers = latestDay.twitter.followers;
  const followerGrowth = latestDay.twitter.followers - previousDay.twitter.followers;

  // Calculate rates
  const engagementRate = totals.impressions > 0
    ? (totals.engagements / totals.impressions * 100).toFixed(2)
    : 0;
  const clickThroughRate = totals.impressions > 0
    ? (totals.linkClicks / totals.impressions * 100).toFixed(2)
    : 0;
  const conversionRate = totals.visitors > 0
    ? (totals.conversions / totals.visitors * 100).toFixed(2)
    : 0;

  const report = {
    week: weekNumber,
    startDate: startDate.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
    summary: {
      followers: followers,
      followerGrowth: followerGrowth,
      followerGrowthPercent: previousDay.twitter.followers > 0
        ? ((followerGrowth / previousDay.twitter.followers) * 100).toFixed(2)
        : 0,
      impressions: totals.impressions,
      engagements: totals.engagements,
      engagementRate: engagementRate,
      linkClicks: totals.linkClicks,
      clickThroughRate: clickThroughRate,
      websiteVisitors: totals.visitors,
      signups: totals.signups,
      conversions: totals.conversions,
      conversionRate: conversionRate,
      revenue: totals.revenue.toFixed(2),
      timeInvested: totals.timeInvested
    },
    breakdown: {
      likes: totals.likes,
      retweets: totals.retweets,
      replies: totals.replies,
      bookmarks: totals.bookmarks,
      profileVisits: totals.profileVisits,
      repliesSent: totals.repliesSent,
      dmsSent: totals.dmsSent
    },
    insights: generateInsights(totals, latestDay, previousDay)
  };

  // Save report
  const filename = path.join(CONFIG.reportsDir, `week-${weekNumber}.json`);
  fs.writeFileSync(filename, JSON.stringify(report, null, 2));

  console.log(`✅ Generated weekly report for Week ${weekNumber}`);
  return report;
}

/**
 * Generate insights from data
 */
function generateInsights(totals, latestDay, previousDay) {
  const insights = [];

  // Engagement rate insight
  const engagementRate = totals.impressions > 0
    ? (totals.engagements / totals.impressions * 100)
    : 0;

  if (engagementRate < 2) {
    insights.push({
      type: 'warning',
      metric: 'engagement_rate',
      message: `Engagement rate is ${engagementRate.toFixed(2)}% (target: >3%). Try: more questions, polls, or controversial takes.`
    });
  } else if (engagementRate > 5) {
    insights.push({
      type: 'success',
      metric: 'engagement_rate',
      message: `Strong engagement rate of ${engagementRate.toFixed(2)}%! Keep doing what you're doing.`
    });
  }

  // Follower growth insight
  const followerGrowth = latestDay.twitter.followers - previousDay.twitter.followers;
  const growthRate = previousDay.twitter.followers > 0
    ? (followerGrowth / previousDay.twitter.followers * 100)
    : 0;

  if (growthRate < 2) {
    insights.push({
      type: 'warning',
      metric: 'follower_growth',
      message: `Slow follower growth (${followerGrowth} this week, ${growthRate.toFixed(2)}%). Try: engage more with larger accounts, join Twitter Spaces.`
    });
  } else if (growthRate > 10) {
    insights.push({
      type: 'success',
      metric: 'follower_growth',
      message: `Excellent follower growth! +${followerGrowth} (${growthRate.toFixed(2)}%). Analyze what content drove this.`
    });
  }

  // Click-through rate insight
  const clickThroughRate = totals.impressions > 0
    ? (totals.linkClicks / totals.impressions * 100)
    : 0;

  if (clickThroughRate < 1 && totals.linkClicks > 0) {
    insights.push({
      type: 'warning',
      metric: 'click_through_rate',
      message: `Low CTR of ${clickThroughRate.toFixed(2)}%. Improve: tweet copy, clear CTAs, better positioning of links.`
    });
  }

  // Conversion insight
  const conversionRate = totals.visitors > 0
    ? (totals.conversions / totals.visitors * 100)
    : 0;

  if (conversionRate < 10 && totals.visitors > 50) {
    insights.push({
      type: 'warning',
      metric: 'conversion_rate',
      message: `Conversion rate is ${conversionRate.toFixed(2)}% (good is 15%+). Check landing page, signup flow, value prop.`
    });
  } else if (conversionRate > 20) {
    insights.push({
      type: 'success',
      metric: 'conversion_rate',
      message: `Outstanding conversion rate of ${conversionRate.toFixed(2)}%! Your landing page is dialed in.`
    });
  }

  // Time efficiency insight
  if (totals.timeInvested > 0 && totals.revenue > 0) {
    const revenuePerHour = totals.revenue / (totals.timeInvested / 60);
    insights.push({
      type: 'info',
      metric: 'efficiency',
      message: `Revenue per hour: $${revenuePerHour.toFixed(2)} (${totals.timeInvested} min invested this week)`
    });
  }

  // Reply rate insight
  const replyRate = totals.impressions > 0
    ? (totals.replies / totals.impressions * 100)
    : 0;

  if (replyRate > 1) {
    insights.push({
      type: 'success',
      metric: 'reply_rate',
      message: `Excellent reply rate of ${replyRate.toFixed(2)}%! You're starting real conversations.`
    });
  }

  return insights;
}

/**
 * Generate formatted text report for tweeting
 */
function generateTweetReport(weekNumber) {
  const reportFile = path.join(CONFIG.reportsDir, `week-${weekNumber}.json`);

  if (!fs.existsSync(reportFile)) {
    console.log('❌ Weekly report not found. Generate it first.');
    return null;
  }

  const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
  const s = report.summary;

  const tweets = [];

  // Main tweet (1/n)
  tweets.push(`🧵 Week ${weekNumber} Building in Public

Stats:
👥 ${s.followers} followers (+${s.followerGrowth})
💰 $${s.revenue} revenue
📈 ${s.websiteVisitors} visitors
⚡ ${s.signups} signups
🎯 ${s.conversions} conversions

What happened this week 👇

1/${Math.min(10, 5 + report.insights.length)}`);

  // Engagement metrics (2/n)
  tweets.push(`Engagement this week:

👁️ ${s.impressions.toLocaleString()} impressions
💬 ${report.breakdown.replies} replies
🔄 ${report.breakdown.retweets} retweets
❤️ ${report.breakdown.likes} likes
📌 ${report.breakdown.bookmarks} bookmarks

Engagement rate: ${s.engagementRate}%

2/${Math.min(10, 5 + report.insights.length)}`);

  // Traffic & conversion (3/n)
  tweets.push(`Traffic & Conversions:

🔗 ${s.linkClicks} clicks from Twitter
📊 ${s.clickThroughRate}% CTR
👤 ${s.websiteVisitors} website visitors
✅ ${s.conversions} paid conversions
💰 $${s.revenue} revenue
📈 ${s.conversionRate}% conversion rate

3/${Math.min(10, 5 + report.insights.length)}`);

  // Community engagement (4/n)
  tweets.push(`Community work:

💬 ${report.breakdown.repliesSent} replies sent
✉️ ${report.breakdown.dmsSent} DMs sent
⏰ ${Math.round(s.timeInvested / 60)} hours invested

Building in public = building community.

4/${Math.min(10, 5 + report.insights.length)}`);

  // Insights
  report.insights.forEach((insight, index) => {
    const emoji = insight.type === 'success' ? '✅' : insight.type === 'warning' ? '⚠️' : 'ℹ️';
    tweets.push(`${emoji} Insight: ${insight.message}

${5 + index}/${Math.min(10, 5 + report.insights.length)}`);
  });

  // Closing tweet
  const weekNum = parseInt(weekNumber);
  const month = Math.ceil(weekNum / 4);
  const targetKey = `month${month}`;
  const targets = CONFIG.targets[targetKey] || CONFIG.targets.month1;

  tweets.push(`Next week goals:

🎯 ${targets.followers} followers (${s.followers - targets.followers > 0 ? 'ACHIEVED' : 'working on it'})
🎯 ${targets.clicksPerWeek} clicks/week
🎯 ${targets.signupsPerMonth} signups/month
🎯 $${targets.mrr} MRR

Follow along!

#buildinpublic #indiehackers

${Math.min(10, 5 + report.insights.length)}/${Math.min(10, 5 + report.insights.length)}`);

  // Save formatted thread
  const threadFile = path.join(CONFIG.reportsDir, `week-${weekNumber}-thread.txt`);
  fs.writeFileSync(threadFile, tweets.join('\n\n---\n\n'));

  console.log(`✅ Generated tweet thread for Week ${weekNumber}`);
  console.log(`\nPreview:\n${tweets[0]}\n`);
  console.log(`Full thread saved to: ${threadFile}`);

  return tweets;
}

/**
 * Compare against targets
 */
function compareToTargets(weekNumber) {
  const reportFile = path.join(CONFIG.reportsDir, `week-${weekNumber}.json`);

  if (!fs.existsSync(reportFile)) {
    console.log('❌ Weekly report not found');
    return null;
  }

  const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
  const month = Math.ceil(weekNumber / 4);
  const targetKey = `month${month}`;
  const targets = CONFIG.targets[targetKey] || CONFIG.targets.month3;

  const comparison = {
    week: weekNumber,
    month: month,
    metrics: {
      followers: {
        actual: report.summary.followers,
        target: targets.followers,
        progress: (report.summary.followers / targets.followers * 100).toFixed(1),
        status: report.summary.followers >= targets.followers ? 'achieved' : 'in-progress'
      },
      clicksPerWeek: {
        actual: report.summary.linkClicks,
        target: targets.clicksPerWeek,
        progress: (report.summary.linkClicks / targets.clicksPerWeek * 100).toFixed(1),
        status: report.summary.linkClicks >= targets.clicksPerWeek ? 'achieved' : 'in-progress'
      },
      conversions: {
        actual: report.summary.conversions,
        target: targets.signupsPerMonth / 4, // Weekly target
        progress: (report.summary.conversions / (targets.signupsPerMonth / 4) * 100).toFixed(1),
        status: report.summary.conversions >= (targets.signupsPerMonth / 4) ? 'achieved' : 'in-progress'
      },
      revenue: {
        actual: parseFloat(report.summary.revenue),
        target: targets.mrr / 4, // Weekly target
        progress: (parseFloat(report.summary.revenue) / (targets.mrr / 4) * 100).toFixed(1),
        status: parseFloat(report.summary.revenue) >= (targets.mrr / 4) ? 'achieved' : 'in-progress'
      }
    }
  };

  console.log('\n📊 Performance vs Targets:\n');
  Object.entries(comparison.metrics).forEach(([metric, data]) => {
    const emoji = data.status === 'achieved' ? '✅' : '🎯';
    console.log(`${emoji} ${metric}: ${data.actual} / ${data.target} (${data.progress}%)`);
  });

  return comparison;
}

/**
 * Export data for external analytics
 */
function exportToCSV(startDate, endDate, outputFile) {
  const metrics = loadMetricsRange(new Date(startDate), new Date(endDate));

  if (metrics.length === 0) {
    console.log('❌ No data to export');
    return;
  }

  const headers = [
    'Date',
    'Followers',
    'Impressions',
    'Engagements',
    'Engagement Rate',
    'Likes',
    'Retweets',
    'Replies',
    'Bookmarks',
    'Link Clicks',
    'CTR',
    'Website Visitors',
    'Signups',
    'Conversions',
    'Conversion Rate',
    'Revenue'
  ];

  const rows = metrics.map(day => [
    day.date,
    day.twitter.followers,
    day.twitter.impressions,
    day.twitter.engagements,
    day.derived?.engagementRate || 0,
    day.twitter.likes,
    day.twitter.retweets,
    day.twitter.replies,
    day.twitter.bookmarks,
    day.twitter.linkClicks,
    day.derived?.clickThroughRate || 0,
    day.website.visitors,
    day.website.signups,
    day.website.conversions,
    day.derived?.conversionRate || 0,
    day.website.revenue
  ]);

  const csv = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  fs.writeFileSync(outputFile, csv);
  console.log(`✅ Exported ${metrics.length} days of data to ${outputFile}`);
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'record':
      // Example: node metrics_tracking.js record
      const sampleData = new DailyMetrics();
      console.log('\n📝 Enter today\'s metrics:\n');
      // In production, this would prompt for input or pull from Twitter API
      console.log('Sample data structure:');
      console.log(JSON.stringify(sampleData, null, 2));
      console.log('\nEdit the data object and call recordDailyMetrics(data)');
      break;

    case 'report':
      // Example: node metrics_tracking.js report 1
      const weekNumber = parseInt(args[1]) || 1;
      const report = generateWeeklyReport(weekNumber);
      if (report) {
        console.log('\n✅ Weekly Report Generated');
        console.log(JSON.stringify(report, null, 2));
      }
      break;

    case 'thread':
      // Example: node metrics_tracking.js thread 1
      const weekNum = parseInt(args[1]) || 1;
      generateTweetReport(weekNum);
      break;

    case 'targets':
      // Example: node metrics_tracking.js targets 1
      const week = parseInt(args[1]) || 1;
      compareToTargets(week);
      break;

    case 'export':
      // Example: node metrics_tracking.js export 2026-03-19 2026-04-19 output.csv
      const start = args[1] || '2026-03-19';
      const end = args[2] || new Date().toISOString().split('T')[0];
      const output = args[3] || path.join(CONFIG.reportsDir, 'export.csv');
      exportToCSV(start, end, output);
      break;

    default:
      console.log(`
Twitter Building in Public - Metrics Tracking

Commands:
  record              Record daily metrics
  report <week>       Generate weekly report
  thread <week>       Generate Twitter thread from report
  targets <week>      Compare performance to targets
  export <start> <end> <file>  Export data to CSV

Examples:
  node metrics_tracking.js report 1
  node metrics_tracking.js thread 2
  node metrics_tracking.js targets 1
  node metrics_tracking.js export 2026-03-19 2026-04-19 data.csv
      `);
  }
}

// Export functions for use as module
module.exports = {
  DailyMetrics,
  recordDailyMetrics,
  loadMetricsRange,
  generateWeeklyReport,
  generateTweetReport,
  compareToTargets,
  exportToCSV,
  calculateMetrics
};
