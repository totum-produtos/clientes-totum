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
- ✅ Multi-tenant com RLS
- ✅ Aba Início com dados reais
- ✅ Aba Calendário com CRUD (dados reais do Totum OS)
- ✅ Aba Contrato com dados reais (tarefas)
- ✅ Aba Campanhas com dados reais (wanda_posts)
- ⚠️ Aba Arquivos com mock — substituir por Supabase Storage na Fase 2
- ⚠️ Aba Drive com mock — substituir por Google Drive OAuth na Fase 2

## Roadmap
Ver issues do repo: https://github.com/grupototum/clientes-totum/issues

## Ambientes
- Produção: https://cliente-totum.vercel.app
- Supabase Project: `cgpkfhrqprqptvehatad`
