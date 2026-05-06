-- Migration: RLS policies iniciais (SELECT apenas)
-- Data: 2026-05-04
-- Depende de: 20260504000002_link_demo_data.sql
-- Descrição: Ativa RLS e cria policies SELECT para wanda_posts, tarefas, projetos.
-- ⚠️ Esta migration foi SUPERSEDIDA por 20260504000007_fix_rls_policies.sql,
--    que adiciona INSERT/UPDATE/DELETE e remove vazamento IS NULL.

ALTER TABLE wanda_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "portal_wanda_posts_view" ON wanda_posts;
CREATE POLICY "portal_wanda_posts_view" ON wanda_posts FOR SELECT
  USING (portal_client_id IS NULL OR portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "portal_tarefas_view" ON tarefas;
CREATE POLICY "portal_tarefas_view" ON tarefas FOR SELECT
  USING (portal_client_id IS NULL OR portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "portal_projetos_view" ON projetos;
CREATE POLICY "portal_projetos_view" ON projetos FOR SELECT
  USING (portal_client_id IS NULL OR portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));
