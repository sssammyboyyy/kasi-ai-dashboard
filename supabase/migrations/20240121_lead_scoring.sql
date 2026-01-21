-- Add score columns to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS score_reason TEXT;

-- Update RLS (Optional, usually covered by existing policies if they select *)
-- But just in case
COMMENT ON COLUMN leads.score IS 'AI-generated quality score (0-100)';
