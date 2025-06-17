-- Create a test user for development
-- Password: "password123" (hashed with bcrypt)
INSERT INTO users (id, email, password, name, created_at, updated_at)
VALUES (
  'test-user-id',
  'test@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G',
  'Test User',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
