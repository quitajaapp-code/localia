import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface InviteClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLink: (businessId: string) => void;
  isLinking: boolean;
  currentCount: number;
  maxCount: number;
}

interface FoundBusiness {
  id: string;
  nome: string;
  nicho: string | null;
  cidade: string | null;
}

export function InviteClientModal({ open, onOpenChange, onLink, isLinking, currentCount, maxCount }: InviteClientModalProps) {
  const [email, setEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<FoundBusiness[]>([]);
  const atLimit = currentCount >= maxCount;

  const handleSearch = async () => {
    if (!email.trim()) return;
    setSearching(true);
    try {
      // Find user by email in profiles, then find their businesses
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", email.trim())
        .maybeSingle();

      if (!profile) {
        toast.error("Nenhum usuário encontrado com este email.");
        setResults([]);
        return;
      }

      const { data: businesses } = await supabase
        .from("businesses")
        .select("id, nome, nicho, cidade")
        .eq("user_id", profile.user_id)
        .is("agency_id" as any, null);

      setResults((businesses as FoundBusiness[]) ?? []);
      if (!businesses?.length) {
        toast.info("Este usuário não possui negócios disponíveis para vincular.");
      }
    } catch {
      toast.error("Erro ao buscar.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Adicionar Cliente
          </DialogTitle>
          <DialogDescription>
            Busque pelo email do dono do negócio para vinculá-lo à sua agência.
            <span className="block mt-1 font-medium text-foreground">
              {currentCount}/{maxCount} clientes
            </span>
          </DialogDescription>
        </DialogHeader>

        {atLimit ? (
          <div className="py-6 text-center">
            <p className="text-destructive font-medium">Limite de clientes atingido!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Entre em contato para fazer upgrade do seu plano.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <Label>Email do cliente</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="cliente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={searching} size="icon" variant="secondary">
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {results.length > 0 && (
              <div className="space-y-2 mt-2">
                <Label>Negócios encontrados</Label>
                {results.map((biz) => (
                  <div key={biz.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium text-sm">{biz.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {biz.nicho} • {biz.cidade}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onLink(biz.id)}
                      disabled={isLinking}
                    >
                      {isLinking ? <Loader2 className="h-3 w-3 animate-spin" /> : "Vincular"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
