import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { AlertTriangle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export function GracePeriodBanner() {
  const { status, graceDaysLeft } = useSubscriptionStatus();
  const [loading, setLoading] = useState(false);

  if (status !== "past_due" || graceDaysLeft === null) return null;

  const openPortal = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session");
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error("Erro ao abrir portal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-warning/10 border-b border-warning/30 px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
        <span>
          <strong>Assinatura vencida.</strong> Restam {graceDaysLeft} dia{graceDaysLeft !== 1 ? "s" : ""} de carência.
        </span>
      </div>
      <Button size="sm" variant="outline" onClick={openPortal} disabled={loading} className="shrink-0">
        <CreditCard className="h-3 w-3 mr-1" />
        Renovar
      </Button>
    </div>
  );
}
