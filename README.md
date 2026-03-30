# LocalIA — Plataforma de Automação de Marketing Local

SaaS para pequenos negócios automatizarem presença digital: Google Meu Negócio, avaliações, posts, anúncios e WhatsApp.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + ShadCN UI
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Deploy:** Vercel

## Setup Local

```bash
bun install
bun run dev
```

O `.env` é auto-populado pelo Lovable com `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` e `VITE_SUPABASE_PROJECT_ID`.

---

## WhatsApp Integration (Twilio)

### Arquitetura

```
Usuário → Dashboard React → Edge Function (whatsapp-send-message) → Twilio API → WhatsApp
WhatsApp → Twilio Webhook → Edge Function (whatsapp-twilio-webhook) → Supabase DB → Dashboard
```

### Configuração

#### 1. Supabase Secrets

Configure no [Dashboard do Supabase → Settings → Edge Functions](https://supabase.com/dashboard/project/ogyiaxcdqajmoiryatfb/settings/functions):

| Secret | Onde obter |
|--------|-----------|
| `TWILIO_ACCOUNT_SID` | [Twilio Console](https://console.twilio.com/) → Dashboard |
| `TWILIO_AUTH_TOKEN` | Twilio Console → Dashboard |
| `TWILIO_WHATSAPP_NUMBER` | Twilio Console → Phone Numbers (formato: +5511999999999) |

#### 2. Webhook no Twilio

1. Acesse [Twilio Console → Messaging → Settings](https://console.twilio.com/)
2. Em **WhatsApp Sandbox** (dev) ou **Senders** (prod), configure:
   - **When a message comes in:** `https://ogyiaxcdqajmoiryatfb.supabase.co/functions/v1/whatsapp-twilio-webhook`
   - **Status Callback URL:** mesma URL acima
   - **Method:** POST

#### 3. Sandbox (Desenvolvimento)

Para testar sem número aprovado:
1. Acesse [Twilio WhatsApp Sandbox](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
2. Envie o código de join para o número sandbox
3. Configure o webhook URL conforme acima

### Tabelas do Banco

| Tabela | Descrição |
|--------|-----------|
| `whatsapp_connections` | Conexões Twilio por business |
| `whatsapp_messages` | Mensagens enviadas e recebidas |
| `whatsapp_meta_templates` | Templates aprovados pela Meta |
| `whatsapp_webhook_logs` | Log de todas as chamadas webhook |

### Edge Functions

| Função | Descrição |
|--------|-----------|
| `whatsapp-send-message` | Envia mensagens via Twilio API |
| `whatsapp-twilio-webhook` | Recebe mensagens e status callbacks |

### Troubleshooting

| Problema | Solução |
|----------|---------|
| Mensagem não enviada | Verificar secrets no Supabase, checar logs da Edge Function |
| Webhook não recebe | Confirmar URL no Twilio Console, verificar `whatsapp_webhook_logs` |
| Status não atualiza | Configurar Status Callback URL no Twilio |
| Erro 401 no Twilio | Account SID ou Auth Token incorretos |
| Número não alcançável | Verificar se o destinatário enviou join no sandbox |

### Links Úteis

- [Twilio WhatsApp Sandbox](https://www.twilio.com/docs/whatsapp/sandbox)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp/api)
- [Twilio Webhooks](https://www.twilio.com/docs/usage/webhooks)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

## Checklist de Deploy

- [x] Migrations rodadas no Supabase
- [x] Edge Functions deployadas (automático pelo Lovable)
- [ ] Secrets configurados no Supabase (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER)
- [ ] Webhook URL configurada no Twilio Console
- [ ] Número Twilio verificado/aprovado para produção
- [ ] Teste de envio funcionando
- [ ] Teste de recebimento funcionando
