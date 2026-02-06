/**
 * Redux-style action types for CommuniTree application state management
 */

import { User } from './User';
import { NGO } from './NGO';
import { Event } from './Event';
import { ChatThread, Message } from './ChatThread';
import { TrackType, ModalType, ViewMode, Notification } from './AppState';

export type AppActions =
  // Sync action
  | { type: 'SYNC_WITH_STORAGE'; payload: import('./AppState').AppState }
  
  // User actions
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'UPDATE_TRUST_POINTS'; payload: { userId: string; delta: number; reason: TrustPointAction } }
  | { type: 'ADD_ENGAGEMENT_EVENT'; payload: Omit<import('./User').UserEvent, 'id'> }
  | { type: 'UPDATE_ENGAGEMENT_HISTORY'; payload: import('./User').UserEvent[] }
  
  // Track actions
  | { type: 'SWITCH_TRACK'; payload: TrackType }
  | { type: 'SET_THEME'; payload: TrackType }
  
  // NGO actions
  | { type: 'SET_NGOS'; payload: NGO[] }
  | { type: 'ADD_NGO'; payload: NGO }
  | { type: 'UPDATE_NGO'; payload: { id: string; updates: Partial<NGO> } }
  | { type: 'VERIFY_NGO'; payload: { id: string; darpanId: string } }
  
  // Event actions
  | { type: 'SET_EVENTS'; payload: Event[] }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: { id: string; updates: Partial<Event> } }
  | { type: 'RSVP_EVENT'; payload: { eventId: string; userId: string } }
  | { type: 'CANCEL_RSVP'; payload: { eventId: string; userId: string } }
  
  // Chat actions
  | { type: 'SET_CHAT_THREADS'; payload: ChatThread[] }
  | { type: 'ADD_CHAT_THREAD'; payload: ChatThread }
  | { type: 'UPDATE_CHAT_THREAD'; payload: { id: string; updates: Partial<ChatThread> } }
  | { type: 'SEND_MESSAGE'; payload: { threadId: string; message: Message } }
  | { type: 'MARK_MESSAGES_READ'; payload: { threadId: string; messageIds: string[] } }
  
  // UI actions
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SHOW_MODAL'; payload: ModalType }
  | { type: 'HIDE_MODAL' }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  
  // Preferences actions
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<import('./AppState').UserPreferences> };

export type TrustPointAction = 
  | 'ORGANIZE_EVENT'
  | 'ATTEND_EVENT'
  | 'NO_SHOW'
  | 'VERIFY_IDENTITY'
  | 'REPORT_VIOLATION'
  | 'VOLUNTEER_ACTIVITY'
  | 'COMMUNITY_CONTRIBUTION';