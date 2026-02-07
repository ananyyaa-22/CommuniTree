/**
 * Authentication Service
 * 
 * Provides authentication functionality using Supabase Auth.
 * Handles user sign up, sign in, sign out, password reset, and auth state management.
 * 
 * All methods throw AuthError on failure with appropriate error codes.
 * 
 * @see src/utils/errors.ts for error types
 * @see src/types/models.ts for User type
 */

import { supabase, isMockMode } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { AuthError } from '../utils/errors';
import type { User } from '../types/models';

// Mock user storage for development
let mockCurrentUser: User | null = null;
const mockAuthListeners: Array<(user: User | null) => void> = [];

/**
 * Authentication service interface
 */
export interface AuthService {
  signUp(email: string, password: string, displayName: string): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  onAuthStateChange(callback: (user: User | null) => void): () => void;
}

/**
 * Transforms Supabase user to application User model
 * @param supabaseUser - Supabase user object
 * @returns Application User object or null
 */
function transformSupabaseUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    displayName: supabaseUser.user_metadata?.display_name || supabaseUser.email?.split('@')[0] || 'User',
    // Note: trust points and other fields come from the users table, not auth.users
    // These will be fetched separately when needed
    trustPoints: 50, // Default value
    verificationStatus: 'unverified',
    createdAt: new Date(supabaseUser.created_at),
    updatedAt: new Date(supabaseUser.updated_at || supabaseUser.created_at),
  };
}

/**
 * Sign up a new user with email and password
 * Creates both an auth user and a profile record in the users table
 * 
 * @param email - User's email address
 * @param password - User's password (min 8 characters)
 * @param displayName - User's display name
 * @returns Promise resolving to the created User
 * @throws AuthError with code 'email_exists' if email is already registered
 * @throws AuthError with code 'weak_password' if password is too weak
 * @throws AuthError with code 'network_error' for other failures
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  // Mock mode - simulate sign up
  if (isMockMode) {
    console.log('[auth] Mock sign up:', email);
    
    // Validate password length
    if (password.length < 8) {
      throw new AuthError('Password must be at least 8 characters long', 'weak_password');
    }

    const mockUser: User = {
      id: `mock-${Date.now()}`,
      email,
      displayName,
      trustPoints: 50,
      verificationStatus: 'unverified',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCurrentUser = mockUser;
    mockAuthListeners.forEach(listener => listener(mockUser));
    
    return mockUser;
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      // Log authentication error
      console.error('[auth] Sign up failed:', error.message);

      // Map Supabase errors to AuthError codes
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        throw new AuthError('An account with this email already exists', 'email_exists', error);
      }
      
      if (error.message.includes('Password') || error.message.includes('password')) {
        throw new AuthError('Password must be at least 8 characters long', 'weak_password', error);
      }

      throw new AuthError(error.message, 'network_error', error);
    }

    if (!data.user) {
      throw new AuthError('Sign up failed - no user returned', 'network_error');
    }

    const user = transformSupabaseUser(data.user);
    if (!user) {
      throw new AuthError('Failed to create user profile', 'network_error');
    }

    return user;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    console.error('[auth] Unexpected sign up error:', error);
    throw new AuthError('An unexpected error occurred during sign up', 'network_error', error);
  }
}

/**
 * Sign in an existing user with email and password
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to the authenticated User
 * @throws AuthError with code 'invalid_credentials' if credentials are wrong
 * @throws AuthError with code 'network_error' for other failures
 */
export async function signIn(email: string, password: string): Promise<User> {
  // Mock mode - simulate sign in
  if (isMockMode) {
    console.log('[auth] Mock sign in:', email);
    
    // Accept any credentials in mock mode
    const mockUser: User = {
      id: `mock-${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      trustPoints: 75,
      verificationStatus: 'verified',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCurrentUser = mockUser;
    mockAuthListeners.forEach(listener => listener(mockUser));
    
    return mockUser;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Log authentication error
      console.error('[auth] Sign in failed:', error.message);

      // Map Supabase errors to AuthError codes
      if (
        error.message.includes('Invalid login credentials') ||
        error.message.includes('Invalid email or password')
      ) {
        throw new AuthError('Invalid email or password', 'invalid_credentials', error);
      }

      throw new AuthError(error.message, 'network_error', error);
    }

    if (!data.user) {
      throw new AuthError('Sign in failed - no user returned', 'network_error');
    }

    const user = transformSupabaseUser(data.user);
    if (!user) {
      throw new AuthError('Failed to retrieve user profile', 'network_error');
    }

    return user;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    console.error('[auth] Unexpected sign in error:', error);
    throw new AuthError('An unexpected error occurred during sign in', 'network_error', error);
  }
}

/**
 * Sign out the current user
 * Invalidates the current session
 * 
 * @returns Promise that resolves when sign out is complete
 * @throws AuthError with code 'network_error' on failure
 */
export async function signOut(): Promise<void> {
  // Mock mode - simulate sign out
  if (isMockMode) {
    console.log('[auth] Mock sign out');
    mockCurrentUser = null;
    mockAuthListeners.forEach(listener => listener(null));
    return;
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      // Log authentication error
      console.error('[auth] Sign out failed:', error.message);
      throw new AuthError(error.message, 'network_error', error);
    }
  } catch (error) {
    if (error instanceof AuthError) throw error;
    console.error('[auth] Unexpected sign out error:', error);
    throw new AuthError('An unexpected error occurred during sign out', 'network_error', error);
  }
}

/**
 * Send a password reset email to the user
 * 
 * @param email - User's email address
 * @returns Promise that resolves when reset email is sent
 * @throws AuthError with code 'network_error' on failure
 */
export async function resetPassword(email: string): Promise<void> {
  // Mock mode - simulate password reset
  if (isMockMode) {
    console.log('[auth] Mock password reset for:', email);
    return;
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      // Log authentication error
      console.error('[auth] Password reset failed:', error.message);
      throw new AuthError(error.message, 'network_error', error);
    }
  } catch (error) {
    if (error instanceof AuthError) throw error;
    console.error('[auth] Unexpected password reset error:', error);
    throw new AuthError('An unexpected error occurred during password reset', 'network_error', error);
  }
}

/**
 * Get the currently authenticated user
 * 
 * @returns Promise resolving to the current User or null if not authenticated
 * @throws AuthError with code 'network_error' on failure
 */
export async function getCurrentUser(): Promise<User | null> {
  // Mock mode - return mock user
  if (isMockMode) {
    return mockCurrentUser;
  }

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      // Log authentication error
      console.error('[auth] Get current user failed:', error.message);
      throw new AuthError(error.message, 'network_error', error);
    }

    return transformSupabaseUser(data.user);
  } catch (error) {
    if (error instanceof AuthError) throw error;
    console.error('[auth] Unexpected get current user error:', error);
    throw new AuthError('An unexpected error occurred while fetching user', 'network_error', error);
  }
}

/**
 * Subscribe to authentication state changes
 * Callback is invoked whenever the user signs in, signs out, or the session is refreshed
 * 
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function to clean up the subscription
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  // Mock mode - use mock listeners
  if (isMockMode) {
    mockAuthListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = mockAuthListeners.indexOf(callback);
      if (index > -1) {
        mockAuthListeners.splice(index, 1);
      }
    };
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user ? transformSupabaseUser(session.user) : null;
    callback(user);
  });

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Default export of authentication service
 */
export const authService: AuthService = {
  signUp,
  signIn,
  signOut,
  resetPassword,
  getCurrentUser,
  onAuthStateChange,
};

