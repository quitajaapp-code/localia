
-- Enums
CREATE TYPE public.benchmark_insight_type AS ENUM ('gap_rating', 'opportunity_content', 'ad_strategy');
CREATE TYPE public.benchmark_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.benchmark_insight_status AS ENUM ('new', 'reviewed', 'implemented');

-- 1. benchmark_competitors
CREATE TABLE public.benchmark_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  google_place_id TEXT,
  name TEXT NOT NULL,
  address TEXT,
  category TEXT,
  website TEXT,
  phone TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  posts_last_30_days INTEGER DEFAULT 0,
  response_rate NUMERIC(5,2) DEFAULT 0,
  price_level INTEGER,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. benchmark_metrics_history
CREATE TABLE public.benchmark_metrics_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES public.benchmark_competitors(id) ON DELETE CASCADE,
  rating NUMERIC(2,1),
  review_count INTEGER,
  posts_last_30_days INTEGER,
  response_rate NUMERIC(5,2),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. benchmark_insights
CREATE TABLE public.benchmark_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  insight_type public.benchmark_insight_type NOT NULL,
  severity public.benchmark_severity NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  data_context JSONB DEFAULT '{}',
  recommended_action TEXT,
  status public.benchmark_insight_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_benchmark_competitors_business ON public.benchmark_competitors(business_id);
CREATE INDEX idx_benchmark_metrics_history_competitor ON public.benchmark_metrics_history(competitor_id);
CREATE INDEX idx_benchmark_metrics_history_date ON public.benchmark_metrics_history(snapshot_date);
CREATE INDEX idx_benchmark_insights_business ON public.benchmark_insights(business_id);
CREATE INDEX idx_benchmark_insights_status ON public.benchmark_insights(status);
CREATE INDEX idx_benchmark_insights_severity ON public.benchmark_insights(severity);

-- Triggers updated_at
CREATE TRIGGER trg_benchmark_competitors_updated
  BEFORE UPDATE ON public.benchmark_competitors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_benchmark_insights_updated
  BEFORE UPDATE ON public.benchmark_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.benchmark_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_metrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_insights ENABLE ROW LEVEL SECURITY;

-- Policies: clients see own data
CREATE POLICY "Users view own benchmark_competitors"
  ON public.benchmark_competitors FOR SELECT TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users view own benchmark_metrics_history"
  ON public.benchmark_metrics_history FOR SELECT TO authenticated
  USING (competitor_id IN (
    SELECT bc.id FROM public.benchmark_competitors bc
    JOIN public.businesses b ON bc.business_id = b.id
    WHERE b.user_id = auth.uid()
  ));

CREATE POLICY "Users view own benchmark_insights"
  ON public.benchmark_insights FOR SELECT TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Policies: admins full access
CREATE POLICY "Admins manage benchmark_competitors"
  ON public.benchmark_competitors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage benchmark_metrics_history"
  ON public.benchmark_metrics_history FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage benchmark_insights"
  ON public.benchmark_insights FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow users to update insight status (mark as reviewed/implemented)
CREATE POLICY "Users update own benchmark_insights status"
  ON public.benchmark_insights FOR UPDATE TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
