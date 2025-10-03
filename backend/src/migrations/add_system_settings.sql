-- Create system_settings table for application configuration
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'string',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on setting_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
  -- Email Configuration
  ('smtp_host', 'smtp.gmail.com', 'string', 'SMTP server hostname'),
  ('smtp_port', '587', 'number', 'SMTP server port'),
  ('smtp_secure', 'true', 'boolean', 'Use SSL/TLS for secure connection'),
  ('smtp_username', '', 'string', 'SMTP authentication username'),
  ('smtp_password', '', 'password', 'SMTP authentication password'),
  ('email_from_address', 'noreply@ticketing.com', 'string', 'From email address'),
  ('email_from_name', 'Ticketing System', 'string', 'From name for emails'),
  
  -- Organization Details
  ('org_name', 'Houses of Light', 'string', 'Organization name'),
  ('org_support_email', 'support@example.com', 'string', 'Support contact email'),
  ('org_website', 'https://example.com', 'string', 'Organization website URL'),
  ('org_address', '', 'string', 'Organization physical address'),
  ('org_phone', '', 'string', 'Organization phone number'),
  ('org_timezone', 'America/Los_Angeles', 'string', 'Organization timezone')
ON CONFLICT (setting_key) DO NOTHING;

-- Add trigger to update updated_at
CREATE TRIGGER update_system_settings_updated_at 
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

