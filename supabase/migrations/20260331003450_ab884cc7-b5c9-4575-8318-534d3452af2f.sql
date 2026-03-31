UPDATE websites
SET config = jsonb_set(
  config,
  '{galeria,1,url}',
  '"https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80"'
)
WHERE slug = 'demo-salao';