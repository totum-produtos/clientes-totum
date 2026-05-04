INSERT INTO portal_client_users (user_id, client_id, role)
SELECT 
  'e6d2d658-ca24-4577-a6e9-f6e60cfa2a67'::uuid,
  id,
  'cliente'
FROM portal_clients WHERE slug = 'cliente-demo'
ON CONFLICT (user_id, client_id) DO NOTHING;
