
-- Tabela de funis (múltiplos pipelines)
CREATE TABLE public.funnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Adicionar funnel_id aos pipeline_stages
ALTER TABLE public.pipeline_stages
  ADD COLUMN funnel_id uuid REFERENCES public.funnels(id) ON DELETE CASCADE;

-- Ações automáticas por etapa do pipeline
CREATE TABLE public.stage_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id uuid NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'send_whatsapp',
  ordem integer NOT NULL DEFAULT 0,
  config jsonb NOT NULL DEFAULT '{}',
  delay_minutos integer DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

COMMENT ON COLUMN public.stage_actions.tipo IS 'send_whatsapp, send_email, move_stage, add_tag, remove_tag, webhook, delay, ai_message, assign_agent';
COMMENT ON COLUMN public.stage_actions.config IS 'JSON com configuração da ação: {message, template_id, target_stage, tag, url, agent}';

-- Log de execução das ações
CREATE TABLE public.action_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id uuid NOT NULL REFERENCES public.stage_actions(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  resultado jsonb,
  executed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

COMMENT ON COLUMN public.action_executions.status IS 'pending, running, success, failed, skipped';

-- RLS policies
ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage funnels" ON public.funnels FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access funnels" ON public.funnels FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage stage_actions" ON public.stage_actions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access stage_actions" ON public.stage_actions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage action_executions" ON public.action_executions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access action_executions" ON public.action_executions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Criar funil padrão e associar stages existentes
INSERT INTO public.funnels (id, nome, descricao) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Pipeline Principal', 'Funil padrão de vendas');

UPDATE public.pipeline_stages SET funnel_id = '00000000-0000-0000-0000-000000000001';
