UPDATE wanda_posts SET portal_client_id = (SELECT id FROM portal_clients WHERE slug = 'cliente-demo')
WHERE portal_client_id IS NULL;
