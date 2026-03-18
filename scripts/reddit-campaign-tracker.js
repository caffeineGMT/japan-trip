/**
 * Reddit Campaign Tracker
 *
 * Helps track and manage the Reddit Value Post Blitz campaign
 * Updates CSV files with metrics and provides analytics
 */

const fs = require('fs');
const path = require('path');

const TRACKING_DIR = path.join(__dirname, '..', 'marketing', 'reddit', 'tracking');
const CAMPAIGN_TRACKER = path.join(TRACKING_DIR, 'campaign-tracker.csv');
const RESPONSE_TRACKER = path.join(TRACKING_DIR, 'response-tracker.csv');
const FUNNEL_TRACKER = path.join(TRACKING_DIR, 'conversion-funnel.csv');

// Helper function to parse CSV
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');

    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = values[i] || '';
        });
        return obj;
    });
}

// Helper function to write CSV
function writeCSV(filePath, data, headers) {
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => row[h] || '').join(','))
    ].join('\n');

    fs.writeFileSync(filePath, csvContent, 'utf8');
}

// Add a new post to campaign tracker
function addPost(postData) {
    const data = parseCSV(CAMPAIGN_TRACKER);
    const headers = Object.keys(data[0]);

    const newPost = {
        Date: new Date().toISOString().split('T')[0],
        Post_ID: `post_${String(data.length + 1).padStart(3, '0')}`,
        Post_Title: postData.title,
        Post_Type: postData.type,
        Post_URL: postData.url || '',
        Upvotes: 0,
        Comments: 0,
        Views_Est: 0,
        Site_Clicks: 0,
        DMs_Received: 0,
        Beta_Signups: 0,
        Paid_Conversions: 0,
        Notes: postData.notes || ''
    };

    data.push(newPost);
    writeCSV(CAMPAIGN_TRACKER, data, headers);

    console.log(`✅ Added post: ${newPost.Post_Title}`);
    return newPost;
}

// Update post metrics
function updatePost(postId, metrics) {
    const data = parseCSV(CAMPAIGN_TRACKER);
    const headers = Object.keys(data[0]);

    const post = data.find(p => p.Post_ID === postId);
    if (!post) {
        console.error(`❌ Post ${postId} not found`);
        return null;
    }

    Object.assign(post, metrics);
    writeCSV(CAMPAIGN_TRACKER, data, headers);

    console.log(`✅ Updated post ${postId}:`, metrics);
    return post;
}

// Add a new response to response tracker
function addResponse(responseData) {
    const data = parseCSV(RESPONSE_TRACKER);
    const headers = Object.keys(data[0]);

    // Remove sample row if it exists
    const filteredData = data.filter(r => r.Thread_URL);

    const newResponse = {
        Date: new Date().toISOString().split('T')[0],
        Thread_URL: responseData.threadUrl,
        Response_Type: responseData.type,
        Template_Used: responseData.template,
        Response_URL: responseData.responseUrl || '',
        Upvotes: 0,
        Replies: 0,
        DMs_From_Thread: 0,
        Beta_Signups: 0,
        Notes: responseData.notes || ''
    };

    filteredData.push(newResponse);
    writeCSV(RESPONSE_TRACKER, filteredData, headers);

    console.log(`✅ Added response: ${newResponse.Response_Type}`);
    return newResponse;
}

// Update weekly funnel metrics
function updateWeeklyFunnel(week, metrics) {
    const data = parseCSV(FUNNEL_TRACKER);
    const headers = Object.keys(data[0]);

    const weekData = data.find(w => w.Week === `Week_${week}`);
    if (!weekData) {
        console.error(`❌ Week ${week} not found`);
        return null;
    }

    Object.assign(weekData, metrics);

    // Calculate conversion rate
    if (metrics.Site_Visits && metrics.Beta_Signups) {
        const rate = ((parseInt(metrics.Beta_Signups) / parseInt(metrics.Site_Visits)) * 100).toFixed(1);
        weekData.Conversion_Rate = `${rate}%`;
    }

    writeCSV(FUNNEL_TRACKER, data, headers);

    console.log(`✅ Updated Week ${week}:`, metrics);
    return weekData;
}

// Generate campaign summary
function generateSummary() {
    const posts = parseCSV(CAMPAIGN_TRACKER);
    const responses = parseCSV(RESPONSE_TRACKER).filter(r => r.Thread_URL);
    const funnel = parseCSV(FUNNEL_TRACKER);

    const totalPosts = posts.length;
    const totalUpvotes = posts.reduce((sum, p) => sum + parseInt(p.Upvotes || 0), 0);
    const totalViews = posts.reduce((sum, p) => sum + parseInt(p.Views_Est || 0), 0);
    const totalSiteClicks = posts.reduce((sum, p) => sum + parseInt(p.Site_Clicks || 0), 0);
    const totalDMs = posts.reduce((sum, p) => sum + parseInt(p.DMs_Received || 0), 0);
    const totalSignups = posts.reduce((sum, p) => sum + parseInt(p.Beta_Signups || 0), 0);
    const totalPaid = posts.reduce((sum, p) => sum + parseInt(p.Paid_Conversions || 0), 0);

    const totalResponses = responses.length;

    const summary = {
        campaign: {
            totalPosts,
            totalResponses,
            totalUpvotes,
            totalViews,
            totalSiteClicks,
            totalDMs,
            totalSignups,
            totalPaid,
            revenue: totalPaid * 15
        },
        topPosts: posts
            .sort((a, b) => parseInt(b.Upvotes || 0) - parseInt(a.Upvotes || 0))
            .slice(0, 5)
            .map(p => ({
                title: p.Post_Title,
                upvotes: p.Upvotes,
                views: p.Views_Est,
                signups: p.Beta_Signups
            })),
        conversionRates: {
            viewsToClicks: totalViews > 0 ? ((totalSiteClicks / totalViews) * 100).toFixed(1) + '%' : '0%',
            clicksToSignups: totalSiteClicks > 0 ? ((totalSignups / totalSiteClicks) * 100).toFixed(1) + '%' : '0%',
            signupsToPaid: totalSignups > 0 ? ((totalPaid / totalSignups) * 100).toFixed(1) + '%' : '0%'
        }
    };

    console.log('\n📊 CAMPAIGN SUMMARY\n');
    console.log('Posts:', summary.campaign.totalPosts);
    console.log('Responses:', summary.campaign.totalResponses);
    console.log('Total Upvotes:', summary.campaign.totalUpvotes);
    console.log('Total Views:', summary.campaign.totalViews);
    console.log('Site Clicks:', summary.campaign.totalSiteClicks);
    console.log('DMs Received:', summary.campaign.totalDMs);
    console.log('Beta Signups:', summary.campaign.totalSignups);
    console.log('Paid Conversions:', summary.campaign.totalPaid);
    console.log('Revenue:', '$' + summary.campaign.revenue);
    console.log('\n🎯 CONVERSION RATES\n');
    console.log('Views → Clicks:', summary.conversionRates.viewsToClicks);
    console.log('Clicks → Signups:', summary.conversionRates.clicksToSignups);
    console.log('Signups → Paid:', summary.conversionRates.signupsToPaid);
    console.log('\n🏆 TOP POSTS\n');
    summary.topPosts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.title}`);
        console.log(`   ${p.upvotes} upvotes, ${p.views} views, ${p.signups} signups\n`);
    });

    return summary;
}

// CLI Interface
const command = process.argv[2];

switch (command) {
    case 'add-post':
        addPost({
            title: process.argv[3],
            type: process.argv[4],
            notes: process.argv[5]
        });
        break;

    case 'update-post':
        updatePost(process.argv[3], {
            Upvotes: process.argv[4],
            Comments: process.argv[5],
            Views_Est: parseInt(process.argv[4] || 0) * 20,
            Site_Clicks: process.argv[6],
            DMs_Received: process.argv[7],
            Beta_Signups: process.argv[8]
        });
        break;

    case 'add-response':
        addResponse({
            threadUrl: process.argv[3],
            type: process.argv[4],
            template: process.argv[5]
        });
        break;

    case 'update-week':
        updateWeeklyFunnel(process.argv[3], {
            Post_Views: process.argv[4],
            Site_Visits: process.argv[5],
            Beta_Signups: process.argv[6],
            Paid_Conversions: process.argv[7],
            Revenue: parseInt(process.argv[7] || 0) * 15
        });
        break;

    case 'summary':
        generateSummary();
        break;

    default:
        console.log(`
Reddit Campaign Tracker Usage:

# Add a new post
node scripts/reddit-campaign-tracker.js add-post "Post Title" "Post Type" "Notes"

# Update post metrics
node scripts/reddit-campaign-tracker.js update-post post_001 50 25 120 5 3

# Add a response
node scripts/reddit-campaign-tracker.js add-response "https://reddit.com/..." "First-time visitor" "Template 1"

# Update weekly funnel
node scripts/reddit-campaign-tracker.js update-week 1 900 80 8 0

# Generate summary
node scripts/reddit-campaign-tracker.js summary
        `);
}

module.exports = {
    addPost,
    updatePost,
    addResponse,
    updateWeeklyFunnel,
    generateSummary
};
