import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface LeadData {
  nome?: string;
  empresa?: string;
  cidade?: string;
  nicho?: string;
  whatsapp?: string;
  email?: string;
}

interface MessagePreviewProps {
  message: string;
  lead?: LeadData | null;
}

const SAMPLE_DATA: LeadData = {
  nome: "João Silva",
  empresa: "Tech Solutions",
  cidade: "São Paulo",
  nicho: "Tecnologia",
  whatsapp: "11999998888",
  email: "joao@techsolutions.com",
};

export function MessagePreview({ message, lead }: MessagePreviewProps) {
  if (!message) return null;

  const data = lead || SAMPLE_DATA;
  const resolved = message
    .replace(/\{\{nome\}\}/g, data.nome || "—")
    .replace(/\{\{empresa\}\}/g, data.empresa || "—")
    .replace(/\{\{cidade\}\}/g, data.cidade || "—")
    .replace(/\{\{nicho\}\}/g, data.nicho || "—")
    .replace(/\{\{whatsapp\}\}/g, data.whatsapp || "—")
    .replace(/\{\{email\}\}/g, data.email || "—");

  const hasVars = /\{\{\w+\}\}/.test(message);
  if (!hasVars) return null;

  return (
    <div className="rounded-md border border-border bg-muted/40 p-2.5 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Eye className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Preview
        </span>
        {!lead && (
          <Badge variant="secondary" className="text-[8px] py-0 ml-auto">
            Dados de exemplo
          </Badge>
        )}
      </div>
      <div className="bg-background rounded-md px-3 py-2 text-xs whitespace-pre-wrap leading-relaxed border border-border/50">
        {resolved}
      </div>
    </div>
  );
}
