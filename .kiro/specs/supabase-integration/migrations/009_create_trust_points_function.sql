-- Migration: Create trust points management function
-- Description: Creates a transaction-safe function for updating user trust points with automatic
--              bounds checking (0-100) and audit trail logging to trust_points_history table.
-- Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7

-- Create the trust points update function
CREATE OR REPLACE FUNCTION update_trust_points(
  p_user_id UUID,
  p_delta INTEGER,
  p_reason TEXT,
  p_event_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_new_points INTEGER;
BEGIN
  -- Update trust points with bounds checking (0-100)
  -- GREATEST ensures minimum of 0, LEAST ensures maximum of 100
  UPDATE users
  SET trust_points = GREATEST(0, LEAST(100, trust_points + p_delta))
  WHERE id = p_user_id
  RETURNING trust_points INTO v_new_points;
  
  -- Check if user was found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with id % not found', p_user_id;
  END IF;
  
  -- Log the change to trust_points_history for audit trail
  INSERT INTO trust_points_history (user_id, delta, reason, related_event_id)
  VALUES (p_user_id, p_delta, p_reason, p_event_id);
  
  -- Return the new trust points value
  RETURN v_new_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the function
COMMENT ON FUNCTION update_trust_points IS 
  'Updates user trust points with bounds checking (0-100) and automatic audit logging. '
  'Uses SECURITY DEFINER to ensure proper permission handling. '
  'Parameters: user_id, delta (change amount), reason (description), event_id (optional).';

-- Example usage (commented out):
-- SELECT update_trust_points(
--   'user-uuid-here'::UUID,
--   10,
--   'Completed volunteer event',
--   'event-uuid-here'::UUID
-- );
