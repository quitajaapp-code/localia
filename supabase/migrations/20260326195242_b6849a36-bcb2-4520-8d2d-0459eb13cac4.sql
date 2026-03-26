
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT,
  email TEXT,
  stripe_customer_id TEXT,
  plano TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '14 days'),
  notif_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Businesses table
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  nicho TEXT,
  tom_de_voz TEXT DEFAULT 'Descontraído e próximo',
  gmb_location_id TEXT,
  ads_customer_id TEXT,
  website_url TEXT,
  whatsapp TEXT,
  cidade TEXT,
  estado TEXT,
  score_materiais INTEGER DEFAULT 0,
  config_posts JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own businesses" ON public.businesses
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  review_id_google TEXT,
  autor TEXT,
  rating INTEGER,
  texto TEXT,
  resposta_sugerida_ia TEXT,
  respondido BOOLEAN DEFAULT false,
  respondido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage reviews of own businesses" ON public.reviews
  FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  texto TEXT,
  imagem_url TEXT,
  tipo TEXT,
  status TEXT DEFAULT 'rascunho',
  agendado_para TIMESTAMPTZ,
  publicado_em TIMESTAMPTZ,
  gmb_post_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage posts of own businesses" ON public.posts
  FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Campaigns table
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT DEFAULT 'search',
  status TEXT DEFAULT 'rascunho',
  verba_mensal NUMERIC DEFAULT 0,
  verba_restante NUMERIC DEFAULT 0,
  ads_campaign_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage campaigns of own businesses" ON public.campaigns
  FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Keywords table
CREATE TABLE public.keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  termo TEXT NOT NULL,
  match_type TEXT DEFAULT 'phrase',
  status TEXT DEFAULT 'ativo',
  cpc_atual NUMERIC,
  impressoes INTEGER DEFAULT 0,
  cliques INTEGER DEFAULT 0,
  conversoes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage keywords" ON public.keywords
  FOR ALL TO authenticated
  USING (campaign_id IN (
    SELECT c.id FROM public.campaigns c
    JOIN public.businesses b ON c.business_id = b.id
    WHERE b.user_id = auth.uid()
  ))
  WITH CHECK (campaign_id IN (
    SELECT c.id FROM public.campaigns c
    JOIN public.businesses b ON c.business_id = b.id
    WHERE b.user_id = auth.uid()
  ));

-- Negative keywords table
CREATE TABLE public.negative_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  termo TEXT NOT NULL,
  match_type TEXT DEFAULT 'phrase',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.negative_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage negative keywords" ON public.negative_keywords
  FOR ALL TO authenticated
  USING (campaign_id IN (
    SELECT c.id FROM public.campaigns c
    JOIN public.businesses b ON c.business_id = b.id
    WHERE b.user_id = auth.uid()
  ))
  WITH CHECK (campaign_id IN (
    SELECT c.id FROM public.campaigns c
    JOIN public.businesses b ON c.business_id = b.id
    WHERE b.user_id = auth.uid()
  ));

-- Ads table
CREATE TABLE public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  headlines JSONB DEFAULT '[]',
  descriptions JSONB DEFAULT '[]',
  status TEXT DEFAULT 'ativo',
  impressoes INTEGER DEFAULT 0,
  cliques INTEGER DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  cpc NUMERIC DEFAULT 0,
  ads_ad_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage ads" ON public.ads
  FOR ALL TO authenticated
  USING (campaign_id IN (
    SELECT c.id FROM public.campaigns c
    JOIN public.businesses b ON c.business_id = b.id
    WHERE b.user_id = auth.uid()
  ))
  WITH CHECK (campaign_id IN (
    SELECT c.id FROM public.campaigns c
    JOIN public.businesses b ON c.business_id = b.id
    WHERE b.user_id = auth.uid()
  ));

-- Materials table
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL,
  url TEXT,
  nome TEXT,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage materials of own businesses" ON public.materials
  FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- GMB Metrics table
CREATE TABLE public.gmb_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  views_busca INTEGER DEFAULT 0,
  views_maps INTEGER DEFAULT 0,
  cliques_site INTEGER DEFAULT 0,
  ligacoes INTEGER DEFAULT 0,
  rotas INTEGER DEFAULT 0,
  fotos_views INTEGER DEFAULT 0,
  semana_ref DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gmb_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view gmb metrics of own businesses" ON public.gmb_metrics
  FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Ads Metrics table
CREATE TABLE public.ads_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  impressoes INTEGER DEFAULT 0,
  cliques INTEGER DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  cpc_medio NUMERIC DEFAULT 0,
  gasto_total NUMERIC DEFAULT 0,
  conversoes INTEGER DEFAULT 0,
  semana_ref DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ads_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ads metrics of own businesses" ON public.ads_metrics
  FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- GMB Snapshots table
CREATE TABLE public.gmb_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  dados_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gmb_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view gmb snapshots of own businesses" ON public.gmb_snapshots
  FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- OAuth Tokens table
CREATE TABLE public.oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own oauth tokens" ON public.oauth_tokens
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
