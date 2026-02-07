/**
 * Global application state interfaces and types for CommuniTree platform
 */

import { User } from './User';
import { NGO } from './NGO';
import { Event } from './Event';
import { ChatThread } from './ChatThread';

export interface AppState {
  user: User | null;
  currentTrack: TrackType;
  ngos: NGO[];
  events: Event[];
  chatThreads: ChatThread[];
  ui: UIState;
  preferences: UserPreferences;
  availableUsers?: User[]; // For mock authentication during development
}

export interface UIState {
  isLoading: boolean;
  activeModal: ModalType | null;
  notifications: Notification[];
  theme: ThemeType;
  viewMode: ViewMode;
}

export interface UserPreferences {
  lastSelectedTrack: TrackType;
  notificationsEnabled: boolean;
  preferredCategories: string[];
  locationPermission: boolean;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

export type TrackType = 'impact' | 'grow';

export type ModalType = 
  | 'verification'
  | 'chat'
  | 'rsvp'
  | 'profile'
  | 'trust-warning'
  | 'login'
  | 'signup'
  | 'event'
  | 'ngo';

export type ThemeType = 'impact' | 'grow';

export type ViewMode = 'grid' | 'list';

export type NotificationType = 
  | 'trust-points'
  | 'event-reminder'
  | 'chat-message'
  | 'chat'
  | 'verification'
  | 'system'
  | 'success'
  | 'error'
  | 'info';