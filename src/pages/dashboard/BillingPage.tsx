import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CreditCard, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function BillingPage() {
  usePageTitle("Assinatura");
  const sub = useSubscriptionStatus();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPortal, setLoadingPortal] = useState(false);

  const openPortal = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session");
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error("Erro ao abrir portal de pagamento.");
    } finally {
      setLoadingPortal(false);
    }
  };

  const statusConfig = {
    active: { label: "Ativo", color: "bg-success text-success-foreground", icon: CheckCircle },
    trialing: { label: "Período de Teste", color: "bg-primary text-primary-foreground", icon: Clock },
    trial_profile: { label: "Período de Teste", color: "bg-primary text-primary-foreground", icon: Clock },
    past_due: { label: "Vencido (Carência)", color: "bg-warning text-warning-foreground", icon: AlertTriangle },
    canceled: { label: "Cancelado", color: "bg-destructive text-destructive-foreground", icon: AlertTriangle },
    unpaid: { label: "Não Pago", color: "bg-destructive text-destructive-foreground", icon: AlertTriangle },
    no_subscription: { label: "Sem Assinatura", color: "bg-muted text-muted-foreground", icon: CreditCard },
  };

  const current = statusConfig[sub.status] || statusConfig.no_subscription;
  const StatusIcon = current.icon;

  const planLabels: Record<string, string> = {
    starter: "Presença",
    pro: "Presença + Ads",
    agency_10: "Agência (10 contas)",
    trial: "Trial Gratuito",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assinatura</h1>
        <p className="text-muted-foreground">Gerencie seu plano e método de pagamento.</p>
      </div>

      {/* Grace Period Warning */}
      {sub.status === "past_due" && sub.graceDaysLeft !== null && (
        <div className="rounded-lg border border-warning/50 bg-warning/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">
              Sua assinatura venceu. Você tem {sub.graceDaysLeft} dia{sub.graceDaysLeft !== 1 ? "s" : ""} restante{sub.graceDaysLeft !== 1 ? "s" : ""} antes do bloqueio.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Regularize seu pagamento para manter o acesso a todas as funcionalidades.
            </p>
            <Button onClick={openPortal} className="mt-3" size="sm" disabled={loadingPortal}>
              <CreditCard className="h-4 w-4 mr-2" />
              Atualizar Pagamento
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Status da Assinatura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <StatusIcon className="h-6 w-6" />
              <Badge className={current.color}>{current.label}</Badge>
            </div>

            {sub.planType && (
              <div>
                <p className="text-sm text-muted-foreground">Plano</p>
                <p className="font-medium">{planLabels[sub.planType] || sub.planType}</p>
              </div>
            )}

            {sub.currentPeriodEnd && (
              <div>
                <p className="text-sm text-muted-foreground">
                  {sub.status === "trialing" || sub.status === "trial_profile" ? "Trial termina em" : "Próximo vencimento"}
                </p>
                <p className="font-medium">
                  {new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              </div>
            )}

            {sub.cancelAtPeriodEnd && (
              <p className="text-sm text-warning font-medium">⚠️ Assinatura será cancelada no fim do período.</p>
            )}
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(sub.status === "active" || sub.status === "past_due") && (
              <Button onClick={openPortal} variant="outline" className="w-full justify-start" disabled={loadingPortal}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Gerenciar Assinatura (Stripe)
              </Button>
            )}

            {(sub.status === "canceled" || sub.status === "unpaid" || sub.status === "no_subscription") && (
              <Button onClick={() => navigate("/pricing")} className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Escolher um Plano
              </Button>
            )}

            {(sub.status === "trialing" || sub.status === "trial_profile") && (
              <Button onClick={() => navigate("/pricing")} variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Fazer Upgrade
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
