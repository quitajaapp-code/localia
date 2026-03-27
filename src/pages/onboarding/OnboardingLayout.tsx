import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import localaiLogo from "@/assets/localai-logo.png";

const STEPS = [
  { path: "/onboarding/connect", label: "Conectar Google", step: 1 },
  { path: "/onboarding/business", label: "Dados do Negócio", step: 2 },
  { path: "/onboarding/materials", label: "Materiais", step: 3 },
];

export default function OnboardingLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentIndex = STEPS.findIndex((s) => s.path === location.pathname);
  const current = STEPS[currentIndex] || STEPS[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <img src={localaiLogo} alt="LocalAI" className="h-7" />
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-2xl mx-auto w-full px-6 pt-8">
        <div className="flex items-center gap-2 mb-2">
          {STEPS.map((s, i) => (
            <div key={s.path} className="flex items-center flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                    i < current.step - 1
                      ? "bg-primary text-primary-foreground"
                      : i === currentIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < current.step - 1 ? <Check className="h-4 w-4" /> : s.step}
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 ${i < currentIndex ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Etapa {current.step} de 3</p>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">
        <Outlet />
      </div>

      {/* Footer nav */}
      <div className="border-t bg-card px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(STEPS[currentIndex - 1]?.path || "/")}
            disabled={currentIndex <= 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          {currentIndex < STEPS.length - 1 ? (
            <Button onClick={() => navigate(STEPS[currentIndex + 1].path)}>
              Próximo <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => navigate("/dashboard")}>
              Concluir <Check className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
