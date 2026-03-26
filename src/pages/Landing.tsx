import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Star,
  Clock,
  TrendingDown,
  Plug,
  Settings,
  Bot,
  FileText,
  MessageSquare,
  Megaphone,
  Gauge,
  BarChart3,
  ShieldAlert,
  ArrowRight,
  Check,
  MapPin,
  Phone,
  MousePointerClick,
  Route,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Intersection Observer hook for fade-up                            */
/* ------------------------------------------------------------------ */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("animate-fade-in");
          el.classList.remove("opacity-0", "translate-y-6");
          io.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={cn("opacity-0 translate-y-6 transition-all duration-700", className)}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Header                                                            */
/* ------------------------------------------------------------------ */
function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-lg font-heading font-bold">
            Local<span className="text-primary">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/auth">Entrar</Link>
          </Button>
          <Button asChild>
            <Link to="/pricing">Começar grátis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                              */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="pt-28 pb-20 md:pt-36 md:pb-28 bg-background relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container grid lg:grid-cols-2 gap-12 items-center relative">
        {/* Copy */}
        <div className="space-y-6 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold leading-tight text-foreground">
            Seu negócio local no topo do Google —{" "}
            <span className="text-primary">no piloto automático</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
            LocalAI gerencia seu Google Meu Negócio e seus anúncios com inteligência artificial.
            Posts automáticos, respostas com IA, campanhas otimizadas.{" "}
            <strong className="text-foreground">Você foca no seu negócio.</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button size="lg" asChild className="text-base px-8">
              <Link to="/pricing">
                Começar grátis por 14 dias <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
              <a href="#como-funciona">Ver como funciona</a>
            </Button>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="rounded-2xl border border-border bg-card shadow-medium p-5 space-y-4">
            {/* mini header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-heading font-bold text-sm">Dashboard LocalAI</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">Online</span>
            </div>
            {/* metric cards */}
            <div className="grid grid-cols-2 gap-3">
              <MetricMini icon={MapPin} label="Views Maps" value="2.340" change="+18%" positive />
              <MetricMini icon={MousePointerClick} label="Cliques site" value="487" change="+12%" positive />
              <MetricMini icon={Phone} label="Ligações" value="68" change="+24%" positive />
              <MetricMini icon={Route} label="Pedidos rota" value="153" change="+9%" positive />
            </div>
            {/* score */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
              <div className="relative w-12 h-12">
                <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="hsl(var(--success))"
                    strokeWidth="3"
                    strokeDasharray="94.25"
                    strokeDashoffset="18.85"
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">80</span>
              </div>
              <div>
                <p className="text-xs font-medium">Score de Eficiência</p>
                <p className="text-[10px] text-muted-foreground">Excelente! Máxima eficiência</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricMini({
  icon: Icon,
  label,
  value,
  change,
  positive,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-xl bg-muted p-3 space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-heading font-bold">{value}</p>
      <span className={cn("text-[10px] font-medium", positive ? "text-success" : "text-destructive")}>{change}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Trust logos                                                       */
/* ------------------------------------------------------------------ */
function TrustLogos() {
  return (
    <Reveal>
      <section className="py-12 bg-card border-y border-border">
        <div className="container text-center space-y-6">
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Integrado com</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-14 items-center">
            {["Google", "Google Ads", "Claude AI"].map((name) => (
              <span
                key={name}
                className="text-lg md:text-xl font-heading font-bold text-muted-foreground/60 select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/*  Problema                                                          */
/* ------------------------------------------------------------------ */
const painPoints = [
  {
    icon: Star,
    title: "Avaliações negativas sem resposta",
    text: "Cada avaliação ignorada é um cliente perdido. Seu concorrente responde em minutos — e você?",
  },
  {
    icon: Clock,
    title: "Sem tempo para postar",
    text: "Posts no Google Meu Negócio geram até 35% mais visualizações, mas quem tem tempo para isso?",
  },
  {
    icon: TrendingDown,
    title: "Jogando verba em ads sem retorno",
    text: "Keywords erradas, negativações ausentes — seu dinheiro escorre sem gerar ligações reais.",
  },
];

function ProblemSection() {
  return (
    <section id="problema" className="py-20 bg-background">
      <div className="container space-y-12">
        <Reveal className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-heading font-bold">Você se identifica?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A maioria dos negócios locais enfrenta esses problemas diariamente.
          </p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {painPoints.map((p, i) => (
            <Reveal key={i}>
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-soft hover:shadow-medium transition-shadow h-full">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <p.icon className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-lg font-heading font-bold">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Como funciona                                                     */
/* ------------------------------------------------------------------ */
const steps = [
  { icon: Plug, title: "Conecte seu Google", desc: "Vincule sua conta em 2 cliques. Sem configuração técnica." },
  { icon: Settings, title: "Configure seu negócio", desc: "Informe o nicho, tom de voz e envie materiais." },
  { icon: Bot, title: "A IA cuida do resto", desc: "Posts, respostas, ads e relatórios — tudo automático." },
];

function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 bg-card">
      <div className="container space-y-12">
        <Reveal className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-heading font-bold">Como funciona</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Três passos para colocar seu negócio no piloto automático.</p>
        </Reveal>
        <div className="relative grid md:grid-cols-3 gap-8">
          {/* connector line */}
          <div className="hidden md:block absolute top-16 left-[17%] right-[17%] h-0.5 bg-border" />
          {steps.map((s, i) => (
            <Reveal key={i} className="relative text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center relative z-10">
                <s.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                Passo {i + 1}
              </span>
              <h3 className="text-lg font-heading font-bold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Funcionalidades                                                   */
/* ------------------------------------------------------------------ */
const features = [
  { icon: FileText, title: "Posts automáticos", desc: "A IA cria e publica conteúdo relevante no Google Meu Negócio toda semana." },
  { icon: MessageSquare, title: "Respostas com IA", desc: "Cada avaliação respondida com empatia e profissionalismo em segundos." },
  { icon: Megaphone, title: "Gestão de Ads", desc: "Campanhas criadas pela IA com keywords, negativações e otimização semanal." },
  { icon: Gauge, title: "Score de eficiência", desc: "Gamificação que mostra o quão completo está seu perfil para máxima performance." },
  { icon: BarChart3, title: "Relatório unificado", desc: "GMB + Ads em um relatório semanal em linguagem simples para leigos." },
  { icon: ShieldAlert, title: "Alerta de edições", desc: "Detecta alterações não autorizadas no seu perfil e avisa imediatamente." },
];

function Features() {
  return (
    <section className="py-20 bg-background">
      <div className="container space-y-12">
        <Reveal className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-heading font-bold">Tudo que você precisa, em um lugar</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Funcionalidades pensadas para donos de negócios locais.</p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Reveal key={i}>
              <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-soft hover:shadow-medium transition-shadow h-full">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading font-bold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Prova social                                                      */
/* ------------------------------------------------------------------ */
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

function SocialProof() {
  return (
    <section className="py-20 bg-card">
      <div className="container space-y-12">
        <Reveal className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-heading font-bold">Quem usa, recomenda</h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Reveal key={i}>
              <div className="rounded-2xl border border-border bg-background p-6 space-y-4 shadow-soft h-full flex flex-col">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
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

/* ------------------------------------------------------------------ */
/*  Preços                                                            */
/* ------------------------------------------------------------------ */
const plans = [
  { name: "Presença", price: "97", features: ["1 negócio", "Posts automáticos 4x/sem", "Respostas com IA", "Score de otimização", "Relatório mensal"] },
  { name: "Presença + Ads", price: "197", popular: true, features: ["3 negócios", "Tudo do Presença", "Gestão de Google Ads com IA", "Otimização semanal", "Relatório unificado GMB+Ads"] },
  { name: "Agência", price: "397", features: ["10 negócios", "Tudo do Presença+Ads", "Painel multi-cliente", "White-label", "Suporte prioritário"] },
];

function PricingPreview() {
  return (
    <section className="py-20 bg-background">
      <div className="container space-y-12">
        <Reveal className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-heading font-bold">Planos para cada fase do seu negócio</h2>
          <p className="text-muted-foreground">14 dias grátis em todos os planos. Cancele quando quiser.</p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <Reveal key={i}>
              <div
                className={cn(
                  "rounded-2xl border p-6 space-y-5 h-full flex flex-col shadow-soft",
                  p.popular
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-card"
                )}
              >
                {p.popular && (
                  <span className="self-start text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    Mais popular
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-heading font-bold">{p.name}</h3>
                  <p className="mt-1">
                    <span className="text-3xl font-heading font-extrabold">R${p.price}</span>
                    <span className="text-sm text-muted-foreground">/mês</span>
                  </p>
                </div>
                <ul className="space-y-2 flex-1">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 mt-0.5 text-success shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={p.popular ? "default" : "outline"}
                  asChild
                >
                  <Link to="/pricing">Começar grátis</Link>
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="text-center">
          <Button variant="link" asChild className="text-base">
            <Link to="/pricing">
              Ver planos completos <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA Final                                                         */
/* ------------------------------------------------------------------ */
function FinalCTA() {
  return (
    <section className="py-20 bg-secondary text-secondary-foreground">
      <Reveal>
        <div className="container text-center space-y-6 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold">
            Pronto para colocar seu negócio no piloto automático?
          </h2>
          <p className="text-secondary-foreground/70 text-lg">
            Comece grátis. Sem cartão de crédito. Resultados reais em 7 dias.
          </p>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="text-base px-10 border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10"
          >
            <Link to="/pricing">Começar agora — é grátis</Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                            */
/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="py-12 bg-secondary text-secondary-foreground/60 border-t border-secondary-foreground/10">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-heading font-bold text-secondary-foreground">
              Local<span className="text-primary">AI</span>
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#como-funciona" className="hover:text-secondary-foreground transition-colors">Como funciona</a>
            <Link to="/pricing" className="hover:text-secondary-foreground transition-colors">Preços</Link>
            <Link to="/auth" className="hover:text-secondary-foreground transition-colors">Entrar</Link>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} LocalAI. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Landing Page                                                      */
/* ------------------------------------------------------------------ */
const Landing = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <TrustLogos />
      <ProblemSection />
      <HowItWorks />
      <Features />
      <SocialProof />
      <PricingPreview />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Landing;
