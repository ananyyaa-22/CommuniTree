-- Migration: Enable RLS and create policies for venues table
-- Task: 4.6
-- Requirements: 6.1, 6.6, 6.7

-- Enable Row Level Security on venues table
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view venues
CREATE POLICY "Anyone can view venues"
  ON venues FOR SELECT
  USING (true);

-- Policy: Authenticated users can create venues
CREATE POLICY "Authenticated users can create venues"
  ON venues FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Admins can update venues (safety ratings)
-- Note: This requires an admin_users table to track admin privileges
-- For now, we'll create a placeholder that can be enhanced when admin_users table is added
CREATE POLICY "Admins can update venues"
  ON venues FOR UPDATE
  USING (
    -- This will be enhanced when admin_users table is created
    -- For now, restricting updates to users in the admin_users table
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Note: The admin_users table will need to be created separately to fully implement
-- the admin authorization system. This is a simple table with user_id references.
