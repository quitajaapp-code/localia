import { FileText, MessageSquare, Megaphone, Gauge, BarChart3, ShieldAlert } from "lucide-react";
import { Reveal } from "./Reveal";

const features = [
  { icon: FileText, title: "Posts automáticos", desc: "A IA cria e publica conteúdo relevante no Google Meu Negócio toda semana." },
  { icon: MessageSquare, title: "Respostas com IA", desc: "Cada avaliação respondida com empatia e profissionalismo em segundos." },
  { icon: Megaphone, title: "Gestão de Ads", desc: "Campanhas criadas pela IA com keywords, negativações e otimização semanal." },
  { icon: Gauge, title: "Score de eficiência", desc: "Gamificação que mostra o quão completo está seu perfil para máxima performance." },
  { icon: BarChart3, title: "Relatório unificado", desc: "GMB + Ads em um relatório semanal em linguagem simples para leigos." },
  { icon: ShieldAlert, title: "Alerta de edições", desc: "Detecta alterações não autorizadas no seu perfil e avisa imediatamente." },
];

export function Features() {
  return (
    <section id="funcionalidades" className="py-28 bg-background relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(var(--primary)/0.04),transparent)]" />
      <div className="container space-y-16 relative">
        <Reveal className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Funcionalidades</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight">Tudo que você precisa, em um lugar</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">Funcionalidades pensadas para donos de negócios locais.</p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="group rounded-2xl border border-border/50 bg-card p-8 space-y-4 hover:shadow-medium hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/12 group-hover:scale-110 transition-all duration-300">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
