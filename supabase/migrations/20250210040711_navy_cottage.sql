/*
  # Fix RLS Policies for Registration Flow

  1. Changes
    - Drop existing RLS policies for company_profiles and user_preferences
    - Create new, more permissive policies that allow:
      - Authenticated users to insert their own records
      - Users to read their own records
      - Users to update their own records

  2. Security
    - Maintains data isolation between users
    - Ensures users can only access their own data
    - Allows proper registration flow
*/

-- Drop existing policies for company_profiles
DROP POLICY IF EXISTS "Users can view own company profile" ON company_profiles;
DROP POLICY IF EXISTS "Users can create own company profile" ON company_profiles;
DROP POLICY IF EXISTS "Users can update own company profile" ON company_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON company_profiles;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON company_profiles;
DROP POLICY IF EXISTS "Enable update access for users based on user_id" ON company_profiles;

-- Drop existing policies for user_preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can create own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_preferences;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON user_preferences;
DROP POLICY IF EXISTS "Enable update access for users based on user_id" ON user_preferences;

-- Create new policies for company_profiles
CREATE POLICY "Allow users to manage their own company profile"
ON company_profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create new policies for user_preferences
CREATE POLICY "Allow users to manage their own preferences"
ON user_preferences
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);