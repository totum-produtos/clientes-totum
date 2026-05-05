-- Wanda posts (5 primeiros)
SELECT id, post_id, subject, tipo, published_at, views, likes, engagement_rate 
FROM wanda_posts 
ORDER BY published_at DESC 
LIMIT 5;
