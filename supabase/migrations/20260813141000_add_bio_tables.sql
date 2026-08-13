-- Migration: Cria tabelas do Link na Bio pública (bio_*)
-- Data: 2026-08-13
-- Depende de: 20260504000006_portal_views.sql, 20260506092013_add_approvals_and_notifications.sql
--
-- ⚠️ NO-FLY ZONE (RLS) — NÃO APLICAR SEM APROVAÇÃO HUMANA.
--
-- Modelo de dados da página pública /bio/[slug] (MVP: identidade + links +
-- vitrine de produtos + captura de lead + tracking de cliques).
--
-- Acesso público (anon) NÃO tem NENHUMA policy nas tabelas abaixo —
-- deny-by-default. A leitura pública e a escrita de leads/eventos
-- acontecem exclusivamente via API routes server-side com
-- PRIVATE_SUPABASE_SERVICE_KEY (mesmo precedente de
-- 20260602120000_add_client_onboarding_invites.sql). Isso é intencional:
-- portal_clients guarda tokens OAuth em texto puro, então a leitura
-- pública nunca pode passar por uma policy de anon em tabela nenhuma
-- relacionada — o helper server-only seleciona colunas explícitas.

-- ============================================================
-- 1. bio_profiles — configuração/identidade da bio de um cliente
-- ============================================================
CREATE TABLE IF NOT EXISTS bio_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL UNIQUE REFERENCES portal_clients(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT false,
  display_name text NOT NULL,
  headline text,
  avatar_url text,
  logo_url text,
  cor_primaria text,
  cor_secundaria text,
  cor_fundo text,
  tema jsonb NOT NULL DEFAULT '{}'::jsonb,
  lead_capture_enabled boolean NOT NULL DEFAULT true,
  lead_capture_titulo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE bio_profiles IS 'Configuração da página pública /bio/[slug] (slug vem de portal_clients.slug).';
COMMENT ON COLUMN bio_profiles.is_active IS 'Só é servida publicamente (getPublicBio) quando true.';
COMMENT ON COLUMN bio_profiles.tema IS 'Extras visuais livres, evita migration para cada novo ajuste de estilo.';

CREATE INDEX IF NOT EXISTS idx_bio_profiles_client_id ON bio_profiles(client_id);

-- ============================================================
-- 2. bio_links — botões/links da bio
-- ============================================================
CREATE TABLE IF NOT EXISTS bio_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bio_id uuid NOT NULL REFERENCES bio_profiles(id) ON DELETE CASCADE,
  label text NOT NULL,
  url text NOT NULL,
  icone text,
  ordem integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bio_links_bio_id ON bio_links(bio_id, ordem);

-- ============================================================
-- 3. bio_products — vitrine de produtos
-- ============================================================
CREATE TABLE IF NOT EXISTS bio_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bio_id uuid NOT NULL REFERENCES bio_profiles(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  preco_label text,
  image_url text,
  cta_label text,
  cta_url text,
  ordem integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bio_products_bio_id ON bio_products(bio_id, ordem);

-- ============================================================
-- 4. bio_leads — captura de nome/whatsapp/email pela bio pública
-- ============================================================
CREATE TABLE IF NOT EXISTS bio_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  nome text NOT NULL,
  whatsapp text,
  email text,
  source_product_id uuid REFERENCES bio_products(id) ON DELETE SET NULL,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bio_leads_contato CHECK (whatsapp IS NOT NULL OR email IS NOT NULL)
);

COMMENT ON TABLE bio_leads IS 'Só inserido via /api/bio/lead com service role. Nenhuma policy de INSERT.';

CREATE INDEX IF NOT EXISTS idx_bio_leads_client_created ON bio_leads(client_id, created_at DESC);

-- ============================================================
-- 5. bio_click_events — tracking de cliques/page views
-- ============================================================
CREATE TABLE IF NOT EXISTS bio_click_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('page_view', 'link', 'product', 'lead_submit')),
  target_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE bio_click_events IS 'Só inserido via /api/bio/track e /api/bio/lead com service role. Nenhuma policy de INSERT.';

CREATE INDEX IF NOT EXISTS idx_bio_click_events_client_created ON bio_click_events(client_id, created_at DESC);

-- ============================================================
-- 6. Trigger de updated_at em bio_profiles
-- ============================================================
CREATE OR REPLACE FUNCTION set_bio_profiles_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bio_profiles_updated_at ON bio_profiles;
CREATE TRIGGER trg_bio_profiles_updated_at
  BEFORE UPDATE ON bio_profiles
  FOR EACH ROW EXECUTE FUNCTION set_bio_profiles_updated_at();

-- ============================================================
-- 7. RLS — deny-by-default para anon em todas as 5 tabelas
-- ============================================================
ALTER TABLE bio_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_click_events ENABLE ROW LEVEL SECURITY;

-- ---- bio_profiles: master vê/edita tudo; membro do cliente só vê o próprio ----
DROP POLICY IF EXISTS "bio_profiles_select" ON bio_profiles;
CREATE POLICY "bio_profiles_select" ON bio_profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
    OR client_id IN (SELECT client_id FROM portal_client_users WHERE user_id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "bio_profiles_insert" ON bio_profiles;
CREATE POLICY "bio_profiles_insert" ON bio_profiles FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
  );

DROP POLICY IF EXISTS "bio_profiles_update" ON bio_profiles;
CREATE POLICY "bio_profiles_update" ON bio_profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
  );

DROP POLICY IF EXISTS "bio_profiles_delete" ON bio_profiles;
CREATE POLICY "bio_profiles_delete" ON bio_profiles FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
  );

-- ---- bio_links: leitura master + membro do cliente dono da bio; escrita master-only ----
DROP POLICY IF EXISTS "bio_links_select" ON bio_links;
CREATE POLICY "bio_links_select" ON bio_links FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
    OR bio_id IN (
      SELECT bp.id FROM bio_profiles bp
      WHERE bp.client_id IN (SELECT client_id FROM portal_client_users WHERE user_id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "bio_links_insert" ON bio_links;
CREATE POLICY "bio_links_insert" ON bio_links FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
  );

DROP POLICY IF EXISTS "bio_links_update" ON bio_links;
CREATE POLICY "bio_links_update" ON bio_links FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
  );

DROP POLICY IF EXISTS "bio_links_delete" ON bio_links;
CREATE POLICY "bio_links_delete" ON bio_links FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
  );

-- ---- bio_products: mesmo padrão de bio_links ----
DROP POLICY IF EXISTS "bio_products_select" ON bio_products;
CREATE POLICY "bio_products_select" ON bio_products FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
    OR bio_id IN (
      SELECT bp.id FROM bio_profiles bp
      WHERE bp.client_id IN (SELECT client_id FROM portal_client_users WHERE user_id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "bio_products_insert" ON bio_products;
CREATE POLICY "bio_products_insert" ON bio_products FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
  );

DROP POLICY IF EXISTS "bio_products_update" ON bio_products;
CREATE POLICY "bio_products_update" ON bio_products FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
  );

DROP POLICY IF EXISTS "bio_products_delete" ON bio_products;
CREATE POLICY "bio_products_delete" ON bio_products FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
  );

-- ---- bio_leads: leitura master + membro do cliente; SEM policy de INSERT (só service role); delete master-only ----
DROP POLICY IF EXISTS "bio_leads_select" ON bio_leads;
CREATE POLICY "bio_leads_select" ON bio_leads FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
    OR client_id IN (SELECT client_id FROM portal_client_users WHERE user_id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "bio_leads_delete" ON bio_leads;
CREATE POLICY "bio_leads_delete" ON bio_leads FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
  );

-- ---- bio_click_events: leitura master + membro do cliente; SEM policy de INSERT (só service role); delete master-only ----
DROP POLICY IF EXISTS "bio_click_events_select" ON bio_click_events;
CREATE POLICY "bio_click_events_select" ON bio_click_events FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
    OR client_id IN (SELECT client_id FROM portal_client_users WHERE user_id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "bio_click_events_delete" ON bio_click_events;
CREATE POLICY "bio_click_events_delete" ON bio_click_events FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
  );

-- ============================================================
-- Nota sobre o bucket de Storage `bio_assets`
-- ============================================================
-- CREATE BUCKET não roda em migration SQL — precisa ser criado
-- manualmente no Supabase Dashboard/CLI como bucket PÚBLICO, path
-- de objeto <client_id>/<arquivo>. Policies de storage (aplicar junto
-- deste mesmo gate humano):
--
--   CREATE POLICY "bio_assets_public_read" ON storage.objects FOR SELECT
--     USING (bucket_id = 'bio_assets');
--
--   CREATE POLICY "bio_assets_master_write" ON storage.objects FOR INSERT
--     WITH CHECK (
--       bucket_id = 'bio_assets'
--       AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
--     );
--
--   CREATE POLICY "bio_assets_master_update" ON storage.objects FOR UPDATE
--     USING (
--       bucket_id = 'bio_assets'
--       AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
--     );
--
--   CREATE POLICY "bio_assets_master_delete" ON storage.objects FOR DELETE
--     USING (
--       bucket_id = 'bio_assets'
--       AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'master')
--     );
