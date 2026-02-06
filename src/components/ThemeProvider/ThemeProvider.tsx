/**
 * ThemeProvider Component
 * Ensures track-based theming is initialized and applied at the app level
 */

import React, { useEffect } from 'react';
import { useTheme } from '../../hooks';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { currentTrack } = useTheme();

  // Apply theme to document root on mount and track changes
  useEffect(() => {
    // Theme is automatically applied by the useTheme hook
    // This component ensures the theme context is available
  }, [currentTrack]);

  return <>{children}</>;
};

export default ThemeProvider;