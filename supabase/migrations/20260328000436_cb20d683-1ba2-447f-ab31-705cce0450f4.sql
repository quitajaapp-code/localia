-- Atualiza demo-salao com mapa real (Porto Alegre Centro)
UPDATE websites SET config = jsonb_set(
  jsonb_set(
    config,
    '{contato,maps_url}',
    '"https://maps.app.goo.gl/rua-da-praia-centro-porto-alegre"'
  ),
  '{contato,maps_place_id}',
  '"ChIJezfwNx-pGZURy8QJsohPhNI"'
)
WHERE slug = 'demo-salao';

-- Atualiza demo-clinica com mapa real (Itaim Bibi, São Paulo)
UPDATE websites SET config = jsonb_set(
  jsonb_set(
    config,
    '{contato,maps_url}',
    '"https://maps.app.goo.gl/faria-lima-itaim-sao-paulo"'
  ),
  '{contato,maps_place_id}',
  '"ChIJ0WGkg4FEzpQRrlkerquncIo"'
)
WHERE slug = 'demo-clinica';

-- Atualiza demo-loja com mapa real (Centro de BH)
UPDATE websites SET config = jsonb_set(
  jsonb_set(
    config,
    '{contato,maps_url}',
    '"https://maps.app.goo.gl/rua-dos-carijos-centro-bh"'
  ),
  '{contato,maps_place_id}',
  '"ChIJc2dYHzevmwARU5kVoLnFYj8"'
)
WHERE slug = 'demo-loja';