-- Migration: Cria tabelas de aprovação de alterações e notificações
-- Data: 2026-05-06

-- ============================================================
-- 1. Tabela de alterações pendentes de perfil do cliente
-- ============================================================
CREATE TABLE IF NOT EXISTS client_profile_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_client_id uuid NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  field_path text NOT NULL,
  old_value text,
  new_value text,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE client_profile_changes ENABLE ROW LEVEL SECURITY;

-- Master vê todas as alterações
DROP POLICY IF EXISTS "client_profile_changes_select_master" ON client_profile_changes;
CREATE POLICY "client_profile_changes_select_master" ON client_profile_changes FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'master')
    OR requested_by = auth.uid()
  );

-- Cliente vê só as suas alterações
DROP POLICY IF EXISTS "client_profile_changes_select_client" ON client_profile_changes;
CREATE POLICY "client_profile_changes_select_client" ON client_profile_changes FOR SELECT
  USING (requested_by = auth.uid());

-- Master pode inserir (quando aprova/rejeita cria registro de revisão)
DROP POLICY IF EXISTS "client_profile_changes_insert" ON client_profile_changes;
CREATE POLICY "client_profile_changes_insert" ON client_profile_changes FOR INSERT
  WITH CHECK (requested_by = auth.uid());

-- Master pode atualizar status
DROP POLICY IF EXISTS "client_profile_changes_update_master" ON client_profile_changes;
CREATE POLICY "client_profile_changes_update_master" ON client_profile_changes FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'master')
    OR requested_by = auth.uid()
  );

-- Master pode deletar
DROP POLICY IF EXISTS "client_profile_changes_delete_master" ON client_profile_changes;
CREATE POLICY "client_profile_changes_delete_master" ON client_profile_changes FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'master')
    OR requested_by = auth.uid()
  );

-- ============================================================
-- 2. Tabela de notificações
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'geral' CHECK (type IN ('alteracao_pendente', 'alteracao_aprovada', 'alteracao_rejeitada', 'geral')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Usuário vê só suas próprias notificações
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Só o sistema/masters podem inserir notificações para outros
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'master')
    OR user_id = auth.uid()
  );

-- Usuário pode marcar suas notificações como lidas
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Usuário pode deletar suas notificações
DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- 3. Índices para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_client_profile_changes_client ON client_profile_changes(portal_client_id);
CREATE INDEX IF NOT EXISTS idx_client_profile_changes_status ON client_profile_changes(status);
CREATE INDEX IF NOT EXISTS idx_client_profile_changes_requested_by ON client_profile_changes(requested_by);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
