/**
 * Edge Function: Execute Stage Actions
 * Executa as ações automáticas configuradas quando um lead entra em uma etapa.
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
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  try {
    const { lead_id, stage_slug } = await req.json();

    if (!lead_id || !stage_slug) {
      return new Response(
        JSON.stringify({ error: "lead_id e stage_slug são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Busca o lead
    const { data: lead } = await supabase.from("leads").select("*").eq("id", lead_id).single();
    if (!lead) throw new Error("Lead não encontrado");

    // Busca o stage
    const { data: stage } = await supabase
      .from("pipeline_stages")
      .select("*")
      .eq("slug", stage_slug)
      .single();
    if (!stage) throw new Error("Stage não encontrado");

    // Busca ações ativas do stage, ordenadas
    const { data: actions } = await supabase
      .from("stage_actions")
      .select("*")
      .eq("stage_id", stage.id)
      .eq("ativo", true)
      .order("ordem");

    if (!actions || actions.length === 0) {
      return new Response(
        JSON.stringify({ message: "Nenhuma ação configurada para este estágio" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const results: any[] = [];

    for (const action of actions) {
      // Registra execução
      const { data: execution } = await supabase.from("action_executions").insert({
        action_id: action.id,
        lead_id,
        status: "running",
      }).select().single();

      try {
        // Delay
        if (action.delay_minutos > 0) {
          await new Promise((r) => setTimeout(r, Math.min(action.delay_minutos * 60000, 30000)));
        }

        let resultado: any = {};

        switch (action.tipo) {
          case "send_whatsapp": {
            const phone = lead.whatsapp || lead.telefone;
            if (!phone) {
              resultado = { skipped: true, reason: "Lead sem WhatsApp/telefone" };
              break;
            }
            const msg = replaceVars(action.config.message || "", lead);
            const res = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-send`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ phone, message: msg }),
            });
            resultado = await res.json();
            break;
          }

          case "move_stage": {
            const targetStage = action.config.target_stage;
            if (targetStage) {
              await supabase.from("leads").update({
                pipeline_stage: targetStage,
                updated_at: new Date().toISOString(),
              }).eq("id", lead_id);
              resultado = { moved_to: targetStage };
            }
            break;
          }

          case "add_tag": {
            const tag = action.config.tag;
            if (tag) {
              const currentTags = lead.tags || [];
              if (!currentTags.includes(tag)) {
                await supabase.from("leads").update({
                  tags: [...currentTags, tag],
                }).eq("id", lead_id);
              }
              resultado = { tag_added: tag };
            }
            break;
          }

          case "remove_tag": {
            const tagToRemove = action.config.tag;
            if (tagToRemove) {
              const tags = (lead.tags || []).filter((t: string) => t !== tagToRemove);
              await supabase.from("leads").update({ tags }).eq("id", lead_id);
              resultado = { tag_removed: tagToRemove };
            }
            break;
          }

          case "webhook": {
            const url = action.config.url;
            if (url) {
              const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lead, stage: stage_slug, action: action.tipo }),
              });
              resultado = { status: res.status, ok: res.ok };
            }
            break;
          }

          case "assign_agent": {
            const agent = action.config.agent || "sdr";
            // Busca conversa do lead
            const { data: conv } = await supabase
              .from("conversations")
              .select("id")
              .eq("lead_id", lead_id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            if (conv) {
              await supabase.from("conversations").update({
                assigned_agent: agent,
              }).eq("id", conv.id);
            }
            resultado = { assigned: agent };
            break;
          }

          case "ai_message": {
            // Busca conversa do lead
            const { data: conv2 } = await supabase
              .from("conversations")
              .select("*")
              .eq("lead_id", lead_id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            if (conv2) {
              const agentFunc = conv2.assigned_agent === "support" ? "agent-support" : "agent-sdr";
              const prompt = action.config.prompt || "Faça o primeiro contato com o lead";
              const res = await fetch(`${SUPABASE_URL}/functions/v1/${agentFunc}`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  conversation_id: conv2.id,
                  message: prompt,
                  lead_context: lead,
                }),
              });
              resultado = await res.json();
            }
            break;
          }

          default:
            resultado = { skipped: true, reason: `Tipo desconhecido: ${action.tipo}` };
        }

        // Atualiza execução como sucesso
        await supabase.from("action_executions").update({
          status: resultado?.skipped ? "skipped" : "success",
          resultado,
          executed_at: new Date().toISOString(),
        }).eq("id", execution?.id);

        results.push({ action_id: action.id, tipo: action.tipo, resultado });
      } catch (actionError) {
        await supabase.from("action_executions").update({
          status: "failed",
          resultado: { error: actionError instanceof Error ? actionError.message : String(actionError) },
          executed_at: new Date().toISOString(),
        }).eq("id", execution?.id);

        results.push({ action_id: action.id, tipo: action.tipo, error: true });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("execute-stage-actions error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function replaceVars(template: string, lead: any): string {
  return template
    .replace(/\{\{nome\}\}/g, lead.nome || "")
    .replace(/\{\{empresa\}\}/g, lead.empresa || "")
    .replace(/\{\{cidade\}\}/g, lead.cidade || "")
    .replace(/\{\{nicho\}\}/g, lead.nicho || "")
    .replace(/\{\{whatsapp\}\}/g, lead.whatsapp || "")
    .replace(/\{\{email\}\}/g, lead.email || "");
}
