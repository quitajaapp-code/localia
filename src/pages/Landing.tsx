import { useEffect, useRef, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  MapPin, Bot, TrendingUp, FileText, MessageSquare, Megaphone,
  Gauge, BarChart3, ShieldAlert, ArrowRight, Check, Lock, Play,
  Home, Star, Settings, Bell, Users, PieChart, Phone, Route, MousePointerClick,
  Sparkles, UtensilsCrossed, HeartPulse, Scissors, Dumbbell
} from "lucide-react";

/* ───── Intersection Observer hook ───── */
function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function AnimateIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useInView();
  return (
    <div ref={ref} className={`animate-on-scroll ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ───── Data ───── */
const steps = [
  { icon: MapPin, title: "Conecte seu Google", desc: "Vincule sua conta em 2 cliques. Sem configuração técnica.", num: "01" },
  { icon: Bot, title: "Configure seu negócio", desc: "Informe o nicho, tom de voz e envie materiais.", num: "02" },
  { icon: TrendingUp, title: "A IA cuida do resto", desc: "Posts, respostas, ads e relatórios — tudo automático.", num: "03" },
];

const features = [
  { icon: FileText, title: "Posts automáticos", desc: "A IA cria e publica conteúdo relevante no Google Meu Negócio toda semana." },
  { icon: MessageSquare, title: "Respostas com IA", desc: "Cada avaliação respondida com empatia e profissionalismo em segundos." },
  { icon: Megaphone, title: "Gestão de Ads", desc: "Campanhas criadas pela IA com keywords, negativações e otimização semanal." },
  { icon: Gauge, title: "Score de eficiência", desc: "Gamificação que mostra o quão completo está seu perfil para máxima performance." },
  { icon: BarChart3, title: "Relatório unificado", desc: "GMB + Ads em um relatório semanal em linguagem simples para leigos." },
  { icon: ShieldAlert, title: "Alerta de edições", desc: "Detecta alterações não autorizadas no seu perfil e avisa imediatamente." },
];

const niches = [
  { name: "Restaurante", icon: UtensilsCrossed, img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80" },
  { name: "Clínica / Saúde", icon: HeartPulse, img: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=80" },
  { name: "Salão / Beleza", icon: Scissors, img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80" },
  { name: "Academia", icon: Dumbbell, img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80" },
];

const testimonials = [
  { text: "Antes eu ficava com raiva quando via uma avaliação ruim e não sabia o que responder. Agora a IA responde em minutos, melhor do que eu faria.", name: "Marcos Oliveira", role: "Dono | Pizzaria Don Marco", city: "São Paulo", initials: "MO", color: "#6366F1" },
  { text: "Meu perfil no Google subiu de 4.1 para 4.7 em 2 meses. Os anúncios trouxeram 40% mais ligações com o mesmo investimento.", name: "Dra. Fernanda Costa", role: "Clínica Odontológica", city: "Belo Horizonte", initials: "FC", color: "#22D3EE" },
  { text: "Nunca tive tempo para postar no Google. O LocalAI posta 4x por semana e eu nem precisei configurar nada. Simplesmente funciona.", name: "Renata Alves", role: "Studio de Pilates", city: "Curitiba", initials: "RA", color: "#8B5CF6" },
];

const plans = [
  { name: "Presença", price: "97", features: ["1 negócio", "Posts automáticos 4x/sem", "Respostas com IA", "Score de otimização", "Relatório mensal"] },
  { name: "Presença + Ads", price: "197", popular: true, features: ["3 negócios", "Tudo do Presença", "Gestão de Google Ads com IA", "Otimização semanal", "Relatório unificado GMB+Ads"] },
  { name: "Agência", price: "397", features: ["10 negócios", "Tudo do Presença+Ads", "Painel multi-cliente", "White-label", "Suporte prioritário"] },
];

const sidebarItems = [
  { icon: Home, label: "Dashboard" },
  { icon: BarChart3, label: "Relatórios" },
  { icon: FileText, label: "Posts" },
  { icon: Star, label: "Avaliações" },
  { icon: Megaphone, label: "Campanhas" },
  { icon: Settings, label: "Configurações" },
];

const chartHeights = [40, 65, 50, 80, 60, 90, 75];

/* ───── Component ───── */
const Landing = () => {
  usePageTitle("Seu negócio local no topo do Google");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#020817", color: "#F8FAFC", fontFamily: "'Inter', sans-serif" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        .font-heading { font-family: 'Plus Jakarta Sans', sans-serif; }
        .animate-on-scroll { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .animate-on-scroll.visible { opacity: 1; transform: translateY(0); }
        @keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-40px); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-40px,30px); } }
        @keyframes float3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,40px); } }
        @keyframes border-rotate { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .hero-fade-in { animation: heroFade 0.7s ease forwards; opacity: 0; }
        @keyframes heroFade { to { opacity: 1; transform: translateY(0); } }
        .hero-fade-in { transform: translateY(20px); }
        .niche-card:hover img { transform: scale(1.05); }
        .mockup-3d { perspective: 1000px; }
        .mockup-3d > div { transform: rotateX(8deg); transition: transform 0.6s ease; }
        .mockup-3d:hover > div { transform: rotateX(0deg); }
        @media (max-width: 768px) { .mockup-3d > div { transform: rotateX(0deg); } }
      `}</style>

      {/* Mesh gradient orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "rgba(99,102,241,0.15)", filter: "blur(120px)", animation: "float1 25s linear infinite" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "rgba(34,211,238,0.1)", filter: "blur(120px)", animation: "float2 30s linear infinite" }} />
        <div style={{ position: "absolute", top: "40%", right: "20%", width: 350, height: 350, borderRadius: "50%", background: "rgba(139,92,246,0.08)", filter: "blur(120px)", animation: "float3 35s linear infinite" }} />
      </div>

      {/* Noise overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none" style={{ opacity: 0.03, mixBlendMode: "overlay", backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* Top decorative line */}
      <div className="fixed top-0 left-0 right-0 z-[60]" style={{ height: 1, background: "linear-gradient(90deg, transparent, #6366F1, #22D3EE, transparent)", boxShadow: "0 0 20px rgba(99,102,241,0.3)" }} />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 transition-shadow duration-300" style={{ background: "rgba(2,8,23,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.3)" : "none" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)" }}>
              <MapPin className="w-4 h-4" style={{ color: "#6366F1" }} />
            </div>
            <span className="font-heading text-lg font-bold">Local<span style={{ background: "linear-gradient(135deg, #6366F1, #22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm transition-colors duration-200" style={{ color: "#94A3B8" }} onMouseEnter={e => (e.currentTarget.style.color = "#F8FAFC")} onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}>Como funciona</a>
            <a href="#funcionalidades" className="text-sm transition-colors duration-200" style={{ color: "#94A3B8" }} onMouseEnter={e => (e.currentTarget.style.color = "#F8FAFC")} onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}>Funcionalidades</a>
            <a href="#precos" className="text-sm transition-colors duration-200" style={{ color: "#94A3B8" }} onMouseEnter={e => (e.currentTarget.style.color = "#F8FAFC")} onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}>Preços</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="hidden sm:inline-flex text-sm px-4 py-2 rounded-lg border transition-colors duration-200" style={{ color: "#94A3B8", borderColor: "rgba(255,255,255,0.1)" }}>Entrar</Link>
            <Link to="/pricing" className="text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 group" style={{ background: "#6366F1", color: "#fff" }}>
              Começar grátis <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10">
        {/* ═══ HERO ═══ */}
        <section className="pt-24 sm:pt-32 lg:pt-40 pb-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            {/* Badge */}
            <div className="hero-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8" style={{ border: "1px solid rgba(99,102,241,0.4)", background: "rgba(99,102,241,0.1)", animationDelay: "0ms" }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#6366F1" }} />
              <span style={{ background: "linear-gradient(135deg, #6366F1, #22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Novo — Gestão de Google Ads com IA</span>
            </div>

            {/* Headline */}
            <h1 className="font-heading font-bold hero-fade-in" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 1.1, letterSpacing: "-0.03em", animationDelay: "100ms" }}>
              Seu negócio local no topo do Google.{" "}
              <span className="block" style={{ background: "linear-gradient(135deg, #6366F1, #22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>No piloto automático.</span>
            </h1>

            {/* Sub */}
            <p className="mt-6 text-lg hero-fade-in mx-auto" style={{ color: "#94A3B8", maxWidth: 560, animationDelay: "200ms" }}>
              A IA gerencia seu Google Meu Negócio e anúncios. Posts automáticos, respostas com IA, campanhas otimizadas.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8 hero-fade-in" style={{ animationDelay: "300ms" }}>
              <Link to="/pricing" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-medium text-white transition-all duration-200 hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", boxShadow: "0 0 40px rgba(99,102,241,0.3)" }}>
                Começar grátis por 14 dias <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#como-funciona" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-medium transition-colors duration-200" style={{ color: "#94A3B8", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="w-6 h-6 rounded-full border flex items-center justify-center" style={{ borderColor: "rgba(255,255,255,0.2)" }}><Play className="w-3 h-3 ml-0.5" /></div>
                Ver demonstração
              </a>
            </div>

            {/* Social proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 hero-fade-in" style={{ animationDelay: "400ms" }}>
              <div className="flex -space-x-2">
                {["MO", "FC", "RA", "CS", "JP"].map((i, idx) => (
                  <div key={idx} className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2" style={{ background: ["#6366F1", "#22D3EE", "#8B5CF6", "#F59E0B", "#10B981"][idx], borderColor: "#020817" }}>{i}</div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}</div>
                <span className="text-sm" style={{ color: "#94A3B8" }}>Mais de 500 negócios crescendo</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ MOCKUP ═══ */}
        <section className="pb-20 sm:pb-28 pt-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 mockup-3d">
            <AnimateIn>
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 50px 100px -20px rgba(0,0,0,0.8), 0 0 80px rgba(99,102,241,0.15)" }}>
                {/* Window bar */}
                <div className="flex items-center gap-2 px-4 h-10" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: "#EF4444" }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: "#F59E0B" }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: "#22C55E" }} />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-8 py-1 rounded-md text-xs" style={{ background: "rgba(255,255,255,0.05)", color: "#64748B" }}>app.localai.com.br/dashboard</div>
                  </div>
                </div>
                {/* Dashboard content */}
                <div className="flex" style={{ background: "rgba(255,255,255,0.02)", minHeight: 380 }}>
                  {/* Sidebar */}
                  <div className="hidden md:flex flex-col w-52 p-4 gap-1 shrink-0" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)" }}><MapPin className="w-3.5 h-3.5" style={{ color: "#6366F1" }} /></div>
                      <span className="font-heading text-sm font-semibold">LocalAI</span>
                    </div>
                    {sidebarItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs" style={{ background: idx === 0 ? "rgba(99,102,241,0.1)" : "transparent", color: idx === 0 ? "#A5B4FC" : "#64748B" }}>
                        <item.icon className="w-3.5 h-3.5" />{item.label}
                      </div>
                    ))}
                  </div>
                  {/* Main */}
                  <div className="flex-1 p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-semibold text-sm sm:text-base">Dashboard</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1.5" style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#22C55E" }} />Ativo
                      </span>
                    </div>
                    {/* Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                      {[
                        { icon: MapPin, label: "Views Maps", value: "2.847", change: "+18%" },
                        { icon: Phone, label: "Ligações", value: "143", change: "+24%" },
                        { icon: Route, label: "Pedidos rota", value: "89", change: "+9%" },
                        { icon: Star, label: "Nota Google", value: "4.8", change: "+0.3" },
                      ].map((m, idx) => (
                        <div key={idx} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div className="flex items-center gap-1 mb-1"><m.icon className="w-3 h-3" style={{ color: "#64748B" }} /><span className="text-[10px]" style={{ color: "#64748B" }}>{m.label}</span></div>
                          <p className="text-lg font-heading font-bold">{m.value}</p>
                          <span className="text-[10px] font-medium" style={{ color: "#22C55E" }}>{m.change}</span>
                        </div>
                      ))}
                    </div>
                    {/* Chart + Review */}
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <p className="text-[10px] mb-3" style={{ color: "#64748B" }}>Visualizações — últimos 7 dias</p>
                        <div className="flex items-end gap-1.5 h-24">
                          {chartHeights.map((h, i) => (
                            <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: `linear-gradient(180deg, #6366F1, rgba(99,102,241,0.3))` }} />
                          ))}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <p className="text-[10px] mb-3" style={{ color: "#64748B" }}>Última avaliação</p>
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: "#6366F1" }}>MO</div>
                          <div>
                            <div className="flex gap-0.5 mb-1">{[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />)}</div>
                            <p className="text-xs leading-relaxed" style={{ color: "#CBD5E1" }}>"Excelente atendimento! Voltarei com certeza."</p>
                            <span className="inline-flex items-center gap-1 text-[9px] mt-2 px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}>
                              <Check className="w-2.5 h-2.5" /> Respondida pela IA
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateIn>
          </div>
        </section>

        {/* ═══ LOGOS ═══ */}
        <section className="py-12">
          <AnimateIn className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="h-px mx-auto mb-10" style={{ maxWidth: 400, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
            <p className="text-[11px] font-medium tracking-[0.15em] uppercase mb-6" style={{ color: "#64748B" }}>Integrado com</p>
            <div className="flex items-center justify-center gap-10 sm:gap-16">
              {["Google", "Google Ads", "Claude AI"].map((name) => (
                <span key={name} className="text-sm sm:text-base font-medium transition-colors duration-200 cursor-default" style={{ color: "rgba(255,255,255,0.25)" }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>{name}</span>
              ))}
            </div>
            <div className="h-px mx-auto mt-10" style={{ maxWidth: 400, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
          </AnimateIn>
        </section>

        {/* ═══ COMO FUNCIONA ═══ */}
        <section id="como-funciona" className="py-20 sm:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <AnimateIn className="text-center mb-16">
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-4" style={{ color: "#6366F1" }}>Como funciona</p>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl" style={{ letterSpacing: "-0.02em" }}>Conecte uma vez. A IA trabalha para sempre.</h2>
            </AnimateIn>
            <div className="grid md:grid-cols-3 gap-6 relative">
              {/* Connector line (desktop) */}
              <div className="hidden md:block absolute top-16 left-[20%] right-[20%] border-t border-dashed" style={{ borderColor: "rgba(99,102,241,0.2)" }} />
              {steps.map((s, i) => (
                <AnimateIn key={i} delay={i * 120}>
                  <div className="relative p-6 rounded-2xl text-center transition-all duration-300 hover:-translate-y-0.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.3)", boxShadow: "0 0 0 1px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
                    <span className="absolute top-3 left-4 font-heading font-extrabold text-6xl select-none" style={{ color: "rgba(99,102,241,0.07)" }}>{s.num}</span>
                    <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center relative z-10" style={{ background: "rgba(99,102,241,0.15)" }}>
                      <s.icon className="w-6 h-6" style={{ color: "#6366F1" }} />
                    </div>
                    <h3 className="font-heading font-bold text-lg mb-2">{s.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>{s.desc}</p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section id="funcionalidades" className="py-20 sm:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <AnimateIn className="text-center mb-16 max-w-xl mx-auto">
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-4" style={{ color: "#6366F1" }}>Funcionalidades</p>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl" style={{ letterSpacing: "-0.02em" }}>Tudo que um gestor de marketing faz. Automaticamente.</h2>
            </AnimateIn>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f, i) => (
                <AnimateIn key={i} delay={i * 80}>
                  <div className="p-6 rounded-2xl h-full transition-all duration-300 hover:-translate-y-0.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}>
                    <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.1))" }}>
                      <f.icon className="w-5 h-5" style={{ color: "#A5B4FC" }} />
                    </div>
                    <h3 className="font-heading font-semibold text-[15px] mb-2">{f.title}</h3>
                    <p className="text-[13px] leading-relaxed" style={{ color: "#94A3B8" }}>{f.desc}</p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ NICHES ═══ */}
        <section className="py-20 sm:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <AnimateIn className="text-center mb-16">
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-4" style={{ color: "#6366F1" }}>Segmentos</p>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl" style={{ letterSpacing: "-0.02em" }}>Para qualquer negócio local</h2>
            </AnimateIn>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {niches.map((n, i) => (
                <AnimateIn key={i} delay={i * 80}>
                  <div className="niche-card relative h-64 sm:h-72 rounded-2xl overflow-hidden group cursor-default" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                    <img src={n.img} alt={n.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(2,8,23,0.9) 0%, transparent 60%)" }} />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <n.icon className="w-4 h-4" style={{ color: "#A5B4FC" }} />
                        <span className="font-heading font-semibold text-sm">{n.name}</span>
                      </div>
                      <span className="text-[10px] flex items-center gap-1" style={{ color: "#22C55E" }}><Check className="w-3 h-3" /> Suportado</span>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ═══ */}
        <section id="depoimentos" className="py-20 sm:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <AnimateIn className="text-center mb-16">
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-4" style={{ color: "#6366F1" }}>Depoimentos</p>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl" style={{ letterSpacing: "-0.02em" }}>Quem usa, recomenda</h2>
            </AnimateIn>
            <div className="grid md:grid-cols-3 gap-4">
              {testimonials.map((t, i) => (
                <AnimateIn key={i} delay={i * 100}>
                  <div className="p-6 rounded-2xl h-full flex flex-col transition-all duration-300 hover:-translate-y-0.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span className="font-heading text-4xl leading-none mb-3" style={{ color: "#6366F1" }}>"</span>
                    <p className="text-[15px] italic leading-relaxed flex-1 mb-6" style={{ color: "#CBD5E1" }}>{t.text}</p>
                    <div className="flex gap-0.5 mb-4">{[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}</div>
                    <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: t.color }}>{t.initials}</div>
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs" style={{ color: "#64748B" }}>{t.role}, {t.city}</p>
                      </div>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PRICING ═══ */}
        <section id="precos" className="py-20 sm:py-28" style={{ background: "rgba(99,102,241,0.03)" }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <AnimateIn className="text-center mb-16">
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-4" style={{ color: "#6366F1" }}>Planos</p>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl" style={{ letterSpacing: "-0.02em" }}>Planos para cada fase do seu negócio</h2>
              <p className="mt-4 text-base" style={{ color: "#94A3B8" }}>14 dias grátis em todos os planos. Cancele quando quiser.</p>
            </AnimateIn>
            <div className="grid md:grid-cols-3 gap-4 items-start">
              {plans.map((p, i) => (
                <AnimateIn key={i} delay={i * 80}>
                  <div className="p-6 rounded-2xl relative transition-all duration-300" style={{
                    background: "rgba(255,255,255,0.04)",
                    border: p.popular ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: p.popular ? "0 0 60px rgba(99,102,241,0.2)" : "none",
                    transform: p.popular ? "scale(1.02)" : "none",
                  }}>
                    {p.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-3 py-1 rounded-full text-white" style={{ background: "linear-gradient(135deg, #6366F1, #22D3EE)" }}>Mais popular</span>
                    )}
                    <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "#94A3B8" }}>{p.name}</p>
                    <div className="mb-6">
                      <span className="font-heading text-3xl font-bold">R${p.price}</span>
                      <span className="text-sm ml-1" style={{ color: "#64748B" }}>/mês</span>
                    </div>
                    <div className="h-px mb-6" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <ul className="space-y-3 mb-6">
                      {p.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm">
                          <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#22C55E" }} />
                          <span style={{ color: "#CBD5E1" }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/pricing" className="block w-full text-center py-2.5 rounded-xl text-sm font-medium transition-all duration-200" style={{
                      background: p.popular ? "#6366F1" : "transparent",
                      color: p.popular ? "#fff" : "#94A3B8",
                      border: p.popular ? "none" : "1px solid rgba(255,255,255,0.1)",
                    }}>
                      Começar grátis
                    </Link>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-20 sm:py-28">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <AnimateIn>
              <div className="text-center p-8 sm:p-12 rounded-2xl relative" style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.15), transparent)", border: "1px solid rgba(99,102,241,0.3)" }}>
                <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl mb-4" style={{ letterSpacing: "-0.02em" }}>Pronto para aparecer mais no Google?</h2>
                <p className="mb-8" style={{ color: "#94A3B8" }}>14 dias grátis. Sem cartão de crédito. Cancele quando quiser.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/pricing" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-medium text-white transition-all duration-200 hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", boxShadow: "0 0 40px rgba(99,102,241,0.3)" }}>
                    Criar minha conta grátis <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a href="mailto:contato@localai.com.br" className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-medium transition-colors duration-200" style={{ color: "#94A3B8", border: "1px solid rgba(255,255,255,0.1)" }}>
                    Falar com a equipe
                  </a>
                </div>
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Lock className="w-3.5 h-3.5" style={{ color: "#64748B" }} />
                  <span className="text-xs" style={{ color: "#64748B" }}>Pagamento seguro via Stripe</span>
                </div>
              </div>
            </AnimateIn>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid sm:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)" }}><MapPin className="w-3.5 h-3.5" style={{ color: "#6366F1" }} /></div>
                  <span className="font-heading text-sm font-bold">Local<span style={{ background: "linear-gradient(135deg, #6366F1, #22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span></span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>Inteligência artificial para negócios locais dominarem o Google.</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#94A3B8" }}>Produto</p>
                <div className="space-y-2">
                  <a href="#como-funciona" className="block text-xs" style={{ color: "#64748B" }}>Como funciona</a>
                  <a href="#funcionalidades" className="block text-xs" style={{ color: "#64748B" }}>Funcionalidades</a>
                  <a href="#precos" className="block text-xs" style={{ color: "#64748B" }}>Preços</a>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#94A3B8" }}>Legal</p>
                <div className="space-y-2">
                  <span className="block text-xs" style={{ color: "#64748B" }}>Termos de uso</span>
                  <span className="block text-xs" style={{ color: "#64748B" }}>Privacidade</span>
                </div>
              </div>
            </div>
            <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <p className="text-xs mt-6 text-center" style={{ color: "#475569" }}>© 2026 LocalAI. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
