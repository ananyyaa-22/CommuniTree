/**
 * RSVP Service
 * 
 * Provides data access methods for RSVP-related operations.
 * Handles RSVP creation, cancellation, retrieval, and status updates.
 * Includes validation for event capacity and duplicate prevention.
 * 
 * @see Requirements 4.1, 4.3, 4.4, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
 */

import { supabase } from '../lib/supabase';
import { DatabaseError, ValidationError } from '../utils/errors';
import { dbRSVPToRSVP } from '../utils/transformers';
import { getEventById, getEventRSVPCount } from './event.service';
import type { RSVP } from '../types/models';
import type { DbRSVPInsert } from '../types/database.types';

/**
 * RSVP service interface defining all RSVP-related operations
 */
export interface RSVPService {
  createRSVP(eventId: string, userId: string): Promise<RSVP>;
  cancelRSVP(eventId: string, userId: string): Promise<void>;
  getUserRSVPs(userId: string): Promise<RSVP[]>;
  getEventRSVPs(eventId: string): Promise<RSVP[]>;
  updateRSVPStatus(id: string, status: 'confirmed' | 'cancelled' | 'attended' | 'no_show'): Promise<RSVP>;
}

/**
 * Create a new RSVP for an event
 * Validates event capacity and prevents duplicate RSVPs
 * 
 * @param eventId - Event ID to RSVP to
 * @param userId - User ID creating the RSVP
 * @returns Created RSVP object with status 'confirmed'
 * @throws ValidationError if event is full or user already RSVP'd
 * @throws DatabaseError on database operation failure
 */
export async function createRSVP(eventId: string, userId: string): Promise<RSVP> {
  try {
    // Check if event exists
    const event = await getEventById(eventId);
    if (!event) {
      throw new ValidationError('Event not found', 'eventId', 'exists');
    }

    // Check if event is full
    if (event.maxParticipants) {
      const rsvpCount = await getEventRSVPCount(eventId);
      if (rsvpCount >= event.maxParticipants) {
        throw new ValidationError('Event is full', 'eventId', 'capacity');
      }
    }

    const dbRSVP: DbRSVPInsert = {
      event_id: eventId,
      user_id: userId,
      status: 'confirmed',
    };

    const { data, error } = await supabase
      .from('rsvps')
      .insert(dbRSVP)
      .select('id, event_id, user_id, status, created_at, updated_at')
      .single();

    if (error) {
      // Check for unique constraint violation (duplicate RSVP)
      if (error.code === '23505') {
        throw new ValidationError(
          'You have already RSVP\'d to this event',
          'eventId',
          'unique'
        );
      }

      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to create RSVP',
          'permission_denied',
          { operation: 'createRSVP', eventId, userId, error }
        );
      }

      // Check for foreign key violations
      if (error.code === '23503') {
        throw new DatabaseError(
          'Invalid event or user reference',
          'constraint_violation',
          { operation: 'createRSVP', eventId, userId, error }
        );
      }

      throw new DatabaseError(
        'Failed to create RSVP',
        'network_error',
        { operation: 'createRSVP', eventId, userId, error }
      );
    }

    return dbRSVPToRSVP(data);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while creating RSVP',
      'network_error',
      { operation: 'createRSVP', eventId, userId, error }
    );
  }
}

/**
 * Cancel an existing RSVP
 * Updates the RSVP status to 'cancelled'
 * 
 * @param eventId - Event ID of the RSVP
 * @param userId - User ID of the RSVP
 * @throws DatabaseError on database operation failure
 */
export async function cancelRSVP(eventId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('rsvps')
      .update({ status: 'cancelled' })
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .eq('status', 'confirmed');

    if (error) {
      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to cancel RSVP',
          'permission_denied',
          { operation: 'cancelRSVP', eventId, userId, error }
        );
      }

      throw new DatabaseError(
        'Failed to cancel RSVP',
        'network_error',
        { operation: 'cancelRSVP', eventId, userId, error }
      );
    }
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while cancelling RSVP',
      'network_error',
      { operation: 'cancelRSVP', eventId, userId, error }
    );
  }
}

/**
 * Get all RSVPs for a user
 * 
 * @param userId - User ID to get RSVPs for
 * @returns Array of RSVP objects
 * @throws DatabaseError on database operation failure
 */
export async function getUserRSVPs(userId: string): Promise<RSVP[]> {
  try {
    const { data, error } = await supabase
      .from('rsvps')
      .select('id, event_id, user_id, status, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to view RSVPs',
          'permission_denied',
          { operation: 'getUserRSVPs', userId, error }
        );
      }

      throw new DatabaseError(
        'Failed to fetch user RSVPs',
        'network_error',
        { operation: 'getUserRSVPs', userId, error }
      );
    }

    return data.map(dbRSVPToRSVP);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while fetching user RSVPs',
      'network_error',
      { operation: 'getUserRSVPs', userId, error }
    );
  }
}

/**
 * Get all RSVPs for an event
 * 
 * @param eventId - Event ID to get RSVPs for
 * @returns Array of RSVP objects
 * @throws DatabaseError on database operation failure
 */
export async function getEventRSVPs(eventId: string): Promise<RSVP[]> {
  try {
    const { data, error } = await supabase
      .from('rsvps')
      .select('id, event_id, user_id, status, created_at, updated_at')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to view event RSVPs',
          'permission_denied',
          { operation: 'getEventRSVPs', eventId, error }
        );
      }

      throw new DatabaseError(
        'Failed to fetch event RSVPs',
        'network_error',
        { operation: 'getEventRSVPs', eventId, error }
      );
    }

    return data.map(dbRSVPToRSVP);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while fetching event RSVPs',
      'network_error',
      { operation: 'getEventRSVPs', eventId, error }
    );
  }
}

/**
 * Update RSVP status
 * Used by event organizers to mark attendance
 * 
 * @param id - RSVP ID to update
 * @param status - New RSVP status
 * @returns Updated RSVP object
 * @throws DatabaseError on database operation failure
 */
export async function updateRSVPStatus(
  id: string,
  status: 'confirmed' | 'cancelled' | 'attended' | 'no_show'
): Promise<RSVP> {
  try {
    const { data, error } = await supabase
      .from('rsvps')
      .update({ status })
      .eq('id', id)
      .select('id, event_id, user_id, status, created_at, updated_at')
      .single();

    if (error) {
      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to update RSVP status',
          'permission_denied',
          { operation: 'updateRSVPStatus', rsvpId: id, error }
        );
      }

      throw new DatabaseError(
        'Failed to update RSVP status',
        'network_error',
        { operation: 'updateRSVPStatus', rsvpId: id, error }
      );
    }

    if (!data) {
      throw new DatabaseError(
        'RSVP not found',
        'not_found',
        { operation: 'updateRSVPStatus', rsvpId: id }
      );
    }

    return dbRSVPToRSVP(data);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while updating RSVP status',
      'network_error',
      { operation: 'updateRSVPStatus', rsvpId: id, error }
    );
  }
}

// Export as default service object
export const rsvpService: RSVPService = {
  createRSVP,
  cancelRSVP,
  getUserRSVPs,
  getEventRSVPs,
  updateRSVPStatus,
};

