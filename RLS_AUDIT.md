# RLS Audit — 2026-05-04

## Execução
 Auditoria realizada via análise de código das migrations em `supabase/migrations/` e `migration*.sql` na raiz.
 Não foi possível executar testes SQL interativos (sem acesso direto ao SQL Editor do Supabase nesta sessão),
 mas todas as policies foram revisadas linha a linha.

## Tabelas e Policies

| Tabela | Policy | Operação | Status | Correção aplicada |
|--------|--------|----------|--------|-------------------|
| `portal_clients` | `portal_client_self_view` | SELECT | ✅ Isolada por `portal_client_users.user_id = auth.uid()` | — |
| `portal_clients` | *(nenhuma)* | INSERT | ❌ **FALTAVA** | Criada `portal_client_admin_insert`¹ |
| `portal_clients` | *(nenhuma)* | UPDATE | ❌ **FALTAVA** | Criada `portal_client_admin_update`¹ |
| `portal_clients` | *(nenhuma)* | DELETE | ❌ **FALTAVA** | Criada `portal_client_admin_delete`¹ |
| `portal_client_users` | `portal_client_users_self_view` | SELECT | ✅ Isolada por `user_id = auth.uid()` | — |
| `portal_client_users` | *(nenhuma)* | INSERT | ❌ **FALTAVA** | Criada `portal_client_users_admin_insert`¹ |
| `portal_client_users` | *(nenhuma)* | DELETE | ❌ **FALTAVA** | Criada `portal_client_users_admin_delete`¹ |
| `wanda_posts` | `portal_wanda_posts_view` | SELECT | ✅ Isolada por `portal_client_id IN (...)` | — |
| `wanda_posts` | *(nenhuma)* | INSERT | ❌ **FALTAVA** | Criada `portal_wanda_posts_insert` |
| `wanda_posts` | *(nenhuma)* | UPDATE | ❌ **FALTAVA** | Criada `portal_wanda_posts_update` |
| `wanda_posts` | *(nenhuma)* | DELETE | ❌ **FALTAVA** | Criada `portal_wanda_posts_delete` |
| `tarefas` | `portal_tarefas_view` | SELECT | ✅ Isolada por `portal_client_id IN (...)` | — |
| `tarefas` | *(nenhuma)* | INSERT | ❌ **FALTAVA** | Criada `portal_tarefas_insert` |
| `tarefas` | *(nenhuma)* | UPDATE | ❌ **FALTAVA** | Criada `portal_tarefas_update` |
| `tarefas` | *(nenhuma)* | DELETE | ❌ **FALTAVA** | Criada `portal_tarefas_delete` |
| `projetos` | `portal_projetos_view` | SELECT | ✅ Isolada por `portal_client_id IN (...)` | — |
| `projetos` | *(nenhuma)* | INSERT | ❌ **FALTAVA** | Criada `portal_projetos_insert` |
| `projetos` | *(nenhuma)* | UPDATE | ❌ **FALTAVA** | Criada `portal_projetos_update` |
| `projetos` | *(nenhuma)* | DELETE | ❌ **FALTAVA** | Criada `portal_projetos_delete` |

> ¹ Admin: nesta Fase 1, policies de INSERT/UPDATE/DELETE em `portal_clients` e `portal_client_users`
> usam `auth.uid() IS NOT NULL` como proxy de "usuário autenticado", pois o schema atual não tem
> flag de admin. **Isso é temporário** — ver issue #2 para decisão sobre controle de acesso admin.

## Problemas críticos encontrados

### 1. Tabelas duplicadas: `clients` vs `portal_clients`
 `migration_clients.sql` criou `clients` + `client_users`, mas TODO o código-fonte do portal
 (`src/app/app/admin/page.tsx`, `src/lib/context/GlobalContext.tsx`) usa `portal_clients` + `portal_client_users`.

 **Risco:** schema divergente, foreign keys inconsistentes, dados podem ser inseridos na tabela errada.
 **Ação:** Documentado em comentário de migration + issue #2. A tabela `clients` não deve ser usada
 até decisão de unificação.

### 2. `portal_client_id IS NULL` nas policies SELECT
 As policies `portal_wanda_posts_view`, `portal_tarefas_view` e `portal_projetos_view` usam:
 ```sql
 USING (portal_client_id IS NULL OR portal_client_id IN (...))
 ```
 Isso permite que registros **não vinculados a nenhum cliente** sejam visíveis para **todos os usuários**.

 **Risco:** em produção, se alguém criar um registro sem `portal_client_id`, qualquer usuário logado vê.
 **Ação:** Na migration de correção, as policies SELECT foram atualizadas para remover a cláusula
 `IS NULL`, garantindo isolamento estrito por tenant.

## Como reproduzir os testes

```sql
-- 1. Criar cliente teste
INSERT INTO portal_clients (nome, slug, email_responsavel)
VALUES ('Teste RLS', 'teste-rls', 'teste@rls.com');

-- 2. Criar usuário no Supabase Auth (Dashboard > Authentication)
-- 3. Vincular usuário ao cliente
INSERT INTO portal_client_users (user_id, client_id, role)
VALUES ('<UUID_DO_USER>', '<UUID_DO_CLIENTE>', 'cliente');

-- 4. Logar como usuário e testar SELECT (deve retornar só o cliente vinculado)
SELECT * FROM portal_clients;
SELECT * FROM wanda_posts WHERE portal_client_id = '<UUID_DO_CLIENTE>';

-- 5. Testar INSERT (deve funcionar se usuário estiver vinculado ao client_id)
INSERT INTO wanda_posts (subject, tipo, published_at, portal_client_id)
VALUES ('Post Teste', 'viral', now(), '<UUID_DO_CLIENTE>');

-- 6. Tentar INSERT em client_id diferente (deve falhar — RLS)
INSERT INTO wanda_posts (subject, tipo, published_at, portal_client_id)
VALUES ('Post Invasão', 'viral', now(), '<OUTRO_CLIENT_ID>');
-- Esperado: 0 rows (RLS bloqueia)
```

## Recomendação
 Antes de aceitar o PR, execute os passos 1-6 acima no SQL Editor do Supabase com um usuário de teste
 para confirmar isolamento.
