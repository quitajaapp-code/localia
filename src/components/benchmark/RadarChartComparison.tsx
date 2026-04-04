import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RadarDataPoint } from "@/hooks/useBenchmark";

interface Props {
  data: RadarDataPoint[];
}

export function RadarChartComparison({ data }: Props) {
  if (!data.length) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Comparativo com o Mercado</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={340}>
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
            />
            <PolarRadiusAxis tick={false} axisLine={false} />
            <Radar
              name="Meu Negócio"
              dataKey="meu"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Média Mercado"
              dataKey="mercado"
              stroke="hsl(var(--muted-foreground))"
              fill="hsl(var(--muted-foreground))"
              fillOpacity={0.15}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                color: "hsl(var(--foreground))",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
