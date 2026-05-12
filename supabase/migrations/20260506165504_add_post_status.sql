-- Adiciona coluna status à tabela wanda_posts para workflow de agendamento

-- 1. Cria o tipo enum para status de post (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_status') THEN
        CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'published', 'failed');
    END IF;
END $$;

-- 2. Adiciona coluna status à wanda_posts
ALTER TABLE wanda_posts
ADD COLUMN IF NOT EXISTS status post_status DEFAULT 'draft';

-- 3. Atualiza registros existentes: se tiver published_at, marca como published
UPDATE wanda_posts
SET status = 'published'
WHERE published_at IS NOT NULL AND status = 'draft';

-- 4. Adiciona comentário na coluna
COMMENT ON COLUMN wanda_posts.status IS 'Status do post: draft (rascunho), scheduled (agendado), published (publicado), failed (falhou)';
