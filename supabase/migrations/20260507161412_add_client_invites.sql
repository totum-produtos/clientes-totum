-- Sistema de convites para clientes
-- Quando um admin cria um cliente, pode enviar um convite por email
-- O cliente clica no link, define senha e é automaticamente vinculado

CREATE TABLE IF NOT EXISTS client_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índice para buscar convite por token (usado no /auth/convite)
CREATE INDEX IF NOT EXISTS idx_client_invites_token ON client_invites(token);

-- Índice para listar convites pendentes de um cliente
CREATE INDEX IF NOT EXISTS idx_client_invites_client ON client_invites(client_id);

-- Comentários
COMMENT ON TABLE client_invites IS 'Convites enviados para clientes criarem conta no portal';
COMMENT ON COLUMN client_invites.token IS 'Token único do convite (UUID v4)';
COMMENT ON COLUMN client_invites.expires_at IS 'Data de expiração do convite (padrão: 24h)';
COMMENT ON COLUMN client_invites.used_at IS 'Quando o convite foi utilizado (null = pendente)';

-- RLS: apenas admins/masters podem ver todos os convites
-- Clientes não precisam ver essa tabela diretamente (acessam via /auth/convite?token=xxx)
ALTER TABLE client_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to masters and admins" ON client_invites
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_client_users
      WHERE user_id = auth.uid() AND role IN ('master', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_client_users
      WHERE user_id = auth.uid() AND role IN ('master', 'admin')
    )
  );
