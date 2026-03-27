-- 1. Fix website_visits: restrict INSERT to only valid website_ids (published sites)
DROP POLICY IF EXISTS "anyone_can_insert_visits" ON public.website_visits;
CREATE POLICY "anyone_can_insert_visits" ON public.website_visits
FOR INSERT TO public
WITH CHECK (
  website_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.websites w
    WHERE w.id = website_visits.website_id AND w.published = true
  )
);

-- 2. Remove redundant coupons DELETE policy (already covered by ALL)
DROP POLICY IF EXISTS "Admins can delete coupons" ON public.coupons;

-- 3. Add explicit SELECT for authenticated users to validate coupons at checkout
CREATE POLICY "Users can read active coupons" ON public.coupons
FOR SELECT TO authenticated
USING (active = true AND (valid_until IS NULL OR valid_until > now()));

-- 4. Enable pgcrypto for token encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- 5. Add encrypted columns for OAuth tokens
ALTER TABLE public.oauth_tokens
  ADD COLUMN IF NOT EXISTS access_token_encrypted bytea,
  ADD COLUMN IF NOT EXISTS refresh_token_encrypted bytea;

-- 6. Create encrypt/decrypt helpers (SECURITY DEFINER so only server can use)
CREATE OR REPLACE FUNCTION public.encrypt_token(plain_text text, secret_key text)
RETURNS bytea
LANGUAGE sql IMMUTABLE SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
  SELECT extensions.pgp_sym_encrypt(plain_text, secret_key)
$$;

CREATE OR REPLACE FUNCTION public.decrypt_token(encrypted_data bytea, secret_key text)
RETURNS text
LANGUAGE sql IMMUTABLE SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
  SELECT extensions.pgp_sym_decrypt(encrypted_data, secret_key)
$$;