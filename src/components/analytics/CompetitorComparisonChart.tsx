import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GapAnalysis, CompetitorMetric } from "@/hooks/useCompetitorAnalysis";

interface Props {
  gapData: GapAnalysis[];
  metricsHistory: CompetitorMetric[];
}

export function CompetitorComparisonChart({ gapData, metricsHistory }: Props) {
  const barData = gapData.map((g) => ({
    metric: g.metric,
    "Meu Negócio": g.myValue,
    "Média Concorrentes": g.avgCompetitor,
  }));

  // Aggregate history by month
  const historyByMonth = new Map<string, { sum: number; count: number }>();
  metricsHistory.forEach((m) => {
    const month = m.snapshot_date.slice(0, 7);
    const prev = historyByMonth.get(month) ?? { sum: 0, count: 0 };
    historyByMonth.set(month, { sum: prev.sum + (m.rating ?? 0), count: prev.count + 1 });
  });
  const lineData = Array.from(historyByMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { sum, count }]) => ({
      month,
      "Nota Média Concorrentes": +(sum / count).toFixed(2),
    }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Comparativo de Mercado</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bars">
          <TabsList className="mb-4">
            <TabsTrigger value="bars">Comparação</TabsTrigger>
            <TabsTrigger value="history">Evolução</TabsTrigger>
          </TabsList>

          <TabsContent value="bars">
            {barData.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="metric" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--background))" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend />
                  <Bar dataKey="Meu Negócio" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Média Concorrentes" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">Sem dados para comparar ainda.</p>
            )}
          </TabsContent>

          <TabsContent value="history">
            {lineData.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--background))" }}
                  />
                  <Line type="monotone" dataKey="Nota Média Concorrentes" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">Histórico indisponível. Aguarde a coleta de dados.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
