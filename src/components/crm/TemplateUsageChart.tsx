import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { startOfWeek, format, parseISO, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UsageRow {
  enviado_em: string;
  respondido: boolean;
}

interface TemplateUsageChartProps {
  usageRows: UsageRow[];
}

export function TemplateUsageChart({ usageRows }: TemplateUsageChartProps) {
  const chartData = useMemo(() => {
    const now = new Date();
    const weeks: Record<string, { envios: number; respostas: number }> = {};

    // Init last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const key = format(weekStart, "yyyy-MM-dd");
      weeks[key] = { envios: 0, respostas: 0 };
    }

    usageRows.forEach((row) => {
      const date = parseISO(row.enviado_em);
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const key = format(weekStart, "yyyy-MM-dd");
      if (weeks[key]) {
        weeks[key].envios++;
        if (row.respondido) weeks[key].respostas++;
      }
    });

    return Object.entries(weeks).map(([key, val]) => ({
      semana: format(parseISO(key), "dd MMM", { locale: ptBR }),
      ...val,
    }));
  }, [usageRows]);

  const hasData = chartData.some((d) => d.envios > 0 || d.respostas > 0);

  if (!hasData) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Nenhum dado de uso ainda. Os envios aparecerão aqui automaticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold mb-3">Evolução semanal</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradEnvios" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradRespostas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="semana" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Area
            type="monotone"
            dataKey="envios"
            name="Envios"
            stroke="hsl(var(--primary))"
            fill="url(#gradEnvios)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="respostas"
            name="Respostas"
            stroke="hsl(var(--accent))"
            fill="url(#gradRespostas)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
