import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o Agente de Conteúdo do LocalAI.
Copywriter especialista em posts para Google Meu Negócio de negócios locais brasileiros.

REGRAS TÉCNICAS (não negociáveis):
- MÁXIMO 300 caracteres por post (o Google trunca o restante)
- Os PRIMEIROS 100 chars são o gancho — devem prender a atenção sozinhos
- 1-2 emojis apenas — mais que isso parece spam e reduz credibilidade
- SEMPRE termine com CTA específico: "Ligue", "WhatsApp", "Agende", "Visite", "Reserve"
- Inclua cidade ou bairro NATURALMENTE em pelo menos 1 post do plano semanal
- NUNCA use maiúsculas excessivas ou múltiplos "!!!"

CRITÉRIO DE QUALIDADE — um post é bom quando:
✓ Não serve para qualquer outro negócio (é específico)
✓ Menciona algo concreto do negócio (produto, serviço, localização, diferencial)
✓ Tem ganchos diferentes na semana (não é sempre "venha nos visitar!")
✓ Soa como uma pessoa real falando, não como uma empresa
✓ O leitor sabe exatamente o que fazer depois de ler

AUTOCRÍTICA OBRIGATÓRIA antes de finalizar:
- Este post serve para um concorrente do mesmo nicho? Se sim, reescreva.
- Tem CTA claro? Se não, adicione.
- Passa de 300 chars? Reduza.
- É o segundo post seguido com o mesmo tom/estrutura? Varie.

CALENDÁRIO SAZONAL BRASILEIRO — priorize quando próximo:
Jan: Verão, Liquidação, Ano Novo | Fev: Carnaval | Mar: Mulher (8/3), Aulas
Abr: Páscoa | Mai: Mães (2º dom), Trabalho (1/5) | Jun: Namorados (12/6), Festas Juninas
Jul: Férias | Ago: Pais (2º dom) | Set: Cliente (15/9)
Out: Crianças (12/10), Rosa | Nov: Black Friday | Dez: Natal`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

  try {
    const body = await req.json().catch(() => ({}));
    const { business_id, modo, tipo_solicitado, _context } = body;

    const bizQuery = supabase.from("businesses")
      .select("id, nome, nicho, tom_de_voz, cidade, estado, produtos, promocoes, diferenciais, whatsapp, publico_alvo, anos_experiencia");
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
        .select("posts_auto_publish, posts_frequency, posts_best_time")
        .eq("business_id", biz.id).maybeSingle();

      const { data: recentPosts } = await supabase
        .from("posts").select("texto, tipo, created_at")
        .eq("business_id", biz.id)
        .order("created_at", { ascending: false }).limit(8);

      const historicoTexto = (recentPosts || []).map(p =>
        `[${p.tipo || "generico"}] ${p.texto?.slice(0, 100)}`
      ).join("\n") || "nenhum post anterior";

      const hoje = new Date().toLocaleDateString("pt-BR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });

      const numPosts = (modo === "weekly_plan" || !modo) ? 4 : 1;

      const userPrompt = `NEGÓCIO:
Nome: ${biz.nome}
Nicho: ${biz.nicho}
Cidade: ${biz.cidade}, ${biz.estado}
Tom de voz: ${biz.tom_de_voz || ctx.tom_padrao || "descontraído e próximo"}
Público-alvo: ${biz.publico_alvo || "não especificado"}
Produtos/Serviços: ${biz.produtos || "não especificado"}
Promoções ativas: ${biz.promocoes || "nenhuma"}
Diferenciais: ${biz.diferenciais || "não especificado"}
Anos no mercado: ${biz.anos_experiencia || "não informado"}
WhatsApp: ${biz.whatsapp || "não informado"}

CONTEXTO ESTRATÉGICO DO NICHO:
Horário de pico dos clientes: ${ctx.horario_pico_clientes || "horário comercial"}
Melhor dia para publicar: ${ctx.melhor_dia_post || "Segunda e Quarta"}
Sazonalidade relevante: ${ctx.sazonalidade || "verificar datas comemorativas"}
Palavras-chave de busca local: ${(ctx.palavras_chave_busca || []).join(", ")}

CONTEXTO REGIONAL (${biz.estado}):
${ctx.perfil_consumidor_local || "consumidor brasileiro padrão"}
Competitividade: ${ctx.competitividade_regiao || "MÉDIA"}

Data de hoje: ${hoje}

HISTÓRICO RECENTE — NÃO repita a mesma estrutura ou gancho:
${historicoTexto}

${tipo_solicitado ? `Tipo específico solicitado: ${tipo_solicitado}` : ""}

Crie ${numPosts === 1 ? "1 post com 3 variações" : "4 posts para a semana (Segunda, Quarta, Sexta, Sábado)"}.

Para CADA post, faça autocrítica interna:
1. É específico para este negócio? Não serve para o concorrente?
2. Tem CTA claro?
3. Está abaixo de 300 chars?
4. Varia em tom/estrutura dos anteriores?

Retorne EXATAMENTE este JSON (sem markdown):
${numPosts === 1 ? `{
  "tipo": "<tipo>",
  "justificativa": "<por que este tipo agora, dado o contexto>",
  "variacoes": [
    { "texto": "<post com max 300 chars>", "angulo": "<urgência|benefício|curiosidade|prova social>", "chars": <número> },
    { "texto": "<variação 2>", "angulo": "<ângulo diferente>", "chars": <número> },
    { "texto": "<variação 3>", "angulo": "<ângulo diferente>", "chars": <número> }
  ],
  "melhor_horario": "<dia e hora baseado no nicho>",
  "qualidade_validada": true
}` : `{
  "semana": "<descrição>",
  "posts": [
    { "dia": "Segunda-feira", "data": "<YYYY-MM-DD>", "horario": "<HH:MM>", "tipo": "<tipo>", "texto": "<post max 300 chars>", "justificativa": "<por que este post neste dia>", "chars": <número> },
    { "dia": "Quarta-feira", "data": "<YYYY-MM-DD>", "horario": "<HH:MM>", "tipo": "<tipo>", "texto": "<post>", "justificativa": "<motivo>", "chars": <número> },
    { "dia": "Sexta-feira", "data": "<YYYY-MM-DD>", "horario": "<HH:MM>", "tipo": "<tipo>", "texto": "<post>", "justificativa": "<motivo>", "chars": <número> },
    { "dia": "Sábado", "data": "<YYYY-MM-DD>", "horario": "<HH:MM>", "tipo": "<tipo>", "texto": "<post>", "justificativa": "<motivo>", "chars": <número> }
  ],
  "dica_seo_local": "<palavra-chave ou estratégia específica para este nicho nesta região>",
  "qualidade_validada": true
}`}`;

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.75,
        }),
      });

      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

      const postsToSave = numPosts === 1
        ? (parsed.variacoes || []).slice(0, 1).map((v: Record<string, unknown>) => ({
            texto: v.texto, tipo: parsed.tipo, status: "rascunho",
          }))
        : (parsed.posts || []).map((p: Record<string, unknown>) => ({
            texto: p.texto,
            tipo: p.tipo,
            status: settings?.posts_auto_publish ? "agendado" : "rascunho",
            agendado_para: p.data && p.horario ? `${p.data}T${p.horario}:00` : null,
          }));

      const validPosts = postsToSave.filter((p: Record<string, unknown>) =>
        p.texto && typeof p.texto === "string" && (p.texto as string).length >= 50 && (p.texto as string).length <= 350
      );

      for (const post of validPosts) {
        const { data: savedPost } = await supabase
          .from("posts").insert({ business_id: biz.id, ...post })
          .select("id").single();

        await supabase.from("agent_actions").insert({
          business_id: biz.id,
          agent: "posts",
          action_type: "post_created",
          status: settings?.posts_auto_publish ? "auto_applied" : "pending",
          auto_applied: settings?.posts_auto_publish || false,
          input_data: { modo, tipo: post.tipo, nicho: biz.nicho, regiao: biz.estado },
          output_data: { post_id: savedPost?.id, chars: (post.texto as string).length, texto_preview: (post.texto as string).slice(0, 100) },
        });
      }

      results.push({
        business_id: biz.id,
        posts_created: validPosts.length,
        posts_blocked: postsToSave.length - validPosts.length,
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
