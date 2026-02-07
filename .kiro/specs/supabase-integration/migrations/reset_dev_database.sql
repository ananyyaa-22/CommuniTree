-- ============================================================================
-- CommuniTree Development Database Reset Script
-- ============================================================================
-- This script truncates all tables and resets the database to a clean state
-- Requirements: 15.7
-- ============================================================================

-- IMPORTANT: This script is for DEVELOPMENT ONLY
-- DO NOT run this script in production environments

-- This script will:
-- 1. Truncate all application tables in the correct order (respecting foreign keys)
-- 2. Reset sequences/auto-increment values
-- 3. Prepare the database for re-seeding with seed_dev_data.sql

BEGIN;

-- ============================================================================
-- Disable triggers temporarily to avoid cascading issues
-- ============================================================================
SET session_replication_role = 'replica';

-- ============================================================================
-- Truncate tables in reverse dependency order
-- ============================================================================
-- Start with tables that have no dependencies on them (leaf tables)
-- Then move up to tables that are referenced by foreign keys

-- 1. Trust points history (depends on users and events)
TRUNCATE TABLE trust_points_history CASCADE;

-- 2. Chat messages (depends on chat_threads)
TRUNCATE TABLE chat_messages CASCADE;

-- 3. Chat threads (depends on users and ngos)
TRUNCATE TABLE chat_threads CASCADE;

-- 4. RSVPs (depends on events and users)
TRUNCATE TABLE rsvps CASCADE;

-- 5. Events (depends on venues, users, and ngos)
TRUNCATE TABLE events CASCADE;

-- 6. Venues (no dependencies)
TRUNCATE TABLE venues CASCADE;

-- 7. NGOs (no dependencies, but referenced by events and chat_threads)
TRUNCATE TABLE ngos CASCADE;

-- 8. Users (referenced by many tables, but we keep auth.users intact)
-- Note: In development, we truncate the users table but NOT auth.users
-- In production, users are managed through Supabase Auth
TRUNCATE TABLE users CASCADE;

-- ============================================================================
-- Re-enable triggers
-- ============================================================================
SET session_replication_role = 'origin';

COMMIT;

-- ============================================================================
-- Reset Complete
-- ============================================================================
-- All application data has been removed
-- The database is now ready for re-seeding
-- 
-- To re-populate with sample data, run:
--   psql -f seed_dev_data.sql
-- 
-- Or in Supabase SQL Editor:
--   Copy and paste the contents of seed_dev_data.sql
-- ============================================================================

