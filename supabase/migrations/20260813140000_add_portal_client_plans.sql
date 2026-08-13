-- Migration: Cria portal_client_plans (Central de Planejamentos)
-- Data: 2026-08-13
-- Depende de: 20260504000006_portal_views.sql, 20260506092013_add_approvals_and_notifications.sql
--
-- ⚠️ NO-FLY ZONE (RLS) — NÃO APLICAR SEM APROVAÇÃO HUMANA.
--
-- Guarda o planejamento estratégico (formato BMAD) que a agência produz
-- para cada cliente, em JSON estruturado por seção (ver src/lib/planejamento/schema.ts).
-- Suporta múltiplas versões por cliente ao longo do tempo; o cliente só
-- enxerga a versão com status = 'publicado' — nunca rascunho ou arquivado.
--
-- Policies seguem o padrão mais recente do projeto: EXISTS contra
-- user_roles (mesmo padrão de client_profile_changes/notifications, já
-- aplicado) com auth.uid() envolvido em (select ...) para InitPlan
-- (otimização de performance recomendada pelo Supabase advisor).

-- ============================================================
-- 1. Tabela
-- ============================================================
CREATE TABLE IF NOT EXISTS portal_client_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  periodo_label text,
  versao integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado', 'arquivado')),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  published_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT portal_client_plans_content_max CHECK (pg_column_size(content) < 2097152) -- 2MB
);

COMMENT ON TABLE portal_client_plans IS
  'Planejamento estratégico (BMAD) por cliente. content = JSON estruturado por seção.';
COMMENT ON COLUMN portal_client_plans.content IS
  'Estrutura definida em src/lib/planejamento/schema.ts (PlanContent). Todas as seções são opcionais.';
COMMENT ON COLUMN portal_client_plans.status IS
  'rascunho = só master vê; publicado = cliente vê; arquivado = histórico, só master vê.';

CREATE INDEX IF NOT EXISTS idx_portal_client_plans_client_id ON portal_client_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_client_plans_client_status ON portal_client_plans(client_id, status);

-- ============================================================
-- 2. Trigger de updated_at (reaproveita padrão já usado no projeto)
-- ============================================================
CREATE OR REPLACE FUNCTION set_portal_client_plans_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_portal_client_plans_updated_at ON portal_client_plans;
CREATE TRIGGER trg_portal_client_plans_updated_at
  BEFORE UPDATE ON portal_client_plans
  FOR EACH ROW EXECUTE FUNCTION set_portal_client_plans_updated_at();

-- ============================================================
-- 3. RLS
-- ============================================================
ALTER TABLE portal_client_plans ENABLE ROW LEVEL SECURITY;

-- Master vê tudo; cliente/admin do tenant só veem o que está publicado.
DROP POLICY IF EXISTS "portal_client_plans_select" ON portal_client_plans;
CREATE POLICY "portal_client_plans_select" ON portal_client_plans FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
    OR (
      status = 'publicado'
      AND client_id IN (
        SELECT client_id FROM portal_client_users WHERE user_id = (select auth.uid())
      )
    )
  );

-- Só master cria/edita/publica/arquiva/apaga planejamentos.
DROP POLICY IF EXISTS "portal_client_plans_insert" ON portal_client_plans;
CREATE POLICY "portal_client_plans_insert" ON portal_client_plans FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
  );

DROP POLICY IF EXISTS "portal_client_plans_update" ON portal_client_plans;
CREATE POLICY "portal_client_plans_update" ON portal_client_plans FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
  );

DROP POLICY IF EXISTS "portal_client_plans_delete" ON portal_client_plans;
CREATE POLICY "portal_client_plans_delete" ON portal_client_plans FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
  );
