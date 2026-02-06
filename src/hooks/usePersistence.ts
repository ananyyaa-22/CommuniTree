/**
 * Custom hook for automatic data persistence
 * Handles localStorage and sessionStorage operations with the app state
 */

import { useEffect, useCallback } from 'react';
import { AppState } from '../types';
import {
  persistAppState,
  syncAppStateWithStorage,
  saveLastTrack,
  saveTrustPoints,
  saveNGOVerification,
  saveEventRSVP,
  saveTempFormData,
  clearTempFormData,
  saveCurrentSession,
} from '../utils/dataPersistence';

/**
 * Hook for automatic state persistence
 */
export const usePersistence = (
  state: AppState,
  dispatch: React.Dispatch<any>
) => {
  // Persist state changes automatically
  useEffect(() => {
    if (state.user) {
      persistAppState(state);
    }
  }, [
    state.user?.trustPoints,
    state.currentTrack,
    state.chatThreads,
    state.preferences,
    state.ui.activeModal,
    state.ui.viewMode,
  ]);

  // Sync with storage on mount
  useEffect(() => {
    if (state.user) {
      const syncedState = syncAppStateWithStorage(state);
      if (syncedState !== state) {
        // Update state with persisted data
        dispatch({ type: 'SYNC_WITH_STORAGE', payload: syncedState });
      }
    }
  }, [state.user?.id]);

  // Save track changes immediately
  useEffect(() => {
    saveLastTrack(state.currentTrack);
  }, [state.currentTrack]);

  return {
    // Manual persistence functions
    persistState: useCallback(() => {
      persistAppState(state);
    }, [state]),
    
    syncWithStorage: useCallback(() => {
      if (state.user) {
        const syncedState = syncAppStateWithStorage(state);
        dispatch({ type: 'SYNC_WITH_STORAGE', payload: syncedState });
      }
    }, [state, dispatch]),
  };
};

/**
 * Hook for form data persistence
 */
export const useFormPersistence = (formId: string) => {
  const saveFormData = useCallback((data: any) => {
    saveTempFormData(formId, data);
  }, [formId]);

  const clearFormData = useCallback(() => {
    clearTempFormData(formId);
  }, [formId]);

  return {
    saveFormData,
    clearFormData,
  };
};

/**
 * Hook for trust points persistence
 */
export const useTrustPointsPersistence = (userId?: string) => {
  const saveTrustPointsData = useCallback((trustPoints: number) => {
    if (userId) {
      saveTrustPoints(userId, trustPoints);
    }
  }, [userId]);

  return {
    saveTrustPoints: saveTrustPointsData,
  };
};

/**
 * Hook for NGO verification persistence
 */
export const useNGOPersistence = () => {
  const saveVerification = useCallback((ngoId: string, isVerified: boolean, darpanId?: string) => {
    saveNGOVerification(ngoId, isVerified, darpanId);
  }, []);

  return {
    saveVerification,
  };
};

/**
 * Hook for event RSVP persistence
 */
export const useEventPersistence = (userId?: string) => {
  const saveRSVP = useCallback((eventId: string, isRSVP: boolean) => {
    if (userId) {
      saveEventRSVP(userId, eventId, isRSVP);
    }
  }, [userId]);

  return {
    saveRSVP,
  };
};

/**
 * Hook for session persistence
 */
export const useSessionPersistence = () => {
  const saveSession = useCallback((sessionData: any) => {
    saveCurrentSession(sessionData);
  }, []);

  return {
    saveSession,
  };
};