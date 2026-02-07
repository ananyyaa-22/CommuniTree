-- Migration: Create trust_points_history table
-- Description: Creates audit trail table for trust points changes
-- Requirements: 7.7

CREATE TABLE trust_points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  related_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for efficient history queries
CREATE INDEX idx_trust_points_history_user ON trust_points_history(user_id, created_at);

-- Add comments for documentation
COMMENT ON TABLE trust_points_history IS 'Audit trail of all trust points changes';
COMMENT ON COLUMN trust_points_history.delta IS 'Change in trust points (positive or negative)';
COMMENT ON COLUMN trust_points_history.reason IS 'Explanation for the trust points change';
COMMENT ON COLUMN trust_points_history.related_event_id IS 'Optional reference to event that triggered the change';
