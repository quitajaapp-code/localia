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
    <section id="precos" className="py-24 bg-background">
      <div className="container space-y-14">
        <Reveal className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Preços</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold">Planos para cada fase do seu negócio</h2>
          <p className="text-muted-foreground text-lg">14 dias grátis em todos os planos. Cancele quando quiser.</p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((p, i) => (
            <Reveal key={i} delay={i * 100}>
              <div
                className={cn(
                  "rounded-2xl border p-7 space-y-6 h-full flex flex-col transition-all duration-300",
                  p.popular
                    ? "border-primary bg-primary/[0.03] ring-2 ring-primary/20 shadow-md scale-[1.02]"
                    : "border-border bg-card shadow-soft card-hover"
                )}
              >
                {p.popular && (
                  <span className="self-start text-xs font-bold text-primary-foreground bg-primary px-3 py-1 rounded-full">
                    Mais popular
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-heading font-bold">{p.name}</h3>
                  <p className="mt-2">
                    <span className="text-4xl font-heading font-extrabold">R${p.price}</span>
                    <span className="text-sm text-muted-foreground">/mês</span>
                  </p>
                </div>
                <ul className="space-y-3 flex-1">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 mt-0.5 text-success shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={p.popular ? "default" : "outline"} asChild>
                  <Link to="/pricing">Começar grátis</Link>
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="text-center">
          <Button variant="link" asChild className="text-base">
            <Link to="/pricing">
              Ver planos completos <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
