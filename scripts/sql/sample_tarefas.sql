-- Tarefas (5 primeiras)
SELECT id, titulo, status, prioridade, data_limite, departamento, projeto_id, tipo 
FROM tarefas 
ORDER BY created_at DESC 
LIMIT 5;
