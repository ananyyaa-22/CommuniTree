/**
 * Unit tests for appReducer functionality
 * Tests all action types and state mutations
 */

import { appReducer } from '../appReducer';
import { AppState, AppActions, User, NGO, Event, ChatThread, Message } from '../../types';
import { createInitialState } from '../initialState';
import { createVenueWithRating } from '../../utils/venueRating';

describe('appReducer', () => {
  let initialState: AppState;

  beforeEach(() => {
    initialState = createInitialState();
  });

  describe('User Actions', () => {
    it('should set user', () => {
      const newUser: User = {
        id: 'user_test',
        name: 'Test User',
        email: 'test@example.com',
        trustPoints: 50,
        verificationStatus: 'pending',
        chatHistory: [],
        eventHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const action: AppActions = { type: 'SET_USER', payload: newUser };
      const newState = appReducer(initialState, action);

      expect(newState.user).toEqual(newUser);
      expect(newState).not.toBe(initialState); // Immutability check
    });

    it('should clear user when payload is null', () => {
      const action: AppActions = { type: 'SET_USER', payload: null };
      const newState = appReducer(initialState, action);

      expect(newState.user).toBeNull();
    });

    it('should update user properties', () => {
      const updates = { name: 'Updated Name', email: 'updated@example.com' };
      const action: AppActions = { type: 'UPDATE_USER', payload: updates };
      const newState = appReducer(initialState, action);

      expect(newState.user?.name).toBe('Updated Name');
      expect(newState.user?.email).toBe('updated@example.com');
      expect(newState.user?.trustPoints).toBe(75); // Should remain unchanged
      expect(newState.user?.updatedAt).toBeInstanceOf(Date);
    });

    it('should not update user if no user exists', () => {
      const stateWithoutUser = { ...initialState, user: null };
      const action: AppActions = { type: 'UPDATE_USER', payload: { name: 'Test' } };
      const newState = appReducer(stateWithoutUser, action);

      expect(newState.user).toBeNull();
      expect(newState).toEqual(stateWithoutUser);
    });

    it('should update trust points correctly', () => {
      const action: AppActions = {
        type: 'UPDATE_TRUST_POINTS',
        payload: { userId: 'user_001', delta: 0, reason: 'ATTEND_EVENT' }
      };
      const newState = appReducer(initialState, action);

      expect(newState.user?.trustPoints).toBe(80); // 75 + 5 (ATTEND_EVENT)
    });

    it('should cap trust points at 100', () => {
      const highTrustState = {
        ...initialState,
        user: { ...initialState.user!, trustPoints: 95 }
      };
      const action: AppActions = {
        type: 'UPDATE_TRUST_POINTS',
        payload: { userId: 'user_001', delta: 0, reason: 'ORGANIZE_EVENT' }
      };
      const newState = appReducer(highTrustState, action);

      expect(newState.user?.trustPoints).toBe(100); // Capped at 100
    });

    it('should not allow trust points below 0', () => {
      const lowTrustState = {
        ...initialState,
        user: { ...initialState.user!, trustPoints: 5 }
      };
      const action: AppActions = {
        type: 'UPDATE_TRUST_POINTS',
        payload: { userId: 'user_001', delta: 0, reason: 'NO_SHOW' }
      };
      const newState = appReducer(lowTrustState, action);

      expect(newState.user?.trustPoints).toBe(0); // Cannot go below 0
    });

    it('should not update trust points for wrong user', () => {
      const action: AppActions = {
        type: 'UPDATE_TRUST_POINTS',
        payload: { userId: 'wrong_user', delta: 0, reason: 'ATTEND_EVENT' }
      };
      const newState = appReducer(initialState, action);

      expect(newState.user?.trustPoints).toBe(75); // Unchanged
    });
  });

  describe('Track Actions', () => {
    it('should switch track and update theme', () => {
      const action: AppActions = { type: 'SWITCH_TRACK', payload: 'grow' };
      const newState = appReducer(initialState, action);

      expect(newState.currentTrack).toBe('grow');
      expect(newState.ui.theme).toBe('grow');
      expect(newState.preferences.lastSelectedTrack).toBe('grow');
    });

    it('should set theme independently', () => {
      const action: AppActions = { type: 'SET_THEME', payload: 'grow' };
      const newState = appReducer(initialState, action);

      expect(newState.ui.theme).toBe('grow');
      expect(newState.currentTrack).toBe('impact'); // Should remain unchanged
    });
  });

  describe('NGO Actions', () => {
    const mockNGO: NGO = {
      id: 'ngo_test',
      name: 'Test NGO',
      projectTitle: 'Test Project',
      description: 'Test Description',
      isVerified: false,
      contactInfo: {
        email: 'test@ngo.org',
        phone: '+91-1234567890',
        address: 'Test Address',
      },
      category: 'Education',
      volunteersNeeded: 10,
      currentVolunteers: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should set NGOs', () => {
      const ngos = [mockNGO];
      const action: AppActions = { type: 'SET_NGOS', payload: ngos };
      const newState = appReducer(initialState, action);

      expect(newState.ngos).toEqual(ngos);
    });

    it('should add NGO', () => {
      const action: AppActions = { type: 'ADD_NGO', payload: mockNGO };
      const newState = appReducer(initialState, action);

      expect(newState.ngos).toContain(mockNGO);
      expect(newState.ngos.length).toBe(initialState.ngos.length + 1);
    });

    it('should update NGO', () => {
      const updates = { name: 'Updated NGO Name', volunteersNeeded: 20 };
      const action: AppActions = {
        type: 'UPDATE_NGO',
        payload: { id: 'ngo_001', updates }
      };
      const newState = appReducer(initialState, action);

      const updatedNGO = newState.ngos.find(ngo => ngo.id === 'ngo_001');
      expect(updatedNGO?.name).toBe('Updated NGO Name');
      expect(updatedNGO?.volunteersNeeded).toBe(20);
      expect(updatedNGO?.updatedAt).toBeInstanceOf(Date);
    });

    it('should verify NGO', () => {
      const action: AppActions = {
        type: 'VERIFY_NGO',
        payload: { id: 'ngo_002', darpanId: '54321' }
      };
      const newState = appReducer(initialState, action);

      const verifiedNGO = newState.ngos.find(ngo => ngo.id === 'ngo_002');
      expect(verifiedNGO?.darpanId).toBe('54321');
      expect(verifiedNGO?.isVerified).toBe(true);
      expect(verifiedNGO?.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Event Actions', () => {
    const mockEvent: Event = {
      id: 'evt_test',
      title: 'Test Event',
      description: 'Test Description',
      category: 'Art',
      venue: createVenueWithRating({
        id: 'venue_test',
        name: 'Test Venue',
        address: 'Test Address',
        type: 'public',
        coordinates: [0, 0],
        amenities: [],
        accessibilityFeatures: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      organizer: initialState.user!,
      attendees: [],
      rsvpList: [],
      maxAttendees: 10,
      dateTime: new Date(),
      duration: 120,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should set events', () => {
      const events = [mockEvent];
      const action: AppActions = { type: 'SET_EVENTS', payload: events };
      const newState = appReducer(initialState, action);

      expect(newState.events).toEqual(events);
    });

    it('should add event', () => {
      const action: AppActions = { type: 'ADD_EVENT', payload: mockEvent };
      const newState = appReducer(initialState, action);

      expect(newState.events).toContain(mockEvent);
      expect(newState.events.length).toBe(initialState.events.length + 1);
    });

    it('should update event', () => {
      const updates = { title: 'Updated Event Title', maxAttendees: 20 };
      const action: AppActions = {
        type: 'UPDATE_EVENT',
        payload: { id: 'evt_001', updates }
      };
      const newState = appReducer(initialState, action);

      const updatedEvent = newState.events.find(event => event.id === 'evt_001');
      expect(updatedEvent?.title).toBe('Updated Event Title');
      expect(updatedEvent?.maxAttendees).toBe(20);
      expect(updatedEvent?.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle RSVP to event', () => {
      const action: AppActions = {
        type: 'RSVP_EVENT',
        payload: { eventId: 'evt_001', userId: 'user_test' }
      };
      const newState = appReducer(initialState, action);

      const event = newState.events.find(e => e.id === 'evt_001');
      expect(event?.rsvpList).toContain('user_test');
      expect(event?.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle RSVP cancellation', () => {
      // First add an RSVP
      const stateWithRSVP = appReducer(initialState, {
        type: 'RSVP_EVENT',
        payload: { eventId: 'evt_001', userId: 'user_test' }
      });

      // Then cancel it
      const action: AppActions = {
        type: 'CANCEL_RSVP',
        payload: { eventId: 'evt_001', userId: 'user_test' }
      };
      const newState = appReducer(stateWithRSVP, action);

      const event = newState.events.find(e => e.id === 'evt_001');
      expect(event?.rsvpList).not.toContain('user_test');
    });
  });

  describe('Chat Actions', () => {
    const mockMessage: Message = {
      id: 'msg_001',
      senderId: 'user_001',
      content: 'Test message',
      timestamp: new Date(),
      type: 'text',
      isRead: false,
    };

    const mockChatThread: ChatThread = {
      id: 'thread_001',
      participants: [initialState.user!],
      context: initialState.ngos[0],
      messages: [],
      lastActivity: new Date(),
      isActive: true,
      createdAt: new Date(),
    };

    it('should set chat threads', () => {
      const threads = [mockChatThread];
      const action: AppActions = { type: 'SET_CHAT_THREADS', payload: threads };
      const newState = appReducer(initialState, action);

      expect(newState.chatThreads).toEqual(threads);
    });

    it('should add chat thread', () => {
      const action: AppActions = { type: 'ADD_CHAT_THREAD', payload: mockChatThread };
      const newState = appReducer(initialState, action);

      expect(newState.chatThreads).toContain(mockChatThread);
    });

    it('should send message to thread', () => {
      // First add a thread
      const stateWithThread = appReducer(initialState, {
        type: 'ADD_CHAT_THREAD',
        payload: mockChatThread
      });

      // Then send a message
      const action: AppActions = {
        type: 'SEND_MESSAGE',
        payload: { threadId: 'thread_001', message: mockMessage }
      };
      const newState = appReducer(stateWithThread, action);

      const thread = newState.chatThreads.find(t => t.id === 'thread_001');
      expect(thread?.messages).toContain(mockMessage);
      expect(thread?.lastActivity).toBeInstanceOf(Date);
    });

    it('should mark messages as read', () => {
      // Setup state with thread and unread message
      const threadWithMessage = {
        ...mockChatThread,
        messages: [mockMessage]
      };
      const stateWithMessage = {
        ...initialState,
        chatThreads: [threadWithMessage]
      };

      const action: AppActions = {
        type: 'MARK_MESSAGES_READ',
        payload: { threadId: 'thread_001', messageIds: ['msg_001'] }
      };
      const newState = appReducer(stateWithMessage, action);

      const thread = newState.chatThreads.find(t => t.id === 'thread_001');
      const message = thread?.messages.find(m => m.id === 'msg_001');
      expect(message?.isRead).toBe(true);
    });
  });

  describe('UI Actions', () => {
    it('should set loading state', () => {
      const action: AppActions = { type: 'SET_LOADING', payload: true };
      const newState = appReducer(initialState, action);

      expect(newState.ui.isLoading).toBe(true);
    });

    it('should show modal', () => {
      const action: AppActions = { type: 'SHOW_MODAL', payload: 'verification' };
      const newState = appReducer(initialState, action);

      expect(newState.ui.activeModal).toBe('verification');
    });

    it('should hide modal', () => {
      const stateWithModal = {
        ...initialState,
        ui: { ...initialState.ui, activeModal: 'verification' as const }
      };
      const action: AppActions = { type: 'HIDE_MODAL' };
      const newState = appReducer(stateWithModal, action);

      expect(newState.ui.activeModal).toBeNull();
    });

    it('should set view mode', () => {
      const action: AppActions = { type: 'SET_VIEW_MODE', payload: 'list' };
      const newState = appReducer(initialState, action);

      expect(newState.ui.viewMode).toBe('list');
    });

    it('should add notification', () => {
      const notification = {
        id: 'notif_test',
        type: 'trust-points' as const,
        title: 'Test Notification',
        message: 'Test message',
        timestamp: new Date(),
        isRead: false,
      };
      const action: AppActions = { type: 'ADD_NOTIFICATION', payload: notification };
      const newState = appReducer(initialState, action);

      expect(newState.ui.notifications).toContain(notification);
    });

    it('should remove notification', () => {
      const action: AppActions = { type: 'REMOVE_NOTIFICATION', payload: 'notif_001' };
      const newState = appReducer(initialState, action);

      const notification = newState.ui.notifications.find(n => n.id === 'notif_001');
      expect(notification).toBeUndefined();
    });

    it('should mark notification as read', () => {
      const action: AppActions = { type: 'MARK_NOTIFICATION_READ', payload: 'notif_001' };
      const newState = appReducer(initialState, action);

      const notification = newState.ui.notifications.find(n => n.id === 'notif_001');
      expect(notification?.isRead).toBe(true);
    });
  });

  describe('Preferences Actions', () => {
    it('should update preferences', () => {
      const updates = {
        notificationsEnabled: false,
        preferredCategories: ['Poetry', 'Fitness']
      };
      const action: AppActions = { type: 'UPDATE_PREFERENCES', payload: updates };
      const newState = appReducer(initialState, action);

      expect(newState.preferences.notificationsEnabled).toBe(false);
      expect(newState.preferences.preferredCategories).toEqual(['Poetry', 'Fitness']);
      expect(newState.preferences.lastSelectedTrack).toBe('impact'); // Should remain unchanged
    });
  });

  describe('Unknown Actions', () => {
    it('should return unchanged state for unknown action', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION' } as any;
      const newState = appReducer(initialState, unknownAction);

      expect(newState).toBe(initialState);
    });
  });

  describe('State Immutability', () => {
    it('should not mutate original state', () => {
      const originalState = { ...initialState };
      const action: AppActions = { type: 'SWITCH_TRACK', payload: 'grow' };
      
      appReducer(initialState, action);

      expect(initialState).toEqual(originalState);
    });

    it('should create new state object for mutations', () => {
      const action: AppActions = { type: 'SET_LOADING', payload: true };
      const newState = appReducer(initialState, action);

      expect(newState).not.toBe(initialState);
      expect(newState.ui).not.toBe(initialState.ui);
    });
  });
});