-- Migration: Cria tabela de perfis de usuário e bucket de avatares
-- Data: 2026-05-06

-- ============================================================
-- 1. Tabela de perfis dos usuários (adiciona colunas se não existirem)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at timestamptz DEFAULT now()
);

-- Adicionar colunas se não existirem
DO $$
BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name text;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telefone text;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cargo text;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/Sao_Paulo';
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS idioma text DEFAULT 'pt-BR';
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  USING (id = auth.uid() OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'master'));

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
  USING (id = auth.uid());

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at_trigger ON profiles;
CREATE TRIGGER profiles_updated_at_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- ============================================================
-- 2. Bucket de avatares no Storage
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para avatares
DROP POLICY IF EXISTS "avatars_select_public" ON storage.objects;
CREATE POLICY "avatars_select_public" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
CREATE POLICY "avatars_insert_own" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 3. Índices
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);
