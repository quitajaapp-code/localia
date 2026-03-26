
ALTER TABLE public.businesses
ADD COLUMN ia_provider text DEFAULT 'lovable' CHECK (ia_provider IN ('lovable', 'openai', 'anthropic')),
ADD COLUMN ia_api_key text DEFAULT NULL;
