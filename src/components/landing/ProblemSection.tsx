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
    <section className="py-24 bg-background">
      <div className="container space-y-14">
        <Reveal className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-destructive uppercase tracking-wider">O problema</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold">Você se identifica?</h2>
          <p className="text-muted-foreground text-lg">
            A maioria dos negócios locais enfrenta esses problemas diariamente.
          </p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {painPoints.map((p, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="rounded-2xl border border-border bg-card p-7 space-y-4 shadow-soft card-hover h-full">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
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
