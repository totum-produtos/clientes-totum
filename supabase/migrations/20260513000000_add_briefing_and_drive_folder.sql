-- Migration: Adiciona campo de pasta do Google Drive e amplia briefing
-- Data: 2026-05-13
-- Notas:
--  - profile_data (jsonb) recebe os novos campos do briefing dinamicamente,
--    sem ALTER de schema.
--  - google_drive_folder_url: pasta destino para arquivos que o cliente
--    enviar via /app/arquivos. Definida pelo admin.

ALTER TABLE portal_clients
  ADD COLUMN IF NOT EXISTS google_drive_folder_url text;
