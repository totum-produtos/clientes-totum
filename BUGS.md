# BUGS.md — Central do Cliente Totum

**Atualizado:** 2026-05-10
**Sistema:** Vibe Coding Totum v3.0

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

## DÍVIDA TÉCNICA — LINT (130 ocorrências)

> `npx next lint` — 2026-05-10 — **~108 errors + ~22 warnings**

### Categorias

| Categoria | Regra | Qtd aprox. | Prioridade |
|---|---|---|---|
| Tipos `any` explícitos | `@typescript-eslint/no-explicit-any` | ~105 | ⚪ Baixo |
| `<img>` sem otimização | `@next/next/no-img-element` | ~22 | 🟢 Médio |
| Outros errors TypeScript | `@typescript-eslint/*` | ~3 | 🟢 Médio |

### Arquivos com mais ocorrências
- `src/lib/context/GlobalContext.tsx`
- `src/lib/notifications.ts`
- `src/components/calendar/PostModal.tsx`
- `src/components/calendar/BulkPostModal.tsx`
- `src/components/MFASetup.tsx`

### Estratégia de resolução

1. **`<img>` → `<Image />`** (~22 ocorrências) — substituir por `next/image` para melhorar LCP
2. **`any` explícito** (~105) — tipar gradualmente, módulo por módulo
3. Usar `skill-refatorador-dry.md` para identificar interfaces reutilizáveis entre componentes

### Comando rápido
```bash
npx next lint
```

---

## HISTÓRICO RESOLVIDO

| Data | Bug | Solução |
|---|---|---|
| — | — | — |

---

*BUGS.md — Central do Cliente Totum — Sistema Vibe Coding Totum v3.0*
