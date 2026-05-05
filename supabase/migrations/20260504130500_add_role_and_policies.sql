-- Migration: Adiciona campo role em portal_client_users + function get_user_role() + policies com role
-- Data: 2026-05-04
-- Depende de: 20260504000006_portal_views.sql, 20260504000010_fix_recursion.sql

-- 1. Adicionar coluna role (com default 'cliente' para não quebrar dados existentes)
ALTER TABLE portal_client_users
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'cliente'
  CHECK (role IN ('master', 'admin', 'cliente'));

-- 2. Function helper para obter role do usuário logado
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role FROM portal_client_users WHERE user_id = auth.uid() LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Atualizar policies da tabela portal_clients com role
DROP POLICY IF EXISTS "portal_clients_select" ON portal_clients;
CREATE POLICY "portal_clients_select" ON portal_clients FOR SELECT
  USING (
    get_user_role() = 'master'
    OR id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "portal_clients_insert" ON portal_clients;
CREATE POLICY "portal_clients_insert" ON portal_clients FOR INSERT
  WITH CHECK (get_user_role() = 'master');

DROP POLICY IF EXISTS "portal_clients_update" ON portal_clients;
CREATE POLICY "portal_clients_update" ON portal_clients FOR UPDATE
  USING (
    get_user_role() = 'master'
    OR id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "portal_clients_delete" ON portal_clients;
CREATE POLICY "portal_clients_delete" ON portal_clients FOR DELETE
  USING (get_user_role() = 'master');

-- 4. Atualizar policies da tabela portal_client_users com role
DROP POLICY IF EXISTS "portal_client_users_select" ON portal_client_users;
CREATE POLICY "portal_client_users_select" ON portal_client_users FOR SELECT
  USING (
    get_user_role() = 'master'
    OR user_id = auth.uid()
    OR client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid() AND role IN ('master', 'admin')
    )
  );

DROP POLICY IF EXISTS "portal_client_users_insert" ON portal_client_users;
CREATE POLICY "portal_client_users_insert" ON portal_client_users FOR INSERT
  WITH CHECK (
    get_user_role() = 'master'
    OR (
      get_user_role() = 'admin'
      AND client_id IN (
        SELECT client_id FROM portal_client_users WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

DROP POLICY IF EXISTS "portal_client_users_update" ON portal_client_users;
CREATE POLICY "portal_client_users_update" ON portal_client_users FOR UPDATE
  USING (
    get_user_role() = 'master'
    OR (
      get_user_role() = 'admin'
      AND client_id IN (
        SELECT client_id FROM portal_client_users WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

DROP POLICY IF EXISTS "portal_client_users_delete" ON portal_client_users;
CREATE POLICY "portal_client_users_delete" ON portal_client_users FOR DELETE
  USING (
    get_user_role() = 'master'
    OR (
      get_user_role() = 'admin'
      AND client_id IN (
        SELECT client_id FROM portal_client_users WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

-- 5. Atualizar policies da tabela wanda_posts com role
DROP POLICY IF EXISTS "wanda_posts_select" ON wanda_posts;
CREATE POLICY "wanda_posts_select" ON wanda_posts FOR SELECT
  USING (
    get_user_role() = 'master'
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "wanda_posts_insert" ON wanda_posts;
CREATE POLICY "wanda_posts_insert" ON wanda_posts FOR INSERT
  WITH CHECK (
    get_user_role() = 'master'
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "wanda_posts_update" ON wanda_posts;
CREATE POLICY "wanda_posts_update" ON wanda_posts FOR UPDATE
  USING (
    get_user_role() = 'master'
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "wanda_posts_delete" ON wanda_posts;
CREATE POLICY "wanda_posts_delete" ON wanda_posts FOR DELETE
  USING (
    get_user_role() = 'master'
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

-- 6. Atualizar policies da tabela tarefas com role
DROP POLICY IF EXISTS "tarefas_select" ON tarefas;
CREATE POLICY "tarefas_select" ON tarefas FOR SELECT
  USING (
    get_user_role() = 'master'
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "tarefas_insert" ON tarefas;
CREATE POLICY "tarefas_insert" ON tarefas FOR INSERT
  WITH CHECK (
    get_user_role() = 'master'
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "tarefas_update" ON tarefas;
CREATE POLICY "tarefas_update" ON tarefas FOR UPDATE
  USING (
    get_user_role() = 'master'
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "tarefas_delete" ON tarefas;
CREATE POLICY "tarefas_delete" ON tarefas FOR DELETE
  USING (
    get_user_role() = 'master'
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

-- 7. Atualizar policies da tabela projetos com role
DROP POLICY IF EXISTS "projetos_select" ON projetos;
CREATE POLICY "projetos_select" ON projetos FOR SELECT
  USING (
    get_user_role() = 'master'
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "projetos_insert" ON projetos;
CREATE POLICY "projetos_insert" ON projetos FOR INSERT
  WITH CHECK (
    get_user_role() = 'master'
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "projetos_update" ON projetos;
CREATE POLICY "projetos_update" ON projetos FOR UPDATE
  USING (
    get_user_role() = 'master'
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "projetos_delete" ON projetos;
CREATE POLICY "projetos_delete" ON projetos FOR DELETE
  USING (
    get_user_role() = 'master'
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

-- 8. Atualizar policies da tabela ad_campaigns com role
DROP POLICY IF EXISTS "ad_campaigns_select" ON ad_campaigns;
CREATE POLICY "ad_campaigns_select" ON ad_campaigns FOR SELECT
  USING (
    get_user_role() = 'master'
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "ad_campaigns_insert" ON ad_campaigns;
CREATE POLICY "ad_campaigns_insert" ON ad_campaigns FOR INSERT
  WITH CHECK (
    get_user_role() = 'master'
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "ad_campaigns_update" ON ad_campaigns;
CREATE POLICY "ad_campaigns_update" ON ad_campaigns FOR UPDATE
  USING (
    get_user_role() = 'master'
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "ad_campaigns_delete" ON ad_campaigns;
CREATE POLICY "ad_campaigns_delete" ON ad_campaigns FOR DELETE
  USING (
    get_user_role() = 'master'
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

-- 9. Atualizar policies do storage bucket client_files com role
DROP POLICY IF EXISTS "client_files_select" ON storage.objects;
CREATE POLICY "client_files_select" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'client_files'
    AND (
      get_user_role() = 'master'
      OR (
        REPLACE(storage.objects.name, SPLIT_PART(storage.objects.name, '/', 1) || '/', '') LIKE '%'
        AND SPLIT_PART(storage.objects.name, '/', 1) = (
          SELECT id::text FROM portal_clients
          WHERE id IN (SELECT client_id FROM portal_client_users WHERE user_id = auth.uid())
          LIMIT 1
        )
      )
    )
  );

-- Nota: As policies de storage INSERT/UPDATE/DELETE mantêm a lógica anterior
-- (master vê tudo, cliente vê só sua pasta via RLS de path)
