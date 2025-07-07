-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Allow subscription plan access" ON users;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT SELECT, UPDATE, INSERT ON users TO authenticated;
GRANT SELECT, UPDATE, INSERT ON subscriptions TO authenticated;
GRANT SELECT, UPDATE, INSERT ON services TO authenticated;
GRANT SELECT, UPDATE, INSERT ON appointments TO authenticated;
GRANT SELECT, UPDATE, INSERT ON team_members TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON SEQUENCE users_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE subscriptions_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE services_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE appointments_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE team_members_id_seq TO authenticated;

-- Create or replace policies for each table
-- Users table policies
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own data"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Subscriptions table policies
CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
    ON subscriptions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Services table policies
CREATE POLICY "Users can view their own services"
    ON services FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own services"
    ON services FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own services"
    ON services FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Appointments table policies
CREATE POLICY "Users can view their own appointments"
    ON appointments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments"
    ON appointments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointments"
    ON appointments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Team members table policies
CREATE POLICY "Users can view their own team members"
    ON team_members FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own team members"
    ON team_members FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own team members"
    ON team_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Revoke all existing permissions
REVOKE ALL ON users FROM authenticated;
REVOKE ALL ON users FROM anon;

-- Grant necessary permissions
GRANT SELECT ON users TO authenticated;
GRANT UPDATE ON users TO authenticated;
GRANT INSERT ON users TO authenticated;
GRANT SELECT ON users TO anon;

-- Grant specific column permissions
GRANT SELECT (id, subscription_plan) ON users TO authenticated;
GRANT UPDATE (subscription_plan) ON users TO authenticated;
GRANT SELECT (id, subscription_plan) ON users TO anon;

-- Verify the policies were created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Allow subscription plan access'
    ) THEN
        RAISE EXCEPTION 'Policy "Allow subscription plan access" was not created successfully';
    END IF;
END $$; 