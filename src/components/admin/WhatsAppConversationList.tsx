import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, AlertCircle } from "lucide-react";
import { getInitials } from "@/lib/whatsapp-utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { InternalConversation, ConvStatus } from "@/hooks/useInternalWhatsApp";

interface Props {
  conversations: InternalConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: ConvStatus | "";
  onStatusFilterChange: (v: ConvStatus | "") => void;
}

const statusColors: Record<string, string> = {
  open: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  closed: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
};

const priorityIcon: Record<string, boolean> = { high: true, urgent: true };

export function WhatsAppConversationList({
  conversations, selectedId, onSelect, search, onSearchChange, statusFilter, onStatusFilterChange,
}: Props) {
  return (
    <div className="flex flex-col h-full border-r">
      {/* Search + Filter */}
      <div className="p-3 space-y-2 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contato..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={statusFilter || "all"} onValueChange={(v) => onStatusFilterChange(v === "all" ? "" : v as ConvStatus)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Abertas</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="closed">Fechadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {conversations.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma conversa</p>
        )}
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full text-left px-3 py-3 border-b transition-colors hover:bg-accent/50 ${
              selectedId === c.id ? "bg-accent" : ""
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(c.contact_name || c.contact_phone)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-medium truncate">
                    {c.contact_name || c.contact_phone}
                  </span>
                  {priorityIcon[c.priority] && (
                    <AlertCircle className={`h-3.5 w-3.5 shrink-0 ${c.priority === "urgent" ? "text-destructive" : "text-amber-500"}`} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {c.contact_phone}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusColors[c.status] || ""}`}>
                    {c.status}
                  </Badge>
                  {c.last_message_at && (
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(c.last_message_at), { addSuffix: true, locale: ptBR })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </ScrollArea>
    </div>
  );
}
