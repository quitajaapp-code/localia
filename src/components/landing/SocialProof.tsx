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
    <section id="depoimentos" className="py-32 bg-muted/30 relative overflow-hidden noise-overlay">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_20%,hsl(var(--primary)/0.03),transparent)]" />
      <div className="container space-y-20 relative z-10">
        <Reveal className="text-center space-y-5 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Depoimentos</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight leading-[1.1]">Quem usa, recomenda</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">Veja o que nossos clientes dizem sobre o LocalAI.</p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="group rounded-2xl border border-border/30 bg-card/80 backdrop-blur-sm p-8 space-y-5 hover:shadow-medium hover:-translate-y-1.5 hover:border-primary/12 transition-all duration-400 h-full flex flex-col relative overflow-hidden">
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Quote visual anchor */}
                <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/[0.06] group-hover:text-primary/10 transition-colors duration-400" />
                
                {/* Result metric */}
                <div className="pb-5 border-b border-border/30 relative z-10">
                  <span className="text-3xl font-heading font-extrabold text-primary">{t.metric}</span>
                  <p className="text-xs text-muted-foreground mt-1">{t.metricLabel}</p>
                </div>

                <div className="flex gap-0.5 relative z-10">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 italic relative z-10">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-border/30 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-sm font-bold text-primary border border-primary/8">
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
