/**
 * WEEKLY REPORT SENDER
 * Compiles weekly metrics (GMB + Ads + Reviews) and sends a formatted
 * summary via WhatsApp (Twilio Gateway) to each business owner.
 * 
 * Trigger: pg_cron — once per week (e.g. Monday 9am).
 * Can also be called manually with { business_id } in the body.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("pt-BR");
}

function formatCurrency(n: number | null | undefined): string {
  if (n == null) return "—";
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

function buildReportText(biz: { nome: string }, gmb: Record<string, number | null>, ads: Record<string, number | null>, reviews: { total: number; avg: number; newCount: number; pending: number }): string {
  const lines: string[] = [];
  lines.push(`📊 *Relatório Semanal — ${biz.nome}*`);
  lines.push("");

  // GMB section
  lines.push("🗺️ *Google Meu Negócio*");
  lines.push(`  Visualizações Busca: ${formatNumber(gmb.views_busca)}`);
  lines.push(`  Visualizações Maps: ${formatNumber(gmb.views_maps)}`);
  lines.push(`  Cliques no site: ${formatNumber(gmb.cliques_site)}`);
  lines.push(`  Ligações: ${formatNumber(gmb.ligacoes)}`);
  lines.push(`  Rotas traçadas: ${formatNumber(gmb.rotas)}`);
  lines.push("");

  // Reviews section
  lines.push("⭐ *Avaliações*");
  lines.push(`  Nota média: ${reviews.avg.toFixed(1)}`);
  lines.push(`  Novas esta semana: ${reviews.newCount}`);
  lines.push(`  Aguardando resposta: ${reviews.pending}`);
  lines.push(`  Total acumulado: ${reviews.total}`);
  lines.push("");

  // Ads section (only if there's data)
  if (ads.impressoes || ads.cliques) {
    lines.push("📣 *Google Ads*");
    lines.push(`  Impressões: ${formatNumber(ads.impressoes)}`);
    lines.push(`  Cliques: ${formatNumber(ads.cliques)}`);
    lines.push(`  CTR: ${ads.ctr != null ? (ads.ctr * 100).toFixed(1) + "%" : "—"}`);
    lines.push(`  Gasto: ${formatCurrency(ads.gasto_total)}`);
    lines.push(`  Conversões: ${formatNumber(ads.conversoes)}`);
    lines.push("");
  }

  lines.push("_Gerado automaticamente pelo LocalAI_");
  lines.push("Acesse o painel para detalhes completos.");
  return lines.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
  const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

  try {
    const body = await req.json().catch(() => ({}));
    const targetBusinessId: string | undefined = body.business_id;

    // Get businesses with WhatsApp configured
    let query = supabase
      .from("businesses")
      .select("id, nome, user_id, whatsapp")
      .not("whatsapp", "is", null);

    if (targetBusinessId) {
      query = query.eq("id", targetBusinessId);
    }

    const { data: businesses } = await query;
    if (!businesses?.length) {
      return new Response(JSON.stringify({ message: "No businesses with WhatsApp" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const results: Array<{ business_id: string; status: string; detail?: string }> = [];

    for (const biz of businesses) {
      try {
        // 1. GMB metrics (latest week)
        const { data: gmbRows } = await supabase
          .from("gmb_metrics")
          .select("views_busca, views_maps, cliques_site, ligacoes, rotas")
          .eq("business_id", biz.id)
          .gte("created_at", oneWeekAgo)
          .order("created_at", { ascending: false })
          .limit(1);

        const gmb = gmbRows?.[0] || { views_busca: null, views_maps: null, cliques_site: null, ligacoes: null, rotas: null };

        // 2. Reviews summary
        const { count: totalReviews } = await supabase
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .eq("business_id", biz.id);

        const { data: avgRow } = await supabase
          .from("reviews")
          .select("rating")
          .eq("business_id", biz.id);
        const avgRating = avgRow?.length
          ? avgRow.reduce((s, r) => s + (r.rating || 0), 0) / avgRow.length
          : 0;

        const { count: newReviews } = await supabase
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .eq("business_id", biz.id)
          .gte("created_at", oneWeekAgo);

        const { count: pendingReviews } = await supabase
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .eq("business_id", biz.id)
          .eq("respondido", false);

        // 3. Ads metrics (latest week)
        const { data: adsRows } = await supabase
          .from("ads_metrics")
          .select("impressoes, cliques, ctr, gasto_total, conversoes")
          .eq("business_id", biz.id)
          .gte("created_at", oneWeekAgo)
          .order("created_at", { ascending: false })
          .limit(1);

        const ads = adsRows?.[0] || { impressoes: null, cliques: null, ctr: null, gasto_total: null, conversoes: null };

        // Build report text
        const reportText = buildReportText(
          biz,
          gmb as Record<string, number | null>,
          ads as Record<string, number | null>,
          {
            total: totalReviews || 0,
            avg: avgRating,
            newCount: newReviews || 0,
            pending: pendingReviews || 0,
          },
        );

        // Send via WhatsApp (Twilio Gateway)
        if (!LOVABLE_API_KEY || !TWILIO_API_KEY) {
          // Fallback: log report, cannot send
          console.log(`[weekly-report] No Twilio gateway keys. Report for ${biz.nome}:\n${reportText}`);
          results.push({ business_id: biz.id, status: "logged_no_twilio", detail: "Keys not configured" });
          continue;
        }

        let whatsappNumber = biz.whatsapp!.replace(/\D/g, "");
        if (!whatsappNumber.startsWith("+")) {
          whatsappNumber = whatsappNumber.startsWith("55")
            ? `+${whatsappNumber}`
            : `+55${whatsappNumber}`;
        }

        const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": TWILIO_API_KEY,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: `whatsapp:${whatsappNumber}`,
            From: Deno.env.get("TWILIO_WHATSAPP_FROM") || "whatsapp:+14155238886",
            Body: reportText,
          }),
        });

        if (response.ok) {
          results.push({ business_id: biz.id, status: "sent" });
        } else {
          const errText = await response.text();
          console.error(`[weekly-report] WhatsApp send failed for ${biz.id}:`, errText);
          results.push({ business_id: biz.id, status: "send_failed", detail: errText.slice(0, 200) });
        }
      } catch (err) {
        console.error(`[weekly-report] Error for ${biz.id}:`, err);
        results.push({ business_id: biz.id, status: "error", detail: String(err).slice(0, 200) });
      }
    }

    return new Response(JSON.stringify({ sent: results.filter(r => r.status === "sent").length, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weekly-report-sender error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
