/**
 * Twilio Internal WhatsApp Client
 * Para uso da equipe LocalIA (SDR + Suporte).
 * Toda comunicação via Edge Functions — nunca expõe tokens.
 */

import { supabase } from "@/integrations/supabase/client";

export type InternalMessageType = "text" | "image" | "audio" | "document";
export type InternalConvStatus = "open" | "pending" | "closed" | "archived";

export interface SendMessagePayload {
  conversation_id: string;
  content: string;
  message_type?: InternalMessageType;
  media_urls?: string[];
}

export interface SendTemplatePayload {
  conversation_id: string;
  template_name: string;
  variables?: Record<string, string>;
}

class TwilioInternalClient {
  /** Envia mensagem de texto/mídia numa conversa interna */
  async sendMessage(payload: SendMessagePayload) {
    const { data, error } = await supabase.functions.invoke(
      "whatsapp-internal-send",
      {
        body: {
          conversation_id: payload.conversation_id,
          content: payload.content,
          message_type: payload.message_type || "text",
          media_urls: payload.media_urls,
        },
      }
    );
    if (error) throw new Error(error.message || "Falha ao enviar mensagem");
    if (data?.error) throw new Error(data.error);
    return data;
  }

  /** Envia template pré-aprovado */
  async sendTemplate(payload: SendTemplatePayload) {
    // Busca template do banco
    const { data: tpl, error: tplErr } = await supabase
      .from("internal_wa_templates")
      .select("*")
      .eq("name", payload.template_name)
      .eq("is_active", true)
      .single();

    if (tplErr || !tpl) throw new Error("Template não encontrado ou inativo");

    let body = (tpl as any).body_content as string;
    if (payload.variables) {
      Object.entries(payload.variables).forEach(([k, v]) => {
        body = body.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v);
      });
    }

    // Incrementa usage_count
    await supabase
      .from("internal_wa_templates")
      .update({ usage_count: ((tpl as any).usage_count || 0) + 1 } as any)
      .eq("id", (tpl as any).id);

    return this.sendMessage({
      conversation_id: payload.conversation_id,
      content: body,
      message_type: "text",
    });
  }

  /** Busca histórico de mensagens de uma conversa */
  async getConversationHistory(conversationId: string, limit = 50) {
    const { data, error } = await supabase
      .from("internal_wa_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data || [];
  }

  /** Atribui conversa a um agente */
  async assignConversation(conversationId: string, agentId: string) {
    const { error } = await supabase
      .from("internal_wa_conversations")
      .update({ assigned_agent_id: agentId } as any)
      .eq("id", conversationId);

    if (error) throw new Error(error.message);
  }

  /** Atualiza status da conversa */
  async updateConversationStatus(
    conversationId: string,
    status: InternalConvStatus
  ) {
    const { error } = await supabase
      .from("internal_wa_conversations")
      .update({ status } as any)
      .eq("id", conversationId);

    if (error) throw new Error(error.message);
  }
}

let instance: TwilioInternalClient | null = null;

export function getInternalClient(): TwilioInternalClient {
  if (!instance) instance = new TwilioInternalClient();
  return instance;
}

export default TwilioInternalClient;
