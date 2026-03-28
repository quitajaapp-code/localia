const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FIELD_PROMPTS: Record<string, string> = {
  publico_alvo:
    "Sugira uma descrição concisa e estratégica do público-alvo ideal para este negócio. Inclua faixa etária, classe social, interesses e comportamentos. Máximo 2 frases.",
  diferenciais:
    "Liste 3-5 diferenciais competitivos estratégicos para este negócio, baseado no nicho e localização. Seja específico e persuasivo. Formato: itens separados por vírgula.",
  tom_de_voz:
    "Sugira o tom de voz ideal para a comunicação deste negócio, considerando o nicho e público. Dê uma descrição curta e prática de como deve ser a linguagem.",
  produtos:
    "Sugira uma lista dos principais produtos/serviços que um negócio deste nicho normalmente oferece. Formato: itens separados por vírgula.",
  faq:
    "Crie 3 perguntas frequentes (FAQ) com respostas curtas que clientes deste tipo de negócio costumam ter.",
  promocoes:
    "Sugira 2-3 ideias de promoções eficazes para este tipo de negócio atrair mais clientes.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { field, context } = await req.json();
    if (!field || !context) {
      return new Response(JSON.stringify({ error: "field and context required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fieldPrompt = FIELD_PROMPTS[field] || `Sugira um texto profissional e estratégico para o campo "${field}" deste negócio.`;

    const contextStr = Object.entries(context)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Você é um especialista em marketing digital para negócios locais brasileiros. Responda APENAS com o texto sugerido, sem explicações, sem aspas, sem prefixos.",
          },
          {
            role: "user",
            content: `${fieldPrompt}\n\nContexto do negócio:\n${contextStr}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido, tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ai-suggest-field error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
