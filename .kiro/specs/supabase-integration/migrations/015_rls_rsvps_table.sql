-- Migration: Enable RLS and create policies for rsvps table
-- Task: 4.4
-- Requirements: 6.1, 6.5, 6.7

-- Enable Row Level Security on rsvps table
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own RSVPs
CREATE POLICY "Users can view own RSVPs"
  ON rsvps FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Event organizers can view RSVPs for their events
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

-- Policy: Users can create RSVPs for themselves
CREATE POLICY "Users can create own RSVPs"
  ON rsvps FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own RSVPs
-- This allows users to cancel their RSVPs
CREATE POLICY "Users can update own RSVPs"
  ON rsvps FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Event organizers can update RSVP status
-- This allows organizers to mark attendance (attended/no_show) after events
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
