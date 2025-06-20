/*
  # Setup Authentication Integration with Custom Tables

  1. New Tables
    - Link Supabase Auth users to custom student profiles
    - Enable RLS on existing tables
    
  2. Security
    - Add RLS policies for student data access
    - Create triggers to sync auth users with student profiles
    
  3. Functions
    - Auto-create student profile when user signs up
    - Link existing student data to auth users
*/

-- Enable RLS on existing tables
ALTER TABLE v0001_student_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE v0001_auth ENABLE ROW LEVEL SECURITY;

-- Add auth_user_id column to link with Supabase Auth
ALTER TABLE v0001_student_database 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_student_auth_user_id 
ON v0001_student_database(auth_user_id);

-- RLS Policy: Users can only access their own student data
CREATE POLICY "Users can access own student data"
  ON v0001_student_database
  FOR ALL
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- RLS Policy: Users can access their own auth data
CREATE POLICY "Users can access own auth data"
  ON v0001_auth
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = student_id);

-- Function to create student profile when user signs up
CREATE OR REPLACE FUNCTION create_student_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO v0001_student_database (
    auth_user_id,
    email,
    created_at,
    student_id
  ) VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    'STU_' || NEW.id::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create student profile
DROP TRIGGER IF EXISTS create_student_profile_trigger ON auth.users;
CREATE TRIGGER create_student_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_student_profile();

-- Function to link existing student data by email
CREATE OR REPLACE FUNCTION link_existing_student_data()
RETURNS void AS $$
BEGIN
  UPDATE v0001_student_database 
  SET auth_user_id = auth.users.id
  FROM auth.users
  WHERE v0001_student_database.email = auth.users.email
  AND v0001_student_database.auth_user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the linking function
SELECT link_existing_student_data();