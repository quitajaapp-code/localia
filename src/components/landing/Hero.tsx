import { Link } from "react-router-dom";
import { ArrowRight, MapPin, MousePointerClick, Phone, Route, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

function MetricMini({ icon: Icon, label, value, change }: { icon: typeof MapPin; label: string; value: string; change: string }) {
  return (
    <div className="rounded-xl bg-muted p-3 space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-heading font-bold">{value}</p>
      <span className="text-[10px] font-medium text-success">{change}</span>
    </div>
  );
}

export function Hero() {
  return (
    <section className="pt-28 pb-20 md:pt-40 md:pb-32 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/8 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="container grid lg:grid-cols-2 gap-16 items-center relative">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-8 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Inteligência artificial para negócios locais</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-heading font-extrabold leading-[1.1] text-foreground tracking-tight">
            Seu negócio local no{" "}
            <span className="relative">
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
            <strong className="text-foreground">você foca no que importa.</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button size="lg" asChild className="text-base px-8 shadow-md hover:shadow-lg transition-shadow">
              <Link to="/pricing">
                Começar grátis por 14 dias <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
              <a href="#como-funciona">Ver como funciona</a>
            </Button>
          </div>

          <div className="flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-success" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              Sem cartão de crédito
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-success" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              Setup em 5 minutos
            </span>
          </div>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-3xl blur-2xl -m-4" />
          <div className="relative rounded-2xl border border-border bg-card shadow-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-heading font-bold text-sm">Dashboard LocalAI</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium flex items-center gap-1">
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
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
              <div className="relative w-12 h-12">
                <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--success))" strokeWidth="3" strokeDasharray="94.25" strokeDashoffset="18.85" strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">80</span>
              </div>
              <div>
                <p className="text-xs font-medium">Score de Eficiência</p>
                <p className="text-[10px] text-muted-foreground">Excelente! Máxima eficiência</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
