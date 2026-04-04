-- 1. Add 'agency' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'agency';

-- 2. Add max_clients_allowed to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_clients_allowed integer NOT NULL DEFAULT 10;

-- 3. Add agency_id to businesses
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_agency_id ON public.businesses(agency_id);

-- 4. RLS: Agency can SELECT businesses where agency_id = auth.uid()
CREATE POLICY "Agencies can view assigned businesses"
  ON public.businesses FOR SELECT TO authenticated
  USING (agency_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- 5. RLS: Agency can UPDATE businesses where agency_id = auth.uid()
CREATE POLICY "Agencies can update assigned businesses"
  ON public.businesses FOR UPDATE TO authenticated
  USING (agency_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (agency_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- 6. Helper function: get agency clients with stats
CREATE OR REPLACE FUNCTION public.get_agency_clients(p_agency_user_id uuid)
RETURNS TABLE(
  business_id uuid,
  business_name text,
  nicho text,
  cidade text,
  estado text,
  gmb_connected boolean,
  review_count bigint,
  pending_reviews bigint,
  avg_rating numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.id AS business_id,
    b.nome AS business_name,
    b.nicho,
    b.cidade,
    b.estado,
    (b.gmb_location_id IS NOT NULL) AS gmb_connected,
    COALESCE(r.total, 0) AS review_count,
    COALESCE(r.pending, 0) AS pending_reviews,
    COALESCE(r.avg_rating, 0) AS avg_rating
  FROM businesses b
  JOIN profiles p ON b.agency_id = p.id
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*)::bigint AS total,
      COUNT(*) FILTER (WHERE NOT respondido)::bigint AS pending,
      ROUND(AVG(rating)::numeric, 1) AS avg_rating
    FROM reviews rv WHERE rv.business_id = b.id
  ) r ON true
  WHERE p.user_id = p_agency_user_id;
$$;

-- 7. Function to link a business to agency with limit check
CREATE OR REPLACE FUNCTION public.link_business_to_agency(p_agency_user_id uuid, p_business_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
  v_max integer;
  v_current integer;
BEGIN
  SELECT id, max_clients_allowed INTO v_profile_id, v_max
  FROM profiles WHERE user_id = p_agency_user_id;

  IF v_profile_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Agency profile not found');
  END IF;

  -- Check if user has agency role
  IF NOT has_role(p_agency_user_id, 'agency') THEN
    RETURN json_build_object('success', false, 'error', 'User is not an agency');
  END IF;

  SELECT COUNT(*)::integer INTO v_current
  FROM businesses WHERE agency_id = v_profile_id;

  IF v_current >= v_max THEN
    RETURN json_build_object('success', false, 'error', 'Client limit reached', 'current', v_current, 'max', v_max);
  END IF;

  UPDATE businesses SET agency_id = v_profile_id WHERE id = p_business_id;

  RETURN json_build_object('success', true, 'current', v_current + 1, 'max', v_max);
END;
$$;
