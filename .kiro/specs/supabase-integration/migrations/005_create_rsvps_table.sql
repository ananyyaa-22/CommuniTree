-- Migration: Create rsvps table
-- Description: Creates the RSVPs table with unique constraints and status tracking
-- Requirements: 2.7, 2.8, 2.9, 2.10, 9.1, 9.4

CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no_show')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create indexes for query performance
CREATE INDEX idx_rsvps_event ON rsvps(event_id);
CREATE INDEX idx_rsvps_user ON rsvps(user_id);
CREATE INDEX idx_rsvps_status ON rsvps(status);

-- Add comments for documentation
COMMENT ON TABLE rsvps IS 'Event RSVPs with attendance tracking and trust point implications';
COMMENT ON COLUMN rsvps.status IS 'RSVP status: confirmed, cancelled, attended, or no_show';
COMMENT ON CONSTRAINT rsvps_event_id_user_id_key ON rsvps IS 'Prevents duplicate RSVPs for same user and event';
