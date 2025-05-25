/**
 * Express server for HVAC AI Demo
 * Used for local development and Vercel deployment
 */

const express = require('express');
const path = require('path');
const openaiRouter = require('./api/openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request body
app.use(express.json({ limit: '50mb' }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Use the OpenAI API route
app.use('/api/openai', openaiRouter);

// Serve index.html for all other routes (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
