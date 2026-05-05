# Sincronização de Tarefas — clientes-totum ↔ totum-system

## Princípio fundamental

> **NUNCA sincronize com data ou tarefa atrasada.**
> A sincronização é sempre em tempo real ou próximo-tempo-real, baseada em eventos (webhook/trigger), nunca em batch com delay.

---

## Arquitetura proposta

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  totum-system   │────▶│   Supabase      │◀────│  clientes-totum │
│  (gestão admin) │     │   (banco único) │     │  (portal)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         │   Trigger INSERT/     │   RLS isola por       │
         │   UPDATE/DELETE       │   portal_client_id    │
         └───────────────────────┘                       │
                              │                          │
                              ▼                          ▼
                    ┌─────────────────┐
                    │  tarefas        │
                    │  (tabela única) │
                    └─────────────────┘
```

## Decisão arquitetural

**Uma tabela `tarefas` única, compartilhada entre os dois sistemas.**

- `totum-system` lê/escreve via API (Stark API) com service_role
- `clientes-totum` lê via RLS (`portal_client_id`) com anon_key
- Ambos usam o **mesmo Supabase project**

## Schema da tabela `tarefas`

```sql
CREATE TABLE tarefas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  status text default 'pendente', -- pendente | em_andamento | concluida
  prioridade text default 'media', -- baixa | media | alta | critica
  responsavel text,
  departamento text,
  data_limite timestamptz,
  
  -- Vínculo com cliente do portal
  portal_client_id uuid REFERENCES portal_clients(id) ON DELETE SET NULL,
  
  -- Metadados totum-system (opcional, para compatibilidade)
  totum_system_id text, -- ID legado no totum-system
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## Fluxo de sincronização (event-driven)

### 1. totum-system cria uma tarefa para o cliente

```javascript
// No totum-system (Stark API controller)
async function criarTarefa(dto) {
  const { data, error } = await supabase
    .from('tarefas')
    .insert({
      titulo: dto.titulo,
      descricao: dto.descricao,
      status: dto.status || 'pendente',
      prioridade: dto.prioridade || 'media',
      responsavel: dto.responsavel,
      departamento: dto.departamento,
      data_limite: dto.deadline,
      portal_client_id: dto.cliente_id, // ← chave do vínculo
      totum_system_id: dto.legado_id || null,
    })
    .select()
    .single();
  
  // Notificar em tempo real via Supabase Realtime
  // O clientes-totum já recebe automaticamente se inscrito no canal
  return data;
}
```

### 2. clientes-totum visualiza (já funciona hoje)

```javascript
// No portal (já implementado em /app/contrato)
const { data } = await supabase
  .from('tarefas')
  .select('*')
  .eq('portal_client_id', cliente.id)
  .order('created_at', { ascending: false });
```

### 3. totum-system atualiza status

```javascript
// Atualização reflete imediatamente no portal (Realtime)
await supabase
  .from('tarefas')
  .update({ status: 'concluida', updated_at: new Date().toISOString() })
  .eq('id', tarefaId);
```

## Regras de negócio — SINCRONIZAÇÃO SEM ATRASO

| Situação | Ação |
|----------|------|
| Tarefa criada no totum-system | Insert imediato em `tarefas` com `portal_client_id` |
| Tarefa atualizada no totum-system | Update imediato (campo `updated_at` dispara Realtime) |
| Tarefa deletada no totum-system | Delete imediato (soft delete recomendado: `status = 'cancelada'`) |
| Tarefa atrasada (`data_limite < now()`) | Flag `atrasada = true` calculada na query, NÃO sincronizada separadamente |
| Cliente sem `portal_client_id` | NÃO aparece no portal (RLS bloqueia) |

## ⚠️ O QUE NÃO FAZER

| ❌ Anti-padrão | ✅ Correto |
|----------------|------------|
| Job cron rodando a cada X minutos para "sincronizar" | Trigger/Realtime no momento do INSERT/UPDATE |
| Copiar tarefas para tabela separada do portal | Uma tabela única com RLS |
| Sincronizar tarefas com `data_limite` no passado como "atrasadas" | Calcular `atrasada` dinamicamente na query |
| Expor todas as tarefas do totum-system ao cliente | RLS filtra rigorosamente por `portal_client_id` |

## Implementação no totum-system (Stark API)

Arquivo a modificar: `totum-system/src/stark-api/src/controllers/tarefasController.ts`

```typescript
// Adicionar em listar() — filtro por cliente
if (req.query.client_id) {
  query = query.eq('portal_client_id', req.query.client_id);
}

// Adicionar em criar() — vínculo automático
const novo = {
  ...dto,
  portal_client_id: dto.cliente_id, // recebido do frontend
};
```

## Realtime no clientes-totum

Inscrever o componente `ContratoPage` no canal de tarefas para atualizar sem refresh:

```typescript
useEffect(() => {
  const channel = supabase
    .channel('tarefas-realtime')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tarefas',
      filter: `portal_client_id=eq.${cliente.id}`,
    }, (payload) => {
      fetchTarefas(); // recarrega dados
    })
    .subscribe();
  
  return () => { supabase.removeChannel(channel); };
}, [cliente.id]);
```

## Checklist de implementação

- [ ] Adicionar `portal_client_id` às queries do Stark API
- [ ] Garantir que totum-system preenche `portal_client_id` ao criar tarefas
- [ ] Implementar Realtime no clientes-totum (`/app/contrato`)
- [ ] Adicionar índice em `tarefas(portal_client_id, status)`
- [ ] Testar: criar tarefa no totum-system → verificar se aparece no portal em < 1s
