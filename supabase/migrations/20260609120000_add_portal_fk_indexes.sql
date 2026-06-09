-- Índices de cobertura para foreign keys sem índice nas tabelas do portal.
-- Origem: Supabase performance advisor (unindexed_foreign_keys).
-- Melhora JOINs e evita lock-scans em DELETE/UPDATE na tabela pai.
-- Especialmente portal_client_users.client_id, usado na subquery de RLS
-- de portal_clients.
--
-- Tabelas pequenas → CREATE INDEX comum é instantâneo e seguro.

CREATE INDEX IF NOT EXISTS idx_client_invites_created_by
  ON public.client_invites (created_by);

CREATE INDEX IF NOT EXISTS idx_client_onboarding_invites_created_by
  ON public.client_onboarding_invites (created_by);

CREATE INDEX IF NOT EXISTS idx_client_onboarding_invites_created_portal_client_id
  ON public.client_onboarding_invites (created_portal_client_id);

CREATE INDEX IF NOT EXISTS idx_client_profile_changes_reviewed_by
  ON public.client_profile_changes (reviewed_by);

CREATE INDEX IF NOT EXISTS idx_clients_user_id
  ON public.clients (user_id);

CREATE INDEX IF NOT EXISTS idx_portal_client_users_client_id
  ON public.portal_client_users (client_id);
