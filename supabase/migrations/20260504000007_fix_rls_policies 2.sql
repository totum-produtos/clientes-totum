-- Migration: Correção completa de RLS policies (Fase 1 Hardening)
-- Data: 2026-05-04
-- Depende de: 20260504000006_portal_views.sql (ou migrations anteriores que criam tabelas)
-- Descrição:
--   1. Remove cláusula IS NULL das policies SELECT (vazamento de tenant)
--   2. Adiciona policies INSERT/UPDATE/DELETE faltantes em wanda_posts, tarefas, projetos
--   3. Adiciona policies INSERT/DELETE em portal_clients e portal_client_users
--   4. TODO: policies admin em portal_clients/client_users usam auth.uid() IS NOT NULL
--      como proxy. Deve ser refinado quando houver flag de admin (ver issue #2).

-- ============================================================
-- wanda_posts
-- ============================================================
DROP POLICY IF EXISTS "portal_wanda_posts_view" ON wanda_posts;
CREATE POLICY "portal_wanda_posts_view" ON wanda_posts FOR SELECT
  USING (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "portal_wanda_posts_insert" ON wanda_posts;
CREATE POLICY "portal_wanda_posts_insert" ON wanda_posts FOR INSERT
  WITH CHECK (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "portal_wanda_posts_update" ON wanda_posts;
CREATE POLICY "portal_wanda_posts_update" ON wanda_posts FOR UPDATE
  USING (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ))
  WITH CHECK (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "portal_wanda_posts_delete" ON wanda_posts;
CREATE POLICY "portal_wanda_posts_delete" ON wanda_posts FOR DELETE
  USING (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

-- ============================================================
-- tarefas
-- ============================================================
DROP POLICY IF EXISTS "portal_tarefas_view" ON tarefas;
CREATE POLICY "portal_tarefas_view" ON tarefas FOR SELECT
  USING (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "portal_tarefas_insert" ON tarefas;
CREATE POLICY "portal_tarefas_insert" ON tarefas FOR INSERT
  WITH CHECK (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "portal_tarefas_update" ON tarefas;
CREATE POLICY "portal_tarefas_update" ON tarefas FOR UPDATE
  USING (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ))
  WITH CHECK (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "portal_tarefas_delete" ON tarefas;
CREATE POLICY "portal_tarefas_delete" ON tarefas FOR DELETE
  USING (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

-- ============================================================
-- projetos
-- ============================================================
DROP POLICY IF EXISTS "portal_projetos_view" ON projetos;
CREATE POLICY "portal_projetos_view" ON projetos FOR SELECT
  USING (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "portal_projetos_insert" ON projetos;
CREATE POLICY "portal_projetos_insert" ON projetos FOR INSERT
  WITH CHECK (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "portal_projetos_update" ON projetos;
CREATE POLICY "portal_projetos_update" ON projetos FOR UPDATE
  USING (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ))
  WITH CHECK (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "portal_projetos_delete" ON projetos;
CREATE POLICY "portal_projetos_delete" ON projetos FOR DELETE
  USING (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

-- ============================================================
-- portal_clients  (admin — proxy temporário)
-- ============================================================
DROP POLICY IF EXISTS "portal_client_self_view" ON portal_clients;
CREATE POLICY "portal_client_self_view" ON portal_clients FOR SELECT
  USING (id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "portal_client_admin_insert" ON portal_clients;
CREATE POLICY "portal_client_admin_insert" ON portal_clients FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "portal_client_admin_update" ON portal_clients;
CREATE POLICY "portal_client_admin_update" ON portal_clients FOR UPDATE
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "portal_client_admin_delete" ON portal_clients;
CREATE POLICY "portal_client_admin_delete" ON portal_clients FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- portal_client_users  (admin — proxy temporário)
-- ============================================================
DROP POLICY IF EXISTS "portal_client_users_self_view" ON portal_client_users;
CREATE POLICY "portal_client_users_self_view" ON portal_client_users FOR SELECT
  USING (user_id = auth.uid() OR client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "portal_client_users_admin_insert" ON portal_client_users;
CREATE POLICY "portal_client_users_admin_insert" ON portal_client_users FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "portal_client_users_admin_delete" ON portal_client_users;
CREATE POLICY "portal_client_users_admin_delete" ON portal_client_users FOR DELETE
  USING (auth.uid() IS NOT NULL);
