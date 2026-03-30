/**
 * Edge Function: WhatsApp Send Message via Twilio
 * Envia mensagens WhatsApp (texto, mídia, template) usando a API do Twilio.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function errorResponse(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
  const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
  const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
    return errorResponse(
      "Twilio não configurado. Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_WHATSAPP_NUMBER nos secrets.",
      500
    );
  }

  try {
    const body = await req.json();
    const {
      action,
      connection_id,
      to_number,
      content,
      message_type = "text",
      media_urls,
      metadata,
      message_sid,
    } = body;

    // --- GET STATUS ---
    if (action === "get_status" && message_sid) {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages/${message_sid}.json`;
      const statusRes = await fetch(twilioUrl, {
        headers: {
          Authorization:
            "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        },
      });
      const statusData = await statusRes.json();
      if (!statusRes.ok) {
        return errorResponse(
          statusData.message || "Falha ao consultar status",
          statusRes.status
        );
      }
      return new Response(
        JSON.stringify({
          sid: statusData.sid,
          status: statusData.status,
          error_code: statusData.error_code,
          error_message: statusData.error_message,
          date_sent: statusData.date_sent,
          date_updated: statusData.date_updated,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- SEND MESSAGE ---
    if (!to_number || !content) {
      return errorResponse("to_number e content são obrigatórios");
    }

    // Formata número WhatsApp
    let formattedTo = to_number.replace(/\D/g, "");
    if (!formattedTo.startsWith("55")) formattedTo = "55" + formattedTo;
    const whatsappTo = `whatsapp:+${formattedTo}`;
    const whatsappFrom = `whatsapp:${TWILIO_WHATSAPP_NUMBER.startsWith("+") ? TWILIO_WHATSAPP_NUMBER : "+" + TWILIO_WHATSAPP_NUMBER}`;

    // Busca conexão se fornecida (para validação e contexto)
    let connectionData = null;
    if (connection_id) {
      const { data: conn } = await supabase
        .from("whatsapp_connections")
        .select("*")
        .eq("id", connection_id)
        .single();
      connectionData = conn;
      if (!conn || conn.status !== "active") {
        console.warn("[whatsapp-send-message] Connection not active:", connection_id);
      }
    }

    // Monta params do Twilio
    const twilioParams = new URLSearchParams({
      To: whatsappTo,
      From: whatsappFrom,
      Body: content,
    });

    // Adiciona mídia se presente
    if (media_urls && Array.isArray(media_urls)) {
      media_urls.forEach((url: string, i: number) => {
        twilioParams.append(`MediaUrl${i}`, url);
      });
    }

    // Envia via Twilio REST API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: twilioParams,
    });

    const twilioData = await twilioRes.json();

    if (!twilioRes.ok) {
      console.error("[whatsapp-send-message] Twilio error:", twilioData);

      // Salva mensagem com status failed
      if (connection_id) {
        await supabase.from("whatsapp_messages").insert({
          connection_id,
          business_id: connectionData?.business_id,
          to_number: formattedTo,
          from_number: TWILIO_WHATSAPP_NUMBER.replace(/\D/g, ""),
          content,
          message_type,
          direction: "outbound",
          status: "failed",
          error_message: twilioData.message || "Twilio API error",
          media_urls: media_urls || [],
          metadata: metadata || {},
        });
      }

      return errorResponse(
        twilioData.message || "Falha ao enviar WhatsApp",
        twilioRes.status
      );
    }

    // Salva mensagem no banco
    const businessId = connectionData?.business_id;
    if (connection_id && businessId) {
      await supabase.from("whatsapp_messages").insert({
        connection_id,
        business_id: businessId,
        twilio_sid: twilioData.sid,
        to_number: formattedTo,
        from_number: TWILIO_WHATSAPP_NUMBER.replace(/\D/g, ""),
        content,
        message_type,
        direction: "outbound",
        status: twilioData.status || "queued",
        sent_at: new Date().toISOString(),
        media_urls: media_urls || [],
        metadata: metadata || {},
      });
    }

    console.log("[whatsapp-send-message] Sent successfully:", twilioData.sid);

    return new Response(
      JSON.stringify({ sid: twilioData.sid, status: twilioData.status }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[whatsapp-send-message] Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
