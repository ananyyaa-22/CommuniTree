/**
 * Test suite for custom hooks
 * Verifies that all hooks are properly implemented and functional
 */

import React from 'react';
import { renderHook } from '@testing-library/react';
import { AppProvider } from '../../context/AppContext';
import { 
  useAppState, 
  useAppDispatch,
  useUser,
  useCurrentTrack,
  useTrustPoints,
  useNGOs,
  useEvents,
  useUI
} from '../index';

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppProvider>{children}</AppProvider>
);

describe('Custom Hooks', () => {
  describe('useAppState and useAppDispatch', () => {
    it('should provide access to app state', () => {
      const { result } = renderHook(() => useAppState(), {
        wrapper: TestWrapper,
      });

      expect(result.current).toBeDefined();
      expect(result.current.user).toBeNull();
      expect(result.current.currentTrack).toBe('impact');
      expect(result.current.ngos).toEqual([]);
      expect(result.current.events).toEqual([]);
    });

    it('should provide dispatch function', () => {
      const { result } = renderHook(() => useAppDispatch(), {
        wrapper: TestWrapper,
      });

      expect(result.current).toBeDefined();
      expect(typeof result.current).toBe('function');
    });
  });

  describe('useUser', () => {
    it('should provide user state and actions', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: TestWrapper,
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.trustPoints).toBe(0);
      expect(result.current.verificationStatus).toBe('pending');
      expect(typeof result.current.updateUser).toBe('function');
      expect(typeof result.current.setUser).toBe('function');
      expect(typeof result.current.updateTrustPoints).toBe('function');
    });
  });

  describe('useCurrentTrack', () => {
    it('should provide track state and actions', () => {
      const { result } = renderHook(() => useCurrentTrack(), {
        wrapper: TestWrapper,
      });

      expect(result.current.currentTrack).toBe('impact');
      expect(result.current.isImpactTrack).toBe(true);
      expect(result.current.isGrowTrack).toBe(false);
      expect(typeof result.current.switchTrack).toBe('function');
      expect(typeof result.current.toggleTrack).toBe('function');
    });
  });

  describe('useTrustPoints', () => {
    it('should provide trust points state and utilities', () => {
      const { result } = renderHook(() => useTrustPoints(), {
        wrapper: TestWrapper,
      });

      expect(result.current.currentPoints).toBe(0);
      expect(result.current.trustLevel).toBe('Critical');
      expect(result.current.shouldShowWarning).toBe(true);
      expect(typeof result.current.awardPoints).toBe('function');
      expect(typeof result.current.canRSVP).toBe('function');
      expect(typeof result.current.getRSVPWarning).toBe('function');
    });
  });

  describe('useNGOs', () => {
    it('should provide NGO state and actions', () => {
      const { result } = renderHook(() => useNGOs(), {
        wrapper: TestWrapper,
      });

      expect(result.current.ngos).toEqual([]);
      expect(result.current.verifiedNGOs).toEqual([]);
      expect(result.current.unverifiedNGOs).toEqual([]);
      expect(result.current.totalNGOs).toBe(0);
      expect(typeof result.current.verifyNGO).toBe('function');
      expect(typeof result.current.updateNGO).toBe('function');
      expect(typeof result.current.addNGO).toBe('function');
    });
  });

  describe('useEvents', () => {
    it('should provide event state and actions', () => {
      const { result } = renderHook(() => useEvents(), {
        wrapper: TestWrapper,
      });

      expect(result.current.events).toEqual([]);
      expect(result.current.upcomingEvents).toEqual([]);
      expect(result.current.userRSVPEvents).toEqual([]);
      expect(result.current.totalEvents).toBe(0);
      expect(typeof result.current.rsvpToEvent).toBe('function');
      expect(typeof result.current.cancelRSVP).toBe('function');
      expect(typeof result.current.updateEvent).toBe('function');
    });
  });

  describe('useUI', () => {
    it('should provide UI state and actions', () => {
      const { result } = renderHook(() => useUI(), {
        wrapper: TestWrapper,
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.activeModal).toBeNull();
      expect(result.current.viewMode).toBe('grid');
      expect(result.current.notifications).toEqual([]);
      expect(typeof result.current.setLoading).toBe('function');
      expect(typeof result.current.showModal).toBe('function');
      expect(typeof result.current.hideModal).toBe('function');
    });
  });
});