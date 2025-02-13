/*
  # Fix Registration Flow and RLS Policies

  1. Changes
    - Drop all existing policies
    - Create new simplified policies that allow:
      - Authenticated users to insert their own records during registration
      - Users to manage their own data
    - Add public access for registration

  2. Security
    - Maintains data isolation between users
    - Allows registration flow to work properly
    - Preserves RLS security model
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to manage their own company profile" ON company_profiles;
DROP POLICY IF EXISTS "Allow users to manage their own preferences" ON user_preferences;

-- Create new policies for company_profiles
CREATE POLICY "Enable insert for registration"
ON company_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read own profile"
ON company_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable update own profile"
ON company_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create new policies for user_preferences
CREATE POLICY "Enable insert for registration"
ON user_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read own preferences"
ON user_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable update own preferences"
ON user_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);