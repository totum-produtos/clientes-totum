SELECT 'clients (Totum-OS)' as tabela, COUNT(*) as total FROM clients UNION ALL
SELECT 'tarefas', COUNT(*) FROM tarefas UNION ALL
SELECT 'subtarefas', COUNT(*) FROM subtarefas UNION ALL
SELECT 'projetos', COUNT(*) FROM projetos UNION ALL
SELECT 'wanda_posts', COUNT(*) FROM wanda_posts UNION ALL
SELECT 'content_pipeline', COUNT(*) FROM content_pipeline UNION ALL
SELECT 'portal_clients', COUNT(*) FROM portal_clients UNION ALL
SELECT 'portal_client_users', COUNT(*) FROM portal_client_users UNION ALL
SELECT 'user_approvals', COUNT(*) FROM user_approvals;
