CREATE TABLE IF NOT EXISTS clients (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text unique not null,
  email_responsavel text not null,
  contato_principal text,
  drive_folder_id text,
  drive_folder_cliente_id text,
  contract_id text,
  upixel_account_id text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS client_users (
  user_id uuid references auth.users(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  role text default 'cliente',
  created_at timestamptz default now(),
  primary key (user_id, client_id)
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_self_view" ON clients;
DROP POLICY IF EXISTS "client_users_self_view" ON client_users;

CREATE POLICY "client_self_view" ON clients FOR SELECT
  USING (id IN (SELECT client_id FROM client_users WHERE user_id = auth.uid()));

CREATE POLICY "client_users_self_view" ON client_users FOR SELECT
  USING (user_id = auth.uid());

INSERT INTO clients (nome, slug, email_responsavel) VALUES 
  ('Cliente Demo', 'cliente-demo', 'demo@grupototum.com')
ON CONFLICT (slug) DO NOTHING;
