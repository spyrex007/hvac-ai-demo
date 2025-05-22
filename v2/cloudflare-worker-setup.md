# Cloudflare Worker Setup for HVAC AI Demo

This guide explains how to deploy the Cloudflare Worker that handles CORS issues for your HVAC AI application.

## What This Solves

The Cloudflare Worker acts as a secure proxy between your frontend application and the OpenAI API, solving:

1. CORS (Cross-Origin Resource Sharing) issues
2. API key security (can be stored in Cloudflare's environment variables)
3. Request reliability

## Deployment Steps

### 1. Sign Up for Cloudflare Workers

If you don't already have a Cloudflare account:
- Go to [workers.cloudflare.com](https://workers.cloudflare.com/)
- Sign up for a free account

### 2. Install Wrangler CLI

Wrangler is Cloudflare's command-line tool for managing Workers:

```bash
npm install -g wrangler
```

### 3. Authenticate Wrangler

```bash
wrangler login
```

### 4. Create a New Worker Project

```bash
# Create a new directory for your worker
mkdir openai-proxy-worker
cd openai-proxy-worker

# Initialize a new worker project
wrangler init
```

### 5. Replace the Worker Code

Replace the generated `index.js` with the contents of `openai-proxy-worker.js` from this repository.

### 6. Configure Your Worker

Create or edit `wrangler.toml` to include:

```toml
name = "openai-proxy-worker"
main = "index.js"
compatibility_date = "2023-01-01"

[vars]
# You can optionally store your API key here for added security
# OPENAI_API_KEY = "your-api-key-here"
```

### 7. Update Allowed Origins

In the worker code, update the `ALLOWED_ORIGINS` array to include your domain:

```javascript
const ALLOWED_ORIGINS = [
  'https://hvachat.sitefari.com',
  'http://localhost:3000',
  // Add any other domains that should be allowed to access the worker
];
```

### 8. Deploy the Worker

```bash
wrangler publish
```

After deployment, you'll receive a URL like `https://openai-proxy-worker.your-subdomain.workers.dev`

### 9. Update Your Frontend Code

In your `app.js` file, update the `cloudflareWorkerUrl` variable with your deployed worker URL:

```javascript
const cloudflareWorkerUrl = 'https://openai-proxy-worker.your-subdomain.workers.dev';
```

## Security Considerations

For production use, consider these security enhancements:

1. **Store API Key in Cloudflare**: Instead of sending the API key from the frontend, store it in Cloudflare's environment variables:
   ```bash
   wrangler secret put OPENAI_API_KEY
   ```

2. **Add Custom Domain**: For a more professional setup, add a custom domain to your worker.

3. **Rate Limiting**: Consider adding rate limiting to prevent abuse.

## Troubleshooting

If you encounter issues:

1. Check the Cloudflare Worker logs in the Cloudflare dashboard
2. Verify that your domain is correctly listed in the `ALLOWED_ORIGINS` array
3. Test the worker directly using tools like Postman or curl

For more help, refer to [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/).
