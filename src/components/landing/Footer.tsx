import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 bg-secondary text-secondary-foreground/40 border-t border-secondary-foreground/5">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-heading font-semibold text-secondary-foreground/60">
              Local<span className="text-primary">AI</span>
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-[13px]">
            <a href="#como-funciona" className="hover:text-secondary-foreground/70 transition-colors duration-200">Como funciona</a>
            <a href="#funcionalidades" className="hover:text-secondary-foreground/70 transition-colors duration-200">Funcionalidades</a>
            <Link to="/pricing" className="hover:text-secondary-foreground/70 transition-colors duration-200">Preços</Link>
            <Link to="/auth" className="hover:text-secondary-foreground/70 transition-colors duration-200">Entrar</Link>
          </div>
          <p className="text-xs text-secondary-foreground/25">© {new Date().getFullYear()} LocalAI</p>
        </div>
      </div>
    </footer>
  );
}
