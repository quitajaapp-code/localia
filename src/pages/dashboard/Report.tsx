import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import {
  Download, Mail, Sparkles, Eye, MousePointerClick, Phone, Route, Image,
  Search, Star, MessageSquare, FileText, TrendingUp, TrendingDown, Megaphone,
  CheckCircle, ArrowRight, Lightbulb, BarChart3
} from "lucide-react";

const GMB_WEEKS = [
  { semana: "Sem 1", busca: 820, maps: 340, cliques: 45, ligacoes: 12 },
  { semana: "Sem 2", busca: 910, maps: 380, cliques: 52, ligacoes: 15 },
  { semana: "Sem 3", busca: 870, maps: 360, cliques: 48, ligacoes: 11 },
  { semana: "Sem 4", busca: 1050, maps: 420, cliques: 61, ligacoes: 18 },
];

const ADS_DAYS = [
  { dia: "Seg", cliques: 12 }, { dia: "Ter", cliques: 18 }, { dia: "Qua", cliques: 15 },
  { dia: "Qui", cliques: 22 }, { dia: "Sex", cliques: 25 }, { dia: "Sáb", cliques: 8 },
  { dia: "Dom", cliques: 5 },
];

const TOP_KEYWORDS = [
  { termo: "dentista zona sul", cliques: 24, ctr: "13.3%" },
  { termo: "clareamento dental", cliques: 18, ctr: "8.6%" },
  { termo: "dentista perto de mim", cliques: 15, ctr: "4.7%" },
  { termo: "implante dentário preço", cliques: 12, ctr: "12.6%" },
  { termo: "emergência dentista", cliques: 8, ctr: "17.8%" },
];

const AI_ACTIONS = [
  { dia: "Segunda", acao: '1 post publicado sobre "Dicas de higiene bucal"', icon: FileText },
  { dia: "Terça", acao: "Respondida avaliação de Maria Silva (5★)", icon: MessageSquare },
  { dia: "Quarta", acao: '1 post publicado sobre "Promoção de clareamento"', icon: FileText },
  { dia: "Quinta", acao: "Respondida avaliação de João Santos (3★) com tom empático", icon: MessageSquare },
  { dia: "Sexta", acao: "8 keywords negativas adicionadas — economia estimada R$95/mês", icon: Megaphone },
  { dia: "Sábado", acao: "Lance ajustado em 3 keywords de alta intenção", icon: TrendingUp },
];

const NEXT_STEPS = [
  { titulo: "Adicionar fotos do cardápio", desc: "Pode aumentar visualizações em 40%", action: "/dashboard/materials", label: "Ir para materiais" },
  { titulo: "Responder 2 avaliações pendentes", desc: "Melhora o ranking no Google Maps", action: "/dashboard/reviews", label: "Ver avaliações" },
  { titulo: "Aumentar verba de Ads em R$100", desc: "Potencial de +30 cliques/semana", action: "/dashboard/ads", label: "Gerenciar Ads" },
];

const NOTA_EVOLUTION = [
  { semana: "Sem 1", nota: 4.2 }, { semana: "Sem 2", nota: 4.3 },
  { semana: "Sem 3", nota: 4.3 }, { semana: "Sem 4", nota: 4.5 },
];

function getWeekRange(period: string) {
  const now = new Date();
  const dow = now.getDay();
  const diffToMon = dow === 0 ? 6 : dow - 1;
  if (period === "passada") {
    const end = new Date(now); end.setDate(now.getDate() - diffToMon - 1);
    const start = new Date(end); start.setDate(end.getDate() - 6);
    return { start, end };
  }
  if (period === "30dias") {
    const end = new Date(now);
    const start = new Date(now); start.setDate(now.getDate() - 30);
    return { start, end };
  }
  const start = new Date(now); start.setDate(now.getDate() - diffToMon);
  return { start, end: now };
}

function fmt(d: Date) { return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }); }

function MetricCard({ icon: Icon, label, value, change, positive }: {
  icon: React.ElementType; label: string; value: string; change: string; positive: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${positive ? "text-green-600" : "text-red-500"}`}>
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {change}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Report() {
  usePageTitle("Relatório");
  const navigate = useNavigate();
  const [period, setPeriod] = useState("atual");
  const { start, end } = getWeekRange(period);
  const gmbData = GMB_WEEKS[3];
  const prevGmb = GMB_WEEKS[2];
  const pct = (a: number, b: number) => `+${((a - b) / b * 100).toFixed(0)}%`;

  return (
    <div className="max-w-4xl mx-auto print:max-w-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Relatório da semana de {fmt(start)} a {fmt(end)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Visão completa da sua presença digital</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="atual">Esta semana</SelectItem>
              <SelectItem value="passada">Semana passada</SelectItem>
              <SelectItem value="30dias">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => { window.print(); toast.success("Preparando PDF..."); }}>
            <Download className="h-4 w-4 mr-1" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info("Envio por e-mail em breve")}>
            <Mail className="h-4 w-4 mr-1" /> E-mail
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* 1. Resumo Executivo */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <Sparkles className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="font-heading font-bold text-lg text-foreground">Resumo Executivo</h2>
                  <Badge className="bg-green-100 text-green-700">Bom</Badge>
                </div>
                <p className="text-foreground leading-relaxed">
                  Essa semana seu negócio foi visto <strong>{gmbData.busca.toLocaleString("pt-BR")} vezes na Busca</strong> e{" "}
                  <strong>{gmbData.maps} vezes no Maps</strong>.{" "}
                  <strong>{gmbData.ligacoes} pessoas clicaram para ligar</strong> e{" "}
                  <strong>9 pediram rota</strong>. Seus anúncios geraram{" "}
                  <strong>105 cliques</strong> com custo médio de <strong>R$3,56</strong>. Nota das avaliações subiu para <strong>4.5★</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. GMB */}
        <div>
          <h2 className="text-lg font-heading font-bold text-foreground mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" /> Presença no Google
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <MetricCard icon={Search} label="Busca" value={gmbData.busca.toLocaleString("pt-BR")} change={pct(gmbData.busca, prevGmb.busca)} positive />
            <MetricCard icon={Eye} label="Maps" value={gmbData.maps.toString()} change={pct(gmbData.maps, prevGmb.maps)} positive />
            <MetricCard icon={MousePointerClick} label="Cliques" value={gmbData.cliques.toString()} change={pct(gmbData.cliques, prevGmb.cliques)} positive />
            <MetricCard icon={Phone} label="Ligações" value={gmbData.ligacoes.toString()} change={pct(gmbData.ligacoes, prevGmb.ligacoes)} positive />
            <MetricCard icon={Route} label="Rotas" value="9" change="+12%" positive />
            <MetricCard icon={Image} label="Fotos" value="234" change="-5%" positive={false} />
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm">Evolução — 4 semanas</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={GMB_WEEKS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="semana" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip /><Legend />
                  <Line type="monotone" dataKey="busca" name="Busca" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="maps" name="Maps" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 3. Avaliações */}
        <div>
          <h2 className="text-lg font-heading font-bold text-foreground mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-warning" /> Avaliações
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card><CardContent className="pt-5 pb-4 text-center">
              <div className="flex items-center justify-center gap-0.5 mb-1">
                {[1,2,3,4].map(i => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}
                <Star className="h-4 w-4 fill-warning/50 text-warning" />
              </div>
              <p className="text-3xl font-bold text-foreground">4.5</p>
              <p className="text-xs text-muted-foreground">Nota média</p>
            </CardContent></Card>
            <Card><CardContent className="pt-5 pb-4 text-center">
              <p className="text-3xl font-bold text-foreground">7</p>
              <p className="text-xs text-muted-foreground">Novas</p>
              <div className="flex justify-center gap-1 mt-1">
                <Badge className="bg-green-100 text-green-700 text-xs">5+</Badge>
                <Badge variant="destructive" className="text-xs">2-</Badge>
              </div>
            </CardContent></Card>
            <Card><CardContent className="pt-5 pb-4 text-center">
              <p className="text-3xl font-bold text-foreground">86%</p>
              <p className="text-xs text-muted-foreground">Respondidas</p>
              <Badge className="bg-green-100 text-green-700 text-xs mt-1">Ótimo</Badge>
            </CardContent></Card>
            <Card><CardContent className="pt-5 pb-4">
              <p className="text-xs text-muted-foreground mb-1 text-center">Evolução</p>
              <ResponsiveContainer width="100%" height={50}>
                <LineChart data={NOTA_EVOLUTION}>
                  <Line type="monotone" dataKey="nota" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent></Card>
          </div>
        </div>

        {/* 4. Posts */}
        <div>
          <h2 className="text-lg font-heading font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Posts Publicados
          </h2>
          <Card><CardContent className="py-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">3 posts publicados esta semana</p>
                <p className="text-sm text-muted-foreground">Gerados automaticamente pela IA</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { data: "Seg, 24/03", texto: "🦷 Sabia que o clareamento dental pode ser feito em apenas 1 sessão?" },
                { data: "Qua, 26/03", texto: "✨ Promoção de março! Limpeza + avaliação por R$99." },
                { data: "Sex, 28/03", texto: "😊 Medo de dentista? Conheça nosso atendimento humanizado." },
              ].map((post, i) => (
                <div key={i} className={`p-3 rounded-lg border text-sm ${i === 1 ? "border-primary/40 bg-primary/5" : ""}`}>
                  {i === 1 && <Badge className="text-xs mb-2 bg-primary/10 text-primary">Mais engajamento</Badge>}
                  <p className="text-xs text-muted-foreground mb-1">{post.data}</p>
                  <p className="text-foreground line-clamp-3">{post.texto}</p>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </div>

        {/* 5. Ads */}
        <div>
          <h2 className="text-lg font-heading font-bold text-foreground mb-4 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" /> Google Ads
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <MetricCard icon={BarChart3} label="Gasto" value="R$285" change="de R$500" positive />
            <MetricCard icon={Eye} label="Impressões" value="3.240" change="+18%" positive />
            <MetricCard icon={MousePointerClick} label="Cliques" value="105" change="+22%" positive />
            <MetricCard icon={TrendingUp} label="CTR" value="3.24%" change="+0.4%" positive />
            <MetricCard icon={BarChart3} label="CPC" value="R$2.71" change="-8%" positive />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Cliques por dia</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ADS_DAYS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="dia" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="cliques" name="Cliques" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Top 5 Keywords</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Keyword</TableHead>
                    <TableHead className="text-xs text-right">Cliques</TableHead>
                    <TableHead className="text-xs text-right">CTR</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {TOP_KEYWORDS.map((kw, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs font-medium">{kw.termo}</TableCell>
                        <TableCell className="text-xs text-right">{kw.cliques}</TableCell>
                        <TableCell className="text-xs text-right">{kw.ctr}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 6. Ações IA */}
        <div>
          <h2 className="text-lg font-heading font-bold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Ações da IA
          </h2>
          <Card><CardContent className="py-4 space-y-3">
            {AI_ACTIONS.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <a.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-medium text-muted-foreground">{a.dia}</span>
                  <p className="text-sm text-foreground">{a.acao}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-1" />
              </div>
            ))}
          </CardContent></Card>
        </div>

        {/* 7. Próximos Passos */}
        <div>
          <h2 className="text-lg font-heading font-bold text-foreground mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" /> Próximos Passos
          </h2>
          <div className="grid gap-3">
            {NEXT_STEPS.map((s, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-warning">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground">{s.titulo}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                  <Button variant="outline" size="sm" className="print:hidden" onClick={() => navigate(s.action)}>
                    {s.label} <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <style>{`@media print { .print\\:hidden { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>
    </div>
  );
}
