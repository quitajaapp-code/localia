import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o Agente de Perfil do LocalAI.
Consultor sênior em SEO local e otimização de Google Meu Negócio para o mercado brasileiro.

MISSÃO: Dar ao dono do negócio um plano de ação ESPECÍFICO para subir no ranking local.
Não diagnósticos genéricos. Ações concretas, priorizadas, com impacto estimado real.

OS 3 FATORES DE RANKING DO GOOGLE LOCAL (em ordem de impacto):
1. RELEVÂNCIA (40%): O perfil descreve bem o que o negócio faz?
   - Categoria primária correta
   - Descrição com palavras-chave naturais
   - Serviços/produtos listados
   - Atributos do negócio preenchidos

2. PROEMINÊNCIA (40%): O negócio é reconhecido online?
   - Número e qualidade de avaliações
   - Respostas a avaliações
   - Frequência de posts
   - Menções em outros sites

3. DISTÂNCIA (20%): Proximidade do buscador
   - Não controlável diretamente
   - Mas pode ampliar raio com conteúdo local bem otimizado

REGRAS DE DIAGNÓSTICO:
- Score abaixo de 40: CRÍTICO — negócio praticamente invisível no Maps
- Score 40-60: RUIM — aparece, mas perde para concorrentes básicos
- Score 60-75: REGULAR — competitivo mas com gaps importantes
- Score 75-85: BOM — bom desempenho, otimizações pontuais restam
- Score 85+: ÓTIMO — benchmark do nicho, foco em manutenção

CALIBRAÇÃO POR NICHO:
- Clínica/Saúde: avaliações valem 50% do score (pacientes pesquisam muito antes de ir)
- Restaurante: fotos valem 30% extra (comida se vende com os olhos)
- Advocacia: descrição técnica com especialidades vale 40% extra
- Academia: horários e fotos do espaço valem 35% extra

AUTOCRÍTICA:
Antes de retornar, verifique: as otimizações são específicas para este nicho e região?
Uma sugestão como "adicione fotos" não é suficiente — diga "adicione 5 fotos do ambiente
interno com boa iluminação, pois clínicas com fotos claras do espaço têm 40% mais cliques".`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

  try {
    const { business_id, _context } = await req.json().catch(() => ({}));

    const bizQuery = supabase.from("businesses").select("*");
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

      const [reviewsRes, postsRes, prevAuditRes] = await Promise.all([
        supabase.from("reviews").select("rating, respondido, created_at").eq("business_id", biz.id),
        supabase.from("posts").select("created_at, status, tipo").eq("business_id", biz.id)
          .order("created_at", { ascending: false }).limit(20),
        supabase.from("agent_actions").select("output_data, created_at")
          .eq("business_id", biz.id).eq("agent", "profile")
          .order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);

      const reviews = reviewsRes.data || [];
      const posts = postsRes.data || [];

      const totalReviews = reviews.length;
      const avgRating = totalReviews
        ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / totalReviews).toFixed(1)
        : "0";
      const respondedPct = totalReviews
        ? Math.round(reviews.filter(r => r.respondido).length / totalReviews * 100)
        : 0;

      const now = new Date();
      const postsThisMonth = posts.filter(p => {
        const d = new Date(p.created_at || 0);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      const prevScore = (prevAuditRes.data?.output_data as Record<string, unknown>)?.score || null;
      const scoreTrend = prevScore ? `Score anterior: ${prevScore} — ` : "";

      const userPrompt = `PERFIL COMPLETO DO NEGÓCIO:
Nome: ${biz.nome}
Nicho: ${biz.nicho}
Cidade: ${biz.cidade}, Estado: ${biz.estado}
Anos de experiência: ${biz.anos_experiencia || "não informado"}
Telefone: ${biz.whatsapp ? "preenchido" : "NÃO preenchido"}
Website: ${biz.website_url || "NÃO tem"}
Logo: ${biz.logo_url ? "tem" : "NÃO tem"}
Produtos/Serviços: ${biz.produtos || "NÃO preenchido"}
Descrição atual: ${biz.diferenciais || "NÃO preenchida"}
Público-alvo: ${biz.publico_alvo || "não definido"}
Tom de voz: ${biz.tom_de_voz || "não definido"}
Instagram: ${biz.instagram || "não tem"}
GMB conectado: ${biz.gmb_location_id ? "sim" : "não"}

MÉTRICAS DE PERFORMANCE:
Total de avaliações: ${totalReviews}
Nota média: ${avgRating}★
% respondidas: ${respondedPct}%
Posts este mês: ${postsThisMonth}
${scoreTrend}

CONTEXTO COMPETITIVO:
Nicho: ${biz.nicho}
Região: ${biz.cidade}, ${biz.estado}
Competitividade regional: ${ctx.competitividade_regiao || "MÉDIA"}
Perfil do consumidor local: ${ctx.perfil_consumidor_local || "padrão brasileiro"}
Palavras-chave que clientes usam: ${(ctx.palavras_chave_busca || []).join(", ")}

Gere um diagnóstico ESPECÍFICO para este negócio nesta região.
Cada otimização deve ser acionável em menos de 1 semana.

Retorne EXATAMENTE este JSON (sem markdown):
{
  "score": <0-100>,
  "score_breakdown": {
    "relevancia": <0-40>,
    "proeminencia": <0-40>,
    "atividade": <0-20>
  },
  "nivel": "critico|ruim|regular|bom|otimo",
  "diagnostico": "<2 frases diretas, específicas para este nicho e cidade>",
  "proxima_acao": "<A UMA ação mais impactante, específica para este negócio agora>",
  "otimizacoes": [
    {
      "prioridade": 1,
      "impacto": "alto|medio|baixo",
      "categoria": "avaliacoes|posts|fotos|descricao|contato|categorias|horarios",
      "titulo": "<título específico, não genérico>",
      "o_que_fazer": "<instrução detalhada e específica para este nicho>",
      "por_que_importa": "<impacto esperado com números quando possível>",
      "tempo_estimado": "<ex: 15 minutos>"
    }
  ],
  "descricao_otimizada": "<750 chars, palavras-chave naturais, cidade e estado incluídos, específica para o nicho>",
  "palavras_chave_locais": ["<6-8 termos reais que clientes usam para buscar este nicho em ${biz.cidade}>"],
  "categorias_gmb_sugeridas": ["<categoria primária ideal para o GMB>", "<2-3 secundárias>"],
  "alerta_critico": ${totalReviews < 5 ? '"URGENTE: menos de 5 avaliações — prioridade máxima para coletar avaliações"' : "null"}
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
          temperature: 0.25,
        }),
      });

      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

      if (parsed.score) {
        await supabase.from("businesses")
          .update({ score_materiais: parsed.score }).eq("id", biz.id);
      }

      await supabase.from("agent_actions").insert({
        business_id: biz.id,
        agent: "profile",
        action_type: "profile_audit",
        status: "pending",
        output_data: {
          score: parsed.score,
          nivel: parsed.nivel,
          prev_score: prevScore,
          score_delta: prevScore ? parsed.score - (prevScore as number) : null,
          otimizacoes_count: parsed.otimizacoes?.length || 0,
          alerta: parsed.alerta_critico,
        },
      });

      results.push({ business_id: biz.id, ...parsed });
    }

    return new Response(JSON.stringify({ results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
