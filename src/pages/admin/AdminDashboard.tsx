import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, CreditCard, Ticket } from "lucide-react";

interface Metrics {
  totalUsers: number;
  totalBusinesses: number;
  planBreakdown: Record<string, number>;
  activeCoupons: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    totalBusinesses: 0,
    planBreakdown: {},
    activeCoupons: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [profiles, businesses, coupons] = await Promise.all([
        supabase.from("profiles").select("plano"),
        supabase.from("businesses").select("id", { count: "exact", head: true }),
        supabase.from("coupons").select("id", { count: "exact", head: true }).eq("active", true),
      ]);

      const planBreakdown: Record<string, number> = {};
      (profiles.data || []).forEach((p) => {
        const plan = p.plano || "trial";
        planBreakdown[plan] = (planBreakdown[plan] || 0) + 1;
      });

      setMetrics({
        totalUsers: (profiles.data || []).length,
        totalBusinesses: businesses.count || 0,
        planBreakdown,
        activeCoupons: coupons.count || 0,
      });
      setLoading(false);
    };
    fetch();
  }, []);

  const cards = [
    { label: "Total de Usuários", value: metrics.totalUsers, icon: Users, color: "text-primary" },
    { label: "Negócios Cadastrados", value: metrics.totalBusinesses, icon: Building2, color: "text-accent" },
    { label: "Cupons Ativos", value: metrics.activeCoupons, icon: Ticket, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Painel Administrativo</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{loading ? "…" : c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Distribuição de Planos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Carregando…</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(metrics.planBreakdown).map(([plan, count]) => (
                <div key={plan} className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground capitalize">{plan}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
