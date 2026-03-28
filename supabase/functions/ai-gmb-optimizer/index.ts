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
    const { business_id, nome, nicho, cidade, estado, tom_de_voz, publico_alvo,
            diferenciais, produtos, avg_rating, total_reviews, responded_pct,
            posts_count, has_logo, has_photos, has_website, has_whatsapp } = await req.json();

    const prompt = `Você é especialista em otimização de Google Meu Negócio para negócios locais brasileiros.

Analise este perfil e retorne um JSON com diagnóstico e ações concretas:

Negócio: ${nome}
Nicho: ${nicho}
Cidade: ${cidade}, ${estado}
Tom de voz: ${tom_de_voz || "não definido"}
Público-alvo: ${publico_alvo || "não definido"}
Diferenciais: ${diferenciais || "não informados"}
Produtos/Serviços: ${produtos || "não informados"}
Nota média: ${avg_rating || 0} estrelas
Total de avaliações: ${total_reviews || 0}
% respondidas: ${responded_pct || 0}%
Posts publicados: ${posts_count || 0}
Tem logo: ${has_logo ? "sim" : "não"}
Tem fotos: ${has_photos ? "sim" : "não"}
Tem website: ${has_website ? "sim" : "não"}
Tem WhatsApp: ${has_whatsapp ? "sim" : "não"}

RETORNE EXATAMENTE este JSON (sem markdown):
{
  "score": <número 0-100 baseado na completude e atividade do perfil>,
  "score_breakdown": {
    "completude": <0-25>,
    "avaliacoes": <0-25>,
    "atividade": <0-25>,
    "engajamento": <0-25>
  },
  "diagnostico": "<2-3 frases resumindo o estado atual do perfil>",
  "otimizacoes": [
    {
      "prioridade": "alta|media|baixa",
      "categoria": "perfil|avaliacoes|posts|fotos|palavras-chave",
      "titulo": "<título curto da ação>",
      "descricao": "<o que fazer e por que impacta no ranking>",
      "impacto_estimado": "<ex: +15% visualizações>",
      "acao_rapida": true|false
    }
  ],
  "descricao_sugerida": "<descrição de 750 chars otimizada para SEO local do negócio>",
  "palavras_chave_locais": ["<5 a 8 termos de busca que clientes usam para encontrar esse nicho na cidade>"],
  "melhor_horario_posts": "<dia e horário sugerido para postar baseado no nicho>",
  "proxima_acao": "<a UMA coisa mais importante a fazer agora>"
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
    const clean = content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    // Salva o score no banco
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    if (business_id && parsed.score) {
      await supabase.from("businesses")
        .update({ score_materiais: parsed.score })
        .eq("id", business_id);
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
