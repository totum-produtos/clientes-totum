# Migrations do Portal de Clientes Totum

## Ordem de aplicação

As migrations devem ser aplicadas na ordem abaixo. Cada migration é idempotente
(`IF NOT EXISTS`, `DROP POLICY IF EXISTS`), então pode ser reaplicada com segurança.

| Ordem | Arquivo | Descrição |
|-------|---------|-----------|
| 1 | `20250107210416_MFA.sql` | Configuração de MFA (template base) |
| 2 | `20250130165844_example_storage.sql` | Storage example (template base) |
| 3 | `20250130181110_storage_policies.sql` | Policies de storage (template base) |
| 4 | `20250130181641_todo_list.sql` | Todo list (template base) |
| 5 | `20260504000006_portal_views.sql` | **Cria tabelas principais do portal** (`portal_clients`, `portal_client_users`) |
| 6 | `20260504000001_initial_schema.sql` | Adiciona `portal_client_id` em `wanda_posts`, `tarefas`, `projetos` |
| 7 | `20260504000002_link_demo_data.sql` | Vincula dados existentes ao cliente demo |
| 8 | `20260504000003_rls_policies.sql` | Policies SELECT iniciais (superseded pela 07) |
| 9 | `20260504000005_integrations.sql` | Policies SELECT consolidadas (superseded pela 07) |
| 10 | `20260504000004_clients_table.sql` | Tabela `clients` alternativa (⚠️ NÃO usada pelo portal atual) |
| 11 | `20260504000007_fix_rls_policies.sql` | **Correção completa de RLS** (INSERT/UPDATE/DELETE + remove IS NULL) |

## Como aplicar

### Opção A: Supabase SQL Editor (recomendado para produção)
1. Acesse o SQL Editor do projeto Supabase
2. Cole o conteúdo de cada migration na ordem acima
3. Execute uma por vez

### Opção B: Supabase CLI (local/dev)
```bash
supabase db push
```

## Dependências entre migrations

- `20260504000001_initial_schema.sql` depende de `20260504000006_portal_views.sql`
  (precisa que `portal_clients.id` exista para a FK)
- `20260504000002_link_demo_data.sql` depende de `20260504000001_initial_schema.sql`
  (precisa que a coluna `portal_client_id` exista)
- `20260504000007_fix_rls_policies.sql` depende de todas as anteriores
  (precisa que tabelas e policies iniciais existam)

## Atenção

- A migration `20260504000004_clients_table.sql` cria `clients` + `client_users`,
  mas o portal usa `portal_clients` + `portal_client_users`. Ver issue #2 sobre
  unificação de schema.
- As migrations 03 e 05 foram superseded pela 07. A 07 deve ser aplicada por último
  para garantir policies completas.
