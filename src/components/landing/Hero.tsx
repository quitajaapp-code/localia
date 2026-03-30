import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import dashboardPreview from "@/assets/dashboard-preview.jpg";

const ease = [0.16, 1, 0.3, 1] as const;
export function Hero() {
  return (
    <section className="pt-28 pb-20 md:pt-36 md:pb-28 lg:pt-40 lg:pb-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_-10%,hsl(var(--primary)/0.07),transparent)]" />

      <div className="container grid lg:grid-cols-[1fr_minmax(0,420px)] gap-12 lg:gap-16 items-center relative">
        {/* Left — copy */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="space-y-6 text-center lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border text-muted-foreground text-[13px] font-medium"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Inteligência artificial para negócios locais</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="text-[2.25rem] md:text-[2.75rem] lg:text-5xl font-heading font-extrabold leading-[1.1] text-foreground tracking-tight"
          >
            Seu negócio local no{" "}
            <span className="text-primary">topo do Google</span>
            {" "}— no piloto automático
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-[1.7]"
          >
            Posts automáticos, respostas com IA, campanhas otimizadas.
            O LocalAI gerencia seu Google Meu Negócio enquanto{" "}
            <strong className="text-foreground font-medium">você foca no que importa.</strong>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5, ease }}
            className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
          >
            <Button
              size="lg"
              asChild
              className="text-[15px] px-7 h-12 rounded-xl shadow-soft hover:shadow-medium transition-all duration-200 hover:brightness-110 active:scale-[0.98] group"
            >
              <Link to="/pricing">
                Começar grátis por 14 dias
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="text-[15px] px-7 h-12 rounded-xl text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <a href="#como-funciona">Ver como funciona</a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-center lg:justify-start text-[13px] text-muted-foreground"
          >
            {["Sem cartão de crédito", "Setup em 5 minutos"].map((text) => (
              <span key={text} className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                {text}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.75 }}
            className="flex items-center gap-3 justify-center lg:justify-start"
          >
            <div className="flex -space-x-2">
              {["AS", "CM", "JF", "RS"].map((initials, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px] font-bold text-muted-foreground"
                >
                  {initials}
                </div>
              ))}
            </div>
            <span className="text-[13px] text-muted-foreground">
              <span className="font-medium text-foreground">+200</span> negócios ativos
            </span>
          </motion.div>
        </motion.div>

        {/* Right — Dashboard card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease }}
          className="relative mx-auto w-full max-w-sm lg:max-w-none hidden md:block"
        >
          <div className="rounded-2xl bg-card border border-border/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="font-heading font-semibold text-sm">Dashboard LocalAI</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Online
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <MetricMini icon={MapPin} label="Views Maps" value="2.340" change="+18%" delay={0.5} />
              <MetricMini icon={MousePointerClick} label="Cliques site" value="487" change="+12%" delay={0.6} />
              <MetricMini icon={Phone} label="Ligações" value="68" change="+24%" delay={0.7} />
              <MetricMini icon={Route} label="Pedidos rota" value="153" change="+9%" delay={0.8} />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/50"
            >
              <div className="relative w-11 h-11 shrink-0">
                <svg viewBox="0 0 36 36" className="w-11 h-11 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                  <motion.circle
                    cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--success))" strokeWidth="3"
                    strokeDasharray="94.25"
                    initial={{ strokeDashoffset: 94.25 }}
                    animate={{ strokeDashoffset: 18.85 }}
                    transition={{ delay: 1.1, duration: 1.2, ease }}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold">80</span>
              </div>
              <div>
                <p className="text-sm font-medium">Score de Eficiência</p>
                <p className="text-xs text-muted-foreground">Excelente! Máxima eficiência</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
