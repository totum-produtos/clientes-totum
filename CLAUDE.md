# CLAUDE.md — Central do Cliente Totum

**Versão:** 1.0
**Criado:** 2026-05-10
**Nível:** [ ] LP/Site  [ ] MVP  [ ] Teste  [x] Produção
**Sistema:** Vibe Coding Totum v3.0

---

## PERGUNTA-GATILHO (obrigatória antes de qualquer implementação)

> **Este é um projeto de PRODUÇÃO multi-tenant.**  
> Toda mudança em auth, RLS ou dados de cliente requer aprovação humana.  
> Toda feature nova passa por: Revisão Pré-Produção → Raio-X → Teste → Deploy

---

## CONTEXTO DO PROJETO

**Nome:** Central do Cliente Totum  
**Descrição curta:** Portal SaaS multi-tenant onde clientes da agência Totum acessam seu painel: calendário de postagens, arquivos, contrato, drive, campanhas e feed.  
**Repositório:** https://github.com/grupototum/clientes-totum  
**Produção:** https://cliente-totum.vercel.app  
**Supabase:** `cgpkfhrqprqptvehatad` (East US)  
**Problema que resolve:** Clientes da Totum precisam de um portal centralizado para acompanhar o trabalho da agência em tempo real.  
**Usuário principal:** Clientes da agência Totum (role: `cliente`), admins da agência (role: `admin`/`master`).

---

## STACK

| Camada | Tecnologia |
|---|---|
| Frontend / Framework | Next.js 15 (App Router) + TypeScript |
| UI Components | shadcn/ui (Radix UI + Tailwind CSS) |
| Backend / BaaS | Supabase |
| Autenticação | Supabase Auth + MFA |
| Banco de dados | PostgreSQL via Supabase (com RLS) |
| Storage | Supabase Storage (arquivos dos clientes) |
| Cookies | cookies-next |
| Analytics | @vercel/analytics |
| Deploy | Vercel (produção) |
| Docker | docker-compose.yml (Hostinger — planejado) |

---

## ESTRUTURA DE PASTAS

```
src/
├── app/                   [rotas Next.js App Router]
│   ├── api/               [API routes]
│   ├── app/               [área logada do cliente]
│   │   ├── calendario/
│   │   ├── central-conteudo/
│   │   ├── meu-cadastro/
│   │   ├── perfil/
│   │   ├── gestao-clientes/
│   │   ├── admin/
│   │   ├── campanhas/
│   │   ├── feed-postagens/
│   │   ├── contrato/
│   │   ├── notificacoes/
│   │   ├── arquivos/
│   │   ├── drive/
│   │   └── configuracoes/
│   ├── auth/              [login, signup, recovery]
│   └── legal/             [termos, privacidade]
├── components/            [componentes reutilizáveis]
└── lib/                   [helpers de auth e Supabase]

supabase/migrations/       [schema e migrations]
```

---

## COMANDOS ÚTEIS

```bash
npm run dev       # desenvolvimento local (Next.js)
npm run build     # build de produção
npm run start     # servidor de produção local
npm run lint      # verificar lint (Next.js ESLint)
```

---

## VARIÁVEIS DE AMBIENTE

```bash
# Obrigatórias
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=         # ⚠️ NUNCA expor no frontend

# Opcionais
NEXT_PUBLIC_THEME=theme-totum
NEXT_PUBLIC_PRODUCTNAME=Totum

# Fase 2 (comentadas por enquanto)
# UPIXEL_API_URL, GOOGLE_DRIVE_CLIENT_ID, etc.
```

> `.env*` está no `.gitignore`. Nunca commitar valores reais.

---

## ARQUITETURA DE PERMISSÕES (3 roles)

| Role | Acesso |
|---|---|
| `master` | Todos os clientes, rotas `/admin` e `/gestao-clientes`, todas as tabelas |
| `admin` | Apenas o seu cliente + convidar usuários |
| `cliente` | Apenas dados do seu próprio cliente |

- Isolamento via RLS usando `portal_client_id`
- Documentação completa: `PERMISSOES_ACESSO.md`

---

## MÓDULOS IMPLEMENTADOS

| Módulo | Status | Rota |
|---|---|---|
| Auth + MFA | ✅ Produção | `/auth/` |
| Início / Dashboard | ✅ Produção | `/app/` |
| Calendário de Postagens | ✅ Produção | `/app/calendario/` |
| Feed Postagens (Círculo Dourado) | ✅ Produção | `/app/feed-postagens/` |
| Contrato / Tarefas | ✅ Produção | `/app/contrato/` |
| Campanhas | ✅ Produção | `/app/campanhas/` |
| Arquivos (Supabase Storage) | ✅ Produção | `/app/arquivos/` |
| Drive (Google Drive iframe) | ✅ Produção | `/app/drive/` |
| Gestão de Clientes | ✅ Produção | `/app/gestao-clientes/` |
| Admin (CRUD clientes) | ✅ Produção | `/app/admin/` |
| Central de Conteúdo | 🔄 Em desenvolvimento | `/app/central-conteudo/` |
| Integrações Fase 2 | ⏳ Planejado | — |

---

## SINCRONIZAÇÃO COM TOTUM-OS

- **Estratégia:** Event-driven via Supabase Trigger/Realtime
- **Tabela compartilhada:** `tarefas` (mesma tabela entre `totum-system` e `clientes-totum`)
- **Isolamento:** RLS via `portal_client_id`
- **Regra:** NUNCA sincronizar via cron job atrasado
- Documentação: `SINCRONIZACAO_TAREFAS.md`

---

## PADRÕES DE CÓDIGO

- TypeScript em todo o projeto
- Componentes: PascalCase (`ClientCard.tsx`)
- Funções e hooks: camelCase (`useClientData`)
- Arquivos de rota: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- Cookies de sessão via `cookies-next` (não usar `localStorage` para auth)
- `NEXT_PUBLIC_*` somente para variáveis seguras para o browser

---

## REGRAS DE COMPORTAMENTO

Antes de qualquer mudança:
1. Explique o plano em 2-3 linhas
2. Liste os arquivos que serão afetados
3. Aguarde confirmação se a mudança for em área sensível
4. Implemente uma mudança por prompt
5. Liste como testar ao final
6. Sugira o commit

---

## NO-FLY ZONES — NÃO ALTERAR SEM APROVAÇÃO HUMANA

```
[x] Autenticação: src/app/auth/, lib/supabase, middleware.ts, MFA config
[x] RLS policies: supabase/migrations/ (qualquer ALTER POLICY ou CREATE POLICY)
[x] Roles de permissão: portal_client_id, master/admin/cliente lógica
[x] SUPABASE_SERVICE_ROLE_KEY: nunca no frontend, nunca em git
[x] Sincronização de tarefas: trigger Supabase (SINCRONIZACAO_TAREFAS.md)
[x] Deploy em produção: Vercel CI/CD
[x] Tabela de clientes: DELETE ou TRUNCATE sem aprovação
```

---

## SAÚDE TÉCNICA (Fase 0 — 2026-05-10)

| Verificação | Status | Detalhe |
|---|---|---|
| Build | ⚠️ não testado | node_modules ausente no sandbox |
| Lint | ⚠️ não testado | `next` não encontrado (deps não instaladas) |
| .env protegido | ✅ OK | `.env*` no `.gitignore`, `.env.example` sem segredos |
| Segredos expostos | ✅ OK | nenhum encontrado nos arquivos versionados |
| Documentação | ✅ Bem documentada | README, PERMISSOES, RLS_AUDIT, SINCRONIZACAO |

> Rodar `npm install && npm run build && npm run lint` localmente para verificar.

---

## DOCUMENTAÇÃO DO PROJETO

| Arquivo | Conteúdo |
|---|---|
| `README.md` | Setup, stack, status, estrutura |
| `PERMISSOES_ACESSO.md` | Roles, RLS, middleware, matriz de acesso |
| `SINCRONIZACAO_TAREFAS.md` | Sync event-driven com totum-system |
| `RLS_AUDIT.md` | Auditoria das políticas RLS |
| `PHASE2_INTEGRATION_PLAN.md` | Integrações Fase 2 (Meta Ads, Google, Upixel) |

---

## SKILLS E FERRAMENTAS

| Situação | Usar |
|---|---|
| Revisão antes de deploy | `skill-revisao-pre-producao.md` |
| Auditoria de limpeza | `skill-raio-x.md` |
| Debug de bug difícil | `skill-debug-profundo.md` |
| Antes de commitar | `skill-revisor-commit.md` |
| Criar componente React/Next | `skill-criador-componente.md` |
| Revisar segurança/RLS | `skill-review-segurança.md` |

> Skills em: `VIBE CODING TOTUM SYSTEM/Skills para IAs/`

---

## REGRAS QUE NUNCA MUDAM (Totum Torah)

1. Sempre perguntar: **LP/Site | MVP | Teste | Produção?**
2. **Uma mudança por prompt**
3. **Testar antes de commitar**
4. **Documentar antes de mexer**
5. **IA sugere. Humano aprova** (em No-Fly Zones)
6. **Preservar o que funciona**
7. Prioridade: **Confiabilidade → Velocidade → Performance**

---

*CLAUDE.md v1.0 — Central do Cliente Totum — Sistema Vibe Coding Totum — 2026-05-10*

## Arquitetura de Camadas — DAL (Data Access Layer)

**Adicionado em:** refactor/camadas-clientes-totum

### Regra fundamental
Pages, components, hooks e API routes **não chamam `.from()`, `.storage.from()` ou `.rpc()` diretamente**.
Toda query Supabase passa por uma função em `src/services/db/`.

### Módulos DAL

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/services/db/admin.ts` | `client_profile_changes`, `system_logs` |
| `src/services/db/bio.ts` | `bio_profiles`, `bio_links`, `bio_products`, `bio_leads`, `bio_click_events` |
| `src/services/db/briefing.ts` | `portal_clients.profile_data` (briefing flow) |
| `src/services/db/calendar.ts` | `wanda_posts` |
| `src/services/db/clients.ts` | `portal_clients`, `portal_client_users` |
| `src/services/db/content.ts` | `ad_campaigns`, `tarefas`, `projetos`, `rag_documents` |
| `src/services/db/files.ts` | Storage buckets: `client_files`, `bio_assets`, `avatars` |
| `src/services/db/notifications.ts` | `notifications` |
| `src/services/db/onboarding.ts` | `client_invites`, `client_onboarding_invites` |
| `src/services/db/plans.ts` | `planejamentos` |
| `src/services/db/users.ts` | `user_roles`, `profiles` |

### Padrão de função

```ts
// Thin wrapper — sem lógica extra, sem error handling próprio
export function nomeDescritivo(supabase: SupabaseClient, ...params: T) {
  return supabase.from('tabela').select(...).eq(...)
}
```

- Recebe `SupabaseClient` como 1º parâmetro (não cria o cliente)
- Retorna o query builder (PromiseLike, compatível com `persistOrThrow`)
- Ao adicionar queries: crie a função no módulo correto, importe no consumidor

### Camadas intocáveis

- `src/middleware.ts` — auth de rotas
- `src/lib/rate-limit.ts` — rate limiting
- `src/lib/supabase/` — clientes Supabase (camada de conexão)

---

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
