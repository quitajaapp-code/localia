/**
 * AGENTE DE ADS — Multi-Agent Router
 * Roteia entre StrategyAgent, KeywordAgent, AdCopyAgent e OptimizationAgent.
 * Aplica validação JSON robusta em todas as respostas.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

/**
 * Safely extracts and parses JSON from AI response content.
 * Handles markdown code blocks, trailing text, and malformed responses.
 */
function safeParseJSON(content: string): Record<string, unknown> {
  if (!content || !content.trim()) return {};

  let cleaned = content.trim();

  // Remove markdown code fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try extracting first JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // noop
      }
    }
  }

  return {};
}

async function callAI(systemPrompt: string, userPrompt: string, apiKey: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 4000,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI gateway error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  return safeParseJSON(content);
}

// Schema validators per agent type
function validateStrategyOutput(data: Record<string, unknown>) {
  const defaults = {
    urgency_level: "medium",
    search_intent: "transactional",
    campaign_type: "search",
    bidding_strategy: "maximize_clicks",
    geo_radius_km: 10,
    conversion_focus: "calls",
    risk_level: "medium",
    reasoning: "",
    schedule: "Seg-Sex 8h-18h",
    budget_split: { main_pct: 70, local_pct: 30, remarketing_pct: 0 },
  };
  return { ...defaults, ...data };
}

function validateKeywordsOutput(data: Record<string, unknown>) {
  return {
    high_intent_keywords: Array.isArray(data.high_intent_keywords) ? data.high_intent_keywords : [],
    negative_keywords: data.negative_keywords && typeof data.negative_keywords === "object"
      ? data.negative_keywords
      : { employment: [], diy_educational: [], out_of_region: [], unrealistic_price: [], competitors: [] },
  };
}

function validateAdCopyOutput(data: Record<string, unknown>) {
  const ads = Array.isArray(data.ads) ? data.ads : [];
  return {
    ads: ads.map((ad: any) => ({
      headline1: String(ad.headline1 || "").slice(0, 30),
      headline2: String(ad.headline2 || "").slice(0, 30),
      headline3: String(ad.headline3 || "").slice(0, 30),
      description: String(ad.description || "").slice(0, 90),
      targeting_rationale: ad.targeting_rationale || "",
    })),
  };
}

function validateOptimizationOutput(data: Record<string, unknown>) {
  return {
    additional_actions: Array.isArray(data.additional_actions) ? data.additional_actions : [],
    roi_assessment: String(data.roi_assessment || ""),
    summary: String(data.summary || ""),
  };
}

const VALIDATORS: Record<string, (data: Record<string, unknown>) => unknown> = {
  strategy: validateStrategyOutput,
  keywords: validateKeywordsOutput,
  adcopy: validateAdCopyOutput,
  optimization: validateOptimizationOutput,
};

async function handleAgentRequest(body: any, apiKey: string) {
  const { agent_type, system_prompt, user_prompt } = body;

  if (!system_prompt || !user_prompt) {
    return new Response(JSON.stringify({ error: "system_prompt and user_prompt are required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const parsed = await callAI(system_prompt, user_prompt, apiKey);
  const validator = VALIDATORS[agent_type];
  const validated = validator ? validator(parsed) : parsed;

  return new Response(JSON.stringify(validated), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ===== Legacy =====

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
  "resumo": { "investimento_mensal": ${verba_mensal}, "orcamento_diario": ${orcamentoDiario}, "cliques_estimados_mes": 0, "contatos_estimados_mes": 0, "cpa_estimado": "R$0", "roi_estimado": "" },
  "estrutura": { "campanha_principal": { "nome": "", "orcamento_pct": 60, "estrategia": "", "rede": "Search" }, "campanha_local": { "nome": "", "orcamento_pct": 30, "estrategia": "", "rede": "Search" } },
  "keywords_positivas": [],
  "keywords_negativas": { "emprego": [], "diy_educacional": [], "fora_da_regiao": [], "preco_irrealista": [], "concorrentes": [] },
  "anuncios": [],
  "extensoes": { "sitelinks": [], "chamada": { "numero": "${whatsapp || ""}", "horario": "Seg-Sáb 8h-18h" }, "localizacao": "" },
  "otimizacoes_semana_1": [],
  "alertas_para_monitorar": []
}`;

  const parsed = await callAI(LEGACY_SYSTEM_PROMPT, userPrompt, apiKey);

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
      const kws = (parsed.keywords_positivas as any[]).slice(0, 30).map((k: any) => ({
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
          roi_estimado: (parsed as any).resumo?.roi_estimado,
        },
      });
    }
  }

  return new Response(JSON.stringify(parsed), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
