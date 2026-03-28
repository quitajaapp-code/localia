import { useParams, useSearchParams } from "react-router-dom";
import { usePublicSite } from "@/hooks/useWebsite";
import { WebsiteConfig } from "@/types/website";
import { useEffect, useRef, useState } from "react";
import { motion, useInView as useMotionInView, useScroll, useTransform } from "framer-motion";
import {
  Phone, MessageSquare, MapPin, Clock, Star, Globe, Mail,
  Zap, Heart, Scissors, Car, Home, Camera, Coffee, FileText, Target
} from "lucide-react";

const lucideIcons: Record<string, any> = {
  Star, Zap, Heart, Scissors, Car, Home, Camera, Coffee, MapPin, FileText, Target, Phone,
};

type RevealVariant = 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scaleUp' | 'blur';

const variants: Record<RevealVariant, { hidden: any; visible: any }> = {
  fadeUp: {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(8px)', y: 16 },
    visible: { opacity: 1, filter: 'blur(0px)', y: 0 },
  },
};

function Reveal({ children, delay = 0, style = {}, variant = 'fadeUp' }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties; variant?: RevealVariant }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useMotionInView(ref, { once: true, margin: '-40px' });
  const v = variants[variant];
  return (
    <motion.div
      ref={ref}
      initial={v.hidden}
      animate={isInView ? v.visible : v.hidden}
      transition={{ duration: 0.7, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function cleanPhone(phone: string) {
  return phone.replace(/\D/g, '');
}

function isOpenNow(horarios: WebsiteConfig['horarios']): boolean {
  const now = new Date();
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const today = days[now.getDay()];
  const h = horarios.find(ho => ho.dia === today);
  if (!h || h.fechado) return false;
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  return time >= h.abre && time <= h.fecha;
}

function getSubdomainSlug(): string | null {
  const hostname = window.location.hostname;
  // Detect slug.localai.app.br pattern
  if (hostname.endsWith('.localai.app.br')) {
    const sub = hostname.replace('.localai.app.br', '');
    if (sub && sub !== 'www' && !sub.includes('.')) return sub;
  }
  return null;
}

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';

function getMapEmbedUrl(endereco: string, mapsUrl?: string): string {
  // Prioridade 1: endereço do negócio (sempre presente e preciso)
  if (endereco && endereco.trim()) {
    const q = encodeURIComponent(endereco.trim());
    return `https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${q}&language=pt-BR&zoom=16`;
  }
  // Prioridade 2: fallback para maps_url se não tiver endereço
  if (mapsUrl) {
    return `https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${encodeURIComponent(mapsUrl)}&language=pt-BR`;
  }
  return '';
}

function HeroSection({ config, pc, fg, fgSec }: { config: WebsiteConfig; pc: string; fg: string; fgSec: string }) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section ref={heroRef} style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      {config.hero.bg_image_url ? (
        <>
          <motion.img
            src={config.hero.bg_image_url}
            alt=""
            style={{ position: 'absolute', inset: '-10% 0', width: '100%', height: '120%', objectFit: 'cover', y: bgY, scale: bgScale }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
        </>
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 30% 50%, ${pc}33, transparent 70%)` }} />
      )}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 768, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <Reveal variant="blur">
          <h1 className="hero-title" style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', color: config.hero.bg_image_url ? '#fff' : fg, marginBottom: 16 }}>
            {config.hero.titulo}
          </h1>
        </Reveal>
        <Reveal delay={150} variant="blur">
          <p className="hero-sub" style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: config.hero.bg_image_url ? 'rgba(255,255,255,0.8)' : fgSec, marginBottom: 32 }}>
            {config.hero.subtitulo}
          </p>
        </Reveal>
        {config.hero.cta_link && (
          <Reveal delay={300} variant="scaleUp">
            <a href={config.hero.cta_link} target="_blank" rel="noopener" className="hero-cta-gradient" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#fff', padding: '14px 28px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none', '--cta-color': pc } as React.CSSProperties}>
              {config.hero.cta_link.includes('wa.me') && <MessageSquare style={{ width: 18, height: 18 }} />}
              {config.hero.cta_link.includes('tel:') && <Phone style={{ width: 18, height: 18 }} />}
              {config.hero.cta_texto}
            </a>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export default function PublicSite() {
  const { slug: routeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const subdomainSlug = getSubdomainSlug();
  const slug = subdomainSlug || routeSlug || '';
  const { website, loading, notFound } = usePublicSite(slug);

  useEffect(() => {
    if (website) {
      document.title = website.seo_titulo || website.config?.hero?.titulo || 'Site';
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', website.seo_descricao || website.config?.hero?.subtitulo || '');
    }
  }, [website]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020817', color: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <Globe style={{ width: 32, height: 32, margin: '0 auto 16px', opacity: 0.5 }} />
          <p style={{ fontSize: 14, opacity: 0.6 }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (notFound || !website) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020817', color: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16 }}>404</h1>
          <p style={{ opacity: 0.6 }}>Site não encontrado</p>
        </div>
      </div>
    );
  }

  const config = { ...defaultConfig(), ...website.config } as WebsiteConfig;
  const isDark = website.theme !== 'light';
  const pc = website.primary_color || '#6366F1';
  const bg = isDark ? '#020817' : '#FFFFFF';
  const fg = isDark ? '#F8FAFC' : '#0F172A';
  const fgSec = isDark ? '#94A3B8' : '#64748B';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const borderC = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const sectionAlt = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';

  return (
    <div style={{ background: bg, color: fg, minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @keyframes float-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes cta-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero-cta-gradient {
          background: linear-gradient(135deg, var(--cta-color), color-mix(in srgb, var(--cta-color) 60%, #fff), var(--cta-color), color-mix(in srgb, var(--cta-color) 70%, #000));
          background-size: 300% 300%;
          animation: cta-gradient-shift 4s ease infinite;
          box-shadow: 0 0 40px color-mix(in srgb, var(--cta-color) 40%, transparent), 0 4px 15px rgba(0,0,0,0.2);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .hero-cta-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 60px color-mix(in srgb, var(--cta-color) 55%, transparent), 0 8px 25px rgba(0,0,0,0.3);
        }
        @media (max-width: 768px) {
          .contato-grid { grid-template-columns: 1fr !important; }
          .sobre-grid { grid-template-columns: 1fr !important; }
          .servicos-grid { grid-template-columns: 1fr !important; }
          .depoimentos-grid { grid-template-columns: 1fr !important; }
          .galeria-masonry { column-count: 2 !important; }
          .hero-title { font-size: 28px !important; }
          .hero-sub { font-size: 15px !important; }
          .section-title { font-size: 24px !important; }
          .section-padding { padding: 48px 0 !important; }
          .header-buttons { gap: 4px !important; }
          .header-buttons a { padding: 6px 10px !important; font-size: 12px !important; }
        }
        @media (max-width: 480px) {
          .galeria-masonry { column-count: 1 !important; }
        }
      `}</style>

      {/* Preview banner */}
      {isPreview && (
        <div style={{ background: '#F59E0B', color: '#000', textAlign: 'center', padding: '8px', fontSize: 13, fontWeight: 600, position: 'sticky', top: 0, zIndex: 100 }}>
          Modo preview — Este site ainda não está publicado
        </div>
      )}

      {/* Demo banner */}
      {['demo-salao', 'demo-clinica', 'demo-loja'].includes(slug) && (
        <div style={{ background: 'linear-gradient(135deg, #6366F1, #7C3AED)', color: '#fff', textAlign: 'center', padding: '10px 16px', fontSize: 13, fontWeight: 500, position: 'sticky', top: 0, zIndex: 99 }}>
          ✦ Este é um site modelo — <a href="/auth" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 700 }}>Crie o seu agora grátis</a>
        </div>
      )}

      {/* Header */}
      <header style={{ position: 'sticky', top: isPreview ? 36 : 0, zIndex: 50, background: isDark ? 'rgba(2,8,23,0.9)' : 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${borderC}`, height: 60 }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {config.logo_url ? (
              <img src={config.logo_url} alt="Logo" style={{ height: 36, maxWidth: 120, objectFit: 'contain' }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: pc, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>
                {config.hero.titulo.charAt(0)}
              </div>
            )}
            <span style={{ fontWeight: 600, fontSize: 16 }}>{config.hero.titulo.split(' ').slice(0, 3).join(' ')}</span>
          </div>
          <div className="header-buttons" style={{ display: 'flex', gap: 8 }}>
            {config.contato.whatsapp && (
              <a href={`https://wa.me/55${cleanPhone(config.contato.whatsapp)}`} target="_blank" rel="noopener" style={{ background: '#25D366', color: '#fff', padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                <MessageSquare style={{ width: 14, height: 14 }} /> WhatsApp
              </a>
            )}
            {config.contato.telefone && (
              <a href={`tel:+55${cleanPhone(config.contato.telefone)}`} style={{ background: pc, color: '#fff', padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                <Phone style={{ width: 14, height: 14 }} /> Ligar
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <HeroSection config={config} pc={pc} fg={fg} fgSec={fgSec} />

      {/* Sobre */}
      {config.sobre.texto && (
        <section className="section-padding" style={{ padding: '80px 0', background: bg }}>
          <div className="sobre-grid" style={{ maxWidth: 1024, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: config.sobre.foto_url ? '1fr 1fr' : '1fr', gap: 32, alignItems: 'center' }}>
            {config.sobre.foto_url && (
              <Reveal variant="fadeLeft">
                <img src={config.sobre.foto_url} alt="Sobre" style={{ width: '100%', borderRadius: 16, objectFit: 'cover', maxHeight: 400, aspectRatio: '4/3' }} />
              </Reveal>
            )}
            <Reveal delay={150} variant="fadeRight">
              <div>
                <span style={{ fontSize: 11, letterSpacing: '0.15em', color: pc, fontWeight: 600, display: 'block', marginBottom: 12 }}>SOBRE NÓS</span>
                <h2 className="section-title" style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Conheça nosso negócio</h2>
                <p style={{ fontSize: 16, lineHeight: 1.8, color: fgSec, whiteSpace: 'pre-line' }}>{config.sobre.texto}</p>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Serviços */}
      {config.servicos.length > 0 && (
        <section className="section-padding" style={{ padding: '80px 0', background: sectionAlt }}>
          <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 24px' }}>
            <Reveal>
              <span style={{ fontSize: 11, letterSpacing: '0.15em', color: pc, fontWeight: 600, display: 'block', textAlign: 'center', marginBottom: 12 }}>NOSSOS SERVIÇOS</span>
              <h2 className="section-title" style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 48 }}>O que oferecemos</h2>
            </Reveal>
            <div className="servicos-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(config.servicos.length, 3)}, 1fr)`, gap: 16 }}>
              {config.servicos.map((s, i) => {
                const Icon = lucideIcons[s.icone] || Star;
                return (
                  <Reveal key={s.id} delay={i * 100} variant="scaleUp">
                    <div style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 14, padding: 24, transition: 'all 0.3s ease' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: `${pc}26`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon style={{ width: 22, height: 22, color: pc }} />
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 12, marginBottom: 8 }}>{s.nome}</h3>
                      <p style={{ fontSize: 14, color: fgSec, lineHeight: 1.6 }}>{s.descricao}</p>
                      {s.preco && <p style={{ fontSize: 18, fontWeight: 700, color: pc, marginTop: 12 }}>{s.preco}</p>}
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Galeria */}
      {config.galeria.length > 0 && (
        <section className="section-padding" style={{ padding: '80px 0' }}>
          <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 24px' }}>
            <Reveal>
              <span style={{ fontSize: 11, letterSpacing: '0.15em', color: pc, fontWeight: 600, display: 'block', textAlign: 'center', marginBottom: 12 }}>GALERIA</span>
              <h2 className="section-title" style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 48 }}>Nossos momentos</h2>
            </Reveal>
            <div className="galeria-masonry" style={{ columnCount: 3, columnGap: 16 }}>
              {config.galeria.map((g, i) => (
                <Reveal key={g.id} delay={i * 80} variant="scaleUp">
                  <div style={{ marginBottom: 16, breakInside: 'avoid' }}>
                    <img src={g.url} alt={g.caption} style={{ width: '100%', borderRadius: 12, objectFit: 'cover' }} />
                    {g.caption && <p style={{ fontSize: 12, color: fgSec, marginTop: 4, textAlign: 'center' }}>{g.caption}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Depoimentos */}
      {config.depoimentos.length > 0 && (
        <section className="section-padding" style={{ padding: '80px 0', background: sectionAlt }}>
          <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 24px' }}>
            <Reveal>
              <span style={{ fontSize: 11, letterSpacing: '0.15em', color: pc, fontWeight: 600, display: 'block', textAlign: 'center', marginBottom: 12 }}>DEPOIMENTOS</span>
              <h2 className="section-title" style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 48 }}>O que dizem nossos clientes</h2>
            </Reveal>
            <div className="depoimentos-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(config.depoimentos.length, 3)}, 1fr)`, gap: 20 }}>
              {config.depoimentos.map((d, i) => (
                <Reveal key={d.id} delay={i * 120} variant="fadeUp">
                  <div style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 14, padding: 24 }}>
                    <span style={{ fontSize: 48, lineHeight: 1, color: pc, opacity: 0.6, fontFamily: 'Georgia, serif' }}>"</span>
                    <div style={{ fontSize: 13, color: '#F59E0B', marginBottom: 8 }}>{"★".repeat(d.rating)}</div>
                    <p style={{ fontSize: 14, color: fgSec, lineHeight: 1.7, fontStyle: 'italic', marginBottom: 16 }}>{d.texto}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: pc, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 600 }}>
                        {d.nome.charAt(0)}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{d.nome}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Horários */}
      {config.horarios.some(h => !h.fechado) && (
        <section className="section-padding" style={{ padding: '64px 0' }}>
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
            <Reveal>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                <Clock style={{ width: 18, height: 18, color: pc }} />
                <h2 style={{ fontSize: 24, fontWeight: 700 }}>Horário de funcionamento</h2>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, fontWeight: 600, background: isOpenNow(config.horarios) ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: isOpenNow(config.horarios) ? '#22C55E' : '#EF4444' }}>
                  {isOpenNow(config.horarios) ? '● Aberto agora' : '● Fechado'}
                </span>
              </div>
            </Reveal>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {config.horarios.map((h, i) => {
                const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                const isToday = days[new Date().getDay()] === h.dia;
                return (
                  <div key={h.dia} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${borderC}`, fontWeight: isToday ? 600 : 400, color: isToday ? pc : fg }}>
                    <span style={{ fontSize: 14 }}>{h.dia}</span>
                    <span style={{ fontSize: 14, color: h.fechado ? '#EF4444' : (isToday ? pc : fgSec) }}>
                      {h.fechado ? 'Fechado' : `${h.abre} – ${h.fecha}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Contato */}
      {(config.contato.telefone || config.contato.whatsapp || config.contato.email || config.contato.endereco) && (
        <section style={{ padding: '80px 0', background: sectionAlt }}>
          <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 24px' }}>

            {/* Título */}
            <Reveal>
              <span style={{ fontSize: 11, letterSpacing: '0.15em', color: pc, fontWeight: 600, display: 'block', textAlign: 'center', marginBottom: 12 }}>CONTATO & LOCALIZAÇÃO</span>
              <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 48 }}>Fale conosco e nos encontre</h2>
            </Reveal>

            {/* Grid: info + mapa */}
            <div className="contato-grid" style={{ display: 'grid', gridTemplateColumns: (config.contato.endereco || config.contato.maps_url) ? '1fr 1fr' : '1fr', gap: 40, alignItems: 'start' }}>

              {/* Coluna esquerda: informações de contato */}
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {config.contato.telefone && (
                    <Reveal delay={50}>
                      <a href={`tel:+55${cleanPhone(config.contato.telefone)}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: cardBg, border: `1px solid ${borderC}`, borderRadius: 14, textDecoration: 'none', color: fg, transition: 'all 0.2s ease' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${pc}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Phone style={{ width: 20, height: 20, color: pc }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: fgSec, marginBottom: 2 }}>Telefone</div>
                          <div style={{ fontSize: 15, fontWeight: 600 }}>{config.contato.telefone}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: 12, color: pc, fontWeight: 500 }}>Ligar →</div>
                      </a>
                    </Reveal>
                  )}

                  {config.contato.whatsapp && (
                    <Reveal delay={100}>
                      <a href={`https://wa.me/55${cleanPhone(config.contato.whatsapp)}`}
                        target="_blank" rel="noopener"
                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: 14, textDecoration: 'none', color: fg, transition: 'all 0.2s ease' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(37,211,102,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <MessageSquare style={{ width: 20, height: 20, color: '#25D366' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: fgSec, marginBottom: 2 }}>WhatsApp</div>
                          <div style={{ fontSize: 15, fontWeight: 600 }}>{config.contato.whatsapp}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#25D366', fontWeight: 500 }}>Abrir →</div>
                      </a>
                    </Reveal>
                  )}

                  {config.contato.email && (
                    <Reveal delay={150}>
                      <a href={`mailto:${config.contato.email}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: cardBg, border: `1px solid ${borderC}`, borderRadius: 14, textDecoration: 'none', color: fg }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${pc}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Mail style={{ width: 20, height: 20, color: pc }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: fgSec, marginBottom: 2 }}>E-mail</div>
                          <div style={{ fontSize: 15, fontWeight: 600 }}>{config.contato.email}</div>
                        </div>
                      </a>
                    </Reveal>
                  )}

                  {config.contato.endereco && (
                    <Reveal delay={200}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', background: cardBg, border: `1px solid ${borderC}`, borderRadius: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${pc}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                          <MapPin style={{ width: 20, height: 20, color: pc }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, color: fgSec, marginBottom: 2 }}>Endereço</div>
                          <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{config.contato.endereco}</div>
                        </div>
                      </div>
                    </Reveal>
                  )}
                </div>

                {/* Redes sociais */}
                {Object.values(config.redes).some(Boolean) && (
                  <Reveal delay={250}>
                    <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
                      {config.redes.instagram && (
                        <a href={config.redes.instagram.startsWith('http') ? config.redes.instagram : `https://instagram.com/${config.redes.instagram.replace('@', '')}`}
                          target="_blank" rel="noopener"
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: cardBg, border: `1px solid ${borderC}`, borderRadius: 99, fontSize: 13, color: fg, textDecoration: 'none', fontWeight: 500 }}>
                          <span style={{ fontSize: 15 }}>📷</span> Instagram
                        </a>
                      )}
                      {config.redes.facebook && (
                        <a href={config.redes.facebook.startsWith('http') ? config.redes.facebook : `https://facebook.com/${config.redes.facebook}`}
                          target="_blank" rel="noopener"
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: cardBg, border: `1px solid ${borderC}`, borderRadius: 99, fontSize: 13, color: fg, textDecoration: 'none', fontWeight: 500 }}>
                          <span style={{ fontSize: 15 }}>👤</span> Facebook
                        </a>
                      )}
                      {config.redes.tiktok && (
                        <a href={config.redes.tiktok.startsWith('http') ? config.redes.tiktok : `https://tiktok.com/${config.redes.tiktok}`}
                          target="_blank" rel="noopener"
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: cardBg, border: `1px solid ${borderC}`, borderRadius: 99, fontSize: 13, color: fg, textDecoration: 'none', fontWeight: 500 }}>
                          <span style={{ fontSize: 15 }}>🎵</span> TikTok
                        </a>
                      )}
                      {config.redes.youtube && (
                        <a href={config.redes.youtube.startsWith('http') ? config.redes.youtube : `https://youtube.com/${config.redes.youtube}`}
                          target="_blank" rel="noopener"
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: cardBg, border: `1px solid ${borderC}`, borderRadius: 99, fontSize: 13, color: fg, textDecoration: 'none', fontWeight: 500 }}>
                          <span style={{ fontSize: 15 }}>▶️</span> YouTube
                        </a>
                      )}
                    </div>
                  </Reveal>
                )}
              </div>

              {/* Coluna direita: mapa */}
              <Reveal delay={150}>
                <div>
                  {(config.contato.endereco || config.contato.maps_url) && (() => {
                    const embedUrl = getMapEmbedUrl(config.contato.endereco, config.contato.maps_url);
                    if (!embedUrl) return null;
                    return (
                      <Reveal delay={100}>
                        <div>
                          <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${borderC}`, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
                            <iframe
                              src={embedUrl}
                              width="100%"
                              height="320"
                              style={{ border: 0, display: 'block' }}
                              loading="lazy"
                              allowFullScreen
                              title={`Localização — ${config.contato.endereco}`}
                            />
                          </div>
                          <a
                            href={
                              config.contato.endereco
                                ? `https://www.google.com/maps/search/${encodeURIComponent(config.contato.endereco)}`
                                : config.contato.maps_url || '#'
                            }
                            target="_blank"
                            rel="noopener"
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                              marginTop: 10, padding: '11px 20px',
                              background: pc, color: '#fff',
                              borderRadius: 10, textDecoration: 'none',
                              fontSize: 14, fontWeight: 600,
                              boxShadow: `0 4px 16px ${pc}44`,
                            }}
                          >
                            <MapPin style={{ width: 15, height: 15 }} />
                            Como chegar — Abrir no Google Maps
                          </a>
                        </div>
                      </Reveal>
                    );
                  })()}
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* CTA Flutuante */}
      {config.cta_flutuante.tipo !== 'nenhum' && config.cta_flutuante.valor && (
        <a
          href={config.cta_flutuante.tipo === 'whatsapp' ? `https://wa.me/55${cleanPhone(config.cta_flutuante.valor)}` : `tel:+55${cleanPhone(config.cta_flutuante.valor)}`}
          target={config.cta_flutuante.tipo === 'whatsapp' ? '_blank' : undefined}
          rel="noopener"
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 100,
            width: 56, height: 56, borderRadius: '50%',
            background: config.cta_flutuante.tipo === 'whatsapp' ? '#25D366' : pc,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: config.cta_flutuante.tipo === 'whatsapp' ? '0 4px 20px rgba(37,211,102,0.4)' : `0 4px 20px ${pc}66`,
            animation: 'float-pulse 3s ease-in-out infinite', textDecoration: 'none',
          }}
        >
          {config.cta_flutuante.tipo === 'whatsapp' ? <MessageSquare style={{ width: 24, height: 24, color: '#fff' }} /> : <Phone style={{ width: 24, height: 24, color: '#fff' }} />}
        </a>
      )}

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${borderC}`, padding: '40px 0' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{config.hero.titulo.split(' ').slice(0, 4).join(' ')}</p>
          {config.contato.endereco && <p style={{ fontSize: 13, color: fgSec, marginBottom: 16 }}>{config.contato.endereco.split(',')[0]}</p>}
          <p style={{ fontSize: 12, color: fgSec, marginBottom: 24 }}>© {new Date().getFullYear()} {config.hero.titulo.split(' ').slice(0, 3).join(' ')}. Todos os direitos reservados.</p>
          <a href="https://localai.app" target="_blank" rel="noopener" style={{ fontSize: 11, color: fgSec, opacity: 0.4, textDecoration: 'none' }}>Criado com LocalAI</a>
        </div>
      </footer>
    </div>
  );
}

function defaultConfig(): WebsiteConfig {
  return {
    hero: { titulo: '', subtitulo: '', cta_texto: '', cta_link: '', bg_image_url: '' },
    sobre: { texto: '', foto_url: '' },
    servicos: [],
    galeria: [],
    contato: { telefone: '', whatsapp: '', email: '', endereco: '', maps_url: '', maps_place_id: '' },
    redes: { instagram: '', facebook: '', tiktok: '', youtube: '', linkedin: '' },
    horarios: [],
    depoimentos: [],
    cta_flutuante: { tipo: 'nenhum', valor: '' },
  };
}
