-- Registra cada ação executada por um agente de IA
CREATE TABLE IF NOT EXISTS agent_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  agent TEXT NOT NULL,
  action_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  input_data JSONB,
  output_data JSONB,
  auto_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  applied_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agent_actions_business ON agent_actions(business_id, agent, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_actions_status ON agent_actions(status, created_at DESC);

-- Configurações por agente por negócio
CREATE TABLE IF NOT EXISTS agent_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  reviews_auto_reply BOOLEAN DEFAULT false,
  reviews_auto_threshold INT DEFAULT 4,
  posts_auto_publish BOOLEAN DEFAULT false,
  posts_frequency TEXT DEFAULT 'weekly',
  posts_best_time TEXT DEFAULT '09:00',
  profile_auto_optimize BOOLEAN DEFAULT false,
  ads_auto_adjust BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own agent_actions"
  ON agent_actions FOR SELECT TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own agent_actions"
  ON agent_actions FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own agent_actions"
  ON agent_actions FOR UPDATE TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Service role can manage all agent_actions"
  ON agent_actions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Users can view their own agent_settings"
  ON agent_settings FOR SELECT TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own agent_settings"
  ON agent_settings FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own agent_settings"
  ON agent_settings FOR UPDATE TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Service role can manage all agent_settings"
  ON agent_settings FOR ALL TO service_role
  USING (true) WITH CHECK (true);