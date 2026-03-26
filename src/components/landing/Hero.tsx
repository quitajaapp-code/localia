import { Link } from "react-router-dom";
import { ArrowRight, MapPin, MousePointerClick, Phone, Route, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function MetricMini({ icon: Icon, label, value, change, delay }: { icon: typeof MapPin; label: string; value: string; change: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl bg-card/80 backdrop-blur-sm p-4 space-y-1.5 border border-border/30 hover:border-primary/20 hover:shadow-soft transition-all duration-300 group"
    >
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="text-xl font-heading font-bold tracking-tight">{value}</p>
      <span className="text-[10px] font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded-full">{change}</span>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="pt-36 pb-28 md:pt-48 md:pb-40 bg-background relative overflow-hidden noise-overlay">
      {/* Layered background — creates depth perception = premium feel */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.10),transparent)] animate-gradient-shift" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle,hsl(var(--accent)/0.06),transparent_70%)]" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[radial-gradient(circle,hsl(var(--primary)/0.04),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.12)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.12)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />

      <div className="container grid lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        {/* LEFT: Copy — F-pattern optimized: badge → headline → subhead → CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8 text-center lg:text-left"
        >
          {/* 1. PATTERN INTERRUPT — badge breaks visual monotony, creates curiosity */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/[0.06] border border-primary/10 text-primary text-sm font-medium backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>Inteligência artificial para negócios locais</span>
          </motion.div>

          {/* 2. VALUE PROPOSITION — largest text = first thing eye catches (0.5s) */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl lg:text-[3.75rem] font-heading font-extrabold leading-[1.06] text-foreground tracking-tight"
          >
            Seu negócio local no{" "}
            <span className="relative inline-block">
              <span className="gradient-text">topo do Google</span>
              <motion.svg
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
              >
                <motion.path
                  d="M2 8C50 2 150 2 198 8"
                  stroke="hsl(var(--accent))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                />
              </motion.svg>
            </span>
            {" "}— no piloto automático
          </motion.h1>

          {/* 3. COGNITIVE EASE — short, scannable subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            Posts automáticos, respostas com IA, campanhas otimizadas.
            O LocalAI gerencia seu Google Meu Negócio enquanto{" "}
            <strong className="text-foreground font-semibold">você foca no que importa.</strong>
          </motion.p>

          {/* 4. CTA GRAVITY — largest interactive element, immediate after value prop */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Button
              size="lg"
              asChild
              className="text-base px-9 h-13 rounded-full shadow-medium hover:shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] bg-primary hover:bg-primary/90 relative overflow-hidden group animate-glow-pulse"
            >
              <Link to="/pricing">
                <span className="relative z-10 flex items-center font-semibold">
                  Começar grátis por 14 dias <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base px-8 rounded-full border-border/50 hover:border-primary/30 hover:bg-primary/[0.04] transition-all duration-300 backdrop-blur-sm"
            >
              <a href="#como-funciona">Ver como funciona</a>
            </Button>
          </motion.div>

          {/* 5. ANXIETY REDUCTION — immediately below CTA to reduce friction */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="flex items-center gap-6 sm:gap-8 justify-center lg:justify-start text-sm text-muted-foreground"
          >
            {["Sem cartão de crédito", "Setup em 5 minutos"].map((text) => (
              <span key={text} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                  <svg className="h-3 w-3 text-success" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                </div>
                {text}
              </span>
            ))}
          </motion.div>

          {/* 6. SOCIAL PROOF ANCHOR — number + faces = trust in < 1 second */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex items-center gap-3 justify-center lg:justify-start"
          >
            <div className="flex -space-x-2.5">
              {["AS", "CM", "JF", "RS"].map((initials, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + i * 0.08, type: "spring", stiffness: 400, damping: 15 }}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary shadow-sm"
                >
                  {initials}
                </motion.div>
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

        {/* RIGHT: VISUAL PROOF — dashboard mockup creates instant credibility */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          {/* Ambient glow — visual gravity pulls eye to dashboard */}
          <div className="absolute -inset-10 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/3 rounded-[3rem] blur-3xl animate-gradient-shift" />
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/15 via-accent/8 to-transparent" />
          
          <div className="relative rounded-2xl border border-border/40 bg-card/90 backdrop-blur-2xl shadow-medium p-6 space-y-5 animate-float">
            {/* Dashboard header — brand anchor */}
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
            {/* Metrics grid — concrete numbers = value perception */}
            <div className="grid grid-cols-2 gap-3">
              <MetricMini icon={MapPin} label="Views Maps" value="2.340" change="+18%" delay={0.6} />
              <MetricMini icon={MousePointerClick} label="Cliques site" value="487" change="+12%" delay={0.7} />
              <MetricMini icon={Phone} label="Ligações" value="68" change="+24%" delay={0.8} />
              <MetricMini icon={Route} label="Pedidos rota" value="153" change="+9%" delay={0.9} />
            </div>
            {/* Score — gamification trigger, creates desire to achieve */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/30"
            >
              <div className="relative w-12 h-12 shrink-0">
                <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                  <motion.circle
                    cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--success))" strokeWidth="3"
                    strokeDasharray="94.25"
                    initial={{ strokeDashoffset: 94.25 }}
                    animate={{ strokeDashoffset: 18.85 }}
                    transition={{ delay: 1.2, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">80</span>
              </div>
              <div>
                <p className="text-sm font-semibold">Score de Eficiência</p>
                <p className="text-xs text-muted-foreground">Excelente! Máxima eficiência</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
