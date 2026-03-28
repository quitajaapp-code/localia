/**
 * Edge Function: WhatsApp Send via Evolution API
 * Envia mensagens de texto pelo WhatsApp usando a Evolution API.
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

  const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
  const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
  const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE") || "localai";

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Evolution API não configurada. Configure EVOLUTION_API_URL e EVOLUTION_API_KEY nos secrets." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const { phone, message, conversation_id } = await req.json();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: "phone e message são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Formata o número (remove não dígitos, garante código do país)
    let formattedPhone = phone.replace(/\D/g, "");
    if (!formattedPhone.startsWith("55")) {
      formattedPhone = "55" + formattedPhone;
    }

    // Envia via Evolution API
    const evoRes = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number: formattedPhone,
          text: message,
        }),
      },
    );

    const evoData = await evoRes.json();

    if (!evoRes.ok) {
      console.error("Evolution API error:", evoData);
      return new Response(
        JSON.stringify({ error: "Falha ao enviar WhatsApp", details: evoData }),
        { status: evoRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Se tiver conversation_id, salva a mensagem enviada
    if (conversation_id) {
      await supabase.from("messages").insert({
        conversation_id,
        role: "agent_sdr",
        content: message,
      });

      await supabase.from("conversations").update({
        last_message_at: new Date().toISOString(),
      }).eq("id", conversation_id);
    }

    return new Response(
      JSON.stringify({ success: true, data: evoData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("whatsapp-send error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
