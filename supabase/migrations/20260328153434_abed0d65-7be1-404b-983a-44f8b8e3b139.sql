
-- Pipeline stages
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  ordem INT NOT NULL,
  cor TEXT DEFAULT '#6366F1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO pipeline_stages (nome, slug, ordem, cor) VALUES
  ('Novo Lead',        'novo',        1, '#94A3B8'),
  ('Primeiro Contato', 'contato',     2, '#3B82F6'),
  ('Qualificado',      'qualificado', 3, '#8B5CF6'),
  ('Proposta Enviada', 'proposta',    4, '#F59E0B'),
  ('Ganho',            'ganho',       5, '#22C55E'),
  ('Perdido',          'perdido',     6, '#EF4444')
ON CONFLICT (slug) DO NOTHING;

-- Leads / CRM
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  whatsapp TEXT,
  empresa TEXT,
  nicho TEXT,
  cidade TEXT,
  estado TEXT,
  pipeline_stage TEXT DEFAULT 'novo'
    REFERENCES pipeline_stages(slug) ON UPDATE CASCADE,
  pipeline_order INT DEFAULT 0,
  source TEXT DEFAULT 'manual',
  score INT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  notas TEXT,
  ultimo_contato TIMESTAMPTZ,
  proximo_followup TIMESTAMPTZ,
  valor_estimado DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(pipeline_stage, pipeline_order);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);

-- Conversas (inbox unificado)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  canal TEXT NOT NULL DEFAULT 'whatsapp',
  status TEXT DEFAULT 'aberta',
  assigned_agent TEXT DEFAULT 'sdr',
  subject TEXT,
  contact_name TEXT,
  contact_identifier TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_status
  ON conversations(status, last_message_at DESC);

-- Mensagens
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conv
  ON messages(conversation_id, created_at ASC);

-- RLS
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads            ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage pipeline_stages" ON pipeline_stages
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage leads" ON leads
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage conversations" ON conversations
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage messages" ON messages
  FOR ALL TO authenticated USING (
    conversation_id IN (SELECT id FROM conversations)
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Service role full access leads" ON leads
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access conversations" ON conversations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access messages" ON messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);
