import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

export function FinalCTA() {
  return (
    <section className="py-24 bg-secondary text-secondary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />
      <Reveal>
        <div className="container text-center space-y-8 max-w-2xl relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold leading-tight">
            Pronto para colocar seu negócio no piloto automático?
          </h2>
          <p className="text-secondary-foreground/70 text-lg md:text-xl">
            Comece grátis. Sem cartão de crédito. Resultados reais em 7 dias.
          </p>
          <Button
            size="lg"
            asChild
            className="text-base px-10 bg-primary text-primary-foreground hover:bg-primary/90"
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
