-- Migration: Create auto-create user profile trigger
-- Description: Automatically creates a user profile record in the users table when a new user
--              signs up through Supabase Auth. Extracts display_name from metadata or derives
--              it from the email address.
-- Requirements: 3.2

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new user profile record
  INSERT INTO users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    -- Try to get display_name from user metadata, otherwise derive from email
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_user();

-- Add comment explaining the trigger
COMMENT ON FUNCTION handle_new_user IS 
  'Automatically creates a user profile in the users table when a new user signs up. '
  'Extracts display_name from raw_user_meta_data or derives it from email. '
  'Uses SECURITY DEFINER to ensure proper permission handling.';

-- Note: When signing up users, pass display_name in the metadata like this:
-- supabase.auth.signUp({
--   email: 'user@example.com',
--   password: 'password',
--   options: {
--     data: {
--       display_name: 'John Doe'
--     }
--   }
-- })
