import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import localaiLogo from "@/assets/localai-logo.png";
import localaiLogoDark from "@/assets/localai-logo-dark.png";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Header({ darkLogo = false }: { darkLogo?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/#como-funciona", label: "Como funciona" },
    { href: "/#funcionalidades", label: "Funcionalidades" },
    { href: "/#depoimentos", label: "Depoimentos" },
    { href: "/#precos", label: "Preços" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-14 md:h-16">
        <Link to="/" className="flex items-center group">
          <img src={darkLogo ? localaiLogoDark : localaiLogo} alt="LocalAI" className="h-7" />
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-foreground transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="text-[13px] text-muted-foreground hover:text-foreground">
            <Link to="/auth">Entrar</Link>
          </Button>
          <Button size="sm" asChild className="text-[13px] rounded-lg px-4">
            <Link to="/pricing">Começar grátis</Link>
          </Button>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="container py-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2.5 px-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 border-t border-border/50 space-y-1.5">
                <Button variant="ghost" asChild className="w-full justify-start text-sm">
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button asChild className="w-full text-sm rounded-lg">
                  <Link to="/pricing">Começar grátis</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
