-- Convites de auto-onboarding: o cliente preenche o briefing antes
-- de existir como portal_client. Quando finaliza, a API cria o
-- portal_client + usuario Supabase Auth + envia credenciais.
--
-- Diferente de client_invites (que pressupõe client_id existente),
-- aqui o client_id é gravado SÓ ao finalizar.

CREATE TABLE IF NOT EXISTS client_onboarding_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  email text NOT NULL,
  nome_pre text,
  draft_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  current_step int NOT NULL DEFAULT 1,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  used_at timestamptz,
  created_portal_client_id uuid REFERENCES portal_clients(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_client_onboarding_invites_token
  ON client_onboarding_invites(token);

CREATE INDEX IF NOT EXISTS idx_client_onboarding_invites_pending
  ON client_onboarding_invites(used_at, expires_at)
  WHERE used_at IS NULL;

COMMENT ON TABLE client_onboarding_invites IS
  'Convites para clientes preencherem briefing antes de serem criados';
COMMENT ON COLUMN client_onboarding_invites.draft_data IS
  'Rascunho do briefing em JSON. Estrutura segue FormState do wizard.';
COMMENT ON COLUMN client_onboarding_invites.current_step IS
  'Última etapa em que o cliente parou (1..12).';
COMMENT ON COLUMN client_onboarding_invites.used_at IS
  'Quando o cliente finalizou. NULL = pendente.';

ALTER TABLE client_onboarding_invites ENABLE ROW LEVEL SECURITY;

-- Master/admin manipulam pelo painel.
CREATE POLICY "Onboarding invites: master/admin full access"
  ON client_onboarding_invites
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('master', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('master', 'admin')
    )
  );

-- Acesso público acontece somente via API routes server-side
-- usando SERVICE_ROLE_KEY (que ignora RLS). anon NÃO tem policy aqui.
