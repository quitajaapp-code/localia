INSERT INTO storage.buckets (id, name, public) VALUES ('business-assets', 'business-assets', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Auth users can upload business assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'business-assets');

CREATE POLICY "Auth users can view business assets" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'business-assets');

CREATE POLICY "Auth users can delete own business assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'business-assets');

ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS logo_url TEXT, ADD COLUMN IF NOT EXISTS cor_primaria TEXT, ADD COLUMN IF NOT EXISTS cor_secundaria TEXT, ADD COLUMN IF NOT EXISTS video_url TEXT, ADD COLUMN IF NOT EXISTS diferenciais TEXT, ADD COLUMN IF NOT EXISTS promocoes TEXT, ADD COLUMN IF NOT EXISTS faq TEXT, ADD COLUMN IF NOT EXISTS produtos TEXT, ADD COLUMN IF NOT EXISTS instagram TEXT, ADD COLUMN IF NOT EXISTS outras_redes TEXT, ADD COLUMN IF NOT EXISTS depoimentos TEXT, ADD COLUMN IF NOT EXISTS premios TEXT, ADD COLUMN IF NOT EXISTS num_clientes TEXT, ADD COLUMN IF NOT EXISTS anos_experiencia TEXT, ADD COLUMN IF NOT EXISTS ia_sempre_mencionar TEXT, ADD COLUMN IF NOT EXISTS ia_nunca_mencionar TEXT, ADD COLUMN IF NOT EXISTS publico_alvo TEXT;