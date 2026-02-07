/**
 * useRSVP Hook
 * 
 * Custom React hook for RSVP management.
 * Manages RSVPs for the current user with optimistic UI updates.
 * Provides methods for creating and cancelling RSVPs.
 * 
 * @see Requirements 11.4, 11.5, 11.6, 13.5, 14.6
 */

import { useState, useEffect, useCallback } from 'react';
import { rsvpService } from '../services/rsvp.service';
import type { RSVP } from '../types/models';
import { getErrorMessage } from '../utils/errors';

/**
 * Return type for useRSVP hook
 */
export interface UseRSVPReturn {
  rsvps: RSVP[];
  loading: boolean;
  error: Error | null;
  createRSVP: (eventId: string) => Promise<void>;
  cancelRSVP: (eventId: string) => Promise<void>;
  isRSVPd: (eventId: string) => boolean;
}

/**
 * Custom hook for RSVP management
 * 
 * Manages RSVPs for a specific user with optimistic UI updates.
 * Automatically fetches user's RSVPs on mount.
 * Provides methods for creating and cancelling RSVPs with error handling.
 * 
 * @param userId - User ID to manage RSVPs for
 * @returns RSVP data, loading state, error state, and RSVP management methods
 * 
 * @example
 * const { rsvps, loading, createRSVP, cancelRSVP, isRSVPd } = useRSVP(user.id);
 * 
 * const handleRSVP = async (eventId: string) => {
 *   if (isRSVPd(eventId)) {
 *     await cancelRSVP(eventId);
 *   } else {
 *     await createRSVP(eventId);
 *   }
 * };
 */
export function useRSVP(userId: string): UseRSVPReturn {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch user's RSVPs from the database
   */
  const fetchRSVPs = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const fetchedRSVPs = await rsvpService.getUserRSVPs(userId);
      setRsvps(fetchedRSVPs);
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error);
      const error = new Error(errorMessage);
      setError(error);
      console.error('Failed to fetch RSVPs:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Create a new RSVP for an event
   * Uses optimistic UI update for better perceived performance
   */
  const createRSVP = useCallback(async (eventId: string): Promise<void> => {
    if (!userId) {
      throw new Error('User must be authenticated to RSVP');
    }

    // Optimistic update - add temporary RSVP
    const optimisticRSVP: RSVP = {
      id: `temp-${Date.now()}`,
      eventId,
      userId,
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setRsvps(prev => [...prev, optimisticRSVP]);
    setError(null);

    try {
      // Create RSVP in database
      const newRSVP = await rsvpService.createRSVP(eventId, userId);
      
      // Replace optimistic RSVP with real one
      setRsvps(prev => 
        prev.map(rsvp => 
          rsvp.id === optimisticRSVP.id ? newRSVP : rsvp
        )
      );
    } catch (err) {
      // Rollback optimistic update on error
      setRsvps(prev => prev.filter(rsvp => rsvp.id !== optimisticRSVP.id));
      
      const errorMessage = getErrorMessage(err as Error);
      const error = new Error(errorMessage);
      setError(error);
      console.error('Failed to create RSVP:', err);
      throw error;
    }
  }, [userId]);

  /**
   * Cancel an existing RSVP for an event
   * Uses optimistic UI update for better perceived performance
   */
  const cancelRSVP = useCallback(async (eventId: string): Promise<void> => {
    if (!userId) {
      throw new Error('User must be authenticated to cancel RSVP');
    }

    // Find the RSVP to cancel
    const rsvpToCancel = rsvps.find(
      rsvp => rsvp.eventId === eventId && rsvp.status === 'confirmed'
    );

    if (!rsvpToCancel) {
      throw new Error('No confirmed RSVP found for this event');
    }

    // Optimistic update - update status to cancelled
    setRsvps(prev =>
      prev.map(rsvp =>
        rsvp.id === rsvpToCancel.id
          ? { ...rsvp, status: 'cancelled' as const, updatedAt: new Date() }
          : rsvp
      )
    );
    setError(null);

    try {
      // Cancel RSVP in database
      await rsvpService.cancelRSVP(eventId, userId);
    } catch (err) {
      // Rollback optimistic update on error
      setRsvps(prev =>
        prev.map(rsvp =>
          rsvp.id === rsvpToCancel.id ? rsvpToCancel : rsvp
        )
      );
      
      const errorMessage = getErrorMessage(err as Error);
      const error = new Error(errorMessage);
      setError(error);
      console.error('Failed to cancel RSVP:', err);
      throw error;
    }
  }, [userId, rsvps]);

  /**
   * Check if user has a confirmed RSVP for an event
   */
  const isRSVPd = useCallback((eventId: string): boolean => {
    return rsvps.some(
      rsvp => rsvp.eventId === eventId && rsvp.status === 'confirmed'
    );
  }, [rsvps]);

  /**
   * Fetch RSVPs when userId changes
   */
  useEffect(() => {
    fetchRSVPs();
  }, [fetchRSVPs]);

  return {
    rsvps,
    loading,
    error,
    createRSVP,
    cancelRSVP,
    isRSVPd,
  };
}
