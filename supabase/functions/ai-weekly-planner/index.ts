import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { business_id, user_id, nome, nicho, tom_de_voz, produtos,
            promocoes, diferenciais, cidade, avg_rating } = await req.json();

    const hoje = new Date().toLocaleDateString("pt-BR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    const prompt = `Você é especialista em conteúdo para Google Meu Negócio de negócios locais brasileiros.

Crie um plano de 4 posts para a semana atual começando hoje: ${hoje}

Negócio: ${nome}
Nicho: ${nicho}
Cidade: ${cidade}
Tom de voz: ${tom_de_voz || "descontraído e próximo"}
Produtos/Serviços: ${produtos || "não informados"}
Promoções ativas: ${promocoes || "nenhuma"}
Diferenciais: ${diferenciais || "não informados"}
Nota média no Google: ${avg_rating || "não disponível"}

Regras para cada post:
- Máximo 300 caracteres
- 1-2 emojis relevantes
- CTA claro (Ligue, WhatsApp, Agende, Visite)
- Variar os tipos: 1 institucional, 1 produto/serviço, 1 engajamento, 1 promoção/destaque
- Considerar datas comemorativas brasileiras da semana
- Linguagem natural, não robótica

RETORNE EXATAMENTE este JSON (sem markdown):
{
  "semana": "<descrição da semana>",
  "posts": [
    {
      "dia": "Segunda-feira",
      "data_sugerida": "<data no formato YYYY-MM-DD>",
      "horario_sugerido": "<ex: 09:00>",
      "tipo": "institucional|produto|engajamento|promocao",
      "texto": "<texto completo do post com emojis>",
      "justificativa": "<por que este post neste dia>"
    },
    { "dia": "Quarta-feira" },
    { "dia": "Sexta-feira" },
    { "dia": "Sábado" }
  ],
  "dica_semana": "<uma dica de SEO local específica para este nicho>"
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

    // Salva os 4 posts como rascunhos no banco
    if (parsed.posts && business_id) {
      for (const post of parsed.posts) {
        await supabase.from("posts").insert({
          business_id,
          texto: post.texto,
          tipo: post.tipo,
          status: "rascunho",
          agendado_para: post.data_sugerida && post.horario_sugerido
            ? `${post.data_sugerida}T${post.horario_sugerido}:00`
            : null,
        });
      }
    }

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
