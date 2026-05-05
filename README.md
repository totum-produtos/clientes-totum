# Central do Cliente Totum

Portal multi-tenant onde clientes da Totum acessam o painel deles:
calendário de postagens, arquivos, contrato, drive, campanhas.

## Stack
- Next.js 15 (App Router) + TypeScript
- Supabase Auth + RLS
- Tailwind CSS + shadcn/ui
- Hospedagem: Vercel (produção) + Docker/Hostinger (planejado)

## Setup local

```bash
git clone https://github.com/grupototum/clientes-totum
cd clientes-totum
npm install
cp .env.example .env.local
# preencha .env.local com credenciais Supabase
npm run dev
```

Acesse http://localhost:3000

## Estrutura
- `src/app/` — Rotas (App Router)
- `src/components/` — Componentes shadcn/ui + custom
- `src/lib/` — Helpers de auth e Supabase
- `supabase/migrations/` — Schema do banco

## Status
- ✅ Auth com email/senha + MFA (Supabase)
- ✅ Multi-tenant com RLS (tenant isolation via `portal_client_id`)
- ✅ Aba Início com dados reais
- ✅ Aba Calendário com CRUD (dados reais do Totum OS)
- ✅ Aba Feed de Postagens com tipos Círculo Dourado (`Porquê`/`O que`/`Como`)
- ✅ Aba Contrato com dados reais (tarefas)
- ✅ Aba Campanhas com dados reais (wanda_posts)
- ✅ Aba Arquivos com Supabase Storage (upload/download real)
- ✅ Aba Drive com Google Drive iframe (link por URL)
- ✅ Gestão de Clientes (grid/list, filtros por setor, modais de detalhe)
- ✅ Admin com CRUD de clientes e vinculação de usuários

## Arquitetura de Dados

### Permissões (Master / Admin / Cliente)
Documentação completa: [`PERMISSOES_ACESSO.md`](PERMISSOES_ACESSO.md)

| Role | Acesso |
|------|--------|
| `master` | Todos os clientes, todas as tabelas, rotas `/admin` e `/gestao-clientes` |
| `admin` | Apenas o seu cliente + pode convidar usuários |
| `cliente` | Apenas os dados do seu cliente |

### Sincronização de Tarefas
Documentação completa: [`SINCRONIZACAO_TAREFAS.md`](SINCRONIZACAO_TAREFAS.md)

- **Event-driven**: Trigger/Realtime no momento do INSERT/UPDATE
- **Sem atrasos**: Nunca sincronizar tarefas atrasadas via job cron
- **Uma tabela única**: `tarefas` compartilhada entre `totum-system` e `clientes-totum`
- **RLS isola**: Cada cliente vê apenas suas tarefas via `portal_client_id`

## Documentação Técnica

| Documento | Descrição |
|-----------|-----------|
| [`PERMISSOES_ACESSO.md`](PERMISSOES_ACESSO.md) | Arquitetura de roles, RLS, middleware, matriz de acesso |
| [`SINCRONIZACAO_TAREFAS.md`](SINCRONIZACAO_TAREFAS.md) | Estratégia de sync event-driven com totum-system |
| [`RLS_AUDIT.md`](RLS_AUDIT.md) | Auditoria completa das políticas RLS |
| [`PHASE2_INTEGRATION_PLAN.md`](PHASE2_INTEGRATION_PLAN.md) | Plano de integração Fase 2 (Meta Ads, Google Ads, Upixel) |

## Ambientes
- Produção: https://cliente-totum.vercel.app
- Supabase Project: `cgpkfhrqprqptvehatad` (East US)
