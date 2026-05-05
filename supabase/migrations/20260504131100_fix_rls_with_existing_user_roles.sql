-- Hotfix: Elimina recursão RLS usando tabela user_roles existente
-- A tabela user_roles já existe no banco com tipo app_role para a coluna role
-- Não recriamos a tabela, apenas garantimos que ela não tem RLS e usamos nas policies

-- 1. Garantir que user_roles não tem RLS (para evitar recursão)
ALTER TABLE IF EXISTS user_roles DISABLE ROW LEVEL SECURITY;

-- 2. Dropar TODAS as policies atuais que podem ter recursão
DROP POLICY IF EXISTS "portal_clients_select" ON portal_clients;
DROP POLICY IF EXISTS "portal_clients_insert" ON portal_clients;
DROP POLICY IF EXISTS "portal_clients_update" ON portal_clients;
DROP POLICY IF EXISTS "portal_clients_delete" ON portal_clients;

DROP POLICY IF EXISTS "portal_client_users_select" ON portal_client_users;
DROP POLICY IF EXISTS "portal_client_users_insert" ON portal_client_users;
DROP POLICY IF EXISTS "portal_client_users_update" ON portal_client_users;
DROP POLICY IF EXISTS "portal_client_users_delete" ON portal_client_users;

DROP POLICY IF EXISTS "wanda_posts_select" ON wanda_posts;
DROP POLICY IF EXISTS "wanda_posts_insert" ON wanda_posts;
DROP POLICY IF EXISTS "wanda_posts_update" ON wanda_posts;
DROP POLICY IF EXISTS "wanda_posts_delete" ON wanda_posts;

DROP POLICY IF EXISTS "tarefas_select" ON tarefas;
DROP POLICY IF EXISTS "tarefas_insert" ON tarefas;
DROP POLICY IF EXISTS "tarefas_update" ON tarefas;
DROP POLICY IF EXISTS "tarefas_delete" ON tarefas;

DROP POLICY IF EXISTS "projetos_select" ON projetos;
DROP POLICY IF EXISTS "projetos_insert" ON projetos;
DROP POLICY IF EXISTS "projetos_update" ON projetos;
DROP POLICY IF EXISTS "projetos_delete" ON projetos;

DROP POLICY IF EXISTS "ad_campaigns_select" ON ad_campaigns;
DROP POLICY IF EXISTS "ad_campaigns_insert" ON ad_campaigns;
DROP POLICY IF EXISTS "ad_campaigns_update" ON ad_campaigns;
DROP POLICY IF EXISTS "ad_campaigns_delete" ON ad_campaigns;

-- 3. Recriar policies usando user_roles (SEM recursão)
-- Usamos LOWER(role::text) para compatibilidade com app_role enum

-- portal_clients
CREATE POLICY "portal_clients_select" ON portal_clients FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "portal_clients_insert" ON portal_clients FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
  );

CREATE POLICY "portal_clients_update" ON portal_clients FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "portal_clients_delete" ON portal_clients FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
  );

-- portal_client_users
CREATE POLICY "portal_client_users_select" ON portal_client_users FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR user_id = auth.uid()
  );

CREATE POLICY "portal_client_users_insert" ON portal_client_users FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
  );

CREATE POLICY "portal_client_users_update" ON portal_client_users FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
  );

CREATE POLICY "portal_client_users_delete" ON portal_client_users FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
  );

-- wanda_posts
CREATE POLICY "wanda_posts_select" ON wanda_posts FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "wanda_posts_insert" ON wanda_posts FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "wanda_posts_update" ON wanda_posts FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "wanda_posts_delete" ON wanda_posts FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

-- tarefas
CREATE POLICY "tarefas_select" ON tarefas FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "tarefas_insert" ON tarefas FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "tarefas_update" ON tarefas FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "tarefas_delete" ON tarefas FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

-- projetos
CREATE POLICY "projetos_select" ON projetos FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "projetos_insert" ON projetos FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "projetos_update" ON projetos FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "projetos_delete" ON projetos FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

-- ad_campaigns
CREATE POLICY "ad_campaigns_select" ON ad_campaigns FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ad_campaigns_insert" ON ad_campaigns FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ad_campaigns_update" ON ad_campaigns FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ad_campaigns_delete" ON ad_campaigns FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'master')
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

-- 4. Sincronizar roles existentes de portal_client_users para user_roles
-- Usa DO block para lidar com tipos diferentes (app_role vs text)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    INSERT INTO user_roles (user_id, role)
    SELECT DISTINCT ON (user_id) user_id, role::text
    FROM portal_client_users
    ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role::text;
  END IF;
END $$;

-- 5. Trigger para manter user_roles sincronizado
CREATE OR REPLACE FUNCTION sync_user_roles()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.user_id, NEW.role::text)
    ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_user_roles_trigger ON portal_client_users;
CREATE TRIGGER sync_user_roles_trigger
  AFTER INSERT OR UPDATE ON portal_client_users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_roles();
