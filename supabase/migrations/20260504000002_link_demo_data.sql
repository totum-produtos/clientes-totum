-- Migration: Vincula dados existentes ao cliente demo
-- Data: 2026-05-04
-- Depende de: 20260504000001_initial_schema.sql
-- Descrição: Atualiza registros legados sem portal_client_id para o cliente demo

UPDATE wanda_posts SET portal_client_id = (SELECT id FROM portal_clients WHERE slug = 'cliente-demo')
WHERE portal_client_id IS NULL;

UPDATE tarefas SET portal_client_id = (SELECT id FROM portal_clients WHERE slug = 'cliente-demo')
WHERE portal_client_id IS NULL;

UPDATE projetos SET portal_client_id = (SELECT id FROM portal_clients WHERE slug = 'cliente-demo')
WHERE portal_client_id IS NULL;
