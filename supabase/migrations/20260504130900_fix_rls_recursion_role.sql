-- Hotfix: Remove recursão causada por get_user_role() em policies RLS
-- Problema: get_user_role() consulta portal_client_users, que tem RLS,
-- que chama get_user_role() → recursão infinita → erro 500
-- Solução: 1) dropar policies, 2) dropar função, 3) recriar policies com subqueries diretas

-- ============================================================
-- PASSO 1: Dropar TODAS as policies que dependem de get_user_role()
-- ============================================================

-- portal_clients
DROP POLICY IF EXISTS "portal_clients_select" ON portal_clients;
DROP POLICY IF EXISTS "portal_clients_insert" ON portal_clients;
DROP POLICY IF EXISTS "portal_clients_update" ON portal_clients;
DROP POLICY IF EXISTS "portal_clients_delete" ON portal_clients;

-- portal_client_users
DROP POLICY IF EXISTS "portal_client_users_select" ON portal_client_users;
DROP POLICY IF EXISTS "portal_client_users_insert" ON portal_client_users;
DROP POLICY IF EXISTS "portal_client_users_update" ON portal_client_users;
DROP POLICY IF EXISTS "portal_client_users_delete" ON portal_client_users;

-- wanda_posts
DROP POLICY IF EXISTS "wanda_posts_select" ON wanda_posts;
DROP POLICY IF EXISTS "wanda_posts_insert" ON wanda_posts;
DROP POLICY IF EXISTS "wanda_posts_update" ON wanda_posts;
DROP POLICY IF EXISTS "wanda_posts_delete" ON wanda_posts;

-- tarefas
DROP POLICY IF EXISTS "tarefas_select" ON tarefas;
DROP POLICY IF EXISTS "tarefas_insert" ON tarefas;
DROP POLICY IF EXISTS "tarefas_update" ON tarefas;
DROP POLICY IF EXISTS "tarefas_delete" ON tarefas;

-- projetos
DROP POLICY IF EXISTS "projetos_select" ON projetos;
DROP POLICY IF EXISTS "projetos_insert" ON projetos;
DROP POLICY IF EXISTS "projetos_update" ON projetos;
DROP POLICY IF EXISTS "projetos_delete" ON projetos;

-- ad_campaigns
DROP POLICY IF EXISTS "ad_campaigns_select" ON ad_campaigns;
DROP POLICY IF EXISTS "ad_campaigns_insert" ON ad_campaigns;
DROP POLICY IF EXISTS "ad_campaigns_update" ON ad_campaigns;
DROP POLICY IF EXISTS "ad_campaigns_delete" ON ad_campaigns;

-- storage
DROP POLICY IF EXISTS "client_files_select" ON storage.objects;

-- ============================================================
-- PASSO 2: Dropar a função problemática
-- ============================================================
DROP FUNCTION IF EXISTS get_user_role();

-- ============================================================
-- PASSO 3: Recriar policies SEM get_user_role(), usando subqueries diretas
-- ============================================================

-- portal_clients
CREATE POLICY "portal_clients_select" ON portal_clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "portal_clients_insert" ON portal_clients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
  );

CREATE POLICY "portal_clients_update" ON portal_clients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "portal_clients_delete" ON portal_clients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
  );

-- portal_client_users
CREATE POLICY "portal_client_users_select" ON portal_client_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users AS pcu2
      WHERE pcu2.user_id = auth.uid() AND pcu2.role = 'master'
    )
    OR user_id = auth.uid()
    OR (
      EXISTS (
        SELECT 1 FROM portal_client_users AS pcu2
        WHERE pcu2.user_id = auth.uid() AND pcu2.role = 'admin'
      )
      AND client_id IN (
        SELECT client_id FROM portal_client_users 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "portal_client_users_insert" ON portal_client_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR (
      EXISTS (
        SELECT 1 FROM portal_client_users 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
      AND client_id IN (
        SELECT client_id FROM portal_client_users 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "portal_client_users_update" ON portal_client_users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR (
      EXISTS (
        SELECT 1 FROM portal_client_users 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
      AND client_id IN (
        SELECT client_id FROM portal_client_users 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "portal_client_users_delete" ON portal_client_users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR (
      EXISTS (
        SELECT 1 FROM portal_client_users 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
      AND client_id IN (
        SELECT client_id FROM portal_client_users 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

-- wanda_posts
CREATE POLICY "wanda_posts_select" ON wanda_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "wanda_posts_insert" ON wanda_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "wanda_posts_update" ON wanda_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "wanda_posts_delete" ON wanda_posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

-- tarefas
CREATE POLICY "tarefas_select" ON tarefas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "tarefas_insert" ON tarefas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "tarefas_update" ON tarefas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "tarefas_delete" ON tarefas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

-- projetos
CREATE POLICY "projetos_select" ON projetos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "projetos_insert" ON projetos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "projetos_update" ON projetos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "projetos_delete" ON projetos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

-- ad_campaigns
CREATE POLICY "ad_campaigns_select" ON ad_campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ad_campaigns_insert" ON ad_campaigns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ad_campaigns_update" ON ad_campaigns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ad_campaigns_delete" ON ad_campaigns FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users 
      WHERE user_id = auth.uid() AND role = 'master'
    )
    OR portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );
