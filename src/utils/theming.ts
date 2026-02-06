/**
 * Theme management utilities for track-based color theming
 * Handles dynamic switching between Impact (emerald) and Grow (amber) themes
 */

import { TrackType } from '../types';

/**
 * Apply track-based theme to the document root
 * @param track - The active track ('impact' or 'grow')
 */
export const applyTrackTheme = (track: TrackType): void => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Remove existing track data attributes
  root.removeAttribute('data-track');
  
  // Apply new track theme
  root.setAttribute('data-track', track);
};

/**
 * Get the current track theme from the document
 * @returns The current track theme or 'impact' as default
 */
export const getCurrentTrackTheme = (): TrackType => {
  if (typeof document === 'undefined') return 'impact';
  
  const currentTheme = document.documentElement.getAttribute('data-track');
  return (currentTheme === 'grow' ? 'grow' : 'impact') as TrackType;
};

/**
 * Initialize theme on app startup
 * Reads from localStorage and applies the saved theme
 */
export const initializeTheme = (): TrackType => {
  if (typeof window === 'undefined') return 'impact';
  
  const savedTrack = localStorage.getItem('communitree_last_track') as TrackType;
  const initialTrack = savedTrack && (savedTrack === 'impact' || savedTrack === 'grow') 
    ? savedTrack 
    : 'impact';
  
  applyTrackTheme(initialTrack);
  return initialTrack;
};

/**
 * Switch track theme and persist to localStorage
 * @param track - The track to switch to
 */
export const switchTrackTheme = (track: TrackType): void => {
  applyTrackTheme(track);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('communitree_last_track', track);
  }
};

/**
 * Get CSS custom property value for current track
 * @param property - The CSS custom property name (without --)
 * @returns The computed CSS value
 */
export const getTrackCSSProperty = (property: string): string => {
  if (typeof window === 'undefined') return '';
  
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--track-${property}`)
    .trim();
};

/**
 * Track theme configuration
 */
export const TRACK_THEMES = {
  impact: {
    name: 'Impact',
    description: 'Community Service & NGO Partnerships',
    primaryColor: '#059669',
    accentColor: '#10b981',
    textColor: '#065f46',
    bgColor: '#ecfdf5',
  },
  grow: {
    name: 'Grow',
    description: 'Local Entertainment & Social Events',
    primaryColor: '#d97706',
    accentColor: '#f59e0b',
    textColor: '#92400e',
    bgColor: '#fffbeb',
  },
} as const;

/**
 * Get theme configuration for a specific track
 * @param track - The track to get configuration for
 * @returns Theme configuration object
 */
export const getTrackThemeConfig = (track: TrackType) => {
  return TRACK_THEMES[track];
};