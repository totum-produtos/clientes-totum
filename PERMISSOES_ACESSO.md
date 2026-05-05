# Permissões de Acesso — clientes-totum

## Princípio fundamental

> **O cliente vê SOMENTE o que é dele. O master vê TUDO.**

---

## Modelo de roles

| Role | Descrição | Quem recebe |
|------|-----------|-------------|
| `master` | Acesso total a todos os clientes, todas as tabelas, admin completo | Equipe Totum (gestores, diretores) |
| `admin` | Acesso a um cliente específico + pode convidar usuários desse cliente | Gestor do cliente (email responsável) |
| `cliente` | Acesso somente aos dados do seu cliente | Usuários convidados pelo admin do cliente |

---

## Matriz de permissões

### Tabelas do portal

| Tabela | `master` | `admin` (do cliente) | `cliente` |
|--------|----------|---------------------|-----------|
| `portal_clients` | SELECT/INSERT/UPDATE/DELETE todos | SELECT/UPDATE só o seu | SELECT só o seu |
| `portal_client_users` | SELECT/INSERT/UPDATE/DELETE todos | SELECT/INSERT/DELETE só do seu cliente | SELECT só a si mesmo |
| `wanda_posts` | SELECT/INSERT/UPDATE/DELETE todos | SELECT/INSERT/UPDATE/DELETE só do seu cliente | SELECT/INSERT/UPDATE/DELETE só do seu cliente |
| `tarefas` | SELECT/INSERT/UPDATE/DELETE todos | SELECT só do seu cliente | SELECT só do seu cliente |
| `projetos` | SELECT/INSERT/UPDATE/DELETE todos | SELECT só do seu cliente | SELECT só do seu cliente |
| `ad_campaigns` | SELECT/INSERT/UPDATE/DELETE todos | SELECT só do seu cliente | SELECT só do seu cliente |

### Storage buckets

| Bucket | `master` | `admin` (do cliente) | `cliente` |
|--------|----------|---------------------|-----------|
| `client_files` | Acesso a todas as pastas | Acesso só à pasta do seu `client_id` | Acesso só à pasta do seu `client_id` |

---

## Implementação técnica

### 1. Adicionar campo `role` em `portal_client_users`

```sql
ALTER TABLE portal_client_users
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'cliente'
  CHECK (role IN ('master', 'admin', 'cliente'));
```

### 2. Function helper: `get_user_role()`

```sql
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role FROM portal_client_users WHERE user_id = auth.uid() LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Policies RLS com role

Exemplo para `wanda_posts`:

```sql
-- Master: vê tudo
CREATE POLICY "wanda_posts_master" ON wanda_posts FOR SELECT
  USING (get_user_role() = 'master');

-- Admin/Cliente: vê só do seu cliente
CREATE POLICY "wanda_posts_client" ON wanda_posts FOR SELECT
  USING (
    get_user_role() IN ('admin', 'cliente')
    AND portal_client_id IN (
      SELECT client_id FROM portal_client_users WHERE user_id = auth.uid()
    )
  );
```

### 4. Middleware no Next.js

```typescript
// src/lib/supabase/middleware.ts
// Verificar role e redirecionar se necessário

export async function checkUserRole(req: NextRequest) {
  const supabase = createMiddlewareClient({ req, res });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: roleData } = await supabase
    .from('portal_client_users')
    .select('role, client_id')
    .eq('user_id', user.id)
    .single();
    
  return roleData;
}
```

### 5. Proteção de rotas no frontend

```typescript
// src/components/RoleGuard.tsx
// Bloquear acesso a rotas baseado na role

export function RoleGuard({ children, allowedRoles }: { children: ReactNode; allowedRoles: string[] }) {
  const { userRole } = useAuth(); // hook custom
  if (!allowedRoles.includes(userRole)) {
    return <div className="p-8 text-center text-red-600">Acesso negado.</div>;
  }
  return <>{children}</>;
}
```

---

## Regras de UI

| Página | `master` | `admin` | `cliente` |
|--------|----------|---------|-----------|
| `/app` (Início) | ✅ Dashboard com todos os clientes | ✅ Dashboard do seu cliente | ✅ Dashboard do seu cliente |
| `/app/calendario` | ✅ Todos os posts | ✅ Posts do seu cliente | ✅ Posts do seu cliente |
| `/app/feed-postagens` | ✅ Todos os posts | ✅ Posts do seu cliente | ✅ Posts do seu cliente |
| `/app/contrato` | ✅ Todas as tarefas | ✅ Tarefas do seu cliente | ✅ Tarefas do seu cliente |
| `/app/campanhas` | ✅ Todas as campanhas | ✅ Campanhas do seu cliente | ✅ Campanhas do seu cliente |
| `/app/arquivos` | ✅ Todos os arquivos | ✅ Arquivos do seu cliente | ✅ Arquivos do seu cliente |
| `/app/drive` | ✅ Todos os drives | ✅ Drive do seu cliente | ✅ Drive do seu cliente |
| `/app/gestao-clientes` | ✅ Todos os clientes | ❌ Acesso negado | ❌ Acesso negado |
| `/app/admin` | ✅ CRUD completo | ⚠️ Só gerencia seu cliente | ❌ Acesso negado |

---

## Como criar um usuário master

```sql
-- 1. Criar usuário no Supabase Auth (ou usar um existente)
-- 2. Vincular como master:
INSERT INTO portal_client_users (user_id, client_id, role)
VALUES ('<UUID_DO_USUARIO>', '<UUID_DE_QUALQUER_CLIENTE>', 'master');
```

> ⚠️ **Importante:** O master deve ser vinculado a pelo menos um cliente na tabela `portal_client_users`, mesmo que tenha acesso a todos. Isso é necessário para as policies RLS funcionarem corretamente.

---

## Segurança adicional

1. **Nunca confie no frontend** — sempre validar permissões no RLS
2. **Service role key** — usar APENAS em server actions/API routes, NUNCA no browser
3. **JWT claims** — considerar adicionar `role` ao JWT do Supabase para validação mais rápida
4. **Audit log** — registrar ações sensíveis (delete, status change) em tabela `audit_log`
