# TODO.md — Central do Cliente Totum

**Atualizado:** 2026-05-13
**Sistema:** Vibe Coding Totum v3.0
**Base:** Revisão Pré-Produção 6 categorias (ver BUGS.md)

---

## 🔴 CRÍTICO — Antes do próximo deploy

- [ ] **[SECURITY]** Rotacionar Supabase service role key exposta em worktree local `.claude/`
  - `.claude/` foi adicionada ao `.gitignore` para não aparecer como untracked
  - Chave e senhas de teste hardcoded foram removidas dos scripts auxiliares
  - Rotacionar no Supabase e atualizar ambientes Vercel/VPS/n8n que dependam dela

---

## 🟡 ALTO — Esta sprint

- [ ] **[CAT-1 MORTO]** Remover ou arquivar `src/lib/mocks/index.ts`
  - Arquivo não importado em nenhum lugar — código morto completo
  - Verificar se era usado para testes antes de deletar

- [ ] **[CAT-4 ERROS]** Adicionar `ErrorBoundary` no root da aplicação
  - Arquivo: `src/app/layout.tsx`
  - Criar `src/components/ErrorBoundary.tsx` com fallback de erro amigável

- [ ] **[CAT-5 SRP]** Refatorar `gestao-clientes/page.tsx` (705 linhas)
  - Extrair: `useGestaoClientes` hook com lógica Supabase
  - Extrair: `<ClienteCard />`, `<ClienteFilters />` como componentes
  - A página deve ser declarativa: só composição de componentes

- [ ] **[CAT-5 SRP]** Refatorar `central-conteudo/page.tsx` (655 linhas)
  - Extrair: `useCentralConteudo` hook
  - Extrair: `<ConteudoFiltros />`, `<ConteudoGrid />`

- [ ] **[CAT-6 TS]** Tipar `portal_clients` join no `GlobalContext.tsx`
  - Remover `(clientData as any).portal_clients` linhas 90-91
  - Criar tipo `PortalClientUser` com estrutura correta do join

---

## 🟢 MÉDIO — Backlog

- [ ] **[CAT-7 NEXT]** Substituir `<img>` por `<Image />` do Next.js
  - 5 ocorrências: `perfil/page.tsx`, `admin/clientes/novo`, `admin/clientes/[id]`, `AppLayout.tsx` (×2)
  - Remover `unoptimized: true` do next.config após migração
  - Atenção: imagens dinâmicas (avatar_url) precisam de domínio configurado no next.config

- [ ] **[CAT-5 SRP]** Refatorar `admin/clientes/[id]/page.tsx` (612 linhas)
  - Extrair: edição inline, upload de imagem, lógica de permissões

- [ ] **[CAT-6 TS]** Tipar gradualmente os ~36 `any` restantes
  - Prioridade: GlobalContext, depois páginas de admin

- [ ] **[CAT-3 PERF]** Separar GlobalContext quando projeto crescer
  - Criar `UserContext` e `ContentContext` separados
  - Trigger: quando GlobalContext passar de 300 linhas

---

## ⚪ BAIXO — Quando tiver tempo

- [ ] Avaliar `eslint.ignoreDuringBuilds: true` no next.config
  - Considerar ativar para catch de erros no CI/CD

- [ ] **[LINT]** Tipar os ~105 `any` explícitos
  - Começar pelos mais críticos (contextos e auth)

---

## ✅ CONCLUÍDO NESTA SESSÃO (2026-05-10)

- [x] CLAUDE.md criado v1.0 (Vibe Coding Totum v3.0)
- [x] KIMI.md criado v1.0
- [x] BUGS.md criado com revisão pré-produção completa (6 categorias)
- [x] `console.log` de debug removido de `MFAVerification.tsx`
- [x] `.claude/` adicionada ao `.gitignore` para esconder worktrees locais com envs/artefatos
- [x] Service role e senhas hardcoded removidas de scripts auxiliares

---

## COMANDOS RÁPIDOS

```bash
# Lint
npx next lint

# Build
npm run build

# Ver arquivos maiores
find src -name "*.tsx" | xargs wc -l | sort -n | tail -10
```

---

*TODO.md — Central do Cliente Totum — Vibe Coding Totum v3.0 — 2026-05-10*
