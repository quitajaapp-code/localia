import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { nicho, cidade, estado, objetivo, verba_mensal, raio, nome_negocio } = await req.json();

    const orcamentoDiario = (verba_mensal / 30).toFixed(2);

    const systemPrompt = `Você é um gestor de tráfego especialista em Google Ads para negócios locais brasileiros.
Gere uma campanha completa de Search Ads baseada nas informações fornecidas.

RETORNE EXATAMENTE um JSON válido com esta estrutura (sem markdown, sem texto adicional):
{
  "keywords": [
    { "termo": "string", "match_type": "exact|phrase|broad", "volume_estimado": number, "cpc_estimado": number, "intencao": "alta|moderada|branding" }
  ],
  "negative_keywords": {
    "pesquisa": { "explicacao": "string", "termos": ["string"] },
    "emprego": { "explicacao": "string", "termos": ["string"] },
    "educacional": { "explicacao": "string", "termos": ["string"] },
    "nao_local": { "explicacao": "string", "termos": ["string"] }
  },
  "anuncios": [
    {
      "headlines": ["string (max 30 chars each, 15 headlines)"],
      "descriptions": ["string (max 90 chars each, 4 descriptions)"]
    }
  ],
  "config": {
    "tipo": "Search Campaign",
    "orcamento_diario": number,
    "estrategia_lance": "Maximizar cliques",
    "idioma": "Português",
    "localizacao": "string"
  }
}

Regras:
- Gere 25-30 keywords relevantes para o nicho e região
- Gere 30-40 negative keywords distribuídas nas 4 categorias
- Crie 3 anúncios com 15 headlines e 4 descriptions cada
- Headlines devem ter NO MÁXIMO 30 caracteres
- Descriptions devem ter NO MÁXIMO 90 caracteres
- Inclua o nome do negócio em algumas headlines
- Para objetivo "${objetivo}", foque em CTAs relevantes
- CPC estimado deve ser realista para o Brasil
- Volume estimado mensal deve ser plausível para a região`;

    const userPrompt = `Crie uma campanha completa para:
- Negócio: ${nome_negocio || "Negócio local"}
- Nicho: ${nicho || "Serviços gerais"}
- Cidade: ${cidade || "São Paulo"}, ${estado || "SP"}
- Objetivo: ${objetivo}
- Verba mensal: R$${verba_mensal}
- Orçamento diário: R$${orcamentoDiario}
- Raio de atuação: ${raio}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    const campaign = JSON.parse(content);

    return new Response(JSON.stringify(campaign), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-campaign error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
