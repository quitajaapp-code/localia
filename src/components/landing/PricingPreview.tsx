import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

const plans = [
  { name: "Presença", price: "97", features: ["1 negócio", "Posts automáticos 4x/sem", "Respostas com IA", "Score de otimização", "Relatório mensal"] },
  { name: "Presença + Ads", price: "197", popular: true, features: ["3 negócios", "Tudo do Presença", "Gestão de Google Ads com IA", "Otimização semanal", "Relatório unificado GMB+Ads"] },
  { name: "Agência", price: "397", features: ["10 negócios", "Tudo do Presença+Ads", "Painel multi-cliente", "White-label", "Suporte prioritário"] },
];

export function PricingPreview() {
  return (
    <section id="precos" className="py-28 md:py-36 bg-background relative">
      <div className="container max-w-4xl space-y-16">
        <Reveal className="text-center space-y-4 max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">Planos para cada fase do seu negócio</h2>
          <p className="text-muted-foreground text-base leading-relaxed">14 dias grátis em todos os planos. Cancele quando quiser.</p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <Reveal key={i} delay={i * 80}>
              <div
                className={cn(
                  "rounded-2xl border p-7 space-y-6 h-full flex flex-col transition-colors duration-300",
                  p.popular
                    ? "border-primary/30 bg-card ring-1 ring-primary/10 relative"
                    : "border-border/60 bg-card hover:border-border"
                )}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-primary-foreground bg-primary px-3.5 py-1 rounded-full">
                    Mais popular
                  </span>
                )}
                <div>
                  <h3 className="text-base font-heading font-semibold">{p.name}</h3>
                  <p className="mt-3">
                    <span className="text-3xl font-heading font-bold tracking-tight">R${p.price}</span>
                    <span className="text-sm text-muted-foreground ml-1">/mês</span>
                  </p>
                </div>
                <ul className="space-y-3 flex-1">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn(
                    "w-full rounded-xl transition-all duration-200 active:scale-[0.98]",
                    p.popular ? "shadow-soft" : ""
                  )}
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
          <Button variant="link" asChild className="text-sm text-muted-foreground hover:text-foreground group">
            <Link to="/pricing">
              Ver planos completos <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
