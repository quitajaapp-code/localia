import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function OverduePage() {
  usePageTitle("Serviço Suspenso");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session");
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error("Erro ao abrir portal de pagamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold">Serviço Suspenso</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              O período de carência de 5 dias expirou e seu acesso foi temporariamente bloqueado por falta de pagamento.
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={openPortal} className="w-full" disabled={loading}>
              <CreditCard className="h-4 w-4 mr-2" />
              Regularizar Pagamento
            </Button>
            <Button onClick={() => navigate("/pricing")} variant="outline" className="w-full">
              Ver Planos
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Após o pagamento, seu acesso será restaurado automaticamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
