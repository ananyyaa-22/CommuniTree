/**
 * Test file to validate TypeScript interfaces for CommuniTree platform
 * This ensures all interfaces are properly defined and can be used together
 */

import {
  User,
  NGO,
  Event,
  Venue,
  ChatThread,
  Message,
  AppState,
  AppActions,
  TrackType,
  VenueRating,
  EventCategory,
  NGOCategory,
  TRUST_POINT_ACTIONS,
  TRUST_POINT_LIMITS,
} from '../index';

describe('CommuniTree TypeScript Interfaces', () => {
  describe('User Interface', () => {
    it('should create a valid User object', () => {
      const user: User = {
        id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
        trustPoints: 75,
        verificationStatus: 'verified',
        chatHistory: ['chat_1', 'chat_2'],
        eventHistory: [
          {
            id: 'event_history_1',
            eventId: 'event_123',
            type: 'attended',
            timestamp: new Date(),
            trustPointsAwarded: 5,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(user.id).toBe('user_123');
      expect(user.trustPoints).toBe(75);
      expect(user.verificationStatus).toBe('verified');
    });
  });

  describe('NGO Interface', () => {
    it('should create a valid NGO object', () => {
      const ngo: NGO = {
        id: 'ngo_456',
        name: 'Green Earth Foundation',
        projectTitle: 'Tree Plantation Drive',
        description: 'Community tree planting initiative',
        darpanId: '12345',
        isVerified: true,
        contactInfo: {
          email: 'contact@greenearth.org',
          phone: '+1234567890',
        },
        category: 'Environment',
        volunteersNeeded: 20,
        currentVolunteers: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(ngo.id).toBe('ngo_456');
      expect(ngo.isVerified).toBe(true);
      expect(ngo.category).toBe('Environment');
    });
  });

  describe('Event Interface', () => {
    it('should create a valid Event object', () => {
      const venue: Venue = {
        id: 'venue_789',
        name: 'Central Park',
        address: '123 Park Avenue',
        type: 'public',
        safetyRating: 'green',
        coordinates: [40.7829, -73.9654],
        amenities: ['parking', 'restrooms'],
        accessibilityFeatures: ['wheelchair_accessible'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const organizer: User = {
        id: 'user_organizer',
        name: 'Jane Smith',
        email: 'jane@example.com',
        trustPoints: 85,
        verificationStatus: 'verified',
        chatHistory: [],
        eventHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const event: Event = {
        id: 'event_789',
        title: 'Poetry Reading Session',
        description: 'Community poetry sharing event',
        category: 'Poetry',
        venue,
        organizer,
        attendees: [],
        rsvpList: ['user_123'],
        maxAttendees: 30,
        dateTime: new Date(),
        duration: 120,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(event.id).toBe('event_789');
      expect(event.category).toBe('Poetry');
      expect(event.venue.safetyRating).toBe('green');
    });
  });

  describe('ChatThread Interface', () => {
    it('should create a valid ChatThread object', () => {
      const user1: User = {
        id: 'user_1',
        name: 'Alice',
        email: 'alice@example.com',
        trustPoints: 60,
        verificationStatus: 'verified',
        chatHistory: [],
        eventHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const ngo: NGO = {
        id: 'ngo_1',
        name: 'Help Foundation',
        projectTitle: 'Community Support',
        description: 'Supporting local community',
        isVerified: true,
        contactInfo: { email: 'help@foundation.org' },
        category: 'Community Development',
        volunteersNeeded: 10,
        currentVolunteers: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const message: Message = {
        id: 'msg_1',
        senderId: 'user_1',
        content: 'Hello, I would like to volunteer',
        timestamp: new Date(),
        type: 'text',
        isRead: false,
      };

      const chatThread: ChatThread = {
        id: 'chat_1',
        participants: [user1],
        context: {
          type: 'ngo',
          reference: ngo,
          title: 'Volunteer Inquiry',
          description: 'Discussion about volunteering opportunities',
        },
        messages: [message],
        lastActivity: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(chatThread.id).toBe('chat_1');
      expect(chatThread.context.type).toBe('ngo');
      expect(chatThread.messages).toHaveLength(1);
    });
  });

  describe('AppState Interface', () => {
    it('should create a valid AppState object', () => {
      const appState: AppState = {
        user: null,
        currentTrack: 'impact',
        ngos: [],
        events: [],
        chatThreads: [],
        ui: {
          isLoading: false,
          activeModal: null,
          notifications: [],
          theme: 'impact',
          viewMode: 'grid',
        },
        preferences: {
          lastSelectedTrack: 'impact',
          notificationsEnabled: true,
          preferredCategories: ['Environment', 'Education'],
          locationPermission: false,
        },
      };

      expect(appState.currentTrack).toBe('impact');
      expect(appState.ui.theme).toBe('impact');
      expect(appState.preferences.notificationsEnabled).toBe(true);
    });
  });

  describe('AppActions Types', () => {
    it('should create valid action objects', () => {
      const setUserAction: AppActions = {
        type: 'SET_USER',
        payload: null,
      };

      const switchTrackAction: AppActions = {
        type: 'SWITCH_TRACK',
        payload: 'grow',
      };

      const updateTrustPointsAction: AppActions = {
        type: 'UPDATE_TRUST_POINTS',
        payload: {
          userId: 'user_123',
          delta: 10,
          reason: 'ATTEND_EVENT',
        },
      };

      expect(setUserAction.type).toBe('SET_USER');
      expect(switchTrackAction.payload).toBe('grow');
      expect(updateTrustPointsAction.payload.delta).toBe(10);
    });
  });

  describe('Constants and Enums', () => {
    it('should have correct trust point values', () => {
      expect(TRUST_POINT_ACTIONS.ORGANIZE_EVENT).toBe(20);
      expect(TRUST_POINT_ACTIONS.ATTEND_EVENT).toBe(5);
      expect(TRUST_POINT_ACTIONS.NO_SHOW).toBe(-10);
      expect(TRUST_POINT_LIMITS.INITIAL).toBe(50);
      expect(TRUST_POINT_LIMITS.WARNING_THRESHOLD).toBe(20);
    });

    it('should have correct type constraints', () => {
      const trackTypes: TrackType[] = ['impact', 'grow'];
      const venueRatings: VenueRating[] = ['green', 'yellow', 'red'];
      const eventCategories: EventCategory[] = ['Poetry', 'Art', 'Fitness'];
      const ngoCategories: NGOCategory[] = ['Education', 'Healthcare'];

      expect(trackTypes).toContain('impact');
      expect(venueRatings).toContain('green');
      expect(eventCategories).toContain('Poetry');
      expect(ngoCategories).toContain('Education');
    });
  });
});