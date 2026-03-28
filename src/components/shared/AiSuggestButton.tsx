import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AiSuggestButtonProps {
  field: string;
  context: Record<string, string>;
  onSuggestion: (text: string) => void;
}

export default function AiSuggestButton({ field, context, onSuggestion }: AiSuggestButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-suggest-field", {
        body: { field, context },
      });

      if (error) throw error;
      if (data?.suggestion) {
        onSuggestion(data.suggestion);
        toast({ title: "Sugestão gerada!", description: "Você pode editar o texto como quiser." });
      }
    } catch (err) {
      console.error("AI suggest error:", err);
      toast({ title: "Erro ao gerar sugestão", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleSuggest}
      disabled={loading}
      className="h-7 px-2 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
      title="Sugestão da IA"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5" />
      )}
      IA
    </Button>
  );
}
