import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

export function FinalCTA() {
  return (
    <section className="py-32 bg-secondary text-secondary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,hsl(var(--primary)/0.08),transparent)]" />
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--secondary-foreground)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--secondary-foreground)/0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <Reveal>
        <div className="container text-center space-y-8 max-w-2xl relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold leading-tight tracking-tight">
            Pronto para colocar seu negócio no piloto automático?
          </h2>
          <p className="text-secondary-foreground/60 text-lg md:text-xl leading-relaxed">
            Comece grátis. Sem cartão de crédito. Resultados reais em 7 dias.
          </p>
          <Button
            size="lg"
            asChild
            className="text-base px-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium hover:shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
          >
            <Link to="/pricing">
              Começar agora — é grátis <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
