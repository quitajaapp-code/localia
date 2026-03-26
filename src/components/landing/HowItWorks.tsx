import { Plug, Settings, Bot } from "lucide-react";
import { Reveal } from "./Reveal";

const steps = [
  { icon: Plug, title: "Conecte seu Google", desc: "Vincule sua conta em 2 cliques. Sem configuração técnica.", color: "bg-primary/10 text-primary" },
  { icon: Settings, title: "Configure seu negócio", desc: "Informe o nicho, tom de voz e envie materiais.", color: "bg-accent/10 text-accent-foreground" },
  { icon: Bot, title: "A IA cuida do resto", desc: "Posts, respostas, ads e relatórios — tudo automático.", color: "bg-success/10 text-success" },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 bg-card">
      <div className="container space-y-14">
        <Reveal className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Simples assim</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold">Como funciona</h2>
          <p className="text-muted-foreground text-lg">Três passos para colocar seu negócio no piloto automático.</p>
        </Reveal>
        <div className="relative grid md:grid-cols-3 gap-10">
          {/* connector line */}
          <div className="hidden md:block absolute top-[3.5rem] left-[20%] right-[20%] h-px bg-border" />
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 150} className="relative text-center space-y-5">
              <div className={`mx-auto w-16 h-16 rounded-2xl ${s.color} flex items-center justify-center relative z-10 shadow-sm`}>
                <s.icon className="h-7 w-7" />
              </div>
              <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                Passo {i + 1}
              </span>
              <h3 className="text-lg font-heading font-bold">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
