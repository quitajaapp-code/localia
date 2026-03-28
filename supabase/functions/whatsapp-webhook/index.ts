/**
 * Edge Function: WhatsApp Webhook (Evolution API)
 * Recebe mensagens do WhatsApp e roteia para o agente apropriado.
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
    const payload = await req.json();

    // Evolution API envia diferentes tipos de evento
    const event = payload.event;

    // Só processa mensagens recebidas
    if (event !== "messages.upsert") {
      return new Response(JSON.stringify({ ignored: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messageData = payload.data;
    if (!messageData || messageData.key?.fromMe) {
      return new Response(JSON.stringify({ ignored: true, reason: "own message" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const remoteJid = messageData.key?.remoteJid || "";
    const phone = remoteJid.replace("@s.whatsapp.net", "").replace("@g.us", "");
    const pushName = messageData.pushName || phone;
    const text = messageData.message?.conversation ||
                 messageData.message?.extendedTextMessage?.text ||
                 "";

    if (!text) {
      return new Response(JSON.stringify({ ignored: true, reason: "no text" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Busca conversa existente pelo número
    let { data: conv } = await supabase
      .from("conversations")
      .select("*")
      .eq("contact_identifier", phone)
      .eq("canal", "whatsapp")
      .neq("status", "resolvida")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Se não existe, cria conversa + lead
    if (!conv) {
      // Cria lead
      const { data: lead } = await supabase
        .from("leads")
        .insert({
          nome: pushName,
          whatsapp: phone,
          source: "whatsapp",
          pipeline_stage: "novo",
        })
        .select()
        .single();

      // Cria conversa vinculada ao lead
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({
          canal: "whatsapp",
          contact_name: pushName,
          contact_identifier: phone,
          assigned_agent: "sdr",
          status: "aberta",
          lead_id: lead?.id,
        })
        .select()
        .single();

      conv = newConv;
    }

    if (!conv) {
      throw new Error("Falha ao criar/encontrar conversa");
    }

    // Salva a mensagem recebida
    await supabase.from("messages").insert({
      conversation_id: conv.id,
      role: "user",
      content: text,
    });

    // Atualiza last_message_at
    await supabase.from("conversations").update({
      last_message_at: new Date().toISOString(),
      contact_name: pushName,
    }).eq("id", conv.id);

    // Se o agente NÃO é humano, invoca o agente IA para responder
    if (conv.assigned_agent !== "humano") {
      const agentFunc = conv.assigned_agent === "support" ? "agent-support" : "agent-sdr";

      // Busca contexto do lead
      let leadContext = null;
      if (conv.lead_id) {
        const { data: leadData } = await supabase
          .from("leads")
          .select("*")
          .eq("id", conv.lead_id)
          .single();
        leadContext = leadData;
      }

      const agentRes = await fetch(`${SUPABASE_URL}/functions/v1/${agentFunc}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conv.id,
          message: text,
          lead_context: leadContext,
        }),
      });

      const agentData = await agentRes.json();

      // Envia resposta do agente via WhatsApp
      if (agentData?.reply) {
        await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-send`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone,
            message: agentData.reply,
            conversation_id: conv.id,
          }),
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, conversation_id: conv.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("whatsapp-webhook error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
