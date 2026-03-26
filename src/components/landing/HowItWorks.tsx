import { Plug, Settings, Bot, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

const steps = [
  { icon: Plug, title: "Conecte seu Google", desc: "Vincule sua conta em 2 cliques. Sem configuração técnica.", num: "01" },
  { icon: Settings, title: "Configure seu negócio", desc: "Informe o nicho, tom de voz e envie materiais.", num: "02" },
  { icon: Bot, title: "A IA cuida do resto", desc: "Posts, respostas, ads e relatórios — tudo automático.", num: "03" },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-28 md:py-36 bg-muted/40 relative">
      <div className="container max-w-5xl space-y-16">
        <Reveal className="text-center space-y-4 max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">Como funciona</h2>
          <p className="text-muted-foreground text-base leading-relaxed">Três passos para colocar seu negócio no piloto automático.</p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 120} className="text-center space-y-5">
              <span className="inline-block text-[40px] font-heading font-extrabold text-border leading-none select-none">
                {s.num}
              </span>
              <div className="mx-auto w-12 h-12 rounded-xl bg-card border border-border/60 flex items-center justify-center shadow-sm">
                <s.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="text-base font-heading font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px] mx-auto">{s.desc}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="text-center">
          <Button
            size="lg"
            asChild
            className="rounded-xl px-7 h-12 shadow-soft hover:shadow-medium transition-all duration-200 active:scale-[0.98] group"
          >
            <Link to="/pricing">
              Começar agora <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">Pronto em menos de 5 minutos</p>
        </Reveal>
      </div>
    </section>
  );
}
