import { Star, Quote } from "lucide-react";
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
    <section id="depoimentos" className="py-28 bg-card/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_20%,hsl(var(--primary)/0.04),transparent)]" />
      <div className="container space-y-16 relative">
        <Reveal className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Depoimentos</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight">Quem usa, recomenda</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">Veja o que nossos clientes dizem sobre o LocalAI.</p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="group rounded-2xl border border-border/50 bg-background p-8 space-y-5 hover:shadow-medium hover:-translate-y-1 hover:border-primary/15 transition-all duration-300 h-full flex flex-col relative">
                {/* Quote visual anchor */}
                <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/8" />
                
                {/* Result metric — eye-catching number at top */}
                <div className="pb-4 border-b border-border/40">
                  <span className="text-3xl font-heading font-extrabold text-primary">{t.metric}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.metricLabel}</p>
                </div>

                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-sm font-bold text-primary border border-primary/10">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
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
