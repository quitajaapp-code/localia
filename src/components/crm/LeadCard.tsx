import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, MessageSquare, Phone } from "lucide-react";
import type { Lead } from "@/pages/admin/AdminCRM";

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual",
  whatsapp: "WhatsApp",
  site: "Site",
  indicacao: "Indicação",
  ads: "Ads",
};

interface LeadCardProps {
  lead: Lead;
  scoreColor: (score: number) => string;
  onDragStart: (id: string) => void;
  onClick: (lead: Lead) => void;
}

export function LeadCard({ lead, scoreColor, onDragStart, onClick }: LeadCardProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(lead.id)}
      onClick={() => onClick(lead)}
      className="bg-card border border-border rounded-xl p-3 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {lead.nome.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium leading-tight">{lead.nome}</span>
        </div>
        {lead.score > 0 && (
          <Badge className={`text-xs ${scoreColor(lead.score)}`}>
            {lead.score}
          </Badge>
        )}
      </div>

      {lead.empresa && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <Building2 className="h-3 w-3" />
          {lead.empresa}
        </div>
      )}
      {lead.cidade && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <MapPin className="h-3 w-3" />
          {lead.cidade}, {lead.estado}
        </div>
      )}

      {/* Tags */}
      {lead.tags && lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {lead.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] py-0 px-1.5">{tag}</Badge>
          ))}
        </div>
      )}

      {lead.nicho && !lead.tags?.length && (
        <Badge variant="outline" className="text-xs mt-1">{lead.nicho}</Badge>
      )}

      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
        {lead.whatsapp && (
          <a
            href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-success hover:underline flex items-center gap-0.5"
          >
            <MessageSquare className="h-3 w-3" /> WA
          </a>
        )}
        {lead.telefone && (
          <a
            href={`tel:${lead.telefone}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-primary hover:underline flex items-center gap-0.5"
          >
            <Phone className="h-3 w-3" /> Ligar
          </a>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {SOURCE_LABELS[lead.source] || lead.source}
        </span>
      </div>
    </div>
  );
}
