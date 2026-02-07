-- Migration: Enable RLS and create policies for ngos table
-- Task: 4.2
-- Requirements: 6.1, 6.6, 6.7

-- Enable Row Level Security on ngos table
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view verified NGOs
CREATE POLICY "Anyone can view verified NGOs"
  ON ngos FOR SELECT
  USING (verification_status = 'verified');

-- Policy: Authenticated users can create NGO profiles
CREATE POLICY "Authenticated users can create NGOs"
  ON ngos FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: NGO admins can update their NGO
-- Note: This requires an ngo_admins table to track which users can manage which NGOs
-- For now, we'll create a placeholder that can be enhanced when ngo_admins table is added
CREATE POLICY "NGO admins can update their NGO"
  ON ngos FOR UPDATE
  USING (
    -- This will be enhanced when ngo_admins table is created
    -- For now, allowing updates if user is authenticated (to be refined)
    id IN (
      SELECT ngo_id FROM ngo_admins WHERE user_id = auth.uid()
    )
  );

-- Note: The ngo_admins table will need to be created separately to fully implement
-- the NGO admin authorization system. This is a junction table between users and ngos.
