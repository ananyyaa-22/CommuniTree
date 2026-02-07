-- Migration: Enable RLS and create policies for events table
-- Task: 4.3
-- Requirements: 6.1, 6.6, 6.7

-- Enable Row Level Security on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view all events
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (true);

-- Policy: Authenticated users can create events
-- Validates that the organizer_id matches the authenticated user (for user organizers)
-- or that the user is an admin of the NGO (for ngo organizers)
CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    (organizer_type = 'user' AND organizer_id = auth.uid()) OR
    (organizer_type = 'ngo' AND organizer_id IN (
      SELECT ngo_id FROM ngo_admins WHERE user_id = auth.uid()
    ))
  );

-- Policy: Organizers can update their own events
CREATE POLICY "Organizers can update own events"
  ON events FOR UPDATE
  USING (
    (organizer_type = 'user' AND organizer_id = auth.uid()) OR
    (organizer_type = 'ngo' AND organizer_id IN (
      SELECT ngo_id FROM ngo_admins WHERE user_id = auth.uid()
    ))
  );

-- Policy: Organizers can delete their own events
CREATE POLICY "Organizers can delete own events"
  ON events FOR DELETE
  USING (
    (organizer_type = 'user' AND organizer_id = auth.uid()) OR
    (organizer_type = 'ngo' AND organizer_id IN (
      SELECT ngo_id FROM ngo_admins WHERE user_id = auth.uid()
    ))
  );
