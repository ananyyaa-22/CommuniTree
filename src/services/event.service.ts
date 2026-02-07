/**
 * Event Service
 * 
 * Provides data access methods for event-related operations.
 * Handles event retrieval, creation, updates, deletion, and RSVP counting.
 * 
 * @see Requirements 4.1, 4.3, 4.4, 4.6, 10.3
 */

import { supabase } from '../lib/supabase';
import { DatabaseError } from '../utils/errors';
import { dbEventToEvent, eventToDbEvent } from '../utils/transformers';
import type { Event, CreateEventInput, UpdateEventInput } from '../types/models';
import type { DbEventInsert } from '../types/database.types';

/**
 * Event service interface defining all event-related operations
 */
export interface EventService {
  getEventsByTrack(track: 'impact' | 'grow', page?: number, pageSize?: number): Promise<Event[]>;
  getEventById(id: string): Promise<Event | null>;
  createEvent(event: CreateEventInput): Promise<Event>;
  updateEvent(id: string, updates: UpdateEventInput): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  getEventRSVPCount(eventId: string): Promise<number>;
}

/**
 * Get events by track type with optional pagination
 * Includes venue data in the response
 * 
 * @param track - Track type ('impact' or 'grow')
 * @param page - Page number (1-indexed, default: 1)
 * @param pageSize - Number of items per page (default: 50)
 * @returns Array of event objects with venue data
 * @throws DatabaseError on database operation failure
 */
export async function getEventsByTrack(
  track: 'impact' | 'grow',
  page: number = 1,
  pageSize: number = 50
): Promise<Event[]> {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        venue:venues(*)
      `)
      .eq('track_type', track)
      .order('start_time', { ascending: true })
      .range(from, to);

    if (error) {
      throw new DatabaseError(
        'Failed to fetch events',
        'network_error',
        { operation: 'getEventsByTrack', track, page, pageSize, error }
      );
    }

    return data.map(dbEventToEvent);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while fetching events',
      'network_error',
      { operation: 'getEventsByTrack', track, page, pageSize, error }
    );
  }
}

/**
 * Get event by ID
 * Includes venue data in the response
 * 
 * @param id - Event ID to retrieve
 * @returns Event object with venue data or null if not found
 * @throws DatabaseError on database operation failure
 */
export async function getEventById(id: string): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        venue:venues(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      // PGRST116 is the "not found" error code from PostgREST
      if (error.code === 'PGRST116') {
        return null;
      }

      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to event',
          'permission_denied',
          { operation: 'getEventById', eventId: id, error }
        );
      }

      throw new DatabaseError(
        'Failed to fetch event',
        'network_error',
        { operation: 'getEventById', eventId: id, error }
      );
    }

    return dbEventToEvent(data);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while fetching event',
      'network_error',
      { operation: 'getEventById', eventId: id, error }
    );
  }
}

/**
 * Create a new event
 * 
 * @param event - Event data to create
 * @returns Created event object with venue data
 * @throws DatabaseError on database operation failure
 */
export async function createEvent(event: CreateEventInput): Promise<Event> {
  try {
    const dbEvent: DbEventInsert = {
      title: event.title,
      description: event.description ?? null,
      event_type: event.eventType,
      track_type: event.trackType,
      organizer_id: event.organizerId,
      organizer_type: event.organizerType,
      venue_id: event.venueId ?? null,
      start_time: event.startTime.toISOString(),
      end_time: event.endTime.toISOString(),
      max_participants: event.maxParticipants ?? null,
    };

    const { data, error } = await supabase
      .from('events')
      .insert(dbEvent)
      .select(`
        *,
        venue:venues(*)
      `)
      .single();

    if (error) {
      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to create event',
          'permission_denied',
          { operation: 'createEvent', error }
        );
      }

      // Check for foreign key violations
      if (error.code === '23503') {
        if (error.message.includes('venue_id')) {
          throw new DatabaseError(
            'Venue not found',
            'constraint_violation',
            { operation: 'createEvent', error }
          );
        }
        throw new DatabaseError(
          'Invalid reference data',
          'constraint_violation',
          { operation: 'createEvent', error }
        );
      }

      // Check for check constraint violations
      if (error.code === '23514') {
        throw new DatabaseError(
          'Invalid data: check constraints failed (e.g., end_time must be after start_time)',
          'constraint_violation',
          { operation: 'createEvent', error }
        );
      }

      throw new DatabaseError(
        'Failed to create event',
        'network_error',
        { operation: 'createEvent', error }
      );
    }

    return dbEventToEvent(data);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while creating event',
      'network_error',
      { operation: 'createEvent', error }
    );
  }
}

/**
 * Update an existing event
 * 
 * @param id - Event ID to update
 * @param updates - Partial event data to update
 * @returns Updated event object with venue data
 * @throws DatabaseError on database operation failure
 */
export async function updateEvent(id: string, updates: UpdateEventInput): Promise<Event> {
  try {
    const dbUpdates = eventToDbEvent(updates);

    const { data, error } = await supabase
      .from('events')
      .update(dbUpdates)
      .eq('id', id)
      .select(`
        *,
        venue:venues(*)
      `)
      .single();

    if (error) {
      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to update event',
          'permission_denied',
          { operation: 'updateEvent', eventId: id, error }
        );
      }

      // Check for foreign key violations
      if (error.code === '23503') {
        if (error.message.includes('venue_id')) {
          throw new DatabaseError(
            'Venue not found',
            'constraint_violation',
            { operation: 'updateEvent', eventId: id, error }
          );
        }
        throw new DatabaseError(
          'Invalid reference data',
          'constraint_violation',
          { operation: 'updateEvent', eventId: id, error }
        );
      }

      // Check for check constraint violations
      if (error.code === '23514') {
        throw new DatabaseError(
          'Invalid data: check constraints failed',
          'constraint_violation',
          { operation: 'updateEvent', eventId: id, error }
        );
      }

      throw new DatabaseError(
        'Failed to update event',
        'network_error',
        { operation: 'updateEvent', eventId: id, error }
      );
    }

    if (!data) {
      throw new DatabaseError(
        'Event not found',
        'not_found',
        { operation: 'updateEvent', eventId: id }
      );
    }

    return dbEventToEvent(data);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while updating event',
      'network_error',
      { operation: 'updateEvent', eventId: id, error }
    );
  }
}

/**
 * Delete an event
 * 
 * @param id - Event ID to delete
 * @throws DatabaseError on database operation failure
 */
export async function deleteEvent(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to delete event',
          'permission_denied',
          { operation: 'deleteEvent', eventId: id, error }
        );
      }

      throw new DatabaseError(
        'Failed to delete event',
        'network_error',
        { operation: 'deleteEvent', eventId: id, error }
      );
    }
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while deleting event',
      'network_error',
      { operation: 'deleteEvent', eventId: id, error }
    );
  }
}

/**
 * Get count of confirmed RSVPs for an event
 * Uses count query for optimal performance
 * 
 * @param eventId - Event ID to count RSVPs for
 * @returns Number of confirmed RSVPs
 * @throws DatabaseError on database operation failure
 */
export async function getEventRSVPCount(eventId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('rsvps')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'confirmed');

    if (error) {
      throw new DatabaseError(
        'Failed to count event RSVPs',
        'network_error',
        { operation: 'getEventRSVPCount', eventId, error }
      );
    }

    return count ?? 0;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while counting event RSVPs',
      'network_error',
      { operation: 'getEventRSVPCount', eventId, error }
    );
  }
}

// Export as default service object
export const eventService: EventService = {
  getEventsByTrack,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventRSVPCount,
};

