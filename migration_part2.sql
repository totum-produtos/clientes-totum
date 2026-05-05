-- Parte 2: Vincular dados existentes ao cliente demo
UPDATE wanda_posts SET portal_client_id = (SELECT id FROM portal_clients WHERE slug = 'cliente-demo')
WHERE portal_client_id IS NULL;

UPDATE tarefas SET portal_client_id = (SELECT id FROM portal_clients WHERE slug = 'cliente-demo')
WHERE portal_client_id IS NULL;

UPDATE projetos SET portal_client_id = (SELECT id FROM portal_clients WHERE slug = 'cliente-demo')
WHERE portal_client_id IS NULL;
