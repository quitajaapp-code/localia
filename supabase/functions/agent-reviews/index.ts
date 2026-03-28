/**
 * AGENTE DE AVALIAÇÕES
 * Especialista em gestão de reputação online para negócios locais brasileiros.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AGENT_SYSTEM_PROMPT = `Você é o Agente de Reputação do LocalAI — um especialista sênior em gestão de avaliações para negócios locais brasileiros.

MISSÃO: Responder avaliações de forma que:
1. O cliente sinta que foi ouvido de verdade
2. Novos clientes que lerem a resposta confiem mais no negócio
3. O Google interprete a resposta como sinal de negócio ativo e engajado

REGRAS ABSOLUTAS:
- NUNCA comece com "Prezado cliente", "Olá!" genérico ou "Agradecemos"
- NUNCA mencione "equipe" se não souber se o negócio tem equipe
- NUNCA prometa o que o negócio não pode cumprir
- SEMPRE personalize com algo específico da avaliação
- SEMPRE use o nome do avaliador se disponível
- Máximo 150 palavras (o Google trunca respostas longas)
- Português brasileiro natural — como um dono falaria, não uma central de atendimento

ESTRATÉGIA POR RATING:
⭐ (1 estrela): Reconheça, peça desculpas sem justificativas, ofereça canal direto (WhatsApp/telefone), convide a retornar. NÃO seja defensivo.
⭐⭐ (2 estrelas): Similar ao 1 estrela, mas com tom mais esperançoso. Destaque o que pode ser melhorado.
⭐⭐⭐ (3 estrelas): Agradeça o feedback honesto, reconheça os pontos de melhoria citados, reforce o compromisso.
⭐⭐⭐⭐ (4 estrelas): Agradeça com calor, pergunte o que poderia ter sido perfeito (sem cobrar resposta).
⭐⭐⭐⭐⭐ (5 estrelas): Agradeça com emoção genuína, reforce o diferencial que o cliente elogiou, convide a voltar e indicar.

ALERTAS CRÍTICOS — notifique o dono quando:
- Mesma reclamação aparece 2+ vezes (problema sistêmico)
- Avaliação 1 estrela sem texto (potencial concorrente ou cliente frustrado)
- Menção a perigo, acidente, doença ou questão legal
- Avaliação em outro idioma (turista ou erro)`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

  try {
    const body = await req.json().catch(() => ({}));
    const { business_id, mode } = body;

    const bizQuery = supabase
      .from("businesses")
      .select("id, nome, nicho, tom_de_voz, publico_alvo, diferenciais, whatsapp, cidade");
    const { data: businesses } = business_id
      ? await bizQuery.eq("id", business_id)
      : await bizQuery.not("gmb_location_id", "is", null);

    if (!businesses?.length) {
      return new Response(JSON.stringify({ message: "No businesses to process" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (const biz of businesses) {
      const { data: settings } = await supabase
        .from("agent_settings")
        .select("reviews_auto_reply, reviews_auto_threshold")
        .eq("business_id", biz.id)
        .maybeSingle();

      const { data: reviews } = await supabase
        .from("reviews")
        .select("*")
        .eq("business_id", biz.id)
        .is("resposta_sugerida_ia", null)
        .order("created_at", { ascending: false })
        .limit(mode === "batch" ? 20 : 1);

      if (!reviews?.length) continue;

      const { data: allReviews } = await supabase
        .from("reviews")
        .select("texto, rating")
        .eq("business_id", biz.id)
        .lte("rating", 3);

      const negativeTexts = allReviews?.map(r => r.texto).filter(Boolean).join(" ") || "";

      for (const review of reviews) {
        try {
          const isUrgent = (review.rating || 5) <= 2 ||
            !!(review.texto || "").toLowerCase().match(/perigo|acidente|doença|processo|advogado|procon|reclame/);

          const reclamacao = review.texto?.toLowerCase() || "";
          const palavrasChave = reclamacao.split(" ").filter(w => w.length > 5);
          const patternAlert = palavrasChave.some(w =>
            negativeTexts.toLowerCase().split(w).length > 3
          );

          const userPrompt = `Negócio: ${biz.nome}
Nicho: ${biz.nicho}
Cidade: ${biz.cidade}
Tom de voz: ${biz.tom_de_voz || "natural e próximo"}
Diferenciais: ${biz.diferenciais || "não informado"}
WhatsApp para contato: ${biz.whatsapp || "não informado"}

AVALIAÇÃO:
Avaliador: ${review.autor || "Cliente"}
Rating: ${review.rating} estrela(s)
Texto: "${review.texto || "(sem texto)"}"
${isUrgent ? "\n⚠️ URGENTE: Esta avaliação precisa de atenção especial." : ""}
${patternAlert ? "\n📊 PADRÃO: Esta reclamação se repete — considere mencionar que está sendo resolvida." : ""}

Gere APENAS a resposta, sem explicações adicionais.`;

          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: AGENT_SYSTEM_PROMPT },
                { role: "user", content: userPrompt },
              ],
              temperature: 0.7,
            }),
          });

          const data = await res.json();
          const reply = data.choices?.[0]?.message?.content?.trim() || "";

          await supabase
            .from("reviews")
            .update({ resposta_sugerida_ia: reply })
            .eq("id", review.id);

          const autoApply = settings?.reviews_auto_reply &&
            (review.rating || 0) >= (settings?.reviews_auto_threshold || 4);

          await supabase.from("agent_actions").insert({
            business_id: biz.id,
            agent: "reviews",
            action_type: "reply_generated",
            status: autoApply ? "auto_applied" : "pending",
            auto_applied: autoApply,
            input_data: { review_id: review.id, rating: review.rating, is_urgent: isUrgent, pattern_alert: patternAlert },
            output_data: { reply, char_count: reply.length },
            applied_at: autoApply ? new Date().toISOString() : null,
          });

          // Send notification for urgent reviews or pattern alerts
          if (isUrgent || patternAlert) {
            const alertTitle = isUrgent
              ? `Avaliação urgente de ${review.autor || "Cliente"} (${review.rating}★)`
              : `Padrão de reclamação detectado`;
            const alertMessage = isUrgent
              ? `"${(review.texto || "sem texto").slice(0, 200)}" — Requer atenção imediata.`
              : `Reclamações semelhantes estão se repetindo. Texto: "${(review.texto || "").slice(0, 150)}"`;

            try {
              await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-agent-alert`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  business_id: biz.id,
                  alert_type: isUrgent ? "urgent_review" : "pattern_detected",
                  severity: isUrgent && (review.rating || 5) <= 1 ? "critical" : "high",
                  title: alertTitle,
                  message: alertMessage,
                  review_id: review.id,
                  metadata: {
                    rating: review.rating,
                    autor: review.autor,
                    is_urgent: isUrgent,
                    pattern_alert: patternAlert,
                  },
                }),
              });
            } catch (alertErr) {
              console.error("Failed to send alert:", alertErr);
            }
          }

          results.push({
            business_id: biz.id,
            review_id: review.id,
            rating: review.rating,
            is_urgent: isUrgent,
            pattern_alert: patternAlert,
            auto_applied: autoApply,
            reply_preview: reply.slice(0, 80) + "...",
          });
        } catch (err) {
          console.error(`Error processing review ${review.id}:`, err);
        }
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
