# Design Document: Supabase Database Integration

## Overview

This design outlines the integration of Supabase as the backend database and authentication system for the CommuniTree application. The integration replaces the current mock data system with a production-ready PostgreSQL database, real-time subscriptions, and secure authentication.

### Architecture Goals

- **Separation of Concerns**: Clear boundaries between data access, business logic, and UI components
- **Type Safety**: Full TypeScript integration with database schema types
- **Security First**: Row Level Security (RLS) policies protecting all user data
- **Real-time Capable**: Live updates for chat and dynamic content
- **Performance Optimized**: Efficient queries with proper indexing and caching
- **Developer Experience**: Clean APIs and comprehensive error handling

### Technology Stack

- **Database**: Supabase (PostgreSQL 15+)
- **Authentication**: Supabase Auth with email/password
- **Client Library**: @supabase/supabase-js v2.x
- **Type Generation**: supabase-js type generation from database schema
- **Real-time**: Supabase Realtime for live subscriptions

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Components  │  │    Hooks     │  │   Context    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  Data Access    │                        │
│                   │     Layer       │                        │
│                   └────────┬────────┘                        │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │ Supabase Client │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Supabase API   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   PostgreSQL   │  │  Supabase Auth  │  │    Realtime    │
│    Database    │  │                 │  │  Subscriptions │
└────────────────┘  └─────────────────┘  └────────────────┘
```

### Data Flow Patterns

**Read Operations**:
1. Component requests data via custom hook
2. Hook calls data access layer function
3. Data access layer queries Supabase client
4. Supabase client sends request to API
5. RLS policies filter results based on user identity
6. Data returns through layers with type safety
7. Component receives typed data and renders

**Write Operations**:
1. Component triggers action (e.g., RSVP to event)
2. Hook validates input and calls data access function
3. Data access layer sends mutation to Supabase
4. RLS policies verify user has permission
5. Database executes transaction
6. Success/error returns to component
7. Component updates UI optimistically or shows error

**Real-time Updates**:
1. Component subscribes to data changes via hook
2. Hook establishes Supabase real-time subscription
3. Database change triggers notification
4. Supabase pushes update to subscribed clients
5. Hook receives update and updates React state
6. Component re-renders with new data


## Components and Interfaces

### Supabase Client Configuration

**File**: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
```

### Authentication Service

**File**: `src/services/auth.service.ts`

```typescript
interface AuthService {
  signUp(email: string, password: string, displayName: string): Promise<User>
  signIn(email: string, password: string): Promise<User>
  signOut(): Promise<void>
  resetPassword(email: string): Promise<void>
  getCurrentUser(): Promise<User | null>
  onAuthStateChange(callback: (user: User | null) => void): () => void
}
```

**Key Methods**:
- `signUp`: Creates new user account and profile record
- `signIn`: Authenticates user and returns session
- `signOut`: Invalidates current session
- `resetPassword`: Sends password reset email
- `getCurrentUser`: Retrieves current authenticated user
- `onAuthStateChange`: Subscribes to auth state changes

### Data Access Layer

**File**: `src/services/database.service.ts`

The data access layer provides typed functions for all database operations:

```typescript
// User Operations
interface UserService {
  getUserById(id: string): Promise<User | null>
  updateUser(id: string, updates: Partial<User>): Promise<User>
  updateTrustPoints(userId: string, delta: number): Promise<number>
}

// NGO Operations
interface NGOService {
  getAllNGOs(): Promise<NGO[]>
  getNGOById(id: string): Promise<NGO | null>
  createNGO(ngo: CreateNGOInput): Promise<NGO>
  updateNGOVerification(id: string, status: VerificationStatus): Promise<NGO>
  searchNGOs(query: string): Promise<NGO[]>
}

// Event Operations
interface EventService {
  getEventsByTrack(track: 'impact' | 'grow'): Promise<Event[]>
  getEventById(id: string): Promise<Event | null>
  createEvent(event: CreateEventInput): Promise<Event>
  updateEvent(id: string, updates: Partial<Event>): Promise<Event>
  deleteEvent(id: string): Promise<void>
  getEventRSVPCount(eventId: string): Promise<number>
}

// RSVP Operations
interface RSVPService {
  createRSVP(eventId: string, userId: string): Promise<RSVP>
  cancelRSVP(eventId: string, userId: string): Promise<void>
  getUserRSVPs(userId: string): Promise<RSVP[]>
  getEventRSVPs(eventId: string): Promise<RSVP[]>
  updateRSVPStatus(id: string, status: RSVPStatus): Promise<RSVP>
}

// Chat Operations
interface ChatService {
  getChatThreads(userId: string): Promise<ChatThread[]>
  getChatThread(threadId: string): Promise<ChatThread | null>
  createChatThread(userId: string, ngoId: string): Promise<ChatThread>
  getMessages(threadId: string): Promise<ChatMessage[]>
  sendMessage(threadId: string, senderId: string, senderType: 'user' | 'ngo', content: string): Promise<ChatMessage>
  subscribeToMessages(threadId: string, callback: (message: ChatMessage) => void): () => void
}

// Venue Operations
interface VenueService {
  getVenueById(id: string): Promise<Venue | null>
  createVenue(venue: CreateVenueInput): Promise<Venue>
  updateVenueSafety(id: string, rating: SafetyRating, notes?: string): Promise<Venue>
}
```

### Custom React Hooks

**File**: `src/hooks/useAuth.ts`

```typescript
interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: Error | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

function useAuth(): UseAuthReturn
```

**File**: `src/hooks/useEvents.ts`

```typescript
interface UseEventsReturn {
  events: Event[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

function useEvents(track: 'impact' | 'grow'): UseEventsReturn
```

**File**: `src/hooks/useRSVP.ts`

```typescript
interface UseRSVPReturn {
  rsvps: RSVP[]
  loading: boolean
  error: Error | null
  createRSVP: (eventId: string) => Promise<void>
  cancelRSVP: (eventId: string) => Promise<void>
  isRSVPd: (eventId: string) => boolean
}

function useRSVP(userId: string): UseRSVPReturn
```

**File**: `src/hooks/useChat.ts`

```typescript
interface UseChatReturn {
  threads: ChatThread[]
  messages: ChatMessage[]
  loading: boolean
  error: Error | null
  sendMessage: (content: string) => Promise<void>
  selectThread: (threadId: string) => void
}

function useChat(userId: string, activeThreadId?: string): UseChatReturn
```


## Data Models

### Database Schema

**Users Table**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  trust_points INTEGER NOT NULL DEFAULT 50 CHECK (trust_points >= 0 AND trust_points <= 100),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_trust_points ON users(trust_points);
```

**NGOs Table**

```sql
CREATE TABLE ngos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  darpan_id TEXT UNIQUE CHECK (darpan_id ~ '^[0-9]{5}$'),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ngos_verification_status ON ngos(verification_status);
CREATE INDEX idx_ngos_darpan_id ON ngos(darpan_id);
```

**Venues Table**

```sql
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  safety_rating TEXT NOT NULL DEFAULT 'yellow' CHECK (safety_rating IN ('green', 'yellow', 'red')),
  safety_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_venues_safety_rating ON venues(safety_rating);
CREATE INDEX idx_venues_location ON venues(latitude, longitude);
```

**Events Table**

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  track_type TEXT NOT NULL CHECK (track_type IN ('impact', 'grow')),
  organizer_id UUID NOT NULL,
  organizer_type TEXT NOT NULL CHECK (organizer_type IN ('user', 'ngo')),
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_participants INTEGER CHECK (max_participants > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);

CREATE INDEX idx_events_track_type ON events(track_type);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_organizer ON events(organizer_id, organizer_type);
CREATE INDEX idx_events_venue ON events(venue_id);
```

**RSVPs Table**

```sql
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no_show')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_rsvps_event ON rsvps(event_id);
CREATE INDEX idx_rsvps_user ON rsvps(user_id);
CREATE INDEX idx_rsvps_status ON rsvps(status);
```

**Chat Threads Table**

```sql
CREATE TABLE chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_ngo_id UUID NOT NULL REFERENCES ngos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(participant_user_id, participant_ngo_id)
);

CREATE INDEX idx_chat_threads_user ON chat_threads(participant_user_id);
CREATE INDEX idx_chat_threads_ngo ON chat_threads(participant_ngo_id);
```

**Chat Messages Table**

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ngo')),
  sender_id UUID NOT NULL,
  message_content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_thread ON chat_messages(thread_id, created_at);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id, sender_type);
```

**Trust Points History Table** (for audit trail)

```sql
CREATE TABLE trust_points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  related_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trust_points_history_user ON trust_points_history(user_id, created_at);
```

### TypeScript Type Definitions

**File**: `src/types/database.types.ts`

These types are auto-generated from the database schema using Supabase CLI:

```typescript
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string
          trust_points: number
          verification_status: 'unverified' | 'verified'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name: string
          trust_points?: number
          verification_status?: 'unverified' | 'verified'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          trust_points?: number
          verification_status?: 'unverified' | 'verified'
          updated_at?: string
        }
      }
      // ... similar definitions for other tables
    }
  }
}
```

### Application Type Definitions

**File**: `src/types/models.ts`

```typescript
export interface User {
  id: string
  email: string
  displayName: string
  trustPoints: number
  verificationStatus: 'unverified' | 'verified'
  createdAt: Date
  updatedAt: Date
}

export interface NGO {
  id: string
  name: string
  description: string | null
  darpanId: string | null
  verificationStatus: 'pending' | 'verified' | 'rejected'
  contactEmail: string
  contactPhone: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Venue {
  id: string
  name: string
  address: string
  latitude: number | null
  longitude: number | null
  safetyRating: 'green' | 'yellow' | 'red'
  safetyNotes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Event {
  id: string
  title: string
  description: string | null
  eventType: string
  trackType: 'impact' | 'grow'
  organizerId: string
  organizerType: 'user' | 'ngo'
  venueId: string | null
  venue?: Venue
  startTime: Date
  endTime: Date
  maxParticipants: number | null
  rsvpCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface RSVP {
  id: string
  eventId: string
  userId: string
  status: 'confirmed' | 'cancelled' | 'attended' | 'no_show'
  createdAt: Date
  updatedAt: Date
}

export interface ChatThread {
  id: string
  participantUserId: string
  participantNgoId: string
  user?: User
  ngo?: NGO
  lastMessage?: ChatMessage
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  threadId: string
  senderType: 'user' | 'ngo'
  senderId: string
  messageContent: string
  createdAt: Date
}
```

### Data Transformation Utilities

**File**: `src/utils/transformers.ts`

Functions to convert between database snake_case and application camelCase:

```typescript
function dbUserToUser(dbUser: Database['public']['Tables']['users']['Row']): User
function userToDbUser(user: Partial<User>): Database['public']['Tables']['users']['Update']
function dbEventToEvent(dbEvent: any): Event
function eventToDbEvent(event: Partial<Event>): any
// ... similar functions for other models
```


## Row Level Security (RLS) Policies

### Users Table Policies

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own record
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own record (except trust_points)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- New users can insert their own record (triggered by auth.users insert)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### NGOs Table Policies

```sql
-- Enable RLS
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;

-- Anyone can read verified NGOs
CREATE POLICY "Anyone can view verified NGOs"
  ON ngos FOR SELECT
  USING (verification_status = 'verified');

-- Authenticated users can create NGO profiles
CREATE POLICY "Authenticated users can create NGOs"
  ON ngos FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- NGO admins can update their own NGO (requires additional admin table)
CREATE POLICY "NGO admins can update their NGO"
  ON ngos FOR UPDATE
  USING (id IN (
    SELECT ngo_id FROM ngo_admins WHERE user_id = auth.uid()
  ));
```

### Events Table Policies

```sql
-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can read all events
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (true);

-- Authenticated users can create events
CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    (organizer_type = 'user' AND organizer_id = auth.uid()) OR
    (organizer_type = 'ngo' AND organizer_id IN (
      SELECT ngo_id FROM ngo_admins WHERE user_id = auth.uid()
    ))
  );

-- Organizers can update their own events
CREATE POLICY "Organizers can update own events"
  ON events FOR UPDATE
  USING (
    (organizer_type = 'user' AND organizer_id = auth.uid()) OR
    (organizer_type = 'ngo' AND organizer_id IN (
      SELECT ngo_id FROM ngo_admins WHERE user_id = auth.uid()
    ))
  );

-- Organizers can delete their own events
CREATE POLICY "Organizers can delete own events"
  ON events FOR DELETE
  USING (
    (organizer_type = 'user' AND organizer_id = auth.uid()) OR
    (organizer_type = 'ngo' AND organizer_id IN (
      SELECT ngo_id FROM ngo_admins WHERE user_id = auth.uid()
    ))
  );
```

### RSVPs Table Policies

```sql
-- Enable RLS
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Users can view their own RSVPs
CREATE POLICY "Users can view own RSVPs"
  ON rsvps FOR SELECT
  USING (user_id = auth.uid());

-- Event organizers can view RSVPs for their events
CREATE POLICY "Organizers can view event RSVPs"
  ON rsvps FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE 
        (organizer_type = 'user' AND organizer_id = auth.uid()) OR
        (organizer_type = 'ngo' AND organizer_id IN (
          SELECT ngo_id FROM ngo_admins WHERE user_id = auth.uid()
        ))
    )
  );

-- Users can create RSVPs for themselves
CREATE POLICY "Users can create own RSVPs"
  ON rsvps FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own RSVPs
CREATE POLICY "Users can update own RSVPs"
  ON rsvps FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Event organizers can update RSVP status (for attendance marking)
CREATE POLICY "Organizers can update RSVP status"
  ON rsvps FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM events WHERE 
        (organizer_type = 'user' AND organizer_id = auth.uid()) OR
        (organizer_type = 'ngo' AND organizer_id IN (
          SELECT ngo_id FROM ngo_admins WHERE user_id = auth.uid()
        ))
    )
  );
```

### Chat Threads Table Policies

```sql
-- Enable RLS
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

-- Users can view threads they participate in
CREATE POLICY "Users can view own threads"
  ON chat_threads FOR SELECT
  USING (participant_user_id = auth.uid());

-- NGO admins can view threads for their NGO
CREATE POLICY "NGO admins can view NGO threads"
  ON chat_threads FOR SELECT
  USING (
    participant_ngo_id IN (
      SELECT ngo_id FROM ngo_admins WHERE user_id = auth.uid()
    )
  );

-- Users can create threads with NGOs
CREATE POLICY "Users can create threads"
  ON chat_threads FOR INSERT
  TO authenticated
  WITH CHECK (participant_user_id = auth.uid());
```

### Chat Messages Table Policies

```sql
-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in their threads
CREATE POLICY "Users can view thread messages"
  ON chat_messages FOR SELECT
  USING (
    thread_id IN (
      SELECT id FROM chat_threads WHERE participant_user_id = auth.uid()
    )
  );

-- NGO admins can view messages in their threads
CREATE POLICY "NGO admins can view thread messages"
  ON chat_messages FOR SELECT
  USING (
    thread_id IN (
      SELECT id FROM chat_threads WHERE participant_ngo_id IN (
        SELECT ngo_id FROM ngo_admins WHERE user_id = auth.uid()
      )
    )
  );

-- Thread participants can send messages
CREATE POLICY "Thread participants can send messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    (sender_type = 'user' AND sender_id = auth.uid() AND thread_id IN (
      SELECT id FROM chat_threads WHERE participant_user_id = auth.uid()
    )) OR
    (sender_type = 'ngo' AND thread_id IN (
      SELECT id FROM chat_threads WHERE participant_ngo_id IN (
        SELECT ngo_id FROM ngo_admins WHERE user_id = auth.uid()
      )
    ))
  );
```

### Venues Table Policies

```sql
-- Enable RLS
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Anyone can read venues
CREATE POLICY "Anyone can view venues"
  ON venues FOR SELECT
  USING (true);

-- Authenticated users can create venues
CREATE POLICY "Authenticated users can create venues"
  ON venues FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only admins can update venue safety ratings (requires admin role)
CREATE POLICY "Admins can update venues"
  ON venues FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );
```

## Database Functions and Triggers

### Auto-update Timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ngos_updated_at BEFORE UPDATE ON ngos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rsvps_updated_at BEFORE UPDATE ON rsvps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_threads_updated_at BEFORE UPDATE ON chat_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Trust Points Management Function

```sql
CREATE OR REPLACE FUNCTION update_trust_points(
  p_user_id UUID,
  p_delta INTEGER,
  p_reason TEXT,
  p_event_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_new_points INTEGER;
BEGIN
  -- Update trust points with bounds checking
  UPDATE users
  SET trust_points = GREATEST(0, LEAST(100, trust_points + p_delta))
  WHERE id = p_user_id
  RETURNING trust_points INTO v_new_points;
  
  -- Log the change
  INSERT INTO trust_points_history (user_id, delta, reason, related_event_id)
  VALUES (p_user_id, p_delta, p_reason, p_event_id);
  
  RETURN v_new_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Auto-create User Profile on Signup

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Update Chat Thread Timestamp on New Message

```sql
CREATE OR REPLACE FUNCTION update_chat_thread_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_threads
  SET updated_at = NEW.created_at
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_thread_on_new_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_chat_thread_on_message();
```


## Error Handling

### Error Types and Handling Strategy

**Authentication Errors**:
```typescript
class AuthError extends Error {
  constructor(
    message: string,
    public code: 'invalid_credentials' | 'email_exists' | 'weak_password' | 'network_error'
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

// Usage in auth service
async signIn(email: string, password: string): Promise<User> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new AuthError('Invalid email or password', 'invalid_credentials')
      }
      throw new AuthError(error.message, 'network_error')
    }
    
    return transformUser(data.user)
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError('An unexpected error occurred', 'network_error')
  }
}
```

**Database Errors**:
```typescript
class DatabaseError extends Error {
  constructor(
    message: string,
    public code: 'not_found' | 'permission_denied' | 'constraint_violation' | 'network_error',
    public details?: any
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Usage in data access layer
async getEventById(id: string): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*, venue:venues(*)')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      if (error.message.includes('permission denied')) {
        throw new DatabaseError('Access denied', 'permission_denied')
      }
      throw new DatabaseError('Failed to fetch event', 'network_error', error)
    }
    
    return transformEvent(data)
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('An unexpected error occurred', 'network_error')
  }
}
```

**Validation Errors**:
```typescript
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public constraint: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Usage in service layer
async createRSVP(eventId: string, userId: string): Promise<RSVP> {
  // Check if event is full
  const event = await getEventById(eventId)
  if (!event) {
    throw new ValidationError('Event not found', 'eventId', 'exists')
  }
  
  if (event.maxParticipants) {
    const rsvpCount = await getEventRSVPCount(eventId)
    if (rsvpCount >= event.maxParticipants) {
      throw new ValidationError('Event is full', 'eventId', 'capacity')
    }
  }
  
  // Check if user already RSVP'd
  const { data, error } = await supabase
    .from('rsvps')
    .insert({ event_id: eventId, user_id: userId })
    .select()
    .single()
  
  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new ValidationError('Already RSVP\'d to this event', 'eventId', 'unique')
    }
    throw new DatabaseError('Failed to create RSVP', 'network_error', error)
  }
  
  return transformRSVP(data)
}
```

### Error Handling in React Hooks

```typescript
function useEvents(track: 'impact' | 'grow'): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await eventService.getEventsByTrack(track)
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      console.error('Failed to fetch events:', err)
    } finally {
      setLoading(false)
    }
  }, [track])
  
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])
  
  return { events, loading, error, refetch: fetchEvents }
}
```

### Retry Logic for Network Errors

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on validation or permission errors
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        if (error.code === 'permission_denied' || error.code === 'constraint_violation') {
          throw error
        }
      }
      
      // Wait before retrying
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)))
      }
    }
  }
  
  throw lastError!
}
```

### User-Facing Error Messages

```typescript
function getErrorMessage(error: Error): string {
  if (error instanceof AuthError) {
    switch (error.code) {
      case 'invalid_credentials':
        return 'Invalid email or password. Please try again.'
      case 'email_exists':
        return 'An account with this email already exists.'
      case 'weak_password':
        return 'Password must be at least 8 characters long.'
      default:
        return 'Authentication failed. Please try again.'
    }
  }
  
  if (error instanceof DatabaseError) {
    switch (error.code) {
      case 'not_found':
        return 'The requested item was not found.'
      case 'permission_denied':
        return 'You don\'t have permission to perform this action.'
      default:
        return 'Something went wrong. Please try again.'
    }
  }
  
  if (error instanceof ValidationError) {
    return error.message
  }
  
  return 'An unexpected error occurred. Please try again.'
}
```

## Testing Strategy

### Testing Approach Overview

The Supabase integration will be tested using a dual approach:

1. **Unit Tests**: Test individual functions, transformers, and error handling logic
2. **Property-Based Tests**: Verify universal properties across data transformations and business logic

### Unit Testing Strategy

**Test Framework**: Vitest (aligned with Vite build system)

**Areas for Unit Testing**:
- Data transformation functions (snake_case ↔ camelCase)
- Error handling and error message generation
- Validation logic (Darpan ID format, trust points bounds)
- Trust points calculation functions
- Date/time utilities for event scheduling
- RLS policy helper functions

**Example Unit Tests**:
```typescript
describe('Data Transformers', () => {
  it('should transform database user to application user', () => {
    const dbUser = {
      id: '123',
      email: 'test@example.com',
      display_name: 'Test User',
      trust_points: 75,
      verification_status: 'verified',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
    
    const user = dbUserToUser(dbUser)
    
    expect(user.displayName).toBe('Test User')
    expect(user.trustPoints).toBe(75)
    expect(user.verificationStatus).toBe('verified')
  })
  
  it('should handle null values in venue transformation', () => {
    const dbVenue = {
      id: '123',
      name: 'Test Venue',
      address: '123 Main St',
      latitude: null,
      longitude: null,
      safety_rating: 'green',
      safety_notes: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
    
    const venue = dbVenueToVenue(dbVenue)
    
    expect(venue.latitude).toBeNull()
    expect(venue.safetyNotes).toBeNull()
  })
})

describe('Validation', () => {
  it('should validate correct Darpan ID format', () => {
    expect(isValidDarpanId('12345')).toBe(true)
  })
  
  it('should reject invalid Darpan ID formats', () => {
    expect(isValidDarpanId('1234')).toBe(false)
    expect(isValidDarpanId('123456')).toBe(false)
    expect(isValidDarpanId('abcde')).toBe(false)
  })
  
  it('should enforce trust points bounds', () => {
    expect(clampTrustPoints(150)).toBe(100)
    expect(clampTrustPoints(-10)).toBe(0)
    expect(clampTrustPoints(50)).toBe(50)
  })
})

describe('Error Handling', () => {
  it('should generate user-friendly error messages', () => {
    const authError = new AuthError('Test', 'invalid_credentials')
    expect(getErrorMessage(authError)).toContain('Invalid email or password')
    
    const dbError = new DatabaseError('Test', 'permission_denied')
    expect(getErrorMessage(dbError)).toContain('permission')
  })
})
```

### Integration Testing with Supabase

**Test Database Setup**:
- Use separate Supabase project for testing
- Seed test data before each test suite
- Clean up test data after tests complete

**Example Integration Tests**:
```typescript
describe('Event Service Integration', () => {
  beforeEach(async () => {
    await seedTestData()
  })
  
  afterEach(async () => {
    await cleanupTestData()
  })
  
  it('should fetch events by track type', async () => {
    const impactEvents = await eventService.getEventsByTrack('impact')
    expect(impactEvents.every(e => e.trackType === 'impact')).toBe(true)
  })
  
  it('should enforce max participants constraint', async () => {
    const event = await createTestEvent({ maxParticipants: 2 })
    
    // Create 2 RSVPs
    await rsvpService.createRSVP(event.id, 'user1')
    await rsvpService.createRSVP(event.id, 'user2')
    
    // Third RSVP should fail
    await expect(
      rsvpService.createRSVP(event.id, 'user3')
    ).rejects.toThrow(ValidationError)
  })
})
```

### Property-Based Testing Strategy

**Test Framework**: fast-check (property-based testing for TypeScript)

**Configuration**: Minimum 100 iterations per property test

**Test Tagging**: Each property test references its design document property
- Format: `// Feature: supabase-integration, Property {N}: {description}`

**Areas for Property-Based Testing**:
- Data transformation round-trips (database ↔ application types)
- Trust points updates maintain bounds (0-100)
- RSVP constraints are enforced consistently
- Date/time handling preserves temporal relationships
- Query filtering produces correct subsets

The specific correctness properties will be defined in the next section based on acceptance criteria analysis.

### Test Coverage Goals

- **Unit Test Coverage**: Minimum 80% for utility functions and transformers
- **Integration Test Coverage**: All critical user flows (auth, RSVP, chat)
- **Property Test Coverage**: All data transformations and business rule invariants
- **Manual Testing**: Real-time subscriptions, UI error states, loading states

### Continuous Integration

- Run all tests on pull requests
- Require passing tests before merge
- Generate coverage reports
- Test against actual Supabase test project (not mocked)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: User Profile Creation on Signup

*For any* valid email and password combination, when a user signs up through the authentication service, a corresponding user record SHALL be created in the users table with matching email and default trust points of 50.

**Validates: Requirements 3.2**

### Property 2: Authentication State Synchronization

*For any* authentication state change (sign in, sign out, session refresh), the React Context state SHALL reflect the current authentication status within one render cycle.

**Validates: Requirements 3.7**

### Property 3: Database Error Messages Include Context

*For any* database operation that fails, the error object SHALL contain the operation type, affected resource, and underlying error details to aid debugging.

**Validates: Requirements 4.3, 13.1**

### Property 4: Error Type Classification

*For any* error thrown by the data access layer, it SHALL be classified as one of: AuthError, DatabaseError, or ValidationError with an appropriate error code.

**Validates: Requirements 13.2**

### Property 5: User-Friendly Error Messages

*For any* error presented to users, the error message SHALL be in plain language without exposing technical implementation details or sensitive information.

**Validates: Requirements 13.3**

### Property 6: Error State Exposure to UI

*For any* asynchronous operation in custom hooks, the error state SHALL be exposed to consuming components through the hook's return value.

**Validates: Requirements 13.5**

### Property 7: Authentication Error Logging Separation

*For any* authentication error (sign in, sign up, password reset), the error SHALL be logged with a distinct "auth" category separate from general database errors.

**Validates: Requirements 13.6**

### Property 8: Real-time Subscription State Updates

*For any* real-time subscription event received, the React state SHALL be updated immediately without requiring manual refetch.

**Validates: Requirements 5.3**

### Property 9: Subscription Cleanup on Unmount

*For any* component that establishes a real-time subscription, the subscription SHALL be unsubscribed when the component unmounts to prevent memory leaks.

**Validates: Requirements 5.4**

### Property 10: User Data Visibility (RLS)

*For any* authenticated user querying the users table for update operations, only their own user record SHALL be returned by the database.

**Validates: Requirements 6.2**

### Property 11: Chat Thread Visibility (RLS)

*For any* authenticated user querying chat threads, only threads where they are listed as participant_user_id or where they are an admin of the participant_ngo_id SHALL be returned.

**Validates: Requirements 6.3**

### Property 12: Chat Message Visibility (RLS)

*For any* authenticated user querying chat messages, only messages from threads they participate in SHALL be returned.

**Validates: Requirements 6.4**

### Property 13: RSVP Visibility (RLS)

*For any* authenticated user querying RSVPs, they SHALL see their own RSVPs and RSVPs for events they organize.

**Validates: Requirements 6.5**

### Property 14: Public Data Access (RLS)

*For any* unauthenticated request to read NGOs, events, or venues tables, the query SHALL succeed and return public data.

**Validates: Requirements 6.6**

### Property 15: Write Operation Authorization (RLS)

*For any* insert, update, or delete operation, the database SHALL verify the user has appropriate permissions before executing the operation.

**Validates: Requirements 6.7**

### Property 16: Unauthorized Access Rejection (RLS)

*For any* database operation where the user lacks permission, the operation SHALL fail with a permission denied error.

**Validates: Requirements 6.8**

### Property 17: Trust Points Increment on Event Completion

*For any* user who has an RSVP with status "attended" for a completed event, calling the trust points update function SHALL increment their trust_points value.

**Validates: Requirements 7.2**

### Property 18: Trust Points Decrement on Late Cancellation

*For any* user who cancels an RSVP within 24 hours of event start time, their trust_points SHALL be decremented.

**Validates: Requirements 7.3**

### Property 19: Trust Points Decrement on No-Show

*For any* user whose RSVP status is updated to "no_show" after an event, their trust_points SHALL be decremented.

**Validates: Requirements 7.4**

### Property 20: Trust Points Concurrent Update Safety

*For any* two concurrent trust points update operations on the same user, both updates SHALL be applied correctly without data loss or race conditions.

**Validates: Requirements 7.6**

### Property 21: Trust Points Change Audit Trail

*For any* trust points update operation, a corresponding record SHALL be inserted into trust_points_history with the delta, reason, and timestamp.

**Validates: Requirements 7.7**

### Property 22: Darpan ID Format Validation

*For any* attempt to create or update an NGO with a darpan_id, the system SHALL reject values that are not exactly 5 digits.

**Validates: Requirements 8.2**

### Property 23: NGO Default Verification Status

*For any* newly created NGO record, the verification_status SHALL be set to "pending" unless explicitly specified otherwise.

**Validates: Requirements 8.4**

### Property 24: RSVP Initial Status

*For any* newly created RSVP record, the status SHALL be set to "confirmed" by default.

**Validates: Requirements 9.2**

### Property 25: RSVP Cancellation Status Update

*For any* RSVP cancellation operation, the RSVP status SHALL be updated from "confirmed" to "cancelled".

**Validates: Requirements 9.3**

### Property 26: Duplicate RSVP Prevention

*For any* user and event combination, attempting to create a second RSVP SHALL fail with a unique constraint violation error.

**Validates: Requirements 9.4**

### Property 27: Event Capacity Enforcement

*For any* event with max_participants defined, when the number of confirmed RSVPs equals max_participants, new RSVP attempts SHALL be rejected with a validation error.

**Validates: Requirements 9.5**

### Property 28: Event Venue Data Inclusion

*For any* event query that includes venue information, the returned event object SHALL contain the complete venue record including safety_rating and safety_notes.

**Validates: Requirements 10.3**

### Property 29: Venue Safety Rating Change Audit

*For any* venue safety rating update, a record of the change SHALL be maintained for audit purposes (either in a history table or through database audit logging).

**Validates: Requirements 10.5**

### Property 30: Asynchronous Operation Loading States

*For any* custom hook that performs asynchronous database operations, the hook SHALL expose a loading boolean that is true during the operation and false when complete or errored.

**Validates: Requirements 11.5**

### Property 31: Data Transformation Round-Trip (User)

*For any* valid User object, transforming it to database format and back to application format SHALL produce an equivalent User object.

**Validates: Requirements 4.2** (implicit - type safety through transformations)

### Property 32: Data Transformation Round-Trip (Event)

*For any* valid Event object with venue data, transforming it to database format and back to application format SHALL produce an equivalent Event object with venue data preserved.

**Validates: Requirements 4.2** (implicit - type safety through transformations)

### Property 33: Data Transformation Null Handling

*For any* database record with null optional fields, transforming it to application format SHALL preserve null values without converting them to undefined or empty strings.

**Validates: Requirements 4.2** (implicit - type safety through transformations)
