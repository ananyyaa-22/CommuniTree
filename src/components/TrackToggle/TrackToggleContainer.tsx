/**
 * TrackToggleContainer Component
 * Connected version of TrackToggle that manages its own state
 * Integrates with global state management and theme switching
 */

import React, { useEffect } from 'react';
import { TrackToggle } from './TrackToggle';
import { useTheme } from '../../hooks';
import { initializeTheme } from '../../utils/theming';

interface TrackToggleContainerProps {
  className?: string;
}

export const TrackToggleContainer: React.FC<TrackToggleContainerProps> = ({
  className
}) => {
  const { currentTrack, switchTheme } = useTheme();

  // Initialize theme on mount
  useEffect(() => {
    const initialTrack = initializeTheme();
    if (initialTrack !== currentTrack) {
      switchTheme(initialTrack);
    }
  }, []);

  return (
    <TrackToggle
      currentTrack={currentTrack}
      onTrackChange={switchTheme}
      className={className}
    />
  );
};

export default TrackToggleContainer;