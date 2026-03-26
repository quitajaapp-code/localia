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
    <section className="py-32 bg-background relative noise-overlay">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,hsl(var(--destructive)/0.02),transparent)]" />
      <div className="container space-y-20 relative z-10">
        <Reveal className="text-center space-y-5 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-destructive uppercase tracking-wider">O problema</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight leading-[1.1]">Você se identifica?</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            A maioria dos negócios locais enfrenta esses problemas diariamente.
          </p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {painPoints.map((p, i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="group rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-8 space-y-5 hover:shadow-medium hover:-translate-y-1.5 hover:border-destructive/15 transition-all duration-400 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-destructive/[0.06] flex items-center justify-center group-hover:bg-destructive/10 group-hover:scale-105 transition-all duration-400">
                  <p.icon className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-lg font-heading font-bold">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.text}</p>
                {/* Data anchor */}
                <div className="pt-5 border-t border-border/30">
                  <span className="text-2xl font-heading font-extrabold text-destructive">{p.number}</span>
                  <p className="text-xs text-muted-foreground mt-1">{p.numberLabel}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        {/* Visual direction cue */}
        <Reveal className="text-center">
          <a href="#como-funciona" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-300 group">
            <span>Veja a solução</span>
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
