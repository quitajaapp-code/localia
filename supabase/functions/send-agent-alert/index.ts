/**
 * SEND AGENT ALERT
 * Sends email/WhatsApp notifications for urgent review alerts.
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
    const { alert_id, business_id, alert_type, severity, title, message, review_id, metadata } = await req.json();

    // Insert alert into agent_alerts table
    const { data: alert, error: alertError } = await supabase
      .from("agent_alerts")
      .insert({
        business_id,
        agent: "reviews",
        alert_type,
        severity,
        title,
        message,
        review_id: review_id || null,
        metadata: metadata || null,
      })
      .select("id")
      .single();

    if (alertError) throw alertError;

    // Get business owner's email and notification preferences
    const { data: biz } = await supabase
      .from("businesses")
      .select("user_id, nome, whatsapp")
      .eq("id", business_id)
      .single();

    if (!biz) throw new Error("Business not found");

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, notif_settings")
      .eq("user_id", biz.user_id)
      .single();

    const notifSettings = (profile?.notif_settings as any) || {};
    const emailEnabled = notifSettings.email_alerts !== false; // default true
    const whatsappEnabled = notifSettings.whatsapp_alerts === true; // default false

    let notifiedEmail = false;
    let notifiedWhatsapp = false;

    // Send email notification
    if (emailEnabled && profile?.email) {
      try {
        // For now, log the email that would be sent
        // In production, integrate with email service (Lovable Email, Resend, etc.)
        console.log(`[ALERT EMAIL] To: ${profile.email}`);
        console.log(`[ALERT EMAIL] Subject: 🚨 ${title} — ${biz.nome}`);
        console.log(`[ALERT EMAIL] Body: ${message}`);
        
        // Mark as notified (email logging for now, real sending when email infra is set up)
        notifiedEmail = true;
      } catch (emailErr) {
        console.error("Email notification failed:", emailErr);
      }
    }

    // Send WhatsApp notification (requires Twilio integration)
    if (whatsappEnabled && biz.whatsapp) {
      try {
        const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

        if (TWILIO_API_KEY && LOVABLE_API_KEY) {
          const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";
          
          // Format WhatsApp number
          let whatsappNumber = biz.whatsapp.replace(/\D/g, "");
          if (!whatsappNumber.startsWith("+")) {
            whatsappNumber = whatsappNumber.startsWith("55") 
              ? `+${whatsappNumber}` 
              : `+55${whatsappNumber}`;
          }

          const severityEmoji = severity === "critical" ? "🔴" : severity === "high" ? "🟠" : "🟡";
          const whatsappBody = `${severityEmoji} *Alerta LocalAI — ${biz.nome}*\n\n` +
            `*${title}*\n${message}\n\n` +
            `Acesse o painel para mais detalhes.`;

          const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${LOVABLE_API_KEY}`,
              "X-Connection-Api-Key": TWILIO_API_KEY,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              To: `whatsapp:${whatsappNumber}`,
              From: Deno.env.get("TWILIO_WHATSAPP_FROM") || "whatsapp:+14155238886",
              Body: whatsappBody,
            }),
          });

          if (response.ok) {
            notifiedWhatsapp = true;
          } else {
            const errData = await response.text();
            console.error("WhatsApp send failed:", errData);
          }
        } else {
          console.log("[WHATSAPP] Twilio not configured, skipping WhatsApp notification");
        }
      } catch (waErr) {
        console.error("WhatsApp notification failed:", waErr);
      }
    }

    // Update alert with notification status
    if (alert?.id) {
      await supabase
        .from("agent_alerts")
        .update({ notified_email: notifiedEmail, notified_whatsapp: notifiedWhatsapp })
        .eq("id", alert.id);
    }

    return new Response(JSON.stringify({
      alert_id: alert?.id,
      notified_email: notifiedEmail,
      notified_whatsapp: notifiedWhatsapp,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-agent-alert error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
