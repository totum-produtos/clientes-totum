# Decisão de Schema — `portal_clients` vs `totum-system.clients`

**Issue:** totum-produtos/clientes-totum#1
**Status:** Análise concluída — decisão de unificação pendente de aprovação humana
**Última atualização:** 2026-09-10

---

## 1. Contexto

A issue #1 apontava risco de divergência entre tabelas que representam "cliente da Totum":

- `clientes-totum.portal_clients` — usada pelo portal (esta repo)
- `clientes-totum.clients` — criada por migration, **nunca usada pelo código**
- `totum-system` — tabela de clientes do lado da agência (CRM)

## 2. Investigação (2026-09-10)

### 2.1 Tabela órfã `clients` + `client_users` — RESOLVIDA

Já foi removida antes desta análise:

- Migration `supabase/migrations/20260815000001_drop_orphaned_clients_tables.sql`
- `DROP TABLE clients` + `DROP TABLE client_users` (CASCADE)
- Aprovado por Israel Lemos (Rael) via Telegram em 2026-08-15
- Verificação: **zero** ocorrências de `.from('clients')` / `.from('client_users')` em `src/`

> Os dois primeiros checkboxes da issue ("verificar se `clients` tem dados",
> "decidir se removemos `clients`") estão **concluídos**: a tabela foi removida.

### 2.2 O que `totum-system` usa

- Tabela `clients` (baseline `00000000000000_baseline_totum_system.sql`, linha 764).
- Shape de CRM da agência: `organization_id, name, email, phone, document,
  address, city, state, zip_code, client_type_id, partner_id, responsible_id,
  status, segment, instagram, website, additional_info, ...`
- Patch de produção `20260804_add_clients_additional_info.sql` opera sobre
  `public.clients` no projeto Supabase do totum-system.

### 2.3 `clientes-totum.portal_clients`

- Definida em `supabase/migrations/20260504000006_portal_views.sql`.
- Shape de **portal**: isolamento por `portal_client_id`, `profile_data`
  (briefing), pastas de drive, planos, etc.
- É a fonte de verdade do portal e está coberta por RLS.

## 3. Análise

`portal_clients` e `totum-system.clients` **não são duplicatas triviais** — têm
propósitos e shapes diferentes (portal-facing vs CRM da agência) e vivem em
bancos distintos. O risco real não é "duas tabelas iguais", e sim **falta de um
vínculo canônico** entre o registro de CRM e o registro de portal.

## 4. Opções (reavaliadas)

| # | Opção | Esforço | Risco | Observação |
|---|-------|---------|-------|-----------|
| 1 | Unificar em tabela única compartilhada | Alto | Médio/Alto | Exige migrar dados + reescrever FKs em 2 repos + revisar toda RLS. No-Fly Zone. |
| 2 | Manter separadas + vínculo por chave estável (ex: `portal_clients.crm_client_id` → `totum-system.clients.id`) e sync event-driven | Médio | Baixo/Médio | Alinhado ao `SINCRONIZACAO_TAREFAS.md` (event-driven, sem batch atrasado). |
| 3 | Manter separadas, aceitar divergência | Zero | Alto (longo prazo) | Só documentar. |

## 5. Recomendação

**Opção 2.** Manter as duas tabelas (papéis distintos) e criar um vínculo
canônico + sincronização event-driven, seguindo o mesmo princípio já adotado
para `tarefas` (`SINCRONIZACAO_TAREFAS.md`): tempo real por trigger/webhook,
nunca batch atrasado.

Passos propostos (todos requerem aprovação humana — No-Fly Zone: schema/RLS):

1. Adicionar coluna `crm_client_id uuid` em `portal_clients` (FK lógica para
   `totum-system.clients.id`), nullable no início.
2. Backfill do vínculo para clientes existentes.
3. Trigger/webhook de sync de campos compartilhados (nome, email, status).
4. RLS: manter isolamento por `portal_client_id`; `crm_client_id` nunca exposto
   ao role `cliente`.

## 6. Situação da issue

- [x] Verificar qual tabela o `totum-system` usa → `clients` (CRM).
- [x] Verificar se a tabela `clients` (não `portal_clients`) tem dados → tabela
      **removida** em 2026-08-15 (migration `20260815000001`).
- [ ] Decidir unificação vs vínculo+sync → **pendente de aprovação** (recomendação: Opção 2).

> A parte destrutiva/executável (migrations de schema, FKs, RLS) **não** foi
> executada por esta sessão por ser No-Fly Zone. Aguarda decisão humana.
