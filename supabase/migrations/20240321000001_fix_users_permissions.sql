-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;

-- Create new policies with proper permissions
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

-- Grant necessary permissions to authenticated users
GRANT SELECT, UPDATE ON users TO authenticated;
GRANT USAGE ON SEQUENCE users_id_seq TO authenticated;

-- Grant access to the subscription_plan column
GRANT SELECT (id, subscription_plan) ON users TO authenticated;
GRANT UPDATE (subscription_plan) ON users TO authenticated; 