import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { review_text, rating, business_name, nicho, tom_de_voz, tone } = await req.json();

    if (!review_text) {
      return new Response(JSON.stringify({ error: "review_text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const toneMap: Record<string, string> = {
      empatico: "empático e compreensivo",
      profissional: "profissional e objetivo",
      agradecido: "agradecido e caloroso",
      firme: "firme mas respeitoso",
    };

    const toneInstruction = toneMap[tone] || toneMap["profissional"];

    const systemPrompt = `Você é um assistente de marketing digital especializado em responder avaliações do Google Meu Negócio para negócios locais brasileiros.

Regras:
- Responda SEMPRE em português brasileiro natural e fluente
- Máximo 150 palavras
- Seja ${toneInstruction}
- ${rating <= 2 ? "Para avaliações negativas: reconheça o problema, peça desculpas sinceramente, ofereça uma solução concreta e convide o cliente a retornar" : ""}
- ${rating >= 4 ? "Para avaliações positivas: agradeça genuinamente, reforce o diferencial mencionado pelo cliente, convide a retornar" : ""}
- ${rating === 3 ? "Para avaliações neutras: agradeça o feedback, reconheça pontos de melhoria, destaque compromisso com qualidade" : ""}
- ${business_name ? `O nome do negócio é "${business_name}"` : "Não mencione nome do negócio se não souber"}
- ${nicho ? `O negócio é do nicho: ${nicho}` : ""}
- ${tom_de_voz ? `O tom de voz padrão do negócio é: ${tom_de_voz}` : ""}
- NÃO use emojis excessivos (máximo 1-2)
- NÃO invente informações sobre o negócio
- Comece a resposta diretamente (sem "Prezado cliente" genérico)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Gere uma resposta para esta avaliação de ${rating} estrela(s):\n\n"${review_text}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "";

    // Detect sentiment
    let sentiment = "neutro";
    if (rating >= 4) sentiment = "positivo";
    else if (rating <= 2) sentiment = "negativo";
    else if (review_text.toLowerCase().match(/urgente|perigo|péssimo|horrível|nunca mais/)) sentiment = "urgente";

    return new Response(
      JSON.stringify({ reply, sentiment }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-review-reply error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
