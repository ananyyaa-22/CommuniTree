/**
 * useNavigation Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { useNavigation } from '../useNavigation';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useNavigation Hook', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  it('initializes with home as default section', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useNavigation());
    
    expect(result.current.activeSection).toBe('home');
    expect(result.current.isHomeActive).toBe(true);
    expect(result.current.isScheduleActive).toBe(false);
    expect(result.current.isProfileActive).toBe(false);
  });

  it('loads saved navigation state from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('schedule');
    
    const { result } = renderHook(() => useNavigation());
    
    expect(result.current.activeSection).toBe('schedule');
    expect(result.current.isScheduleActive).toBe(true);
    expect(result.current.isHomeActive).toBe(false);
  });

  it('ignores invalid saved navigation state', () => {
    localStorageMock.getItem.mockReturnValue('invalid-section');
    
    const { result } = renderHook(() => useNavigation());
    
    expect(result.current.activeSection).toBe('home');
    expect(result.current.isHomeActive).toBe(true);
  });

  it('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const { result } = renderHook(() => useNavigation());
    
    expect(result.current.activeSection).toBe('home');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load navigation state from localStorage:',
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });

  it('changes active section when onSectionChange is called', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.onSectionChange('profile');
    });
    
    expect(result.current.activeSection).toBe('profile');
    expect(result.current.isProfileActive).toBe(true);
    expect(result.current.isHomeActive).toBe(false);
  });

  it('saves navigation state to localStorage when changed', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.onSectionChange('schedule');
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'communitree_active_section',
      'schedule'
    );
  });

  it('handles localStorage save errors gracefully', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage save error');
    });
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.onSectionChange('profile');
    });
    
    expect(result.current.activeSection).toBe('profile');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save navigation state to localStorage:',
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });

  it('provides correct boolean flags for each section', () => {
    const { result } = renderHook(() => useNavigation());
    
    // Test home section
    expect(result.current.isHomeActive).toBe(true);
    expect(result.current.isScheduleActive).toBe(false);
    expect(result.current.isProfileActive).toBe(false);
    
    // Test schedule section
    act(() => {
      result.current.onSectionChange('schedule');
    });
    
    expect(result.current.isHomeActive).toBe(false);
    expect(result.current.isScheduleActive).toBe(true);
    expect(result.current.isProfileActive).toBe(false);
    
    // Test profile section
    act(() => {
      result.current.onSectionChange('profile');
    });
    
    expect(result.current.isHomeActive).toBe(false);
    expect(result.current.isScheduleActive).toBe(false);
    expect(result.current.isProfileActive).toBe(true);
  });

  it('maintains referential stability of onSectionChange', () => {
    const { result, rerender } = renderHook(() => useNavigation());
    
    const firstCallback = result.current.onSectionChange;
    
    rerender();
    
    const secondCallback = result.current.onSectionChange;
    
    expect(firstCallback).toBe(secondCallback);
  });
});