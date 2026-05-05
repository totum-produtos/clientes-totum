-- Parte 1: Estrutura (sem updates)
ALTER TABLE wanda_posts ADD COLUMN IF NOT EXISTS portal_client_id uuid REFERENCES portal_clients(id) ON DELETE SET NULL;
ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS portal_client_id uuid REFERENCES portal_clients(id) ON DELETE SET NULL;
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS portal_client_id uuid REFERENCES portal_clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_wanda_posts_portal_client ON wanda_posts(portal_client_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_portal_client ON tarefas(portal_client_id);
CREATE INDEX IF NOT EXISTS idx_projetos_portal_client ON projetos(portal_client_id);
