-- Migration: Migra wanda_posts.type dos valores antigos para Círculo Dourado
-- Data: 2026-05-04
-- Depende de: wanda_posts ter coluna `type`

-- Mapeamento:
-- viral        → porque
-- conversion   → o_que
-- educational  → como

UPDATE wanda_posts
SET type = 'porque'
WHERE type = 'viral';

UPDATE wanda_posts
SET type = 'o_que'
WHERE type = 'conversion';

UPDATE wanda_posts
SET type = 'como'
WHERE type = 'educational';

-- Garantir que posts sem type recebam um valor padrão
UPDATE wanda_posts
SET type = 'porque'
WHERE type IS NULL OR type = '';
