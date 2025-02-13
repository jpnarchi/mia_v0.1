/*
  # Fix Registration Policies

  1. Changes
    - Drop existing policies
    - Create new simplified policies for registration flow
    - Add explicit policies for authenticated users

  2. Security
    - Maintains data isolation
    - Allows proper registration flow
    - Preserves RLS security model
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for registration" ON company_profiles;
DROP POLICY IF EXISTS "Enable read own profile" ON company_profiles;
DROP POLICY IF EXISTS "Enable update own profile" ON company_profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON user_preferences;
DROP POLICY IF EXISTS "Enable read own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Enable update own preferences" ON user_preferences;

-- Create new policies for company_profiles
CREATE POLICY "company_profiles_insert_policy"
ON company_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "company_profiles_select_policy"
ON company_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "company_profiles_update_policy"
ON company_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create new policies for user_preferences
CREATE POLICY "user_preferences_insert_policy"
ON user_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_select_policy"
ON user_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_update_policy"
ON user_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);