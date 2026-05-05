ALTER TABLE tarefas DISABLE TRIGGER update_tarefas_updated_at;
ALTER TABLE projetos DISABLE TRIGGER update_projetos_updated_at;

UPDATE tarefas SET portal_client_id = (SELECT id FROM portal_clients WHERE slug = 'cliente-demo')
WHERE portal_client_id IS NULL;

UPDATE projetos SET portal_client_id = (SELECT id FROM portal_clients WHERE slug = 'cliente-demo')
WHERE portal_client_id IS NULL;

ALTER TABLE tarefas ENABLE TRIGGER update_tarefas_updated_at;
ALTER TABLE projetos ENABLE TRIGGER update_projetos_updated_at;
