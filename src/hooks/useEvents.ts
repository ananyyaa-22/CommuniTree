/**
 * useEvents Hook
 * 
 * Custom React hook for event data management.
 * Fetches events by track type with loading and error states.
 * Provides refetch method for manual data refresh.
 * 
 * NOTE: This hook adapts the Supabase Event model to the existing component interface.
 * Some fields are populated with default values or derived from available data.
 * 
 * @see Requirements 11.4, 11.5, 11.6, 13.5
 */

import { useState, useEffect, useCallback } from 'react';
import { eventService } from '../services/event.service';
import type { Event as SupabaseEvent } from '../types/models';
import type { Event, EventCategory } from '../types/Event';
import type { User } from '../types/User';
import type { Venue } from '../types/Venue';
import { getErrorMessage } from '../utils/errors';

/**
 * Return type for useEvents hook
 */
export interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: Error | null;
  currentPage: number;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
}

/**
 * Adapt Supabase Event to component Event interface
 * Maps database fields to expected component fields
 */
function adaptSupabaseEvent(supabaseEvent: SupabaseEvent): Event {
  // Map eventType to category (default to 'Technology' if not recognized)
  const categoryMap: Record<string, EventCategory> = {
    'poetry': 'Poetry',
    'art': 'Art',
    'fitness': 'Fitness',
    'reading': 'Reading',
    'music': 'Music',
    'dance': 'Dance',
    'cooking': 'Cooking',
    'technology': 'Technology',
    'photography': 'Photography',
    'gardening': 'Gardening',
  };
  
  const category: EventCategory = categoryMap[supabaseEvent.eventType.toLowerCase()] || 'Technology';
  
  // Create a mock organizer user object
  const organizer: User = {
    id: supabaseEvent.organizerId,
    name: supabaseEvent.organizerType === 'ngo' ? 'NGO Organizer' : 'User Organizer',
    email: 'organizer@example.com',
    trustPoints: 75,
    verificationStatus: 'verified',
    chatHistory: [],
    eventHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Calculate duration in minutes (default to 120 if not calculable)
  const duration = supabaseEvent.endTime && supabaseEvent.startTime
    ? Math.round((supabaseEvent.endTime.getTime() - supabaseEvent.startTime.getTime()) / (1000 * 60))
    : 120;

  // Ensure venue exists and adapt to app Venue type
  const supabaseVenue = supabaseEvent.venue;
  const venue: Venue = supabaseVenue ? {
    id: supabaseVenue.id,
    name: supabaseVenue.name,
    address: supabaseVenue.address,
    type: 'public' as const, // Default to public
    safetyRating: supabaseVenue.safetyRating,
    coordinates: [
      supabaseVenue.latitude || 0,
      supabaseVenue.longitude || 0
    ] as [number, number],
    description: supabaseVenue.safetyNotes || undefined,
    amenities: [],
    accessibilityFeatures: [],
    createdAt: supabaseVenue.createdAt,
    updatedAt: supabaseVenue.updatedAt,
  } : {
    id: 'default',
    name: 'TBD',
    address: 'Address to be determined',
    type: 'public' as const,
    safetyRating: 'yellow' as const,
    coordinates: [0, 0] as [number, number],
    amenities: [],
    accessibilityFeatures: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    id: supabaseEvent.id,
    title: supabaseEvent.title,
    description: supabaseEvent.description || '',
    category,
    venue,
    organizer,
    attendees: [], // Will be populated when we fetch RSVPs
    rsvpList: [], // Will be populated when we fetch RSVPs
    maxAttendees: supabaseEvent.maxParticipants || 50,
    dateTime: supabaseEvent.startTime,
    duration,
    isActive: supabaseEvent.startTime > new Date(),
    createdAt: supabaseEvent.createdAt,
    updatedAt: supabaseEvent.updatedAt,
  };
}

/**
 * Custom hook for fetching events by track type with pagination
 * 
 * Automatically fetches events when the track or page changes.
 * Provides loading and error states for UI feedback.
 * Includes refetch method for manual data refresh.
 * 
 * @param track - Track type to fetch events for ('impact' or 'grow')
 * @param pageSize - Number of events per page (default: 20)
 * @returns Events data, loading state, error state, pagination controls, and refetch method
 * 
 * @example
 * const { events, loading, error, currentPage, setPage, refetch } = useEvents('impact');
 * 
 * if (loading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 * 
 * return (
 *   <div>
 *     {events.map(event => <EventCard key={event.id} event={event} />)}
 *     <Pagination currentPage={currentPage} onPageChange={setPage} />
 *     <button onClick={refetch}>Refresh</button>
 *   </div>
 * );
 */
export function useEvents(track: 'impact' | 'grow', pageSize: number = 20): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Fetch events from the database
   */
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedEvents = await eventService.getEventsByTrack(track, currentPage, pageSize);
      const adaptedEvents = fetchedEvents.map(adaptSupabaseEvent);
      setEvents(adaptedEvents);
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error);
      const error = new Error(errorMessage);
      setError(error);
      console.error(`Failed to fetch ${track} events:`, err);
    } finally {
      setLoading(false);
    }
  }, [track, currentPage, pageSize]);

  /**
   * Change page
   */
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  /**
   * Refetch events manually
   */
  const refetch = useCallback(async (): Promise<void> => {
    await fetchEvents();
  }, [fetchEvents]);

  /**
   * Fetch events when track or page changes
   */
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    currentPage,
    setPage,
    refetch,
  };
}
