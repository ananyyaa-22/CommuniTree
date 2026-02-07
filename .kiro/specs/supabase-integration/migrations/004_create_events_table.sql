-- Migration: Create events table
-- Description: Creates the events table with track types, organizer info, and venue relationships
-- Requirements: 2.3, 2.8, 2.9, 2.10

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

-- Create indexes for query performance
CREATE INDEX idx_events_track_type ON events(track_type);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_organizer ON events(organizer_id, organizer_type);
CREATE INDEX idx_events_venue ON events(venue_id);

-- Add comments for documentation
COMMENT ON TABLE events IS 'Community events across Impact and Grow tracks';
COMMENT ON COLUMN events.track_type IS 'Event track: impact (volunteering) or grow (entertainment)';
COMMENT ON COLUMN events.organizer_type IS 'Type of organizer: user or ngo';
COMMENT ON COLUMN events.organizer_id IS 'ID of the organizing user or NGO';
COMMENT ON COLUMN events.max_participants IS 'Maximum number of participants allowed (null = unlimited)';
COMMENT ON COLUMN events.venue_id IS 'Reference to venue with safety rating information';
