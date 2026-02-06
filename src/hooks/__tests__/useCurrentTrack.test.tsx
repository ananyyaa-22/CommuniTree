/**
 * Unit tests for useCurrentTrack hook
 * Tests track switching logic and persistence
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AppProvider } from '../../context/AppContext';
import { useCurrentTrack } from '../useCurrentTrack';
import { TrackType } from '../../types';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Wrapper component for testing hooks with context
const createWrapper = (initialTrack: TrackType = 'impact') => {
  return ({ children }: { children: React.ReactNode }) => (
    <AppProvider initialState={{ currentTrack: initialTrack }}>
      {children}
    </AppProvider>
  );
};

describe('useCurrentTrack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return current track state', () => {
    const wrapper = createWrapper('impact');
    const { result } = renderHook(() => useCurrentTrack(), { wrapper });

    expect(result.current.currentTrack).toBe('impact');
    expect(result.current.isImpactTrack).toBe(true);
    expect(result.current.isGrowTrack).toBe(false);
    expect(result.current.theme).toBe('impact');
  });

  it('should switch track correctly', () => {
    const wrapper = createWrapper('impact');
    const { result } = renderHook(() => useCurrentTrack(), { wrapper });

    act(() => {
      result.current.switchTrack('grow');
    });

    expect(result.current.currentTrack).toBe('grow');
    expect(result.current.isImpactTrack).toBe(false);
    expect(result.current.isGrowTrack).toBe(true);
    expect(result.current.theme).toBe('grow');
  });

  it('should toggle track correctly', () => {
    const wrapper = createWrapper('impact');
    const { result } = renderHook(() => useCurrentTrack(), { wrapper });

    // Toggle from impact to grow
    act(() => {
      result.current.toggleTrack();
    });

    expect(result.current.currentTrack).toBe('grow');

    // Toggle from grow back to impact
    act(() => {
      result.current.toggleTrack();
    });

    expect(result.current.currentTrack).toBe('impact');
  });

  it('should persist track selection to localStorage', () => {
    const wrapper = createWrapper('impact');
    const { result } = renderHook(() => useCurrentTrack(), { wrapper });

    act(() => {
      result.current.switchTrack('grow');
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'communitree_last_track',
      'grow'
    );
  });

  it('should handle grow track state correctly', () => {
    const wrapper = createWrapper('grow');
    const { result } = renderHook(() => useCurrentTrack(), { wrapper });

    expect(result.current.currentTrack).toBe('grow');
    expect(result.current.isImpactTrack).toBe(false);
    expect(result.current.isGrowTrack).toBe(true);
    expect(result.current.theme).toBe('grow');
  });

  it('should maintain stable function references', () => {
    const wrapper = createWrapper('impact');
    const { result, rerender } = renderHook(() => useCurrentTrack(), { wrapper });

    const initialSwitchTrack = result.current.switchTrack;
    const initialToggleTrack = result.current.toggleTrack;

    rerender();

    expect(result.current.switchTrack).toBe(initialSwitchTrack);
    expect(result.current.toggleTrack).toBe(initialToggleTrack);
  });

  it('should update localStorage on every track change', () => {
    const wrapper = createWrapper('impact');
    const { result } = renderHook(() => useCurrentTrack(), { wrapper });

    // Switch to grow
    act(() => {
      result.current.switchTrack('grow');
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'communitree_last_track',
      'grow'
    );

    // Switch back to impact
    act(() => {
      result.current.switchTrack('impact');
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'communitree_last_track',
      'impact'
    );

    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
  });

  it('should handle localStorage unavailability gracefully', () => {
    // Mock window as undefined (SSR scenario)
    const originalWindow = global.window;
    (global as any).window = undefined;

    const wrapper = createWrapper('impact');
    const { result } = renderHook(() => useCurrentTrack(), { wrapper });

    // Should not throw error
    act(() => {
      result.current.switchTrack('grow');
    });

    expect(result.current.currentTrack).toBe('grow');

    // Restore window
    global.window = originalWindow;
  });

  it('should provide correct boolean helpers for track state', () => {
    const wrapper = createWrapper('impact');
    const { result } = renderHook(() => useCurrentTrack(), { wrapper });

    // Test impact track
    expect(result.current.isImpactTrack).toBe(true);
    expect(result.current.isGrowTrack).toBe(false);

    // Switch to grow track
    act(() => {
      result.current.switchTrack('grow');
    });

    expect(result.current.isImpactTrack).toBe(false);
    expect(result.current.isGrowTrack).toBe(true);
  });

  it('should update theme when track changes', () => {
    const wrapper = createWrapper('impact');
    const { result } = renderHook(() => useCurrentTrack(), { wrapper });

    expect(result.current.theme).toBe('impact');

    act(() => {
      result.current.switchTrack('grow');
    });

    expect(result.current.theme).toBe('grow');
  });
});