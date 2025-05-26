/**
 * OpenAI API Proxy for HVAC AI Demo
 * 
 * This Vercel API route handles OpenAI API requests directly,
 * eliminating the need for the Cloudflare proxy.
 */

// Import express and node-fetch for making HTTP requests
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const router = express.Router();
require('dotenv').config();

// OpenAI API endpoint
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Get API key from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Main handler function
async function handleOpenAIRequest(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests to match OpenAI's API
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }
  
  // Use the server's API key from environment variables
  let apiKey = `Bearer ${OPENAI_API_KEY}`;
  
  // If no API key in environment, return an error
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not configured in environment variables');
    return res.status(500).json({ error: { message: 'Server configuration error' } });
  }
  
  try {
    // Forward the request to OpenAI with the server's API key
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    console.log('OpenAI API response status:', response.status);
    
    // Get the response content
    const responseText = await response.text();
    
    // Try to parse as JSON, but handle case where it's not valid JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse OpenAI response as JSON:', responseText.substring(0, 200));
      return res.status(500).json({ error: { message: 'Invalid response from OpenAI API' } });
    }
    
    // Always pass through the original status code from OpenAI
    return res.status(response.status).json(data);
  } catch (error) {
    // Handle errors
    console.error('API route error:', error.message);
    return res.status(500).json({ 
      error: {
        message: `Server error: ${error.message}`,
        type: 'server_error'
      }
    });
  }
}

// Export the handler function
router.post('/', handleOpenAIRequest);

module.exports = router;
