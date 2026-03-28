
CREATE TABLE public.agent_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  agent text NOT NULL DEFAULT 'reviews',
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'high',
  title text NOT NULL,
  message text,
  review_id uuid REFERENCES public.reviews(id) ON DELETE SET NULL,
  read boolean NOT NULL DEFAULT false,
  notified_email boolean NOT NULL DEFAULT false,
  notified_whatsapp boolean NOT NULL DEFAULT false,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts" ON public.agent_alerts
  FOR SELECT TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own alerts" ON public.agent_alerts
  FOR UPDATE TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Service role can manage all alerts" ON public.agent_alerts
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX idx_agent_alerts_business ON public.agent_alerts(business_id);
CREATE INDEX idx_agent_alerts_unread ON public.agent_alerts(business_id, read) WHERE read = false;
