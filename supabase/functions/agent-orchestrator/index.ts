/**
 * AGENT ORCHESTRATOR — Cérebro central do sistema de agentes LocalAI
 *
 * Responsabilidades:
 * - Avaliar o estado atual de cada negócio
 * - Decidir quais agentes devem agir (e em que ordem)
 * - Montar contexto rico de nicho + região para cada agente
 * - Garantir que nenhum agente aja sem dados suficientes
 * - Consolidar resultados e registrar no histórico
 * - Identificar padrões de baixa performance e escalar alertas
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Contexto de nicho: palavras-chave, tom, sazonalidade e comportamento por segmento
const NICHO_CONTEXT: Record<string, {
  palavras_chave_busca: string[];
  horario_pico: string;
  dias_melhores_post: string;
  tom_padrao: string;
  urgencia_avaliacao_negativa: string;
  sazonalidade: string;
}> = {
  "Restaurante / Alimentação": {
    palavras_chave_busca: ["restaurante", "comida", "almoço", "jantar", "delivery", "cardápio"],
    horario_pico: "11h-14h e 18h-21h",
    dias_melhores_post: "Quinta e Sexta (antecipam fim de semana)",
    tom_padrao: "Acolhedor, sensorial, desperta fome",
    urgencia_avaliacao_negativa: "ALTA — avaliações negativas sobre comida afastam clientes imediatamente",
    sazonalidade: "Datas comemorativas (Dia das Mães, Natal, Dia dos Namorados) triplicam movimento",
  },
  "Salão de Beleza / Estética": {
    palavras_chave_busca: ["salão", "cabeleireiro", "corte", "coloração", "estética", "manicure"],
    horario_pico: "9h-11h e 14h-17h",
    dias_melhores_post: "Segunda e Terça (agendamentos para o fim de semana)",
    tom_padrao: "Empoderador, cuidado, autoestima",
    urgencia_avaliacao_negativa: "ALTA — clientes de beleza são muito influenciados por avaliações",
    sazonalidade: "Carnaval, formatura, casamentos, Natal",
  },
  "Clínica / Saúde": {
    palavras_chave_busca: ["clínica", "médico", "consulta", "tratamento", "saúde", "especialista"],
    horario_pico: "8h-10h (agendamentos matutinos)",
    dias_melhores_post: "Segunda e Quarta",
    tom_padrao: "Confiável, técnico mas acessível, cuidado com o paciente",
    urgencia_avaliacao_negativa: "CRÍTICA — avaliações negativas em saúde destroem reputação rapidamente",
    sazonalidade: "Janeiro (check-ups anuais), Outubro Rosa, Novembro Azul",
  },
  "Academia / Fitness": {
    palavras_chave_busca: ["academia", "musculação", "personal", "pilates", "fitness", "treino"],
    horario_pico: "6h-8h e 17h-20h",
    dias_melhores_post: "Segunda (renovação de propósitos) e Sexta",
    tom_padrao: "Motivacional, desafiador, resultados",
    urgencia_avaliacao_negativa: "MÉDIA — clientes de academia são fiéis mas avaliam equipamentos e limpeza",
    sazonalidade: "Janeiro (verão/propósitos), Junho/Julho (inverno, foco em saúde)",
  },
  "Advocacia / Jurídico": {
    palavras_chave_busca: ["advogado", "escritório", "consultoria jurídica", "direito", "advocacia"],
    horario_pico: "9h-11h",
    dias_melhores_post: "Segunda e Quarta",
    tom_padrao: "Sério, técnico, transmite segurança e conhecimento",
    urgencia_avaliacao_negativa: "CRÍTICA — reputação é o principal ativo de um escritório jurídico",
    sazonalidade: "Pouca sazonalidade — demanda relativamente constante",
  },
  "Pet Shop / Veterinário": {
    palavras_chave_busca: ["pet shop", "veterinário", "banho e tosa", "ração", "animais"],
    horario_pico: "9h-12h e 16h-18h",
    dias_melhores_post: "Sábado (passeios com pets)",
    tom_padrao: "Carinhoso, apaixonado por animais, tranquilizador",
    urgencia_avaliacao_negativa: "CRÍTICA — tutores são extremamente protetores com seus pets",
    sazonalidade: "Verão (banho mais frequente), datas comemorativas (presentes para pets)",
  },
  "default": {
    palavras_chave_busca: ["serviço", "empresa", "atendimento", "qualidade"],
    horario_pico: "9h-12h",
    dias_melhores_post: "Segunda e Quarta",
    tom_padrao: "Profissional e próximo",
    urgencia_avaliacao_negativa: "ALTA",
    sazonalidade: "Verificar datas comemorativas locais",
  },
};

// Contexto regional brasileiro
const REGIAO_CONTEXT: Record<string, {
  caracteristicas: string;
  expressoes_locais: string;
  competitividade: string;
}> = {
  "SP": { caracteristicas: "Mercado mais competitivo do Brasil, consumidor exigente, valoriza velocidade e praticidade", expressoes_locais: "mano, véi, firmeza", competitividade: "MUITO ALTA" },
  "RJ": { caracteristicas: "Mercado carioca, valoriza experiência e relacionamento, turismo é fator importante", expressoes_locais: "cara, meu, irmão", competitividade: "ALTA" },
  "RS": { caracteristicas: "Consumidor gaúcho é leal mas exigente, valoriza qualidade e tradição", expressoes_locais: "guri, tchê, bah", competitividade: "ALTA" },
  "MG": { caracteristicas: "Mineiro é cauteloso e leal, valoriza confiança e preço justo", expressoes_locais: "uai, trem, sô", competitividade: "MÉDIA-ALTA" },
  "BA": { caracteristicas: "Mercado baiano valoriza calor humano, festividades e identidade local", expressoes_locais: "oxe, vixe, ei meu", competitividade: "MÉDIA" },
  "PR": { caracteristicas: "Consumidor paranaense valoriza organização, pontualidade e qualidade", expressoes_locais: "bah, tchê (fronteira RS)", competitividade: "ALTA" },
  "SC": { caracteristicas: "Estado com alta renda per capita, consumidor exigente e ligado à tecnologia", expressoes_locais: "bah", competitividade: "ALTA" },
  "default": { caracteristicas: "Mercado regional brasileiro, valoriza atendimento personalizado e proximidade", expressoes_locais: "adapte ao contexto local", competitividade: "MÉDIA" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const { business_id, mode = "auto" } = await req.json();
    // mode: "auto" = decide quais agentes rodar | "full" = roda todos | "audit_only" = só analisa

    // ── 1. Carrega dados completos do negócio ──────────────────────────────
    const { data: biz } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", business_id)
      .single();

    if (!biz) throw new Error("Business not found");

    // ── 2. Carrega métricas de performance ─────────────────────────────────
    const [reviewsRes, postsRes, actionsRes, settingsRes] = await Promise.all([
      supabase.from("reviews").select("rating, respondido, resposta_sugerida_ia, created_at")
        .eq("business_id", business_id).order("created_at", { ascending: false }).limit(50),
      supabase.from("posts").select("tipo, status, created_at, publicado_em")
        .eq("business_id", business_id).order("created_at", { ascending: false }).limit(30),
      supabase.from("agent_actions").select("agent, action_type, status, created_at, output_data")
        .eq("business_id", business_id).order("created_at", { ascending: false }).limit(20),
      supabase.from("agent_settings").select("*").eq("business_id", business_id).maybeSingle(),
    ]);

    const reviews = reviewsRes.data || [];
    const posts = postsRes.data || [];
    const recentActions = actionsRes.data || [];
    const settings = settingsRes.data;

    // ── 3. Calcula estado atual ─────────────────────────────────────────────
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const pendingReviews = reviews.filter(r => !r.resposta_sugerida_ia).length;
    const urgentReviews = reviews.filter(r => !r.resposta_sugerida_ia && (r.rating || 5) <= 2).length;
    const postsThisWeek = posts.filter(p => new Date(p.created_at || 0) > sevenDaysAgo).length;
    const avgRating = reviews.length
      ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
      : 0;
    const respondedPct = reviews.length
      ? Math.round(reviews.filter(r => r.respondido).length / reviews.length * 100)
      : 0;

    const lastProfileAudit = recentActions.find(a => a.agent === "profile");
    const daysSinceProfileAudit = lastProfileAudit
      ? Math.floor((now.getTime() - new Date(lastProfileAudit.created_at).getTime()) / 86400000)
      : 999;

    // ── 4. Monta contexto rico de nicho e região ───────────────────────────
    const nichoKey = Object.keys(NICHO_CONTEXT).find(k =>
      biz.nicho?.toLowerCase().includes(k.split("/")[0].toLowerCase())
    ) || "default";
    const nichoCtx = NICHO_CONTEXT[nichoKey];

    const regiaoKey = biz.estado || "default";
    const regiaoCtx = REGIAO_CONTEXT[regiaoKey] || REGIAO_CONTEXT["default"];

    const businessContext = {
      nome: biz.nome,
      nicho: biz.nicho,
      cidade: biz.cidade,
      estado: biz.estado,
      tom_de_voz: biz.tom_de_voz || nichoCtx.tom_padrao,
      publico_alvo: biz.publico_alvo,
      diferenciais: biz.diferenciais,
      produtos: biz.produtos,
      promocoes: biz.promocoes,
      whatsapp: biz.whatsapp,
      anos_experiencia: biz.anos_experiencia,
      // Contexto de nicho
      palavras_chave_busca: nichoCtx.palavras_chave_busca,
      horario_pico_clientes: nichoCtx.horario_pico,
      melhor_dia_post: nichoCtx.dias_melhores_post,
      urgencia_review_negativa: nichoCtx.urgencia_avaliacao_negativa,
      sazonalidade: nichoCtx.sazonalidade,
      // Contexto de região
      perfil_consumidor_local: regiaoCtx.caracteristicas,
      expressoes_regionais: regiaoCtx.expressoes_locais,
      competitividade_regiao: regiaoCtx.competitividade,
      // Métricas atuais
      avg_rating: avgRating.toFixed(1),
      total_reviews: reviews.length,
      responded_pct: respondedPct,
      posts_this_week: postsThisWeek,
      pending_reviews: pendingReviews,
      urgent_reviews: urgentReviews,
    };

    // ── 5. Decide quais agentes precisam agir ──────────────────────────────
    const agentsToRun: Array<{ agent: string; priority: number; reason: string }> = [];

    if (mode === "full") {
      agentsToRun.push(
        { agent: "reviews", priority: 1, reason: "Modo full — executar todos" },
        { agent: "profile", priority: 2, reason: "Modo full — executar todos" },
        { agent: "posts", priority: 3, reason: "Modo full — executar todos" },
      );
    } else {
      // Avaliações urgentes (1-2 estrelas sem resposta) → prioridade máxima
      if (urgentReviews > 0) {
        agentsToRun.push({
          agent: "reviews",
          priority: 1,
          reason: `${urgentReviews} avaliação(ões) crítica(s) de 1-2★ sem resposta`,
        });
      }
      // Avaliações pendentes normais
      else if (pendingReviews > 3) {
        agentsToRun.push({
          agent: "reviews",
          priority: 2,
          reason: `${pendingReviews} avaliações sem resposta sugerida`,
        });
      }

      // Posts: menos de 2 nesta semana → gerar
      if (postsThisWeek < 2) {
        agentsToRun.push({
          agent: "posts",
          priority: urgentReviews > 0 ? 3 : 2,
          reason: `Apenas ${postsThisWeek} posts esta semana (mínimo recomendado: 4)`,
        });
      }

      // Auditoria de perfil: fazer no máximo 1x por semana
      if (daysSinceProfileAudit >= 7) {
        agentsToRun.push({
          agent: "profile",
          priority: 4,
          reason: `Último audit há ${daysSinceProfileAudit} dias`,
        });
      }
    }

    // ── 6. Executa cada agente com contexto rico ───────────────────────────
    const agentsOrdered = agentsToRun.sort((a, b) => a.priority - b.priority);
    const executionResults: Record<string, unknown> = {};

    for (const { agent, reason } of agentsOrdered) {
      console.log(`[orchestrator] Running ${agent} for ${biz.nome} — reason: ${reason}`);

      try {
        const payload: Record<string, unknown> = { business_id, mode: "single", _context: businessContext };
        if (agent === "posts") payload.modo = "weekly_plan";

        const res = await fetch(`${SUPABASE_URL}/functions/v1/agent-${agent}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SERVICE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        executionResults[agent] = { success: res.ok, result, reason };

        if (!res.ok) {
          console.error(`[orchestrator] Agent ${agent} failed:`, result);
        }
      } catch (err) {
        console.error(`[orchestrator] Error calling agent-${agent}:`, err);
        executionResults[agent] = { success: false, error: String(err), reason };
      }
    }

    // ── 7. Registra execução do orquestrador ──────────────────────────────
    await supabase.from("agent_actions").insert({
      business_id,
      agent: "orchestrator",
      action_type: "orchestration_cycle",
      status: "auto_applied",
      auto_applied: true,
      input_data: {
        mode,
        agents_triggered: agentsOrdered.map(a => a.agent),
        business_state: {
          pending_reviews: pendingReviews,
          urgent_reviews: urgentReviews,
          posts_this_week: postsThisWeek,
          avg_rating: avgRating.toFixed(1),
          days_since_profile_audit: daysSinceProfileAudit,
        },
      },
      output_data: {
        agents_run: agentsOrdered.length,
        results_summary: Object.entries(executionResults).map(([k, v]) => ({
          agent: k,
          success: (v as Record<string, unknown>).success,
          reason: (v as Record<string, unknown>).reason,
        })),
      },
    });

    return new Response(
      JSON.stringify({
        business: biz.nome,
        agents_evaluated: agentsToRun.length,
        agents_run: agentsOrdered.map(a => ({ agent: a.agent, reason: a.reason })),
        results: executionResults,
        context_used: {
          nicho: nichoKey,
          regiao: regiaoKey,
          competitividade: regiaoCtx.competitividade,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[orchestrator] Fatal error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
