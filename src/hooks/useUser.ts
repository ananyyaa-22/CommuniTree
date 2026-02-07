/**
 * Custom hook for user-specific state management
 * Provides user data access and user-related actions
 * Integrates with Supabase for real-time user data
 */

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useAppState, useAppDispatch } from './useAppState';
import { User, TrustPointAction, UserEvent } from '../types';
import { getTrustPointDelta } from '../utils/trustPoints';
import { userService } from '../services/user.service';
import { getErrorMessage } from '../utils/errors';

export const useUser = () => {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user data from Supabase when user ID changes
  useEffect(() => {
    if (state.user?.id) {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const userData = await userService.getUserById(state.user!.id);
          
          if (userData) {
            // Update local state with fresh data from database
            dispatch({
              type: 'UPDATE_USER',
              payload: {
                name: userData.displayName,
                email: userData.email,
                trustPoints: userData.trustPoints,
                verificationStatus: userData.verificationStatus === 'verified' ? 'verified' : 'pending',
                updatedAt: userData.updatedAt,
              },
            });
          }
        } catch (err) {
          console.error('Failed to fetch user data:', err);
          setError(err instanceof Error ? err : new Error('Failed to fetch user data'));
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [state.user?.id, dispatch]);

  const updateUser = useCallback((updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  }, [dispatch]);

  const updateTrustPoints = useCallback(async (reason: TrustPointAction) => {
    if (!state.user) {
      throw new Error('No user logged in');
    }

    try {
      setLoading(true);
      setError(null);

      const delta = getTrustPointDelta(reason);
      
      // Update trust points in database
      const newTrustPoints = await userService.updateTrustPoints(
        state.user.id,
        delta,
        reason
      );

      // Update local state
      dispatch({
        type: 'UPDATE_TRUST_POINTS',
        payload: { userId: state.user.id, delta, reason },
      });

      return newTrustPoints;
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error);
      const error = new Error(errorMessage);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
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

  // Update profile with validation and Supabase integration
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

    try {
      setLoading(true);
      setError(null);

      // Update user profile in Supabase
      const updatedUser = await userService.updateUser(state.user.id, {
        displayName: profileData.name.trim(),
        email: profileData.email.trim(),
      });

      // Update local state with response from database
      dispatch({
        type: 'UPDATE_USER',
        payload: {
          name: updatedUser.displayName,
          email: updatedUser.email,
          updatedAt: updatedUser.updatedAt,
        },
      });

      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error);
      const error = new Error(errorMessage);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
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
    loading,
    error,
  };
};