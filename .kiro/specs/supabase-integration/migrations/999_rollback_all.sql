-- Rollback Script
-- Description: Drops all tables created by the migrations
-- WARNING: This will delete all data in these tables!
-- Usage: Execute this file to completely remove the database schema

-- Drop tables in reverse order of creation to handle foreign key dependencies

DROP TABLE IF EXISTS trust_points_history CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_threads CASCADE;
DROP TABLE IF EXISTS rsvps CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS ngos CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'All tables have been dropped successfully!';
  RAISE NOTICE 'Dropped tables: trust_points_history, chat_messages, chat_threads, rsvps, events, venues, ngos, users';
END $$;
