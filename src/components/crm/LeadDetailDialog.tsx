import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, MessageSquare, Phone, MapPin } from "lucide-react";
import type { Lead } from "@/pages/admin/AdminCRM";

interface LeadDetailDialogProps {
  lead: Lead;
  onClose: () => void;
  scoreColor: (score: number) => string;
}

export function LeadDetailDialog({ lead, onClose, scoreColor }: LeadDetailDialogProps) {
  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {lead.nome.charAt(0)}
            </div>
            {lead.nome}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          {lead.empresa && <div className="flex gap-2"><Building2 className="h-4 w-4 text-muted-foreground mt-0.5" /><span>{lead.empresa}</span></div>}
          {lead.email && <div className="flex gap-2"><Mail className="h-4 w-4 text-muted-foreground mt-0.5" /><a href={`mailto:${lead.email}`} className="text-primary">{lead.email}</a></div>}
          {lead.whatsapp && <div className="flex gap-2"><MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" /><a href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="text-success">{lead.whatsapp}</a></div>}
          {lead.telefone && <div className="flex gap-2"><Phone className="h-4 w-4 text-muted-foreground mt-0.5" /><a href={`tel:${lead.telefone}`} className="text-primary">{lead.telefone}</a></div>}
          {lead.cidade && <div className="flex gap-2"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5" /><span>{lead.cidade}, {lead.estado}</span></div>}

          {lead.tags && lead.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {lead.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}

          {lead.notas && <div className="p-3 bg-muted rounded-lg text-muted-foreground">{lead.notas}</div>}
          <div className="flex items-center gap-3 pt-2">
            <Badge className={scoreColor(lead.score)}>Score: {lead.score}</Badge>
            {lead.valor_estimado && <span className="text-success font-medium">R${lead.valor_estimado.toLocaleString("pt-BR")}</span>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
