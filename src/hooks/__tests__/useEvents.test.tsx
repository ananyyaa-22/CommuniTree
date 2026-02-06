/**
 * Unit tests for useEvents hook
 * Tests event data management and event-related actions
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AppProvider } from '../../context/AppContext';
import { useEvents } from '../useEvents';
import { Event, User, Venue } from '../../types';

// Mock data
const mockUser: User = {
  id: 'user_test',
  name: 'Test User',
  email: 'test@example.com',
  trustPoints: 75,
  verificationStatus: 'verified',
  chatHistory: [],
  eventHistory: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockVenue: Venue = {
  id: 'venue_test',
  name: 'Test Venue',
  address: 'Test Address',
  type: 'public',
  safetyRating: 'green',
  coordinates: [0, 0],
  amenities: ['parking', 'restrooms'],
  accessibilityFeatures: ['wheelchair_accessible'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEvent: Event = {
  id: 'evt_test',
  title: 'Test Event',
  description: 'Test Description',
  category: 'Art',
  venue: mockVenue,
  organizer: mockUser,
  attendees: [],
  rsvpList: [],
  maxAttendees: 10,
  dateTime: new Date('2024-12-31T18:00:00'),
  duration: 120,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPastEvent: Event = {
  ...mockEvent,
  id: 'evt_past',
  title: 'Past Event',
  dateTime: new Date('2023-01-01T18:00:00'),
};

// Wrapper component for testing hooks with context
const createWrapper = (events: Event[] = [mockEvent], user: User | null = mockUser) => {
  return ({ children }: { children: React.ReactNode }) => (
    <AppProvider initialState={{ events, user }}>
      {children}
    </AppProvider>
  );
};

describe('useEvents', () => {
  it('should return events data', () => {
    const wrapper = createWrapper([mockEvent]);
    const { result } = renderHook(() => useEvents(), { wrapper });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0]).toEqual(mockEvent);
    expect(result.current.totalEvents).toBe(1);
  });

  it('should handle RSVP to event', () => {
    const wrapper = createWrapper([mockEvent]);
    const { result } = renderHook(() => useEvents(), { wrapper });

    act(() => {
      result.current.rsvpToEvent('evt_test');
    });

    const event = result.current.findEventById('evt_test');
    expect(event?.rsvpList).toContain('user_test');
  });

  it('should handle RSVP cancellation', () => {
    const eventWithRSVP = { ...mockEvent, rsvpList: ['user_test'] };
    const wrapper = createWrapper([eventWithRSVP]);
    const { result } = renderHook(() => useEvents(), { wrapper });

    act(() => {
      result.current.cancelRSVP('evt_test');
    });

    const event = result.current.findEventById('evt_test');
    expect(event?.rsvpList).not.toContain('user_test');
  });

  it('should not RSVP when no user is authenticated', () => {
    const wrapper = createWrapper([mockEvent], null);
    const { result } = renderHook(() => useEvents(), { wrapper });

    act(() => {
      result.current.rsvpToEvent('evt_test');
    });

    const event = result.current.findEventById('evt_test');
    expect(event?.rsvpList).toHaveLength(0);
  });

  it('should add new event', () => {
    const wrapper = createWrapper([]);
    const { result } = renderHook(() => useEvents(), { wrapper });

    act(() => {
      result.current.addEvent(mockEvent);
    });

    expect(result.current.events).toContain(mockEvent);
    expect(result.current.totalEvents).toBe(1);
  });

  it('should update event', () => {
    const wrapper = createWrapper([mockEvent]);
    const { result } = renderHook(() => useEvents(), { wrapper });

    const updates = { title: 'Updated Event Title', maxAttendees: 20 };

    act(() => {
      result.current.updateEvent('evt_test', updates);
    });

    const updatedEvent = result.current.findEventById('evt_test');
    expect(updatedEvent?.title).toBe('Updated Event Title');
    expect(updatedEvent?.maxAttendees).toBe(20);
  });

  it('should filter events by category', () => {
    const artEvent = { ...mockEvent, category: 'Art' as const };
    const poetryEvent = { ...mockEvent, id: 'evt_poetry', category: 'Poetry' as const };
    const wrapper = createWrapper([artEvent, poetryEvent]);
    const { result } = renderHook(() => useEvents(), { wrapper });

    const artEvents = result.current.getEventsByCategory('Art');
    const poetryEvents = result.current.getEventsByCategory('Poetry');

    expect(artEvents).toHaveLength(1);
    expect(artEvents[0].category).toBe('Art');
    expect(poetryEvents).toHaveLength(1);
    expect(poetryEvents[0].category).toBe('Poetry');
  });

  it('should return upcoming events sorted by date', () => {
    const futureEvent1 = { ...mockEvent, id: 'evt_future1', dateTime: new Date('2024-12-25T18:00:00') };
    const futureEvent2 = { ...mockEvent, id: 'evt_future2', dateTime: new Date('2024-12-20T18:00:00') };
    const wrapper = createWrapper([futureEvent1, futureEvent2, mockPastEvent]);
    const { result } = renderHook(() => useEvents(), { wrapper });

    const upcoming = result.current.upcomingEvents;
    expect(upcoming).toHaveLength(2);
    expect(upcoming[0].id).toBe('evt_future2'); // Earlier date first
    expect(upcoming[1].id).toBe('evt_future1');
    expect(result.current.upcomingCount).toBe(2);
  });

  it('should return user RSVP events', () => {
    const eventWithUserRSVP = { ...mockEvent, rsvpList: ['user_test'] };
    const eventWithoutUserRSVP = { ...mockEvent, id: 'evt_no_rsvp', rsvpList: ['other_user'] };
    const wrapper = createWrapper([eventWithUserRSVP, eventWithoutUserRSVP]);
    const { result } = renderHook(() => useEvents(), { wrapper });

    const userRSVPEvents = result.current.userRSVPEvents;
    expect(userRSVPEvents).toHaveLength(1);
    expect(userRSVPEvents[0].id).toBe('evt_test');
    expect(result.current.userRSVPCount).toBe(1);
  });

  it('should return user organized events', () => {
    const userOrganizedEvent = { ...mockEvent, organizer: mockUser };
    const otherUserEvent = { ...mockEvent, id: 'evt_other', organizer: { ...mockUser, id: 'other_user' } };
    const wrapper = createWrapper([userOrganizedEvent, otherUserEvent]);
    const { result } = renderHook(() => useEvents(), { wrapper });

    const organizedEvents = result.current.userOrganizedEvents;
    expect(organizedEvents).toHaveLength(1);
    expect(organizedEvents[0].id).toBe('evt_test');
  });

  it('should return events with available spots', () => {
    const fullEvent = { ...mockEvent, id: 'evt_full', rsvpList: Array(10).fill('user'), maxAttendees: 10 };
    const availableEvent = { ...mockEvent, id: 'evt_available', rsvpList: ['user1'], maxAttendees: 10 };
    const wrapper = createWrapper([fullEvent, availableEvent]);
    const { result } = renderHook(() => useEvents(), { wrapper });

    const eventsWithSpots = result.current.eventsWithSpots;
    expect(eventsWithSpots).toHaveLength(1);
    expect(eventsWithSpots[0].id).toBe('evt_available');
  });

  it('should check if user has RSVP\'d to event', () => {
    const eventWithUserRSVP = { ...mockEvent, rsvpList: ['user_test'] };
    const wrapper = createWrapper([eventWithUserRSVP]);
    const { result } = renderHook(() => useEvents(), { wrapper });

    expect(result.current.hasUserRSVPd('evt_test')).toBe(true);
    expect(result.current.hasUserRSVPd('nonexistent_event')).toBe(false);
  });

  it('should find event by ID', () => {
    const wrapper = createWrapper([mockEvent]);
    const { result } = renderHook(() => useEvents(), { wrapper });

    const foundEvent = result.current.findEventById('evt_test');
    expect(foundEvent).toEqual(mockEvent);

    const notFoundEvent = result.current.findEventById('nonexistent');
    expect(notFoundEvent).toBeUndefined();
  });

  it('should filter events by safety rating', () => {
    const greenEvent = { ...mockEvent, venue: { ...mockVenue, safetyRating: 'green' as const } };
    const yellowEvent = { ...mockEvent, id: 'evt_yellow', venue: { ...mockVenue, safetyRating: 'yellow' as const } };
    const redEvent = { ...mockEvent, id: 'evt_red', venue: { ...mockVenue, safetyRating: 'red' as const } };
    const wrapper = createWrapper([greenEvent, yellowEvent, redEvent]);
    const { result } = renderHook(() => useEvents(), { wrapper });

    const greenEvents = result.current.getEventsBySafetyRating('green');
    const yellowEvents = result.current.getEventsBySafetyRating('yellow');
    const redEvents = result.current.getEventsBySafetyRating('red');

    expect(greenEvents).toHaveLength(1);
    expect(yellowEvents).toHaveLength(1);
    expect(redEvents).toHaveLength(1);
  });

  it('should maintain stable function references', () => {
    const wrapper = createWrapper([mockEvent]);
    const { result, rerender } = renderHook(() => useEvents(), { wrapper });

    const initialRsvpToEvent = result.current.rsvpToEvent;
    const initialCancelRSVP = result.current.cancelRSVP;
    const initialUpdateEvent = result.current.updateEvent;
    const initialAddEvent = result.current.addEvent;

    rerender();

    expect(result.current.rsvpToEvent).toBe(initialRsvpToEvent);
    expect(result.current.cancelRSVP).toBe(initialCancelRSVP);
    expect(result.current.updateEvent).toBe(initialUpdateEvent);
    expect(result.current.addEvent).toBe(initialAddEvent);
  });

  it('should handle empty events array', () => {
    const wrapper = createWrapper([]);
    const { result } = renderHook(() => useEvents(), { wrapper });

    expect(result.current.events).toHaveLength(0);
    expect(result.current.totalEvents).toBe(0);
    expect(result.current.upcomingEvents).toHaveLength(0);
    expect(result.current.userRSVPEvents).toHaveLength(0);
    expect(result.current.userOrganizedEvents).toHaveLength(0);
    expect(result.current.eventsWithSpots).toHaveLength(0);
  });

  it('should handle unauthenticated user scenarios', () => {
    const wrapper = createWrapper([mockEvent], null);
    const { result } = renderHook(() => useEvents(), { wrapper });

    expect(result.current.userRSVPEvents).toHaveLength(0);
    expect(result.current.userOrganizedEvents).toHaveLength(0);
    expect(result.current.hasUserRSVPd('evt_test')).toBe(false);
  });
});