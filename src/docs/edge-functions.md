# Edge Functions — Especificação Completa

## Visão Geral

Todas as Edge Functions estão em `supabase/functions/<nome>/index.ts` e são deployadas automaticamente pelo Lovable.

---

## 1. generate-review-reply

**Arquivo:** `supabase/functions/generate-review-reply/index.ts`
**Já existente ✅**

| Campo | Valor |
|-------|-------|
| **Input** | `{ review_text, rating, business_name, nicho, tom_de_voz, tone }` |
| **Output** | `{ reply, sentiment }` |
| **Secrets** | `LOVABLE_API_KEY` (auto-provisionado) |
| **Modelo IA** | Lovable AI Gateway (`google/gemini-3-flash-preview`) |

Gera resposta contextualizada por rating (1-5★) com tom configurável (empático, profissional, agradecido, firme).

---

## 2. generate-post

**Arquivo:** `supabase/functions/generate-post/index.ts`
**Já existente ✅**

| Campo | Valor |
|-------|-------|
| **Input** | `{ tipo, contexto, business_name, nicho, tom_de_voz }` |
| **Output** | `{ variations: string[] }` |
| **Secrets** | `LOVABLE_API_KEY` |
| **Modelo IA** | Lovable AI Gateway |

Gera 3 variações de post para Google Meu Negócio. Tipos: promocao, dica, novidade, destaque, sazonalidade, generico.

---

## 3. generate-campaign

**Arquivo:** `supabase/functions/generate-campaign/index.ts`
**Já existente ✅**

| Campo | Valor |
|-------|-------|
| **Input** | `{ nicho, cidade, estado, objetivo, verba_mensal, raio, nome_negocio }` |
| **Output** | `{ keywords[], negative_keywords{}, anuncios[], config{} }` |
| **Secrets** | `LOVABLE_API_KEY` |
| **Modelo IA** | Lovable AI Gateway |

Gera campanha completa de Search Ads com keywords, negativas, anúncios e configurações.

---

## 4. create-checkout

**Arquivo:** `supabase/functions/create-checkout/index.ts`
**Já existente ✅**

| Campo | Valor |
|-------|-------|
| **Input** | `{ plan_id, email, annual? }` |
| **Output** | `{ url }` |
| **Secrets** | `STRIPE_SECRET_KEY` |

Cria sessão Stripe Checkout com trial de 14 dias. Planos: `price_presenca`, `price_ads`, `price_agencia`.

---

## 5. stripe-webhook

**Arquivo:** `supabase/functions/stripe-webhook/index.ts`
**Novo 🆕**

| Campo | Valor |
|-------|-------|
| **Input** | Stripe webhook payload (POST) |
| **Output** | `{ received: true }` |
| **Secrets** | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |

### Eventos tratados:

| Evento | Ação |
|--------|------|
| `checkout.session.completed` | Ativa plano no `profiles`, salva `stripe_customer_id` |
| `customer.subscription.updated` | Atualiza plano conforme novo price ID |
| `customer.subscription.deleted` | Downgrade para `free` |
| `invoice.payment_failed` | Marca como `inadimplente` |

### Configuração no Stripe:
1. Dashboard Stripe → Developers → Webhooks
2. URL: `https://ogyiaxcdqajmoiryatf000as.supabase.co/functions/v1/stripe-webhook`
3. Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

---

## 6. create-portal-session

**Arquivo:** `supabase/functions/create-portal-session/index.ts`
**Novo 🆕**

| Campo | Valor |
|-------|-------|
| **Input** | Auth header (JWT do usuário) |
| **Output** | `{ url }` |
| **Secrets** | `STRIPE_SECRET_KEY` |

Busca `stripe_customer_id` do perfil do usuário e cria sessão do Stripe Customer Portal para gerenciamento de assinatura.

---

## 7. gmb-sync

**Arquivo:** `supabase/functions/gmb-sync/index.ts`
**Novo 🆕**

| Campo | Valor |
|-------|-------|
| **Trigger** | `pg_cron` a cada 30 minutos |
| **Output** | `{ results: [{ business_id, status, reviews_added }] }` |
| **Secrets** | Tokens OAuth lidos da tabela `oauth_tokens` |

### Processo:
1. Lista todos os businesses com `gmb_location_id` não nulo
2. Para cada business, busca token OAuth do usuário
3. Faz refresh do token se expirado
4. Busca avaliações via Google My Business API
5. Insere novas avaliações na tabela `reviews`
6. Salva snapshot em `gmb_snapshots`

---

## 8. publish-scheduled-posts

**Arquivo:** `supabase/functions/publish-scheduled-posts/index.ts`
**Novo 🆕**

| Campo | Valor |
|-------|-------|
| **Trigger** | `pg_cron` a cada hora |
| **Output** | `{ results: [{ post_id, status }], count }` |
| **Secrets** | Tokens OAuth lidos da tabela `oauth_tokens` |

### Processo:
1. Busca posts com `status='agendado'` e `agendado_para <= now()`
2. Para cada post, busca token OAuth do business owner
3. Publica via Google My Business API (`localPosts`)
4. Atualiza status para `publicado` (com `gmb_post_id`) ou `erro`

---

## Secrets Necessários

| Secret | Onde configurar | Usado por |
|--------|----------------|-----------|
| `LOVABLE_API_KEY` | Auto-provisionado ✅ | generate-review-reply, generate-post, generate-campaign |
| `STRIPE_SECRET_KEY` | Supabase Dashboard → Settings → Edge Functions | create-checkout, stripe-webhook, create-portal-session |
| `STRIPE_WEBHOOK_SECRET` | Supabase Dashboard → Settings → Edge Functions | stripe-webhook |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provisionado ✅ | stripe-webhook, gmb-sync, publish-scheduled-posts |

---

## SQL para pg_cron

> Executar no SQL Editor do Supabase (não via migration):

```sql
-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Sync GMB a cada 30 minutos
SELECT cron.schedule(
  'gmb-sync-every-30min',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ogyiaxcdqajmoiryatfb.supabase.co/functions/v1/gmb-sync',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neWlheGNkcWFqbW9pcnlhdGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTQyODIsImV4cCI6MjA5MDEzMDI4Mn0.CJsjo1hxhjDZVqQjkJJwqG-jHi3l8Yt9swdgI8rDPxo"}'::jsonb,
    body := concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);

-- Publicar posts agendados a cada hora
SELECT cron.schedule(
  'publish-posts-every-hour',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ogyiaxcdqajmoiryatfb.supabase.co/functions/v1/publish-scheduled-posts',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neWlheGNkcWFqbW9pcnlhdGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTQyODIsImV4cCI6MjA5MDEzMDI4Mn0.CJsjo1hxhjDZVqQjkJJwqG-jHi3l8Yt9swdgI8rDPxo"}'::jsonb,
    body := concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);
```

---

## Instruções de Deploy

As Edge Functions são deployadas **automaticamente** pelo Lovable ao salvar os arquivos em `supabase/functions/`.

Para configuração manual:
1. Adicione os secrets no [Dashboard do Supabase → Settings → Edge Functions](https://supabase.com/dashboard/project/ogyiaxcdqajmoiryatfb/settings/functions)
2. Configure o webhook do Stripe apontando para a URL da função `stripe-webhook`
3. Execute o SQL do `pg_cron` no [SQL Editor](https://supabase.com/dashboard/project/ogyiaxcdqajmoiryatfb/sql/new)
