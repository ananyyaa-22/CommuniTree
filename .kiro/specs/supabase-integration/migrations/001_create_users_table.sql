-- Migration: Create users table
-- Description: Creates the users table with trust points system and verification status
-- Requirements: 2.1, 2.9, 2.10

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  trust_points INTEGER NOT NULL DEFAULT 50 CHECK (trust_points >= 0 AND trust_points <= 100),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_trust_points ON users(trust_points);

-- Add comment for documentation
COMMENT ON TABLE users IS 'User profiles with trust points and verification status';
COMMENT ON COLUMN users.trust_points IS 'User reputation score (0-100) based on community participation';
COMMENT ON COLUMN users.verification_status IS 'User verification status: unverified or verified';
