import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

export function FinalCTA() {
  return (
    <section className="py-28 md:py-36 bg-secondary text-secondary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,hsl(var(--primary)/0.06),transparent)]" />
      <Reveal>
        <div className="container text-center space-y-8 max-w-xl relative">
          <h2 className="text-3xl md:text-4xl font-heading font-bold leading-tight tracking-tight">
            Pronto para colocar seu negócio no piloto automático?
          </h2>
          <p className="text-secondary-foreground/50 text-base leading-relaxed">
            Comece grátis. Sem cartão de crédito. Resultados reais em 7 dias.
          </p>
          <div className="space-y-4">
            <Button
              size="lg"
              asChild
              className="text-[15px] px-8 h-12 rounded-xl shadow-soft hover:shadow-medium transition-all duration-200 active:scale-[0.98] group"
            >
              <Link to="/pricing">
                Começar agora — é grátis <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
            </Button>
            <p className="text-xs text-secondary-foreground/30">
              Cancele quando quiser · Setup em 5 minutos
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
