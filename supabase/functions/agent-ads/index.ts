/**
 * AGENTE DE ADS — Multi-Agent Router
 * Roteia entre StrategyAgent, KeywordAgent, AdCopyAgent e OptimizationAgent.
 * Também suporta o fluxo legado de geração completa.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LEGACY_SYSTEM_PROMPT = `Você é o Agente de Ads do LocalAI — gestor de tráfego sênior especialista em Google Ads para negócios locais brasileiros.

MISSÃO: Cada real investido deve gerar contatos qualificados (ligações, WhatsApp, visitas à loja).

PRINCÍPIOS DE CAMPANHA LOCAL:
1. INTENÇÃO é tudo: keywords com "perto de mim", "em [cidade]", "bairro", "zona" têm CPA menor
2. HORA IMPORTA: para a maioria dos negócios locais, 7h-19h nos dias úteis converte melhor
3. MATCH TYPE: sempre começar com Exact e Phrase — Broad desperdiça verba em negócios pequenos
4. NEGATIVOS SÃO LUCRO: bloquear emprego, DIY, conteúdo educacional pode reduzir CPA em 40%
5. EXTENSÕES SÃO OBRIGATÓRIAS: Localização, Chamada e Sitelinks aumentam CTR em ~25%

COPYWRITING PARA ADS LOCAIS:
- Headlines: inclua cidade/bairro em pelo menos 3 headlines
- Headlines: use números reais quando possível: "Desde 2015", "+500 clientes", "Em 48h"
- Headlines: CTA nos últimos 3: "Ligue Agora", "WhatsApp 24h", "Agende Online"
- Descriptions: benefício principal + diferencial + CTA com urgência
- Máx 30 chars por headline (HARD LIMIT do Google)
- Máx 90 chars por description (HARD LIMIT do Google)`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

  try {
    const body = await req.json();
    
    // New multi-agent routing
    if (body.agent_type) {
      return await handleAgentRequest(body, LOVABLE_API_KEY);
    }

    // Legacy full campaign generation
    return await handleLegacyCampaign(body, supabase, LOVABLE_API_KEY);
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleAgentRequest(body: any, apiKey: string) {
  const { system_prompt, user_prompt } = body;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: system_prompt },
        { role: "user", content: user_prompt },
      ],
      temperature: 0.2,
      max_tokens: 4000,
    }),
  });

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());

  return new Response(JSON.stringify(parsed), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleLegacyCampaign(body: any, supabase: any, apiKey: string) {
  const {
    business_id, nome, nicho, cidade, estado, whatsapp, website_url,
    verba_mensal, objetivo, raio, produtos, diferenciais, anos_experiencia,
  } = body;

  const orcamentoDiario = (verba_mensal / 30).toFixed(2);
  const cpcEstimado = verba_mensal <= 500 ? "R$1-3" : verba_mensal <= 1500 ? "R$2-6" : "R$4-10";

  const userPrompt = `Crie uma campanha Google Ads completa para:

NEGÓCIO:
Nome: ${nome}
Nicho: ${nicho}
Cidade: ${cidade}, ${estado}
Anos de experiência: ${anos_experiencia || "não informado"}
Produtos/Serviços principais: ${produtos || "não especificado"}
Diferenciais: ${diferenciais || "não especificado"}
WhatsApp: ${whatsapp ? "sim" : "não"}
Website: ${website_url ? "sim" : "não"}

CAMPANHA:
Objetivo: ${objetivo || "ligações e WhatsApp"}
Verba mensal: R$${verba_mensal}
Orçamento diário: R$${orcamentoDiario}
Raio de atuação: ${raio || "10km"}
CPC estimado para o nicho: ${cpcEstimado}

RETORNE EXATAMENTE este JSON (sem markdown):
{
  "resumo": {
    "investimento_mensal": ${verba_mensal},
    "orcamento_diario": ${orcamentoDiario},
    "cliques_estimados_mes": 0,
    "contatos_estimados_mes": 0,
    "cpa_estimado": "R$0",
    "roi_estimado": "Para cada R$1 investido, estimativa de R$X em valor"
  },
  "estrutura": {
    "campanha_principal": {
      "nome": "${nome} — Serviços Principais",
      "orcamento_pct": 60,
      "estrategia": "Maximizar Conversões",
      "rede": "Search apenas"
    },
    "campanha_local": {
      "nome": "${nome} — ${cidade}",
      "orcamento_pct": 30,
      "estrategia": "Maximizar Cliques",
      "rede": "Search apenas"
    }
  },
  "keywords_positivas": [],
  "keywords_negativas": { "emprego": [], "diy_educacional": [], "fora_da_regiao": [], "preco_irrealista": [], "concorrentes": [] },
  "anuncios": [],
  "extensoes": {
    "sitelinks": [],
    "chamada": { "numero": "${whatsapp || "a preencher"}", "horario": "Segunda a Sábado, 8h-18h" },
    "localizacao": "Ativar extensão de localização para mostrar endereço"
  },
  "otimizacoes_semana_1": [],
  "alertas_para_monitorar": []
}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: LEGACY_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 4000,
    }),
  });

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());

  if (business_id && parsed.keywords_positivas) {
    let { data: campaign } = await supabase
      .from("campaigns")
      .select("id")
      .eq("business_id", business_id)
      .eq("status", "rascunho")
      .limit(1)
      .maybeSingle();

    if (!campaign) {
      const { data: newCamp } = await supabase.from("campaigns").insert({
        business_id,
        nome: `${nome} — Campanha IA`,
        status: "rascunho",
        tipo: "search",
        verba_mensal,
        verba_restante: verba_mensal,
      }).select("id").single();
      campaign = newCamp;
    }

    if (campaign?.id) {
      const kws = parsed.keywords_positivas.slice(0, 30).map((k: any) => ({
        campaign_id: campaign!.id,
        termo: k.termo,
        match_type: k.match_type,
        status: "ativa",
      }));
      if (kws.length) await supabase.from("keywords").insert(kws);

      const negKws = Object.values(parsed.keywords_negativas || {})
        .flat()
        .slice(0, 50)
        .map((k: any) => ({
          campaign_id: campaign!.id,
          termo: String(k),
          match_type: "broad",
        }));
      if (negKws.length) await supabase.from("negative_keywords").insert(negKws);

      await supabase.from("agent_actions").insert({
        business_id,
        agent: "ads",
        action_type: "campaign_created",
        status: "pending",
        output_data: {
          campaign_id: campaign.id,
          keywords_count: kws.length,
          negative_count: negKws.length,
          roi_estimado: parsed.resumo?.roi_estimado,
        },
      });
    }
  }

  return new Response(JSON.stringify(parsed), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
