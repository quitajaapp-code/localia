import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ArrowRight, Calendar, Tag } from "lucide-react";

const articles = [
  { title: "Estratégias de SEO Local em 2026: Como ranquear no Google Maps", summary: "Descubra os pilares do SEO Local e como aplicá-los para aparecer nas primeiras posições do Maps.", date: "28 de março de 2026", category: "SEO Local", slug: "/blog/estrategias-seo-local-2026" },
  { title: "Como a IA responde avaliações negativas sem perder clientes", summary: "Respostas empáticas e rápidas transformam críticas em oportunidades de fidelização.", date: "25 de março de 2026", category: "Dicas para Donos", slug: "/blog/ia-responde-avaliacoes-negativas" },
  { title: "Mini Site grátis: Por que ele está mudando o jogo em 2026", summary: "Um site otimizado para SEO local, atualizado automaticamente e incluso no seu plano.", date: "22 de março de 2026", category: "Mini Site", slug: "/blog/mini-site-gratis-negocios-locais" },
  { title: "Google Ads para negócios locais: Erros que você deve evitar", summary: "Os erros mais comuns em campanhas locais e como a IA evita cada um deles.", date: "18 de março de 2026", category: "Google Ads", slug: "/blog/erros-google-ads-restaurantes-2026" },
  { title: "Checklist: Como configurar seu Google Meu Negócio corretamente", summary: "Passo a passo para preencher 100% do seu perfil e maximizar visualizações e ligações.", date: "14 de março de 2026", category: "Google Meu Negócio", slug: "/blog/checklist-google-meu-negocio" },
  { title: "+40% de ligações em 60 dias – Caso real com LocalAI", summary: "Como uma clínica odontológica aumentou drasticamente seus contatos com automação.", date: "10 de março de 2026", category: "Casos de Sucesso", slug: "/blog/caso-real-40-porcento-ligacoes" },
  { title: "Como publicar 4 vezes por semana sem esforço", summary: "A IA cria e publica posts relevantes no seu Google Meu Negócio automaticamente.", date: "6 de março de 2026", category: "Dicas para Donos", slug: "/blog/postar-4-vezes-por-semana" },
  { title: "LGPD e segurança no Google Meu Negócio", summary: "Entenda como proteger os dados do seu negócio e dos seus clientes com boas práticas.", date: "2 de março de 2026", category: "Google Meu Negócio", slug: "/blog/lgpd-seguranca-google-meu-negocio" },
];

const categories = ["SEO Local", "Google Meu Negócio", "Google Ads", "Mini Site", "Dicas para Donos", "Casos de Sucesso"];

export default function Blog() {
  usePageTitle("Blog | LocalAI");

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
            <Link to="/" style={{ color: "#94A3B8", fontSize: 14 }} className="hidden sm:inline-flex hover:text-white transition-colors">← Voltar ao site</Link>
            <Link to="/auth" className="inline-flex items-center" style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500, boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}>Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 80, paddingBottom: 48, position: "relative", zIndex: 10 }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="font-heading" style={{ fontSize: "clamp(28px, 4.5vw, 48px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em" }}>
            Blog LocalAI –{" "}
            <span style={{ background: "linear-gradient(135deg, #6366F1, #22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Dicas práticas de Marketing Local com IA
            </span>
          </h1>
          <p style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.7, marginTop: 20, maxWidth: 600, margin: "20px auto 0" }}>
            Artigos úteis sobre Google Meu Negócio, SEO Local, Google Ads e automação para donos de negócios locais.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section style={{ paddingBottom: 48, position: "relative", zIndex: 10 }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <span key={cat} className="inline-flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 500, color: "#A5B4FC", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", padding: "6px 14px", borderRadius: 999 }}>
                <Tag size={11} /> {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section style={{ paddingBottom: 80, position: "relative", zIndex: 10 }}>
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-heading" style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", color: "#6366F1", marginBottom: 32, textAlign: "center" }}>ÚLTIMOS ARTIGOS</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {articles.map((a, i) => (
              <Link
                key={i}
                to={a.slug}
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 28, display: "flex", flexDirection: "column", gap: 12, transition: "all .25s ease" }}
                className="hover:border-indigo-500/40 hover:-translate-y-0.5"
              >
                <span style={{ fontSize: 11, fontWeight: 500, color: "#818CF8", background: "rgba(99,102,241,0.12)", padding: "3px 10px", borderRadius: 999, alignSelf: "flex-start" }}>{a.category}</span>
                <h3 className="font-heading" style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.35 }}>{a.title}</h3>
                <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>{a.summary}</p>
                <div className="flex items-center justify-between" style={{ marginTop: "auto", paddingTop: 8 }}>
                  <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: "#475569" }}>
                    <Calendar size={12} /> {a.date}
                  </span>
                  <span className="flex items-center gap-1" style={{ fontSize: 13, fontWeight: 500, color: "#818CF8" }}>
                    Ler mais <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ paddingTop: 48, paddingBottom: 96, position: "relative", zIndex: 10 }}>
        <div className="max-w-3xl mx-auto px-6 text-center" style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12), transparent 70%)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 24, padding: "56px 32px" }}>
          <h2 className="font-heading" style={{ fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 700, marginBottom: 16 }}>
            Quer automatizar todas essas estratégias? Teste grátis por 14 dias
          </h2>
          <p style={{ fontSize: 16, color: "#64748B", marginBottom: 32 }}>
            Sem cartão de crédito. Configure em 2 minutos.
          </p>
          <Link to="/auth" className="inline-flex items-center gap-2" style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)", color: "#fff", padding: "14px 28px", borderRadius: 10, fontWeight: 600, fontSize: 16, boxShadow: "0 0 40px rgba(99,102,241,0.35)" }}>
            Comece grátis agora <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 0", position: "relative", zIndex: 10, textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#334155" }}>© 2026 LocalAI. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
