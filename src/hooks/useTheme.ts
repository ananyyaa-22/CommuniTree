/**
 * useTheme Hook
 * Manages track-based theming with automatic DOM updates
 */

import { useEffect } from 'react';
import { useCurrentTrack } from './useCurrentTrack';
import { 
  applyTrackTheme, 
  switchTrackTheme, 
  getTrackThemeConfig,
  TRACK_THEMES 
} from '../utils/theming';
import { TrackType } from '../types';

interface UseThemeReturn {
  currentTrack: TrackType;
  themeConfig: typeof TRACK_THEMES[TrackType];
  switchTheme: (track: TrackType) => void;
  isImpactTrack: boolean;
  isGrowTrack: boolean;
}

/**
 * Hook for managing track-based theming
 * Automatically applies theme changes to the DOM
 */
export const useTheme = (): UseThemeReturn => {
  const { currentTrack, switchTrack, isImpactTrack, isGrowTrack } = useCurrentTrack();

  // Apply theme whenever track changes
  useEffect(() => {
    applyTrackTheme(currentTrack);
  }, [currentTrack]);

  const switchTheme = (track: TrackType) => {
    switchTrackTheme(track);
    switchTrack(track);
  };

  const themeConfig = getTrackThemeConfig(currentTrack);

  return {
    currentTrack,
    themeConfig,
    switchTheme,
    isImpactTrack,
    isGrowTrack,
  };
};

export default useTheme;