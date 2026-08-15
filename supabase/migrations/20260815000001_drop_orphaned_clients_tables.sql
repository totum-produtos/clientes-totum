-- Migration: DROP tabelas clients + client_users (orphaned)
-- Data: 2026-08-15
-- Aprovado por: Israel Lemos (Rael) — via Telegram 2026-08-15
-- Contexto: Tabelas criadas em 20260504000004_clients_table.sql nunca foram usadas pelo portal.
--           Todo o código usa portal_clients + portal_client_users.
--           Zero referências a .from('clients') ou .from('client_users') em toda a codebase.

DROP TABLE IF EXISTS client_users CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
