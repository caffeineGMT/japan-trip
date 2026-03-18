// API endpoint for Chrome Extension - Save POI to trip
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// POST /api/extension/save-poi
router.post('/save-poi', async (req, res) => {
  try {
    const poiData = req.body;

    // Validate required fields
    if (!poiData.name) {
      return res.status(400).json({
        success: false,
        error: 'Place name is required'
      });
    }

    // Add metadata
    const savedPOI = {
      ...poiData,
      savedAt: new Date().toISOString(),
      id: generateId(),
      status: 'pending' // pending, added, archived
    };

    // Save to JSON file
    const poisFile = path.join(__dirname, '../../data/saved-pois.json');

    let pois = [];
    try {
      const fileContent = await fs.readFile(poisFile, 'utf-8');
      pois = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist yet, start with empty array
      console.log('Creating new saved-pois.json file');
    }

    // Add new POI at the beginning
    pois.unshift(savedPOI);

    // Keep only last 100 POIs to prevent file bloat
    if (pois.length > 100) {
      pois = pois.slice(0, 100);
    }

    // Write back to file
    await fs.writeFile(poisFile, JSON.stringify(pois, null, 2));

    console.log(`[Extension] Saved POI: ${savedPOI.name} from ${savedPOI.source}`);

    res.json({
      success: true,
      poi: savedPOI,
      message: 'Place saved successfully! You can add it to your itinerary from the dashboard.'
    });

  } catch (error) {
    console.error('[Extension] Error saving POI:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save place. Please try again.'
    });
  }
});

// GET /api/extension/saved-pois - Get all saved POIs
router.get('/saved-pois', async (req, res) => {
  try {
    const poisFile = path.join(__dirname, '../../data/saved-pois.json');

    let pois = [];
    try {
      const fileContent = await fs.readFile(poisFile, 'utf-8');
      pois = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist yet
      pois = [];
    }

    // Filter by status if provided
    const status = req.query.status;
    if (status) {
      pois = pois.filter(poi => poi.status === status);
    }

    res.json({
      success: true,
      pois,
      count: pois.length
    });

  } catch (error) {
    console.error('[Extension] Error fetching POIs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch saved places'
    });
  }
});

// PATCH /api/extension/poi/:id - Update POI status
router.patch('/poi/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'added', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const poisFile = path.join(__dirname, '../../data/saved-pois.json');

    let pois = [];
    try {
      const fileContent = await fs.readFile(poisFile, 'utf-8');
      pois = JSON.parse(fileContent);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'No saved places found'
      });
    }

    // Find and update POI
    const poiIndex = pois.findIndex(p => p.id === id);
    if (poiIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Place not found'
      });
    }

    pois[poiIndex].status = status;
    pois[poiIndex].updatedAt = new Date().toISOString();

    // Write back to file
    await fs.writeFile(poisFile, JSON.stringify(pois, null, 2));

    res.json({
      success: true,
      poi: pois[poiIndex]
    });

  } catch (error) {
    console.error('[Extension] Error updating POI:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update place'
    });
  }
});

// DELETE /api/extension/poi/:id - Delete a saved POI
router.delete('/poi/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const poisFile = path.join(__dirname, '../../data/saved-pois.json');

    let pois = [];
    try {
      const fileContent = await fs.readFile(poisFile, 'utf-8');
      pois = JSON.parse(fileContent);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'No saved places found'
      });
    }

    // Filter out the POI
    const originalLength = pois.length;
    pois = pois.filter(p => p.id !== id);

    if (pois.length === originalLength) {
      return res.status(404).json({
        success: false,
        error: 'Place not found'
      });
    }

    // Write back to file
    await fs.writeFile(poisFile, JSON.stringify(pois, null, 2));

    res.json({
      success: true,
      message: 'Place deleted successfully'
    });

  } catch (error) {
    console.error('[Extension] Error deleting POI:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete place'
    });
  }
});

// Helper function to generate unique ID
function generateId() {
  return `poi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = router;
