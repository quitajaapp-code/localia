/**
 * Edge Function: WhatsApp Twilio Webhook
 * Recebe mensagens inbound do Twilio e status callbacks.
 * URL para configurar no Twilio: https://ogyiaxcdqajmoiryatfb.supabase.co/functions/v1/whatsapp-twilio-webhook
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const url = new URL(req.url);
  let formData: Record<string, string> = {};

  try {
    // Twilio envia form-urlencoded
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const raw = await req.text();
      const params = new URLSearchParams(raw);
      params.forEach((value, key) => {
        formData[key] = value;
      });
    } else {
      // Fallback para JSON (testes)
      formData = await req.json();
    }

    console.log("[whatsapp-twilio-webhook] Received:", JSON.stringify(formData));

    // Identifica tipo de evento
    const messageSid = formData.MessageSid || formData.SmsSid;
    const messageStatus = formData.MessageStatus || formData.SmsStatus;
    const from = formData.From || "";
    const to = formData.To || "";
    const body = formData.Body || "";
    const numMedia = parseInt(formData.NumMedia || "0", 10);

    // Busca connection pelo número de destino (o número Twilio)
    const twilioNumber = to.replace("whatsapp:", "").replace("+", "");
    const { data: connection } = await supabase
      .from("whatsapp_connections")
      .select("*")
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    // Log webhook
    await supabase.from("whatsapp_webhook_logs").insert({
      connection_id: connection?.id || null,
      method: req.method,
      url: url.pathname,
      headers: Object.fromEntries(req.headers.entries()),
      body: formData,
      processed: false,
    });

    // --- STATUS CALLBACK ---
    if (messageStatus && messageSid && !body) {
      console.log(`[whatsapp-twilio-webhook] Status update: ${messageSid} -> ${messageStatus}`);

      // Mapeia status Twilio para nosso enum
      const statusMap: Record<string, string> = {
        queued: "queued",
        sending: "queued",
        sent: "sent",
        delivered: "delivered",
        read: "read",
        failed: "failed",
        undelivered: "failed",
      };
      const mappedStatus = statusMap[messageStatus] || messageStatus;

      const updateData: Record<string, unknown> = { status: mappedStatus };
      if (mappedStatus === "delivered") updateData.delivered_at = new Date().toISOString();
      if (mappedStatus === "read") updateData.read_at = new Date().toISOString();
      if (mappedStatus === "failed") updateData.error_message = formData.ErrorMessage || formData.ErrorCode || "Unknown error";

      await supabase
        .from("whatsapp_messages")
        .update(updateData)
        .eq("twilio_sid", messageSid);

      // Marca webhook como processado
      await supabase
        .from("whatsapp_webhook_logs")
        .update({ processed: true })
        .eq("body->>MessageSid", messageSid)
        .eq("processed", false);

      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { ...corsHeaders, "Content-Type": "text/xml" } }
      );
    }

    // --- INBOUND MESSAGE ---
    if (body || numMedia > 0) {
      const fromNumber = from.replace("whatsapp:", "").replace("+", "");

      // Coleta URLs de mídia
      const mediaUrls: string[] = [];
      for (let i = 0; i < numMedia; i++) {
        const mediaUrl = formData[`MediaUrl${i}`];
        if (mediaUrl) mediaUrls.push(mediaUrl);
      }

      // Determina tipo de mensagem
      let messageType = "text";
      if (numMedia > 0) {
        const mediaContentType = formData.MediaContentType0 || "";
        if (mediaContentType.startsWith("image/")) messageType = "image";
        else if (mediaContentType.startsWith("video/")) messageType = "video";
        else if (mediaContentType.startsWith("audio/")) messageType = "audio";
        else messageType = "document";
      }

      // Salva mensagem inbound
      if (connection) {
        await supabase.from("whatsapp_messages").insert({
          connection_id: connection.id,
          business_id: connection.business_id,
          twilio_sid: messageSid,
          from_number: fromNumber,
          to_number: twilioNumber,
          content: body,
          message_type: messageType,
          direction: "inbound",
          status: "delivered",
          delivered_at: new Date().toISOString(),
          media_urls: mediaUrls,
          metadata: {
            profile_name: formData.ProfileName || null,
            wa_id: formData.WaId || null,
          },
        });

        console.log(`[whatsapp-twilio-webhook] Inbound message saved from ${fromNumber}`);
      } else {
        console.warn("[whatsapp-twilio-webhook] No active connection found, message logged but not saved");
      }

      // Marca webhook como processado
      if (messageSid) {
        await supabase
          .from("whatsapp_webhook_logs")
          .update({ processed: true })
          .eq("body->>MessageSid", messageSid)
          .eq("processed", false);
      }

      // Retorna TwiML vazio (sem auto-reply)
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { ...corsHeaders, "Content-Type": "text/xml" } }
      );
    }

    // Evento desconhecido
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { ...corsHeaders, "Content-Type": "text/xml" } }
    );
  } catch (e) {
    console.error("[whatsapp-twilio-webhook] Error:", e);

    // Loga erro no webhook_logs
    try {
      await supabase.from("whatsapp_webhook_logs").insert({
        method: req.method,
        url: url.pathname,
        body: formData,
        processed: false,
        error_message: e instanceof Error ? e.message : String(e),
      });
    } catch (_) {
      // ignore logging error
    }

    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { status: 200, headers: { ...corsHeaders, "Content-Type": "text/xml" } }
    );
  }
});
