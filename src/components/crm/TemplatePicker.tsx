import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Template = {
  id: string;
  nome: string;
  categoria: string;
  mensagem: string;
};

interface TemplatePickerProps {
  onSelect: (message: string, templateId?: string) => void;
}

export function TemplatePicker({ onSelect }: TemplatePickerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && templates.length === 0) {
      supabase
        .from("whatsapp_templates" as any)
        .select("id, nome, categoria, mensagem")
        .eq("ativo", true)
        .order("categoria")
        .then(({ data }) => setTemplates((data as any[]) || []));
    }
  }, [open]);

  const filtered = templates.filter(
    (t) =>
      !search ||
      t.nome.toLowerCase().includes(search.toLowerCase()) ||
      t.categoria.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
          <FileText className="h-3 w-3" /> Templates
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <div className="relative mb-2">
          <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>
        <ScrollArea className="max-h-52">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">Nenhum template</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelect(t.mensagem, t.id);
                    setOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium truncate">{t.nome}</span>
                    <Badge variant="secondary" className="text-[8px] py-0 shrink-0">
                      {t.categoria}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {t.mensagem.slice(0, 60)}...
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
