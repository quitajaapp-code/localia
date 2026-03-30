
-- ENUMs internos (evitando conflito com os já existentes)
CREATE TYPE internal_wa_conn_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE internal_wa_conv_status AS ENUM ('open', 'pending', 'closed', 'archived');
CREATE TYPE internal_wa_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE internal_wa_msg_type AS ENUM ('text', 'image', 'audio', 'document');
CREATE TYPE internal_wa_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE internal_wa_msg_status AS ENUM ('sent', 'delivered', 'read', 'failed');
CREATE TYPE internal_wa_template_cat AS ENUM ('sales', 'support', 'onboarding');

-- 1. Conexão única da empresa
CREATE TABLE internal_wa_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twilio_account_sid TEXT,
  twilio_phone_number TEXT NOT NULL,
  twilio_webhook_url TEXT,
  status internal_wa_conn_status NOT NULL DEFAULT 'active',
  assigned_agents UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE internal_wa_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage internal_wa_connections" ON internal_wa_connections FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service role full access internal_wa_connections" ON internal_wa_connections FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER set_updated_at_internal_wa_connections BEFORE UPDATE ON internal_wa_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Conversas com leads/clientes
CREATE TABLE internal_wa_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES internal_wa_connections(id) ON DELETE CASCADE,
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  assigned_agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status internal_wa_conv_status NOT NULL DEFAULT 'open',
  priority internal_wa_priority NOT NULL DEFAULT 'normal',
  tags TEXT[] DEFAULT '{}',
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE internal_wa_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins see all internal conversations" ON internal_wa_conversations FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Agents see assigned conversations" ON internal_wa_conversations FOR SELECT TO authenticated USING (assigned_agent_id = auth.uid());
CREATE POLICY "Agents update assigned conversations" ON internal_wa_conversations FOR UPDATE TO authenticated USING (assigned_agent_id = auth.uid());
CREATE POLICY "Service role full access internal_wa_conversations" ON internal_wa_conversations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER set_updated_at_internal_wa_conversations BEFORE UPDATE ON internal_wa_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_internal_wa_conv_contact ON internal_wa_conversations(contact_phone);
CREATE INDEX idx_internal_wa_conv_agent ON internal_wa_conversations(assigned_agent_id);
CREATE INDEX idx_internal_wa_conv_status ON internal_wa_conversations(status);
CREATE INDEX idx_internal_wa_conv_last_msg ON internal_wa_conversations(last_message_at DESC);
CREATE INDEX idx_internal_wa_conv_lead ON internal_wa_conversations(lead_id);

-- 3. Mensagens
CREATE TABLE internal_wa_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES internal_wa_conversations(id) ON DELETE CASCADE,
  twilio_sid TEXT UNIQUE,
  from_number TEXT,
  to_number TEXT,
  direction internal_wa_direction NOT NULL,
  message_type internal_wa_msg_type NOT NULL DEFAULT 'text',
  content TEXT,
  media_urls TEXT[] DEFAULT '{}',
  status internal_wa_msg_status NOT NULL DEFAULT 'sent',
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);
ALTER TABLE internal_wa_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins see all internal messages" ON internal_wa_messages FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Agents see messages in assigned conversations" ON internal_wa_messages FOR SELECT TO authenticated USING (
  conversation_id IN (SELECT id FROM internal_wa_conversations WHERE assigned_agent_id = auth.uid())
);
CREATE POLICY "Agents insert messages in assigned conversations" ON internal_wa_messages FOR INSERT TO authenticated WITH CHECK (
  conversation_id IN (SELECT id FROM internal_wa_conversations WHERE assigned_agent_id = auth.uid())
);
CREATE POLICY "Service role full access internal_wa_messages" ON internal_wa_messages FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_internal_wa_msg_conv ON internal_wa_messages(conversation_id);
CREATE INDEX idx_internal_wa_msg_created ON internal_wa_messages(created_at DESC);
CREATE INDEX idx_internal_wa_msg_agent ON internal_wa_messages(agent_id);

-- 4. Templates internos
CREATE TABLE internal_wa_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category internal_wa_template_cat NOT NULL DEFAULT 'sales',
  body_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE internal_wa_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage internal_wa_templates" ON internal_wa_templates FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Agents can read active templates" ON internal_wa_templates FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Service role full access internal_wa_templates" ON internal_wa_templates FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. Estatísticas por agente
CREATE TABLE internal_wa_agent_stats (
  agent_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  conversations_open INTEGER NOT NULL DEFAULT 0,
  conversations_closed INTEGER NOT NULL DEFAULT 0,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  messages_received INTEGER NOT NULL DEFAULT 0,
  avg_response_time INTERVAL DEFAULT '0 seconds',
  last_activity_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE internal_wa_agent_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins see all agent stats" ON internal_wa_agent_stats FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Agents see own stats" ON internal_wa_agent_stats FOR SELECT TO authenticated USING (agent_id = auth.uid());
CREATE POLICY "Service role full access internal_wa_agent_stats" ON internal_wa_agent_stats FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER set_updated_at_internal_wa_agent_stats BEFORE UPDATE ON internal_wa_agent_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: atualizar last_message_at na conversa ao inserir mensagem
CREATE OR REPLACE FUNCTION internal_wa_update_conv_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE internal_wa_conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_internal_wa_update_last_message
  AFTER INSERT ON internal_wa_messages
  FOR EACH ROW EXECUTE FUNCTION internal_wa_update_conv_last_message();
