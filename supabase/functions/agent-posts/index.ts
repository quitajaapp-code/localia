/**
 * AGENTE DE POSTS
 * Copywriter especialista em conteúdo para Google Meu Negócio.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AGENT_SYSTEM_PROMPT = `Você é o Agente de Conteúdo do LocalAI — copywriter especialista em posts para Google Meu Negócio de negócios locais brasileiros.

MISSÃO: Criar posts que fazem o Google entender que o negócio está ativo e relevante, e que fazem o cliente querer entrar em contato.

REGRAS DE COPYWRITING PARA GMB:
- Máximo 300 caracteres (o Google trunca o restante nos resultados de busca)
- Os primeiros 100 caracteres são os mais importantes — devem ser o gancho
- Use 1-2 emojis no máximo — mais que isso parece spam
- SEMPRE termine com um CTA claro: "Ligue", "WhatsApp", "Agende", "Visite", "Saiba mais"
- Palavras-chave locais devem aparecer naturalmente: "em [cidade]", "no [bairro]", "perto de você"
- NUNCA use maiúsculas desnecessárias ou pontos de exclamação em excesso

TIPOS DE POST E QUANDO USAR:
- institucional: apresenta o negócio, valores, história (1x/mês)
- produto_servico: destaca um produto ou serviço específico com benefício (2x/semana)
- promocao: oferta com prazo definido ou condição especial (máx 1x/semana)
- dica: conteúdo educativo relacionado ao nicho (1x/semana)
- engajamento: pergunta ou convite à interação (1x/semana)
- data_comemorativa: associa o negócio a uma data especial brasileira (conforme calendário)
- prova_social: menciona avaliações positivas ou número de clientes (1x/mês)

CALENDÁRIO SAZONAL BRASILEIRO (priorize quando próximo):
Jan: Ano Novo, Verão, Liquidação pós-Natal
Fev: Carnaval, Verão
Mar: Dia da Mulher (8/3), Início das aulas
Abr: Páscoa, Semana Santa, Dia do Consumidor (15/4)
Mai: Dia das Mães (2º domingo), Dia do Trabalho (1/5)
Jun: Festas Juninas, Dia dos Namorados (12/6)
Jul: Férias escolares
Ago: Dia dos Pais (2º domingo)
Set: Dia do Cliente (15/9), Independência (7/9)
Out: Dia das Crianças (12/10), Outubro Rosa
Nov: Black Friday, Dia da Consciência Negra (20/11)
Dez: Natal, Ano Novo, Férias

APRENDA COM O HISTÓRICO: evite repetir o mesmo tipo de post da semana anterior.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

  try {
    const body = await req.json().catch(() => ({}));
    const { business_id, modo, tipo_solicitado } = body;

    const bizQuery = supabase
      .from("businesses")
      .select("id, nome, nicho, tom_de_voz, cidade, estado, produtos, promocoes, diferenciais, whatsapp");
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
      const { data: settings } = await supabase
        .from("agent_settings")
        .select("posts_auto_publish, posts_frequency, posts_best_time")
        .eq("business_id", biz.id)
        .maybeSingle();

      const { data: recentPosts } = await supabase
        .from("posts")
        .select("texto, tipo, created_at")
        .eq("business_id", biz.id)
        .order("created_at", { ascending: false })
        .limit(10);

      const historicoTexto = recentPosts?.map(p =>
        `[${p.tipo || "generico"}] ${p.texto?.slice(0, 80)}`
      ).join("\n") || "nenhum post anterior";

      const hoje = new Date().toLocaleDateString("pt-BR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });

      const numPosts = modo === "weekly_plan" ? 4 : 1;

      const userPrompt = `Negócio: ${biz.nome}
Nicho: ${biz.nicho}
Cidade: ${biz.cidade}, ${biz.estado}
Tom de voz: ${biz.tom_de_voz || "descontraído e próximo"}
Produtos/Serviços: ${biz.produtos || "não especificado"}
Promoções ativas: ${biz.promocoes || "nenhuma"}
Diferenciais: ${biz.diferenciais || "não especificado"}
WhatsApp: ${biz.whatsapp || "não informado"}
Data de hoje: ${hoje}

HISTÓRICO RECENTE (evitar repetição):
${historicoTexto}

${tipo_solicitado ? `Tipo solicitado: ${tipo_solicitado}` : ""}

Crie ${numPosts === 1 ? "1 post com 3 variações" : "um plano de 4 posts para a semana (Segunda, Quarta, Sexta, Sábado)"}.

RETORNE EXATAMENTE este JSON (sem markdown):
${numPosts === 1 ? `{
  "tipo": "<tipo do post>",
  "justificativa": "<por que este tipo agora>",
  "variações": [
    { "texto": "<post completo com emoji e CTA>", "angulo": "<ex: urgência|benefício|curiosidade>" },
    { "texto": "<variação 2>", "angulo": "<ângulo diferente>" },
    { "texto": "<variação 3>", "angulo": "<ângulo diferente>" }
  ],
  "melhor_horario": "<dia e hora sugeridos>",
  "dica_seo": "<uma palavra-chave local para incluir nos próximos posts>"
}` : `{
  "semana": "<descrição da semana>",
  "posts": [
    {
      "dia": "Segunda-feira",
      "data": "<YYYY-MM-DD>",
      "horario": "09:00",
      "tipo": "<tipo>",
      "texto": "<post completo>",
      "justificativa": "<por que este post neste dia>"
    },
    { "dia": "Quarta-feira", "data": "<YYYY-MM-DD>", "horario": "10:00", "tipo": "<tipo>", "texto": "<post>", "justificativa": "<motivo>" },
    { "dia": "Sexta-feira", "data": "<YYYY-MM-DD>", "horario": "09:00", "tipo": "<tipo>", "texto": "<post>", "justificativa": "<motivo>" },
    { "dia": "Sábado", "data": "<YYYY-MM-DD>", "horario": "10:00", "tipo": "<tipo>", "texto": "<post>", "justificativa": "<motivo>" }
  ],
  "dica_semana": "<dica de SEO local específica para o nicho>"
}`}`;

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
          temperature: 0.8,
        }),
      });

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());

      const postsToSave = numPosts === 1
        ? [{ texto: parsed.variações?.[0]?.texto, tipo: parsed.tipo, status: "rascunho" }]
        : (parsed.posts || []).map((p: any) => ({
            texto: p.texto,
            tipo: p.tipo,
            status: settings?.posts_auto_publish ? "agendado" : "rascunho",
            agendado_para: p.data && p.horario ? `${p.data}T${p.horario}:00` : null,
          }));

      for (const post of postsToSave) {
        if (!post.texto) continue;
        const { data: savedPost } = await supabase
          .from("posts")
          .insert({ business_id: biz.id, ...post })
          .select("id")
          .single();

        await supabase.from("agent_actions").insert({
          business_id: biz.id,
          agent: "posts",
          action_type: "post_created",
          status: settings?.posts_auto_publish ? "auto_applied" : "pending",
          auto_applied: settings?.posts_auto_publish || false,
          input_data: { modo, tipo: post.tipo },
          output_data: { post_id: savedPost?.id, texto_preview: post.texto.slice(0, 100) },
        });
      }

      results.push({
        business_id: biz.id,
        posts_created: postsToSave.length,
        data: parsed,
      });
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
