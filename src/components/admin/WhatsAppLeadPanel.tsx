import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Building2, Mail, Phone, MapPin, Tag, Calendar, DollarSign } from "lucide-react";
import type { InternalConversation, ConvStatus } from "@/hooks/useInternalWhatsApp";

interface Props {
  conversation: InternalConversation | null;
  onUpdateStatus: (id: string, status: ConvStatus) => void;
}

export function WhatsAppLeadPanel({ conversation, onUpdateStatus }: Props) {
  const lead = useQuery({
    queryKey: ["lead-detail", conversation?.lead_id],
    queryFn: async () => {
      if (!conversation?.lead_id) return null;
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", conversation.lead_id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!conversation?.lead_id,
  });

  if (!conversation) {
    return (
      <div className="w-72 border-l hidden lg:flex items-center justify-center text-muted-foreground text-sm">
        Selecione uma conversa
      </div>
    );
  }

  const l = lead.data;

  return (
    <ScrollArea className="w-72 border-l hidden lg:block">
      <div className="p-4 space-y-4">
        {/* Contact info */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Contato</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span>{conversation.contact_phone}</span>
            </div>
            {conversation.contact_name && (
              <p className="font-medium">{conversation.contact_name}</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Lead CRM info */}
        {l ? (
          <div>
            <h3 className="text-sm font-semibold mb-2">Lead (CRM)</h3>
            <div className="space-y-1.5 text-sm">
              <p className="font-medium">{l.nome}</p>
              {l.empresa && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{l.empresa}</span>
                </div>
              )}
              {l.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{l.email}</span>
                </div>
              )}
              {(l.cidade || l.estado) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{[l.cidade, l.estado].filter(Boolean).join(", ")}</span>
                </div>
              )}
              {l.valor_estimado && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>R$ {Number(l.valor_estimado).toLocaleString("pt-BR")}</span>
                </div>
              )}
              {l.pipeline_stage && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{l.pipeline_stage}</Badge>
                </div>
              )}
              {l.tags && l.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap mt-1">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  {l.tags.map((t: string) => (
                    <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0">{t}</Badge>
                  ))}
                </div>
              )}
              {l.proximo_followup && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs">Follow-up: {new Date(l.proximo_followup).toLocaleDateString("pt-BR")}</span>
                </div>
              )}
              {l.notas && (
                <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground">
                  {l.notas}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Lead não vinculado</p>
        )}

        <Separator />

        {/* Tags */}
        {conversation.tags && conversation.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Tags da conversa</h3>
            <div className="flex flex-wrap gap-1">
              {conversation.tags.map((t) => (
                <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Quick actions */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Ações</h3>
          {conversation.status !== "closed" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => onUpdateStatus(conversation.id, "closed")}
            >
              Fechar conversa
            </Button>
          )}
          {conversation.status === "closed" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => onUpdateStatus(conversation.id, "open")}
            >
              Reabrir conversa
            </Button>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
