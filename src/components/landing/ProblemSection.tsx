import { Star, Clock, TrendingDown, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

const painPoints = [
  {
    icon: Star,
    title: "Avaliações negativas sem resposta",
    text: "Cada avaliação ignorada é um cliente perdido. Seu concorrente responde em minutos — e você?",
    number: "72%",
    numberLabel: "dos clientes evitam negócios com avaliações ignoradas",
  },
  {
    icon: Clock,
    title: "Sem tempo para postar",
    text: "Posts no Google Meu Negócio geram até 35% mais visualizações, mas quem tem tempo para isso?",
    number: "35%",
    numberLabel: "mais visualizações com posts frequentes",
  },
  {
    icon: TrendingDown,
    title: "Jogando verba em ads sem retorno",
    text: "Keywords erradas, negativações ausentes — seu dinheiro escorre sem gerar ligações reais.",
    number: "R$800",
    numberLabel: "economia média mensal com otimização IA",
  },
];

export function ProblemSection() {
  return (
    <section className="py-28 md:py-36 bg-background relative">
      <div className="container max-w-5xl space-y-16">
        <Reveal className="text-center space-y-4 max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">Você se identifica?</h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            A maioria dos negócios locais enfrenta esses problemas diariamente.
          </p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {painPoints.map((p, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="group rounded-2xl border border-border/60 bg-card p-7 space-y-4 hover:border-border transition-colors duration-300 h-full flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-destructive/[0.06] flex items-center justify-center">
                  <p.icon className="h-5 w-5 text-destructive/70" />
                </div>
                <h3 className="text-base font-heading font-semibold">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.text}</p>
                <div className="pt-4 border-t border-border/40">
                  <span className="text-2xl font-heading font-bold text-foreground">{p.number}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.numberLabel}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="text-center">
          <a href="#como-funciona" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
            <span>Veja a solução</span>
            <ArrowDown className="h-3.5 w-3.5" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
