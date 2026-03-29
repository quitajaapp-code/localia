/**
 * ADS-LAUNCHER
 * Prepara e "lança" uma campanha — salva tudo no Supabase
 * e registra logs. Quando a API do Google Ads estiver disponível,
 * este será o ponto de integração.
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

  try {
    const { campaign_id } = await req.json();
    if (!campaign_id) throw new Error("campaign_id é obrigatório");

    // Get campaign
    const { data: campaign, error: campErr } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaign_id)
      .single();

    if (campErr || !campaign) throw new Error("Campanha não encontrada");

    // Validate: must have keywords and ads
    const { count: kwCount } = await supabase
      .from("keywords").select("*", { count: "exact", head: true }).eq("campaign_id", campaign_id);
    const { count: adCount } = await supabase
      .from("ads").select("*", { count: "exact", head: true }).eq("campaign_id", campaign_id);

    if (!kwCount || kwCount === 0) throw new Error("Campanha sem keywords. Adicione palavras-chave antes de lançar.");
    if (!adCount || adCount === 0) throw new Error("Campanha sem anúncios. Crie anúncios antes de lançar.");

    // Budget safety check
    const budgetDaily = campaign.budget_daily || (campaign.verba_mensal / 30);
    if (budgetDaily > 500) throw new Error("Orçamento diário acima do limite de segurança (R$500/dia)");

    // Activate campaign
    await supabase.from("campaigns").update({ status: "ativa" }).eq("id", campaign_id);

    // Activate all ads
    await supabase.from("ads").update({ status: "ativo" }).eq("campaign_id", campaign_id);

    // Log
    await supabase.from("ad_logs").insert({
      campaign_id,
      action: "campaign_launched",
      agent: "ads-launcher",
      payload: { keywords: kwCount, ads: adCount, budget_daily: budgetDaily },
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Campanha lançada com sucesso",
      keywords: kwCount,
      ads: adCount,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
