import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Get environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error(
    'Missing REACT_APP_SUPABASE_URL environment variable. ' +
    'Please create a .env file with your Supabase project URL. ' +
    'See .env.example for reference.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing REACT_APP_SUPABASE_ANON_KEY environment variable. ' +
    'Please create a .env file with your Supabase anonymous key. ' +
    'See .env.example for reference.'
  );
}

// Create and export Supabase client with typed database schema
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Export types for use throughout the application
export type { User, Session } from '@supabase/supabase-js';
