require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// Serve template JSON
app.get('/api/templates/:id', (req, res) => {
  try {
    const templatePath = path.join(__dirname, 'templates', `${req.params.id}.json`);
    if (fs.existsSync(templatePath)) {
      const template = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
      res.json(template);
    } else {
      res.status(404).json({ error: 'Template not found' });
    }
  } catch (error) {
    console.error('Error loading template:', error);
    res.status(500).json({ error: 'Failed to load template' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
