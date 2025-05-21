/**
 * OpenAI API Proxy for HVAC AI Demo
 * 
 * This Cloudflare Worker handles CORS issues by proxying requests to OpenAI's API.
 * It adds the necessary CORS headers and forwards the API key securely.
 */

// Configure allowed origins - add your domain(s) here
const ALLOWED_ORIGINS = [
  'https://hvachat.sitefari.com',
  'http://localhost:3000',  // For local development
  'http://127.0.0.1:5500'   // For local development with Live Server
];

// OpenAI API endpoint
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function handleRequest(request) {
  // Extract the origin from the request
  const origin = request.headers.get('Origin');
  
  // Check if the origin is allowed
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return handleCors(isAllowedOrigin, origin);
  }
  
  // Only allow POST requests to match OpenAI's API
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  // Get API key from the request headers or from environment variable
  let apiKey = request.headers.get('Authorization');
  
  // If no API key in headers, try to use the one stored in Cloudflare environment
  if (!apiKey || !apiKey.startsWith('Bearer ')) {
    // Use environment variable if available (more secure)
    // You'll need to set this in your Cloudflare Worker settings
    apiKey = `Bearer ${OPENAI_API_KEY}`;
  }
  
  // If still no API key, return an error
  if (!apiKey || !apiKey.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'API key is required' }),
      {
        status: 401,
        headers: getCorsHeaders(isAllowedOrigin, origin)
      }
    );
  }
  
  try {
    // Clone the request to modify it
    const requestBody = await request.json();
    
    // Forward the request to OpenAI
    const openaiResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    // Get the response from OpenAI
    const data = await openaiResponse.json();
    
    // Return the response with CORS headers
    return new Response(
      JSON.stringify(data),
      {
        status: openaiResponse.status,
        headers: {
          ...getCorsHeaders(isAllowedOrigin, origin),
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    // Handle errors
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...getCorsHeaders(isAllowedOrigin, origin),
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// Handle CORS preflight requests
function handleCors(isAllowedOrigin, origin) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(isAllowedOrigin, origin)
  });
}

// Get CORS headers based on origin
function getCorsHeaders(isAllowedOrigin, origin) {
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
  
  // Only add the Allow-Origin header if the origin is allowed
  if (isAllowedOrigin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  
  return headers;
}

// Listen for fetch events
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
