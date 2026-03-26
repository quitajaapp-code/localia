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
    <section id="precos" className="py-28 bg-background relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,hsl(var(--primary)/0.05),transparent)]" />
      <div className="container space-y-16 relative">
        <Reveal className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Preços</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight">Planos para cada fase do seu negócio</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">14 dias grátis em todos os planos. Cancele quando quiser.</p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {plans.map((p, i) => (
            <Reveal key={i} delay={i * 100}>
              <div
                className={cn(
                  "rounded-2xl border p-8 space-y-6 h-full flex flex-col transition-all duration-300",
                  p.popular
                    ? "border-primary/30 bg-gradient-to-b from-primary/[0.04] to-transparent ring-1 ring-primary/15 shadow-medium scale-[1.03] relative"
                    : "border-border/50 bg-card hover:shadow-medium hover:-translate-y-1 hover:border-border"
                )}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-primary-foreground bg-primary px-4 py-1.5 rounded-full shadow-soft">
                    Mais popular
                  </span>
                )}
                <div className="pt-1">
                  <h3 className="text-lg font-heading font-bold">{p.name}</h3>
                  <p className="mt-3">
                    <span className="text-4xl font-heading font-extrabold tracking-tight">R${p.price}</span>
                    <span className="text-sm text-muted-foreground ml-1">/mês</span>
                  </p>
                </div>
                <ul className="space-y-3.5 flex-1">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-success" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn(
                    "w-full rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
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
          <Button variant="link" asChild className="text-base group">
            <Link to="/pricing">
              Ver planos completos <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
