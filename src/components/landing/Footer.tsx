import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-14 bg-secondary text-secondary-foreground/50 border-t border-secondary-foreground/5">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-heading font-bold text-secondary-foreground">
              Local<span className="text-primary">AI</span>
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <a href="#como-funciona" className="hover:text-secondary-foreground transition-colors duration-200">Como funciona</a>
            <a href="#funcionalidades" className="hover:text-secondary-foreground transition-colors duration-200">Funcionalidades</a>
            <Link to="/pricing" className="hover:text-secondary-foreground transition-colors duration-200">Preços</Link>
            <Link to="/auth" className="hover:text-secondary-foreground transition-colors duration-200">Entrar</Link>
          </div>
          <p className="text-xs text-secondary-foreground/30">© {new Date().getFullYear()} LocalAI. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
