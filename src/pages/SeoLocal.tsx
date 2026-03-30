import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  MapPin, Star, TrendingUp, Check, ArrowRight, ChevronDown,
  Search, Globe, MessageSquare, FileText, Target, Shield, Zap,
  CheckCircle, BookOpen
} from "lucide-react";

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
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

const faqItems = [
  { q: "O que é SEO Local e por que é importante?", a: "SEO Local é o conjunto de estratégias para fazer seu negócio aparecer nas buscas regionais do Google — como 'dentista perto de mim' ou 'restaurante em Pinheiros'. Em 2026, 78% das buscas locais no celular resultam em uma visita ou ligação em até 24 horas." },
  { q: "Quanto tempo leva para ver resultados com SEO Local?", a: "Os primeiros sinais aparecem em 2 a 4 semanas: mais visualizações no Maps, mais cliques no perfil. Em 90 dias, a maioria dos negócios já tem aumento mensurável em ligações e pedidos de rota." },
  { q: "Preciso de conhecimento técnico para fazer SEO Local?", a: "Não. O LocalAI automatiza 90% do trabalho: posts, respostas a avaliações, otimização do perfil e Mini Site. Você só precisa configurar uma vez." },
  { q: "O Google Meu Negócio ainda é gratuito?", a: "Sim. Criar e manter um Google Business Profile é 100% gratuito. O LocalAI apenas automatiza a gestão dele para maximizar seus resultados." },
  { q: "Como avaliações impactam meu ranking local?", a: "O Google considera quantidade, qualidade (nota média) e frequência de avaliações como fator de ranking. Negócios com mais avaliações recentes e respostas consistentes tendem a aparecer mais alto no Maps." },
  { q: "O Mini Site substitui meu site principal?", a: "Não necessariamente. Ele funciona como um complemento otimizado para SEO local, ideal para quem não tem site ou quer uma presença extra focada em conversão local." },
  { q: "Posso usar o LocalAI se já tenho um site?", a: "Sim. O Mini Site é um bônus. O LocalAI otimiza seu Google Business Profile independentemente de você ter ou não um site." },
  { q: "SEO Local funciona para qualquer tipo de negócio?", a: "Funciona para qualquer negócio que atenda clientes em uma região: restaurantes, clínicas, salões, academias, pet shops, escritórios, lojas etc." },
];

const checklist = [
  "Complete 100% do seu Google Business Profile (nome, endereço, telefone, horários, fotos, categorias)",
  "Publique posts semanais com novidades, promoções ou dicas do seu nicho",
  "Responda todas as avaliações — positivas e negativas — em até 24 horas",
  "Garanta consistência NAP (Nome, Endereço, Telefone) em todos os diretórios online",
  "Adicione fotos reais e atualizadas do seu negócio pelo menos 1x por mês",
  "Crie um Mini Site otimizado para SEO local com CTA de WhatsApp",
  "Monitore métricas semanalmente: views, ligações, rotas e cliques no site",
];

export default function SeoLocal() {
  usePageTitle("Estratégias de SEO Local em 2026 | LocalAI");
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#020817", color: "#F8FAFC", minHeight: "100vh" }}>
      <style>{`
        .reveal{opacity:1;transform:translateY(0);transition:opacity .65s ease,transform .65s ease}
        .reveal.show{opacity:1;transform:translateY(0)}
        .cta-primary{transition:all .25s ease}.cta-primary:hover{transform:translateY(-2px);box-shadow:0 0 50px rgba(99,102,241,.45),0 4px 20px rgba(0,0,0,.4)!important}
        .cta-ghost{transition:all .25s ease}.cta-ghost:hover{color:#F8FAFC!important;border-color:rgba(255,255,255,.3)!important}
        .nav-link{transition:color .2s ease}.nav-link:hover{color:#F8FAFC!important}
        .faq-content{max-height:0;overflow:hidden;transition:max-height .35s ease,padding .35s ease;padding:0 24px}
        .faq-content.open{max-height:400px;padding:0 24px 20px}
        .content-card{transition:all .3s ease}.content-card:hover{transform:translateY(-3px);border-color:rgba(99,102,241,.35)!important}
      `}</style>

      {/* Fixed orbs */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)", filter: "blur(120px)" }} />
        <div style={{ position: "absolute", bottom: -200, right: -200, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.10), transparent 70%)", filter: "blur(120px)" }} />
      </div>

      {/* Noise */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", opacity: 0.025, mixBlendMode: "overlay" as const, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />

      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(2,8,23,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,0.4)" : "none", transition: "box-shadow 0.3s ease" }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: 64 }}>
          <Link to="/" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 2C8.48 2 4 6.48 4 12c0 7.5 10 14 10 14s10-6.5 10-14c0-5.52-4.48-10-10-10z" fill="#6366F1" /><circle cx="14" cy="11" r="4" fill="#020817" /></svg>
            <span style={{ fontWeight: 700, fontSize: 20 }} className="font-heading">Local<span style={{ background: "linear-gradient(135deg, #6366F1, #22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="nav-link hidden sm:inline-flex" style={{ color: "#94A3B8", fontSize: 14 }}>← Voltar ao site</Link>
            <Link to="/auth" className="cta-primary inline-flex items-center" style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500, boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}>Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 96, paddingBottom: 64, position: "relative", zIndex: 10 }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Reveal>
            <div className="flex items-center justify-center gap-2" style={{ marginBottom: 24 }}>
              <BookOpen size={16} style={{ color: "#6366F1" }} />
              <span style={{ fontSize: 12, letterSpacing: "0.15em", color: "#6366F1", fontWeight: 600 }}>GUIA COMPLETO</span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-heading" style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              Estratégias de SEO Local em 2026:{" "}
              <span style={{ background: "linear-gradient(135deg, #6366F1 0%, #22D3EE 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Como Ficar no Topo do Google Maps
              </span>
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p style={{ fontSize: 18, color: "#94A3B8", lineHeight: 1.7, marginTop: 24, maxWidth: 600, margin: "24px auto 0" }}>
              Descubra as táticas que realmente funcionam hoje e como o LocalAI automatiza a maior parte do trabalho para você.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="flex justify-center gap-4 flex-wrap" style={{ marginTop: 40 }}>
              <Link to="/auth" className="cta-primary inline-flex items-center gap-2" style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)", color: "#fff", padding: "14px 28px", borderRadius: 10, fontWeight: 600, fontSize: 16, boxShadow: "0 0 40px rgba(99,102,241,0.35)" }}>
                Teste grátis por 14 dias <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Intro */}
      <section style={{ paddingBottom: 80, position: "relative", zIndex: 10 }}>
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 32 }}>
              <p style={{ fontSize: 16, color: "#CBD5E1", lineHeight: 1.8 }}>
                Em 2026, <strong style={{ color: "#F8FAFC" }}>46% de todas as buscas no Google têm intenção local</strong>. Isso significa que quase metade das pessoas que pesquisam algo estão procurando negócios, serviços ou produtos perto delas. Se o seu negócio não aparece no topo do Google Maps e da busca local, você está perdendo clientes todos os dias para concorrentes que investem em SEO Local.
              </p>
              <p style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.8, marginTop: 16 }}>
                Este guia reúne as estratégias mais eficazes para ranquear no Google Maps em 2026 — e mostra como o LocalAI pode automatizar a maior parte desse trabalho para você.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3 Pilares */}
      <section style={{ paddingTop: 64, paddingBottom: 80, position: "relative", zIndex: 10, background: "rgba(99,102,241,0.02)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <span style={{ fontSize: 11, letterSpacing: "0.15em", color: "#6366F1", fontWeight: 600, display: "block", textAlign: "center" }}>FUNDAMENTOS</span>
            <h2 className="font-heading text-center" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.02em", marginTop: 16, marginBottom: 48 }}>Os 3 Pilares do SEO Local</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Target, title: "Relevância", desc: "O quanto seu perfil e conteúdo correspondem ao que o usuário está buscando. Categorias corretas, descrição otimizada e posts frequentes aumentam sua relevância." },
              { icon: MapPin, title: "Distância", desc: "A proximidade do seu negócio com quem está buscando. Você não controla isso, mas pode expandir seu alcance com conteúdo local e citações em diretórios." },
              { icon: Star, title: "Proeminência", desc: "O quão conhecido e confiável seu negócio é online. Avaliações, engajamento, links e presença em diretórios constroem proeminência." },
            ].map((p, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="content-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 28 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <p.icon size={22} style={{ color: "#6366F1" }} />
                  </div>
                  <h3 className="font-heading" style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{p.title}</h3>
                  <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7 }}>{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GBP Optimization */}
      <section style={{ paddingTop: 80, paddingBottom: 80, position: "relative", zIndex: 10 }}>
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <h2 className="font-heading" style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, marginBottom: 24 }}>
              <Search size={24} style={{ color: "#6366F1", display: "inline", marginRight: 12 }} />
              Otimização Avançada do Google Business Profile
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <div style={{ fontSize: 16, color: "#CBD5E1", lineHeight: 1.8 }}>
              <p>O Google Business Profile (antigo Google Meu Negócio) é o <strong style={{ color: "#F8FAFC" }}>fator #1</strong> para aparecer no Maps e no pack local. Em 2026, o GBP ficou ainda mais poderoso com novos recursos.</p>
              <h3 className="font-heading" style={{ fontSize: 18, fontWeight: 600, marginTop: 32, marginBottom: 16, color: "#F8FAFC" }}>O que otimizar:</h3>
              <div className="space-y-3">
                {[
                  "Nome do negócio exato (sem keywords stuffing)",
                  "Todas as categorias relevantes selecionadas (primária + secundárias)",
                  "Descrição completa com palavras-chave naturais do seu nicho",
                  "Horários atualizados (inclusive feriados e horários especiais)",
                  "Fotos reais e de alta qualidade — interior, exterior, equipe e produtos",
                  "Atributos e serviços preenchidos (Wi-Fi, estacionamento, acessibilidade etc.)",
                  "Link para agendamento ou WhatsApp configurado",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3" style={{ fontSize: 15, color: "#94A3B8" }}>
                    <Check size={14} style={{ color: "#22C55E", flexShrink: 0, marginTop: 4 }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div style={{ marginTop: 32, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <Zap size={20} style={{ color: "#818CF8", flexShrink: 0 }} />
              <p style={{ fontSize: 14, color: "#A5B4FC" }}>
                <strong>Com o LocalAI:</strong> O Score de Eficiência analisa automaticamente seu perfil e indica exatamente o que falta preencher para chegar a 100%.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mini Site for SEO */}
      <section style={{ paddingTop: 80, paddingBottom: 80, position: "relative", zIndex: 10, background: "rgba(99,102,241,0.02)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <h2 className="font-heading" style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, marginBottom: 24 }}>
              <Globe size={24} style={{ color: "#6366F1", display: "inline", marginRight: 12 }} />
              O Poder do Mini Site para SEO Local
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <div style={{ fontSize: 16, color: "#CBD5E1", lineHeight: 1.8 }}>
              <p>Um Mini Site otimizado para SEO local funciona como uma <strong style={{ color: "#F8FAFC" }}>página de autoridade</strong> do seu negócio. Diferente de redes sociais, ele é indexado pelo Google e acumula relevância ao longo do tempo.</p>
              <h3 className="font-heading" style={{ fontSize: 18, fontWeight: 600, marginTop: 32, marginBottom: 16, color: "#F8FAFC" }}>Por que o Mini Site do LocalAI é diferente:</h3>
              <div className="space-y-3">
                {[
                  "Estruturado com Schema Markup para negócios locais (LocalBusiness)",
                  "Atualizado automaticamente com seus posts do Google",
                  "Avaliações reais exibidas em tempo real — prova social permanente",
                  "Botão de WhatsApp e telefone com 1 clique",
                  "Domínio exclusivo: seunegocio.localai.app.br",
                  "Mobile-first — 70% das buscas locais vêm do celular",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3" style={{ fontSize: 15, color: "#94A3B8" }}>
                    <Check size={14} style={{ color: "#22C55E", flexShrink: 0, marginTop: 4 }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="flex gap-4 flex-wrap" style={{ marginTop: 32 }}>
              <Link to="/demos" className="cta-primary inline-flex items-center gap-2" style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)", color: "#fff", padding: "12px 24px", borderRadius: 10, fontWeight: 500, fontSize: 14, boxShadow: "0 0 30px rgba(99,102,241,0.3)" }}>
                Ver exemplo de Mini Site <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Posts + Reviews */}
      <section style={{ paddingTop: 80, paddingBottom: 80, position: "relative", zIndex: 10 }}>
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <h2 className="font-heading" style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, marginBottom: 24 }}>
              <MessageSquare size={24} style={{ color: "#6366F1", display: "inline", marginRight: 12 }} />
              Posts Automáticos, Avaliações e Engajamento
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <div style={{ fontSize: 16, color: "#CBD5E1", lineHeight: 1.8 }}>
              <p>O Google valoriza perfis <strong style={{ color: "#F8FAFC" }}>ativos e engajados</strong>. Negócios que publicam posts semanais e respondem avaliações consistentemente recebem mais visibilidade no Maps.</p>
              <h3 className="font-heading" style={{ fontSize: 18, fontWeight: 600, marginTop: 32, marginBottom: 16, color: "#F8FAFC" }}>Posts no Google Business Profile</h3>
              <p>Posts no GBP funcionam como mini-anúncios gratuitos. Eles aparecem diretamente no seu perfil quando alguém busca seu negócio ou categoria. Em 2026, o Google dá mais peso a perfis que publicam regularmente.</p>
              <h3 className="font-heading" style={{ fontSize: 18, fontWeight: 600, marginTop: 32, marginBottom: 16, color: "#F8FAFC" }}>Gestão de Avaliações</h3>
              <p>Responder avaliações — tanto positivas quanto negativas — é um dos sinais mais fortes de confiança para o Google. Negócios que respondem 100% das avaliações têm, em média, <strong style={{ color: "#F8FAFC" }}>nota 0.3 pontos maior</strong> que os que ignoram.</p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div style={{ marginTop: 32, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <Zap size={20} style={{ color: "#818CF8", flexShrink: 0 }} />
              <p style={{ fontSize: 14, color: "#A5B4FC" }}>
                <strong>Com o LocalAI:</strong> Posts automáticos 4x/semana e respostas com IA personalizadas ao tom do seu negócio — sem você precisar fazer nada.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* NAP + Citations */}
      <section style={{ paddingTop: 80, paddingBottom: 80, position: "relative", zIndex: 10, background: "rgba(99,102,241,0.02)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <h2 className="font-heading" style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, marginBottom: 24 }}>
              <Shield size={24} style={{ color: "#6366F1", display: "inline", marginRight: 12 }} />
              Consistência NAP + Citações Locais
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <div style={{ fontSize: 16, color: "#CBD5E1", lineHeight: 1.8 }}>
              <p><strong style={{ color: "#F8FAFC" }}>NAP</strong> significa Nome, Endereço e Telefone (Name, Address, Phone). A consistência dessas informações em todos os diretórios online é um dos fatores mais subestimados do SEO Local.</p>
              <p style={{ marginTop: 16 }}>Se seu telefone aparece diferente no Google, no Facebook e no Yelp, o Google perde confiança na veracidade das informações e pode rebaixar seu ranking.</p>
              <h3 className="font-heading" style={{ fontSize: 18, fontWeight: 600, marginTop: 32, marginBottom: 16, color: "#F8FAFC" }}>Citações importantes no Brasil:</h3>
              <div className="grid grid-cols-2 gap-3">
                {["Google Business Profile", "Facebook", "Instagram", "TripAdvisor", "Foursquare", "Reclame Aqui", "iFood / Rappi", "Páginas Amarelas"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2" style={{ fontSize: 14, color: "#94A3B8" }}>
                    <Check size={12} style={{ color: "#22C55E" }} /> {item}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How LocalAI automates */}
      <section style={{ paddingTop: 80, paddingBottom: 80, position: "relative", zIndex: 10 }}>
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <div className="text-center">
              <span style={{ fontSize: 11, letterSpacing: "0.15em", color: "#6366F1", fontWeight: 600 }}>AUTOMAÇÃO</span>
              <h2 className="font-heading" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.02em", marginTop: 16, marginBottom: 48 }}>Como o LocalAI Automatiza Seu SEO Local</h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: FileText, title: "Posts automáticos 4x/semana", desc: "A IA cria conteúdo relevante para seu nicho e publica direto no Google Business Profile sem que você precise fazer nada." },
              { icon: MessageSquare, title: "Respostas inteligentes às avaliações", desc: "Toda avaliação respondida em minutos com o tom de voz do seu negócio — profissional, empática e personalizada." },
              { icon: Target, title: "Google Ads otimizado com IA", desc: "Campanhas criadas, keywords otimizadas e negativadas semanalmente para maximizar ligações com seu orçamento." },
              { icon: Globe, title: "Mini Site profissional incluso", desc: "Um site otimizado para SEO local com domínio exclusivo, atualizado automaticamente com seus posts e avaliações." },
              { icon: TrendingUp, title: "Score de Eficiência", desc: "Acompanhe em tempo real o índice de aproveitamento do seu perfil e saiba exatamente o que melhorar para subir no ranking." },
              { icon: Shield, title: "Alerta de edições não autorizadas", desc: "Se alguém alterar seu perfil no Google sem sua autorização, você recebe um alerta imediato para proteger suas informações." },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="content-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(34,211,238,0.1))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <f.icon size={20} style={{ color: "#818CF8" }} />
                  </div>
                  <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section style={{ paddingTop: 80, paddingBottom: 80, position: "relative", zIndex: 10, background: "rgba(99,102,241,0.02)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <div className="text-center">
              <span style={{ fontSize: 11, letterSpacing: "0.15em", color: "#6366F1", fontWeight: 600 }}>CHECKLIST PRÁTICO</span>
              <h2 className="font-heading" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.02em", marginTop: 16, marginBottom: 48 }}>7 Passos para Ranquear Melhor no Google Maps</h2>
            </div>
          </Reveal>
          <div className="space-y-4">
            {checklist.map((item, i) => (
              <Reveal key={i} delay={i * 60}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#818CF8" }}>{i + 1}</span>
                  </div>
                  <p style={{ fontSize: 15, color: "#CBD5E1", lineHeight: 1.6 }}>{item}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={500}>
            <div style={{ marginTop: 40, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: 20, textAlign: "center" }}>
              <p style={{ fontSize: 15, color: "#A5B4FC" }}>
                💡 <strong>Dica:</strong> O LocalAI automatiza os passos 2, 3, 5 e 7 para você. <Link to="/auth" style={{ color: "#818CF8", textDecoration: "underline" }}>Teste grátis por 14 dias</Link>.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingTop: 80, paddingBottom: 80, position: "relative", zIndex: 10 }}>
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <div className="text-center">
              <span style={{ fontSize: 11, letterSpacing: "0.15em", color: "#6366F1", fontWeight: 600 }}>FAQ</span>
              <h2 className="font-heading" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.02em", marginTop: 16, marginBottom: 48 }}>Perguntas Frequentes sobre SEO Local</h2>
            </div>
          </Reveal>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <Reveal key={i} delay={i * 50}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between text-left"
                    style={{ padding: "16px 24px", fontSize: 15, fontWeight: 500, color: "#E2E8F0" }}
                  >
                    {item.q}
                    <ChevronDown size={16} style={{ color: "#6366F1", flexShrink: 0, transition: "transform 0.3s ease", transform: openFaq === i ? "rotate(180deg)" : "rotate(0)" }} />
                  </button>
                  <div className={`faq-content ${openFaq === i ? "open" : ""}`}>
                    <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7 }}>{item.a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ paddingTop: 80, paddingBottom: 96, position: "relative", zIndex: 10 }}>
        <div className="max-w-3xl mx-auto px-6 text-center" style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 24, padding: 64 }}>
          <h2 className="font-heading" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, marginBottom: 16 }}>
            Pronto para automatizar seu SEO Local?
          </h2>
          <p style={{ fontSize: 16, color: "#64748B", marginBottom: 40, maxWidth: 500, margin: "0 auto 40px" }}>
            Teste grátis por 14 dias. Sem cartão de crédito. A IA começa a trabalhar no seu Google em menos de 5 minutos.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/auth" className="cta-primary inline-flex items-center gap-2" style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)", color: "#fff", padding: "14px 28px", borderRadius: 10, fontWeight: 600, fontSize: 16, boxShadow: "0 0 40px rgba(99,102,241,0.35)" }}>
              Começar grátis agora <ArrowRight size={16} />
            </Link>
            <Link to="/" className="cta-ghost inline-flex items-center" style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#94A3B8", padding: "14px 28px", borderRadius: 10, fontSize: 16 }}>
              Ver planos e preços
            </Link>
          </div>
          <div className="flex justify-center items-center gap-6 flex-wrap" style={{ marginTop: 32, fontSize: 13, color: "#334155" }}>
            <span className="flex items-center gap-1.5">🔒 Pagamento seguro</span>
            <span className="flex items-center gap-1.5">🛡️ LGPD</span>
            <span className="flex items-center gap-1.5">✓ Sem fidelidade</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 48, paddingBottom: 48, position: "relative", zIndex: 10 }}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-5xl mx-auto px-6">
          <Link to="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none"><path d="M14 2C8.48 2 4 6.48 4 12c0 7.5 10 14 10 14s10-6.5 10-14c0-5.52-4.48-10-10-10z" fill="#6366F1" /><circle cx="14" cy="11" r="4" fill="#020817" /></svg>
            <span className="font-heading" style={{ fontWeight: 700, fontSize: 18 }}>Local<span style={{ background: "linear-gradient(135deg, #6366F1, #22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span></span>
          </Link>
          <div className="flex gap-6 flex-wrap" style={{ fontSize: 13, color: "#475569" }}>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Termos</Link>
            <Link to="/" className="hover:text-foreground transition-colors">Página inicial</Link>
          </div>
          <p style={{ fontSize: 13, color: "#334155" }}>© 2026 LocalAI</p>
        </div>
      </footer>
    </div>
  );
}
