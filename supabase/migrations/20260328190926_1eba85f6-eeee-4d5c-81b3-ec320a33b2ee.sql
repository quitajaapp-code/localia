
CREATE TABLE public.whatsapp_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  categoria text NOT NULL DEFAULT 'geral',
  mensagem text NOT NULL,
  variaveis text[] DEFAULT '{}'::text[],
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage whatsapp_templates" ON public.whatsapp_templates
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role full access whatsapp_templates" ON public.whatsapp_templates
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

INSERT INTO public.whatsapp_templates (nome, categoria, mensagem, variaveis) VALUES
('Boas-vindas', 'onboarding', 'Olá {{nome}}, tudo bem? 👋 Sou da LocalAI e vi que você tem interesse em melhorar a presença digital da {{empresa}}. Posso te ajudar com isso!', '{nome,empresa}'),
('Follow-up 1', 'followup', 'Oi {{nome}}! Passando para saber se conseguiu dar uma olhada na nossa proposta. Fico à disposição para tirar qualquer dúvida! 😊', '{nome}'),
('Follow-up 2', 'followup', 'Olá {{nome}}, tudo certo? Sei que a rotina é corrida, mas não queria deixar passar a oportunidade de ajudar a {{empresa}} a crescer no digital. Podemos conversar rapidinho?', '{nome,empresa}'),
('Agendamento', 'agendamento', 'Oi {{nome}}! 📅 Que tal agendarmos uma conversa rápida de 15 minutos? Posso te mostrar como a {{empresa}} pode aparecer mais no Google. Qual o melhor horário pra você?', '{nome,empresa}'),
('Proposta enviada', 'comercial', 'Olá {{nome}}! Acabei de enviar a proposta personalizada para a {{empresa}} no seu e-mail ({{email}}). Dá uma olhada e me diz o que achou! 🚀', '{nome,empresa,email}'),
('Pós-venda', 'pos-venda', 'Oi {{nome}}! 🎉 Bem-vindo(a) à LocalAI! Estamos muito felizes em ter a {{empresa}} conosco. Em breve você vai começar a ver resultados. Qualquer dúvida, é só chamar!', '{nome,empresa}'),
('Reativação', 'reativacao', 'Olá {{nome}}, tudo bem? Faz um tempo que não conversamos. A {{empresa}} está em {{cidade}} ainda, certo? Temos novidades que podem te interessar! 💡', '{nome,empresa,cidade}'),
('Lembrete reunião', 'agendamento', 'Oi {{nome}}! 🔔 Só passando para lembrar da nossa reunião de hoje. Nos vemos em breve! Qualquer imprevisto, me avisa aqui mesmo.', '{nome}');
