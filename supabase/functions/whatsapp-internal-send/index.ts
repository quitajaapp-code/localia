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
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Validate caller
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }
    const userId = claims.claims.sub as string;

    const { conversation_id, content, message_type = "text", media_urls } =
      await req.json();

    if (!conversation_id || !content) {
      return new Response(
        JSON.stringify({ error: "conversation_id e content são obrigatórios" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Busca conversa
    const { data: conv, error: convErr } = await admin
      .from("internal_wa_conversations")
      .select("*, connection:internal_wa_connections(*)")
      .eq("id", conversation_id)
      .single();

    if (convErr || !conv) {
      return new Response(
        JSON.stringify({ error: "Conversa não encontrada" }),
        { status: 404, headers: corsHeaders }
      );
    }

    const connection = (conv as any).connection;
    if (!connection || connection.status !== "active") {
      return new Response(
        JSON.stringify({ error: "Conexão WhatsApp inativa" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Envia via Twilio
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
    const twilioAuth = Deno.env.get("TWILIO_AUTH_TOKEN")!;
    const fromNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER")!;

    const params = new URLSearchParams({
      To: `whatsapp:${(conv as any).contact_phone}`,
      From: `whatsapp:${fromNumber}`,
      Body: content,
    });

    if (media_urls?.length) {
      media_urls.forEach((url: string) => params.append("MediaUrl", url));
    }

    const twilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${twilioSid}:${twilioAuth}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    );

    const twilioData = await twilioRes.json();

    if (!twilioRes.ok) {
      console.error("[whatsapp-internal-send] Twilio error:", twilioData);
      return new Response(
        JSON.stringify({
          error: twilioData.message || "Erro ao enviar via Twilio",
        }),
        { status: 502, headers: corsHeaders }
      );
    }

    // Salva mensagem
    const { error: msgErr } = await admin
      .from("internal_wa_messages")
      .insert({
        conversation_id,
        direction: "outbound",
        message_type,
        content,
        media_urls: media_urls || [],
        from_number: fromNumber,
        to_number: (conv as any).contact_phone,
        agent_id: userId,
        twilio_sid: twilioData.sid,
        status: "sent",
      });

    if (msgErr) console.error("[whatsapp-internal-send] DB insert error:", msgErr);

    // Atualiza last_message_at
    await admin
      .from("internal_wa_conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversation_id);

    // Atualiza stats do agente
    await admin.rpc("internal_wa_increment_agent_sent" as any, {
      p_agent_id: userId,
    }).catch(() => {
      // RPC pode não existir ainda — silencia
    });

    return new Response(
      JSON.stringify({ success: true, sid: twilioData.sid }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[whatsapp-internal-send] Error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
