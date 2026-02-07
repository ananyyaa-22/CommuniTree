-- Migration: Create auto-update timestamp trigger function
-- Description: Creates a reusable trigger function that automatically updates the updated_at column
--              whenever a row is modified. This function is applied to all tables with updated_at columns.
-- Requirements: 2.10

-- Create the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to ngos table
CREATE TRIGGER update_ngos_updated_at 
  BEFORE UPDATE ON ngos
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to venues table
CREATE TRIGGER update_venues_updated_at 
  BEFORE UPDATE ON venues
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to events table
CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to rsvps table
CREATE TRIGGER update_rsvps_updated_at 
  BEFORE UPDATE ON rsvps
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to chat_threads table
CREATE TRIGGER update_chat_threads_updated_at 
  BEFORE UPDATE ON chat_threads
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Verification query to check triggers are created
-- SELECT trigger_name, event_object_table, action_timing, event_manipulation
-- FROM information_schema.triggers
-- WHERE trigger_name LIKE '%updated_at%'
-- ORDER BY event_object_table;
