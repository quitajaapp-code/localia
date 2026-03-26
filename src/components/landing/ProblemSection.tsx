import { Star, Clock, TrendingDown } from "lucide-react";
import { Reveal } from "./Reveal";

const painPoints = [
  {
    icon: Star,
    title: "Avaliações negativas sem resposta",
    text: "Cada avaliação ignorada é um cliente perdido. Seu concorrente responde em minutos — e você?",
  },
  {
    icon: Clock,
    title: "Sem tempo para postar",
    text: "Posts no Google Meu Negócio geram até 35% mais visualizações, mas quem tem tempo para isso?",
  },
  {
    icon: TrendingDown,
    title: "Jogando verba em ads sem retorno",
    text: "Keywords erradas, negativações ausentes — seu dinheiro escorre sem gerar ligações reais.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-28 bg-background relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,hsl(var(--destructive)/0.03),transparent)]" />
      <div className="container space-y-16 relative">
        <Reveal className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-destructive uppercase tracking-wider">O problema</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight">Você se identifica?</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            A maioria dos negócios locais enfrenta esses problemas diariamente.
          </p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-8">
          {painPoints.map((p, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="group rounded-2xl border border-border/60 bg-card p-8 space-y-5 hover:shadow-medium hover:-translate-y-1 transition-all duration-300 h-full">
                <div className="w-14 h-14 rounded-2xl bg-destructive/8 flex items-center justify-center group-hover:bg-destructive/12 transition-colors duration-300">
                  <p.icon className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-lg font-heading font-bold">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
