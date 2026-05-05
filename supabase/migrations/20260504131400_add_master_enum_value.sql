-- Adiciona 'master' ao enum app_role (transação separada do INSERT)

ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'master';
