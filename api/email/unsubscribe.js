const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/email/unsubscribe?token=<subscriber_id>
 * Unsubscribe a user from all emails
 */
router.get('/unsubscribe', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(`
        <html>
          <head><title>Invalid Unsubscribe Link</title></head>
          <body style="font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px;">
            <h1>❌ Invalid Unsubscribe Link</h1>
            <p>The unsubscribe link appears to be invalid or expired.</p>
          </body>
        </html>
      `);
    }

    // Update subscriber status
    const { data: subscriber, error } = await supabase
      .from('email_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('id', token)
      .select()
      .single();

    if (error || !subscriber) {
      return res.status(404).send(`
        <html>
          <head><title>Subscriber Not Found</title></head>
          <body style="font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px;">
            <h1>❌ Subscriber Not Found</h1>
            <p>We couldn't find this subscription in our system.</p>
          </body>
        </html>
      `);
    }

    console.log(`📧 Unsubscribed: ${subscriber.email}`);

    res.send(`
      <html>
        <head>
          <title>Unsubscribed Successfully</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              text-align: center;
            }
            .success {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 30px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .message {
              color: #374151;
              line-height: 1.6;
            }
            a {
              color: #667eea;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="success">
            <h1>✓ Successfully Unsubscribed</h1>
            <p>You've been removed from our email list.</p>
          </div>
          <div class="message">
            <p>You won't receive any more emails from Japan Trip Companion.</p>
            <p>We're sorry to see you go! If you change your mind, you can always <a href="${process.env.APP_URL}">sign up again</a>.</p>
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              Have feedback? <a href="mailto:hello@japantripcompanion.com">Let us know</a> why you unsubscribed.
            </p>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body style="font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px;">
          <h1>❌ Error</h1>
          <p>Something went wrong. Please try again or contact support.</p>
        </body>
      </html>
    `);
  }
});

/**
 * POST /api/email/unsubscribe
 * Unsubscribe via API
 */
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { data: subscriber, error } = await supabase
      .from('email_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase())
      .select()
      .single();

    if (error || !subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    console.log(`📧 Unsubscribed via API: ${email}`);

    res.json({
      success: true,
      message: 'Successfully unsubscribed'
    });

  } catch (error) {
    console.error('API unsubscribe error:', error);
    res.status(500).json({
      error: 'Failed to unsubscribe',
      message: error.message
    });
  }
});

module.exports = router;
