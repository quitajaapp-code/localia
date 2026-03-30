import { useState, useMemo } from "react";
import { useInternalWhatsApp, type ConvStatus } from "@/hooks/useInternalWhatsApp";
import { WhatsAppConversationList } from "@/components/admin/WhatsAppConversationList";
import { WhatsAppChatArea } from "@/components/admin/WhatsAppChatArea";
import { WhatsAppLeadPanel } from "@/components/admin/WhatsAppLeadPanel";

export default function WhatsAppInbox() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ConvStatus | "">("");

  const filters = useMemo(
    () => ({
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(search ? { search } : {}),
    }),
    [search, statusFilter]
  );

  const {
    conversations,
    currentConversation,
    messages,
    selectedId,
    setSelectedId,
    sendMessage,
    updateStatus,
  } = useInternalWhatsApp(filters);

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4 md:-m-6 lg:-m-8">
      {/* Left: conversation list */}
      <div className="w-80 shrink-0">
        <WhatsAppConversationList
          conversations={conversations.data || []}
          selectedId={selectedId}
          onSelect={setSelectedId}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </div>

      {/* Center: chat */}
      <WhatsAppChatArea
        conversation={currentConversation}
        messages={(messages.data as any[]) || []}
        isLoading={messages.isLoading}
        isSending={sendMessage.isPending}
        onSend={(content) => sendMessage.mutate({ content })}
      />

      {/* Right: lead panel */}
      <WhatsAppLeadPanel
        conversation={currentConversation}
        onUpdateStatus={(id, status) => updateStatus.mutate({ conversationId: id, status })}
      />
    </div>
  );
}
