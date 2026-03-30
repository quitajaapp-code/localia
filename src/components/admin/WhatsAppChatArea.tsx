import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, Zap, MessageSquare, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { generateQuickReplies } from "@/lib/whatsapp-utils";
import type { InternalMessage, InternalConversation } from "@/hooks/useInternalWhatsApp";

interface Props {
  conversation: InternalConversation | null;
  messages: InternalMessage[];
  isLoading: boolean;
  isSending: boolean;
  onSend: (content: string) => void;
}

const statusIcon: Record<string, string> = {
  sent: "text-muted-foreground",
  delivered: "text-muted-foreground",
  read: "text-blue-500",
  failed: "text-destructive",
};

export function WhatsAppChatArea({ conversation, messages, isLoading, isSending, onSend }: Props) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const msg = text.trim();
    if (!msg || isSending) return;
    onSend(msg);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickReplies = generateQuickReplies({
    contactName: conversation?.contact_name || undefined,
  });

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <MessageSquare className="h-12 w-12 mx-auto opacity-30" />
          <p className="text-sm">Selecione uma conversa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">{conversation.contact_name || conversation.contact_phone}</p>
          <p className="text-xs text-muted-foreground">{conversation.contact_phone}</p>
        </div>
        <Badge variant="outline" className="text-xs capitalize">{conversation.status}</Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3">
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground py-8">Carregando...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">Nenhuma mensagem</p>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => {
              const isOutbound = m.direction === "outbound";
              return (
                <div key={m.id} className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                      isOutbound
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${isOutbound ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      <span className="text-[10px]">
                        {format(new Date(m.created_at), "HH:mm")}
                      </span>
                      {isOutbound && (
                        <CheckCheck className={`h-3 w-3 ${statusIcon[m.status] || ""}`} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9">
                <Zap className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2" align="start">
              <p className="text-xs font-medium mb-2 px-1">Respostas rápidas</p>
              {quickReplies.map((r, i) => (
                <button
                  key={i}
                  className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-accent truncate"
                  onClick={() => setText(r)}
                >
                  {r}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="min-h-[40px] max-h-[120px] resize-none text-sm"
            rows={1}
          />

          <Button
            size="icon"
            className="shrink-0 h-9 w-9"
            disabled={!text.trim() || isSending}
            onClick={handleSend}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
