-- Migration: Migra wanda_posts.tipo dos valores antigos para Círculo Dourado
-- Data: 2026-05-04
-- Depende de: wanda_posts ter coluna `tipo`

-- Mapeamento:
-- viral        → porque
-- conversion   → o_que
-- educational  → como
-- qualquer outro ou NULL → porque (padrão)

DO $$
BEGIN
  -- Verifica se a coluna tipo existe antes de atualizar
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wanda_posts' AND column_name = 'tipo'
  ) THEN
    -- Drop constraint existente para permitir valores de transição
    ALTER TABLE wanda_posts DROP CONSTRAINT IF EXISTS wanda_posts_tipo_check;
    
    -- Atualiza os valores
    UPDATE wanda_posts
    SET tipo = CASE 
      WHEN tipo = 'viral' THEN 'porque'
      WHEN tipo = 'conversion' THEN 'o_que'
      WHEN tipo = 'educational' THEN 'como'
      WHEN tipo IS NULL OR tipo = '' THEN 'porque'
      ELSE tipo
    END;
    
    -- Recria constraint com valores do Círculo Dourado
    ALTER TABLE wanda_posts ADD CONSTRAINT wanda_posts_tipo_check
      CHECK (tipo IN ('porque', 'o_que', 'como'));
  END IF;
END $$;
