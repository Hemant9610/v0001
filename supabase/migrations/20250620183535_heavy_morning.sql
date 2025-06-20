/*
  # Fix RLS policies for v0001_auth table

  1. Security Updates
    - Add policy for anonymous users to insert new records (sign-up)
    - Add policy for anonymous users to select records (sign-in)
    - Keep existing policy for authenticated users to access their own data
    - Ensure proper security while allowing necessary operations

  2. Changes Made
    - Allow INSERT operations for anonymous users (needed for sign-up)
    - Allow SELECT operations for anonymous users (needed for sign-in and debugging)
    - Maintain data isolation - users can only see their own records when authenticated

  3. Important Notes
    - These policies enable the authentication flow to work properly
    - Anonymous users can create accounts and verify credentials
    - Authenticated users maintain access to their own data only
*/

-- Drop existing policies to recreate them with proper permissions
DROP POLICY IF EXISTS "Users can access own auth data" ON v0001_auth;

-- Allow anonymous users to insert new records (for sign-up)
CREATE POLICY "Allow anonymous sign-up"
  ON v0001_auth
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to select records (for sign-in verification)
CREATE POLICY "Allow anonymous sign-in"
  ON v0001_auth
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to access their own data
CREATE POLICY "Users can access own auth data"
  ON v0001_auth
  FOR ALL
  TO authenticated
  USING (student_id = (auth.jwt() ->> 'student_id')::text);

-- Allow authenticated users to update their own data
CREATE POLICY "Users can update own auth data"
  ON v0001_auth
  FOR UPDATE
  TO authenticated
  USING (student_id = (auth.jwt() ->> 'student_id')::text)
  WITH CHECK (student_id = (auth.jwt() ->> 'student_id')::text);