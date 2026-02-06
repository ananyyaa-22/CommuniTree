/**
 * Custom hook for event data management
 * Provides event data access and event-related actions
 */

import { useCallback, useMemo } from 'react';
import { useAppState, useAppDispatch } from './useAppState';
import { useUser } from './useUser';
import { Event, EventCategory } from '../types';

export const useEvents = () => {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { user, updateTrustPoints } = useUser();

  const rsvpToEvent = useCallback((eventId: string) => {
    if (user) {
      dispatch({ type: 'RSVP_EVENT', payload: { eventId, userId: user.id } });
      // Note: Trust points for attending are awarded when attendance is confirmed
    }
  }, [dispatch, user]);

  const cancelRSVP = useCallback((eventId: string) => {
    if (user) {
      dispatch({ type: 'CANCEL_RSVP', payload: { eventId, userId: user.id } });
      // Note: No trust point penalty for canceling RSVP (only for no-shows)
    }
  }, [dispatch, user]);

  const markAttendance = useCallback((eventId: string, attended: boolean) => {
    if (user) {
      if (attended) {
        updateTrustPoints('ATTEND_EVENT');
      } else {
        updateTrustPoints('NO_SHOW');
      }
    }
  }, [user, updateTrustPoints]);

  const updateEvent = useCallback((id: string, updates: Partial<Event>) => {
    dispatch({ type: 'UPDATE_EVENT', payload: { id, updates } });
  }, [dispatch]);

  const addEvent = useCallback((event: Event) => {
    dispatch({ type: 'ADD_EVENT', payload: event });
  }, [dispatch]);

  // Filter events by category
  const getEventsByCategory = useCallback((category: EventCategory) => 
    state.events.filter(event => event.category === category),
    [state.events]
  );

  // Upcoming events (sorted by date)
  const upcomingEvents = useMemo(() => 
    state.events
      .filter(event => event.isActive && event.dateTime > new Date())
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()),
    [state.events]
  );

  // Events user has RSVP'd to
  const userRSVPEvents = useMemo(() => 
    user ? state.events.filter(event => event.rsvpList.includes(user.id)) : [],
    [state.events, user]
  );

  // Events organized by user
  const userOrganizedEvents = useMemo(() => 
    user ? state.events.filter(event => event.organizer.id === user.id) : [],
    [state.events, user]
  );

  // Events with available spots
  const eventsWithSpots = useMemo(() => 
    state.events.filter(event => event.rsvpList.length < event.maxAttendees),
    [state.events]
  );

  // Check if user has RSVP'd to an event
  const hasUserRSVPd = useCallback((eventId: string) => {
    if (!user) return false;
    const event = state.events.find(e => e.id === eventId);
    return event ? event.rsvpList.includes(user.id) : false;
  }, [state.events, user]);

  // Get event by ID
  const findEventById = useCallback((id: string) => 
    state.events.find(event => event.id === id),
    [state.events]
  );

  // Get events by venue safety rating
  const getEventsBySafetyRating = useCallback((rating: 'green' | 'yellow' | 'red') => 
    state.events.filter(event => event.venue.safetyRating === rating),
    [state.events]
  );

  return {
    events: state.events,
    upcomingEvents,
    userRSVPEvents,
    userOrganizedEvents,
    eventsWithSpots,
    rsvpToEvent,
    cancelRSVP,
    markAttendance,
    updateEvent,
    addEvent,
    getEventsByCategory,
    getEventsBySafetyRating,
    hasUserRSVPd,
    findEventById,
    totalEvents: state.events.length,
    upcomingCount: upcomingEvents.length,
    userRSVPCount: userRSVPEvents.length,
  };
};