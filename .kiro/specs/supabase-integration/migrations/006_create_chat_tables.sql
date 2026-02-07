-- Migration: Create chat_threads and chat_messages tables
-- Description: Creates chat system tables for user-NGO messaging
-- Requirements: 2.5, 2.6, 2.8, 2.9, 2.10

-- Create chat_threads table
CREATE TABLE chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_ngo_id UUID NOT NULL REFERENCES ngos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(participant_user_id, participant_ngo_id)
);

-- Create indexes for chat_threads
CREATE INDEX idx_chat_threads_user ON chat_threads(participant_user_id);
CREATE INDEX idx_chat_threads_ngo ON chat_threads(participant_ngo_id);

-- Add comments for chat_threads
COMMENT ON TABLE chat_threads IS 'Chat conversation threads between users and NGOs';
COMMENT ON CONSTRAINT chat_threads_participant_user_id_participant_ngo_id_key ON chat_threads IS 'Ensures one thread per user-NGO pair';

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ngo')),
  sender_id UUID NOT NULL,
  message_content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for chat_messages
CREATE INDEX idx_chat_messages_thread ON chat_messages(thread_id, created_at);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id, sender_type);

-- Add comments for chat_messages
COMMENT ON TABLE chat_messages IS 'Individual messages within chat threads';
COMMENT ON COLUMN chat_messages.sender_type IS 'Type of sender: user or ngo';
COMMENT ON COLUMN chat_messages.sender_id IS 'ID of the sending user or NGO';
