# Vercel Deployment Guide for HVAC AI Demo

This guide explains how to deploy the HVAC AI Demo application to Vercel.

## Changes Made to the Codebase

The following changes have been made to prepare the codebase for Vercel deployment:

1. Created an Express API route (`/api/openai.js`) to handle OpenAI API requests directly within Vercel
2. Removed dependency on Cloudflare Worker proxy
3. Updated the frontend code to use the new API endpoint
4. Added proper package.json configuration with scripts and dependencies
5. Added vercel.json configuration file

## Deployment Steps

### 1. Install Vercel CLI (optional)

If you want to test the deployment locally first:

```bash
npm install -g vercel
```

### 2. Log in to Vercel (if using CLI)

```bash
vercel login
```

### 3. Deploy to Vercel

#### Option 1: Using the Vercel Dashboard (recommended)

1. Go to [vercel.com](https://vercel.com) and log in or create an account
2. Click "Add New" > "Project"
3. Import your GitHub repository or upload the project files
4. Configure the project:
   - Framework Preset: Other
   - Root Directory: `v2` (if your repository contains other directories)
   - Build Command: `npm run build`
   - Output Directory: `./`
   - Install Command: `npm install`
5. Click "Deploy"

#### Option 2: Using Vercel CLI

From the `v2` directory, run:

```bash
vercel
```

Follow the prompts to configure and deploy your project.

### 4. Environment Variables (if needed)

If your application requires any environment variables (such as Supabase credentials), add them in the Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Click "Settings" > "Environment Variables"
3. Add your environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, etc.)

## Testing Your Deployment

After deployment, Vercel will provide you with a URL like `https://your-project-name.vercel.app`. Open this URL in your browser to test your application.

## Troubleshooting

If you encounter any issues:

1. Check the Vercel deployment logs in the dashboard
2. Verify that all necessary environment variables are set
3. If there are issues with the API, check the Function Logs in the Vercel dashboard

## Additional Information

- The application is configured to serve static files and handle API requests through the same Express server
- In production, all API requests are routed through the `/api/openai` endpoint
- The frontend automatically detects whether it's running locally or in production and adjusts the API URL accordingly

## Maintaining Your Deployment

When you make changes to your code:

1. Push the changes to your GitHub repository (if you connected Vercel to GitHub)
2. Vercel will automatically redeploy your application
3. Alternatively, you can manually trigger a new deployment through the Vercel dashboard or CLI
