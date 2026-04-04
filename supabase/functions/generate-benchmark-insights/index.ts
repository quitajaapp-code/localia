import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

// ---------- helpers ----------

interface CompetitorRow {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  posts_last_30_days: number;
  response_rate: number;
}

interface InsightFromAI {
  insight_type: "gap_rating" | "opportunity_content" | "ad_strategy";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  recommended_action: string;
}

async function callOpenAI(prompt: string, systemPrompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${res.status}: ${text}`);
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "{}";
}

// ---------- main ----------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const businessId = body.business_id as string | undefined;
    if (!businessId) {
      return new Response(JSON.stringify({ error: "business_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Load business data
    const { data: biz, error: bizErr } = await supabase
      .from("businesses")
      .select("id, nome, nicho, cidade, estado")
      .eq("id", businessId)
      .single();
    if (bizErr || !biz) {
      return new Response(JSON.stringify({ error: "Business not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Load business review stats
    const { count: reviewCount } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId);

    const { data: reviewRows } = await supabase
      .from("reviews")
      .select("rating, respondido")
      .eq("business_id", businessId);

    const myRating = reviewRows?.length
      ? reviewRows.reduce((s, r) => s + (r.rating ?? 0), 0) / reviewRows.length
      : 0;
    const myResponseRate = reviewRows?.length
      ? (reviewRows.filter((r) => r.respondido).length / reviewRows.length) * 100
      : 0;

    // 3. Load competitors
    const { data: competitors } = await supabase
      .from("benchmark_competitors")
      .select("id, name, rating, review_count, posts_last_30_days, response_rate")
      .eq("business_id", businessId)
      .eq("is_active", true);

    if (!competitors?.length) {
      return new Response(
        JSON.stringify({ error: "No competitors found. Run fetch-competitor-data first." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const comps = competitors as CompetitorRow[];

    // 4. Calculate averages
    const avg = {
      rating: comps.reduce((s, c) => s + (c.rating ?? 0), 0) / comps.length,
      reviews: comps.reduce((s, c) => s + (c.review_count ?? 0), 0) / comps.length,
      response_rate: comps.reduce((s, c) => s + (c.response_rate ?? 0), 0) / comps.length,
      posts_30d: comps.reduce((s, c) => s + (c.posts_last_30_days ?? 0), 0) / comps.length,
    };

    console.log(`[insights] Business: ${biz.nome} | Rating=${myRating.toFixed(1)}, Reviews=${reviewCount}, ResponseRate=${myResponseRate.toFixed(0)}%`);
    console.log(`[insights] Avg competitors: Rating=${avg.rating.toFixed(1)}, Reviews=${avg.reviews.toFixed(0)}, ResponseRate=${avg.response_rate.toFixed(0)}%`);

    // 5. Build AI prompt
    const systemPrompt = `Você é um especialista em marketing local e SEO para Google Meu Negócio. 
Analise os dados comparativos e retorne um JSON com exatamente 5 insights no formato:
{
  "insights": [
    {
      "insight_type": "gap_rating" | "opportunity_content" | "ad_strategy",
      "severity": "low" | "medium" | "high" | "critical",
      "title": "Título curto do insight",
      "description": "Explicação detalhada do problema ou oportunidade",
      "recommended_action": "Ação prática e específica a ser tomada"
    }
  ]
}
Inclua exatamente 3 pontos fracos (gaps) e 2 oportunidades de crescimento.
Para cada insight, sugira ações práticas de Postagem no GMB ou campanhas Google Ads.
Responda APENAS com o JSON, sem markdown.`;

    const userPrompt = `DADOS DO CLIENTE "${biz.nome}" (${biz.nicho} em ${biz.cidade}/${biz.estado}):
- Nota média: ${myRating.toFixed(1)}
- Total de avaliações: ${reviewCount ?? 0}
- Taxa de resposta: ${myResponseRate.toFixed(0)}%

MÉDIA DOS ${comps.length} CONCORRENTES:
- Nota média: ${avg.rating.toFixed(1)}
- Total de avaliações: ${avg.reviews.toFixed(0)}
- Taxa de resposta: ${avg.response_rate.toFixed(0)}%
- Posts nos últimos 30 dias: ${avg.posts_30d.toFixed(0)}

DETALHES DOS CONCORRENTES:
${comps.map((c) => `- ${c.name}: nota ${c.rating}, ${c.review_count} reviews, ${c.response_rate}% resposta, ${c.posts_last_30_days} posts/30d`).join("\n")}

Gere os 5 insights (3 gaps + 2 oportunidades).`;

    console.log("[insights] Calling OpenAI...");
    const aiResponse = await callOpenAI(userPrompt, systemPrompt);
    const parsed = JSON.parse(aiResponse) as { insights: InsightFromAI[] };

    if (!parsed.insights?.length) {
      throw new Error("AI returned no insights");
    }

    console.log(`[insights] AI returned ${parsed.insights.length} insights`);

    // 6. Save insights
    const dataContext = {
      my: { rating: myRating, reviews: reviewCount, response_rate: myResponseRate },
      avg_competitors: avg,
      competitor_count: comps.length,
    };

    const inserts = parsed.insights.map((ins) => ({
      business_id: businessId,
      insight_type: ins.insight_type,
      severity: ins.severity,
      title: ins.title,
      description: ins.description,
      data_context: dataContext,
      recommended_action: ins.recommended_action,
      status: "new" as const,
    }));

    const { error: insError } = await supabase
      .from("benchmark_insights")
      .insert(inserts);

    if (insError) {
      console.error("[save]", insError);
      throw new Error(`Failed to save insights: ${insError.message}`);
    }

    console.log(`[done] Saved ${inserts.length} insights`);

    return new Response(
      JSON.stringify({ success: true, insights_count: inserts.length, insights: parsed.insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[fatal]", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
