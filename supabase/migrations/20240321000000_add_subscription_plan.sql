-- Drop existing column if it exists (to avoid conflicts)
ALTER TABLE users DROP COLUMN IF EXISTS subscription_plan;

-- Add subscription_plan column to users table
ALTER TABLE users
ADD COLUMN subscription_plan VARCHAR(20) NOT NULL DEFAULT 'free';

-- Update existing users to have 'free' plan
UPDATE users
SET subscription_plan = 'free'
WHERE subscription_plan IS NULL;

-- Verify the column was added
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'subscription_plan'
    ) THEN
        RAISE EXCEPTION 'Column subscription_plan was not added successfully';
    END IF;
END $$; 