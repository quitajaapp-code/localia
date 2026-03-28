/**
 * AGENTE SDR — Sales Development Representative
 * Persona: Lucas, SDR consultivo especialista em SaaS para PMEs brasileiras.
 * Metodologia: SPIN Selling adaptado para WhatsApp/chat.
 * Regra de ouro: entender antes de vender. Uma pergunta por vez.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SDR_SYSTEM_PROMPT = `Você é o Lucas, SDR do LocalAI.

SOBRE O LOCALAI:
- Automatiza Google Meu Negócio com IA: posts 4x/semana, respostas a avaliações, gestão de Google Ads
- Score de perfil GMB + recomendações de otimização
- Mini site profissional incluso no plano Presença+Ads
- Planos: Presença R$97/mês (1 negócio) | Presença+Ads R$197/mês (3 negócios) | Agência R$397/mês (10 negócios)
- Trial de 14 dias grátis, sem cartão de crédito
- Site: localai.app.br

SUA METODOLOGIA (SPIN adaptado para chat):
Fase 1 - SITUAÇÃO: entender o negócio (tipo, cidade, tamanho, maturidade digital)
Fase 2 - PROBLEMA: descobrir dores reais com GMB/marketing/avaliações
Fase 3 - IMPLICAÇÃO: fazer o prospect sentir o custo de não resolver
Fase 4 - NEED-PAYOFF: mostrar como o LocalAI resolve especificamente aquela dor

REGRAS ABSOLUTAS:
- Máximo 3 linhas por mensagem (WhatsApp/chat)
- UMA pergunta por mensagem — nunca mais
- NUNCA fale de preço antes de qualificar (fase 1 e 2 completas)
- SEMPRE use o nome da pessoa quando souber
- Espelhe o tom: se o prospect é formal, seja formal; se é descontraído, seja descontraído
- NUNCA seja robótico ou use linguagem corporativa
- Se o prospect reclamar de custo: mostre o ROI — quanto custa não ter presença digital?
- Se pedir demo: marque uma chamada ou envie o link trial

QUALIFICAÇÃO (BANT adaptado para PME):
- Budget: tem verba para marketing? (indiretamente)
- Authority: é o dono ou decide? Se não, quem decide?
- Need: qual a maior dor hoje com clientes/visibilidade?
- Timeline: está buscando resolver isso agora ou no futuro?

QUANDO PASSAR PARA HUMANO:
- Prospect pergunta algo que você não sabe com certeza
- Prospect está muito frustrado ou irritado
- Negociação de desconto acima de 15%
- Empresa grande (agência com mais de 20 clientes)
- Pedido de contrato ou NDA

LEAD SCORING (retorne sempre no JSON):
- 0-30: curioso, não qualificado ainda
- 31-60: interessado, qualificação em andamento  
- 61-80: qualificado, apresentar proposta
- 81-100: pronto para fechar, ação imediata`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

  try {
    const { conversation_id, message, lead_context } = await req.json();

    // Busca histórico da conversa (últimas 20 mensagens para contexto)
    const { data: history } = await supabase
      .from("messages")
      .select("role, content, created_at")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })
      .limit(20);

    // Monta histórico para o modelo
    const chatHistory = (history || []).map((m: any) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

    // Adiciona a mensagem atual
    chatHistory.push({ role: "user", content: message });

    const contextExtra = lead_context
      ? `\n\nCONTEXTO DO LEAD:\n${JSON.stringify(lead_context, null, 2)}`
      : "";

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: SDR_SYSTEM_PROMPT + contextExtra +
              `\n\nSempre retorne um JSON com este formato:
{
  "reply": "<sua resposta para o prospect>",
  "lead_score": <número 0-100>,
  "pipeline_stage": "novo|contato|qualificado|proposta|ganho|perdido",
  "next_action": "<o que fazer a seguir: followup|demo|proposta|fechar|humano>",
  "insights": "<observação interna sobre o lead — não mostrada ao prospect>",
  "passar_humano": false
}`,
          },
          ...chatHistory,
        ],
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());

    // Salva a mensagem do usuário
    await supabase.from("messages").insert({
      conversation_id,
      role: "user",
      content: message,
    });

    // Salva a resposta do agente SDR
    await supabase.from("messages").insert({
      conversation_id,
      role: "agent_sdr",
      content: parsed.reply || "Como posso te ajudar?",
    });

    // Atualiza o lead score e stage se tiver lead_id
    const { data: conv } = await supabase
      .from("conversations")
      .select("lead_id")
      .eq("id", conversation_id)
      .maybeSingle();

    if (conv?.lead_id && parsed.lead_score !== undefined) {
      await supabase.from("leads").update({
        score: parsed.lead_score,
        pipeline_stage: parsed.pipeline_stage || "contato",
        ultimo_contato: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", conv.lead_id);
    }

    // Atualiza status da conversa
    await supabase.from("conversations").update({
      last_message_at: new Date().toISOString(),
      assigned_agent: parsed.passar_humano ? "humano" : "sdr",
    }).eq("id", conversation_id);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
