import { FileText, MessageSquare, Megaphone, Gauge, BarChart3, ShieldAlert } from "lucide-react";
import { Reveal } from "./Reveal";

const features = [
  { icon: FileText, title: "Posts automáticos", desc: "A IA cria e publica conteúdo relevante no Google Meu Negócio toda semana.", highlight: true },
  { icon: MessageSquare, title: "Respostas com IA", desc: "Cada avaliação respondida com empatia e profissionalismo em segundos.", highlight: true },
  { icon: Megaphone, title: "Gestão de Ads", desc: "Campanhas criadas pela IA com keywords, negativações e sugestões de otimização semanal.", highlight: true },
  { icon: Gauge, title: "Score de eficiência", desc: "Gamificação que mostra o quão completo está seu perfil para máxima performance." },
  { icon: BarChart3, title: "Relatório unificado", desc: "GMB + Ads em um relatório semanal em linguagem simples para leigos." },
  { icon: ShieldAlert, title: "Alerta de edições", desc: "Detecta alterações não autorizadas no seu perfil e avisa imediatamente." },
];

export function Features() {
  return (
    <section id="funcionalidades" className="py-28 md:py-36 bg-background relative">
      <div className="container max-w-5xl space-y-16">
        <Reveal className="text-center space-y-4 max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">Tudo que você precisa, em um lugar</h2>
          <p className="text-muted-foreground text-base leading-relaxed">Funcionalidades pensadas para donos de negócios locais.</p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-px bg-border/60 rounded-2xl overflow-hidden border border-border/60">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="bg-card p-7 space-y-3 h-full hover:bg-muted/30 transition-colors duration-200">
                <div className="w-9 h-9 rounded-lg bg-primary/[0.06] flex items-center justify-center">
                  <f.icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-[15px]">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
