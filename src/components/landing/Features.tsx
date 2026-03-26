import { FileText, MessageSquare, Megaphone, Gauge, BarChart3, ShieldAlert } from "lucide-react";
import { Reveal } from "./Reveal";

const features = [
  { icon: FileText, title: "Posts automáticos", desc: "A IA cria e publica conteúdo relevante no Google Meu Negócio toda semana.", highlight: true },
  { icon: MessageSquare, title: "Respostas com IA", desc: "Cada avaliação respondida com empatia e profissionalismo em segundos.", highlight: true },
  { icon: Megaphone, title: "Gestão de Ads", desc: "Campanhas criadas pela IA com keywords, negativações e otimização semanal.", highlight: true },
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
        {/* Top 3 features in larger cards — visual hierarchy for key value props */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.slice(0, 3).map((f, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="group rounded-2xl border border-primary/10 bg-gradient-to-b from-primary/[0.03] to-transparent p-8 space-y-4 hover:shadow-medium hover:-translate-y-1 hover:border-primary/25 transition-all duration-300 h-full">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                  <f.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        {/* Secondary features — smaller, less visual weight */}
        <div className="grid sm:grid-cols-3 gap-6">
          {features.slice(3).map((f, i) => (
            <Reveal key={i + 3} delay={(i + 3) * 80}>
              <div className="group rounded-2xl border border-border/50 bg-card p-6 space-y-3 hover:shadow-soft hover:-translate-y-0.5 hover:border-border transition-all duration-300 h-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center group-hover:bg-primary/12 transition-all duration-300">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-base">{f.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
