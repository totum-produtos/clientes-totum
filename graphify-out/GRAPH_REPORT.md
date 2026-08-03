# Graph Report - clientes-totum  (2026-07-31)

## Corpus Check
- 185 files · ~155,026 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 581 nodes · 948 edges · 40 communities (30 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e1c869ae`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useGlobal
- dependencies
- types.ts
- cliente-form-constants.ts
- CLAUDE.md — Central do Cliente Totum
- createSPASassClient
- devDependencies
- calendario/page.tsx
- compilerOptions
- meu-cadastro/page.tsx
- alert-dialog.tsx
- components.json
- finalizar/route.ts
- mocks/index.ts
- supabase/middleware.ts
- invite/route.ts
- send-invite/route.ts
- cors.ts
- eslint.config.mjs
- setup-users.js
- fix-passwords.js
- fix-setup.js
- complete/route.ts
- [token]/route.ts
- legal/layout.tsx
- Toast.tsx
- persist.guard.test.ts
- next.config.ts
- postcss.config.mjs
- tailwind.config.ts
- ToastProvider.tsx

## God Nodes (most connected - your core abstractions)
1. `createSPASassClient()` - 49 edges
2. `useGlobal()` - 31 edges
3. `CLAUDE.md — Central do Cliente Totum` - 18 edges
4. `persistOrThrow()` - 17 edges
5. `LoadingSpinner()` - 16 edges
6. `compilerOptions` - 16 edges
7. `createSSRClient()` - 12 edges
8. `SassClient` - 12 edges
9. `cn()` - 12 edges
10. `useToast()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `LegalPage()` --references--> `react`  [EXTRACTED]
  src/app/legal/[document]/page.tsx → package.json
- `AppLayout()` --indirect_call--> `Home()`  [INFERRED]
  src/components/AppLayout.tsx → src/app/page.tsx
- `DELETE()` --calls--> `createSSRClient()`  [EXTRACTED]
  src/app/api/admin/clientes/deletar/route.ts → src/lib/supabase/server.ts
- `POST()` --calls--> `createSSRClient()`  [EXTRACTED]
  src/app/api/admin/onboarding/criar-convite/route.ts → src/lib/supabase/server.ts
- `GET()` --calls--> `createSSRClient()`  [EXTRACTED]
  src/app/api/admin/usuarios/route.ts → src/lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (40 total, 10 thin omitted)

### Community 0 - "useGlobal"
Cohesion: 0.07
Nodes (51): Arquivo, ArquivosPage(), typeIcons, CalendarioContent(), AdCampaign, CampanhasPage(), Post, CentralConteudoPage() (+43 more)

### Community 1 - "dependencies"
Cohesion: 0.04
Nodes (47): class-variance-authority, clsx, cookies-next, date-fns, lucide-react, next, @next/third-parties, nodemailer (+39 more)

### Community 2 - "types.ts"
Cohesion: 0.07
Nodes (28): AdminClient, Body, ensureClientLink(), findAuthUserByEmail(), POST(), Body, gerarSenhaTemporaria(), gerarSlug() (+20 more)

### Community 3 - "cliente-form-constants.ts"
Cohesion: 0.09
Nodes (36): EditarClientePage(), NovoClientePage(), FinishResult, InviteInfo, OnboardingPage(), STEP_INTROS, ClienteFormSteps(), isFilled() (+28 more)

### Community 4 - "CLAUDE.md — Central do Cliente Totum"
Cohesion: 0.11
Nodes (18): ARQUITETURA DE PERMISSÕES (3 roles), CLAUDE.md — Central do Cliente Totum, COMANDOS ÚTEIS, CONTEXTO DO PROJETO, DOCUMENTAÇÃO DO PROJETO, ESTRUTURA DE PASTAS, graphify, MÓDULOS IMPLEMENTADOS (+10 more)

### Community 5 - "createSPASassClient"
Cohesion: 0.05
Nodes (39): ClientePendencia, TwoFactorAuthPage(), ConviteContent(), errorMessage(), InviteData, ForgotPasswordPage(), LoginPage(), MagicLinkPage() (+31 more)

### Community 6 - "devDependencies"
Cohesion: 0.06
Nodes (33): eslint, eslint-config-next, @eslint/eslintrc, devDependencies, eslint, eslint-config-next, @eslint/eslintrc, postcss (+25 more)

### Community 7 - "calendario/page.tsx"
Cohesion: 0.12
Nodes (16): Post, BulkPost, BulkPostModal(), BulkPostModalProps, tipos, CalendarEvent, CalendarGrid(), Props (+8 more)

### Community 8 - "compilerOptions"
Cohesion: 0.07
Nodes (29): .claude, clientes-totum, dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules (+21 more)

### Community 9 - "meu-cadastro/page.tsx"
Cohesion: 0.07
Nodes (26): applyProfileChange(), AuthUser, JsonObject, parseProfileValue(), PortalClient, PortalUser, ProfileChange, ALL_COLUMN_FIELDS (+18 more)

### Community 10 - "alert-dialog.tsx"
Cohesion: 0.11
Nodes (20): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+12 more)

### Community 11 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "finalizar/route.ts"
Cohesion: 0.18
Nodes (13): Draft, enviarCredenciais(), gerarSenha(), gerarSlug(), POST(), PROFILE_KEYS, Body, POST() (+5 more)

### Community 13 - "mocks/index.ts"
Cohesion: 0.22
Nodes (8): arquivosCompartilhados, campanhasAtivas, contrato, dadosGrafico, driveItens, entregas, kpis, postsAgendados

### Community 14 - "supabase/middleware.ts"
Cohesion: 0.38
Nodes (4): IMPORTANT: You *must* return the supabaseResponse object as it is., updateSession(), config, middleware()

### Community 15 - "invite/route.ts"
Cohesion: 0.60
Nodes (5): createAdminClient(), GET(), InviteRow, POST(), validateInvite()

### Community 16 - "send-invite/route.ts"
Cohesion: 0.47
Nodes (5): errorMessage(), InviteInsert, isSupabaseAdminBearer(), POST(), ResendResponse

### Community 17 - "cors.ts"
Cohesion: 0.53
Nodes (4): ALLOWED_ORIGINS, corsHeaders, corsHeadersFor(), isAllowed()

### Community 18 - "eslint.config.mjs"
Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 19 - "setup-users.js"
Cohesion: 0.50
Nodes (4): { createClient }, findUserByEmail(), setup(), supabase

### Community 39 - "ToastProvider.tsx"
Cohesion: 0.20
Nodes (8): metadata, icons, styles, Toast, ToastContext, ToastContextType, ToastProvider(), ToastType

## Knowledge Gaps
- **245 isolated node(s):** `PERGUNTA-GATILHO (obrigatória antes de qualquer implementação)`, `CONTEXTO DO PROJETO`, `STACK`, `ESTRUTURA DE PASTAS`, `COMANDOS ÚTEIS` (+240 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._
- **What connects `PERGUNTA-GATILHO (obrigatória antes de qualquer implementação)`, `CONTEXTO DO PROJETO`, `STACK` to the rest of the system?**
  _245 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useGlobal` be split into smaller, more focused modules?**
  _Cohesion score 0.06862745098039216 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06938020351526364 - nodes in this community are weakly interconnected._
- **Should `cliente-form-constants.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08792270531400966 - nodes in this community are weakly interconnected._
- **Should `CLAUDE.md — Central do Cliente Totum` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._