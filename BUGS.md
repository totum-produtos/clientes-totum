# BUGS.md — Central do Cliente Totum

**Atualizado:** 2026-05-10
**Sistema:** Vibe Coding Totum v3.0
**Revisão:** skill-revisao-pre-producao.md (6 categorias)

---

## LEGENDA

| Símbolo | Prioridade |
|---|---|
| 🔴 | Crítico — resolver antes de qualquer deploy |
| 🟡 | Alto — resolver nesta sprint |
| 🟢 | Médio — backlog |
| ⚪ | Baixo — quando tiver tempo |

---

## BUGS ATIVOS

*(nenhum bug crítico registrado em 2026-05-10)*

---

## REVISÃO PRÉ-PRODUÇÃO — 6 CATEGORIAS (2026-05-10)

### CATEGORIA 1 — CÓDIGO MORTO / RAIO-X

| Severidade | Arquivo | Problema |
|---|---|---|
| 🟡 | `src/lib/mocks/index.ts` | Arquivo de mock com dados hardcoded (postsAgendados, kpis, dadosGrafico, campanhasAtivas). **Não está importado em nenhum arquivo do projeto.** Código morto completo. |
| ✅ | `console.log` | Apenas 1 ocorrência encontrada — removida nesta sessão (`MFAVerification.tsx` linha 34) |

---

### CATEGORIA 2 — DUPLICAÇÃO (DRY)

| Severidade | Local | Problema | Solução |
|---|---|---|---|
| ✅ | `LegalDocument.tsx` / `LegalDocuments.tsx` | Nomes similares mas responsabilidades distintas: um renderiza markdown, outro é nav list | Sem ação necessária — nomes apenas |
| ✅ | `Toast.tsx` / `ToastProvider.tsx` | Separação correta: Provider = contexto, Toast = componente UI | — |
| 🟢 | `GlobalContext.tsx` (153 linhas) | Carrega user + posts + tarefas + projetos num único contexto. Menor que upixelcrm mas pode crescer | Monitorar — separar se crescer acima de 300 linhas |

---

### CATEGORIA 3 — PERFORMANCE

| Severidade | Arquivo | Problema | Solução |
|---|---|---|---|
| 🟡 | `GlobalContext.tsx` | Uma mudança em posts re-renderiza componentes que só usam user/profile | Separar em `UserContext` + `ContentContext` quando projeto crescer |
| 🟢 | 62 `useEffect` no projeto | Moderado para Next.js App Router — monitorar crescimento | — |
| ✅ | `exhaustive-deps` | Nenhum warning de deps ausentes encontrado | — |

---

### CATEGORIA 4 — TRATAMENTO DE ERROS

| Severidade | Situação | Observação |
|---|---|---|
| ✅ | `GlobalContext.tsx` | `try/catch` presente no `loadData()` — erros do Supabase capturados |
| ✅ | 29 `try/catch` no projeto | Cobertura razoável para o tamanho |
| 🟡 | Sem `ErrorBoundary` React | Nenhum ErrorBoundary encontrado — adicionar ao menos no root (`src/app/layout.tsx`) |
| ✅ | `console.log` de debug | Removido de `MFAVerification.tsx` nesta sessão |

---

### CATEGORIA 5 — SEPARAÇÃO DE RESPONSABILIDADES

| Severidade | Arquivo | Linhas | Problema |
|---|---|---|---|
| 🟡 | `gestao-clientes/page.tsx` | 705 | UI + lógica de listagem + CRUD + permissões |
| 🟡 | `central-conteudo/page.tsx` | 655 | UI + busca Supabase + filtros + paginação |
| 🟢 | `admin/clientes/[id]/page.tsx` | 612 | Edição inline + upload + validação tudo junto |
| 🟢 | `admin/clientes/novo/page.tsx` | 505 | Criação com múltiplos steps embutidos |
| ✅ | `AppLayout.tsx` | 236 | Razoável para um layout completo |

---

### CATEGORIA 6 — TYPESCRIPT

| Severidade | Problema | Qtd | Local |
|---|---|---|---|
| 🟡 | `as any` em área crítica | 2 | `GlobalContext.tsx` linhas 90-91 — cast de `portal_clients` join |
| 🟢 | `any` explícito total | ~36 | Espalhado — muito menos que upixelcrm (404) |
| ✅ | strict mode | — | Ativo no tsconfig.json |

**Correção sugerida para GlobalContext.tsx:**
```typescript
// Criar tipo para o join
type PortalClientUser = {
  client_id: string;
  portal_clients: {
    id: string; nome: string; slug: string;
    email_responsavel: string; status: string;
  };
};
// Substituir (clientData as any).portal_clients por (clientData as PortalClientUser).portal_clients
```

---

### CATEGORIA 7 — NEXT.JS ESPECÍFICO

| Severidade | Problema | Qtd | Arquivos |
|---|---|---|---|
| 🟢 | `<img>` sem `<Image />` do Next.js | 5 | `perfil/page.tsx`, `admin/clientes/novo`, `admin/clientes/[id]`, `AppLayout.tsx` (×2) |
| ✅ | `images.unoptimized: true` no next.config | — | Mitiga o impacto das `<img>` diretas — corrigir quando remover unoptimized |
| ✅ | `typescript.ignoreBuildErrors: false` | — | Erros TS param o build — boa configuração |
| ✅ | `eslint.ignoreDuringBuilds: true` | — | Lint não bloqueia build — avaliar se deve mudar em produção |

---

## DÍVIDA TÉCNICA — LINT (130 ocorrências)

> `npx next lint` — 2026-05-10 — **~108 errors + ~22 warnings**

| Categoria | Regra | Qtd aprox. | Prioridade |
|---|---|---|---|
| Tipos `any` explícitos | `@typescript-eslint/no-explicit-any` | ~105 | ⚪ Baixo |
| `<img>` sem otimização | `@next/next/no-img-element` | ~22 | 🟢 Médio |
| Outros errors TypeScript | `@typescript-eslint/*` | ~3 | 🟢 Médio |

---

## CORREÇÕES EXECUTADAS NESTA SESSÃO (2026-05-10)

| Arquivo | Correção | Tipo |
|---|---|---|
| `src/components/MFAVerification.tsx` | Removido `console.log('totpFactors:', totpFactors)` linha 34 | `chore` |

---

## HISTÓRICO RESOLVIDO

| Data | Bug | Solução |
|---|---|---|
| 2026-05-10 | console.log de debug em MFAVerification | Removido |

---

*BUGS.md — Central do Cliente Totum — Sistema Vibe Coding Totum v3.0*
