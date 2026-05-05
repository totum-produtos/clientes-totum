-- Migration: Cria cliente demo para testes
-- Instruções: após rodar esta migration, o master deve:
-- 1. Ir em /app/admin → criar um usuário auth (ex: cliente@demo.com)
-- 2. Vincular esse usuário ao cliente "Demo Cliente" via admin

INSERT INTO portal_clients (nome, slug, email_responsavel, status)
VALUES (
  'Demo Cliente',
  'demo-cliente',
  'cliente@demo.com',
  'ativo'
)
ON CONFLICT (slug) DO NOTHING;
