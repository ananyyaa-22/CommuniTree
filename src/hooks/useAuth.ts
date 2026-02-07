/**
 * useAuth Hook
 * 
 * Custom React hook for authentication state management.
 * Provides authentication state and methods for sign in, sign up, sign out, and password reset.
 * Subscribes to auth state changes and updates React Context accordingly.
 * 
 * @see Requirements 3.6, 3.7
 */

import { useState, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { useAppContext } from '../context/AppContext';
import type { User as SupabaseUser } from '../types/models';
import type { User as AppUser } from '../types/User';
import { getErrorMessage } from '../utils/errors';

/**
 * Transform Supabase User to Application User format
 * Maps between the database user model and the application user model
 */
function transformSupabaseUserToAppUser(supabaseUser: SupabaseUser | null): AppUser | null {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    name: supabaseUser.displayName,
    email: supabaseUser.email,
    trustPoints: supabaseUser.trustPoints,
    verificationStatus: supabaseUser.verificationStatus === 'verified' ? 'verified' : 'pending',
    chatHistory: [], // Will be populated from database when needed
    eventHistory: [], // Will be populated from database when needed
    createdAt: supabaseUser.createdAt,
    updatedAt: supabaseUser.updatedAt,
  };
}

/**
 * Return type for useAuth hook
 */
export interface UseAuthReturn {
  user: AppUser | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

/**
 * Custom hook for authentication management
 * 
 * Manages authentication state, subscribes to auth state changes,
 * and provides methods for authentication operations.
 * Updates the global AppContext when authentication state changes.
 * 
 * Note: Auth state changes are automatically handled by AppContext.
 * This hook only provides methods for authentication operations.
 * 
 * @returns Authentication state and methods
 * 
 * @example
 * const { user, loading, error, signIn, signUp, signOut } = useAuth();
 * 
 * // Sign in
 * await signIn('user@example.com', 'password123');
 * 
 * // Sign up
 * await signUp('newuser@example.com', 'password123', 'John Doe');
 * 
 * // Sign out
 * await signOut();
 */
export function useAuth(): UseAuthReturn {
  const { state } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Sign in with email and password
   * Auth state change is handled automatically by AppContext
   */
  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.signIn(email, password);
      // AppContext will automatically update user state via onAuthStateChange
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error);
      const error = new Error(errorMessage);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign up with email, password, and display name
   * Auth state change is handled automatically by AppContext
   */
  const signUp = useCallback(async (
    email: string,
    password: string,
    displayName: string
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.signUp(email, password, displayName);
      // AppContext will automatically update user state via onAuthStateChange
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error);
      const error = new Error(errorMessage);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign out the current user
   * Auth state change is handled automatically by AppContext
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.signOut();
      // AppContext will automatically clear user state via onAuthStateChange
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error);
      const error = new Error(errorMessage);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Send password reset email
   */
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.resetPassword(email);
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error);
      const error = new Error(errorMessage);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user: state.user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}

