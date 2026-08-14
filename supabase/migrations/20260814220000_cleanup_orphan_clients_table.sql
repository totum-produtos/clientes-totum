-- Migration: Cleanup orphaned tables
-- Context: clients + client_users were created by migration 20260504000004_clients_table.sql
-- but are NOT used by the portal code. portal_clients is the source of truth for this system.
-- The totum-system ERP uses its own 'clients' table in a separate database.
-- Decision record: https://github.com/grupototum/clientes-totum/pull/24#issuecomment-5298264029

DROP TABLE IF EXISTS client_users CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
