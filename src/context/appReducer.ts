/**
 * Redux-style reducer for CommuniTree application state management
 * Handles all state mutations through dispatched actions with data persistence
 */

import { AppState, AppActions, TrustPointAction } from '../types';
import { calculateTrustPoints } from '../utils/trustPoints';
import { 
  saveTrustPoints, 
  saveNGOVerification, 
  saveEventRSVP,
  persistAppState 
} from '../utils/dataPersistence';

// Trust point values for different actions
const TRUST_POINT_VALUES: Record<TrustPointAction, number> = {
  ORGANIZE_EVENT: 20,
  ATTEND_EVENT: 5,
  NO_SHOW: -10,
  VERIFY_IDENTITY: 10,
  REPORT_VIOLATION: -5,
  VOLUNTEER_ACTIVITY: 15,
  COMMUNITY_CONTRIBUTION: 10,
};

export const appReducer = (state: AppState, action: AppActions): AppState => {
  switch (action.type) {
    // Sync with storage action
    case 'SYNC_WITH_STORAGE':
      return action.payload;

    // User actions
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'UPDATE_USER':
      if (!state.user) return state;
      const updatedUser = {
        ...state.user,
        ...action.payload,
        updatedAt: new Date(),
      };
      return {
        ...state,
        user: updatedUser,
      };

    case 'UPDATE_TRUST_POINTS': {
      if (!state.user || state.user.id !== action.payload.userId) return state;
      
      const delta = action.payload.delta;
      const newTrustPoints = Math.max(0, Math.min(100, state.user.trustPoints + delta));
      
      const updatedState = {
        ...state,
        user: {
          ...state.user,
          trustPoints: newTrustPoints,
          updatedAt: new Date(),
        },
      };

      // Persist trust points immediately
      if (typeof window !== 'undefined') {
        saveTrustPoints(state.user.id, newTrustPoints);
      }
      
      return updatedState;
    }

    case 'ADD_ENGAGEMENT_EVENT': {
      if (!state.user) return state;
      
      const newEvent = {
        ...action.payload,
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      
      return {
        ...state,
        user: {
          ...state.user,
          eventHistory: [...state.user.eventHistory, newEvent],
          updatedAt: new Date(),
        },
      };
    }

    case 'UPDATE_ENGAGEMENT_HISTORY': {
      if (!state.user) return state;
      
      return {
        ...state,
        user: {
          ...state.user,
          eventHistory: action.payload,
          updatedAt: new Date(),
        },
      };
    }

    // Track actions
    case 'SWITCH_TRACK':
      return {
        ...state,
        currentTrack: action.payload,
        ui: {
          ...state.ui,
          theme: action.payload,
        },
        preferences: {
          ...state.preferences,
          lastSelectedTrack: action.payload,
        },
      };

    case 'SET_THEME':
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload,
        },
      };

    // NGO actions
    case 'SET_NGOS':
      return {
        ...state,
        ngos: action.payload,
      };

    case 'ADD_NGO':
      return {
        ...state,
        ngos: [...state.ngos, action.payload],
      };

    case 'UPDATE_NGO':
      return {
        ...state,
        ngos: state.ngos.map(ngo =>
          ngo.id === action.payload.id
            ? { ...ngo, ...action.payload.updates, updatedAt: new Date() }
            : ngo
        ),
      };

    case 'VERIFY_NGO': {
      const updatedState = {
        ...state,
        ngos: state.ngos.map(ngo =>
          ngo.id === action.payload.id
            ? {
                ...ngo,
                darpanId: action.payload.darpanId,
                isVerified: true,
                updatedAt: new Date(),
              }
            : ngo
        ),
      };

      // Persist NGO verification immediately
      if (typeof window !== 'undefined') {
        saveNGOVerification(action.payload.id, true, action.payload.darpanId);
      }

      return updatedState;
    }

    // Event actions
    case 'SET_EVENTS':
      return {
        ...state,
        events: action.payload,
      };

    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload],
      };

    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(event =>
          event.id === action.payload.id
            ? { ...event, ...action.payload.updates, updatedAt: new Date() }
            : event
        ),
      };

    case 'RSVP_EVENT': {
      const { eventId, userId } = action.payload;
      const updatedState = {
        ...state,
        events: state.events.map(event =>
          event.id === eventId
            ? {
                ...event,
                rsvpList: [...event.rsvpList, userId],
                updatedAt: new Date(),
              }
            : event
        ),
      };

      // Persist RSVP immediately
      if (typeof window !== 'undefined') {
        saveEventRSVP(userId, eventId, true);
      }

      return updatedState;
    }

    case 'CANCEL_RSVP': {
      const { eventId, userId } = action.payload;
      const updatedState = {
        ...state,
        events: state.events.map(event =>
          event.id === eventId
            ? {
                ...event,
                rsvpList: event.rsvpList.filter(id => id !== userId),
                updatedAt: new Date(),
              }
            : event
        ),
      };

      // Persist RSVP cancellation immediately
      if (typeof window !== 'undefined') {
        saveEventRSVP(userId, eventId, false);
      }

      return updatedState;
    }

    // Chat actions
    case 'SET_CHAT_THREADS':
      return {
        ...state,
        chatThreads: action.payload,
      };

    case 'ADD_CHAT_THREAD':
      return {
        ...state,
        chatThreads: [...state.chatThreads, action.payload],
      };

    case 'UPDATE_CHAT_THREAD':
      return {
        ...state,
        chatThreads: state.chatThreads.map(thread =>
          thread.id === action.payload.id
            ? { ...thread, ...action.payload.updates, lastActivity: new Date() }
            : thread
        ),
      };

    case 'SEND_MESSAGE': {
      const { threadId, message } = action.payload;
      return {
        ...state,
        chatThreads: state.chatThreads.map(thread =>
          thread.id === threadId
            ? {
                ...thread,
                messages: [...thread.messages, message],
                lastActivity: new Date(),
              }
            : thread
        ),
      };
    }

    case 'MARK_MESSAGES_READ': {
      const { threadId, messageIds } = action.payload;
      return {
        ...state,
        chatThreads: state.chatThreads.map(thread =>
          thread.id === threadId
            ? {
                ...thread,
                messages: thread.messages.map(msg =>
                  messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
                ),
              }
            : thread
        ),
      };
    }

    // UI actions
    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoading: action.payload,
        },
      };

    case 'SHOW_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          activeModal: action.payload,
        },
      };

    case 'HIDE_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          activeModal: null,
        },
      };

    case 'SET_VIEW_MODE':
      return {
        ...state,
        ui: {
          ...state.ui,
          viewMode: action.payload,
        },
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, action.payload],
        },
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(
            notification => notification.id !== action.payload
          ),
        },
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.map(notification =>
            notification.id === action.payload
              ? { ...notification, isRead: true }
              : notification
          ),
        },
      };

    // Preferences actions
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      };

    default:
      return state;
  }
};