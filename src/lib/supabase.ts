import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Get environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'mock-key';

// Check if we're in mock mode (no real Supabase credentials)
export const isMockMode = !process.env.REACT_APP_SUPABASE_URL || 
                          process.env.REACT_APP_SUPABASE_URL.includes('mock');

if (isMockMode) {
  console.warn(
    '⚠️ Running in MOCK MODE - Supabase is not configured.\n' +
    'Authentication will use mock data. To use real Supabase:\n' +
    '1. Create a project at https://app.supabase.com\n' +
    '2. Copy .env.example to .env\n' +
    '3. Add your real REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY'
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
