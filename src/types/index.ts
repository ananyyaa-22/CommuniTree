/**
 * Central export file for all TypeScript interfaces and types
 * CommuniTree Platform Data Models
 */

// Database Types (snake_case from Supabase)
export * from './database.types';

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
export * from './AppState';
export * from './AppActions';

// Constants and Enums
export * from './enums';

// Utility Types
export * from './utils';