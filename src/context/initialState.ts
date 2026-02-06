/**
 * Initial state factory for CommuniTree application
 * Includes comprehensive mock data and data persistence integration
 */

import { AppState, TrackType } from '../types';
import { initializeAppData, applyDataConsistencyFixes } from '../utils/dataInitialization';

// Create initial state with data initialization
export const createInitialState = (overrides?: Partial<AppState>): AppState => {
  // Initialize app data with persistence
  const { initialState: persistedState, hasPersistedData } = initializeAppData();
  
  const defaultState: AppState = {
    user: null, // No default user - require authentication
    currentTrack: persistedState.currentTrack || 'impact',
    ngos: persistedState.ngos || [],
    events: persistedState.events || [],
    chatThreads: persistedState.chatThreads || [],
    ui: {
      isLoading: false,
      activeModal: null,
      notifications: [
        {
          id: 'notif_001',
          type: 'trust-points',
          title: 'Trust Points Earned!',
          message: 'You earned 5 trust points for attending the Poetry event.',
          timestamp: new Date('2024-01-15T20:00:00'),
          isRead: false,
        },
        {
          id: 'notif_002',
          type: 'event-reminder',
          title: 'Event Reminder',
          message: 'Your Watercolor Workshop starts in 2 hours!',
          timestamp: new Date('2024-01-18T12:00:00'),
          isRead: true,
        },
        {
          id: 'notif_003',
          type: 'verification',
          title: 'NGO Verification Complete',
          message: 'Green Earth Foundation has been successfully verified!',
          timestamp: new Date('2024-01-20T10:00:00'),
          isRead: false,
        },
        {
          id: 'notif_004',
          type: 'chat',
          title: 'New Message',
          message: 'You have a new message from Animal Care Society.',
          timestamp: new Date('2024-01-22T14:30:00'),
          isRead: true,
        },
      ],
      theme: persistedState.currentTrack || 'impact',
      viewMode: 'grid',
    },
    preferences: persistedState.preferences || {
      lastSelectedTrack: persistedState.currentTrack || 'impact',
      notificationsEnabled: true,
      preferredCategories: ['Poetry', 'Art', 'Environment'],
      locationPermission: false,
    },
    // Store all generated users for potential authentication
    availableUsers: persistedState.availableUsers || [],
    // Include persisted user if available
    ...persistedState,
  };

  const finalState = { ...defaultState, ...overrides };
  
  // Apply data consistency fixes
  return applyDataConsistencyFixes(finalState);
};