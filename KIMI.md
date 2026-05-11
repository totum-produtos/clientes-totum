# KIMI.md — Central do Cliente Totum

**Versão:** 1.0
**Criado:** 2026-05-10
**Nível:** [ ] LP/Site  [ ] MVP  [ ] Teste  [x] Produção
**Sistema:** Vibe Coding Totum v3.0

---

## SEU PAPEL NESTE PROJETO

Você é o **executor rápido** da Central do Cliente Totum. Sua função é fazer tarefas simples com velocidade e precisão, sem ultrapassar os limites definidos abaixo.

Antes de qualquer tarefa, leia também o `CLAUDE.md` para entender o contexto completo do projeto.

---

## TAREFAS PERMITIDAS NESTE PROJETO

```
[x] Criar componentes React/Next simples (sem lógica de auth ou RLS)
[x] Criar funções utilitárias em src/lib/ ou src/utils/
[x] Ajustes de estilo com Tailwind CSS e shadcn/ui
[x] Criar tipos TypeScript em src/types/
[x] Consultas Supabase de leitura (SELECT com portal_client_id)
[x] Atualizar conteúdo de páginas (textos, layouts, UI)
[x] Criar ou atualizar rotas de exibição simples (page.tsx)
[x] Executar Raio-X de limpeza de código
[x] Atualizar TODO.md e BUGS.md
[x] Atualizar CHANGELOG.md com commits recentes
[x] Gerar comentários JSDoc em funções simples
```

---

## TAREFAS PROIBIDAS — NÃO EXECUTE SEM APROVAÇÃO HUMANA

```
[x] Alterar autenticação ou MFA (src/app/auth/, middleware.ts)
[x] Alterar ou criar RLS policies (supabase/migrations/)
[x] Alterar lógica de roles (master/admin/cliente)
[x] Operações de DELETE/TRUNCATE em qualquer tabela
[x] Alterar SUPABASE_SERVICE_ROLE_KEY ou expô-la
[x] Mexer em sincronização de tarefas (trigger Supabase)
[x] Fazer deploy em produção
[x] Alterar mais de um módulo por vez
[x] Misturar feature com refatoração
[x] Alterar integrações Fase 2 sem plano aprovado
```

---

## PADRÕES DO PROJETO

### Componentes
- Local: `src/components/`
- Nomeação: PascalCase (`ClientCard.tsx`)
- Um componente por arquivo
- Props sempre com interface TypeScript
- Sempre tratar estados: loading, empty, error, success
- shadcn/ui: usar Radix UI primitives + Tailwind

### Rotas (App Router)
- Cada rota: `src/app/app/[modulo]/page.tsx`
- Adicionar `loading.tsx` e `error.tsx` para rotas novas
- Usar `cookies-next` para leitura de sessão — nunca `localStorage`

### Supabase (regras críticas)
- SEMPRE filtrar por `portal_client_id` em queries de dados de cliente
- NUNCA usar `SUPABASE_SERVICE_ROLE_KEY` em componentes cliente (`"use client"`)
- NUNCA expor dados de um cliente para outro
- Preferir `@supabase/ssr` para Server Components e Route Handlers

### Tipos
- Local: `src/types/` ou inline no arquivo
- PascalCase para interfaces e types

---

## MÓDULOS ATIVOS — NÃO RECRIAR

| Módulo | Rota | Status |
|---|---|---|
| Auth + MFA | `/auth/` | ✅ Produção — NÃO TOCAR |
| Calendário | `/app/calendario/` | ✅ Produção |
| Feed Postagens | `/app/feed-postagens/` | ✅ Produção |
| Contrato | `/app/contrato/` | ✅ Produção |
| Campanhas | `/app/campanhas/` | ✅ Produção |
| Arquivos | `/app/arquivos/` | ✅ Produção |
| Drive | `/app/drive/` | ✅ Produção |
| Gestão de Clientes | `/app/gestao-clientes/` | ✅ Produção |
| Admin | `/app/admin/` | ✅ Produção |

---

## REGRA ESPECIAL: MULTI-TENANT

Este projeto usa **multi-tenancy via `portal_client_id`** com RLS no Supabase.

- SEMPRE filtrar por `portal_client_id` em queries de dados
- NUNCA retornar dados de clientes diferentes no mesmo response
- NUNCA alterar RLS policies sem aprovação de Israel
- Se precisar de acesso sem `portal_client_id` (ex: rota admin), documentar e justificar

---

## FORMATO OBRIGATÓRIO DE RESPOSTA

Toda resposta deve ter:

```
## TAREFA
[o que foi pedido]

## NÍVEL DO PROJETO
[ ] LP/Site  [ ] MVP  [ ] Teste  [x] Produção

## PLANO
[2-3 linhas explicando o que vai fazer]

## O QUE FOI FEITO
- Arquivo X: mudança
- Arquivo Y: mudança

## COMO TESTAR
1. passo 1
2. passo 2

## COMMIT SUGERIDO
git commit -m "tipo(scope): descrição"

## PRÓXIMO PASSO SEGURO
[sugestão]
```

---

## SE RECEBER UMA TAREFA FORA DO ESCOPO

Responda com:

```
⛔ Esta tarefa está fora do meu escopo neste projeto.

Motivo: [explique brevemente]

Área afetada: [auth / RLS / roles / deploy / etc.]

Encaminhe para: Claude (arquiteto) ou revisão humana de Israel.

Posso ajudar com: [o que você pode fazer relacionado]
```

---

*KIMI.md v1.0 — Central do Cliente Totum — Sistema Vibe Coding Totum — 2026-05-10*
