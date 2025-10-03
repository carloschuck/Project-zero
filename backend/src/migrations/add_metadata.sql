-- Add metadata column to tickets table for category-specific data
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add Events category if it doesn't exist
INSERT INTO categories (name, description, department) VALUES
  ('Events', 'Event planning and coordination requests', 'Events')
ON CONFLICT (name) DO NOTHING;

-- Create index on metadata for faster queries
CREATE INDEX IF NOT EXISTS idx_tickets_metadata ON tickets USING GIN (metadata);

