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

-- Grant necessary permissions
GRANT SELECT ON users TO authenticated;
GRANT UPDATE ON users TO authenticated;
GRANT INSERT ON users TO authenticated;

-- Grant access to the subscription_plan column
GRANT SELECT (id, subscription_plan) ON users TO authenticated;
GRANT UPDATE (subscription_plan) ON users TO authenticated; 