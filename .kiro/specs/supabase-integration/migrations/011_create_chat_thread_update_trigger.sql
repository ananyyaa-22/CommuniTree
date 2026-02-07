-- Migration: Create chat thread update trigger
-- Description: Automatically updates the chat_threads.updated_at timestamp when a new message
--              is inserted into the chat_messages table. This keeps thread timestamps current
--              for sorting and displaying recent conversations.
-- Requirements: 5.1

-- Create the function to update chat thread timestamp
CREATE OR REPLACE FUNCTION update_chat_thread_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the chat thread's updated_at timestamp to match the new message's created_at
  UPDATE chat_threads
  SET updated_at = NEW.created_at
  WHERE id = NEW.thread_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on chat_messages table
CREATE TRIGGER update_thread_on_new_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW 
  EXECUTE FUNCTION update_chat_thread_on_message();

-- Add comment explaining the trigger
COMMENT ON FUNCTION update_chat_thread_on_message IS 
  'Automatically updates chat_threads.updated_at when a new message is inserted. '
  'This ensures thread timestamps reflect the most recent activity for sorting.';

-- Verification query to test the trigger (commented out):
-- SELECT ct.id, ct.updated_at, cm.created_at as last_message_time
-- FROM chat_threads ct
-- LEFT JOIN LATERAL (
--   SELECT created_at 
--   FROM chat_messages 
--   WHERE thread_id = ct.id 
--   ORDER BY created_at DESC 
--   LIMIT 1
-- ) cm ON true
-- ORDER BY ct.updated_at DESC;
