/**
 * Custom hook for user-specific state management
 * Provides user data access and user-related actions
 */

import { useCallback, useMemo } from 'react';
import { useAppState, useAppDispatch } from './useAppState';
import { User, TrustPointAction, UserEvent } from '../types';
import { getTrustPointDelta } from '../utils/trustPoints';

export const useUser = () => {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const updateUser = useCallback((updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  }, [dispatch]);

  const updateTrustPoints = useCallback((reason: TrustPointAction) => {
    if (state.user) {
      const delta = getTrustPointDelta(reason);
      dispatch({
        type: 'UPDATE_TRUST_POINTS',
        payload: { userId: state.user.id, delta, reason },
      });
    }
  }, [dispatch, state.user]);

  const setUser = useCallback((user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, [dispatch]);

  // Add engagement history tracking
  const addEngagementEvent = useCallback((eventData: Omit<UserEvent, 'id'>) => {
    if (state.user) {
      const newEvent: UserEvent = {
        ...eventData,
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      
      const updatedEventHistory = [...state.user.eventHistory, newEvent];
      
      dispatch({
        type: 'UPDATE_USER',
        payload: {
          eventHistory: updatedEventHistory,
        },
      });
    }
  }, [dispatch, state.user]);

  // Update profile with validation
  const updateProfile = useCallback(async (profileData: { name: string; email: string }) => {
    if (!state.user) {
      throw new Error('No user logged in');
    }

    // Validate input
    if (!profileData.name.trim()) {
      throw new Error('Name is required');
    }
    
    if (!profileData.email.trim()) {
      throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      throw new Error('Invalid email format');
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update user profile
    dispatch({
      type: 'UPDATE_USER',
      payload: {
        name: profileData.name.trim(),
        email: profileData.email.trim(),
        updatedAt: new Date(),
      },
    });

    return true;
  }, [dispatch, state.user]);

  // Calculate community impact metrics
  const communityImpactMetrics = useMemo(() => {
    if (!state.user) {
      return {
        totalEvents: 0,
        eventsOrganized: 0,
        eventsAttended: 0,
        totalTrustPointsEarned: 0,
        totalTrustPointsLost: 0,
        attendanceRate: 100,
        noShows: 0,
        reliabilityScore: 'Excellent' as const,
        communityContributions: 0,
        volunteerActivities: 0,
      };
    }

    const activities = state.user.eventHistory;
    const eventsOrganized = activities.filter(e => e.type === 'organized').length;
    const eventsAttended = activities.filter(e => e.type === 'attended').length;
    const rsvpEvents = activities.filter(e => e.type === 'rsvp').length;
    const noShows = activities.filter(e => e.type === 'no_show').length;
    const totalTrustPointsEarned = activities.reduce((sum, e) => sum + Math.max(0, e.trustPointsAwarded), 0);
    const totalTrustPointsLost = Math.abs(activities.reduce((sum, e) => sum + Math.min(0, e.trustPointsAwarded), 0));
    
    const attendanceRate = rsvpEvents > 0 ? (eventsAttended / rsvpEvents) * 100 : 100;
    
    let reliabilityScore: 'Excellent' | 'Good' | 'Needs Improvement';
    if (noShows === 0) {
      reliabilityScore = 'Excellent';
    } else if (noShows <= 2) {
      reliabilityScore = 'Good';
    } else {
      reliabilityScore = 'Needs Improvement';
    }

    return {
      totalEvents: activities.length,
      eventsOrganized,
      eventsAttended,
      totalTrustPointsEarned,
      totalTrustPointsLost,
      attendanceRate,
      noShows,
      reliabilityScore,
      communityContributions: activities.filter(e => 
        e.trustPointsAwarded > 0 && ['organized', 'attended'].includes(e.type)
      ).length,
      volunteerActivities: activities.filter(e => e.type === 'attended').length,
    };
  }, [state.user]);

  return {
    user: state.user,
    updateUser,
    updateTrustPoints,
    setUser,
    addEngagementEvent,
    updateProfile,
    communityImpactMetrics,
    isAuthenticated: !!state.user,
    trustPoints: state.user?.trustPoints || 0,
    verificationStatus: state.user?.verificationStatus || 'pending',
  };
};