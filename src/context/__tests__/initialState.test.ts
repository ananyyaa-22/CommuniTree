/**
 * Unit tests for initialState factory
 * Tests initial state creation and mock data generation
 */

import { createInitialState } from '../initialState';
import { AppState, TrackType } from '../../types';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('createInitialState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create initial state with default values', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const state = createInitialState();

    expect(state.user).toBeDefined();
    expect(state.user?.name).toBe('Alex Johnson');
    expect(state.user?.trustPoints).toBe(75);
    expect(state.currentTrack).toBe('impact');
    expect(state.ngos).toHaveLength(3);
    expect(state.events).toHaveLength(4);
    expect(state.chatThreads).toHaveLength(0);
    expect(state.ui.isLoading).toBe(false);
    expect(state.ui.activeModal).toBeNull();
    expect(state.ui.theme).toBe('impact');
    expect(state.ui.viewMode).toBe('grid');
    expect(state.preferences.lastSelectedTrack).toBe('impact');
  });

  it('should use saved track from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('grow');
    
    const state = createInitialState();

    expect(state.currentTrack).toBe('grow');
    expect(state.ui.theme).toBe('grow');
    expect(state.preferences.lastSelectedTrack).toBe('grow');
  });

  it('should handle invalid localStorage value gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid_track');
    
    const state = createInitialState();

    expect(state.currentTrack).toBe('impact'); // Should fallback to default
  });

  it('should apply overrides correctly', () => {
    const overrides: Partial<AppState> = {
      currentTrack: 'grow',
      user: null,
    };

    const state = createInitialState(overrides);

    expect(state.currentTrack).toBe('grow');
    expect(state.user).toBeNull();
    // Other properties should remain from default
    expect(state.ngos).toHaveLength(3);
    expect(state.events).toHaveLength(4);
  });

  it('should create mock user with correct properties', () => {
    const state = createInitialState();
    const user = state.user!;

    expect(user.id).toBe('user_001');
    expect(user.name).toBe('Alex Johnson');
    expect(user.email).toBe('alex.johnson@example.com');
    expect(user.trustPoints).toBe(75);
    expect(user.verificationStatus).toBe('verified');
    expect(user.chatHistory).toHaveLength(0);
    expect(user.eventHistory).toHaveLength(2);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('should create mock NGOs with varied verification statuses', () => {
    const state = createInitialState();
    const ngos = state.ngos;

    expect(ngos).toHaveLength(3);

    // Check verified NGOs
    const verifiedNGOs = ngos.filter(ngo => ngo.isVerified);
    expect(verifiedNGOs).toHaveLength(2);
    expect(verifiedNGOs.every(ngo => ngo.darpanId)).toBe(true);

    // Check unverified NGOs
    const unverifiedNGOs = ngos.filter(ngo => !ngo.isVerified);
    expect(unverifiedNGOs).toHaveLength(1);
    expect(unverifiedNGOs[0].darpanId).toBeUndefined();

    // Check NGO properties
    ngos.forEach(ngo => {
      expect(ngo.id).toMatch(/^ngo_\d+$/);
      expect(ngo.name).toBeDefined();
      expect(ngo.projectTitle).toBeDefined();
      expect(ngo.description).toBeDefined();
      expect(ngo.contactInfo).toBeDefined();
      expect(ngo.category).toBeDefined();
      expect(ngo.volunteersNeeded).toBeGreaterThan(0);
      expect(ngo.currentVolunteers).toBeGreaterThanOrEqual(0);
      expect(ngo.createdAt).toBeInstanceOf(Date);
      expect(ngo.updatedAt).toBeInstanceOf(Date);
    });
  });

  it('should create mock events with different categories and venues', () => {
    const state = createInitialState();
    const events = state.events;

    expect(events).toHaveLength(4);

    const categories = events.map(event => event.category);
    expect(categories).toContain('Poetry');
    expect(categories).toContain('Art');
    expect(categories).toContain('Fitness');
    expect(categories).toContain('Reading');

    // Check venue safety ratings
    const safetyRatings = events.map(event => event.venue.safetyRating);
    expect(safetyRatings).toContain('green');
    expect(safetyRatings).toContain('yellow');

    // Check event properties
    events.forEach(event => {
      expect(event.id).toMatch(/^evt_\d+$/);
      expect(event.title).toBeDefined();
      expect(event.description).toBeDefined();
      expect(event.venue).toBeDefined();
      expect(event.organizer).toBeDefined();
      expect(event.attendees).toBeInstanceOf(Array);
      expect(event.rsvpList).toBeInstanceOf(Array);
      expect(event.maxAttendees).toBeGreaterThan(0);
      expect(event.dateTime).toBeInstanceOf(Date);
      expect(event.duration).toBeGreaterThan(0);
      expect(event.isActive).toBe(true);
      expect(event.createdAt).toBeInstanceOf(Date);
      expect(event.updatedAt).toBeInstanceOf(Date);
    });
  });

  it('should create venues with correct safety ratings based on type', () => {
    const state = createInitialState();
    const venues = state.events.map(event => event.venue);

    venues.forEach(venue => {
      expect(venue.name).toBeDefined();
      expect(venue.address).toBeDefined();
      expect(venue.coordinates).toHaveLength(2);
      
      // Check safety rating matches venue type
      if (venue.type === 'public') {
        expect(venue.safetyRating).toBe('green');
      } else if (venue.type === 'commercial') {
        expect(venue.safetyRating).toBe('yellow');
      } else if (venue.type === 'private') {
        expect(venue.safetyRating).toBe('red');
      }
    });
  });

  it('should create initial notifications', () => {
    const state = createInitialState();
    const notifications = state.ui.notifications;

    expect(notifications).toHaveLength(2);
    
    const trustPointsNotif = notifications.find(n => n.type === 'trust-points');
    const eventReminderNotif = notifications.find(n => n.type === 'event-reminder');

    expect(trustPointsNotif).toBeDefined();
    expect(trustPointsNotif?.isRead).toBe(false);
    expect(eventReminderNotif).toBeDefined();
    expect(eventReminderNotif?.isRead).toBe(true);

    notifications.forEach(notification => {
      expect(notification.id).toMatch(/^notif_\d+$/);
      expect(notification.title).toBeDefined();
      expect(notification.message).toBeDefined();
      expect(notification.timestamp).toBeInstanceOf(Date);
      expect(typeof notification.isRead).toBe('boolean');
    });
  });

  it('should create preferences with default values', () => {
    const state = createInitialState();
    const preferences = state.preferences;

    expect(preferences.lastSelectedTrack).toBe('impact');
    expect(preferences.notificationsEnabled).toBe(true);
    expect(preferences.preferredCategories).toEqual(['Poetry', 'Art', 'Environment']);
    expect(preferences.locationPermission).toBe(false);
  });

  it('should handle localStorage unavailability (SSR)', () => {
    // Mock window as undefined
    const originalWindow = global.window;
    (global as any).window = undefined;

    const state = createInitialState();

    expect(state.currentTrack).toBe('impact'); // Should use default
    expect(state.ui.theme).toBe('impact');

    // Restore window
    global.window = originalWindow;
  });

  it('should create consistent mock data across calls', () => {
    const state1 = createInitialState();
    const state2 = createInitialState();

    // Should have same structure and IDs
    expect(state1.user?.id).toBe(state2.user?.id);
    expect(state1.ngos.length).toBe(state2.ngos.length);
    expect(state1.events.length).toBe(state2.events.length);
    expect(state1.ngos.map(ngo => ngo.id)).toEqual(state2.ngos.map(ngo => ngo.id));
    expect(state1.events.map(event => event.id)).toEqual(state2.events.map(event => event.id));
  });

  it('should create events with future dates', () => {
    const state = createInitialState();
    const now = new Date();

    // All mock events should be in the future for testing purposes
    state.events.forEach(event => {
      expect(event.dateTime.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  it('should create user event history with correct structure', () => {
    const state = createInitialState();
    const eventHistory = state.user?.eventHistory || [];

    expect(eventHistory).toHaveLength(2);

    eventHistory.forEach(userEvent => {
      expect(userEvent.id).toMatch(/^ue_\d+$/);
      expect(userEvent.eventId).toMatch(/^evt_\d+$/);
      expect(['attended', 'organized']).toContain(userEvent.type);
      expect(userEvent.timestamp).toBeInstanceOf(Date);
      expect(userEvent.trustPointsAwarded).toBeGreaterThan(0);
    });
  });

  it('should create NGOs with different categories', () => {
    const state = createInitialState();
    const categories = state.ngos.map(ngo => ngo.category);

    expect(categories).toContain('Environment');
    expect(categories).toContain('Education');
    expect(categories).toContain('Animal Welfare');
    expect(new Set(categories).size).toBe(3); // All different categories
  });

  it('should create events with RSVP lists', () => {
    const state = createInitialState();

    state.events.forEach(event => {
      expect(event.rsvpList).toBeInstanceOf(Array);
      // Some events should have RSVPs for testing
      if (event.rsvpList.length > 0) {
        event.rsvpList.forEach(userId => {
          expect(typeof userId).toBe('string');
          expect(userId).toMatch(/^user_\d+$/);
        });
      }
    });
  });
});