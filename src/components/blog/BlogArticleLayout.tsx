import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Tag, ArrowRight } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

interface Props {
  title: string;
  category: string;
  date: string;
  children: React.ReactNode;
}

export default function BlogArticleLayout({ title, category, date, children }: Props) {
  usePageTitle(title);

  return (
    <div style={{ background: "#020817", color: "#F8FAFC", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(2,8,23,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: 64 }}>
          <Link to="/" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 2C8.48 2 4 6.48 4 12c0 7.5 10 14 10 14s10-6.5 10-14c0-5.52-4.48-10-10-10z" fill="#6366F1" /><circle cx="14" cy="11" r="4" fill="#020817" /></svg>
            <span style={{ fontWeight: 700, fontSize: 20 }} className="font-heading">Local<span style={{ background: "linear-gradient(135deg, #6366F1, #22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/blog" style={{ color: "#94A3B8", fontSize: 14 }} className="hidden sm:inline-flex hover:text-white transition-colors">← Voltar ao Blog</Link>
            <Link to="/auth" className="inline-flex items-center" style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500, boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}>Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-6 pt-8">
        <div className="flex items-center gap-2 text-sm" style={{ color: "#64748B" }}>
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
          <span>/</span>
          <span style={{ color: "#94A3B8" }}>{category}</span>
        </div>
      </div>

      {/* Header */}
      <header className="max-w-3xl mx-auto px-6 pt-10 pb-8">
        <span className="inline-flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 500, color: "#818CF8", background: "rgba(99,102,241,0.12)", padding: "4px 12px", borderRadius: 999, marginBottom: 16, display: "inline-flex" }}>
          <Tag size={11} /> {category}
        </span>
        <h1 className="font-heading" style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", marginTop: 12 }}>{title}</h1>
        <div className="flex items-center gap-2 mt-4" style={{ fontSize: 13, color: "#64748B" }}>
          <Calendar size={13} /> {date}
        </div>
      </header>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 pb-16 blog-article" style={{ fontSize: 16, lineHeight: 1.8, color: "#CBD5E1" }}>
        {children}
      </article>

      {/* CTA */}
      <section style={{ paddingBottom: 80 }}>
        <div className="max-w-3xl mx-auto px-6 text-center" style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12), transparent 70%)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 24, padding: "48px 32px" }}>
          <h2 className="font-heading" style={{ fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 700, marginBottom: 12 }}>
            Quer automatizar seu marketing local? Teste grátis por 14 dias
          </h2>
          <p style={{ fontSize: 15, color: "#64748B", marginBottom: 28 }}>Sem cartão de crédito. Configure em 2 minutos.</p>
          <Link to="/auth" className="inline-flex items-center gap-2" style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)", color: "#fff", padding: "14px 28px", borderRadius: 10, fontWeight: 600, fontSize: 16, boxShadow: "0 0 40px rgba(99,102,241,0.35)" }}>
            Comece grátis agora <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Back */}
      <div className="max-w-3xl mx-auto px-6 pb-12">
        <Link to="/blog" className="inline-flex items-center gap-2 hover:text-white transition-colors" style={{ fontSize: 14, color: "#818CF8" }}>
          <ArrowLeft size={14} /> Ver todos os artigos
        </Link>
      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 0", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#334155" }}>© 2026 LocalAI. Todos os direitos reservados.</p>
      </footer>

      <style>{`
        .blog-article h2 { font-size: 22px; font-weight: 700; color: #F8FAFC; margin: 40px 0 16px; line-height: 1.3; }
        .blog-article h3 { font-size: 18px; font-weight: 600; color: #E2E8F0; margin: 32px 0 12px; line-height: 1.35; }
        .blog-article p { margin-bottom: 16px; }
        .blog-article ul, .blog-article ol { margin: 12px 0 20px 20px; }
        .blog-article li { margin-bottom: 8px; }
        .blog-article strong { color: #F8FAFC; }
        .blog-article a { color: #818CF8; text-decoration: underline; }
        .blog-article blockquote { border-left: 3px solid #6366F1; padding: 12px 20px; margin: 20px 0; background: rgba(99,102,241,0.06); border-radius: 0 8px 8px 0; font-style: italic; color: #94A3B8; }
      `}</style>
    </div>
  );
}
