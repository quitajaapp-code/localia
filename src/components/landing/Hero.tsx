import { Link } from "react-router-dom";
import { ArrowRight, MapPin, MousePointerClick, Phone, Route, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function MetricMini({ icon: Icon, label, value, change }: { icon: typeof MapPin; label: string; value: string; change: string }) {
  return (
    <div className="rounded-xl bg-muted/60 backdrop-blur-sm p-4 space-y-1.5 border border-border/40 hover:border-border/80 transition-colors duration-300">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="text-xl font-heading font-bold tracking-tight">{value}</p>
      <span className="text-[10px] font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded-full">{change}</span>
    </div>
  );
}

export function Hero() {
  return (
    <section className="pt-32 pb-24 md:pt-44 md:pb-36 bg-background relative overflow-hidden">
      {/* Premium background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,hsl(var(--accent)/0.08),transparent_70%)]" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle,hsl(var(--primary)/0.06),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />

      <div className="container grid lg:grid-cols-2 gap-16 lg:gap-20 items-center relative">
        {/* Copy — left-aligned for F-pattern scanning */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="space-y-8 text-center lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary text-sm font-medium backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>Inteligência artificial para negócios locais</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-heading font-extrabold leading-[1.08] text-foreground tracking-tight">
            Seu negócio local no{" "}
            <span className="relative inline-block">
              <span className="text-primary">topo do Google</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 8C50 2 150 2 198 8" stroke="hsl(var(--accent))" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            {" "}— no piloto automático
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Posts automáticos, respostas com IA, campanhas otimizadas.
            O LocalAI gerencia seu Google Meu Negócio enquanto{" "}
            <strong className="text-foreground font-semibold">você foca no que importa.</strong>
          </p>

          {/* Primary CTA — largest visual element, high contrast */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button
              size="lg"
              asChild
              className="text-base px-8 rounded-full shadow-medium hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-primary hover:bg-primary/90 relative overflow-hidden group"
            >
              <Link to="/pricing">
                <span className="relative z-10 flex items-center">
                  Começar grátis por 14 dias <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base px-8 rounded-full border-border/60 hover:border-border hover:bg-muted/50 transition-all duration-300"
            >
              <a href="#como-funciona">Ver como funciona</a>
            </Button>
          </div>

          {/* Anxiety reducers — directly below CTA for sequential scanning */}
          <div className="flex items-center gap-8 justify-center lg:justify-start text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                <svg className="h-3 w-3 text-success" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              </div>
              Sem cartão de crédito
            </span>
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                <svg className="h-3 w-3 text-success" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              </div>
              Setup em 5 minutos
            </span>
          </div>

          {/* Micro social proof — number anchor near CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex items-center gap-3 justify-center lg:justify-start"
          >
            <div className="flex -space-x-2">
              {["AS", "CM", "JF", "RS"].map((initials, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary"
                >
                  {initials}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-3.5 w-3.5 text-warning fill-warning" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-medium">+200 negócios ativos</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Dashboard mockup — visual proof on the right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="absolute -inset-4 bg-gradient-to-br from-primary/15 via-accent/8 to-primary/5 rounded-[2rem] blur-2xl" />
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent" />
          
          <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-medium p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <span className="font-heading font-bold text-sm">Dashboard LocalAI</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-success/10 text-success font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Online
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MetricMini icon={MapPin} label="Views Maps" value="2.340" change="+18%" />
              <MetricMini icon={MousePointerClick} label="Cliques site" value="487" change="+12%" />
              <MetricMini icon={Phone} label="Ligações" value="68" change="+24%" />
              <MetricMini icon={Route} label="Pedidos rota" value="153" change="+9%" />
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/40">
              <div className="relative w-12 h-12 shrink-0">
                <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--success))" strokeWidth="3" strokeDasharray="94.25" strokeDashoffset="18.85" strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">80</span>
              </div>
              <div>
                <p className="text-sm font-semibold">Score de Eficiência</p>
                <p className="text-xs text-muted-foreground">Excelente! Máxima eficiência</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
