
-- ad_accounts: OAuth tokens for Google Ads accounts
CREATE TABLE public.ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  google_ads_customer_id TEXT,
  status TEXT DEFAULT 'connected',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own ad_accounts" ON public.ad_accounts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ad_logs: audit trail for all campaign actions
CREATE TABLE public.ad_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  agent TEXT,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ad_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ad_logs" ON public.ad_logs
  FOR SELECT TO authenticated
  USING (campaign_id IN (
    SELECT c.id FROM campaigns c JOIN businesses b ON c.business_id = b.id WHERE b.user_id = auth.uid()
  ));

CREATE POLICY "Service role full access ad_logs" ON public.ad_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Add ad_account_id to campaigns
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS ad_account_id UUID REFERENCES public.ad_accounts(id);

-- Add budget_daily to campaigns  
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS budget_daily NUMERIC DEFAULT 0;

-- Add headline fields to ads table for better structure
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS headline1 TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS headline2 TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS headline3 TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS description_text TEXT;
