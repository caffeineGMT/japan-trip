require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - IMPORTANT: Raw body for Stripe webhooks must come before express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.static(__dirname));

// ===== STRIPE PAYMENT ROUTES =====
const checkoutRouter = require('./api/stripe/checkout');
const webhookRouter = require('./api/stripe/webhook');
const portalRouter = require('./api/stripe/portal');
const userAccessRouter = require('./api/user/access');

app.use('/api/stripe', checkoutRouter);
app.use('/api/stripe', webhookRouter);
app.use('/api/stripe', portalRouter);
app.use('/api/user', userAccessRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    stripe: !!process.env.STRIPE_SECRET_KEY,
    supabase: !!process.env.SUPABASE_URL
  });
});

// ===== MARKETPLACE ROUTES =====
// Serve seed data for marketplace catalog
app.get('/api/templates', (req, res) => {
  try {
    const seedData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'marketplace', 'seed-data.json'), 'utf-8')
    );
    res.json(seedData);
  } catch (error) {
    console.error('Error loading templates:', error);
    res.status(500).json({ error: 'Failed to load templates' });
  }
});

// Serve individual template details
app.get('/api/templates/:id', (req, res) => {
  try {
    const templatePath = path.join(__dirname, 'templates', `${req.params.id}.json`);

    if (fs.existsSync(templatePath)) {
      const template = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
      res.json(template);
    } else {
      // Generate template from seed data if full template doesn't exist
      const seedData = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'marketplace', 'seed-data.json'), 'utf-8')
      );
      const template = seedData.find(t => t.id === req.params.id);

      if (template) {
        // Enhance with full data for detail view
        const fullTemplate = {
          ...template,
          full_description: template.description + '\n\nThis itinerary has been carefully crafted by local experts to give you an authentic experience. All accommodations, key attractions, and transportation are included in the detailed day-by-day plan.',
          days: generateSampleDays(template),
          reviews: generateSampleReviews(template)
        };
        res.json(fullTemplate);
      } else {
        res.status(404).json({ error: 'Template not found' });
      }
    }
  } catch (error) {
    console.error('Error loading template:', error);
    res.status(500).json({ error: 'Failed to load template details' });
  }
});

// Serve template thumbnails (placeholder endpoint)
app.get('/api/templates/:id/thumbnail.jpg', (req, res) => {
  const thumbnailPath = path.join(__dirname, 'marketplace', 'thumbnails', `${req.params.id}.jpg`);

  if (fs.existsSync(thumbnailPath)) {
    res.sendFile(thumbnailPath);
  } else {
    // Send placeholder image
    res.redirect(`https://api.dicebear.com/7.x/shapes/svg?seed=${req.params.id}&backgroundColor=4f46e5,7c3aed,db2777,dc2626&size=400`);
  }
});

// Helper function to generate sample days for template detail
function generateSampleDays(template) {
  const days = [];
  const sampleActivities = {
    'tokyo-cherry-blossoms': [
      { name: 'Ueno Park Morning Walk', time: '09:00', duration: '2h', description: 'Start your day at Ueno Park, one of Tokyo\'s most famous cherry blossom spots with over 1,000 trees.' },
      { name: 'Senso-ji Temple Visit', time: '12:00', duration: '1.5h', description: 'Explore Tokyo\'s oldest temple in Asakusa, walking through the iconic Thunder Gate.' },
      { name: 'Sumida River Cruise', time: '15:00', duration: '1h', description: 'Enjoy cherry blossoms from the water on a traditional yakatabune boat.' }
    ],
    'kyoto-temples': [
      { name: 'Fushimi Inari Shrine', time: '08:00', duration: '2.5h', description: 'Hike through 10,000 vermillion torii gates up the sacred Mount Inari.' },
      { name: 'Kinkaku-ji Golden Pavilion', time: '12:00', duration: '1h', description: 'Visit the stunning gold-leaf covered temple reflecting in its pond.' },
      { name: 'Arashiyama Bamboo Grove', time: '15:00', duration: '1.5h', description: 'Walk through towering bamboo stalks in this otherworldly forest.' }
    ],
    'osaka-food-tour': [
      { name: 'Kuromon Market Breakfast', time: '09:00', duration: '1.5h', description: 'Sample fresh seafood, takoyaki, and local specialties at Osaka\'s kitchen.' },
      { name: 'Dotonbori Street Food', time: '18:00', duration: '2h', description: 'Iconic neon-lit street food paradise with the famous Glico Running Man sign.' },
      { name: 'Hozenji Yokocho Alley', time: '20:30', duration: '1.5h', description: 'Hidden alley filled with traditional izakayas and intimate dining spots.' }
    ]
  };

  const defaultActivities = [
    { name: 'Morning Exploration', time: '09:00', duration: '2h', description: 'Start your day exploring the main attractions and getting oriented.' },
    { name: 'Lunch & Local Culture', time: '12:00', duration: '2h', description: 'Experience authentic local cuisine and immerse in the culture.' },
    { name: 'Afternoon Adventure', time: '15:00', duration: '2h', description: 'Continue your journey with afternoon highlights and hidden gems.' }
  ];

  const activities = sampleActivities[template.id] || defaultActivities;

  // Generate 2 days for preview
  for (let i = 1; i <= 2; i++) {
    days.push({
      day: i,
      title: `Day ${i}: ${template.destination} ${i === 1 ? 'Arrival & Highlights' : 'Deep Dive'}`,
      activities: activities
    });
  }

  return days;
}

// Helper function to generate sample reviews
function generateSampleReviews(template) {
  const reviewTemplates = [
    { rating: 5, author: 'Sarah M.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', text: 'Absolutely incredible trip! Every detail was perfect and the itinerary was well-paced.' },
    { rating: 5, author: 'James K.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', text: 'Best vacation ever! The local recommendations were spot-on and saved us so much planning time.' },
    { rating: 4, author: 'Emily R.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', text: 'Great experience overall. Would have loved one more day to really soak it all in.' },
    { rating: 5, author: 'Michael T.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', text: 'This template made our trip so easy! Everything was organized and the suggestions were fantastic.' },
    { rating: 5, author: 'Lisa P.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa', text: 'Worth every penny! We hit all the must-see spots and discovered amazing hidden gems too.' }
  ];

  return reviewTemplates;
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📍 Marketplace: http://localhost:${PORT}/marketplace`);
  console.log(`💳 Stripe configured: ${!!process.env.STRIPE_SECRET_KEY}`);
  console.log(`🗄️  Supabase configured: ${!!process.env.SUPABASE_URL}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
