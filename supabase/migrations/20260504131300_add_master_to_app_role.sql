-- Hotfix: Adiciona valores ausentes ao enum app_role e insere o usuário master

-- Adicionar valores ao enum app_role (ignora se já existem)
DO $$
BEGIN
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'master';
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'admin';
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'cliente';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Inserir/atualizar o usuário dev@grupototum.com como master
INSERT INTO user_roles (user_id, role)
VALUES ('e6d2d658-ca24-4577-a6e9-f6e60cfa2a67', 'master')
ON CONFLICT (user_id) DO UPDATE SET role = 'master';
