
CREATE TABLE public.optimizer_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  report_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id)
);

ALTER TABLE public.optimizer_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own optimizer cache"
  ON public.optimizer_cache
  FOR ALL
  TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));
