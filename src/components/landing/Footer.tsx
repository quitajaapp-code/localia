import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 bg-secondary text-secondary-foreground/60 border-t border-secondary-foreground/10">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-heading font-bold text-secondary-foreground">
              Local<span className="text-primary">AI</span>
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#como-funciona" className="hover:text-secondary-foreground transition-colors">Como funciona</a>
            <a href="#funcionalidades" className="hover:text-secondary-foreground transition-colors">Funcionalidades</a>
            <Link to="/pricing" className="hover:text-secondary-foreground transition-colors">Preços</Link>
            <Link to="/auth" className="hover:text-secondary-foreground transition-colors">Entrar</Link>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} LocalAI. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
