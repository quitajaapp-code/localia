import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Bell, Mail, MessageCircle, CheckCircle2, XCircle, Clock, Filter, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface Alert {
  id: string;
  agent: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string | null;
  metadata: Record<string, unknown> | null;
  notified_email: boolean;
  notified_whatsapp: boolean;
  read: boolean;
  created_at: string;
  review_id: string | null;
}

const severityConfig: Record<string, { label: string; variant: "destructive" | "default" | "secondary" | "outline" }> = {
  critical: { label: "Crítico", variant: "destructive" },
  high: { label: "Alto", variant: "default" },
  medium: { label: "Médio", variant: "secondary" },
  low: { label: "Baixo", variant: "outline" },
};

const alertTypeLabels: Record<string, string> = {
  urgent_review: "Avaliação urgente",
  pattern_detected: "Padrão detectado",
  negative_spike: "Pico negativo",
  response_needed: "Resposta necessária",
};

export default function AlertHistory() {
  usePageTitle("Histórico de Alertas");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterDelivery, setFilterDelivery] = useState<string>("all");

  useEffect(() => {
    if (!user) return;
    const fetchAlerts = async () => {
      setLoading(true);
      const { data: biz } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (!biz) { setLoading(false); return; }

      const { data } = await supabase
        .from("agent_alerts")
        .select("*")
        .eq("business_id", biz.id)
        .order("created_at", { ascending: false })
        .limit(100);

      setAlerts((data as Alert[]) || []);
      setLoading(false);

      // Mark all as read
      await supabase
        .from("agent_alerts")
        .update({ read: true })
        .eq("business_id", biz.id)
        .eq("read", false);
    };
    fetchAlerts();
  }, [user]);

  const filtered = alerts.filter((a) => {
    if (filterSeverity !== "all" && a.severity !== filterSeverity) return false;
    if (filterDelivery === "email" && !a.notified_email) return false;
    if (filterDelivery === "whatsapp" && !a.notified_whatsapp) return false;
    if (filterDelivery === "none" && (a.notified_email || a.notified_whatsapp)) return false;
    return true;
  });

  const stats = {
    total: alerts.length,
    emailSent: alerts.filter((a) => a.notified_email).length,
    whatsappSent: alerts.filter((a) => a.notified_whatsapp).length,
    pending: alerts.filter((a) => !a.notified_email && !a.notified_whatsapp).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/agents")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Histórico de Alertas</h1>
          <p className="text-sm text-muted-foreground">Acompanhe todos os alertas enviados e seus status de entrega</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total de alertas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Mail className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.emailSent}</p>
              <p className="text-xs text-muted-foreground">Email enviado</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <MessageCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.whatsappSent}</p>
              <p className="text-xs text-muted-foreground">WhatsApp enviado</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Sem notificação</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas severidades</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="low">Baixo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDelivery} onValueChange={setFilterDelivery}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Entrega" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="email">Email enviado</SelectItem>
                <SelectItem value="whatsapp">WhatsApp enviado</SelectItem>
                <SelectItem value="none">Sem notificação</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground ml-auto">{filtered.length} alertas</span>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alertas Enviados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Nenhum alerta encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead className="text-center">Email</TableHead>
                    <TableHead className="text-center">WhatsApp</TableHead>
                    <TableHead className="text-center">Lido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((alert) => {
                    const sev = severityConfig[alert.severity] || severityConfig.high;
                    return (
                      <TableRow key={alert.id} className={!alert.read ? "bg-accent/30" : ""}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          <span title={format(new Date(alert.created_at), "dd/MM/yyyy HH:mm")}>
                            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">{alertTypeLabels[alert.alert_type] || alert.alert_type}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={sev.variant} className="text-[10px]">{sev.label}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate text-sm font-medium">{alert.title}</TableCell>
                        <TableCell className="text-center">
                          {alert.notified_email ? (
                            <CheckCircle2 className="h-4 w-4 text-success mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {alert.notified_whatsapp ? (
                            <CheckCircle2 className="h-4 w-4 text-success mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {alert.read ? (
                            <Eye className="h-4 w-4 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="inline-block w-2 h-2 rounded-full bg-primary mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
