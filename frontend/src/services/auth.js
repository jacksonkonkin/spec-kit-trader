import { supabase } from '../lib/supabase.js';

/**
 * Authentication service for the Stock Trading Learning Platform
 * Handles user signup, signin, signout, and session management
 */

/**
 * Create new user account
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email address
 * @param {string} credentials.password - User password (min 8 characters)
 * @returns {Promise<Object>} Supabase auth response
 */
export const signup = async ({ email, password }) => {
  // Input validation
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Password length validation
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Sign in existing user
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email address
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Supabase auth response
 */
export const signin = async ({ email, password }) => {
  // Input validation
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Sign out current user
 * @returns {Promise<Object>} Supabase auth response
 */
export const signout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
};

/**
 * Refresh user session
 * @returns {Promise<Object>} Supabase auth response with refreshed session
 */
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get current user session
 * @returns {Promise<Object>} Current session data
 */
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get current user
 * @returns {Promise<Object>} Current user data
 */
export const getUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Object} Subscription object with unsubscribe method
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};