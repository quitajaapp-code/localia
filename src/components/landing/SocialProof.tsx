import { Star } from "lucide-react";
import { Reveal } from "./Reveal";

const testimonials = [
  {
    name: "Ana Souza",
    biz: "Clínica de Estética",
    text: "Em 3 meses minha nota subiu de 4.1 para 4.8. A IA responde as avaliações melhor que eu mesma!",
    initials: "AS",
    metric: "4.1 → 4.8",
    metricLabel: "Nota Google",
  },
  {
    name: "Carlos Mendes",
    biz: "Restaurante Sabor Local",
    text: "Os posts automáticos triplicaram minhas visualizações no Google Maps. Não preciso mais me preocupar com isso.",
    initials: "CM",
    metric: "3x",
    metricLabel: "Mais visualizações",
  },
  {
    name: "Juliana Ferreira",
    biz: "Pet Shop JuPet",
    text: "Economizei R$800/mês em ads porque a IA cortou keywords que não convertiam. Incrível!",
    initials: "JF",
    metric: "R$800",
    metricLabel: "Economia mensal",
  },
];

export function SocialProof() {
  return (
    <section id="depoimentos" className="py-28 md:py-36 bg-muted/40 relative">
      <div className="container max-w-5xl space-y-16">
        <Reveal className="text-center space-y-4 max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">Quem usa, recomenda</h2>
          <p className="text-muted-foreground text-base leading-relaxed">Veja o que nossos clientes dizem sobre o LocalAI.</p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="rounded-2xl border border-border/60 bg-card p-7 space-y-5 h-full flex flex-col hover:border-border transition-colors duration-300">
                <div>
                  <span className="text-2xl font-heading font-bold text-foreground">{t.metric}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.metricLabel}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.biz}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
