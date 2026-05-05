-- Adicionar vínculo portal_client_id em wanda_posts
ALTER TABLE wanda_posts ADD COLUMN IF NOT EXISTS portal_client_id uuid REFERENCES portal_clients(id) ON DELETE SET NULL;

-- Adicionar vínculo portal_client_id em tarefas
ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS portal_client_id uuid REFERENCES portal_clients(id) ON DELETE SET NULL;

-- Adicionar vínculo portal_client_id em projetos
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS portal_client_id uuid REFERENCES portal_clients(id) ON DELETE SET NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_wanda_posts_portal_client ON wanda_posts(portal_client_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_portal_client ON tarefas(portal_client_id);
CREATE INDEX IF NOT EXISTS idx_projetos_portal_client ON projetos(portal_client_id);

-- Vincular posts existentes ao cliente demo (cliente-demo)
UPDATE wanda_posts SET portal_client_id = (SELECT id FROM portal_clients WHERE slug = 'cliente-demo')
WHERE portal_client_id IS NULL;

-- Vincular tarefas existentes ao cliente demo
UPDATE tarefas SET portal_client_id = (SELECT id FROM portal_clients WHERE slug = 'cliente-demo')
WHERE portal_client_id IS NULL;

-- Vincular projetos existentes ao cliente demo
UPDATE projetos SET portal_client_id = (SELECT id FROM portal_clients WHERE slug = 'cliente-demo')
WHERE portal_client_id IS NULL;

-- RLS policies para wanda_posts (permitir SELECT se vinculado ao cliente do usuário)
ALTER TABLE wanda_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "portal_wanda_posts_view" ON wanda_posts;
CREATE POLICY "portal_wanda_posts_view" ON wanda_posts FOR SELECT
  USING (portal_client_id IS NULL OR portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

-- RLS policies para tarefas
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "portal_tarefas_view" ON tarefas;
CREATE POLICY "portal_tarefas_view" ON tarefas FOR SELECT
  USING (portal_client_id IS NULL OR portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));

-- RLS policies para projetos
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "portal_projetos_view" ON projetos;
CREATE POLICY "portal_projetos_view" ON projetos FOR SELECT
  USING (portal_client_id IS NULL OR portal_client_id IN (
    SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
  ));
