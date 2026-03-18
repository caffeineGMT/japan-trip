// Referral System Routes
// Centralized router for all referral endpoints

const express = require('express');
const router = express.Router();

// Import individual route handlers
const generateCode = require('./generate-code');
const trackClick = require('./track-click');
const applyDiscount = require('./apply-discount');
const stats = require('./stats');
const leaderboard = require('./leaderboard');
const markConversion = require('./mark-conversion');

// Mount routes
router.post('/generate-code', generateCode);
router.post('/track-click', trackClick);
router.post('/apply-discount', applyDiscount);
router.get('/stats', stats);
router.get('/leaderboard', leaderboard);
router.post('/mark-conversion', markConversion);

module.exports = router;
