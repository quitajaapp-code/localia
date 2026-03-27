
-- 1. Clear any remaining plaintext tokens and drop the columns
UPDATE public.oauth_tokens SET access_token = NULL, refresh_token = NULL WHERE access_token IS NOT NULL OR refresh_token IS NOT NULL;
ALTER TABLE public.oauth_tokens DROP COLUMN IF EXISTS access_token;
ALTER TABLE public.oauth_tokens DROP COLUMN IF EXISTS refresh_token;

-- 2. Add restrictive policy on coupons to permanently block non-admin access
CREATE POLICY "Block non-admin coupon access"
  ON public.coupons
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
