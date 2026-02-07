/**
 * Central export file for all TypeScript interfaces and types
 * CommuniTree Platform Data Models
 */

// Database Types (snake_case from Supabase)
// Note: We exclude TrackType from database.types to avoid conflict with AppState.TrackType
export type {
  DbUser,
  DbUserInsert,
  DbUserUpdate,
  DbNGO,
  DbNGOInsert,
  DbNGOUpdate,
  DbVenue,
  DbVenueInsert,
  DbVenueUpdate,
  DbEvent,
  DbEventInsert,
  DbEventUpdate,
  DbRSVP,
  DbRSVPInsert,
  DbRSVPUpdate,
  DbChatThread,
  DbChatThreadInsert,
  DbChatThreadUpdate,
  DbChatMessage,
  DbChatMessageInsert,
  DbChatMessageUpdate,
  DbTrustPointsHistory,
  DbTrustPointsHistoryInsert,
  VerificationStatus,
  NGOVerificationStatus,
  SafetyRating,
  OrganizerType,
  RSVPStatus,
} from './database.types';

// Application Models (camelCase for React app) - New Supabase-aligned types
// Note: These are exported with specific names to avoid conflicts with legacy types
export type {
  User as SupabaseUser,
  NGO as SupabaseNGO,
  Event as SupabaseEvent,
  Venue as SupabaseVenue,
  RSVP as SupabaseRSVP,
  ChatThread as SupabaseChatThread,
  ChatMessage as SupabaseChatMessage,
  TrustPointsHistory,
  CreateUserInput,
  CreateNGOInput,
  CreateVenueInput,
  CreateEventInput,
  CreateRSVPInput,
  CreateChatThreadInput,
  CreateChatMessageInput,
  UpdateUserInput,
  UpdateNGOInput,
  UpdateVenueInput,
  UpdateEventInput,
  UpdateRSVPInput,
} from './models';

// Legacy Core Data Models (currently in use by the app)
export * from './User';
export * from './NGO';
export * from './Event';
export * from './Venue';
export * from './ChatThread';

// Application State Management
export { AppState } from './AppState';
export * from './AppActions';


// Constants and Enums
export * from './enums';

// Utility Types
export * from './utils';

// ===== Temporary UI Types (Hackathon Fix) =====
export type ViewMode = 'grid' | 'list';

export type ModalType =
  | 'login'
  | 'signup'
  | 'chat'
  | 'event'
  | 'ngo'
  | null;

export interface Notification {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}
