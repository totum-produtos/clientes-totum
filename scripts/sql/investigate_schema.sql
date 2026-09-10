-- Tabelas do totum-system
SELECT 'clients' as tabela, COUNT(*) as total FROM clients UNION ALL
SELECT 'contracts', COUNT(*) FROM contracts UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks UNION ALL
SELECT 'projects', COUNT(*) FROM projects UNION ALL
SELECT 'delivery_checklists', COUNT(*) FROM delivery_checklists UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles;
