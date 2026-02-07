# Supabase Database Migrations

This directory contains SQL migration files for the CommuniTree Supabase database schema.

## Migration Files

The migrations are numbered sequentially and should be executed in order:

1. **001_create_users_table.sql** - Users table with trust points system
2. **002_create_ngos_table.sql** - NGOs table with Darpan ID validation
3. **003_create_venues_table.sql** - Venues table with safety ratings
4. **004_create_events_table.sql** - Events table with track types and foreign keys
5. **005_create_rsvps_table.sql** - RSVPs table with unique constraints
6. **006_create_chat_tables.sql** - Chat threads and messages tables
7. **007_create_trust_points_history_table.sql** - Trust points audit trail

## How to Apply Migrations

### Option 1: Using Supabase Dashboard

1. Log in to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste each migration file content in order
4. Execute each migration

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Option 3: Using the All-in-One Script

Execute the `000_run_all_migrations.sql` file which runs all migrations in the correct order:

```bash
psql -h your-db-host -U postgres -d postgres -f 000_run_all_migrations.sql
```

## Migration Dependencies

The migrations have the following dependencies:

- **001** (users) - Depends on `auth.users` table (created by Supabase Auth)
- **002** (ngos) - No dependencies
- **003** (venues) - No dependencies
- **004** (events) - Depends on **003** (venues)
- **005** (rsvps) - Depends on **001** (users) and **004** (events)
- **006** (chat_tables) - Depends on **001** (users) and **002** (ngos)
- **007** (trust_points_history) - Depends on **001** (users) and **004** (events)

## Rollback

To rollback migrations, drop tables in reverse order:

```sql
DROP TABLE IF EXISTS trust_points_history CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_threads CASCADE;
DROP TABLE IF EXISTS rsvps CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS ngos CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

## Verification

After applying migrations, verify the schema:

```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check constraints
SELECT constraint_name, table_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public';

-- Check indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public';
```

## Notes

- All tables use UUID primary keys
- Timestamps use `TIMESTAMPTZ` for timezone support
- Foreign keys use appropriate `ON DELETE` actions
- Indexes are created for common query patterns
- CHECK constraints enforce data integrity
- UNIQUE constraints prevent duplicate data
