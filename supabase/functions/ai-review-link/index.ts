import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
    const { business_name, nicho, tom_de_voz, gmb_place_id, canal } = await req.json();

    const reviewUrl = gmb_place_id
      ? `https://search.google.com/local/writereview?placeid=${gmb_place_id}`
      : `https://www.google.com/search?q=${encodeURIComponent(business_name)}&hl=pt-BR#lrd=,3`;

    const canalInstrucao: Record<string, string> = {
      whatsapp: "Mensagem curta para WhatsApp (máx 160 chars sem o link)",
      sms: "Mensagem curtíssima para SMS (máx 120 chars sem o link)",
      email: "Texto de e-mail com assunto e corpo (mais completo e formal)",
      qrcode: "Instrução curta para exibir abaixo de um QR Code impresso (máx 80 chars)",
    };

    const instrucao = canalInstrucao[canal] || canalInstrucao["whatsapp"];

    const prompt = `Você é especialista em marketing local brasileiro.
Crie 3 variações de mensagem para pedir avaliação no Google.

Negócio: ${business_name}
Nicho: ${nicho}
Tom de voz: ${tom_de_voz || "descontraído e próximo"}
Canal: ${instrucao}

Link de avaliação: ${reviewUrl}

RETORNE EXATAMENTE este JSON (sem markdown):
{
  "review_url": "${reviewUrl}",
  "mensagens": [
    { "texto": "<mensagem 1 com o link incluso>", "tom": "caloroso" },
    { "texto": "<mensagem 2 com o link incluso>", "tom": "direto" },
    { "texto": "<mensagem 3 com o link incluso>", "tom": "especial" }
  ]
}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
