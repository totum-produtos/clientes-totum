-- Migration: Unificação de schema — clients/portal_clients + vinculação upixelcrm
-- Data: 2026-05-04
-- Depende de: 20260504000006_portal_views.sql
-- Descrição:
--   1. Marca tabelas clients/client_users como DEPRECATED (não usadas pelo portal)
--   2. Adiciona colunas de integração em portal_clients para upixelcrm e APIs externas
--   3. Cria tabela ad_campaigns_cache para campanhas sincronizadas (Meta/Google Ads)

-- ============================================================
-- 1. Tabelas DEPRECATED (não removidas por segurança, mas documentadas)
-- ============================================================
-- ⚠️ ATENÇÃO: As tabelas abaixo NÃO são usadas pelo portal clientes-totum.
--    O portal usa exclusivamente portal_clients + portal_client_users.
--    Estas tabelas foram mantidas para evitar quebra caso outro sistema
--    as utilize. Ver issue #1 para decisão de remoção futura.
--
--    Tabelas deprecated:
--      - clients
--      - client_users

-- ============================================================
-- 2. Adicionar campos de integração em portal_clients
-- ============================================================
ALTER TABLE portal_clients
  ADD COLUMN IF NOT EXISTS upixel_tenant_id uuid,
  ADD COLUMN IF NOT EXISTS meta_ad_account_id text,
  ADD COLUMN IF NOT EXISTS meta_access_token text,
  ADD COLUMN IF NOT EXISTS meta_token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS google_customer_id text,
  ADD COLUMN IF NOT EXISTS google_developer_token text,
  ADD COLUMN IF NOT EXISTS google_refresh_token text;

-- ============================================================
-- 3. Criar tabela de cache de campanhas (Meta/Google Ads)
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  portal_client_id uuid REFERENCES portal_clients(id) ON DELETE CASCADE,
  platform text not null CHECK (platform IN ('meta', 'google')),
  external_id text not null,
  name text not null,
  status text default 'active',
  objective text,
  budget_daily numeric(12,2),
  spend numeric(12,2) default 0,
  impressions integer default 0,
  clicks integer default 0,
  reach integer default 0,
  cpc numeric(10,4) default 0,
  ctr numeric(10,4) default 0,
  cpm numeric(10,4) default 0,
  conversions integer default 0,
  leads_count integer default 0,
  cost_per_lead numeric(10,4) default 0,
  revenue numeric(12,2) default 0,
  roi numeric(10,4) default 0,
  date_since date,
  date_until date,
  synced_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  UNIQUE(portal_client_id, platform, external_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_client ON ad_campaigns(portal_client_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_platform ON ad_campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_synced ON ad_campaigns(synced_at);

-- RLS
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ad_campaigns_client_view" ON ad_campaigns;
CREATE POLICY "ad_campaigns_client_view" ON ad_campaigns FOR SELECT
  USING (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "ad_campaigns_client_insert" ON ad_campaigns;
CREATE POLICY "ad_campaigns_client_insert" ON ad_campaigns FOR INSERT
  WITH CHECK (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "ad_campaigns_client_update" ON ad_campaigns;
CREATE POLICY "ad_campaigns_client_update" ON ad_campaigns FOR UPDATE
  USING (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ))
  WITH CHECK (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "ad_campaigns_client_delete" ON ad_campaigns;
CREATE POLICY "ad_campaigns_client_delete" ON ad_campaigns FOR DELETE
  USING (portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));
