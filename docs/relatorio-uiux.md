# Relatório Técnico UI/UX — Portal de Clientes Totum

> Data: 06/05/2026  
> Repositório: `grupototum/clientes-totum`  
> Branch analisada: `main` (commit `ac3ebbc`)

---

## 1. Tech Stack e Estilização

### Framework Principal
- **Next.js 15** (`next": "^15.4.8"`) com **App Router** (`src/app/`)
- **React 19** (`react": "^19.0.0"`)
- **TypeScript 5** com tipos do Supabase auto-gerados (`src/lib/types.ts`)

### Gerenciamento de CSS
- **Tailwind CSS v3** com configuração customizada (`tailwind.config.ts`)
- **Não há CSS-in-JS** (Styled Components, Emotion, etc.)
- Estilos globais em `src/app/globals.css`

### Design System — Airbnb-inspired (Rausch)
O projeto possui um **Design System próprio e bem estruturado**, definido em `tailwind.config.ts`:

| Token | Valor | Uso |
|-------|-------|-----|
| `rausch` | `#ff385c` | Cor primária (botões, links, destaques) |
| `rausch-active` | `#e00b41` | Hover/estado ativo da primária |
| `ink` | `#222222` | Texto principal |
| `body` | `#3f3f3f` | Texto secundário |
| `muted` / `muted-soft` | `#6a6a6a` / `#929292` | Texto terciário |
| `canvas` | `#ffffff` | Fundo principal |
| `surface-soft` / `surface-strong` | `#f7f7f7` / `#f2f2f2` | Fundos secundários |
| `hairline` / `hairline-soft` | `#dddddd` / `#ebebeb` | Bordas |
| `success` / `warning` / `danger` | Semânticos | Estados de feedback |
| `shadow-airbnb` | Custom | Sombra padrão de cards |

**Fonte:** Inter (via Google Fonts), com classes utilitárias como `font-cereal`, `text-display-lg`, `text-title-sm`, `text-body-sm`, `text-caption`.

### Componentes de UI
- **shadcn/ui base** em `src/components/ui/`: `card.tsx`, `button.tsx`, `input.tsx`, `textarea.tsx`, `dialog.tsx`, `alert-dialog.tsx`, `alert.tsx`, `Toast.tsx`
- **Componentes próprios:** `AppLayout.tsx`, `CalendarGrid.tsx`, `PostModal.tsx`, `BulkPostModal.tsx`, `NotificationBell.tsx`, `MFASetup.tsx`, `MFAVerification.tsx`, `SSOButtons.tsx`, `LegalDocuments.tsx`

**Observação:** O DS foi aplicado em ~43 arquivos, mas havia **dezenas de vazamentos de tokens Tailwind padrão** (`primary-600`, `green-500`, `gray-400`, `bg-danger-bg0`, `text-[rausch]`, etc.) que foram corrigidos no commit `ac3ebbc`.

---

## 2. Arquitetura de Navegação

### Rotas Principais (App Router)

| Rota | Papel | Visibilidade |
|------|-------|--------------|
| `/app` | Dashboard (stats, tarefas, contrato) | Cliente/Master |
| `/app/calendario` | Calendário de postagens | Cliente/Master |
| `/app/feed-postagens` | Feed de conteúdo | Cliente/Master |
| `/app/arquivos` | Arquivos do cliente | Cliente/Master |
| `/app/drive` | Totum Drive | Cliente/Master |
| `/app/meu-cadastro` → **Minhas Empresa** | Perfil da empresa | Cliente/Master |
| `/app/notificacoes` | Central de notificações | Todos |
| `/app/central-conteudo` | Gestão de conteúdo | Todos |
| `/app/contrato` | Contrato do cliente | Todos |
| `/app/campanhas` | Métricas de campanhas | Todos |
| `/app/gestao-clientes` | Central de Clientes (master) | Master |
| `/app/admin` | Painel admin | Master |
| `/app/admin/clientes/novo` | Cadastro de novo cliente | Master |
| `/app/admin/clientes/[id]` | Edição de cliente | Master |
| `/app/perfil` | Perfil do usuário | Todos |
| `/auth/*` | Fluxo de autenticação | Público |

### Layout Base (`src/components/AppLayout.tsx`)
- **Sidebar fixa** (256px) à esquerda com navegação por ícones (Lucide)
- **Role-based filtering:** `clientOnly` flag filtra itens para usuários com role `cliente`
- **Header sticky** com: botão de menu mobile, `NotificationBell`, dropdown do usuário (avatar + nome + links)
- **Dark mode** suportado via `useDarkMode()` hook (classes `dark:`)

### Proteção de Rotas
- `middleware.ts` → apenas chama `updateSession(request)` do Supabase SSR
- RLS do Supabase garante isolamento de tenant no banco

---

## 3. Padrões de Componentes (UI)

### Componentes Reutilizáveis Identificados

| Componente | Localização | Reutilização |
|------------|-------------|--------------|
| `AppLayout` | `src/components/AppLayout.tsx` | Todas as páginas `/app/*` |
| `CalendarGrid` | `src/components/calendar/CalendarGrid.tsx` | Calendário apenas |
| `PostModal` / `BulkPostModal` | `src/components/calendar/` | Calendário apenas |
| `NotificationBell` | `src/components/NotificationBell.tsx` | AppLayout (global) |
| `MFASetup` / `MFAVerification` | `src/components/` | Auth (2FA) |
| `SSOButtons` | `src/components/SSOButtons.tsx` | Login/Register |
| `LegalDocuments` | `src/components/LegalDocuments.tsx` | Legal |
| `Toast` | `src/components/ui/Toast.tsx` | Pouco usado |

### Hardcoding e Repetição de Código

**🔴 Alto nível de hardcoding detectado.** Não há biblioteca central de componentes de negócio (DataTable, FormSection, StatusBadge, EmptyState, etc.). Cada página reimplementa padrões similares:

- **Cards de estatísticas:** reimplementados em `page.tsx` (dashboard), `campanhas/page.tsx`, `gestao-clientes/page.tsx`
- **Formulários:** validações, estados de loading, mensagens de erro são reescritos página por página
- **Tabelas/Lists:** `gestao-clientes/page.tsx`, `admin/page.tsx`, `feed-postagens/page.tsx` — nenhuma usa um componente `DataTable` compartilhado
- **Modais de confirmação:** `confirm()` nativo do browser é usado em vez de um `ConfirmationDialog` reutilizável
- **Upload de imagens:** lógica de drag-and-drop + preview reimplementada em `admin/clientes/novo/page.tsx` e `admin/clientes/[id]/page.tsx`

**Recomendação:** Criar uma pasta `src/components/common/` com: `DataTable`, `ConfirmDialog`, `StatCard`, `FormSection`, `ImageUploader`, `EmptyState`, `StatusBadge`.

---

## 4. UX Técnica e Feedback de Sistema

### Estados de Carregamento

| Tipo | Uso | Avaliação |
|------|-----|-----------|
| Spinner CSS (`animate-spin` + `border-b-2 border-rausch`) | Páginas principais | ✅ Consistente após correção |
| `loading` state boolean | Quase todas as páginas | ✅ Padrão correto |
| Skeleton screens | **Inexistente** | 🔴 Ausente |
| Full-page blocker | Não encontrado | ✅ |

**Arquivos onde o spinner é usado:**
- `src/app/app/page.tsx:14`
- `src/app/app/calendario/page.tsx`
- `src/app/app/contrato/page.tsx:68`
- `src/app/app/campanhas/page.tsx:117`
- `src/app/app/admin/page.tsx:177`
- `src/app/app/gestao-clientes/page.tsx`

### Mensagens de Erro e Sucesso

| Mecanismo | Uso | Avaliação |
|-----------|-----|-----------|
| `alert()` nativo do browser | `calendario/page.tsx` (antes da correção), `campanhas/page.tsx` | 🔴 **Anti-padrão crítico** |
| Inline message (`message` / `error` state) | `perfil/page.tsx`, `meu-cadastro/page.tsx`, `admin/clientes/[id]/page.tsx` | ✅ Bom |
| `console.error` | Várias páginas | ⚠️ Apenas para devs, não para usuários |
| Toast/Snackbar | `Toast.tsx` existe mas é **quase não utilizado** | 🔴 Oportunidade perdida |

**Problema crítico:** O componente `Toast.tsx` existe em `src/components/ui/Toast.tsx` mas não há um **Toast Provider** global. Mensagens de sucesso/erro são renderizadas inline em cada página, resultando em inconsistência visual.

### Validação de Formulários
- **Nenhuma biblioteca de formulários** (react-hook-form, Formik, Zod) — todos os formulários usam `useState` manual
- Validações são imperativas (`if (!form.nome) { setError("...") }`)
- Campos obrigatórios não usam `required` HTML5 consistentemente
- Não há máscaras de input (telefone, CNPJ, CEP)

---

## 5. Acessibilidade (a11y) e Semântica

### HTML Semântico

| Elemento | Ocorrências | Avaliação |
|----------|-------------|-----------|
| `<nav>` | **3** (AppLayout sidebar, LegalDocuments) | ⚠️ Apenas em componentes isolados |
| `<main>` | **0** | 🔴 Nenhuma página usa `<main>` |
| `<header>` | **0** | 🔴 AppLayout não usa `<header>` |
| `<footer>` | **0** | 🔴 |
| `<section>` | **0** | 🔴 Seções de conteúdo usam `<div>` |
| `<article>` | **0** | 🔴 |
| `<button>` vs `<div onClick>` | Predominantemente `<button>` | ✅ Bom |

**Observação:** A maior parte do layout é construída com `<div>` genéricos. O AppLayout renderiza a sidebar como `<div className="fixed...">` em vez de `<nav>` com `<ul>`/`<li>`.

### Atributos ARIA

```
Total de atributos aria-* encontrados: ~3
```

- `aria-label="Mês anterior"` — `CalendarGrid.tsx:60`
- `aria-label="Próximo mês"` — `CalendarGrid.tsx:70`
- `aria-label="Close"` — `Cookies.tsx:89`

**🔴 Diagnóstico grave:** Praticamente **zero atenção a acessibilidade**. Não há:
- `aria-expanded` nos dropdowns (AppLayout user menu)
- `aria-current="page"` nos links ativos de navegação
- `aria-live` para mensagens de erro/sucesso
- `aria-describedby` para campos de formulário
- `role="alert"` nas mensagens de erro

### Imagens e `alt`

```
Total de atributos alt= encontrados: ~11
```

- Logo: `<Image src="/logo.png" alt="Totum" ...>` — ✅
- Avatares: `alt="Avatar"` — ⚠️ Genérico, deveria incluir nome do usuário
- Ícones decorativos (Lucide) **não usam `aria-hidden`** — 🔴 Leitores de tela anunciam ícones como "imagem"

### Contraste e Foco
- Tokens de cor do Airbnb possuem bom contraste (testado: `ink` #222 sobre `canvas` #fff = 15.9:1)
- **Foco visual:** `focus:ring-rausch` está presente em inputs, mas não em todos os elementos interativos
- Não há estilo de foco visível em botões customizados (ex: ícones da sidebar)

---

## 6. Diagnóstico Crítico

### 🔴 Crítico

#### 1. Componentes monolíticos (500–700+ linhas)
- `admin/clientes/novo/page.tsx` — **505 linhas** (wizard de 9 passos)
- `admin/clientes/[id]/page.tsx` — **612 linhas** (edição reutilizando wizard)
- `gestao-clientes/page.tsx` — **704 linhas** (dashboard com CRUD completo)
- `central-conteudo/page.tsx` — **650 linhas**

**Impacto:** Dificuldade de manutenção, alto risco de regressão, re-renders desnecessários por conta de estados compartilhados em componentes gigantes.

#### 2. Ausência de biblioteca de formulários
Todos os formulários gerenciam estado manualmente com `useState`. O wizard de cadastro de cliente tem **~40 campos** mapeados manualmente:

```tsx
// admin/clientes/novo/page.tsx (exemplo ilustrativo)
const [form, setForm] = useState({
  nome: "", cnpj: "", nome_responsavel: "", email_responsavel: "",
  telefone: "", site: "", ramo_atuacao: "", tempo_mercado: "",
  // ... mais 30+ campos
});
```

**Impacto:** Código verboso, propensão a erros de tipagem, validações inconsistentes.

#### 3. `any` types disseminados
- `src/app/app/meu-cadastro/page.tsx:24` — `const [clientData, setClientData] = useState<any>(null);`
- `src/app/app/admin/clientes/[id]/page.tsx` — múltiplos casts `as any`
- `src/lib/supabase/client.ts:16` — `return new SassClient(client as any, ...)`

**Impacto:** Perda de segurança de tipos, dificuldade de refatoração.

#### 4. `ignoreBuildErrors: true` no Next.js
```ts
// next.config.ts
ignoreBuildErrors: true,
```

**Impacto:** Erros de TypeScript são silenciados no build. Isso permitiu que o `CalendarGrid` tivesse uma interface de props completamente incompatível com a página do calendário por um longo período sem quebrar o build.

### 🟡 Alto

#### 5. Não há sistema de Toast/Notificação global
Erros e sucessos são renderizados inline em cada página com markup diferente. Usuário não recebe feedback consistente.

#### 6. Não há tratamento de erro global (Error Boundary)
Se um componente quebra, a página inteira fica em branco. Não há `error.tsx` nas rotas do App Router.

#### 7. Estado de loading não desabilita interações
Em várias páginas, o botão de submit não é desabilitado durante o loading, permitindo cliques duplos:
- `meu-cadastro/page.tsx:189` — botão de salvar não usa `disabled={loading}` consistentemente

#### 8. Uso de `confirm()` do browser
- `calendario/page.tsx:115` — `confirm('Tem certeza...')`
- `gestao-clientes/page.tsx` — `confirm()` para deletar

**Impacto:** Bloqueia a thread principal, não é estilizável, ruim para UX mobile.

### 🟢 Médio

#### 9. Repetição de lógica de Supabase
Quase toda página repete o padrão:
```tsx
const supabase = await createSPASassClient();
const { data, error } = await supabase.getSupabaseClient().from("...").select("...");
```

**Recomendação:** Criar hooks customizados (`usePosts`, `useClient`, `useNotifications`) encapsulando queries e estados de loading/error.

#### 10. Imagens sem lazy loading otimizado
Algumas páginas usam `<img>` em vez de `next/image` (ex: avatar no perfil), perdendo otimização automática.

---

## Sumário Executivo

| Categoria | Nota | Observação |
|-----------|------|------------|
| Tech Stack | ⭐⭐⭐⭐⭐ | Next.js 15 + Tailwind + TS — stack moderna e sólida |
| Design System | ⭐⭐⭐⭐ | Tokens bem definidos, mas havia vazamentos (corrigidos) |
| Componentização | ⭐⭐ | Poucos componentes reutilizáveis, muito hardcode |
| UX Feedback | ⭐⭐ | Sem Toast global, sem skeleton, `alert()` e `confirm()` nativos |
| Acessibilidade | ⭐ | Quase zero atenção a a11y |
| Performance/Arquitetura | ⭐⭐ | Componentes gigantes, `any` types, `ignoreBuildErrors` |

---

## Recomendações Prioritárias

1. **Criar componentes reutilizáveis:** `DataTable`, `ConfirmDialog`, `StatCard`, `EmptyState`, `StatusBadge`, `ImageUploader`
2. **Implementar Toast/Notification Provider global** usando o `Toast.tsx` existente
3. **Adotar react-hook-form + Zod** para todos os formulários
4. **Quebrar componentes >300 linhas** em sub-componentes
5. **Remover `ignoreBuildErrors: true`** e corrigir todos os erros de TypeScript
6. **Adicionar atributos ARIA** nos componentes críticos (navegação, formulários, modais)
7. **Substituir `confirm()` e `alert()`** por `ConfirmDialog` e Toast notifications
8. **Criar Error Boundaries** (`error.tsx`) nas rotas principais
