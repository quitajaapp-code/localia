import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { Download, MessageSquare, Clock, Users, TrendingUp } from "lucide-react";
import { useState, useMemo } from "react";
import { format, subDays, startOfDay, isAfter } from "date-fns";

type Period = "7d" | "30d" | "90d";

export default function WhatsAppReports() {
  const [period, setPeriod] = useState<Period>("30d");

  const daysBack = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const since = subDays(new Date(), daysBack).toISOString();

  // ── Conversations ──
  const conversations = useQuery({
    queryKey: ["wa-report-convs", period],
    queryFn: async () => {
      const { data } = await supabase
        .from("internal_wa_conversations")
        .select("id, status, assigned_agent_id, created_at, lead_id")
        .gte("created_at", since);
      return (data || []) as any[];
    },
  });

  // ── Messages ──
  const messages = useQuery({
    queryKey: ["wa-report-msgs", period],
    queryFn: async () => {
      const { data } = await supabase
        .from("internal_wa_messages")
        .select("id, direction, created_at, conversation_id")
        .gte("created_at", since);
      return (data || []) as any[];
    },
  });

  // ── Agent Stats ──
  const agentStats = useQuery({
    queryKey: ["wa-report-agents"],
    queryFn: async () => {
      const { data } = await supabase.from("internal_wa_agent_stats").select("*");
      return (data || []) as any[];
    },
  });

  // ── Computed metrics ──
  const metrics = useMemo(() => {
    const convs = conversations.data || [];
    const msgs = messages.data || [];
    const total = convs.length;
    const open = convs.filter((c: any) => c.status === "open").length;
    const closed = convs.filter((c: any) => c.status === "closed").length;
    const withLead = convs.filter((c: any) => c.lead_id).length;
    const inbound = msgs.filter((m: any) => m.direction === "inbound").length;
    const outbound = msgs.filter((m: any) => m.direction === "outbound").length;
    return { total, open, closed, withLead, inbound, outbound, totalMsgs: msgs.length };
  }, [conversations.data, messages.data]);

  // ── Daily chart data ──
  const dailyData = useMemo(() => {
    const msgs = messages.data || [];
    const map: Record<string, { date: string; inbound: number; outbound: number }> = {};
    for (let i = 0; i < daysBack; i++) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      map[d] = { date: format(subDays(new Date(), i), "dd/MM"), inbound: 0, outbound: 0 };
    }
    msgs.forEach((m: any) => {
      const d = format(new Date(m.created_at), "yyyy-MM-dd");
      if (map[d]) map[d][m.direction as "inbound" | "outbound"]++;
    });
    return Object.values(map).reverse();
  }, [messages.data, daysBack]);

  // ── Agent chart data ──
  const agentData = useMemo(() => {
    return (agentStats.data || []).map((a: any) => ({
      agent: a.agent_id.slice(0, 8),
      abertas: a.conversations_open,
      fechadas: a.conversations_closed,
      enviadas: a.messages_sent,
    }));
  }, [agentStats.data]);

  // ── CSV Export ──
  const exportCSV = () => {
    const rows = [["Data", "Recebidas", "Enviadas"], ...dailyData.map((d) => [d.date, d.inbound, d.outbound])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `whatsapp-report-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isLoading = conversations.isLoading || messages.isLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold">WhatsApp — Relatórios</h1>
          <p className="text-sm text-muted-foreground">Métricas de atendimento da equipe.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs">Conversas</span>
          </div>
          <p className="text-2xl font-bold">{isLoading ? "..." : metrics.total}</p>
          <p className="text-xs text-muted-foreground">{metrics.open} abertas · {metrics.closed} fechadas</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Mensagens</span>
          </div>
          <p className="text-2xl font-bold">{isLoading ? "..." : metrics.totalMsgs}</p>
          <p className="text-xs text-muted-foreground">{metrics.inbound} recebidas · {metrics.outbound} enviadas</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs">Leads Vinculados</span>
          </div>
          <p className="text-2xl font-bold">{isLoading ? "..." : metrics.withLead}</p>
          <p className="text-xs text-muted-foreground">de {metrics.total} conversas</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Agentes</span>
          </div>
          <p className="text-2xl font-bold">{agentStats.data?.length || 0}</p>
          <p className="text-xs text-muted-foreground">ativos no período</p>
        </Card>
      </div>

      {/* Daily messages chart */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-4">Mensagens por Dia</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="inbound" name="Recebidas" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="outbound" name="Enviadas" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Agent performance */}
      {agentData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Performance por Agente</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="agent" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="abertas" name="Abertas" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fechadas" name="Fechadas" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="enviadas" name="Enviadas" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
