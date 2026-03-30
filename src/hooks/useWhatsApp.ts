import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getTwilioClient } from "@/integrations/twilio/client";

export interface WhatsAppConnection {
  id: string;
  business_id: string;
  user_id: string;
  twilio_account_sid: string | null;
  twilio_phone_number: string | null;
  twilio_webhook_url: string | null;
  meta_business_id: string | null;
  whatsapp_business_account_id: string | null;
  status: "pending" | "active" | "suspended" | "disconnected";
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: string;
  connection_id: string;
  business_id: string;
  twilio_sid: string | null;
  meta_message_id: string | null;
  message_type: "text" | "image" | "video" | "audio" | "document" | "template" | "location" | "contact";
  content: string | null;
  media_urls: string[];
  from_number: string | null;
  to_number: string | null;
  direction: "inbound" | "outbound";
  status: "queued" | "sent" | "delivered" | "read" | "failed";
  error_message: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
}

interface CreateConnectionInput {
  business_id: string;
  twilio_account_sid: string;
  twilio_phone_number: string;
}

interface SendMessageInput {
  to_number: string;
  content: string;
  message_type?: string;
  media_urls?: string[];
}

export function useWhatsApp(businessId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const twilio = getTwilioClient();

  const connectionQuery = useQuery({
    queryKey: ["whatsapp-connection", businessId],
    queryFn: async (): Promise<WhatsAppConnection | null> => {
      if (!businessId) return null;
      const { data, error } = await supabase
        .from("whatsapp_connections")
        .select("*")
        .eq("business_id", businessId)
        .maybeSingle();
      if (error) throw error;
      return data as WhatsAppConnection | null;
    },
    enabled: !!businessId,
  });

  const messagesQuery = useQuery({
    queryKey: ["whatsapp-messages", connectionQuery.data?.id],
    queryFn: async (): Promise<WhatsAppMessage[]> => {
      if (!connectionQuery.data?.id) return [];
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("connection_id", connectionQuery.data.id)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return (data || []) as WhatsAppMessage[];
    },
    enabled: !!connectionQuery.data?.id,
    refetchInterval: 10000,
  });

  const createConnection = useMutation({
    mutationFn: async (input: CreateConnectionInput) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Não autenticado");

      const webhookUrl = `https://ogyiaxcdqajmoiryatfb.supabase.co/functions/v1/whatsapp-twilio-webhook`;

      const { data, error } = await supabase
        .from("whatsapp_connections")
        .insert({
          business_id: input.business_id,
          user_id: user.user.id,
          twilio_account_sid: input.twilio_account_sid,
          twilio_phone_number: input.twilio_phone_number,
          twilio_webhook_url: webhookUrl,
          status: "active",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-connection", businessId] });
      toast({ title: "WhatsApp conectado!", description: "Conexão configurada com sucesso." });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao conectar", description: err.message, variant: "destructive" });
    },
  });

  const sendMessage = useMutation({
    mutationFn: async (input: SendMessageInput) => {
      if (!connectionQuery.data?.id) throw new Error("Sem conexão ativa");
      return twilio.sendTextMessage(connectionQuery.data.id, input.to_number, input.content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-messages"] });
      toast({ title: "Mensagem enviada!" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao enviar", description: err.message, variant: "destructive" });
    },
  });

  const updateConnectionStatus = useMutation({
    mutationFn: async (status: WhatsAppConnection["status"]) => {
      if (!connectionQuery.data?.id) throw new Error("Sem conexão");
      const { error } = await supabase
        .from("whatsapp_connections")
        .update({ status })
        .eq("id", connectionQuery.data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-connection", businessId] });
      toast({ title: "Status atualizado" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  return {
    connection: connectionQuery.data ?? null,
    messages: messagesQuery.data ?? [],
    isLoading: connectionQuery.isLoading || messagesQuery.isLoading,
    createConnection,
    sendMessage,
    updateConnectionStatus,
    isConnected: connectionQuery.data?.status === "active",
  };
}
