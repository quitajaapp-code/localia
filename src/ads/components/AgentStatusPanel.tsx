import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Brain, FileText, Search, TrendingUp } from "lucide-react";

const AGENTS = [
  { name: "Strategy Agent", desc: "Define tipo e estrutura de campanha", icon: Brain, status: "ativo" },
  { name: "Keyword Agent", desc: "Gera keywords positivas e negativas", icon: Search, status: "ativo" },
  { name: "AdCopy Agent", desc: "Cria headlines e descrições otimizadas", icon: FileText, status: "ativo" },
  { name: "Optimization Agent", desc: "Monitora e otimiza performance", icon: TrendingUp, status: "ativo" },
];

export function AgentStatusPanel() {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Agentes IA de Ads</h3>
        </div>
        <div className="space-y-3">
          {AGENTS.map((agent) => (
            <div key={agent.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
              <agent.icon className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{agent.name}</p>
                <p className="text-xs text-muted-foreground">{agent.desc}</p>
              </div>
              <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                {agent.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
