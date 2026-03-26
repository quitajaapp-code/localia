import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

export function FinalCTA() {
  return (
    <section className="py-36 bg-secondary text-secondary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/4 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,hsl(var(--primary)/0.06),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--secondary-foreground)/0.02)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--secondary-foreground)/0.02)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <Reveal>
        <div className="container text-center space-y-12 max-w-2xl relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold leading-tight tracking-tight">
            Pronto para colocar seu negócio no piloto automático?
          </h2>
          <p className="text-secondary-foreground/50 text-lg md:text-xl leading-relaxed">
            Comece grátis. Sem cartão de crédito. Resultados reais em 7 dias.
          </p>
          <div className="space-y-6">
            <Button
              size="lg"
              asChild
              className="text-base px-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium hover:shadow-lg transition-all duration-400 hover:scale-[1.04] active:scale-[0.97] group animate-glow-pulse relative overflow-hidden"
            >
              <Link to="/pricing">
                <span className="relative z-10 flex items-center">
                  Começar agora — é grátis <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
            </Button>
            {/* Final anxiety reducers */}
            <div className="flex items-center justify-center gap-8 text-xs text-secondary-foreground/35">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Cancele quando quiser
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                Setup em 5 minutos
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
