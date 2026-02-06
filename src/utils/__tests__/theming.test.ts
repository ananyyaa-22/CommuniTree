/**
 * Tests for track-based theming utilities
 */

import {
  applyTrackTheme,
  getCurrentTrackTheme,
  switchTrackTheme,
  getTrackThemeConfig,
  TRACK_THEMES
} from '../theming';

// Mock DOM methods for testing
const mockSetAttribute = jest.fn();
const mockGetAttribute = jest.fn();
const mockRemoveAttribute = jest.fn();

// Mock document
Object.defineProperty(global, 'document', {
  value: {
    documentElement: {
      setAttribute: mockSetAttribute,
      getAttribute: mockGetAttribute,
      removeAttribute: mockRemoveAttribute,
    },
  },
  writable: true,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('Track Theming Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('applyTrackTheme', () => {
    it('should apply impact track theme', () => {
      applyTrackTheme('impact');
      
      expect(mockRemoveAttribute).toHaveBeenCalledWith('data-track');
      expect(mockSetAttribute).toHaveBeenCalledWith('data-track', 'impact');
    });

    it('should apply grow track theme', () => {
      applyTrackTheme('grow');
      
      expect(mockRemoveAttribute).toHaveBeenCalledWith('data-track');
      expect(mockSetAttribute).toHaveBeenCalledWith('data-track', 'grow');
    });
  });

  describe('getCurrentTrackTheme', () => {
    it('should return current track from document', () => {
      mockGetAttribute.mockReturnValue('grow');
      
      const result = getCurrentTrackTheme();
      
      expect(result).toBe('grow');
      expect(mockGetAttribute).toHaveBeenCalledWith('data-track');
    });

    it('should default to impact when no track is set', () => {
      mockGetAttribute.mockReturnValue(null);
      
      const result = getCurrentTrackTheme();
      
      expect(result).toBe('impact');
    });
  });

  describe('switchTrackTheme', () => {
    it('should switch theme and persist to localStorage', () => {
      switchTrackTheme('grow');
      
      expect(mockRemoveAttribute).toHaveBeenCalledWith('data-track');
      expect(mockSetAttribute).toHaveBeenCalledWith('data-track', 'grow');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('communitree_last_track', 'grow');
    });
  });

  describe('getTrackThemeConfig', () => {
    it('should return impact theme configuration', () => {
      const config = getTrackThemeConfig('impact');
      
      expect(config).toEqual(TRACK_THEMES.impact);
      expect(config.name).toBe('Impact');
      expect(config.primaryColor).toBe('#059669');
    });

    it('should return grow theme configuration', () => {
      const config = getTrackThemeConfig('grow');
      
      expect(config).toEqual(TRACK_THEMES.grow);
      expect(config.name).toBe('Grow');
      expect(config.primaryColor).toBe('#d97706');
    });
  });

  describe('TRACK_THEMES', () => {
    it('should have correct impact theme colors', () => {
      const impact = TRACK_THEMES.impact;
      
      expect(impact.name).toBe('Impact');
      expect(impact.description).toBe('Community Service & NGO Partnerships');
      expect(impact.primaryColor).toBe('#059669');
      expect(impact.accentColor).toBe('#10b981');
      expect(impact.textColor).toBe('#065f46');
      expect(impact.bgColor).toBe('#ecfdf5');
    });

    it('should have correct grow theme colors', () => {
      const grow = TRACK_THEMES.grow;
      
      expect(grow.name).toBe('Grow');
      expect(grow.description).toBe('Local Entertainment & Social Events');
      expect(grow.primaryColor).toBe('#d97706');
      expect(grow.accentColor).toBe('#f59e0b');
      expect(grow.textColor).toBe('#92400e');
      expect(grow.bgColor).toBe('#fffbeb');
    });
  });
});