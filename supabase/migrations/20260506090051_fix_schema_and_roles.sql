-- Migration: Corrige schema e garante roles dos usuários de teste
-- Data: 2026-05-06

-- 1. Garantir que o enum app_role tenha todos os valores necessários
DO $$
BEGIN
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'master';
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'admin';
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'cliente';
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN
    CREATE TYPE app_role AS ENUM ('master', 'admin', 'cliente');
END $$;

-- 2. Garantir Primary Key em portal_client_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'portal_client_users'::regclass
    AND contype = 'p'
  ) THEN
    ALTER TABLE portal_client_users
      ADD PRIMARY KEY (user_id, client_id);
  END IF;
END $$;

-- 3. Garantir constraint unique em user_roles(user_id)
ALTER TABLE user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_unique;

ALTER TABLE user_roles
  ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);

-- 4. Garantir que a coluna role em portal_client_users aceite 'cliente'
ALTER TABLE portal_client_users
  DROP CONSTRAINT IF EXISTS portal_client_users_role_check;

ALTER TABLE portal_client_users
  ALTER COLUMN role TYPE text,
  ALTER COLUMN role SET DEFAULT 'cliente',
  ALTER COLUMN role SET NOT NULL;

ALTER TABLE portal_client_users
  ADD CONSTRAINT portal_client_users_role_check
  CHECK (role IN ('master', 'admin', 'cliente'));

-- 5. Garantir que dev@grupototum.com seja master em user_roles
INSERT INTO user_roles (user_id, role)
SELECT id, 'master'
FROM auth.users
WHERE email = 'dev@grupototum.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'master';

-- 6. Garantir que dev@grupototum.com seja master em portal_client_users
UPDATE portal_client_users
SET role = 'master'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'dev@grupototum.com');
