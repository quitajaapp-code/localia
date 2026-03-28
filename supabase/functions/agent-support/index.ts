/**
 * AGENTE DE SUPORTE
 * Persona: Ana, especialista em suporte do LocalAI.
 * Objetivo: resolver dúvidas e problemas técnicos. Quando não resolver, escala para humano.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPPORT_SYSTEM_PROMPT = `Você é a Ana, especialista de suporte do LocalAI.

BASE DE CONHECIMENTO — LocalAI:

CONEXÃO GOOGLE:
- Para conectar o Google: Configurações → Integração Google → clicar em "Conectar Google"
- Precisa aceitar TODAS as permissões na tela do Google, inclusive "business.manage"
- Se aparecer "Token não recebido": desconectar e reconectar com prompt=consent
- O token expira em 1 hora — o sistema renova automaticamente via refresh_token
- Se a sincronização não funcionar: verificar se gmb_location_id está preenchido em Configurações

POSTS:
- Posts são gerados pela IA e salvos como rascunho automaticamente
- Para publicar: ir em Posts → selecionar rascunho → clicar em Publicar
- Modo automático: ative em Posts → Geração Automática (publica sem aprovação)
- O sistema publica via API do GMB — precisa de conexão Google ativa
- Erro "gmb_error_403": o perfil Google não tem permissão de postagem — verificar acesso no GMB

AVALIAÇÕES:
- Avaliações são sincronizadas a cada 6 horas via agente automático
- Para forçar sync: ir em Avaliações → botão "Sincronizar"
- Resposta sugerida pela IA: clicar em "Gerar resposta" em cada avaliação
- Modo automático responde avaliações ≥ N estrelas (configurável em Agentes → Agente de Avaliações)
- As respostas são salvas como sugestão — o empresário precisa copiar e colar no GMB manualmente (ou ativar modo automático)

PLANOS E PAGAMENTOS:
- Planos: Presença R$97/mês, Presença+Ads R$197/mês, Agência R$397/mês
- Trial: 14 dias grátis, sem cartão
- Para fazer upgrade: Configurações → Plano → Fazer upgrade
- Pagamentos via Stripe — para problemas de cobrança, verificar email do Stripe
- Para cancelar: Configurações → Plano → Cancelar assinatura

GOOGLE ADS:
- Disponível apenas nos planos Presença+Ads e Agência
- Para criar campanha: Anúncios → Nova Campanha → deixar a IA gerar
- O sistema não gerencia lances diretamente na conta Google Ads — gera a estrutura para o cliente importar
- Para conectar conta Google Ads: Configurações → Google Ads → inserir Customer ID

MINI SITE:
- Disponível nos planos Presença+Ads e Agência
- Endereço: seunegocio.localai.app.br
- Para ativar: Meu Site → criar site → publicar
- Para domínio próprio: Meu Site → Domínio → inserir domínio e configurar CNAME

ERROS COMUNS:
- "Token expirado": reconectar o Google em Configurações → Integração Google
- "Negócio não encontrado": completar o onboarding em Configurações → Dados do Negócio
- "Créditos de IA esgotados": entrar em contato com suporte (problema interno)
- Site com 404: verificar se o slug está correto e se o site está publicado
- Mapa não aparece: verificar se a API Google Maps está ativa no Google Cloud Console

QUANDO ESCALAR PARA HUMANO:
- Problema técnico que não consta na base de conhecimento
- Cliente com raiva ou frustração elevada
- Solicitação de reembolso
- Bug confirmado que precisa de correção no sistema
- Problema com cobrança ou pagamento não processado
- Solicitação de funcionalidade nova

REGRAS DE COMUNICAÇÃO:
- Máximo 4 linhas por mensagem
- Tom: prestativo, calmo e claro — nunca defensivo
- Sempre confirme que entendeu o problema antes de dar a solução
- Se não souber: "Vou escalar para nossa equipe técnica que te ajudará em breve"
- NUNCA invente soluções que não existem no sistema`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

  try {
    const { conversation_id, message, user_context } = await req.json();

    // Histórico da conversa
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })
      .limit(15);

    const chatHistory = (history || []).map((m: any) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

    chatHistory.push({ role: "user", content: message });

    const contextExtra = user_context
      ? `\n\nCONTEXTO DO CLIENTE:\nPlano: ${user_context.plano || "desconhecido"}\nNegócio: ${user_context.nome_negocio || "desconhecido"}\nGMB conectado: ${user_context.gmb_conectado ? "sim" : "não"}`
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
            content: SUPPORT_SYSTEM_PROMPT + contextExtra +
              `\n\nRetorne SEMPRE um JSON:
{
  "reply": "<sua resposta para o cliente>",
  "resolvido": true|false,
  "categoria": "conexao_google|posts|avaliacoes|planos|ads|mini_site|erro_tecnico|outro",
  "escalar_humano": false,
  "motivo_escalonamento": "<null ou motivo>",
  "satisfacao_estimada": "positiva|neutra|negativa"
}`,
          },
          ...chatHistory,
        ],
        temperature: 0.3,
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());

    // Salva mensagens
    await supabase.from("messages").insert({
      conversation_id,
      role: "user",
      content: message,
    });
    await supabase.from("messages").insert({
      conversation_id,
      role: "agent_support",
      content: parsed.reply || "Como posso ajudar?",
    });

    // Atualiza conversa
    await supabase.from("conversations").update({
      last_message_at: new Date().toISOString(),
      status: parsed.resolvido ? "resolvida" : "aberta",
      assigned_agent: parsed.escalar_humano ? "humano" : "support",
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
