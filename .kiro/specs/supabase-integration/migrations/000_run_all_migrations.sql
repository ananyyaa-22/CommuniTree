-- Master Migration Script
-- Description: Runs all database migrations in the correct order
-- Usage: Execute this file to create the complete database schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Migration 001: Create users table
-- Requirements: 2.1, 2.9, 2.10
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  trust_points INTEGER NOT NULL DEFAULT 50 CHECK (trust_points >= 0 AND trust_points <= 100),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_trust_points ON users(trust_points);

COMMENT ON TABLE users IS 'User profiles with trust points and verification status';

-- Migration 002: Create ngos table
-- Requirements: 2.2, 2.9, 2.10, 8.1, 8.2
CREATE TABLE IF NOT EXISTS ngos (
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

CREATE INDEX IF NOT EXISTS idx_ngos_verification_status ON ngos(verification_status);
CREATE INDEX IF NOT EXISTS idx_ngos_darpan_id ON ngos(darpan_id);

COMMENT ON TABLE ngos IS 'Non-governmental organizations with Darpan ID verification';

-- Migration 003: Create venues table
-- Requirements: 2.4, 2.9, 2.10, 10.1, 10.2
CREATE TABLE IF NOT EXISTS venues (
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

CREATE INDEX IF NOT EXISTS idx_venues_safety_rating ON venues(safety_rating);
CREATE INDEX IF NOT EXISTS idx_venues_location ON venues(latitude, longitude);

COMMENT ON TABLE venues IS 'Event venues with safety ratings and location data';

-- Migration 004: Create events table
-- Requirements: 2.3, 2.8, 2.9, 2.10
CREATE TABLE IF NOT EXISTS events (
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

CREATE INDEX IF NOT EXISTS idx_events_track_type ON events(track_type);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id, organizer_type);
CREATE INDEX IF NOT EXISTS idx_events_venue ON events(venue_id);

COMMENT ON TABLE events IS 'Community events across Impact and Grow tracks';

-- Migration 005: Create rsvps table
-- Requirements: 2.7, 2.8, 2.9, 2.10, 9.1, 9.4
CREATE TABLE IF NOT EXISTS rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no_show')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_rsvps_event ON rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_user ON rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_status ON rsvps(status);

COMMENT ON TABLE rsvps IS 'Event RSVPs with attendance tracking and trust point implications';

-- Migration 006: Create chat_threads and chat_messages tables
-- Requirements: 2.5, 2.6, 2.8, 2.9, 2.10
CREATE TABLE IF NOT EXISTS chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_ngo_id UUID NOT NULL REFERENCES ngos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(participant_user_id, participant_ngo_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_threads_user ON chat_threads(participant_user_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_ngo ON chat_threads(participant_ngo_id);

COMMENT ON TABLE chat_threads IS 'Chat conversation threads between users and NGOs';

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ngo')),
  sender_id UUID NOT NULL,
  message_content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON chat_messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id, sender_type);

COMMENT ON TABLE chat_messages IS 'Individual messages within chat threads';

-- Migration 007: Create trust_points_history table
-- Requirements: 7.7
CREATE TABLE IF NOT EXISTS trust_points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  related_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trust_points_history_user ON trust_points_history(user_id, created_at);

COMMENT ON TABLE trust_points_history IS 'Audit trail of all trust points changes';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'All migrations completed successfully!';
  RAISE NOTICE 'Created tables: users, ngos, venues, events, rsvps, chat_threads, chat_messages, trust_points_history';
END $$;
