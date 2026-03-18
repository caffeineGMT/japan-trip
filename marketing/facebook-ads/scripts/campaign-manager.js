/**
 * Facebook Ads Campaign Manager
 * Automates campaign setup, monitoring, and optimization
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class FacebookCampaignManager {
  constructor(config) {
    this.accessToken = config.accessToken;
    this.adAccountId = config.adAccountId;
    this.pixelId = config.pixelId;
    this.apiVersion = config.apiVersion || 'v18.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  /**
   * Create awareness campaign (Campaign 1)
   */
  async createAwarenessCampaign() {
    console.log('📢 Creating Awareness Campaign...');

    const campaignConfig = require('../campaigns/campaign-1-awareness.json');

    // Step 1: Create Campaign
    const campaign = await this.createCampaign({
      name: campaignConfig.campaignName,
      objective: 'OUTCOME_AWARENESS',
      status: 'PAUSED', // Start paused for review
      special_ad_categories: []
    });

    console.log('✓ Campaign created:', campaign.id);

    // Step 2: Create Custom Audiences
    await this.createCustomAudiences();

    // Step 3: Create Ad Sets
    const adSets = [];
    for (const adSetConfig of campaignConfig.adSets) {
      const adSet = await this.createAdSet(campaign.id, {
        name: adSetConfig.name,
        optimization_goal: 'REACH',
        billing_event: 'IMPRESSIONS',
        bid_amount: 500, // $5.00 in cents
        daily_budget: adSetConfig.budget * 100, // Convert to cents
        targeting: this.buildTargeting(campaignConfig.targeting, adSetConfig.locations),
        promoted_object: {
          pixel_id: this.pixelId,
          custom_event_type: 'VIEW_CONTENT'
        }
      });

      adSets.push(adSet);
      console.log('✓ Ad Set created:', adSet.id);
    }

    // Step 4: Create Ads
    for (const creative of campaignConfig.creatives) {
      const adCreative = await this.createCarouselCreative(creative);

      for (const adSet of adSets) {
        const ad = await this.createAd(adSet.id, adCreative.id, creative);
        console.log('✓ Ad created:', ad.id);
      }
    }

    console.log('✅ Awareness campaign setup complete!');
    return campaign;
  }

  /**
   * Create retargeting campaign (Campaign 2)
   */
  async createRetargetingCampaign() {
    console.log('🎯 Creating Retargeting Campaign...');

    const campaignConfig = require('../campaigns/campaign-2-retargeting.json');

    // Step 1: Create Campaign
    const campaign = await this.createCampaign({
      name: campaignConfig.campaignName,
      objective: 'OUTCOME_LEADS',
      status: 'PAUSED',
      special_ad_categories: []
    });

    console.log('✓ Campaign created:', campaign.id);

    // Step 2: Create Retargeting Audiences
    await this.createRetargetingAudiences();

    // Step 3: Create Ad Sets with different audiences
    const adSets = [];
    for (const adSetConfig of campaignConfig.adSets) {
      const adSet = await this.createAdSet(campaign.id, {
        name: adSetConfig.name,
        optimization_goal: 'OFFSITE_CONVERSIONS',
        billing_event: 'IMPRESSIONS',
        bid_strategy: 'LOWEST_COST_WITH_BID_CAP',
        bid_amount: 2500, // $25.00 in cents
        daily_budget: adSetConfig.budget * 100,
        targeting: this.buildRetargetingTargeting(adSetConfig.audience),
        promoted_object: {
          pixel_id: this.pixelId,
          custom_event_type: 'LEAD'
        }
      });

      adSets.push(adSet);
      console.log('✓ Ad Set created:', adSet.id);
    }

    // Step 4: Create Video & Image Ads
    for (const creative of campaignConfig.creatives) {
      const adCreative = await this.createAdCreative(creative);

      // Match ad sets to creatives
      const matchingAdSets = adSets.filter(as =>
        as.name.toLowerCase().includes(creative.id.split('_')[1])
      );

      for (const adSet of matchingAdSets) {
        const ad = await this.createAd(adSet.id, adCreative.id, creative);
        console.log('✓ Ad created:', ad.id);
      }
    }

    console.log('✅ Retargeting campaign setup complete!');
    return campaign;
  }

  /**
   * Create custom audiences for targeting
   */
  async createCustomAudiences() {
    const audiences = [
      {
        name: 'cherryBlossomSearchers_30d',
        description: 'Users who searched for cherry blossom Japan in past 30 days',
        rule: {
          inclusions: {
            operator: 'or',
            rules: [
              {
                event_sources: [{ id: this.pixelId, type: 'pixel' }],
                retention_seconds: 2592000, // 30 days
                filter: {
                  operator: 'and',
                  filters: [
                    {
                      field: 'event',
                      operator: 'eq',
                      value: 'CherryBlossomSearcher'
                    }
                  ]
                }
              }
            ]
          }
        }
      },
      {
        name: 'websiteVisitors_7d',
        description: 'Website visitors in past 7 days',
        rule: {
          inclusions: {
            operator: 'or',
            rules: [
              {
                event_sources: [{ id: this.pixelId, type: 'pixel' }],
                retention_seconds: 604800, // 7 days
                filter: {
                  operator: 'and',
                  filters: [
                    {
                      field: 'event',
                      operator: 'eq',
                      value: 'PageView'
                    }
                  ]
                }
              }
            ]
          }
        }
      },
      {
        name: 'signupAbandoners_7d',
        description: 'Users who started signup but did not complete',
        rule: {
          inclusions: {
            operator: 'or',
            rules: [
              {
                event_sources: [{ id: this.pixelId, type: 'pixel' }],
                retention_seconds: 604800,
                filter: {
                  operator: 'and',
                  filters: [
                    {
                      field: 'event',
                      operator: 'eq',
                      value: 'InitiateCheckout'
                    }
                  ]
                }
              }
            ]
          },
          exclusions: {
            operator: 'or',
            rules: [
              {
                event_sources: [{ id: this.pixelId, type: 'pixel' }],
                retention_seconds: 604800,
                filter: {
                  operator: 'and',
                  filters: [
                    {
                      field: 'event',
                      operator: 'eq',
                      value: 'CompleteRegistration'
                    }
                  ]
                }
              }
            ]
          }
        }
      },
      {
        name: 'pricingPageViewers_14d',
        description: 'Users who viewed pricing page',
        rule: {
          inclusions: {
            operator: 'or',
            rules: [
              {
                event_sources: [{ id: this.pixelId, type: 'pixel' }],
                retention_seconds: 1209600, // 14 days
                filter: {
                  operator: 'and',
                  filters: [
                    {
                      field: 'url',
                      operator: 'i_contains',
                      value: '/pricing'
                    }
                  ]
                }
              }
            ]
          }
        }
      }
    ];

    for (const audienceConfig of audiences) {
      try {
        const audience = await this.apiRequest('POST', `act_${this.adAccountId}/customaudiences`, {
          name: audienceConfig.name,
          description: audienceConfig.description,
          subtype: 'CUSTOM',
          rule: JSON.stringify(audienceConfig.rule)
        });
        console.log('✓ Custom audience created:', audienceConfig.name);
      } catch (error) {
        console.error('✗ Failed to create audience:', audienceConfig.name, error.message);
      }
    }
  }

  /**
   * Create retargeting audiences
   */
  async createRetargetingAudiences() {
    await this.createCustomAudiences();

    // Create lookalike audiences
    const lookalikes = [
      {
        name: 'Lookalike - Website Visitors 1%',
        origin_audience: 'websiteVisitors_90d',
        ratio: 0.01,
        country: 'US'
      }
    ];

    for (const config of lookalikes) {
      try {
        const lookalike = await this.apiRequest('POST', `act_${this.adAccountId}/customaudiences`, {
          name: config.name,
          subtype: 'LOOKALIKE',
          lookalike_spec: {
            ratio: config.ratio,
            country: config.country,
            origin: { id: config.origin_audience }
          }
        });
        console.log('✓ Lookalike audience created:', config.name);
      } catch (error) {
        console.error('✗ Failed to create lookalike:', config.name, error.message);
      }
    }
  }

  /**
   * Build targeting spec
   */
  buildTargeting(config, locations = null) {
    const targeting = {
      age_min: config.demographics.ageMin,
      age_max: config.demographics.ageMax,
      geo_locations: {
        countries: locations || config.locations.countries,
        location_types: ['home']
      }
    };

    if (config.interests && config.interests.length > 0) {
      targeting.flexible_spec = [
        {
          interests: config.interests.map(interest => ({ name: interest }))
        }
      ];
    }

    if (config.customAudiences) {
      targeting.custom_audiences = config.customAudiences.include;
      targeting.excluded_custom_audiences = config.customAudiences.exclude;
    }

    return targeting;
  }

  /**
   * Build retargeting targeting spec
   */
  buildRetargetingTargeting(audienceName) {
    return {
      age_min: 25,
      age_max: 45,
      geo_locations: {
        countries: ['US', 'CA', 'GB', 'AU']
      },
      custom_audiences: [audienceName]
    };
  }

  /**
   * Create carousel ad creative
   */
  async createCarouselCreative(config) {
    const childAttachments = config.cards.map((card, index) => ({
      link: card.link,
      name: card.title,
      description: card.description,
      image_hash: `IMAGE_HASH_${index}`, // Replace with actual uploaded image hash
      call_to_action: {
        type: config.callToAction || 'LEARN_MORE',
        value: {
          link: card.link
        }
      }
    }));

    return await this.apiRequest('POST', `act_${this.adAccountId}/adcreatives`, {
      name: config.id,
      object_story_spec: {
        page_id: 'YOUR_PAGE_ID',
        link_data: {
          link: config.cards[0].link,
          message: config.primaryText,
          child_attachments: childAttachments,
          multi_share_optimized: true,
          call_to_action: {
            type: config.callToAction || 'LEARN_MORE'
          }
        }
      }
    });
  }

  /**
   * Create ad creative (video or image)
   */
  async createAdCreative(config) {
    if (config.format === 'VIDEO') {
      return await this.apiRequest('POST', `act_${this.adAccountId}/adcreatives`, {
        name: config.id,
        object_story_spec: {
          page_id: 'YOUR_PAGE_ID',
          video_data: {
            video_id: 'VIDEO_ID', // Replace with uploaded video ID
            message: config.primaryText,
            title: config.headline,
            link_description: config.description,
            call_to_action: {
              type: config.callToAction || 'SIGN_UP'
            }
          }
        }
      });
    } else if (config.format === 'SINGLE_IMAGE') {
      return await this.apiRequest('POST', `act_${this.adAccountId}/adcreatives`, {
        name: config.id,
        object_story_spec: {
          page_id: 'YOUR_PAGE_ID',
          link_data: {
            image_hash: 'IMAGE_HASH', // Replace with uploaded image hash
            link: config.link || 'https://japan-trip.com/early-access',
            message: config.primaryText,
            name: config.headline,
            description: config.description,
            call_to_action: {
              type: config.callToAction || 'SIGN_UP'
            }
          }
        }
      });
    } else if (config.format === 'CAROUSEL') {
      return await this.createCarouselCreative(config);
    }
  }

  /**
   * Create campaign
   */
  async createCampaign(params) {
    return await this.apiRequest('POST', `act_${this.adAccountId}/campaigns`, params);
  }

  /**
   * Create ad set
   */
  async createAdSet(campaignId, params) {
    return await this.apiRequest('POST', `act_${this.adAccountId}/adsets`, {
      campaign_id: campaignId,
      ...params
    });
  }

  /**
   * Create ad
   */
  async createAd(adSetId, creativeId, config) {
    return await this.apiRequest('POST', `act_${this.adAccountId}/ads`, {
      name: config.headline || config.id,
      adset_id: adSetId,
      creative: { creative_id: creativeId },
      status: 'PAUSED'
    });
  }

  /**
   * Get campaign insights
   */
  async getCampaignInsights(campaignId, datePreset = 'last_7d') {
    return await this.apiRequest('GET', `${campaignId}/insights`, {
      date_preset: datePreset,
      fields: 'impressions,clicks,ctr,cpc,spend,actions,action_values,conversions'
    });
  }

  /**
   * Optimize campaigns based on performance
   */
  async optimizeCampaigns() {
    console.log('🔧 Running campaign optimization...');

    const campaigns = await this.apiRequest('GET', `act_${this.adAccountId}/campaigns`, {
      fields: 'id,name,status'
    });

    for (const campaign of campaigns.data) {
      const insights = await this.getCampaignInsights(campaign.id);

      if (insights.data && insights.data.length > 0) {
        const data = insights.data[0];
        const cac = parseFloat(data.spend) / (data.actions?.find(a => a.action_type === 'lead')?.value || 1);

        console.log(`Campaign: ${campaign.name}`);
        console.log(`  Spend: $${data.spend}`);
        console.log(`  CAC: $${cac.toFixed(2)}`);

        // Pause if CAC > $50
        if (cac > 50) {
          await this.updateCampaign(campaign.id, { status: 'PAUSED' });
          console.log(`  ⚠️ Paused due to high CAC ($${cac.toFixed(2)})`);
        }

        // Increase budget if CAC < $30 and conversions > 5
        const leads = data.actions?.find(a => a.action_type === 'lead')?.value || 0;
        if (cac < 30 && leads > 5) {
          console.log(`  ✅ High performer - consider increasing budget`);
        }
      }
    }

    console.log('✅ Optimization complete');
  }

  /**
   * Update campaign
   */
  async updateCampaign(campaignId, params) {
    return await this.apiRequest('POST', campaignId, params);
  }

  /**
   * Make API request to Facebook Graph API
   */
  async apiRequest(method, endpoint, params = {}) {
    const queryParams = new URLSearchParams({
      access_token: this.accessToken,
      ...params
    });

    const url = `${this.baseUrl}/${endpoint}?${queryParams.toString()}`;

    return new Promise((resolve, reject) => {
      const req = https.request(url, { method }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.error) {
              reject(new Error(json.error.message));
            } else {
              resolve(json);
            }
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  /**
   * Generate daily report
   */
  async generateDailyReport() {
    console.log('📊 Generating daily report...');

    const campaigns = await this.apiRequest('GET', `act_${this.adAccountId}/campaigns`, {
      fields: 'id,name,status'
    });

    const report = {
      date: new Date().toISOString().split('T')[0],
      campaigns: []
    };

    for (const campaign of campaigns.data) {
      const insights = await this.getCampaignInsights(campaign.id, 'yesterday');

      if (insights.data && insights.data.length > 0) {
        report.campaigns.push({
          name: campaign.name,
          ...insights.data[0]
        });
      }
    }

    // Save report
    const reportPath = path.join(__dirname, '../analytics/reports', `daily-${report.date}.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('✓ Report saved:', reportPath);
    return report;
  }
}

// Export
module.exports = FacebookCampaignManager;

// CLI usage
if (require.main === module) {
  const config = {
    accessToken: process.env.FB_ACCESS_TOKEN,
    adAccountId: process.env.FB_AD_ACCOUNT_ID,
    pixelId: process.env.FB_PIXEL_ID
  };

  const manager = new FacebookCampaignManager(config);

  const command = process.argv[2];

  switch (command) {
    case 'create-awareness':
      manager.createAwarenessCampaign();
      break;
    case 'create-retargeting':
      manager.createRetargetingCampaign();
      break;
    case 'optimize':
      manager.optimizeCampaigns();
      break;
    case 'report':
      manager.generateDailyReport();
      break;
    default:
      console.log('Usage: node campaign-manager.js [create-awareness|create-retargeting|optimize|report]');
  }
}
