-- Seed data para desenvolvimento local
-- Execute no SQL Editor do Supabase para dados de teste

-- Nota: Substitua os UUIDs abaixo por IDs reais do seu ambiente

-- Conexão WhatsApp mock (requer business_id e user_id válidos)
-- Descomente e ajuste os IDs conforme necessário:

/*
INSERT INTO whatsapp_connections (id, business_id, user_id, twilio_account_sid, twilio_phone_number, twilio_webhook_url, status)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '<SEU_BUSINESS_ID>',
  '<SEU_USER_ID>',
  'AC_test_sandbox',
  '+14155238886',
  'https://ogyiaxcdqajmoiryatfb.supabase.co/functions/v1/whatsapp-twilio-webhook',
  'active'
);

-- 10 mensagens de exemplo
INSERT INTO whatsapp_messages (connection_id, business_id, twilio_sid, from_number, to_number, content, message_type, direction, status, created_at) VALUES
('a0000000-0000-0000-0000-000000000001', '<SEU_BUSINESS_ID>', 'SM_test_001', '5511999990001', '14155238886', 'Olá, gostaria de saber o horário de funcionamento', 'text', 'inbound', 'delivered', now() - interval '2 hours'),
('a0000000-0000-0000-0000-000000000001', '<SEU_BUSINESS_ID>', 'SM_test_002', '14155238886', '5511999990001', 'Olá! Funcionamos de seg a sex, das 9h às 18h. Posso ajudar em algo mais?', 'text', 'outbound', 'read', now() - interval '1 hour 55 minutes'),
('a0000000-0000-0000-0000-000000000001', '<SEU_BUSINESS_ID>', 'SM_test_003', '5511999990001', '14155238886', 'Vocês fazem delivery?', 'text', 'inbound', 'delivered', now() - interval '1 hour 50 minutes'),
('a0000000-0000-0000-0000-000000000001', '<SEU_BUSINESS_ID>', 'SM_test_004', '14155238886', '5511999990001', 'Sim! Fazemos delivery em um raio de 10km. O pedido mínimo é R$30.', 'text', 'outbound', 'delivered', now() - interval '1 hour 45 minutes'),
('a0000000-0000-0000-0000-000000000001', '<SEU_BUSINESS_ID>', 'SM_test_005', '5511999990002', '14155238886', 'Boa tarde! Quais formas de pagamento vocês aceitam?', 'text', 'inbound', 'delivered', now() - interval '1 hour'),
('a0000000-0000-0000-0000-000000000001', '<SEU_BUSINESS_ID>', 'SM_test_006', '14155238886', '5511999990002', 'Aceitamos PIX, cartão de crédito/débito e dinheiro.', 'text', 'outbound', 'sent', now() - interval '55 minutes'),
('a0000000-0000-0000-0000-000000000001', '<SEU_BUSINESS_ID>', 'SM_test_007', '5511999990003', '14155238886', 'Tem promoção essa semana?', 'text', 'inbound', 'delivered', now() - interval '30 minutes'),
('a0000000-0000-0000-0000-000000000001', '<SEU_BUSINESS_ID>', 'SM_test_008', '14155238886', '5511999990003', '🎉 Sim! Essa semana temos 20% de desconto em todos os serviços. Use o código PROMO20!', 'text', 'outbound', 'delivered', now() - interval '25 minutes'),
('a0000000-0000-0000-0000-000000000001', '<SEU_BUSINESS_ID>', 'SM_test_009', '5511999990001', '14155238886', 'Obrigado pelas informações!', 'text', 'inbound', 'delivered', now() - interval '10 minutes'),
('a0000000-0000-0000-0000-000000000001', '<SEU_BUSINESS_ID>', 'SM_test_010', '14155238886', '5511999990001', 'Por nada! Qualquer dúvida estamos à disposição 😊', 'text', 'outbound', 'queued', now() - interval '5 minutes');
*/
