UPDATE websites
SET config = jsonb_set(
  config,
  '{galeria,1,url}',
  '"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80"'
)
WHERE slug = 'demo-salao';