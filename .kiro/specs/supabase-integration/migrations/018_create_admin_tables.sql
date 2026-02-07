-- Migration: Create supporting tables for RLS policies
-- Task: 4 (supporting infrastructure)
-- Requirements: 6.7

-- ============================================
-- NGO ADMINS TABLE
-- ============================================
-- Junction table to track which users can manage which NGOs

CREATE TABLE IF NOT EXISTS ngo_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ngo_id UUID NOT NULL REFERENCES ngos(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'owner')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, ngo_id)
);

CREATE INDEX idx_ngo_admins_user ON ngo_admins(user_id);
CREATE INDEX idx_ngo_admins_ngo ON ngo_admins(ngo_id);

-- Enable RLS on ngo_admins table
ALTER TABLE ngo_admins ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own admin relationships
CREATE POLICY "Users can view own admin relationships"
  ON ngo_admins FOR SELECT
  USING (user_id = auth.uid());

-- Policy: NGO owners can manage admins for their NGO
CREATE POLICY "NGO owners can manage admins"
  ON ngo_admins FOR ALL
  USING (
    ngo_id IN (
      SELECT ngo_id FROM ngo_admins 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================
-- ADMIN USERS TABLE
-- ============================================
-- Simple table to track platform administrators

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_users_user ON admin_users(user_id);

-- Enable RLS on admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Only super admins can view admin users
CREATE POLICY "Super admins can view admin users"
  ON admin_users FOR SELECT
  USING (
    user_id IN (
      SELECT user_id FROM admin_users WHERE role = 'super_admin'
    )
  );

-- Policy: Only super admins can manage admin users
CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users WHERE role = 'super_admin'
    )
  );

-- Note: The first super admin will need to be created manually via SQL
-- or through a separate bootstrap script
