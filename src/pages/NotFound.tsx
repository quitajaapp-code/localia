import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  usePageTitle("Página não encontrada");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center max-w-md animate-fade-in">
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none" className="mx-auto mb-6 text-primary">
          <circle cx="80" cy="80" r="60" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.2" />
          <text x="80" y="90" textAnchor="middle" fill="currentColor" fontSize="48" fontWeight="bold" className="font-heading">404</text>
        </svg>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Página não encontrada</h1>
        <p className="text-muted-foreground mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild className="btn-press">
            <Link to="/dashboard"><Home className="h-4 w-4 mr-2" /> Ir ao Dashboard</Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()} className="btn-press">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
