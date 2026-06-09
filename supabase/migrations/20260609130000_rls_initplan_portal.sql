-- ⚠️ DRAFT — NÃO APLICAR SEM APROVAÇÃO HUMANA (No-Fly Zone: RLS).
--
-- Otimização auth_rls_initplan (Supabase performance advisor):
-- envolve auth.uid() em (select auth.uid()) para que o planner avalie a
-- função UMA vez (InitPlan) em vez de por linha. A lógica das policies é
-- preservada byte-a-byte — apenas a forma da chamada muda.
--
-- Escopo: tabelas-núcleo do portal clientes-totum. As demais tabelas
-- sinalizadas pertencem a outros sistemas no mesmo banco e ficam de fora.
--
-- Reversível: reaplicar as policies com auth.uid() sem o select.

-- ───────────────── portal_clients ─────────────────
ALTER POLICY portal_clients_select ON public.portal_clients
  USING (
    (EXISTS (SELECT 1 FROM user_roles
             WHERE user_roles.user_id = (select auth.uid())
               AND (user_roles.role)::text = 'master'::text))
    OR (id IN (SELECT portal_client_users.client_id FROM portal_client_users
               WHERE portal_client_users.user_id = (select auth.uid())))
  );

ALTER POLICY portal_client_self_view ON public.portal_clients
  USING (
    id IN (SELECT portal_client_users.client_id FROM portal_client_users
           WHERE portal_client_users.user_id = (select auth.uid()))
  );

ALTER POLICY portal_clients_update ON public.portal_clients
  USING (
    (EXISTS (SELECT 1 FROM user_roles
             WHERE user_roles.user_id = (select auth.uid())
               AND (user_roles.role)::text = 'master'::text))
    OR (id IN (SELECT portal_client_users.client_id FROM portal_client_users
               WHERE portal_client_users.user_id = (select auth.uid())))
  );

ALTER POLICY portal_clients_insert ON public.portal_clients
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles
            WHERE user_roles.user_id = (select auth.uid())
              AND (user_roles.role)::text = 'master'::text)
  );

ALTER POLICY portal_clients_delete ON public.portal_clients
  USING (
    EXISTS (SELECT 1 FROM user_roles
            WHERE user_roles.user_id = (select auth.uid())
              AND (user_roles.role)::text = 'master'::text)
  );

-- ───────────────── portal_client_users ─────────────────
ALTER POLICY portal_client_users_select ON public.portal_client_users
  USING (
    (EXISTS (SELECT 1 FROM user_roles
             WHERE user_roles.user_id = (select auth.uid())
               AND (user_roles.role)::text = 'master'::text))
    OR (user_id = (select auth.uid()))
  );

ALTER POLICY portal_client_users_self_view ON public.portal_client_users
  USING (user_id = (select auth.uid()));

ALTER POLICY portal_client_users_insert ON public.portal_client_users
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles
            WHERE user_roles.user_id = (select auth.uid())
              AND (user_roles.role)::text = 'master'::text)
  );

ALTER POLICY portal_client_users_update ON public.portal_client_users
  USING (
    EXISTS (SELECT 1 FROM user_roles
            WHERE user_roles.user_id = (select auth.uid())
              AND (user_roles.role)::text = 'master'::text)
  );

ALTER POLICY portal_client_users_delete ON public.portal_client_users
  USING (
    EXISTS (SELECT 1 FROM user_roles
            WHERE user_roles.user_id = (select auth.uid())
              AND (user_roles.role)::text = 'master'::text)
  );

-- ───────────────── client_profile_changes ─────────────────
ALTER POLICY client_profile_changes_select_client ON public.client_profile_changes
  USING (requested_by = (select auth.uid()));

ALTER POLICY client_profile_changes_select_master ON public.client_profile_changes
  USING (
    (EXISTS (SELECT 1 FROM user_roles
             WHERE user_roles.user_id = (select auth.uid())
               AND user_roles.role = 'master'::app_role))
    OR (requested_by = (select auth.uid()))
  );

ALTER POLICY client_profile_changes_insert ON public.client_profile_changes
  WITH CHECK (requested_by = (select auth.uid()));

ALTER POLICY client_profile_changes_update_master ON public.client_profile_changes
  USING (
    (EXISTS (SELECT 1 FROM user_roles
             WHERE user_roles.user_id = (select auth.uid())
               AND user_roles.role = 'master'::app_role))
    OR (requested_by = (select auth.uid()))
  );

ALTER POLICY client_profile_changes_delete_master ON public.client_profile_changes
  USING (
    (EXISTS (SELECT 1 FROM user_roles
             WHERE user_roles.user_id = (select auth.uid())
               AND user_roles.role = 'master'::app_role))
    OR (requested_by = (select auth.uid()))
  );
