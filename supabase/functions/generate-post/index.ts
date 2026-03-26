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

    const { tipo, contexto, business_name, nicho, tom_de_voz } = await req.json();

    const tipoMap: Record<string, string> = {
      promocao: "um post promocional com oferta/desconto",
      dica: "uma dica útil relacionada ao nicho do negócio",
      novidade: "um anúncio de novidade ou lançamento",
      destaque: "um destaque de produto ou serviço específico",
      sazonalidade: "um post temático sazonal (data comemorativa, estação, etc.)",
      generico: "um post genérico de engajamento",
    };

    const tipoDesc = tipoMap[tipo] || tipoMap["generico"];

    const systemPrompt = `Você é um copywriter especialista em Google Meu Negócio para negócios locais brasileiros.

Regras:
- Escreva SEMPRE em português brasileiro natural
- Máximo 300 caracteres por variação
- Use 1-2 emojis relevantes (não exagere)
- Inclua call-to-action quando apropriado
- ${business_name ? `O negócio se chama "${business_name}"` : ""}
- ${nicho ? `Nicho: ${nicho}` : ""}
- ${tom_de_voz ? `Tom de voz: ${tom_de_voz}` : "Tom descontraído e próximo"}
- Gere EXATAMENTE 3 variações diferentes
- Retorne as 3 variações separadas por "---" (três hífens em linha própria)
- NÃO numere as variações
- NÃO adicione títulos como "Variação 1"`;

    const userPrompt = `Gere 3 variações de ${tipoDesc} para o Google Meu Negócio.${contexto ? `\n\nContexto adicional: ${contexto}` : ""}`;

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const variations = content.split("---").map((v: string) => v.trim()).filter((v: string) => v.length > 0);

    return new Response(
      JSON.stringify({ variations: variations.slice(0, 3) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-post error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
