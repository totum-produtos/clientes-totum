# Plano de Integração — Fase 2

## Resumo
Investigação read-only dos repos vizinhos para mapear o que precisa ser construído
antes de substituir os mocks no `clientes-totum`.

---

## 1. Campanhas (upixelcrm)

### Estado atual do repo
- **Tipo:** Frontend SPA (React + Vite), consome Supabase diretamente
- **API backend:** ❌ Não existe. O upixelcrm usa `@supabase/supabase-js` no browser
- **Tabelas usadas:** `leads`, `tasks`, `pipelines`, `pipeline_columns`, `timeline_events`, `automations`, `organizations`, `tenants`
- **Campanhas pagas:** Usa hooks `useMetaAds` e `useGoogleAds` (provavelmente via API dos próprios ads)

### O que o clientes-totum precisa
- Métricas de campanhas (spend, leads, CPL, CPC, CTR, ROI)
- Dados de leads por campanha
- Status de campanhas ativas/pausadas

### Opções de integração
| Opção | Esforço | Risco | Nota |
|-------|---------|-------|------|
| A — Ler mesmas tabelas Supabase | Baixo | Médio | upixelcrm e clientes-totum já compartilham o projeto Supabase. Basta adicionar RLS para isolar por tenant. |
| B — Criar API no upixelcrm | Alto | Baixo | Requer construir backend Express/Fastify no upixelcrm. |
| C — Supabase Edge Function | Médio | Médio | Criar function no Supabase que agrega dados de campanhas. |

### Recomendação
**Opção A** para Fase 2 imediata: criar view ou Edge Function no Supabase que expõe
`leads` + métricas agregadas, filtradas por `client_id`. O upixelcrm já usa `client_id`
como tenant — basta alinhar com `portal_client_id` do portal.

### Tarefas
- [ ] Mapear colunas de `leads` e tabelas de campanhas no Supabase
- [ ] Criar migration com view `v_campaign_metrics` filtrada por `client_id`
- [ ] Adicionar RLS na view para isolar por tenant
- [ ] Substituir mock em `src/app/app/campanhas/page.tsx`
- **Estimativa:** 4-6 horas

---

## 2. Calendário (agendamento-totum)

### Estado atual do repo
- **Repo:** `grupototum/agendamento-totum` (não clonado localmente nesta sessão)
- **Suposição:** Provavelmente sistema de agendamento de reuniões/eventos

### O que o clientes-totum precisa
- Eventos agendados (reuniões, calls, entregas)
- Integração com Google Calendar / Outlook

### Bloqueio
⚠️ **Repo não disponível para inspeção.** Necessário clonar e analisar antes de estimar.

### Tarefas (pendentes de investigação)
- [ ] Clonar `agendamento-totum` e inspecionar schema/tabelas
- [ ] Verificar se tem API ou se consome Supabase diretamente
- [ ] Mapear tabela de eventos e filtro de tenant
- [ ] Estimativa: **TBD** (pendente de investigação)

---

## 3. Contratos / Tarefas (totum-system)

### Estado atual do repo
- **Tipo:** API Express (Stark API) + frontend
- **Endpoint existente:** `GET /api/tarefas` — lista TODAS as tarefas (sem filtro de tenant!)
- **Schema:** Tabela `tarefas` no mesmo Supabase (compartilhado)
- **Controller:** `src/stark-api/src/controllers/tarefasController.ts`

### Problema crítico identificado
O endpoint `/api/tarefas` **não filtra por cliente**. Retorna todas as tarefas do banco.
Isso é um vazamento de dados se exposto ao portal.

### O que o clientes-totum precisa
- Lista de tarefas filtrada por `portal_client_id`
- Estatísticas de entregas (concluídas, pendentes)
- Detalhes de contrato (se houver tabela específica)

### Tarefas no totum-system
- [ ] Adicionar query param `?client_id=X` em `GET /api/tarefas`
- [ ] Adicionar middleware de auth/tenant na Stark API
- [ ] Criar endpoint `GET /api/tarefas/estatisticas?client_id=X`

### Tarefas no clientes-totum
- [ ] Substituir fetch direto do Supabase por chamada à Stark API
  (ou manter Supabase se RLS já isolar — ver decisão abaixo)
- **Estimativa totum-system:** 6-8 horas
- **Estimativa clientes-totum:** 2-3 horas

### Decisão pendente
O `clientes-totum` já lê `tarefas` diretamente do Supabase com RLS por `portal_client_id`.
A integração via API (Stark) só faz sentido se o totum-system tiver lógica de negócio
adicional (ex: cálculo de SLA, aprovações). Se for apenas CRUD, manter via Supabase
é mais simples. **Recomendação:** manter Supabase para leitura, usar API apenas para
operações complexas.

---

## 4. Drive (Google Drive OAuth)

### Estado atual
- Aba Drive mostra mock de pastas/arquivos
- Botão "Conectar Google Drive" está desabilitado

### O que precisa ser construído
1. **Google Cloud Project:** Criar OAuth 2.0 credentials
2. **Backend no clientes-totum:** Endpoint `/api/drive/auth` para iniciar flow OAuth
3. **Armazenamento de tokens:** Tabela `drive_tokens` no Supabase (ou usar `portal_clients.drive_folder_id`)
4. **Listagem de arquivos:** Usar Google Drive API v3 para listar pasta compartilhada

### Tarefas
- [ ] Criar Google Cloud project + OAuth 2.0 credentials
- [ ] Adicionar `GOOGLE_DRIVE_CLIENT_ID` e `GOOGLE_DRIVE_CLIENT_SECRET` no `.env`
- [ ] Criar tabela `drive_tokens` (user_id, access_token, refresh_token, expires_at)
- [ ] Implementar OAuth flow em `src/app/app/drive/page.tsx`
- [ ] Criar server action/API route para listar arquivos da pasta
- **Estimativa:** 8-12 horas

---

## 5. Arquivos (Supabase Storage)

### Estado atual
- Aba Arquivos mostra mock de PDFs/ZIPs/DOCXs
- Template original tem funções de upload/download em `SassClient`

### O que precisa ser construído
1. **Bucket no Supabase:** Criar bucket `client_files` com RLS
2. **RLS policies:** Isolar por `portal_client_id` (usar metadata do objeto)
3. **UI de upload:** Componente drag-and-drop
4. **UI de download:** Links com signed URL

### Tarefas
- [ ] Criar bucket `client_files` no Supabase Dashboard
- [ ] Adicionar RLS policies no bucket (isolar por client_id)
- [ ] Implementar upload em `src/app/app/arquivos/page.tsx`
- [ ] Implementar listagem e download
- **Estimativa:** 4-6 horas

---

## Priorização por Esforço × Impacto

| Integração | Esforço estimado | Impacto pro cliente | Prioridade |
|------------|------------------|---------------------|------------|
| **Arquivos ← Supabase Storage** | 4-6h | Alto | **P1** — mock mais simples de resolver, valor imediato |
| **Drive ← Google Drive OAuth** | 8-12h | Alto | **P2** — alto valor, mas depende de setup Google Cloud |
| **Campanhas ← upixelcrm (Opção A)** | 4-6h | Alto | **P3** — dados já existem no Supabase, só precisa de view/RLS |
| **Calendário ← agendamento-totum** | TBD | Alto | **P4** — bloqueado: repo não investigado |
| **Contratos ← totum-system API** | 6-8h | Médio | **P5** — baixa urgência, já temos tarefas via Supabase |

## Ordem recomendada de execução

1. **Semana 1:** Arquivos (Supabase Storage) — resolve mock imediato, baixo risco
2. **Semana 2:** Campanhas (view Supabase) — reaproveita dados upixelcrm
3. **Semana 3:** Drive (Google OAuth) — maior esforço, mas alto valor
4. **Semana 4+:** Calendário (após investigar agendamento-totum) + Contratos (se necessário)

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| upixelcrm não tem `client_id` alinhado com `portal_client_id` | Média | Alto | Mapear IDs antes de criar view |
| Google Drive OAuth requer verificação de domínio | Alta | Médio | Usar "Internal" app no Google Cloud primeiro |
| Supabase Storage RLS com metadata de objeto é complexo | Média | Médio | Testar com bucket de dev primeiro |
| agendamento-totum usa schema incompatível | Desconhecida | Alto | Investigar repo antes de comprometer prazo |

## Endpoints novos a criar (resumo)

### No clientes-totum
- `POST /api/drive/auth` — iniciar OAuth Google Drive
- `POST /api/drive/callback` — callback OAuth
- `GET /api/drive/files` — listar arquivos da pasta

### No Supabase (migrations)
- View `v_campaign_metrics` — agrega leads/campanhas por client_id
- Bucket `client_files` + RLS policies
- Tabela `drive_tokens` — tokens OAuth do Google Drive

### Nos repos vizinhos (futuro)
- **upixelcrm:** nenhum (Opção A: acesso direto ao Supabase)
- **totum-system:** `GET /api/tarefas?client_id=X` (se optar por API ao invés de Supabase)
- **agendamento-totum:** TBD após investigação
