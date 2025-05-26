-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Allow subscription plan access" ON users;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create a more permissive policy for subscription_plan
CREATE POLICY "Allow subscription plan access"
    ON users FOR ALL
    USING (true)
    WITH CHECK (true);

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