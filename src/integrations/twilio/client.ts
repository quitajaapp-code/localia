/**
 * Twilio WhatsApp Client
 * Wrapper para chamar as Edge Functions de envio de WhatsApp via Twilio.
 * IMPORTANTE: Nunca expõe tokens no frontend — toda comunicação via Edge Functions.
 */

import { supabase } from "@/integrations/supabase/client";

export interface SendMessageResult {
  sid: string;
  status: string;
}

export interface MessageStatusResult {
  sid: string;
  status: string;
  error_code?: number;
  error_message?: string;
  date_sent?: string;
  date_updated?: string;
}

class TwilioClient {
  /**
   * Envia mensagem de texto via WhatsApp
   */
  async sendTextMessage(
    connectionId: string,
    to: string,
    body: string
  ): Promise<SendMessageResult> {
    return this.invokeFunction("whatsapp-send-message", {
      connection_id: connectionId,
      to_number: to,
      content: body,
      message_type: "text",
    });
  }

  /**
   * Envia mensagem com mídia (imagem, vídeo, documento)
   */
  async sendMediaMessage(
    connectionId: string,
    to: string,
    body: string,
    mediaUrls: string[]
  ): Promise<SendMessageResult> {
    return this.invokeFunction("whatsapp-send-message", {
      connection_id: connectionId,
      to_number: to,
      content: body,
      message_type: "image",
      media_urls: mediaUrls,
    });
  }

  /**
   * Envia mensagem usando template aprovado pela Meta
   */
  async sendTemplateMessage(
    connectionId: string,
    to: string,
    templateName: string,
    language: string = "pt_BR",
    variables: Record<string, string> = {}
  ): Promise<SendMessageResult> {
    return this.invokeFunction("whatsapp-send-message", {
      connection_id: connectionId,
      to_number: to,
      content: templateName,
      message_type: "template",
      metadata: { language, variables },
    });
  }

  /**
   * Consulta status de uma mensagem pelo SID
   */
  async getMessageStatus(messageSid: string): Promise<MessageStatusResult> {
    return this.invokeFunction("whatsapp-send-message", {
      action: "get_status",
      message_sid: messageSid,
    });
  }

  /**
   * Invoca Edge Function com tratamento de erros
   */
  private async invokeFunction(
    functionName: string,
    payload: Record<string, unknown>
  ): Promise<any> {
    console.log(`[TwilioClient] Invoking ${functionName}`, {
      ...payload,
      content: payload.content ? "***" : undefined,
    });

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    });

    if (error) {
      console.error(`[TwilioClient] Error calling ${functionName}:`, error);
      throw new Error(
        error.message || `Falha ao chamar ${functionName}`
      );
    }

    if (data?.error) {
      console.error(`[TwilioClient] Function error:`, data.error);
      throw new Error(data.error);
    }

    console.log(`[TwilioClient] Success:`, data);
    return data;
  }
}

// Singleton
let instance: TwilioClient | null = null;

export function getTwilioClient(): TwilioClient {
  if (!instance) {
    instance = new TwilioClient();
  }
  return instance;
}

export default TwilioClient;
