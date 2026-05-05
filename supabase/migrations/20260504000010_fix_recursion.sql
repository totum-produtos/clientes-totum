-- Migration: Correção de recursão infinita em RLS policies
-- Data: 2026-05-04
-- Descrição:
--   A policy portal_client_users_self_view usava OR + subquery na própria tabela,
--   causando infinite recursion (42P17). Corrigido para user_id = auth.uid() apenas.

-- Fixar recursão em portal_client_users
DROP POLICY IF EXISTS "portal_client_users_self_view" ON portal_client_users;
CREATE POLICY "portal_client_users_self_view" ON portal_client_users FOR SELECT
  USING (user_id = auth.uid());

-- Fixar policies de portal_clients
DROP POLICY IF EXISTS "portal_client_self_view" ON portal_clients;
CREATE POLICY "portal_client_self_view" ON portal_clients FOR SELECT
  USING (id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

-- Fixar policies wanda_posts
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

-- Fixar policies tarefas
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

-- Fixar policies projetos
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
