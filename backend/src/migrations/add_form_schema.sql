-- Add form_schema column to categories table for custom form definitions
ALTER TABLE categories ADD COLUMN IF NOT EXISTS form_schema JSONB DEFAULT '[]';

-- Create index on form_schema for faster queries
CREATE INDEX IF NOT EXISTS idx_categories_form_schema ON categories USING GIN (form_schema);

-- Add comment to explain the column
COMMENT ON COLUMN categories.form_schema IS 'JSON array defining custom form fields for this category';

