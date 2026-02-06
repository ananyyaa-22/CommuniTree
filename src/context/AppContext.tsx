/**
 * Global application context for CommuniTree platform
 * Provides centralized state management using React Context + useReducer with data persistence
 */

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, AppActions, TrackType } from '../types';
import { appReducer } from './appReducer';
import { createInitialState } from './initialState';
import { usePersistence } from '../hooks/usePersistence';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppActions>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
  initialState?: Partial<AppState>;
}

export const AppProvider: React.FC<AppProviderProps> = ({ 
  children, 
  initialState 
}) => {
  const [state, dispatch] = useReducer(
    appReducer,
    createInitialState(initialState)
  );

  // Initialize persistence
  const { persistState, syncWithStorage } = usePersistence(state, dispatch);

  // Sync with storage on mount
  useEffect(() => {
    syncWithStorage();
  }, []);

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