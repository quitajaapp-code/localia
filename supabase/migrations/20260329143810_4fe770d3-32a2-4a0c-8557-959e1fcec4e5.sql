
-- ============================================================
-- MÓDULO ADS ISOLADO — Tabelas dedicadas
-- ============================================================

-- 1. Adicionar colunas faltantes em ad_accounts
ALTER TABLE public.ad_accounts 
  ADD COLUMN IF NOT EXISTS access_token_encrypted BYTEA,
  ADD COLUMN IF NOT EXISTS refresh_token_encrypted BYTEA,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- 2. ad_campaigns — campanhas isoladas do módulo de agentes
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ad_account_id UUID REFERENCES public.ad_accounts(id),
  business_name TEXT NOT NULL,
  niche TEXT,
  city TEXT,
  budget_daily NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft',
  google_campaign_id TEXT,
  performance_score NUMERIC DEFAULT 0,
  strategy_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ad_campaigns" ON public.ad_campaigns
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. ad_keywords
CREATE TABLE IF NOT EXISTS public.ad_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE NOT NULL,
  keyword TEXT NOT NULL,
  match_type TEXT DEFAULT 'phrase',
  is_negative BOOLEAN DEFAULT false,
  performance_score NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ad_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ad_keywords" ON public.ad_keywords
  FOR ALL TO authenticated
  USING (campaign_id IN (SELECT id FROM ad_campaigns WHERE user_id = auth.uid()))
  WITH CHECK (campaign_id IN (SELECT id FROM ad_campaigns WHERE user_id = auth.uid()));

-- 4. ad_creatives
CREATE TABLE IF NOT EXISTS public.ad_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE NOT NULL,
  headline1 TEXT,
  headline2 TEXT,
  headline3 TEXT,
  description TEXT,
  performance_score NUMERIC DEFAULT 0,
  google_ad_id TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ad_creatives" ON public.ad_creatives
  FOR ALL TO authenticated
  USING (campaign_id IN (SELECT id FROM ad_campaigns WHERE user_id = auth.uid()))
  WITH CHECK (campaign_id IN (SELECT id FROM ad_campaigns WHERE user_id = auth.uid()));

-- 5. ad_metrics (isolada das ads_metrics existentes)
CREATE TABLE IF NOT EXISTS public.ad_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE NOT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  conversions INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ad_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ad_metrics" ON public.ad_metrics
  FOR ALL TO authenticated
  USING (campaign_id IN (SELECT id FROM ad_campaigns WHERE user_id = auth.uid()))
  WITH CHECK (campaign_id IN (SELECT id FROM ad_campaigns WHERE user_id = auth.uid()));
CREATE POLICY "Service role full access ad_metrics" ON public.ad_metrics
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. Adicionar performance_score ao ad_logs existente
ALTER TABLE public.ad_logs ADD COLUMN IF NOT EXISTS performance_score NUMERIC DEFAULT 0;
