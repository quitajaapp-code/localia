import { Star } from "lucide-react";
import { Reveal } from "./Reveal";

const testimonials = [
  {
    name: "Ana Souza",
    biz: "Clínica de Estética",
    text: "Em 3 meses minha nota subiu de 4.1 para 4.8. A IA responde as avaliações melhor que eu mesma!",
    initials: "AS",
  },
  {
    name: "Carlos Mendes",
    biz: "Restaurante Sabor Local",
    text: "Os posts automáticos triplicaram minhas visualizações no Google Maps. Não preciso mais me preocupar com isso.",
    initials: "CM",
  },
  {
    name: "Juliana Ferreira",
    biz: "Pet Shop JuPet",
    text: "Economizei R$800/mês em ads porque a IA cortou keywords que não convertiam. Incrível!",
    initials: "JF",
  },
];

export function SocialProof() {
  return (
    <section id="depoimentos" className="py-24 bg-card">
      <div className="container space-y-14">
        <Reveal className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Depoimentos</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold">Quem usa, recomenda</h2>
          <p className="text-muted-foreground text-lg">Veja o que nossos clientes dizem sobre o LocalAI.</p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="rounded-2xl border border-border bg-background p-7 space-y-5 shadow-soft card-hover h-full flex flex-col">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
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
