import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import demoPreview from "@/assets/demo-salao-preview.png";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  MapPin, Star, TrendingUp, Bot, Zap, BarChart3,
  Shield, Bell, Check, ArrowRight,
  MessageSquare, Image, Target, FileText, Play, Globe,
  ChevronDown, Lock, CreditCard, XCircle, Users, Award
} from "lucide-react";

/* ─── Scroll animation hook ─── */
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

/* ─── Data ─── */
const steps = [
  { icon: MapPin, num: "01", title: "Conecte seu Google", desc: "Autorize em 1 clique. Conectamos seu Google Meu Negócio e Google Ads de forma segura." },
  { icon: Bot, num: "02", title: "Configure uma vez", desc: "Informe seu nicho, tom de voz e verba de ads. A IA aprende como falar pelo seu negócio." },
  { icon: TrendingUp, num: "03", title: "Resultados no piloto", desc: "Posts publicados, avaliações respondidas, ads otimizados. Você só acompanha os resultados." },
];

const features = [
  { icon: FileText, title: "Posts automáticos", desc: "4 posts/semana no Google Meu Negócio, criados pela IA com base no seu nicho e público." },
  { icon: MessageSquare, title: "Respostas com IA", desc: "Toda avaliação respondida em minutos — empática, profissional e com a voz do seu negócio." },
  { icon: Target, title: "Gestor de Google Ads", desc: "A IA cria sua campanha, escolhe palavras-chave e otimiza a verba toda semana automaticamente." },
  { icon: Zap, title: "Score de eficiência", desc: "Acompanhe o índice de aproveitamento do seu perfil e saiba exatamente o que melhorar." },
  { icon: BarChart3, title: "Relatório unificado", desc: "GMB + Ads em um relatório semanal simples, sem jargão técnico — direto no seu WhatsApp." },
  { icon: Shield, title: "Alerta de edições", desc: "Se alguém alterar seu perfil no Google sem autorização, você recebe um alerta imediato." },
  { icon: Globe, title: "Mini Site profissional", desc: "Seu negócio ganha um site otimizado para SEO local, com domínio próprio e atualizações automáticas — grátis no plano Presença + Ads." },
];

const niches = [
  { name: "Restaurante", icon: MapPin, img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80" },
  { name: "Clínica", icon: Shield, img: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=80" },
  { name: "Salão de Beleza", icon: Star, img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80" },
  { name: "Academia", icon: Zap, img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80" },
];

const testimonials = [
  { initial: "M", bg: "#6366F1", text: "Antes ficava com raiva ao ver uma avaliação ruim e não sabia o que responder. Agora a IA responde em minutos, melhor do que eu faria. Minha nota subiu de 4.1 para 4.6 em 60 dias.", name: "Marcos Oliveira", sub: "Pizzaria Don Marco, São Paulo" },
  { initial: "F", bg: "#0891B2", text: "Meu perfil no Google subiu de 4.1 para 4.7 estrelas em 2 meses. Os anúncios trouxeram 40% mais ligações com o mesmo investimento. E o Mini Site já me gera contatos orgânicos.", name: "Dra. Fernanda Costa", sub: "Clínica Odontológica, Belo Horizonte" },
  { initial: "R", bg: "#7C3AED", text: "Nunca tive tempo para postar no Google. O LocalAI posta 4x por semana e eu nem precisei configurar nada. Minhas visualizações no Maps triplicaram em 3 meses.", name: "Renata Alves", sub: "Studio de Pilates, Curitiba" },
];

const plans = [
  { name: "PRESENÇA", monthlyPrice: 97, annualPrice: 970, desc: "Para quem quer aparecer no Google com consistência.", features: ["Posts automáticos 4x/semana", "Respostas com IA às avaliações", "Score de eficiência", "Relatório semanal", "Alerta de edições"], highlight: false },
  { name: "PRESENÇA + ADS", monthlyPrice: 197, annualPrice: 1970, desc: "Tudo do Presença + Google Ads com IA + Mini Site profissional.", features: ["Tudo do plano Presença", "Campanha Google Ads com IA", "Otimização semanal de keywords", "Negativação automática", "Relatório Ads unificado", "Mini Site profissional incluso"], highlight: true },
  { name: "AGÊNCIA", monthlyPrice: 397, annualPrice: 3970, desc: "Para agências que gerenciam múltiplos negócios.", features: ["Tudo do plano Presença + Ads", "Até 10 negócios", "Painel multi-conta", "Relatórios white-label", "Suporte prioritário"], highlight: false },
];

const faqItems = [
  { q: "A IA responde com a minha voz?", a: "Sim. Na configuração inicial, você define o tom de voz, palavras que devem ou não ser usadas, e o estilo de comunicação do seu negócio. A IA aprende e responde de forma personalizada, como se fosse você — mas com velocidade e consistência impossíveis manualmente." },
  { q: "O Mini Site tem domínio próprio?", a: "Sim. Seu Mini Site é publicado em um subdomínio exclusivo como seunegocio.localai.app.br. Ele é otimizado para SEO local, atualizado automaticamente com seus posts e avaliações do Google, e inclui botão de WhatsApp com 1 clique." },
  { q: "Posso usar com meu Google Ads atual?", a: "Sim. Se você já tem uma conta Google Ads ativa, a IA se conecta a ela e passa a otimizar suas campanhas semanalmente — ajustando keywords, negativando termos e redistribuindo verba para maximizar ligações e contatos." },
  { q: "Funciona para qualquer nicho?", a: "Funciona para qualquer negócio local com presença no Google: restaurantes, clínicas, salões, academias, pet shops, escritórios de advocacia, imobiliárias e muito mais. A IA se adapta ao vocabulário e público de cada segmento." },
  { q: "E se o Google mudar as regras?", a: "Nossa equipe monitora diariamente as atualizações das plataformas Google. A IA é atualizada continuamente para manter conformidade com as diretrizes do Google Meu Negócio e Google Ads, sem que você precise fazer nada." },
  { q: "Como funciona o cancelamento?", a: "Sem fidelidade, sem multa, sem burocracia. Você cancela quando quiser direto no painel. Seu acesso continua até o fim do período pago. Simples assim." },
  { q: "É seguro?", a: "Totalmente. Usamos criptografia de ponta, pagamento seguro via Stripe (líder mundial em pagamentos), e somos compatíveis com a LGPD. Suas credenciais do Google são armazenadas com tokens criptografados e nunca compartilhadas." },
  { q: "Quanto tempo leva para ver resultados?", a: "A maioria dos clientes percebe aumento nas visualizações e ligações nos primeiros 7 a 14 dias. Em 90 dias, garantimos pelo menos 20% de melhoria em visualizações ou ligações — ou devolvemos 100% do seu dinheiro." },
];

const formatPrice = (value: number) => new Intl.NumberFormat("pt-BR").format(value);

const avatarColors = ["#6366F1", "#22D3EE", "#8B5CF6", "#EC4899", "#F59E0B"];
const avatarLetters = ["A", "C", "J", "R", "M"];
const barHeights = ["45%", "60%", "38%", "75%", "55%", "90%", "65%"];

const sidebarItems = [
  { icon: BarChart3, label: "Dashboard", active: true },
  { icon: Star, label: "Avaliações", active: false },
  { icon: FileText, label: "Posts", active: false },
  { icon: Target, label: "Ads", active: false },
  { icon: Image, label: "Materiais", active: false },
  { icon: TrendingUp, label: "Relatório", active: false },
];

const metricCards = [
  { icon: MapPin, label: "Views", value: "2.847", change: "+18%", yellow: false },
  { icon: Bell, label: "Ligações", value: "143", change: "+12%", yellow: false },
  { icon: TrendingUp, label: "Rotas", value: "89", change: "+9%", yellow: false },
  { icon: Star, label: "Nota", value: "4.8 ★", change: "+0.3", yellow: true },
];

const resultStats = [
  { value: "+500", label: "Negócios ativos na plataforma" },
  { value: "+18%", label: "Aumento médio em visualizações no Google Maps" },
  { value: "+12%", label: "Aumento médio em ligações recebidas" },
  { value: "4.7★", label: "Nota média dos negócios após 90 dias" },
];

export default function Landing() {
  usePageTitle("LocalAI — Mais ligações, mais clientes no Google. No piloto automático.");
  const [scrolled, setScrolled] = useState(false);
  const [mockupTilt, setMockupTilt] = useState(true);
  const [annualPricing, setAnnualPricing] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
        @keyframes orb-float{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.05)}66%{transform:translate(-20px,15px) scale(.97)}}
        @keyframes border-glow{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes count-pulse{0%,100%{opacity:1}50%{opacity:.7}}
        .niche-card img{transition:transform .6s ease}.niche-card:hover img{transform:scale(1.07)}
        .step-card{transition:all .3s ease}.step-card:hover{transform:translateY(-4px);border-color:rgba(99,102,241,.4)!important}
        .feature-card{transition:all .3s ease}.feature-card:hover{transform:translateY(-3px);border-color:rgba(99,102,241,.35)!important;box-shadow:0 8px 32px rgba(99,102,241,.1)}
        .testimonial-card{transition:all .3s ease}.testimonial-card:hover{transform:translateY(-3px);border-color:rgba(99,102,241,.3)!important}
        .plan-card{transition:all .3s ease}.plan-card:hover{transform:translateY(-3px)}
        .cta-primary{transition:all .25s ease}.cta-primary:hover{transform:translateY(-2px);box-shadow:0 0 50px rgba(99,102,241,.45),0 4px 20px rgba(0,0,0,.4)!important}
        .cta-ghost{transition:all .25s ease}.cta-ghost:hover{color:#F8FAFC!important;border-color:rgba(255,255,255,.3)!important}
        .logo-text{transition:color .3s ease}.logo-text:hover{color:rgba(255,255,255,.5)!important}
        .nav-link{transition:color .2s ease}.nav-link:hover{color:#F8FAFC!important}
        .faq-content{max-height:0;overflow:hidden;transition:max-height .35s ease,padding .35s ease;padding:0 24px}
        .faq-content.open{max-height:300px;padding:0 24px 20px}
      `}</style>

      {/* Background Orbs */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)", filter: "blur(120px)", animation: "orb-float 25s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: -200, right: -200, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.12), transparent 70%)", filter: "blur(120px)", animation: "orb-float 32s ease-in-out infinite reverse" }} />
        <div style={{ position: "absolute", top: "40%", left: "40%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.10), transparent 70%)", filter: "blur(120px)", animation: "orb-float 20s ease-in-out infinite 5s" }} />
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
          <div className="hidden md:flex gap-8">
            {[["Como funciona", "#como-funciona"], ["Recursos", "#recursos"], ["Preços", "#precos"]].map(([label, href]) => (
              <a key={label} href={href} className="nav-link" style={{ color: "#94A3B8", fontSize: 14 }}>{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="cta-ghost hidden sm:inline-flex items-center" style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#94A3B8", padding: "8px 16px", borderRadius: 8, fontSize: 14 }}>Entrar</Link>
            <Link to="/auth" className="cta-primary inline-flex items-center" style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500, boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}>Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* ════════════════════ HERO ════════════════════ */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 80, paddingBottom: 80, position: "relative", zIndex: 10 }}>
        <div className="max-w-4xl mx-auto text-center px-6">
          <Reveal>
            <span className="inline-flex items-center gap-2" style={{ border: "1px solid rgba(99,102,241,0.4)", background: "rgba(99,102,241,0.1)", padding: "6px 16px", borderRadius: 999, fontSize: 13, color: "#A5B4FC" }}>✦ Novo — Mini Site profissional incluso no plano Presença + Ads</span>
          </Reveal>
          <Reveal delay={100}>
             <h1 className="font-heading" style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", marginTop: 32 }}>
               Apareça no Google. Receba mais ligações.<br />
               <span style={{ background: "linear-gradient(135deg, #6366F1 0%, #22D3EE 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Sem mover um dedo.</span>
             </h1>
          </Reveal>
          <Reveal delay={200}>
            <p style={{ maxWidth: 600, margin: "24px auto 0", fontSize: 18, color: "#94A3B8", lineHeight: 1.7 }}>
              Posts automáticos, respostas com IA, Google Ads otimizado e um <strong style={{ color: "#C7D2FE" }}>Mini Site profissional</strong> — tudo rodando no piloto automático. Você cuida do seu negócio, a gente cuida do seu <strong style={{ color: "#F8FAFC" }}>Google</strong>.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="flex gap-4 justify-center flex-wrap" style={{ marginTop: 40 }}>
              <Link to="/auth" className="cta-primary inline-flex items-center gap-2" style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)", color: "#fff", padding: "14px 28px", borderRadius: 10, fontWeight: 600, fontSize: 16, boxShadow: "0 0 40px rgba(99,102,241,0.35), 0 4px 16px rgba(0,0,0,0.3)" }}>
                Comece grátis agora — sem risco <ArrowRight size={16} />
              </Link>
              <a href="#como-funciona" className="cta-ghost inline-flex items-center gap-2" style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#94A3B8", padding: "14px 28px", borderRadius: 10, fontSize: 16 }}>
                <Play size={16} /> Ver como funciona
              </a>
            </div>
          </Reveal>
          <Reveal delay={350}>
            <p style={{ marginTop: 16, fontSize: 13, color: "#475569" }}>
              14 dias grátis · Sem cartão de crédito · Setup em 5 minutos
            </p>
          </Reveal>
          <Reveal delay={400}>
            <div className="flex items-center justify-center gap-3 flex-wrap" style={{ marginTop: 40 }}>
              <div className="flex">
                {avatarLetters.map((l, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #020817", background: avatarColors[i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#fff", marginLeft: i === 0 ? 0 : -8, position: "relative", zIndex: 5 - i }}>{l}</div>
                ))}
              </div>
              <span style={{ fontSize: 14, color: "#94A3B8" }}>+500 negócios já usando</span>
              <span style={{ fontSize: 14, color: "#F59E0B" }}>★★★★★</span>
            </div>
          </Reveal>
          <Reveal delay={450}>
            <div className="flex items-center justify-center gap-6 flex-wrap" style={{ marginTop: 24 }}>
              {["Integrado com Google", "Conformidade com LGPD", "IA treinada para tom brasileiro"].map((t) => (
                <span key={t} style={{ fontSize: 12, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                  <Check size={12} style={{ color: "#22C55E" }} /> {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mockup */}
      <section style={{ paddingBottom: 96, position: "relative", zIndex: 10 }}>
        <div className="max-w-5xl mx-auto px-6" style={{ perspective: 1200 }}>
          <div style={{ transform: mockupTilt ? "rotateX(6deg)" : "rotateX(0deg)", transition: "transform 0.8s ease", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden", boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 50px 100px -20px rgba(0,0,0,0.9), 0 0 80px rgba(99,102,241,0.1)" }} onMouseEnter={() => setMockupTilt(false)} onMouseLeave={() => setMockupTilt(true)}>
            {/* Window bar */}
            <div style={{ height: 40, background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", padding: "0 16px", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E" }} />
              <div style={{ flex: 1, maxWidth: 280, margin: "0 auto", height: 24, borderRadius: 6, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#475569" }}>app.localai.com.br</div>
            </div>
            {/* Desktop dashboard */}
            <div className="hidden md:flex" style={{ background: "#0F172A", height: 480 }}>
              <div style={{ width: 200, background: "rgba(0,0,0,0.3)", borderRight: "1px solid rgba(255,255,255,0.06)", padding: 16, flexShrink: 0 }}>
                <div className="flex items-center gap-2 mb-6"><MapPin size={16} style={{ color: "#6366F1" }} /><span className="font-heading" style={{ fontSize: 13 }}>LocalAI</span></div>
                {sidebarItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2" style={{ padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 2, background: item.active ? "rgba(99,102,241,0.2)" : "transparent", color: item.active ? "#A5B4FC" : "#475569" }}>
                    <item.icon size={14} style={{ color: item.active ? "#6366F1" : "#334155" }} />{item.label}
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, padding: 24, overflow: "hidden" }}>
                <div className="flex items-center gap-3">
                  <span className="font-heading" style={{ fontSize: 18, fontWeight: 600 }}>Dashboard</span>
                  <span style={{ fontSize: 11, color: "#22C55E", display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", animation: "count-pulse 2s infinite", display: "inline-block" }} /> Ativo</span>
                </div>
                <div className="grid grid-cols-4 gap-3" style={{ marginTop: 16 }}>
                  {metricCards.map((m, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 12 }}>
                      <div className="flex items-center gap-1" style={{ marginBottom: 4 }}><m.icon size={14} style={{ color: "#6366F1" }} /><span style={{ fontSize: 10, color: "#475569" }}>{m.label}</span></div>
                      <div style={{ fontSize: 20, fontWeight: 600 }}>{m.value}</div>
                      <span style={{ fontSize: 10, color: m.yellow ? "#F59E0B" : "#22C55E" }}>{m.change}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-end gap-1.5" style={{ height: 80, marginTop: 16 }}>
                  {barHeights.map((h, i) => (
                    <div key={i} style={{ flex: 1, height: h, borderRadius: "4px 4px 0 0", background: "linear-gradient(to top, #6366F1, #818CF8)", opacity: i === 5 ? 1 : 0.7 }} />
                  ))}
                </div>
                <div className="flex items-center gap-3" style={{ marginTop: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#6366F1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#fff", flexShrink: 0 }}>M</div>
                  <span style={{ fontSize: 11, color: "#F59E0B" }}>★★★★★</span>
                  <span style={{ fontSize: 11, color: "#94A3B8", flex: 1 }}>Ótimo atendimento!</span>
                  <span style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", fontSize: 10, padding: "2px 8px", borderRadius: 999 }}>✓ Respondida pela IA</span>
                </div>
              </div>
            </div>
            {/* Mobile fallback */}
            <div className="md:hidden" style={{ background: "#0F172A", padding: 24, minHeight: 200 }}>
              <div className="grid grid-cols-2 gap-3">
                {metricCards.map((m, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 12 }}>
                    <div className="flex items-center gap-1 mb-1"><m.icon size={14} style={{ color: "#6366F1" }} /><span style={{ fontSize: 10, color: "#475569" }}>{m.label}</span></div>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section style={{ paddingTop: 48, paddingBottom: 48, position: "relative", zIndex: 10 }}>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
        <div className="text-center" style={{ marginTop: 32 }}><span style={{ fontSize: 11, letterSpacing: "0.15em", color: "#475569" }}>INTEGRADO COM</span></div>
        <div className="flex justify-center gap-12 items-center flex-wrap" style={{ marginTop: 32 }}>
          {["Google", "Google Ads", "Claude AI", "Stripe"].map((name) => (
            <span key={name} className="logo-text" style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.2)", cursor: "default", userSelect: "none" }}>{name}</span>
          ))}
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)", marginTop: 32 }} />
      </section>

      {/* How it works */}
      <section id="como-funciona" style={{ paddingTop: 96, paddingBottom: 96, position: "relative", zIndex: 10 }}>
        <div className="text-center">
          <Reveal><span style={{ fontSize: 11, letterSpacing: "0.15em", color: "#6366F1", fontWeight: 600 }}>COMO FUNCIONA</span></Reveal>
          <Reveal delay={80}><h2 className="font-heading" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.02em", marginTop: 16, marginBottom: 64 }}>Conecte uma vez. A IA trabalha para sempre.</h2></Reveal>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6">
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="step-card" style={{ position: "relative", overflow: "hidden", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 32 }}>
                <span style={{ position: "absolute", top: -10, right: 16, fontSize: 96, fontWeight: 800, color: "rgba(99,102,241,0.06)", lineHeight: 1 }}>{s.num}</span>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><s.icon size={22} style={{ color: "#6366F1" }} /></div>
                <h3 className="font-heading" style={{ fontSize: 18, fontWeight: 600, marginTop: 16, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="recursos" style={{ paddingTop: 96, paddingBottom: 96, position: "relative", zIndex: 10, background: "rgba(99,102,241,0.02)" }}>
        <div className="text-center">
          <Reveal><span style={{ fontSize: 11, letterSpacing: "0.15em", color: "#6366F1", fontWeight: 600 }}>RECURSOS</span></Reveal>
          <Reveal delay={80}><h2 className="font-heading" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.02em", marginTop: 16, marginBottom: 16 }}>Tudo que um gestor de marketing faz. Automaticamente.</h2></Reveal>
          <Reveal delay={100}><p style={{ fontSize: 16, color: "#64748B", marginBottom: 64, maxWidth: 560, margin: "0 auto 64px" }}>Você não precisa postar, responder ou gerenciar Ads. A IA faz tudo enquanto você cuida do seu negócio.</p></Reveal>
        </div>
        <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto px-6">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="feature-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(34,211,238,0.1))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}><f.icon size={20} style={{ color: "#818CF8" }} /></div>
                <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════ MINI SITE SECTION ════════════════════ */}
      <section style={{ paddingTop: 96, paddingBottom: 96, position: "relative", zIndex: 10 }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div>
                <span style={{ fontSize: 11, letterSpacing: "0.15em", color: "#6366F1", fontWeight: 600 }}>MINI SITE PROFISSIONAL</span>
                 <h2 className="font-heading" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-0.02em", marginTop: 16, marginBottom: 16 }}>
                   Seu concorrente ainda não tem isso.<br />
                   <span style={{ background: "linear-gradient(135deg, #6366F1 0%, #22D3EE 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Grátis no plano mais vendido.</span>
                 </h2>
                 <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.7, marginBottom: 32 }}>
                   Um site profissional com domínio exclusivo, <Link to="/seo-local" style={{ color: "#818CF8", textDecoration: "underline", textUnderlineOffset: 3 }}>otimizado para SEO local</Link>, atualizado automaticamente com seus posts e avaliações — sem precisar de desenvolvedor, designer ou agência. Incluso no plano Presença + Ads.
                 </p>
                 <div className="space-y-3">
                   {[
                      "Domínio exclusivo: seunegocio.localai.app.br",
                      "Avaliações do Google exibidas em tempo real",
                      "Atualizado automaticamente com seus posts",
                      "WhatsApp e contato com 1 clique",
                      "Funciona no celular, tablet e desktop",
                    ].map((item, i) => (
                     <div key={i} className="flex items-center gap-3" style={{ fontSize: 14, color: "#94A3B8" }}>
                        <Check size={14} style={{ color: "#22C55E", flexShrink: 0 }} />
                        {item}
                      </div>
                    ))}
                    <div className="flex items-center gap-3" style={{ fontSize: 14, color: "#94A3B8" }}>
                      <Check size={14} style={{ color: "#22C55E", flexShrink: 0 }} />
                      <Link to="/seo-local" style={{ color: "#818CF8", textDecoration: "underline", textUnderlineOffset: 3 }}>SEO local otimizado para Google Maps e busca</Link>
                    </div>
                  </div>
                 <div className="flex flex-col sm:flex-row items-start gap-4" style={{ marginTop: 32 }}>
                   <Link to="/demos" className="cta-primary inline-flex items-center gap-2" style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)", color: "#fff", padding: "12px 24px", borderRadius: 10, fontWeight: 500, fontSize: 14, boxShadow: "0 0 30px rgba(99,102,241,0.3)" }}>
                     Ver exemplo de Mini Site <ArrowRight size={14} />
                   </Link>
                   <Link to="/seo-local" style={{ fontSize: 14, color: "#818CF8", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}>
                     Saiba mais sobre Estratégias de SEO Local em 2026 <ArrowRight size={14} />
                   </Link>
                 </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", inset: -40, background: "radial-gradient(ellipse at center, rgba(99,102,241,0.15), transparent 70%)", pointerEvents: "none" }} />
                <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, overflow: "hidden", boxShadow: "0 40px 80px -20px rgba(0,0,0,0.8), 0 0 60px rgba(99,102,241,0.08)", position: "relative" }}>
                  <img src={demoPreview} alt="Exemplo de mini site — Estúdio Bela & Arte" style={{ width: "100%", display: "block" }} />
                </div>
                <div style={{ position: "absolute", top: -12, right: -12, background: "linear-gradient(135deg, #6366F1, #7C3AED)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "6px 12px", borderRadius: 999, boxShadow: "0 4px 16px rgba(99,102,241,0.4)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  ✦ Incluso no Presença + Ads
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Niches */}
      <section style={{ paddingTop: 96, paddingBottom: 96, position: "relative", zIndex: 10 }}>
        <div className="text-center">
          <Reveal><span style={{ fontSize: 11, letterSpacing: "0.15em", color: "#6366F1", fontWeight: 600 }}>PARA QUALQUER NEGÓCIO LOCAL</span></Reveal>
          <Reveal delay={80}><h2 className="font-heading" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.02em", marginTop: 16, marginBottom: 16 }}>Do restaurante à clínica. Do salão à academia.</h2></Reveal>
          <Reveal delay={100}><p style={{ fontSize: 16, color: "#64748B", marginBottom: 64, maxWidth: 480, margin: "0 auto 64px" }}>A IA se adapta ao vocabulário e público do seu segmento. Já atendemos mais de 40 nichos diferentes.</p></Reveal>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-5xl mx-auto px-6">
          {niches.map((n, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="niche-card" style={{ height: 280, borderRadius: 16, overflow: "hidden", position: "relative", cursor: "default" }}>
                <img src={n.img} alt={n.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(2,8,23,0.92) 0%, rgba(2,8,23,0.4) 50%, transparent 100%)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 20 }}>
                  <n.icon size={20} style={{ color: "#6366F1", marginBottom: 8 }} />
                  <div className="font-heading" style={{ fontSize: 18, fontWeight: 600 }}>{n.name}</div>
                  <span style={{ display: "inline-block", marginTop: 4, background: "rgba(34,197,94,0.15)", color: "#22C55E", fontSize: 11, border: "1px solid rgba(34,197,94,0.3)", padding: "2px 8px", borderRadius: 999 }}>✓ Suportado</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ paddingTop: 96, paddingBottom: 96, position: "relative", zIndex: 10, background: "rgba(99,102,241,0.02)" }}>
        <div className="text-center">
          <Reveal><span style={{ fontSize: 11, letterSpacing: "0.15em", color: "#6366F1", fontWeight: 600 }}>DEPOIMENTOS</span></Reveal>
          <Reveal delay={80}><h2 className="font-heading" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.02em", marginTop: 16, marginBottom: 64 }}>Negócios reais. Resultados reais.</h2></Reveal>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto px-6">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="testimonial-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28 }}>
                <span style={{ fontSize: 64, lineHeight: 1, color: "#6366F1", opacity: 0.6, fontFamily: "Georgia, serif", marginBottom: -8, display: "block" }}>"</span>
                <p style={{ fontSize: 15, color: "#CBD5E1", lineHeight: 1.7, fontStyle: "italic", marginBottom: 24 }}>{t.text}</p>
                <div style={{ fontSize: 13, color: "#F59E0B", marginBottom: 24 }}>★★★★★</div>
                <div className="flex items-center gap-3">
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#fff", flexShrink: 0 }}>{t.initial}</div>
                  <div>
                    <div className="font-heading" style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>{t.sub}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════ RESULTADOS REAIS ════════════════════ */}
      <section style={{ paddingTop: 96, paddingBottom: 96, position: "relative", zIndex: 10 }}>
        <div className="text-center">
          <Reveal><span style={{ fontSize: 11, letterSpacing: "0.15em", color: "#6366F1", fontWeight: 600 }}>RESULTADOS REAIS</span></Reveal>
          <Reveal delay={80}><h2 className="font-heading" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.02em", marginTop: 16, marginBottom: 16 }}>Números que falam por si</h2></Reveal>
          <Reveal delay={100}><p style={{ fontSize: 16, color: "#64748B", marginBottom: 64, maxWidth: 520, margin: "0 auto 64px" }}>Dados agregados de negócios que usam o LocalAI nos últimos 12 meses.</p></Reveal>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto px-6">
          {resultStats.map((s, i) => (
            <Reveal key={i} delay={i * 100}>
              <div style={{ textAlign: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "32px 16px" }}>
                <div className="font-heading" style={{ fontSize: 36, fontWeight: 800, background: "linear-gradient(135deg, #6366F1, #22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.value}</div>
                <p style={{ fontSize: 13, color: "#64748B", marginTop: 8, lineHeight: 1.5 }}>{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════ FAQ ════════════════════ */}
      <section style={{ paddingTop: 96, paddingBottom: 96, position: "relative", zIndex: 10, background: "rgba(99,102,241,0.02)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center">
            <Reveal><span style={{ fontSize: 11, letterSpacing: "0.15em", color: "#6366F1", fontWeight: 600 }}>PERGUNTAS FREQUENTES</span></Reveal>
            <Reveal delay={80}><h2 className="font-heading" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.02em", marginTop: 16, marginBottom: 64 }}>Tire suas dúvidas</h2></Reveal>
          </div>
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

      {/* ════════════════════ PRICING ════════════════════ */}
      <section id="precos" style={{ paddingTop: 96, paddingBottom: 96, position: "relative", zIndex: 10 }}>
        <div className="text-center">
          <Reveal><span style={{ fontSize: 11, letterSpacing: "0.15em", color: "#6366F1", fontWeight: 600 }}>PREÇOS</span></Reveal>
          <Reveal delay={80}><h2 className="font-heading" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.02em", marginTop: 16 }}>Simples e transparente. Sem surpresas.</h2></Reveal>
          <Reveal delay={120}><p style={{ fontSize: 16, color: "#64748B", marginTop: 8, marginBottom: 24 }}>14 dias grátis em qualquer plano. Sem cartão de crédito.</p></Reveal>
          <Reveal delay={140}>
            <div className="flex items-center justify-center gap-3 mb-10">
              <button
                onClick={() => setAnnualPricing(false)}
                className="rounded-full px-5 py-2 text-sm font-medium transition-all"
                style={{
                  background: annualPricing ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg, #6366F1, #7C3AED)",
                  color: annualPricing ? "#94A3B8" : "#FFFFFF",
                  border: `1px solid ${annualPricing ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.45)"}`,
                  boxShadow: annualPricing ? "none" : "0 0 24px rgba(99,102,241,0.2)",
                }}
              >
                Mensal
              </button>
              <button
                onClick={() => setAnnualPricing(true)}
                className="rounded-full px-5 py-2 text-sm font-medium transition-all"
                style={{
                  background: annualPricing ? "linear-gradient(135deg, #6366F1, #7C3AED)" : "rgba(255,255,255,0.04)",
                  color: annualPricing ? "#FFFFFF" : "#94A3B8",
                  border: `1px solid ${annualPricing ? "rgba(99,102,241,0.45)" : "rgba(255,255,255,0.08)"}`,
                  boxShadow: annualPricing ? "0 0 24px rgba(99,102,241,0.2)" : "none",
                }}
              >
                Anual
              </button>
            </div>
          </Reveal>
        </div>
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto px-6 items-start">
          {plans.map((p, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="plan-card" style={{ background: p.highlight ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${p.highlight ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: 16, padding: 28, boxShadow: p.highlight ? "0 0 60px rgba(99,102,241,0.15)" : "none" }}>
                {p.highlight && <span style={{ display: "block", textAlign: "center", marginBottom: 16, background: "linear-gradient(135deg, #6366F1, #22D3EE)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 999 }}>Mais popular</span>}
                <div style={{ fontSize: 12, letterSpacing: "0.1em", color: "#64748B", fontWeight: 500, marginBottom: 16 }}>{p.name}</div>
                <div className="font-heading" style={{ fontSize: 40, fontWeight: 700 }}>
                  R${formatPrice(annualPricing ? p.annualPrice : p.monthlyPrice)}
                  <span style={{ fontSize: 16, fontWeight: 400, color: "#475569" }}>/{annualPricing ? "ano" : "mês"}</span>
                </div>
                {annualPricing && (
                  <span style={{ display: "inline-block", marginTop: 8, background: "rgba(34,197,94,0.15)", color: "#22C55E", fontSize: 12, fontWeight: 600, border: "1px solid rgba(34,197,94,0.3)", padding: "4px 12px", borderRadius: 999 }}>🎉 2 meses grátis</span>
                )}
                <p style={{ fontSize: 14, color: "#64748B", marginTop: 8, marginBottom: 24 }}>{p.desc}</p>
                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 24 }} />
                <div className="space-y-2">
                  {p.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2" style={{ fontSize: 14, color: "#94A3B8" }}><Check size={14} style={{ color: "#22C55E", flexShrink: 0 }} /> {f}</div>
                  ))}
                </div>
                <Link to="/auth" className={p.highlight ? "cta-primary" : "cta-ghost"} style={{ display: "block", textAlign: "center", marginTop: 32, padding: "12px 0", borderRadius: 10, fontSize: 14, fontWeight: 500, ...(p.highlight ? { background: "linear-gradient(135deg, #6366F1, #7C3AED)", color: "#fff", boxShadow: "0 0 20px rgba(99,102,241,0.3)" } : { border: "1px solid rgba(255,255,255,0.2)", color: "#94A3B8" }) }}>Começar grátis</Link>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ════════════════════ GARANTIA + TRUST SEALS ════════════════════ */}
        <div className="max-w-4xl mx-auto px-6" style={{ marginTop: 64 }}>
          <Reveal>
            <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 16, padding: "32px 28px", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
                <Shield size={20} style={{ color: "#22C55E" }} />
                <span className="font-heading" style={{ fontSize: 18, fontWeight: 700, color: "#22C55E" }}>Garantia de Resultados</span>
              </div>
              <p style={{ fontSize: 16, color: "#CBD5E1", lineHeight: 1.7, maxWidth: 600, margin: "0 auto" }}>
                Suba pelo menos <strong style={{ color: "#F8FAFC" }}>20% em ligações ou visualizações</strong> no Google em 90 dias — ou devolvemos <strong style={{ color: "#F8FAFC" }}>100% do seu dinheiro</strong>. Sem burocracia.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex flex-wrap justify-center gap-6" style={{ marginTop: 32 }}>
              {[
                { icon: Lock, text: "Pagamento seguro via Stripe" },
                { icon: XCircle, text: "Cancelamento a qualquer momento" },
                { icon: Users, text: "Sem fidelidade" },
                { icon: CreditCard, text: "14 dias grátis sem cartão" },
              ].map((seal, i) => (
                <div key={i} className="flex items-center gap-2" style={{ fontSize: 13, color: "#64748B" }}>
                  <seal.icon size={14} style={{ color: "#6366F1" }} />
                  {seal.text}
                </div>
              ))}
            </div>
          </Reveal>

          {annualPricing && (
            <Reveal delay={150}>
              <div className="text-center" style={{ marginTop: 24 }}>
                <span style={{ fontSize: 14, color: "#22C55E", fontWeight: 500 }}>💰 Economize 2 meses em qualquer plano pagando anualmente</span>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ paddingTop: 96, paddingBottom: 96, position: "relative", zIndex: 10, overflow: "hidden" }}>
        <div className="max-w-3xl mx-auto px-6 text-center" style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 24, padding: 64, position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #6366F1, #22D3EE, transparent)", animation: "border-glow 3s ease-in-out infinite" }} />
          <h2 className="font-heading" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, marginBottom: 16 }}>Pronto para receber mais ligações e clientes do Google?</h2>
          <p style={{ fontSize: 16, color: "#64748B", marginBottom: 40 }}>14 dias grátis. Sem cartão de crédito. Cancele quando quiser. Garantia de resultados em 90 dias.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/auth" className="cta-primary inline-flex items-center gap-2" style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)", color: "#fff", padding: "14px 28px", borderRadius: 10, fontWeight: 600, fontSize: 16, boxShadow: "0 0 40px rgba(99,102,241,0.35), 0 4px 16px rgba(0,0,0,0.3)" }}>Comece grátis agora — sem risco <ArrowRight size={16} /></Link>
            <a href="mailto:contato@localai.com.br" className="cta-ghost inline-flex items-center" style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#94A3B8", padding: "14px 28px", borderRadius: 10, fontSize: 16 }}>Falar com a equipe</a>
          </div>
          <div className="flex justify-center items-center gap-6 flex-wrap" style={{ marginTop: 32, fontSize: 13, color: "#334155" }}>
            <span className="flex items-center gap-1.5">🔒 Pagamento seguro via Stripe</span>
            <span className="flex items-center gap-1.5">🛡️ Conformidade com LGPD</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 48, paddingBottom: 48, position: "relative", zIndex: 10 }}>
        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto px-6">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none"><path d="M14 2C8.48 2 4 6.48 4 12c0 7.5 10 14 10 14s10-6.5 10-14c0-5.52-4.48-10-10-10z" fill="#6366F1" /><circle cx="14" cy="11" r="4" fill="#020817" /></svg>
              <span className="font-heading" style={{ fontWeight: 700, fontSize: 18 }}>Local<span style={{ background: "linear-gradient(135deg, #6366F1, #22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span></span>
            </Link>
            <p style={{ fontSize: 13, color: "#334155", marginTop: 8, maxWidth: 220 }}>Automação de marketing local com IA para negócios brasileiros.</p>
          </div>
           <div>
             <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 12, display: "block" }}>Produto</span>
             <div className="flex flex-col gap-2">
               {[["Como funciona", "#como-funciona"], ["Recursos", "#recursos"], ["Preços", "#precos"]].map(([label, href]) => (
                 <a key={label} href={href} className="nav-link" style={{ fontSize: 13, color: "#475569" }}>{label}</a>
               ))}
             </div>
           </div>
           <div>
             <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 12, display: "block" }}>Recursos</span>
             <div className="flex flex-col gap-2">
                <Link to="/seo-local" style={{ fontSize: 13, color: "#475569" }} className="hover:text-foreground transition-colors">Estratégias de SEO Local</Link>
                <Link to="/blog" style={{ fontSize: 13, color: "#475569" }} className="hover:text-foreground transition-colors">Blog</Link>
                <Link to="/privacy" style={{ fontSize: 13, color: "#475569" }} className="hover:text-foreground transition-colors">Política de Privacidade</Link>
                <Link to="/terms" style={{ fontSize: 13, color: "#475569" }} className="hover:text-foreground transition-colors">Termos de Uso</Link>
              </div>
           </div>
           <div>
             <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 12, display: "block" }}>Empresa</span>
             <div className="flex flex-col gap-2">
               <Link to="/terms" style={{ fontSize: 13, color: "#475569" }} className="hover:text-foreground transition-colors">Termos de Uso</Link>
               <Link to="/privacy" style={{ fontSize: 13, color: "#475569" }} className="hover:text-foreground transition-colors">Política de Privacidade</Link>
               <a href="mailto:contato@localai.com.br" style={{ fontSize: 13, color: "#475569" }} className="hover:text-foreground transition-colors">Contato</a>
             </div>
           </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 40, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex justify-center gap-6 flex-wrap" style={{ fontSize: 12, color: "#334155", marginBottom: 16 }}>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Política de Privacidade</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Termos de Uso</Link>
          </div>
          <p style={{ fontSize: 13, color: "#334155" }}>© 2026 LocalAI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
