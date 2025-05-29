// Authentication functions
import { supabase } from './supabase.js';

// Sign up with email and password
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password 
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Sign in with email and password
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email, 
    password 
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
  
  return true;
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.warn('Error getting current user:', error.message);
      return null;
    }
    
    return data.user;
  } catch (error) {
    // Handle AuthSessionMissingError gracefully
    if (error.message && error.message.includes('Auth session missing')) {
      console.warn('Auth session missing, returning null');
      return null;
    }
    // Rethrow other errors
    throw error;
  }
}

// Reset password
export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Update user password (used after password reset)
export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Check if user is authenticated
export async function isAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

// Listen for auth state changes
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// Get user session
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('Error getting session:', error.message);
      return null;
    }
    
    return session;
  } catch (error) {
    // Handle AuthSessionMissingError gracefully
    if (error.message && error.message.includes('Auth session missing')) {
      console.warn('Auth session missing, returning null');
      return null;
    }
    // For other errors, log and return null to avoid breaking the app flow
    console.error('Unexpected error getting session:', error);
    return null;
  }
}
