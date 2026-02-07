# Database Migration Scripts

This directory contains SQL scripts for managing the CommuniTree database schema and development data.

## Files

### `seed_dev_data.sql`
Populates the development database with sample data for testing and development.

**Contents:**
- 9 sample users with varying trust points (22-95 range)
- 6 NGOs with different verification statuses (verified, pending, rejected)
- 6 venues with different safety ratings (green, yellow, red)
- 12 events across Impact and Grow tracks (including past events)
- 19 RSVPs with various statuses (confirmed, cancelled, attended, no_show)
- 5 chat threads with 22 messages
- 11 trust points history records

**Requirements Validated:** 15.1, 15.2, 15.3, 15.4, 15.5, 15.6

### `reset_dev_database.sql`
Truncates all application tables and resets the database to a clean state.

**Requirements Validated:** 15.7

**⚠️ WARNING:** This script is for DEVELOPMENT ONLY. Do not run in production!

## Usage

### Using Supabase SQL Editor (Recommended)

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of the desired script
5. Click "Run" to execute

### Using psql Command Line

```bash
# Seed the database with sample data
psql -h <your-supabase-host> -U postgres -d postgres -f seed_dev_data.sql

# Reset the database (removes all data)
psql -h <your-supabase-host> -U postgres -d postgres -f reset_dev_database.sql
```

### Complete Reset and Re-seed Workflow

To completely reset your development database and populate it with fresh sample data:

1. Run `reset_dev_database.sql` to clear all existing data
2. Run `seed_dev_data.sql` to populate with sample data

**In Supabase SQL Editor:**
```sql
-- Step 1: Reset (copy contents of reset_dev_database.sql)
-- Step 2: Seed (copy contents of seed_dev_data.sql)
```

## Sample Data Overview

### Users
- **High Trust (80+):** Alice (95), Bob (88)
- **Medium Trust (50-79):** Carol (65), David (58), Emma (50)
- **Low Trust (<50):** Frank (35), Grace (22)
- **New Users (default 50):** Henry, Iris

### NGOs
- **Verified:** Green Earth Foundation, Hope for Children, Community Kitchen Network
- **Pending:** Tech for Good Initiative, Animal Welfare Society
- **Rejected:** Unverified Organization

### Events
- **Impact Track:** Tree Planting, Meal Service, Coding Workshop, Beach Cleanup, Animal Shelter
- **Grow Track:** Photography Walk, Board Game Night, Yoga, Book Club, Cooking Class
- **Past Events:** Community Garden (completed), Hiking Adventure (completed)

### Venues
- **Green (Safe):** Central Community Center, Riverside Park, City Library
- **Yellow (Caution):** Old Market Square, Industrial District Hall
- **Red (High Caution):** Remote Community Outpost

## Notes

- All UUIDs are hardcoded for consistency across resets
- Timestamps are relative to NOW() for realistic date ranges
- Foreign key relationships are properly maintained
- The scripts use transactions to ensure data consistency
- Auth users are NOT managed by these scripts (use Supabase Auth for real user accounts)

## Development Workflow

1. **Initial Setup:** Run `seed_dev_data.sql` after creating your database schema
2. **Testing:** Use the sample data to test features and UI components
3. **Reset:** Run `reset_dev_database.sql` when you need a clean slate
4. **Re-seed:** Run `seed_dev_data.sql` again to restore sample data

## Integration with Application

The sample data is designed to work with the CommuniTree application:

- User IDs match the format expected by Supabase Auth
- NGO Darpan IDs follow the 5-digit validation rule
- Event times are set relative to NOW() for realistic upcoming/past events
- Trust points reflect realistic user behavior patterns
- Chat messages demonstrate typical user-NGO interactions

## Troubleshooting

**Error: "relation does not exist"**
- Ensure all database tables have been created before running seed script
- Check that migrations have been applied in the correct order

**Error: "duplicate key value violates unique constraint"**
- Run `reset_dev_database.sql` first to clear existing data
- Ensure you're not running the seed script multiple times without resetting

**Error: "foreign key constraint violation"**
- The scripts handle foreign keys correctly
- If you see this error, check that you haven't modified the script execution order

