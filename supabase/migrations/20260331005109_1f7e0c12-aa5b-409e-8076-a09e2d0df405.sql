-- =============================================
-- Competitor Analysis Module
-- =============================================

-- 1. competitor_profiles
CREATE TABLE public.competitor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  google_place_id TEXT,
  name TEXT NOT NULL,
  address TEXT,
  category TEXT,
  website TEXT,
  phone TEXT,
  price_level INTEGER CHECK (price_level >= 0 AND price_level <= 4),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, google_place_id)
);

-- 2. competitor_metrics
CREATE TABLE public.competitor_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES public.competitor_profiles(id) ON DELETE CASCADE,
  rating DOUBLE PRECISION,
  total_reviews INTEGER DEFAULT 0,
  recent_reviews_count INTEGER DEFAULT 0,
  response_rate DOUBLE PRECISION DEFAULT 0,
  avg_response_time_hours DOUBLE PRECISION,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (competitor_id, snapshot_date)
);

-- 3. competitor_keywords
CREATE TABLE public.competitor_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES public.competitor_profiles(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  ranking_position INTEGER,
  search_volume INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX idx_competitor_profiles_business ON public.competitor_profiles(business_id);
CREATE INDEX idx_competitor_profiles_place ON public.competitor_profiles(google_place_id);
CREATE INDEX idx_competitor_metrics_date ON public.competitor_metrics(snapshot_date);
CREATE INDEX idx_competitor_metrics_competitor ON public.competitor_metrics(competitor_id);
CREATE INDEX idx_competitor_keywords_competitor ON public.competitor_keywords(competitor_id);

-- =============================================
-- Updated_at trigger
-- =============================================
CREATE TRIGGER update_competitor_profiles_updated_at
  BEFORE UPDATE ON public.competitor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- RLS Policies
-- =============================================

-- competitor_profiles
CREATE POLICY "Users manage own competitor_profiles"
  ON public.competitor_profiles FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all competitor_profiles"
  ON public.competitor_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access competitor_profiles"
  ON public.competitor_profiles FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- competitor_metrics
CREATE POLICY "Users view own competitor_metrics"
  ON public.competitor_metrics FOR ALL TO authenticated
  USING (competitor_id IN (
    SELECT cp.id FROM public.competitor_profiles cp
    JOIN public.businesses b ON cp.business_id = b.id
    WHERE b.user_id = auth.uid()
  ))
  WITH CHECK (competitor_id IN (
    SELECT cp.id FROM public.competitor_profiles cp
    JOIN public.businesses b ON cp.business_id = b.id
    WHERE b.user_id = auth.uid()
  ));

CREATE POLICY "Admins manage all competitor_metrics"
  ON public.competitor_metrics FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access competitor_metrics"
  ON public.competitor_metrics FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- competitor_keywords
CREATE POLICY "Users view own competitor_keywords"
  ON public.competitor_keywords FOR ALL TO authenticated
  USING (competitor_id IN (
    SELECT cp.id FROM public.competitor_profiles cp
    JOIN public.businesses b ON cp.business_id = b.id
    WHERE b.user_id = auth.uid()
  ))
  WITH CHECK (competitor_id IN (
    SELECT cp.id FROM public.competitor_profiles cp
    JOIN public.businesses b ON cp.business_id = b.id
    WHERE b.user_id = auth.uid()
  ));

CREATE POLICY "Admins manage all competitor_keywords"
  ON public.competitor_keywords FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access competitor_keywords"
  ON public.competitor_keywords FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- =============================================
-- Score calculation function
-- =============================================
CREATE OR REPLACE FUNCTION public.calculate_competitor_score(p_business_id UUID)
RETURNS TABLE (
  business_score INTEGER,
  avg_competitor_rating DOUBLE PRECISION,
  avg_competitor_reviews DOUBLE PRECISION,
  avg_competitor_response_rate DOUBLE PRECISION,
  competitor_count INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_my_rating DOUBLE PRECISION;
  v_my_reviews INTEGER;
  v_my_response_rate DOUBLE PRECISION;
  v_avg_rating DOUBLE PRECISION;
  v_avg_reviews DOUBLE PRECISION;
  v_avg_resp DOUBLE PRECISION;
  v_count INTEGER;
  v_score DOUBLE PRECISION := 0;
BEGIN
  SELECT
    COALESCE(AVG(r.rating), 0),
    COUNT(*)::INTEGER,
    COALESCE(
      (COUNT(*) FILTER (WHERE r.respondido = true))::DOUBLE PRECISION /
      NULLIF(COUNT(*)::DOUBLE PRECISION, 0), 0
    )
  INTO v_my_rating, v_my_reviews, v_my_response_rate
  FROM public.reviews r
  WHERE r.business_id = p_business_id;

  SELECT
    COALESCE(AVG(cm.rating), 0),
    COALESCE(AVG(cm.total_reviews), 0),
    COALESCE(AVG(cm.response_rate), 0),
    COUNT(DISTINCT cm.competitor_id)::INTEGER
  INTO v_avg_rating, v_avg_reviews, v_avg_resp, v_count
  FROM public.competitor_metrics cm
  JOIN public.competitor_profiles cp ON cm.competitor_id = cp.id
  WHERE cp.business_id = p_business_id
    AND cp.is_active = true
    AND cm.snapshot_date = (
      SELECT MAX(snapshot_date) FROM public.competitor_metrics cm2
      JOIN public.competitor_profiles cp2 ON cm2.competitor_id = cp2.id
      WHERE cp2.business_id = p_business_id
    );

  -- Rating (40%)
  IF v_avg_rating > 0 THEN
    v_score := v_score + LEAST((v_my_rating / v_avg_rating) * 40, 50);
  ELSE
    v_score := v_score + 40;
  END IF;

  -- Reviews volume (30%)
  IF v_avg_reviews > 0 THEN
    v_score := v_score + LEAST((v_my_reviews::DOUBLE PRECISION / v_avg_reviews) * 30, 40);
  ELSE
    v_score := v_score + 30;
  END IF;

  -- Response rate (30%)
  IF v_avg_resp > 0 THEN
    v_score := v_score + LEAST((v_my_response_rate / v_avg_resp) * 30, 40);
  ELSE
    v_score := v_score + (v_my_response_rate * 30);
  END IF;

  RETURN QUERY SELECT
    LEAST(GREATEST(v_score::INTEGER, 0), 100),
    v_avg_rating,
    v_avg_reviews,
    v_avg_resp,
    v_count;
END;
$$;