-- Hardening: revoga EXECUTE em funções SECURITY DEFINER que NÃO
-- deveriam ser invocáveis diretamente via /rest/v1/rpc/...
--
-- Triggers (handle_new_user, assign_admin_on_signup, sync_user_roles)
-- continuam funcionando porque triggers rodam como DEFINER independente
-- de quem tem EXECUTE. O REVOKE só fecha a porta da RPC direta.
--
-- Helpers de RLS (has_role, is_master_user, get_user_client_id) ficam
-- disponíveis para `authenticated` porque são chamados dentro de
-- policies pelo próprio Postgres (e por código autenticado).
--
-- rls_auto_enable é event trigger: não precisa de EXECUTE em nenhum
-- role para funcionar.

-- 1. Triggers — fechar RPC totalmente
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.assign_admin_on_signup() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.sync_user_roles() FROM anon, authenticated, public;

-- 2. Event trigger
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, public;

-- 3. Helpers de RLS — fechar para anon, manter para authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_master_user() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_user_client_id() FROM anon, public;

-- 4. Função de admin do portal — fechar para anon
REVOKE EXECUTE ON FUNCTION public.get_clientes_com_stats() FROM anon, public;

-- Comentário documentando o hardening
COMMENT ON FUNCTION public.has_role IS 'RLS helper. Não chamar via RPC; uso interno em policies.';
COMMENT ON FUNCTION public.is_master_user IS 'RLS helper. Não chamar via RPC; uso interno em policies.';
COMMENT ON FUNCTION public.get_user_client_id IS 'RLS helper. Não chamar via RPC; uso interno em policies.';
COMMENT ON FUNCTION public.get_clientes_com_stats IS 'Admin only. Chame com sessão autenticada de master/admin.';
