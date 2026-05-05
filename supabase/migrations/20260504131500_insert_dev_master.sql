-- Insere dev@grupototum.com como master em user_roles

DELETE FROM user_roles WHERE user_id = 'e6d2d658-ca24-4577-a6e9-f6e60cfa2a67';
INSERT INTO user_roles (user_id, role)
VALUES ('e6d2d658-ca24-4577-a6e9-f6e60cfa2a67', 'master');
