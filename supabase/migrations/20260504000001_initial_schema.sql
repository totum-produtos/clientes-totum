-- Migration: Adiciona portal_client_id nas tabelas existentes do Totum OS
-- Data: 2026-05-04
-- Depende de: 20260504000006_portal_views.sql (tabelas portal_clients devem existir)
-- Descrição: Adiciona FK portal_client_id em wanda_posts, tarefas e projetos + índices

ALTER TABLE wanda_posts ADD COLUMN IF NOT EXISTS portal_client_id uuid REFERENCES portal_clients(id) ON DELETE SET NULL;
ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS portal_client_id uuid REFERENCES portal_clients(id) ON DELETE SET NULL;
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS portal_client_id uuid REFERENCES portal_clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_wanda_posts_portal_client ON wanda_posts(portal_client_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_portal_client ON tarefas(portal_client_id);
CREATE INDEX IF NOT EXISTS idx_projetos_portal_client ON projetos(portal_client_id);
