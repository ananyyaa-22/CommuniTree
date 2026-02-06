/**
 * Unit tests for useTrustPoints hook
 * Tests trust points management, calculations, and UI helpers
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AppProvider } from '../../context/AppContext';
import { useTrustPoints } from '../useTrustPoints';
import { User } from '../../types';

// Wrapper component for testing hooks with context
const createWrapper = (trustPoints: number = 75) => {
  const mockUser: User = {
    id: 'user_test',
    name: 'Test User',
    email: 'test@example.com',
    trustPoints,
    verificationStatus: 'verified',
    chatHistory: [],
    eventHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return ({ children }: { children: React.ReactNode }) => (
    <AppProvider initialState={{ user: mockUser }}>
      {children}
    </AppProvider>
  );
};

const createWrapperWithoutUser = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <AppProvider initialState={{ user: null }}>
      {children}
    </AppProvider>
  );
};

describe('useTrustPoints', () => {
  it('should return current trust points for authenticated user', () => {
    const wrapper = createWrapper(75);
    const { result } = renderHook(() => useTrustPoints(), { wrapper });

    expect(result.current.currentPoints).toBe(75);
    expect(result.current.formattedPoints).toBe('75');
    expect(result.current.trustLevel).toBe('High');
    expect(result.current.trustLevelColor).toBe('text-green-600');
  });

  it('should return 0 points for unauthenticated user', () => {
    const wrapper = createWrapperWithoutUser();
    const { result } = renderHook(() => useTrustPoints(), { wrapper });

    expect(result.current.currentPoints).toBe(0);
    expect(result.current.formattedPoints).toBe('0');
    expect(result.current.trustLevel).toBe('New');
    expect(result.current.trustLevelColor).toBe('text-gray-500');
  });

  it('should award points correctly', () => {
    const wrapper = createWrapper(50);
    const { result } = renderHook(() => useTrustPoints(), { wrapper });

    act(() => {
      result.current.awardPoints('ATTEND_EVENT');
    });

    expect(result.current.currentPoints).toBe(55); // 50 + 5
  });

  it('should calculate trust levels correctly', () => {
    // Test different trust point ranges
    const testCases = [
      { points: 0, level: 'New', color: 'text-gray-500' },
      { points: 15, level: 'New', color: 'text-gray-500' },
      { points: 25, level: 'Bronze', color: 'text-orange-600' },
      { points: 45, level: 'Bronze', color: 'text-orange-600' },
      { points: 55, level: 'Silver', color: 'text-blue-600' },
      { points: 75, level: 'High', color: 'text-green-600' },
      { points: 90, level: 'Elite', color: 'text-purple-600' },
      { points: 100, level: 'Elite', color: 'text-purple-600' },
    ];

    testCases.forEach(({ points, level, color }) => {
      const wrapper = createWrapper(points);
      const { result } = renderHook(() => useTrustPoints(), { wrapper });

      expect(result.current.trustLevel).toBe(level);
      expect(result.current.trustLevelColor).toBe(color);
    });
  });

  it('should determine RSVP eligibility correctly', () => {
    // Test with sufficient points
    const wrapperHigh = createWrapper(50);
    const { result: resultHigh } = renderHook(() => useTrustPoints(), { wrapper: wrapperHigh });
    expect(resultHigh.current.canRSVP()).toBe(true);

    // Test with insufficient points
    const wrapperLow = createWrapper(15);
    const { result: resultLow } = renderHook(() => useTrustPoints(), { wrapper: wrapperLow });
    expect(resultLow.current.canRSVP()).toBe(false);
  });

  it('should show RSVP warning for low trust points', () => {
    const wrapper = createWrapper(15);
    const { result } = renderHook(() => useTrustPoints(), { wrapper });

    expect(result.current.shouldShowWarning).toBe(true);
    expect(result.current.getRSVPWarning()).toContain('Your trust points are low');
    expect(result.current.getRSVPWarning()).toContain('15/100');
  });

  it('should not show RSVP warning for sufficient trust points', () => {
    const wrapper = createWrapper(50);
    const { result } = renderHook(() => useTrustPoints(), { wrapper });

    expect(result.current.shouldShowWarning).toBe(false);
    expect(result.current.getRSVPWarning()).toBeNull();
  });

  it('should calculate points after action correctly', () => {
    const wrapper = createWrapper(50);
    const { result } = renderHook(() => useTrustPoints(), { wrapper });

    expect(result.current.getPointsAfterAction('ATTEND_EVENT')).toBe(55);
    expect(result.current.getPointsAfterAction('ORGANIZE_EVENT')).toBe(70);
    expect(result.current.getPointsAfterAction('NO_SHOW')).toBe(40);
    expect(result.current.getPointsAfterAction('VERIFY_IDENTITY')).toBe(60);
  });

  it('should cap points calculation at 100', () => {
    const wrapper = createWrapper(95);
    const { result } = renderHook(() => useTrustPoints(), { wrapper });

    expect(result.current.getPointsAfterAction('ORGANIZE_EVENT')).toBe(100); // Capped at 100
  });

  it('should not allow points calculation below 0', () => {
    const wrapper = createWrapper(5);
    const { result } = renderHook(() => useTrustPoints(), { wrapper });

    expect(result.current.getPointsAfterAction('NO_SHOW')).toBe(0); // Cannot go below 0
  });

  it('should provide trust point limits', () => {
    const wrapper = createWrapper(50);
    const { result } = renderHook(() => useTrustPoints(), { wrapper });

    expect(result.current.limits).toEqual({
      MIN: 0,
      MAX: 100,
      RSVP_THRESHOLD: 20,
      WARNING_THRESHOLD: 30,
    });
  });

  it('should maintain stable function references', () => {
    const wrapper = createWrapper(50);
    const { result, rerender } = renderHook(() => useTrustPoints(), { wrapper });

    const initialAwardPoints = result.current.awardPoints;
    const initialCanRSVP = result.current.canRSVP;
    const initialGetRSVPWarning = result.current.getRSVPWarning;
    const initialGetPointsAfterAction = result.current.getPointsAfterAction;

    rerender();

    expect(result.current.awardPoints).toBe(initialAwardPoints);
    expect(result.current.canRSVP).toBe(initialCanRSVP);
    expect(result.current.getRSVPWarning).toBe(initialGetRSVPWarning);
    expect(result.current.getPointsAfterAction).toBe(initialGetPointsAfterAction);
  });

  it('should handle different trust point actions', () => {
    const wrapper = createWrapper(50);
    const { result } = renderHook(() => useTrustPoints(), { wrapper });

    // Test ORGANIZE_EVENT (+20)
    act(() => {
      result.current.awardPoints('ORGANIZE_EVENT');
    });
    expect(result.current.currentPoints).toBe(70);

    // Test VOLUNTEER_ACTIVITY (+15)
    act(() => {
      result.current.awardPoints('VOLUNTEER_ACTIVITY');
    });
    expect(result.current.currentPoints).toBe(85);

    // Test NO_SHOW (-10)
    act(() => {
      result.current.awardPoints('NO_SHOW');
    });
    expect(result.current.currentPoints).toBe(75);

    // Test REPORT_VIOLATION (-5)
    act(() => {
      result.current.awardPoints('REPORT_VIOLATION');
    });
    expect(result.current.currentPoints).toBe(70);
  });

  it('should format trust points correctly', () => {
    const testCases = [
      { points: 0, formatted: '0' },
      { points: 25, formatted: '25' },
      { points: 100, formatted: '100' },
    ];

    testCases.forEach(({ points, formatted }) => {
      const wrapper = createWrapper(points);
      const { result } = renderHook(() => useTrustPoints(), { wrapper });

      expect(result.current.formattedPoints).toBe(formatted);
    });
  });

  it('should handle edge cases for trust levels', () => {
    // Test boundary values
    const boundaryTests = [
      { points: 19, level: 'New' },
      { points: 20, level: 'Bronze' },
      { points: 49, level: 'Bronze' },
      { points: 50, level: 'Silver' },
      { points: 69, level: 'Silver' },
      { points: 70, level: 'High' },
      { points: 89, level: 'High' },
      { points: 90, level: 'Elite' },
    ];

    boundaryTests.forEach(({ points, level }) => {
      const wrapper = createWrapper(points);
      const { result } = renderHook(() => useTrustPoints(), { wrapper });

      expect(result.current.trustLevel).toBe(level);
    });
  });
});