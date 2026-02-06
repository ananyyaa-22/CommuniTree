/**
 * Unit tests for useUser hook
 * Tests user-specific state management and actions
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AppProvider } from '../../context/AppContext';
import { useUser } from '../useUser';
import { User } from '../../types';

// Wrapper component for testing hooks with context
const createWrapper = (initialUser?: User | null) => {
  return ({ children }: { children: React.ReactNode }) => (
    <AppProvider initialState={{ user: initialUser }}>
      {children}
    </AppProvider>
  );
};

describe('useUser', () => {
  const mockUser: User = {
    id: 'user_test',
    name: 'Test User',
    email: 'test@example.com',
    trustPoints: 50,
    verificationStatus: 'verified',
    chatHistory: [],
    eventHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should return user data when user exists', () => {
    const wrapper = createWrapper(mockUser);
    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.trustPoints).toBe(50);
    expect(result.current.verificationStatus).toBe('verified');
  });

  it('should return null user when no user exists', () => {
    const wrapper = createWrapper(null);
    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.trustPoints).toBe(0);
    expect(result.current.verificationStatus).toBe('pending');
  });

  it('should update user data', () => {
    const wrapper = createWrapper(mockUser);
    const { result } = renderHook(() => useUser(), { wrapper });

    act(() => {
      result.current.updateUser({ name: 'Updated Name', email: 'updated@test.com' });
    });

    expect(result.current.user?.name).toBe('Updated Name');
    expect(result.current.user?.email).toBe('updated@test.com');
    expect(result.current.user?.trustPoints).toBe(50); // Should remain unchanged
  });

  it('should set user', () => {
    const wrapper = createWrapper(null);
    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current.user).toBeNull();

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should clear user when setting to null', () => {
    const wrapper = createWrapper(mockUser);
    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current.user).toEqual(mockUser);

    act(() => {
      result.current.setUser(null);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should update trust points when user exists', () => {
    const wrapper = createWrapper(mockUser);
    const { result } = renderHook(() => useUser(), { wrapper });

    act(() => {
      result.current.updateTrustPoints('ATTEND_EVENT');
    });

    expect(result.current.trustPoints).toBe(55); // 50 + 5 for ATTEND_EVENT
  });

  it('should not update trust points when no user exists', () => {
    const wrapper = createWrapper(null);
    const { result } = renderHook(() => useUser(), { wrapper });

    act(() => {
      result.current.updateTrustPoints('ATTEND_EVENT');
    });

    expect(result.current.trustPoints).toBe(0); // Should remain 0
  });

  it('should maintain stable function references', () => {
    const wrapper = createWrapper(mockUser);
    const { result, rerender } = renderHook(() => useUser(), { wrapper });

    const initialUpdateUser = result.current.updateUser;
    const initialSetUser = result.current.setUser;
    const initialUpdateTrustPoints = result.current.updateTrustPoints;

    rerender();

    expect(result.current.updateUser).toBe(initialUpdateUser);
    expect(result.current.setUser).toBe(initialSetUser);
    expect(result.current.updateTrustPoints).toBe(initialUpdateTrustPoints);
  });

  it('should handle trust point actions correctly', () => {
    const wrapper = createWrapper({ ...mockUser, trustPoints: 75 });
    const { result } = renderHook(() => useUser(), { wrapper });

    // Test different trust point actions
    act(() => {
      result.current.updateTrustPoints('ORGANIZE_EVENT');
    });
    expect(result.current.trustPoints).toBe(95); // 75 + 20

    act(() => {
      result.current.updateTrustPoints('NO_SHOW');
    });
    expect(result.current.trustPoints).toBe(85); // 95 - 10

    act(() => {
      result.current.updateTrustPoints('VERIFY_IDENTITY');
    });
    expect(result.current.trustPoints).toBe(95); // 85 + 10
  });

  it('should cap trust points at 100', () => {
    const wrapper = createWrapper({ ...mockUser, trustPoints: 95 });
    const { result } = renderHook(() => useUser(), { wrapper });

    act(() => {
      result.current.updateTrustPoints('ORGANIZE_EVENT'); // +20 points
    });

    expect(result.current.trustPoints).toBe(100); // Capped at 100
  });

  it('should not allow trust points below 0', () => {
    const wrapper = createWrapper({ ...mockUser, trustPoints: 5 });
    const { result } = renderHook(() => useUser(), { wrapper });

    act(() => {
      result.current.updateTrustPoints('NO_SHOW'); // -10 points
    });

    expect(result.current.trustPoints).toBe(0); // Cannot go below 0
  });
});