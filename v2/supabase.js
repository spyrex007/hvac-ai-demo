// Initialize Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Get environment variables from .env file - using a simple approach for browser
async function loadEnv() {
  try {
    const response = await fetch('.env');
    const text = await response.text();
    const envVars = text.split('\n').reduce((acc, line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {});
    return envVars;
  } catch (error) {
    console.error('Error loading .env file:', error);
    return {};
  }
}

// Initialize with fallback values, will be replaced once env loads
let supabaseUrl = 'https://vfnwozsdhwufuelujlyx.supabase.co';
let supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbndvenNkaHd1ZnVlbHVqbHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NzYzOTcsImV4cCI6MjA2MTM1MjM5N30.BLxEUepY_QuaTa-HGOXlHNFcjlQbHWkGj_QHQGFp4QI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Update client with values from .env (for better security in production)
loadEnv().then(env => {
  if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
    // We would recreate the client here in a more sophisticated app
    // For simplicity, we're using the values directly in this demo
  }
});
