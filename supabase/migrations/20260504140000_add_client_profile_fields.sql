-- Migration: Adiciona campos de perfil do cliente para o wizard de cadastro
-- Data: 2026-05-04

ALTER TABLE portal_clients
  ADD COLUMN IF NOT EXISTS cnpj text,
  ADD COLUMN IF NOT EXISTS nome_responsavel text,
  ADD COLUMN IF NOT EXISTS telefone text,
  ADD COLUMN IF NOT EXISTS site text,
  ADD COLUMN IF NOT EXISTS cor_primaria text,
  ADD COLUMN IF NOT EXISTS cor_secundaria text,
  ADD COLUMN IF NOT EXISTS ramo_atuacao text,
  ADD COLUMN IF NOT EXISTS tempo_mercado text,
  ADD COLUMN IF NOT EXISTS descricao_negocio text,
  ADD COLUMN IF NOT EXISTS produtos_servicos text,
  ADD COLUMN IF NOT EXISTS tamanho_empresa text,
  ADD COLUMN IF NOT EXISTS faturamento_mensal text,
  ADD COLUMN IF NOT EXISTS profile_data jsonb DEFAULT '{}'::jsonb;
