import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useEffect, useRef, useState, useLayoutEffect } from "react";

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={`reveal ${visible ? "show" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const demos = [
  {
    slug: "demo-salao",
    segment: "SALÃO & BARBEARIA",
    name: "Estúdio Bela & Arte",
    desc: "Salão de beleza e barbearia em Porto Alegre, RS",
    color: "#8B5CF6",
    heroImg: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
    heroTitle: "Estúdio Bela & Arte",
    heroSub: "Cortes, coloração e tratamentos capilares",
  },
  {
    slug: "demo-clinica",
    segment: "CLÍNICA ESTÉTICA",
    name: "Clínica Essence",
    desc: "Estética e bem-estar em São Paulo, SP",
    color: "#0891B2",
    heroImg: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
    heroTitle: "Clínica Essence",
    heroSub: "Tratamentos estéticos avançados",
  },
  {
    slug: "demo-loja",
    segment: "LOJA DE VARIEDADES",
    name: "Casa & Estilo",
    desc: "Loja de variedades e presentes em Belo Horizonte, MG",
    color: "#D97706",
    heroImg: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
    heroTitle: "Casa & Estilo",
    heroSub: "Decoração, presentes e utilidades",
  },
];

export default function Demos() {
  usePageTitle("Mini Sites Modelo — LocalAI");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#020817", color: "#F8FAFC", minHeight: "100vh" }}>
      <style>{`
        .reveal{opacity:0;transform:translateY(28px);transition:opacity .65s ease,transform .65s ease}
        .reveal.show{opacity:1;transform:translateY(0)}
        .demo-card{transition:all .3s ease}.demo-card:hover{transform:translateY(-4px);border-color:rgba(99,102,241,.4)!important;box-shadow:0 12px 40px rgba(99,102,241,.15)}
        .cta-primary{transition:all .25s ease}.cta-primary:hover{transform:translateY(-2px);box-shadow:0 0 50px rgba(99,102,241,.45),0 4px 20px rgba(0,0,0,.4)!important}
        .cta-ghost{transition:all .25s ease}.cta-ghost:hover{color:#F8FAFC!important;border-color:rgba(255,255,255,.3)!important}
      `}</style>

      {/* Background Orbs */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)", filter: "blur(120px)" }} />
        <div style={{ position: "absolute", bottom: -200, right: -200, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.12), transparent 70%)", filter: "blur(120px)" }} />
      </div>

      {/* Noise */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", opacity: 0.025, mixBlendMode: "overlay" as const, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />

      {/* Top line */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <div style={{ height: 1, width: "100%", background: "linear-gradient(90deg, transparent 0%, #6366F1 30%, #22D3EE 70%, transparent 100%)" }} />
        <div style={{ height: 40, background: "linear-gradient(to bottom, rgba(99,102,241,0.08), transparent)" }} />
      </div>

      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(2,8,23,0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,0.4)" : "none", transition: "box-shadow 0.3s ease" }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: 64 }}>
          <Link to="/" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 2C8.48 2 4 6.48 4 12c0 7.5 10 14 10 14s10-6.5 10-14c0-5.52-4.48-10-10-10z" fill="#6366F1" /><circle cx="14" cy="11" r="4" fill="#020817" /></svg>
            <span style={{ fontWeight: 700, fontSize: 20 }} className="font-heading">Local<span style={{ background: "linear-gradient(135deg, #6366F1, #22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span></span>
          </Link>
          <Link to="/auth" className="cta-primary inline-flex items-center" style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500, boxShadow: "0 0 20px rgba(99,102,241,0.3)", textDecoration: "none" }}>Criar meu site</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 80, paddingBottom: 64, position: "relative", zIndex: 10 }}>
        <div className="max-w-3xl mx-auto text-center px-6">
          <Reveal>
            <span className="inline-flex items-center gap-2" style={{ border: "1px solid rgba(99,102,241,0.4)", background: "rgba(99,102,241,0.1)", padding: "6px 16px", borderRadius: 999, fontSize: 13, color: "#A5B4FC" }}>
              <Sparkles size={14} /> 3 modelos disponíveis
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="font-heading" style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", marginTop: 24 }}>
              Mini Sites que convertem{" "}
              <span style={{ background: "linear-gradient(135deg, #6366F1 0%, #22D3EE 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>clientes</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p style={{ maxWidth: 520, margin: "20px auto 0", fontSize: 17, color: "#94A3B8", lineHeight: 1.6 }}>
              Veja exemplos reais de como seu negócio pode aparecer na internet. Incluso no plano Presença + Ads.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Grid de 3 cards */}
      <section style={{ paddingBottom: 96, position: "relative", zIndex: 10 }}>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6">
          {demos.map((d, i) => (
            <Reveal key={d.slug} delay={i * 100}>
              <div className="demo-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
                {/* Preview mockup */}
                <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
                  <img src={d.heroImg} alt={d.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(2,8,23,0.95) 0%, rgba(2,8,23,0.3) 50%, transparent 100%)" }} />
                  {/* Segment tag */}
                  <div style={{ position: "absolute", top: 12, left: 12 }}>
                    <span style={{ fontSize: 10, letterSpacing: "0.1em", fontWeight: 600, color: "#fff", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", padding: "4px 10px", borderRadius: 6 }}>{d.segment}</span>
                  </div>
                  {/* Color badge */}
                  <div style={{ position: "absolute", top: 12, right: 12, width: 24, height: 24, borderRadius: "50%", background: d.color, border: "2px solid rgba(255,255,255,0.3)", boxShadow: `0 0 12px ${d.color}66` }} />
                  {/* Name overlay */}
                  <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{d.heroTitle}</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{d.heroSub}</div>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: "16px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5, marginBottom: 20, flex: 1 }}>{d.desc}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Link
                      to={`/site/${d.slug}`}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        background: d.color, color: "#fff", padding: "10px 16px", borderRadius: 10,
                        fontSize: 13, fontWeight: 600, textDecoration: "none",
                        boxShadow: `0 0 20px ${d.color}44`,
                      }}
                    >
                      Ver site completo <ArrowRight size={14} />
                    </Link>
                    <Link
                      to="/auth"
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        border: "1px solid rgba(255,255,255,0.15)", color: "#94A3B8", padding: "10px 16px", borderRadius: 10,
                        fontSize: 13, fontWeight: 500, textDecoration: "none",
                      }}
                      className="cta-ghost"
                    >
                      Criar igual para meu negócio <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 0", position: "relative", zIndex: 10 }}>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p style={{ fontSize: 13, color: "#475569", marginBottom: 12 }}>© 2026 LocalAI — Todos os modelos são demonstrativos</p>
          <Link to="/" style={{ fontSize: 13, color: "#6366F1", textDecoration: "none" }}>← Voltar para o início</Link>
        </div>
      </footer>
    </div>
  );
}
