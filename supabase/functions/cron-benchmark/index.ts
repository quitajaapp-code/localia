/**
 * cron-benchmark — Orquestrador semanal de Benchmark Competitivo
 *
 * Agendado via pg_cron (toda segunda-feira às 02:00 AM).
 * Para cada negócio ativo com gmb_location_id, executa:
 *   1. fetch-competitor-data (atualiza concorrentes)
 *   2. generate-benchmark-insights (gera insights com IA)
 *
 * Logs disponíveis em:
 *   https://supabase.com/dashboard/project/ogyiaxcdqajmoiryatfb/functions/cron-benchmark/logs
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

interface BusinessRow {
  id: string;
  nome: string;
}

interface Result {
  business_id: string;
  business_name: string;
  status: "success" | "error";
  competitors?: number;
  insights?: number;
  error?: string;
}

async function invokeFunction(functionName: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${functionName} ${res.status}: ${text}`);
  }

  return res.json();
}

async function processBusiness(biz: BusinessRow): Promise<Result> {
  try {
    console.log(`[cron-benchmark] Processing "${biz.nome}" (${biz.id})`);

    // Step 1: Refresh competitor data
    const compResult = await invokeFunction("fetch-competitor-data", { business_id: biz.id }) as { competitors?: unknown[] };
    const competitorCount = compResult?.competitors?.length ?? 0;
    console.log(`[cron-benchmark] "${biz.nome}": ${competitorCount} competitors updated`);

    // Step 2: Generate insights
    const insResult = await invokeFunction("generate-benchmark-insights", { business_id: biz.id }) as { insights_count?: number };
    const insightsCount = insResult?.insights_count ?? 0;
    console.log(`[cron-benchmark] "${biz.nome}": ${insightsCount} insights generated`);

    return {
      business_id: biz.id,
      business_name: biz.nome,
      status: "success",
      competitors: competitorCount,
      insights: insightsCount,
    };
  } catch (err) {
    console.error(`[cron-benchmark] Error for "${biz.nome}":`, err);
    return {
      business_id: biz.id,
      business_name: biz.nome,
      status: "error",
      error: String(err),
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    console.log("[cron-benchmark] Starting weekly benchmark run...");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all active businesses with GMB location
    const { data: businesses, error: bizErr } = await supabase
      .from("businesses")
      .select("id, nome")
      .not("gmb_location_id", "is", null);

    if (bizErr) throw new Error(`Failed to fetch businesses: ${bizErr.message}`);

    if (!businesses?.length) {
      console.log("[cron-benchmark] No businesses with gmb_location_id found.");
      return new Response(
        JSON.stringify({ total: 0, success: 0, errors: 0, details: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[cron-benchmark] Found ${businesses.length} businesses to process`);

    // Process all businesses in parallel (non-blocking)
    const settled = await Promise.allSettled(
      businesses.map((biz) => processBusiness(biz))
    );

    const details: Result[] = settled.map((s) =>
      s.status === "fulfilled"
        ? s.value
        : { business_id: "unknown", business_name: "unknown", status: "error" as const, error: String(s.reason) }
    );

    const successCount = details.filter((d) => d.status === "success").length;
    const errorCount = details.filter((d) => d.status === "error").length;

    console.log(`[cron-benchmark] Done. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({ total: businesses.length, success: successCount, errors: errorCount, details }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[cron-benchmark] Fatal:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
