
-- ENUMs
CREATE TYPE whatsapp_connection_status AS ENUM ('pending', 'active', 'suspended', 'disconnected');
CREATE TYPE whatsapp_message_type AS ENUM ('text', 'image', 'video', 'audio', 'document', 'template', 'location', 'contact');
CREATE TYPE whatsapp_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE whatsapp_message_status AS ENUM ('queued', 'sent', 'delivered', 'read', 'failed');
CREATE TYPE whatsapp_template_status AS ENUM ('pending', 'approved', 'rejected');

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. whatsapp_connections
CREATE TABLE whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  twilio_account_sid TEXT,
  twilio_phone_number TEXT,
  twilio_webhook_url TEXT,
  meta_business_id TEXT,
  whatsapp_business_account_id TEXT,
  status whatsapp_connection_status NOT NULL DEFAULT 'pending',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id),
  UNIQUE (twilio_phone_number)
);

ALTER TABLE whatsapp_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own whatsapp_connections" ON whatsapp_connections
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access whatsapp_connections" ON whatsapp_connections
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER set_updated_at_whatsapp_connections
  BEFORE UPDATE ON whatsapp_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_whatsapp_connections_business ON whatsapp_connections(business_id);
CREATE INDEX idx_whatsapp_connections_user ON whatsapp_connections(user_id);
CREATE INDEX idx_whatsapp_connections_status ON whatsapp_connections(status);

-- 2. whatsapp_messages
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES whatsapp_connections(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  twilio_sid TEXT UNIQUE,
  meta_message_id TEXT,
  message_type whatsapp_message_type NOT NULL DEFAULT 'text',
  content TEXT,
  media_urls TEXT[] DEFAULT '{}',
  from_number TEXT,
  to_number TEXT,
  direction whatsapp_direction NOT NULL,
  status whatsapp_message_status NOT NULL DEFAULT 'queued',
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own whatsapp_messages" ON whatsapp_messages
  FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access whatsapp_messages" ON whatsapp_messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_whatsapp_messages_connection ON whatsapp_messages(connection_id);
CREATE INDEX idx_whatsapp_messages_business ON whatsapp_messages(business_id);
CREATE INDEX idx_whatsapp_messages_direction ON whatsapp_messages(direction);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_from ON whatsapp_messages(from_number);
CREATE INDEX idx_whatsapp_messages_to ON whatsapp_messages(to_number);
CREATE INDEX idx_whatsapp_messages_created ON whatsapp_messages(created_at DESC);

-- 3. whatsapp_meta_templates (avoid conflict with existing whatsapp_templates table)
CREATE TABLE whatsapp_meta_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'pt_BR',
  category TEXT NOT NULL DEFAULT 'MARKETING',
  status whatsapp_template_status NOT NULL DEFAULT 'pending',
  header_type TEXT,
  header_content TEXT,
  body_content TEXT NOT NULL,
  footer_content TEXT,
  variables JSONB DEFAULT '[]',
  meta_template_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE whatsapp_meta_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own whatsapp_meta_templates" ON whatsapp_meta_templates
  FOR ALL TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access whatsapp_meta_templates" ON whatsapp_meta_templates
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER set_updated_at_whatsapp_meta_templates
  BEFORE UPDATE ON whatsapp_meta_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_whatsapp_meta_templates_business ON whatsapp_meta_templates(business_id);
CREATE INDEX idx_whatsapp_meta_templates_status ON whatsapp_meta_templates(status);

-- 4. whatsapp_webhook_logs
CREATE TABLE whatsapp_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES whatsapp_connections(id) ON DELETE SET NULL,
  method TEXT,
  url TEXT,
  headers JSONB DEFAULT '{}',
  body JSONB DEFAULT '{}',
  response_status INTEGER,
  response_body JSONB,
  processed BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE whatsapp_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook_logs" ON whatsapp_webhook_logs
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role full access whatsapp_webhook_logs" ON whatsapp_webhook_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_whatsapp_webhook_logs_connection ON whatsapp_webhook_logs(connection_id);
CREATE INDEX idx_whatsapp_webhook_logs_processed ON whatsapp_webhook_logs(processed);
CREATE INDEX idx_whatsapp_webhook_logs_created ON whatsapp_webhook_logs(created_at DESC);
