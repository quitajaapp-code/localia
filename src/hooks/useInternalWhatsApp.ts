import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getInternalClient } from "@/integrations/twilio/internal-client";
import { toast } from "sonner";

export type ConvStatus = "open" | "pending" | "closed" | "archived";
export type Priority = "low" | "normal" | "high" | "urgent";

export interface ConversationFilters {
  status?: ConvStatus;
  priority?: Priority;
  assigned_agent_id?: string;
  search?: string;
}

export interface InternalConversation {
  id: string;
  connection_id: string;
  contact_phone: string;
  contact_name: string | null;
  lead_id: string | null;
  business_id: string | null;
  assigned_agent_id: string | null;
  status: ConvStatus;
  priority: Priority;
  tags: string[] | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InternalMessage {
  id: string;
  conversation_id: string;
  twilio_sid: string | null;
  from_number: string | null;
  to_number: string | null;
  direction: "inbound" | "outbound";
  message_type: "text" | "image" | "audio" | "document";
  content: string | null;
  media_urls: string[] | null;
  status: "sent" | "delivered" | "read" | "failed";
  agent_id: string | null;
  created_at: string;
  read_at: string | null;
}

export function useInternalWhatsApp(filters?: ConversationFilters) {
  const qc = useQueryClient();
  const client = getInternalClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ── Conversations list ──
  const conversations = useQuery({
    queryKey: ["internal-wa-conversations", filters],
    queryFn: async () => {
      let q = supabase
        .from("internal_wa_conversations")
        .select("*")
        .order("last_message_at", { ascending: false });

      if (filters?.status) q = q.eq("status", filters.status);
      if (filters?.priority) q = q.eq("priority", filters.priority);
      if (filters?.assigned_agent_id) q = q.eq("assigned_agent_id", filters.assigned_agent_id);
      if (filters?.search) {
        q = q.or(`contact_name.ilike.%${filters.search}%,contact_phone.ilike.%${filters.search}%`);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as InternalConversation[];
    },
  });

  // ── Messages for selected conversation ──
  const messages = useQuery({
    queryKey: ["internal-wa-messages", selectedId],
    queryFn: async () => {
      if (!selectedId) return [];
      return client.getConversationHistory(selectedId, 100) as Promise<InternalMessage[]>;
    },
    enabled: !!selectedId,
  });

  // ── Current conversation object ──
  const currentConversation = conversations.data?.find((c) => c.id === selectedId) ?? null;

  // ── Send message mutation ──
  const sendMessage = useMutation({
    mutationFn: async (payload: { content: string; message_type?: "text" | "image" | "audio" | "document"; media_urls?: string[] }) => {
      if (!selectedId) throw new Error("Nenhuma conversa selecionada");
      return client.sendMessage({ conversation_id: selectedId, ...payload });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["internal-wa-messages", selectedId] });
      qc.invalidateQueries({ queryKey: ["internal-wa-conversations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Assign conversation ──
  const assignConversation = useMutation({
    mutationFn: async ({ conversationId, agentId }: { conversationId: string; agentId: string }) => {
      return client.assignConversation(conversationId, agentId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["internal-wa-conversations"] });
      toast.success("Conversa transferida");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Update status ──
  const updateStatus = useMutation({
    mutationFn: async ({ conversationId, status }: { conversationId: string; status: ConvStatus }) => {
      return client.updateConversationStatus(conversationId, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["internal-wa-conversations"] });
      toast.success("Status atualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Agent stats ──
  const agentStats = useQuery({
    queryKey: ["internal-wa-agent-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("internal_wa_agent_stats").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // ── Realtime subscription ──
  useEffect(() => {
    const channel = supabase
      .channel("internal-wa-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "internal_wa_messages" }, () => {
        qc.invalidateQueries({ queryKey: ["internal-wa-messages"] });
        qc.invalidateQueries({ queryKey: ["internal-wa-conversations"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "internal_wa_conversations" }, () => {
        qc.invalidateQueries({ queryKey: ["internal-wa-conversations"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  return {
    conversations,
    currentConversation,
    messages,
    selectedId,
    setSelectedId,
    sendMessage,
    assignConversation,
    updateStatus,
    agentStats,
  };
}
