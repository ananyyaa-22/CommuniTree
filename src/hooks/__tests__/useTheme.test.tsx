/**
 * Tests for useTheme hook
 */

import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';
import { useCurrentTrack } from '../useCurrentTrack';
import * as themingUtils from '../../utils/theming';

// Mock the useCurrentTrack hook
jest.mock('../useCurrentTrack');
const mockUseCurrentTrack = useCurrentTrack as jest.MockedFunction<typeof useCurrentTrack>;

// Mock theming utilities
jest.mock('../../utils/theming');
const mockApplyTrackTheme = themingUtils.applyTrackTheme as jest.MockedFunction<typeof themingUtils.applyTrackTheme>;
const mockSwitchTrackTheme = themingUtils.switchTrackTheme as jest.MockedFunction<typeof themingUtils.switchTrackTheme>;
const mockGetTrackThemeConfig = themingUtils.getTrackThemeConfig as jest.MockedFunction<typeof themingUtils.getTrackThemeConfig>;

describe('useTheme Hook', () => {
  const mockSwitchTrack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseCurrentTrack.mockReturnValue({
      currentTrack: 'impact',
      switchTrack: mockSwitchTrack,
      isImpactTrack: true,
      isGrowTrack: false,
    });

    mockGetTrackThemeConfig.mockReturnValue({
      name: 'Impact',
      description: 'Community Service & NGO Partnerships',
      primaryColor: '#059669',
      accentColor: '#10b981',
      textColor: '#065f46',
      bgColor: '#ecfdf5',
    });
  });

  it('should return current track and theme configuration', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.currentTrack).toBe('impact');
    expect(result.current.isImpactTrack).toBe(true);
    expect(result.current.isGrowTrack).toBe(false);
    expect(result.current.themeConfig.name).toBe('Impact');
  });

  it('should apply theme on mount', () => {
    renderHook(() => useTheme());

    expect(mockApplyTrackTheme).toHaveBeenCalledWith('impact');
  });

  it('should apply theme when track changes', () => {
    const { rerender } = renderHook(() => useTheme());

    // Change track to grow
    mockUseCurrentTrack.mockReturnValue({
      currentTrack: 'grow',
      switchTrack: mockSwitchTrack,
      isImpactTrack: false,
      isGrowTrack: true,
    });

    mockGetTrackThemeConfig.mockReturnValue({
      name: 'Grow',
      description: 'Local Entertainment & Social Events',
      primaryColor: '#d97706',
      accentColor: '#f59e0b',
      textColor: '#92400e',
      bgColor: '#fffbeb',
    });

    rerender();

    expect(mockApplyTrackTheme).toHaveBeenCalledWith('grow');
  });

  it('should switch theme and track when switchTheme is called', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.switchTheme('grow');
    });

    expect(mockSwitchTrackTheme).toHaveBeenCalledWith('grow');
    expect(mockSwitchTrack).toHaveBeenCalledWith('grow');
  });

  it('should get correct theme configuration for grow track', () => {
    mockUseCurrentTrack.mockReturnValue({
      currentTrack: 'grow',
      switchTrack: mockSwitchTrack,
      isImpactTrack: false,
      isGrowTrack: true,
    });

    mockGetTrackThemeConfig.mockReturnValue({
      name: 'Grow',
      description: 'Local Entertainment & Social Events',
      primaryColor: '#d97706',
      accentColor: '#f59e0b',
      textColor: '#92400e',
      bgColor: '#fffbeb',
    });

    const { result } = renderHook(() => useTheme());

    expect(result.current.themeConfig.name).toBe('Grow');
    expect(result.current.themeConfig.primaryColor).toBe('#d97706');
    expect(mockGetTrackThemeConfig).toHaveBeenCalledWith('grow');
  });
});