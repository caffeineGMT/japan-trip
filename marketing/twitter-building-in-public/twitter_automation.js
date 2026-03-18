/**
 * Twitter API Automation for Building in Public Campaign
 *
 * Features:
 * - Schedule tweets
 * - Post threads
 * - Track performance
 * - Auto-engage with community
 *
 * Setup:
 * 1. Get Twitter API credentials from developer.twitter.com
 * 2. Create .env file with credentials
 * 3. npm install twitter-api-v2 dotenv
 */

require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');
const path = require('path');

// Twitter API Client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const rwClient = twitterClient.readWrite;

/**
 * Configuration
 */
const CONFIG = {
  handle: process.env.TWITTER_HANDLE || '@japantripai',
  hashtagsToMonitor: ['buildinpublic', 'indiehackers', 'traveltech', 'japantravel'],
  usersToEngage: [], // Load from file
  contentDir: path.join(__dirname, 'content'),
  scheduledTweetsFile: path.join(__dirname, 'scheduled_tweets.json'),
  performanceLogFile: path.join(__dirname, 'data', 'tweet_performance.json'),
};

/**
 * Post a single tweet
 */
async function postTweet(text, options = {}) {
  try {
    const tweetOptions = {
      text: text,
      ...options
    };

    const tweet = await rwClient.v2.tweet(tweetOptions);
    console.log(`✅ Tweet posted: ${tweet.data.id}`);
    console.log(`   Text: ${text.substring(0, 60)}...`);

    // Log performance
    logTweetPerformance({
      id: tweet.data.id,
      text: text,
      timestamp: new Date().toISOString(),
      type: options.reply ? 'reply' : 'tweet'
    });

    return tweet;
  } catch (error) {
    console.error('❌ Error posting tweet:', error);
    throw error;
  }
}

/**
 * Post a thread
 */
async function postThread(tweets, delayMs = 3000) {
  try {
    const tweetIds = [];
    let previousTweetId = null;

    for (let i = 0; i < tweets.length; i++) {
      const tweetText = tweets[i];

      const options = previousTweetId
        ? { reply: { in_reply_to_tweet_id: previousTweetId } }
        : {};

      const tweet = await postTweet(tweetText, options);
      tweetIds.push(tweet.data.id);
      previousTweetId = tweet.data.id;

      console.log(`   Posted ${i + 1}/${tweets.length}`);

      // Delay between tweets to avoid rate limiting
      if (i < tweets.length - 1) {
        await sleep(delayMs);
      }
    }

    console.log(`✅ Thread posted successfully (${tweets.length} tweets)`);
    return tweetIds;
  } catch (error) {
    console.error('❌ Error posting thread:', error);
    throw error;
  }
}

/**
 * Schedule a tweet for later
 */
function scheduleTweet(text, scheduledTime, options = {}) {
  const scheduled = loadScheduledTweets();

  scheduled.push({
    id: Date.now().toString(),
    text: text,
    scheduledTime: scheduledTime,
    options: options,
    status: 'pending'
  });

  saveScheduledTweets(scheduled);
  console.log(`✅ Tweet scheduled for ${scheduledTime}`);
}

/**
 * Process scheduled tweets (call this via cron)
 */
async function processScheduledTweets() {
  const scheduled = loadScheduledTweets();
  const now = new Date();
  let posted = 0;

  for (const tweet of scheduled) {
    if (tweet.status === 'pending') {
      const scheduledTime = new Date(tweet.scheduledTime);

      if (scheduledTime <= now) {
        try {
          await postTweet(tweet.text, tweet.options);
          tweet.status = 'posted';
          tweet.postedAt = new Date().toISOString();
          posted++;
        } catch (error) {
          tweet.status = 'failed';
          tweet.error = error.message;
        }
      }
    }
  }

  if (posted > 0) {
    saveScheduledTweets(scheduled);
    console.log(`✅ Posted ${posted} scheduled tweets`);
  }

  return posted;
}

/**
 * Search tweets by hashtag and engage
 */
async function engageWithHashtag(hashtag, limit = 10) {
  try {
    const searchResults = await rwClient.v2.search(`#${hashtag} -is:retweet`, {
      max_results: limit,
      'tweet.fields': ['author_id', 'created_at', 'public_metrics']
    });

    const engagements = [];

    for await (const tweet of searchResults) {
      // Skip if it's your own tweet
      const myUser = await rwClient.v2.me();
      if (tweet.author_id === myUser.data.id) continue;

      // Like the tweet
      try {
        await rwClient.v2.like(myUser.data.id, tweet.id);
        console.log(`👍 Liked tweet: ${tweet.text.substring(0, 60)}...`);
        engagements.push({ type: 'like', tweetId: tweet.id });
        await sleep(2000); // Rate limiting
      } catch (error) {
        console.error('Error liking tweet:', error.message);
      }
    }

    console.log(`✅ Engaged with ${engagements.length} tweets in #${hashtag}`);
    return engagements;
  } catch (error) {
    console.error(`❌ Error engaging with hashtag #${hashtag}:`, error);
    return [];
  }
}

/**
 * Reply to mentions
 */
async function replyToMentions(limit = 10) {
  try {
    const myUser = await rwClient.v2.me();
    const mentions = await rwClient.v2.userMentionTimeline(myUser.data.id, {
      max_results: limit,
      'tweet.fields': ['author_id', 'created_at', 'conversation_id']
    });

    const replies = [];

    for await (const mention of mentions) {
      // Check if we already replied (you'd track this in a DB in production)
      console.log(`💬 New mention: ${mention.text.substring(0, 60)}...`);

      // Generate or use predefined reply
      const replyText = generateReply(mention.text);

      if (replyText) {
        try {
          await postTweet(replyText, {
            reply: { in_reply_to_tweet_id: mention.id }
          });
          replies.push(mention.id);
          await sleep(2000);
        } catch (error) {
          console.error('Error replying:', error.message);
        }
      }
    }

    console.log(`✅ Replied to ${replies.length} mentions`);
    return replies;
  } catch (error) {
    console.error('❌ Error replying to mentions:', error);
    return [];
  }
}

/**
 * Get tweet analytics
 */
async function getTweetAnalytics(tweetId) {
  try {
    const tweet = await rwClient.v2.singleTweet(tweetId, {
      'tweet.fields': ['public_metrics', 'created_at']
    });

    const metrics = tweet.data.public_metrics;

    return {
      tweetId: tweetId,
      impressions: metrics.impression_count || 0,
      likes: metrics.like_count || 0,
      retweets: metrics.retweet_count || 0,
      replies: metrics.reply_count || 0,
      quotes: metrics.quote_count || 0,
      bookmarks: metrics.bookmark_count || 0,
      engagements: (metrics.like_count + metrics.retweet_count + metrics.reply_count + metrics.bookmark_count) || 0,
      engagementRate: metrics.impression_count > 0
        ? ((metrics.like_count + metrics.retweet_count + metrics.reply_count + metrics.bookmark_count) / metrics.impression_count * 100).toFixed(2)
        : 0
    };
  } catch (error) {
    console.error(`❌ Error getting analytics for tweet ${tweetId}:`, error);
    return null;
  }
}

/**
 * Batch update analytics for recent tweets
 */
async function updateRecentAnalytics(days = 7) {
  try {
    const myUser = await rwClient.v2.me();
    const tweets = await rwClient.v2.userTimeline(myUser.data.id, {
      max_results: 100,
      'tweet.fields': ['created_at', 'public_metrics'],
      start_time: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    });

    const analytics = [];

    for await (const tweet of tweets) {
      const metrics = await getTweetAnalytics(tweet.id);
      if (metrics) {
        analytics.push(metrics);
        console.log(`📊 ${tweet.id}: ${metrics.engagements} engagements (${metrics.engagementRate}%)`);
      }
      await sleep(1000);
    }

    // Save to performance log
    saveAnalytics(analytics);

    console.log(`✅ Updated analytics for ${analytics.length} tweets`);
    return analytics;
  } catch (error) {
    console.error('❌ Error updating analytics:', error);
    return [];
  }
}

/**
 * Find top performing tweets
 */
async function getTopPerformers(metric = 'engagementRate', limit = 5) {
  const performance = loadTweetPerformance();

  if (performance.length === 0) {
    console.log('No performance data available. Run updateRecentAnalytics() first.');
    return [];
  }

  const sorted = performance.sort((a, b) => {
    const aValue = parseFloat(a[metric]) || 0;
    const bValue = parseFloat(b[metric]) || 0;
    return bValue - aValue;
  });

  const top = sorted.slice(0, limit);

  console.log(`\n🏆 Top ${limit} tweets by ${metric}:\n`);
  top.forEach((tweet, index) => {
    console.log(`${index + 1}. ${tweet.text?.substring(0, 60) || tweet.tweetId}...`);
    console.log(`   ${metric}: ${tweet[metric]}`);
    console.log(`   Engagements: ${tweet.engagements}`);
    console.log('');
  });

  return top;
}

/**
 * Auto-engagement routine (run daily via cron)
 */
async function dailyEngagementRoutine() {
  console.log('\n🤖 Starting daily engagement routine...\n');

  try {
    // 1. Reply to mentions
    console.log('1. Replying to mentions...');
    await replyToMentions(10);
    await sleep(5000);

    // 2. Engage with #buildinpublic
    console.log('\n2. Engaging with #buildinpublic...');
    await engageWithHashtag('buildinpublic', 10);
    await sleep(5000);

    // 3. Engage with #indiehackers
    console.log('\n3. Engaging with #indiehackers...');
    await engageWithHashtag('indiehackers', 5);
    await sleep(5000);

    // 4. Engage with #traveltech
    console.log('\n4. Engaging with #traveltech...');
    await engageWithHashtag('traveltech', 5);

    console.log('\n✅ Daily engagement routine complete!');
  } catch (error) {
    console.error('❌ Error in daily engagement routine:', error);
  }
}

// ===== Helper Functions =====

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadScheduledTweets() {
  if (fs.existsSync(CONFIG.scheduledTweetsFile)) {
    return JSON.parse(fs.readFileSync(CONFIG.scheduledTweetsFile, 'utf8'));
  }
  return [];
}

function saveScheduledTweets(tweets) {
  fs.writeFileSync(CONFIG.scheduledTweetsFile, JSON.stringify(tweets, null, 2));
}

function loadTweetPerformance() {
  if (fs.existsSync(CONFIG.performanceLogFile)) {
    return JSON.parse(fs.readFileSync(CONFIG.performanceLogFile, 'utf8'));
  }
  return [];
}

function logTweetPerformance(data) {
  const performance = loadTweetPerformance();
  performance.push(data);

  // Keep only last 1000 tweets
  if (performance.length > 1000) {
    performance.splice(0, performance.length - 1000);
  }

  const dir = path.dirname(CONFIG.performanceLogFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(CONFIG.performanceLogFile, JSON.stringify(performance, null, 2));
}

function saveAnalytics(analytics) {
  const performance = loadTweetPerformance();

  analytics.forEach(newData => {
    const existing = performance.find(p => p.id === newData.tweetId);
    if (existing) {
      Object.assign(existing, newData);
    } else {
      performance.push(newData);
    }
  });

  fs.writeFileSync(CONFIG.performanceLogFile, JSON.stringify(performance, null, 2));
}

/**
 * Simple reply generator (in production, use AI or predefined templates)
 */
function generateReply(mentionText) {
  // Simple keyword-based responses
  const text = mentionText.toLowerCase();

  if (text.includes('how') || text.includes('?')) {
    return 'Great question! Let me help with that. DM me if you want more details!';
  }

  if (text.includes('love') || text.includes('awesome') || text.includes('great')) {
    return 'Thank you! Really appreciate the support 🙏';
  }

  if (text.includes('problem') || text.includes('issue') || text.includes('bug')) {
    return 'Sorry to hear that! Can you DM me the details? I\'ll look into it right away.';
  }

  // Default
  return 'Thanks for reaching out! 🙏';
}

// ===== CLI Interface =====

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  (async () => {
    try {
      switch (command) {
        case 'tweet':
          // Example: node twitter_automation.js tweet "Hello world!"
          const text = args.slice(1).join(' ');
          await postTweet(text);
          break;

        case 'thread':
          // Example: node twitter_automation.js thread "tweet1" "tweet2" "tweet3"
          const tweets = args.slice(1);
          await postThread(tweets);
          break;

        case 'schedule':
          // Example: node twitter_automation.js schedule "2026-03-20T09:00:00" "Tweet text"
          const time = args[1];
          const schedText = args.slice(2).join(' ');
          scheduleTweet(schedText, time);
          break;

        case 'process':
          // Example: node twitter_automation.js process
          await processScheduledTweets();
          break;

        case 'engage':
          // Example: node twitter_automation.js engage buildinpublic 10
          const hashtag = args[1] || 'buildinpublic';
          const limit = parseInt(args[2]) || 10;
          await engageWithHashtag(hashtag, limit);
          break;

        case 'mentions':
          // Example: node twitter_automation.js mentions
          await replyToMentions(10);
          break;

        case 'analytics':
          // Example: node twitter_automation.js analytics 1234567890
          const tweetId = args[1];
          if (tweetId) {
            const analytics = await getTweetAnalytics(tweetId);
            console.log(JSON.stringify(analytics, null, 2));
          } else {
            await updateRecentAnalytics(7);
          }
          break;

        case 'top':
          // Example: node twitter_automation.js top engagementRate 5
          const metric = args[1] || 'engagementRate';
          const topLimit = parseInt(args[2]) || 5;
          await getTopPerformers(metric, topLimit);
          break;

        case 'routine':
          // Example: node twitter_automation.js routine
          await dailyEngagementRoutine();
          break;

        default:
          console.log(`
Twitter Automation for Building in Public

Setup:
  1. Create .env file with Twitter API credentials:
     TWITTER_API_KEY=your_key
     TWITTER_API_SECRET=your_secret
     TWITTER_ACCESS_TOKEN=your_token
     TWITTER_ACCESS_SECRET=your_token_secret
     TWITTER_HANDLE=@yourhandle

  2. Install dependencies:
     npm install twitter-api-v2 dotenv

Commands:
  tweet <text>              Post a tweet
  thread <tweet1> <tweet2>  Post a thread
  schedule <time> <text>    Schedule a tweet
  process                   Post scheduled tweets
  engage <hashtag> <limit>  Engage with hashtag
  mentions                  Reply to mentions
  analytics [tweetId]       Get tweet analytics
  top <metric> <limit>      Show top performing tweets
  routine                   Run daily engagement routine

Examples:
  node twitter_automation.js tweet "Building in public day 1!"
  node twitter_automation.js thread "Tweet 1" "Tweet 2" "Tweet 3"
  node twitter_automation.js schedule "2026-03-20T09:00:00" "Good morning!"
  node twitter_automation.js engage buildinpublic 10
  node twitter_automation.js analytics 1234567890
  node twitter_automation.js top engagementRate 5
  node twitter_automation.js routine

Cron Jobs:
  # Process scheduled tweets every hour
  0 * * * * cd /path/to/project && node twitter_automation.js process

  # Daily engagement routine at 10 AM
  0 10 * * * cd /path/to/project && node twitter_automation.js routine

  # Update analytics daily at midnight
  0 0 * * * cd /path/to/project && node twitter_automation.js analytics
          `);
      }
    } catch (error) {
      console.error('❌ Command failed:', error);
      process.exit(1);
    }
  })();
}

// Export functions for use as module
module.exports = {
  postTweet,
  postThread,
  scheduleTweet,
  processScheduledTweets,
  engageWithHashtag,
  replyToMentions,
  getTweetAnalytics,
  updateRecentAnalytics,
  getTopPerformers,
  dailyEngagementRoutine
};
