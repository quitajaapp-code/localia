import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createCheckoutSession } from "@/lib/stripe";
import { useToast } from "@/hooks/use-toast";

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */
const plans = [
  {
    id: "price_presenca",
    name: "Presença",
    monthlyPrice: 97,
    features: [
      "1 negócio",
      "Posts automáticos 4x/semana",
      "Respostas com IA (aprovação manual)",
      "Score de otimização",
      "Relatório mensal",
    ],
    disabledFeatures: ["Sem módulo de Ads"],
  },
  {
    id: "price_ads",
    name: "Presença + Ads",
    monthlyPrice: 197,
    popular: true,
    features: [
      "3 negócios",
      "Tudo do Presença",
      "Gestão completa de Google Ads",
      "Keywords + negativas com IA",
      "Otimização semanal automática",
      "Relatório unificado GMB+Ads",
      "Fee de 10% sobre verba de ads",
    ],
  },
  {
    id: "price_agencia",
    name: "Agência",
    monthlyPrice: 397,
    features: [
      "10 negócios",
      "Tudo do Presença+Ads",
      "Painel multi-cliente",
      "White-label",
      "Relatório PDF com logo",
      "Suporte prioritário",
    ],
  },
];

const comparisonFeatures = [
  { name: "Negócios incluídos", presenca: "1", ads: "3", agencia: "10" },
  { name: "Posts automáticos", presenca: true, ads: true, agencia: true },
  { name: "Respostas com IA", presenca: "Manual", ads: "Manual + Auto", agencia: "Manual + Auto" },
  { name: "Score de otimização", presenca: true, ads: true, agencia: true },
  { name: "Relatório mensal", presenca: true, ads: true, agencia: true },
  { name: "Gestão de Google Ads", presenca: false, ads: true, agencia: true },
  { name: "Keywords + negativas IA", presenca: false, ads: true, agencia: true },
  { name: "Otimização semanal", presenca: false, ads: true, agencia: true },
  { name: "Relatório unificado", presenca: false, ads: true, agencia: true },
  { name: "Painel multi-cliente", presenca: false, ads: false, agencia: true },
  { name: "White-label", presenca: false, ads: false, agencia: true },
  { name: "Relatório PDF com logo", presenca: false, ads: false, agencia: true },
  { name: "Suporte prioritário", presenca: false, ads: false, agencia: true },
];

const faqs = [
  {
    q: "Posso testar antes de pagar?",
    a: "Sim! Todos os planos incluem 14 dias grátis, sem necessidade de cartão de crédito. Você pode cancelar a qualquer momento durante o trial.",
  },
  {
    q: "O que é o fee de 10% sobre verba de ads?",
    a: "Nos planos com gestão de Google Ads, cobramos 10% do valor investido em anúncios como taxa de gerenciamento. Por exemplo, se você investe R$1.000/mês em ads, o fee é de R$100.",
  },
  {
    q: "Posso fazer upgrade ou downgrade do plano?",
    a: "Sim, você pode mudar de plano a qualquer momento. O valor é ajustado proporcionalmente ao período restante do ciclo de cobrança.",
  },
  {
    q: "Como funciona o cancelamento?",
    a: "Você pode cancelar a qualquer momento nas configurações da sua conta. Seu acesso continua até o final do período já pago. Sem multas ou taxas.",
  },
  {
    q: "Preciso saber sobre Google Ads para usar o módulo?",
    a: "Não! A IA do LocalAI cuida de tudo: pesquisa de keywords, criação de anúncios, negativação de termos irrelevantes e otimização semanal. Você só define a verba.",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const Pricing = () => {
  const [annual, setAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { toast } = useToast();

  const handleCheckout = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      await createCheckoutSession(planId, undefined, annual);
    } catch {
      toast({ title: "Erro", description: "Não foi possível iniciar o checkout. Tente novamente.", variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  const annualPrices: Record<string, number> = {
    price_presenca: 970,
    price_ads: 1970,
    price_agencia: 3970,
  };

  const getPrice = (plan: typeof plans[0]) => {
    if (annual) return annualPrices[plan.id] || Math.round(plan.monthlyPrice * 12 * 0.8);
    return plan.monthlyPrice;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-lg font-heading font-bold">
              Local<span className="text-primary">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Começar grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-12 text-center">
        <div className="container space-y-4">
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold">
            Escolha o plano ideal para seu negócio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            14 dias grátis em todos os planos. Sem cartão de crédito. Cancele quando quiser.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={cn("text-sm font-medium", !annual && "text-foreground", annual && "text-muted-foreground")}>
              Mensal
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={cn(
                "relative w-14 h-7 rounded-full transition-colors",
                annual ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-background shadow-sm transition-transform",
                  annual && "translate-x-7"
                )}
              />
            </button>
            <span className={cn("text-sm font-medium", annual && "text-foreground", !annual && "text-muted-foreground")}>
              Anual
            </span>
            {annual && (
              <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                -20%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="pb-20">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "rounded-2xl border p-6 md:p-8 space-y-6 flex flex-col shadow-soft transition-shadow hover:shadow-medium",
                  plan.popular
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5 relative"
                    : "border-border bg-card"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-primary-foreground bg-primary px-4 py-1 rounded-full">
                    Mais popular
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-heading font-bold">{plan.name}</h3>
                  <div className="mt-3">
                    <span className="text-4xl font-heading font-extrabold">
                      R${getPrice(plan).toLocaleString("pt-BR")}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      /{annual ? "ano" : "mês"}
                    </span>
                  </div>
                  {annual && (
                    <p className="text-xs text-muted-foreground mt-1">
                      equivale a R${Math.round((plan.monthlyPrice * 12 * 0.8) / 12)}/mês
                    </p>
                  )}
                </div>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 mt-0.5 text-success shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                  {plan.disabledFeatures?.map((f, i) => (
                    <li key={`d-${i}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <X className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  size="lg"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={loadingPlan === plan.id}
                  onClick={() => handleCheckout(plan.id)}
                >
                  {loadingPlan === plan.id ? "Redirecionando..." : "Começar grátis por 14 dias"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            <ShieldCheck className="h-10 w-10 text-success shrink-0" />
            <div>
              <h3 className="font-heading font-bold text-lg">Garantia de 14 dias grátis</h3>
              <p className="text-sm text-muted-foreground">
                Teste todas as funcionalidades sem compromisso. Se não gostar, não paga nada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20">
        <div className="container max-w-5xl space-y-8">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-center">
            Compare os planos
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 pr-4 font-medium text-muted-foreground">Funcionalidade</th>
                  <th className="text-center py-4 px-4 font-heading font-bold">Presença</th>
                  <th className="text-center py-4 px-4 font-heading font-bold text-primary">Presença + Ads</th>
                  <th className="text-center py-4 px-4 font-heading font-bold">Agência</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium">{row.name}</td>
                    <td className="text-center py-3 px-4">
                      <CellValue value={row.presenca} />
                    </td>
                    <td className="text-center py-3 px-4 bg-primary/5">
                      <CellValue value={row.ads} />
                    </td>
                    <td className="text-center py-3 px-4">
                      <CellValue value={row.agencia} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-card">
        <div className="container max-w-3xl space-y-8">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-center">
            Perguntas frequentes
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-background overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium pr-4">{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
                      openFaq === i && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    openFaq === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary text-secondary-foreground">
        <div className="container text-center space-y-6 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold">
            Pronto para automatizar seu marketing local?
          </h2>
          <p className="text-secondary-foreground/70 text-lg">
            Comece grátis por 14 dias. Resultados reais em 7 dias.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="text-base px-10 border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Escolher meu plano <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-secondary text-secondary-foreground/60 border-t border-secondary-foreground/10">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-heading font-bold text-secondary-foreground">
              Local<span className="text-primary">AI</span>
            </span>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} LocalAI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-4 w-4 text-success mx-auto" />;
  if (value === false) return <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-sm">{value}</span>;
}

export default Pricing;
