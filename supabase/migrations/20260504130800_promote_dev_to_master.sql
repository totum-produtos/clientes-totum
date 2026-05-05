-- Migration: Promove dev@grupototum.com para master
-- Data: 2026-05-04

DO $$
DECLARE
  dev_user_id uuid;
BEGIN
  -- Busca o UUID do usuário pelo email
  SELECT id INTO dev_user_id
  FROM auth.users
  WHERE email = 'dev@grupototum.com'
  LIMIT 1;

  IF dev_user_id IS NOT NULL THEN
    -- Garante que o usuário existe em portal_client_users
    INSERT INTO portal_client_users (user_id, client_id, role)
    SELECT dev_user_id, id, 'master'
    FROM portal_clients
    WHERE NOT EXISTS (
      SELECT 1 FROM portal_client_users WHERE user_id = dev_user_id
    )
    LIMIT 1
    ON CONFLICT (user_id, client_id) DO UPDATE SET role = 'master';
    
    -- Atualiza role para master em todos os vínculos existentes
    UPDATE portal_client_users
    SET role = 'master'
    WHERE user_id = dev_user_id;
  END IF;
END $$;
