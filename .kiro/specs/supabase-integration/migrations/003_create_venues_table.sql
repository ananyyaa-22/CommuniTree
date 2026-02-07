-- Migration: Create venues table
-- Description: Creates the venues table with safety rating system and location coordinates
-- Requirements: 2.4, 2.9, 2.10, 10.1, 10.2

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

-- Create indexes for query performance
CREATE INDEX idx_venues_safety_rating ON venues(safety_rating);
CREATE INDEX idx_venues_location ON venues(latitude, longitude);

-- Add comments for documentation
COMMENT ON TABLE venues IS 'Event venues with safety ratings and location data';
COMMENT ON COLUMN venues.safety_rating IS 'Color-coded safety classification: green (safe), yellow (caution), red (unsafe)';
COMMENT ON COLUMN venues.safety_notes IS 'Optional notes about venue safety concerns or features';
COMMENT ON COLUMN venues.latitude IS 'Latitude coordinate for venue location';
COMMENT ON COLUMN venues.longitude IS 'Longitude coordinate for venue location';
