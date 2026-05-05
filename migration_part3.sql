-- Parte 3: RLS policies
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
