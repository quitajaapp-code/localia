import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Twilio envia form-urlencoded
    const formData = await req.formData();
    const from = (formData.get("From") as string || "").replace("whatsapp:", "");
    const to = (formData.get("To") as string || "").replace("whatsapp:", "");
    const body = formData.get("Body") as string || "";
    const messageSid = formData.get("MessageSid") as string || "";
    const numMedia = parseInt(formData.get("NumMedia") as string || "0", 10);

    const mediaUrls: string[] = [];
    for (let i = 0; i < numMedia; i++) {
      const url = formData.get(`MediaUrl${i}`) as string;
      if (url) mediaUrls.push(url);
    }

    if (!from) {
      return new Response("<Response></Response>", {
        status: 200,
        headers: { "Content-Type": "text/xml", ...corsHeaders },
      });
    }

    console.log(`[internal-webhook] Incoming from ${from}: ${body.substring(0, 50)}...`);

    // Busca conexão ativa
    const { data: connections } = await admin
      .from("internal_wa_connections")
      .select("*")
      .eq("status", "active")
      .limit(1);

    const connection = connections?.[0];
    if (!connection) {
      console.error("[internal-webhook] No active connection found");
      return new Response("<Response></Response>", {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Busca conversa existente pelo telefone
    const { data: existingConv } = await admin
      .from("internal_wa_conversations")
      .select("*")
      .eq("contact_phone", from)
      .eq("connection_id", connection.id)
      .in("status", ["open", "pending"])
      .order("last_message_at", { ascending: false })
      .limit(1);

    let conversationId: string;

    if (existingConv?.length) {
      conversationId = existingConv[0].id;

      // Reabre se estava pending
      if (existingConv[0].status === "pending") {
        await admin
          .from("internal_wa_conversations")
          .update({ status: "open" })
          .eq("id", conversationId);
      }
    } else {
      // Busca lead existente pelo telefone
      const { data: leads } = await admin
        .from("leads")
        .select("id, nome")
        .or(`whatsapp.eq.${from},telefone.eq.${from}`)
        .limit(1);

      const lead = leads?.[0];

      // Round-robin: busca agente com menos conversas abertas
      const assignedAgentId = await getNextAgent(admin, connection);

      // Cria nova conversa
      const { data: newConv, error: convErr } = await admin
        .from("internal_wa_conversations")
        .insert({
          connection_id: connection.id,
          contact_phone: from,
          contact_name: lead ? (lead as any).nome : null,
          lead_id: lead ? (lead as any).id : null,
          assigned_agent_id: assignedAgentId,
          status: "open",
          priority: "normal",
          tags: lead ? ["lead-existente"] : ["novo-contato"],
        })
        .select()
        .single();

      if (convErr || !newConv) {
        console.error("[internal-webhook] Error creating conversation:", convErr);
        return new Response("<Response></Response>", {
          status: 200,
          headers: { "Content-Type": "text/xml" },
        });
      }

      conversationId = (newConv as any).id;

      // Se não tem lead, cria um novo
      if (!lead) {
        const { data: newLead } = await admin
          .from("leads")
          .insert({
            nome: `WhatsApp ${from}`,
            whatsapp: from,
            source: "whatsapp",
            pipeline_stage: "novo",
          })
          .select()
          .single();

        if (newLead) {
          await admin
            .from("internal_wa_conversations")
            .update({ lead_id: (newLead as any).id })
            .eq("id", conversationId);
        }
      }

      console.log(`[internal-webhook] New conversation ${conversationId} for ${from}`);
    }

    // Salva mensagem
    const messageType = numMedia > 0 ? "image" : "text";
    await admin.from("internal_wa_messages").insert({
      conversation_id: conversationId,
      direction: "inbound",
      message_type: messageType,
      content: body,
      media_urls: mediaUrls,
      from_number: from,
      to_number: to,
      twilio_sid: messageSid,
      status: "delivered",
    });

    // Atualiza last_message_at
    await admin
      .from("internal_wa_conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    // Retorna TwiML vazio (sem auto-resposta)
    return new Response("<Response></Response>", {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (e) {
    console.error("[internal-webhook] Error:", e);
    return new Response("<Response></Response>", {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }
});

/** Round-robin: atribui ao agente com menos conversas abertas */
async function getNextAgent(
  admin: ReturnType<typeof createClient>,
  connection: any
): Promise<string | null> {
  const agents: string[] = connection.assigned_agents || [];
  if (!agents.length) {
    const fallback = Deno.env.get("WHATSAPP_DEFAULT_AGENT_ID");
    return fallback || null;
  }

  // Conta conversas abertas por agente
  const counts: Record<string, number> = {};
  for (const agentId of agents) {
    const { count } = await admin
      .from("internal_wa_conversations")
      .select("*", { count: "exact", head: true })
      .eq("assigned_agent_id", agentId)
      .eq("status", "open");
    counts[agentId] = count || 0;
  }

  // Retorna o agente com menos conversas
  const sorted = Object.entries(counts).sort((a, b) => a[1] - b[1]);
  return sorted[0]?.[0] || agents[0];
}
