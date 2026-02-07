-- Migration: Create ngos table
-- Description: Creates the NGOs table with Darpan ID validation and verification system
-- Requirements: 2.2, 2.9, 2.10, 8.1, 8.2

CREATE TABLE ngos (
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

-- Create indexes for query performance
CREATE INDEX idx_ngos_verification_status ON ngos(verification_status);
CREATE INDEX idx_ngos_darpan_id ON ngos(darpan_id);

-- Add comments for documentation
COMMENT ON TABLE ngos IS 'Non-governmental organizations with Darpan ID verification';
COMMENT ON COLUMN ngos.darpan_id IS 'Unique 5-digit Darpan ID for NGO verification in India';
COMMENT ON COLUMN ngos.verification_status IS 'Verification status: pending, verified, or rejected';
