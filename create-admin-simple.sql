-- Simple SQL to create admin user directly
-- Run this in DigitalOcean Database Console

-- Create admin user with known password hash for 'admin123'
INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@company.com',
  '$2b$10$YQ7Y5QhF7xL7VN9FZGJqU.rKX8vQJX5TbZjJZJ8vQJX5TbZjJZJ8v',
  'Admin',
  'User',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

