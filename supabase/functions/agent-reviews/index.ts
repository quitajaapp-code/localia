import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o Agente de Reputação do LocalAI.
Especialista sênior em gestão de avaliações para negócios locais brasileiros.

MISSÃO REAL: Cada resposta deve fazer 3 coisas ao mesmo tempo:
1. Fazer o avaliador sentir que foi ouvido (não só respondido)
2. Convencer quem está LENDO a resposta (novos clientes) que o negócio é confiável
3. Sinalizar ao algoritmo do Google que o perfil está ativo e engajado

PROIBIDO ABSOLUTAMENTE:
- Começar com "Prezado", "Olá!", "Agradecemos", "Obrigado pelo feedback"
- Usar a palavra "equipe" sem saber se existe equipe
- Prometer algo que o negócio talvez não possa cumprir
- Respostas que servem para qualquer negócio (genéricas)
- Mais de 150 palavras (Google trunca)
- Mais de 2 emojis
- Frases corporativas como "satisfação do cliente é nossa prioridade"

OBRIGATÓRIO:
- Usar o nome do avaliador se disponível
- Mencionar algo ESPECÍFICO do que o avaliador escreveu
- Adaptar ao nicho: restaurante fala de sabor, salão fala de beleza, clínica fala de cuidado
- Adaptar à região: gaúcho é mais direto, carioca é mais afetivo, paulista quer objetividade
- Incluir CTA específico (WhatsApp, telefone, ou convite para retornar)

ESCALA DE RESPOSTA POR RATING:
1★ — Tom: empático + solução direta. Nunca defensivo. Ofereça canal direto (WhatsApp/telefone).
2★ — Tom: compreensivo + esperançoso. Reconheça o ponto exato da crítica.
3★ — Tom: grato pelo feedback honesto. Destaque o que vai melhorar especificamente.
4★ — Tom: caloroso + curioso. Pergunte sutilmente o que poderia ter sido perfeito.
5★ — Tom: genuinamente feliz. Reforce o diferencial que o cliente destacou. Convide a indicar.

AUTOCRÍTICA OBRIGATÓRIA:
Antes de finalizar, avalie sua resposta:
- Ela serve para outro negócio diferente? Se sim, reescreva.
- Começou com palavra proibida? Reescreva.
- Tem mais de 150 palavras? Reduza.
- Mencionou algo específico do avaliador? Se não, adicione.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

  try {
    const body = await req.json().catch(() => ({}));
    const { business_id, mode, _context } = body;

    const bizQuery = supabase.from("businesses")
      .select("id, nome, nicho, tom_de_voz, publico_alvo, diferenciais, whatsapp, cidade, estado, anos_experiencia");
    const { data: businesses } = business_id
      ? await bizQuery.eq("id", business_id)
      : await bizQuery.not("gmb_location_id", "is", null);

    if (!businesses?.length) {
      return new Response(JSON.stringify({ message: "No businesses" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (const biz of businesses) {
      const ctx = _context || {};

      const { data: settings } = await supabase
        .from("agent_settings")
        .select("reviews_auto_reply, reviews_auto_threshold")
        .eq("business_id", biz.id).maybeSingle();

      const { data: reviews } = await supabase
        .from("reviews").select("*")
        .eq("business_id", biz.id)
        .is("resposta_sugerida_ia", null)
        .order("rating", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(mode === "batch" ? 20 : 5);

      if (!reviews?.length) continue;

      // Detecta padrão de reclamação repetida
      const { data: allNegative } = await supabase
        .from("reviews").select("texto, rating")
        .eq("business_id", biz.id).lte("rating", 3);

      const negativeTexts = (allNegative || []).map(r => r.texto).filter(Boolean).join(" ").toLowerCase();

      for (const review of reviews) {
        try {
          const isUrgent = (review.rating || 5) <= 2 ||
            !!(review.texto || "").toLowerCase().match(/perigo|acidente|doença|processo|advogado|procon|reclame|intoxic|ferido|machuc/);

          const reclamacaoWords = (review.texto?.toLowerCase() || "").split(" ").filter((w: string) => w.length > 5);
          const patternAlert = reclamacaoWords.filter((w: string) => negativeTexts.split(w).length > 3).length >= 2;

          const nichoInfo = ctx.urgencia_review_negativa || "";
          const regiaoInfo = ctx.perfil_consumidor_local || "";
          const expressoes = ctx.expressoes_regionais || "";

          const userPrompt = `NEGÓCIO:
Nome: ${biz.nome}
Nicho: ${biz.nicho}
Cidade: ${biz.cidade}, ${biz.estado}
Tom de voz configurado: ${biz.tom_de_voz || "natural e próximo"}
Diferencial principal: ${biz.diferenciais || "não informado"}
Anos de experiência: ${biz.anos_experiencia || "não informado"}
WhatsApp: ${biz.whatsapp || "não informado"}

CONTEXTO REGIONAL:
${regiaoInfo}
Expressões locais que soam naturais: ${expressoes}

AVALIAÇÃO PARA RESPONDER:
Avaliador: ${review.autor || "Cliente"}
Rating: ${review.rating}★
Texto: "${review.texto || "(sem texto — avaliação só com estrelas)"}"
Data: ${new Date(review.created_at || "").toLocaleDateString("pt-BR")}

${isUrgent ? "⚠️ URGENTE: Esta avaliação exige atenção imediata — cliente muito insatisfeito ou menção a risco." : ""}
${patternAlert ? "📊 PADRÃO DETECTADO: Esta reclamação se repete em outras avaliações — mencione que está sendo resolvido sistemicamente." : ""}
${nichoInfo ? `\nIMPORTÂNCIA PARA O NICHO: ${nichoInfo}` : ""}

Gere a resposta ideal. Depois, faça autocrítica: a resposta usa o nome do avaliador? Menciona algo específico? Está abaixo de 150 palavras? É específica para este negócio e não serve para qualquer outro?

Retorne APENAS o JSON:
{
  "reply": "<resposta final aprovada após autocrítica>",
  "auto_critique_passed": true,
  "is_personalized": true,
  "word_count": <número>,
  "tone_used": "<tom utilizado>",
  "cta_included": "<qual CTA foi usado>"
}`;

          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userPrompt },
              ],
              temperature: 0.65,
            }),
          });

          const data = await res.json();
          const raw = data.choices?.[0]?.message?.content || "{}";
          const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

          const reply = parsed.reply || "";

          const qualityOk = reply.length > 30 &&
            reply.length < 900 &&
            !reply.toLowerCase().startsWith("prezado") &&
            !reply.toLowerCase().startsWith("olá!") &&
            !reply.toLowerCase().startsWith("agradecemos");

          if (!qualityOk) {
            console.warn(`[agent-reviews] Quality check failed for review ${review.id} — skipping`);
            continue;
          }

          await supabase.from("reviews")
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
            output_data: {
              reply_preview: reply.slice(0, 100),
              word_count: parsed.word_count,
              tone_used: parsed.tone_used,
              quality_passed: qualityOk,
              auto_critique_passed: parsed.auto_critique_passed,
            },
            applied_at: autoApply ? new Date().toISOString() : null,
          });

          if (isUrgent || patternAlert) {
            await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-agent-alert`, {
              method: "POST",
              headers: { Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                business_id: biz.id,
                alert_type: isUrgent ? "urgent_review" : "pattern_detected",
                severity: (review.rating || 5) <= 1 ? "critical" : "high",
                title: isUrgent ? `Avaliação crítica de ${review.autor || "Cliente"} (${review.rating}★)` : "Padrão de reclamação detectado",
                message: (review.texto || "sem texto").slice(0, 200),
                review_id: review.id,
                metadata: { rating: review.rating, is_urgent: isUrgent, pattern_alert: patternAlert },
              }),
            }).catch(console.error);
          }

          results.push({
            review_id: review.id, rating: review.rating,
            is_urgent: isUrgent, pattern_alert: patternAlert,
            quality_passed: qualityOk, auto_applied: autoApply,
          });
        } catch (err) {
          console.error(`[agent-reviews] Error on review ${review.id}:`, err);
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
