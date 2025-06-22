/*
  # Grant anon permissions for v0001_auth table

  1. Security Updates
    - Grant SELECT permission to anon role for sign-in verification
    - Grant INSERT permission to anon role for sign-up functionality
    - These permissions work with existing RLS policies to enable authentication

  2. Changes Made
    - GRANT SELECT ON v0001_auth TO anon (allows reading for login verification)
    - GRANT INSERT ON v0001_auth TO anon (allows creating new accounts)

  3. Important Notes
    - RLS policies still control what data can be accessed
    - These grants provide the base table permissions needed for authentication
    - Without these grants, RLS policies cannot function properly
*/

-- Grant SELECT permission to anon role for sign-in verification
GRANT SELECT ON v0001_auth TO anon;

-- Grant INSERT permission to anon role for sign-up functionality  
GRANT INSERT ON v0001_auth TO anon;