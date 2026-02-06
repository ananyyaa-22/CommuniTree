/**
 * Custom hook for track switching logic
 * Manages Impact/Grow track state and persistence
 */

import { useCallback, useEffect } from 'react';
import { useAppState, useAppDispatch } from './useAppState';
import { TrackType } from '../types';

export const useCurrentTrack = () => {
  const state = useAppState();
  const dispatch = useAppDispatch();

  // Persist track selection to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('communitree_last_track', state.currentTrack);
    }
  }, [state.currentTrack]);

  const switchTrack = useCallback((track: TrackType) => {
    dispatch({ type: 'SWITCH_TRACK', payload: track });
  }, [dispatch]);

  const toggleTrack = useCallback(() => {
    const newTrack = state.currentTrack === 'impact' ? 'grow' : 'impact';
    switchTrack(newTrack);
  }, [state.currentTrack, switchTrack]);

  return {
    currentTrack: state.currentTrack,
    switchTrack,
    toggleTrack,
    isImpactTrack: state.currentTrack === 'impact',
    isGrowTrack: state.currentTrack === 'grow',
    theme: state.ui.theme,
  };
};