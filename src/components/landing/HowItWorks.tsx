import { Plug, Settings, Bot, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

const steps = [
  { icon: Plug, title: "Conecte seu Google", desc: "Vincule sua conta em 2 cliques. Sem configuração técnica.", color: "bg-primary/8 text-primary", borderColor: "border-primary/15" },
  { icon: Settings, title: "Configure seu negócio", desc: "Informe o nicho, tom de voz e envie materiais.", color: "bg-accent/10 text-accent-foreground", borderColor: "border-accent/15" },
  { icon: Bot, title: "A IA cuida do resto", desc: "Posts, respostas, ads e relatórios — tudo automático.", color: "bg-success/10 text-success", borderColor: "border-success/15" },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-28 bg-card/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,hsl(var(--primary)/0.04),transparent)]" />
      <div className="container space-y-16 relative">
        <Reveal className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Simples assim</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight">Como funciona</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">Três passos para colocar seu negócio no piloto automático.</p>
        </Reveal>
        <div className="relative grid md:grid-cols-3 gap-12 md:gap-8">
          {/* Connector line with gradient */}
          <div className="hidden md:block absolute top-[3.5rem] left-[20%] right-[20%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-primary/30 via-accent/30 to-success/30" />
          </div>
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 150} className="relative text-center space-y-6">
              <div className={`mx-auto w-16 h-16 rounded-2xl ${s.color} flex items-center justify-center relative z-10 border ${s.borderColor} shadow-soft`}>
                <s.icon className="h-7 w-7" />
              </div>
              <span className="inline-block text-xs font-bold text-primary bg-primary/8 px-3 py-1.5 rounded-full border border-primary/10">
                Passo {i + 1}
              </span>
              <h3 className="text-lg font-heading font-bold">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </Reveal>
          ))}
        </div>
        {/* Inline CTA — capture intent at peak understanding */}
        <Reveal className="text-center pt-4">
          <Button
            size="lg"
            asChild
            className="rounded-full px-8 shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Link to="/pricing">
              Começar agora <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">Pronto em menos de 5 minutos</p>
        </Reveal>
      </div>
    </section>
  );
}
