/**
 * Global application context for CommuniTree platform
 * Provides centralized state management using React Context + useReducer with data persistence
 * Integrates Supabase authentication for user state management
 */

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { AppState, AppActions, TrackType } from '../types';
import { appReducer } from './appReducer';
import { createInitialState } from './initialState';
import { usePersistence } from '../hooks/usePersistence';
import { authService } from '../services/auth.service';
import type { User as SupabaseUser } from '../types/models';
import type { User as AppUser } from '../types/User';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppActions>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
  initialState?: Partial<AppState>;
}

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

export const AppProvider: React.FC<AppProviderProps> = ({ 
  children, 
  initialState 
}) => {
  const [state, dispatch] = useReducer(
    appReducer,
    createInitialState(initialState)
  );
  const [authInitialized, setAuthInitialized] = useState(false);

  // Initialize persistence
  const { persistState, syncWithStorage } = usePersistence(state, dispatch);

  // Initialize Supabase authentication and maintain auth state across page refreshes
  useEffect(() => {
    let mounted = true;

    // Get initial auth state
    const initAuth = async () => {
      try {
        const supabaseUser = await authService.getCurrentUser();
        if (mounted) {
          const appUser = transformSupabaseUserToAppUser(supabaseUser);
          dispatch({ type: 'SET_USER', payload: appUser });
          setAuthInitialized(true);
        }
      } catch (err) {
        if (mounted) {
          console.error('Failed to get initial auth state:', err);
          setAuthInitialized(true);
        }
      }
    };

    initAuth();

    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((supabaseUser) => {
      if (mounted) {
        const appUser = transformSupabaseUserToAppUser(supabaseUser);
        dispatch({ type: 'SET_USER', payload: appUser });
      }
    });

    // Cleanup subscription on unmount
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Sync with storage on mount (after auth is initialized)
  useEffect(() => {
    if (authInitialized) {
      syncWithStorage();
    }
  }, [authInitialized]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;