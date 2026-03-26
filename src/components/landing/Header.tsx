import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-lg font-heading font-bold">
            Local<span className="text-primary">AI</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
          <a href="#funcionalidades" className="hover:text-foreground transition-colors">Funcionalidades</a>
          <a href="#depoimentos" className="hover:text-foreground transition-colors">Depoimentos</a>
          <a href="#precos" className="hover:text-foreground transition-colors">Preços</a>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/auth">Entrar</Link>
          </Button>
          <Button asChild>
            <Link to="/pricing">Começar grátis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
