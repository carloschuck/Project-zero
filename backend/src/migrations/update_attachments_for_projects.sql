-- Update attachments table to support both tickets and projects
-- This migration adds missing columns and makes ticket_id optional

-- First, check if columns exist and add them if missing
DO $$ 
BEGIN
    -- Add filename column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attachments' AND column_name = 'filename') THEN
        ALTER TABLE attachments ADD COLUMN filename VARCHAR(255);
    END IF;

    -- Add original_filename column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attachments' AND column_name = 'original_filename') THEN
        ALTER TABLE attachments ADD COLUMN original_filename VARCHAR(255);
    END IF;

    -- Add project_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attachments' AND column_name = 'project_id') THEN
        ALTER TABLE attachments ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE CASCADE;
    END IF;

    -- Add entity_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attachments' AND column_name = 'entity_type') THEN
        ALTER TABLE attachments ADD COLUMN entity_type VARCHAR(20) DEFAULT 'ticket';
    END IF;
END $$;

-- Make ticket_id nullable since we now support projects too
ALTER TABLE attachments ALTER COLUMN ticket_id DROP NOT NULL;

-- Update existing records to have entity_type = 'ticket'
UPDATE attachments SET entity_type = 'ticket' WHERE entity_type IS NULL;

-- Populate filename and original_filename from file_name if they're null
-- (in case there are existing records)
UPDATE attachments 
SET filename = file_name, 
    original_filename = file_name 
WHERE filename IS NULL 
  AND file_name IS NOT NULL;

-- Add check constraint to ensure either ticket_id or project_id is set
ALTER TABLE attachments DROP CONSTRAINT IF EXISTS attachments_entity_check;
ALTER TABLE attachments ADD CONSTRAINT attachments_entity_check 
    CHECK (
        (ticket_id IS NOT NULL AND project_id IS NULL) OR 
        (project_id IS NOT NULL AND ticket_id IS NULL)
    );

-- Add index for project_id
CREATE INDEX IF NOT EXISTS idx_attachments_project_id ON attachments(project_id);

-- Make sure we have the other indexes too
CREATE INDEX IF NOT EXISTS idx_attachments_ticket_id ON attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);

-- Show the final structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'attachments' 
ORDER BY ordinal_position;

