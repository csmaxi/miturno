-- Add instagram column to team_members table
ALTER TABLE team_members ADD COLUMN instagram TEXT;

-- Update the types to include instagram
COMMENT ON COLUMN team_members.instagram IS 'Instagram username for team member'; 