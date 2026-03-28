/**
 * AGENTE DE PERFIL GMB
 * Consultor especialista em SEO local e otimização de perfil Google Meu Negócio.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AGENT_SYSTEM_PROMPT = `Você é o Agente de Perfil do LocalAI — consultor sênior em SEO local e otimização de Google Meu Negócio para o mercado brasileiro.

MISSÃO: Fazer o negócio aparecer antes dos concorrentes quando alguém busca no Google Maps ou Google Search.

COMO O GOOGLE RANKEIA NEGÓCIOS LOCAIS (os 3 fatores):
1. RELEVÂNCIA: O perfil descreve bem o que o negócio faz? Categorias corretas? Palavras-chave presentes?
2. DISTÂNCIA: Proximidade do usuário — não controlamos, mas podemos otimizar para aparecer além do raio imediato
3. PROEMINÊNCIA: Avaliações, quantidade de posts, fotos, interações, autoridade do site

O QUE MAIS IMPACTA O RANKING (em ordem):
1. Número e qualidade das avaliações (e respostas a elas)
2. Completude do perfil (fotos, horários, serviços, descrição)
3. Frequência de posts
4. Consistência NAP na internet (Nome, Endereço, Telefone iguais em todos os lugares)
5. Categorias primária e secundárias corretas

OTIMIZAÇÃO DE DESCRIÇÃO (750 caracteres):
- Inclua cidade e estado naturalmente (ex: "em Porto Alegre, RS")
- Mencione o bairro/região se relevante
- Use variações do serviço principal (ex: "corte de cabelo", "cabelereiro", "salão de beleza")
- Inclua diferenciais competitivos
- NÃO use apenas palavras-chave (parece spam e o Google penaliza)
- Tom natural, como um dono orgulhoso descreveria seu negócio

ALERTAS CRÍTICOS:
- Score caindo > 10 pontos: investigar causa
- Menos de 10 avaliações: prioridade máxima
- Última foto há mais de 30 dias
- Perfil sem foto de capa ou logo
- Horários não preenchidos`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

  try {
    const { business_id } = await req.json().catch(() => ({}));

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
      const { data: reviews } = await supabase
        .from("reviews").select("rating, respondido, created_at")
        .eq("business_id", biz.id);
      const { data: posts } = await supabase
        .from("posts").select("created_at, status")
        .eq("business_id", biz.id)
        .order("created_at", { ascending: false }).limit(10);

      const totalReviews = reviews?.length || 0;
      const avgRating = totalReviews
        ? (reviews!.reduce((s, r) => s + (r.rating || 0), 0) / totalReviews).toFixed(1)
        : "0";
      const respondedPct = totalReviews
        ? Math.round(reviews!.filter(r => r.respondido).length / totalReviews * 100)
        : 0;
      const postsThisMonth = posts?.filter(p => {
        const d = new Date(p.created_at || 0);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length || 0;

      const userPrompt = `PERFIL ATUAL DO NEGÓCIO:
Nome: ${biz.nome}
Nicho: ${biz.nicho}
Cidade: ${biz.cidade}, ${biz.estado}
Telefone: ${biz.whatsapp ? "preenchido" : "NÃO preenchido"}
Website: ${biz.website_url ? biz.website_url : "NÃO preenchido"}
Logo: ${biz.logo_url ? "tem" : "NÃO tem"}
Produtos/Serviços: ${biz.produtos || "NÃO preenchido"}
Descrição atual: ${biz.diferenciais || "NÃO preenchida"}
Tom de voz: ${biz.tom_de_voz || "não definido"}
Público-alvo: ${biz.publico_alvo || "não definido"}

ATIVIDADE:
Total de avaliações: ${totalReviews}
Nota média: ${avgRating} ★
% de avaliações respondidas: ${respondedPct}%
Posts este mês: ${postsThisMonth}
Tem integração GMB: ${biz.gmb_location_id ? "sim" : "não"}

RETORNE EXATAMENTE este JSON (sem markdown):
{
  "score": <número 0-100>,
  "score_breakdown": {
    "completude_perfil": <0-30 pontos>,
    "avaliacoes": <0-30 pontos>,
    "atividade_posts": <0-20 pontos>,
    "engajamento": <0-20 pontos>
  },
  "nivel": "critico|ruim|regular|bom|otimo",
  "diagnostico": "<2 frases diretas sobre o estado atual>",
  "proxima_acao": "<A UMA coisa mais impactante a fazer AGORA>",
  "otimizacoes": [
    {
      "prioridade": 1,
      "impacto": "alto|medio|baixo",
      "categoria": "avaliacoes|posts|fotos|descricao|contato|categorias",
      "titulo": "<titulo curto>",
      "o_que_fazer": "<instrução específica e acionável>",
      "por_que_importa": "<impacto esperado no ranking>",
      "tempo_estimado": "<ex: 5 minutos | 30 minutos>"
    }
  ],
  "descricao_otimizada": "<descrição de até 750 chars, otimizada para SEO local>",
  "palavras_chave_locais": ["<6 termos que clientes usam para buscar este nicho na cidade>"],
  "categorias_gmb_sugeridas": ["<categoria primária ideal>", "<2-3 categorias secundárias>"],
  "alerta_critico": null
}`;

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
          temperature: 0.3,
        }),
      });

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());

      if (parsed.score) {
        await supabase.from("businesses")
          .update({ score_materiais: parsed.score })
          .eq("id", biz.id);
      }

      await supabase.from("agent_actions").insert({
        business_id: biz.id,
        agent: "profile",
        action_type: "profile_audit",
        status: "pending",
        output_data: {
          score: parsed.score,
          nivel: parsed.nivel,
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
