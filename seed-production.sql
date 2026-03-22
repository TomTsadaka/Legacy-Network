-- Legacy Network: Production Seed for Tom
-- Run this in Vercel Postgres Console

-- 1. Create Tom's user
INSERT INTO users (id, email, username, password, name, role, "emailVerified", "createdAt", "updatedAt")
VALUES (
  'tom-user-production',
  'tom@legacy-network.com',
  'tom',
  '$2b$10$d2fuwzhDybO8CjeJSDoLPeJRp8aBnNNtsCvUlDTbdKfUcru0gjVDG',
  'Tom Tsadaka',
  'SUPER_ADMIN',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- 2. Create Tom's family
INSERT INTO families (id, name, "createdAt", "updatedAt")
VALUES (
  'tom-family-production',
  'משפחת צדקה',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 3. Link Tom to his family
INSERT INTO family_members (id, "userId", "familyId", role, "createdAt")
VALUES (
  gen_random_uuid(),
  'tom-user-production',
  'tom-family-production',
  'OWNER',
  NOW()
)
ON CONFLICT DO NOTHING;

-- Verify
SELECT 
  u.id, 
  u.email, 
  u.username, 
  u.role,
  f.name as family_name,
  fm.role as family_role
FROM users u
LEFT JOIN family_members fm ON fm."userId" = u.id
LEFT JOIN families f ON f.id = fm."familyId"
WHERE u.email = 'tom@legacy-network.com';
