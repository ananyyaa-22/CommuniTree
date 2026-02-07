-- Migration: Enable RLS and create policies for chat tables
-- Task: 4.5
-- Requirements: 6.1, 6.3, 6.4, 6.7

-- ============================================
-- CHAT THREADS TABLE POLICIES
-- ============================================

-- Enable Row Level Security on chat_threads table
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view threads they participate in
CREATE POLICY "Users can view own threads"
  ON chat_threads FOR SELECT
  USING (participant_user_id = auth.uid());

-- Policy: NGO admins can view threads for their NGO
CREATE POLICY "NGO admins can view NGO threads"
  ON chat_threads FOR SELECT
  USING (
    participant_ngo_id IN (
      SELECT ngo_id FROM ngo_admins WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can create threads with NGOs
CREATE POLICY "Users can create threads"
  ON chat_threads FOR INSERT
  TO authenticated
  WITH CHECK (participant_user_id = auth.uid());

-- ============================================
-- CHAT MESSAGES TABLE POLICIES
-- ============================================

-- Enable Row Level Security on chat_messages table
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages in their threads
CREATE POLICY "Users can view thread messages"
  ON chat_messages FOR SELECT
  USING (
    thread_id IN (
      SELECT id FROM chat_threads WHERE participant_user_id = auth.uid()
    )
  );

-- Policy: NGO admins can view messages in their threads
CREATE POLICY "NGO admins can view thread messages"
  ON chat_messages FOR SELECT
  USING (
    thread_id IN (
      SELECT id FROM chat_threads WHERE participant_ngo_id IN (
        SELECT ngo_id FROM ngo_admins WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Thread participants can send messages (users)
CREATE POLICY "Users can send messages in their threads"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_type = 'user' AND 
    sender_id = auth.uid() AND 
    thread_id IN (
      SELECT id FROM chat_threads WHERE participant_user_id = auth.uid()
    )
  );

-- Policy: Thread participants can send messages (NGO admins)
CREATE POLICY "NGO admins can send messages in their threads"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_type = 'ngo' AND 
    thread_id IN (
      SELECT id FROM chat_threads WHERE participant_ngo_id IN (
        SELECT ngo_id FROM ngo_admins WHERE user_id = auth.uid()
      )
    )
  );
