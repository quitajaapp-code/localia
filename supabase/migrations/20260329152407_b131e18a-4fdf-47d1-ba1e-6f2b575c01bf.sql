-- Fix ad_logs policies to support isolated Ads module tables (ad_campaigns)
-- and allow authenticated users to write their own logs.

DROP POLICY IF EXISTS "Users can view own ad_logs" ON public.ad_logs;

CREATE POLICY "Users can view own ad_logs"
ON public.ad_logs
FOR SELECT
TO authenticated
USING (
  campaign_id IN (
    SELECT c.id
    FROM public.ad_campaigns c
    WHERE c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own ad_logs"
ON public.ad_logs
FOR INSERT
TO authenticated
WITH CHECK (
  campaign_id IN (
    SELECT c.id
    FROM public.ad_campaigns c
    WHERE c.user_id = auth.uid()
  )
);