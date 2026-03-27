import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useWebsite } from "@/hooks/useWebsite";
import { WebsiteConfig, WebsiteService, WebsiteDepoimento, defaultWebsiteConfig } from "@/types/website";
import { supabase } from "@/integrations/supabase/client";
import {
  Globe, Eye, Settings, Phone, Star, Clock, Copy, Check,
  Plus, Trash2, ExternalLink, Palette, Layout, MessageSquare,
  BarChart3, ArrowRight, Zap, Heart, Scissors, Car, Home,
  Camera, Coffee, MapPin, FileText, Target, Image, Download,
  Upload, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { usePageTitle } from "@/hooks/usePageTitle";
import { toast } from "sonner";

const iconMap: Record<string, any> = {
  Star, Zap, Heart, Scissors, Car, Home, Camera, Coffee, MapPin, FileText, Target, Phone,
};
const iconOptions = Object.keys(iconMap);

type TabId = 'aparencia' | 'hero' | 'sobre' | 'servicos' | 'galeria' | 'contato' | 'horarios' | 'depoimentos' | 'dominio' | 'analytics';

const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: 'aparencia', label: 'Aparência', icon: Palette },
  { id: 'hero', label: 'Hero', icon: Layout },
  { id: 'sobre', label: 'Sobre', icon: FileText },
  { id: 'servicos', label: 'Serviços', icon: Star },
  { id: 'galeria', label: 'Galeria', icon: Image },
  { id: 'contato', label: 'Contato', icon: Phone },
  { id: 'horarios', label: 'Horários', icon: Clock },
  { id: 'depoimentos', label: 'Depoimentos', icon: MessageSquare },
  { id: 'dominio', label: 'Domínio', icon: Globe },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const COLOR_PRESETS = [
  { label: 'Indigo', value: '#6366F1' },
  { label: 'Azul', value: '#3B82F6' },
  { label: 'Cyan', value: '#06B6D4' },
  { label: 'Verde', value: '#10B981' },
  { label: 'Amarelo', value: '#F59E0B' },
  { label: 'Laranja', value: '#F97316' },
  { label: 'Vermelho', value: '#EF4444' },
  { label: 'Rosa', value: '#EC4899' },
  { label: 'Roxo', value: '#8B5CF6' },
  { label: 'Cinza', value: '#6B7280' },
];

export default function Website() {
  usePageTitle("Meu Site | LocalAI");
  const [businessId, setBusinessId] = useState<string>();
  const [businessData, setBusinessData] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<string>('trial');
  const [activeTab, setActiveTab] = useState<TabId>('hero');
  const [config, setConfig] = useState<WebsiteConfig>(defaultWebsiteConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const [copied, setCopied] = useState(false);
  const [slugInput, setSlugInput] = useState('');
  const [importing, setImporting] = useState(false);

  const { website, loading, saving, createWebsite, saveWebsite, togglePublish } = useWebsite(businessId);

  // Fetch business + profile
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase.from("businesses").select("*").eq("user_id", user.id).single();
      if (biz) {
        setBusinessId(biz.id);
        setBusinessData(biz);
      }
      const { data: profile } = await supabase.from("profiles").select("plano").eq("user_id", user.id).single();
      if (profile) setUserPlan(profile.plano || 'trial');
    })();
  }, []);

  useEffect(() => {
    if (website?.config) {
      const c = website.config as any;
      setConfig({ ...defaultWebsiteConfig, ...c });
    }
  }, [website]);

  const updateConfig = useCallback((path: string, value: any) => {
    setConfig(prev => {
      const keys = path.split('.');
      const updated = JSON.parse(JSON.stringify(prev));
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
    setHasChanges(true);
  }, []);

  const importFromBusiness = async () => {
    if (!businessData) { toast.error("Dados do negócio não encontrados"); return; }
    setImporting(true);

    const biz = businessData;
    const newConfig = { ...JSON.parse(JSON.stringify(config)) } as WebsiteConfig;

    // Hero
    if (biz.nome) newConfig.hero.titulo = biz.nome;
    if (biz.nicho) newConfig.hero.subtitulo = `${biz.nicho} em ${biz.cidade || ''}, ${biz.estado || ''}`.trim().replace(/,\s*$/, '');
    if (biz.whatsapp) {
      newConfig.hero.cta_texto = "Falar no WhatsApp";
      newConfig.hero.cta_link = `https://wa.me/55${biz.whatsapp.replace(/\D/g, '')}`;
    }

    // Logo
    if (biz.logo_url) newConfig.logo_url = biz.logo_url;

    // Sobre
    if (biz.diferenciais) newConfig.sobre.texto = biz.diferenciais;
    else if (biz.produtos) newConfig.sobre.texto = biz.produtos;

    // Contato
    if (biz.whatsapp) newConfig.contato.whatsapp = biz.whatsapp;
    if (biz.website_url) newConfig.contato.email = '';
    if (biz.cidade && biz.estado) newConfig.contato.endereco = `${biz.cidade}, ${biz.estado}`;

    // Redes
    if (biz.instagram) newConfig.redes.instagram = biz.instagram;
    if (biz.outras_redes) {
      // Try to parse other networks
      const redes = biz.outras_redes;
      if (redes.includes('facebook')) newConfig.redes.facebook = redes;
      if (redes.includes('tiktok')) newConfig.redes.tiktok = redes;
    }

    // CTA flutuante
    if (biz.whatsapp) {
      newConfig.cta_flutuante = { tipo: 'whatsapp', valor: biz.whatsapp };
    }

    setConfig(newConfig);
    setHasChanges(true);
    setImporting(false);

    // Also update primary color from business if available
    if (biz.cor_primaria) {
      await saveWebsite({ primary_color: biz.cor_primaria });
    }

    // Import reviews as depoimentos
    const { data: reviews } = await supabase
      .from("reviews")
      .select("*")
      .eq("business_id", biz.id)
      .gte("rating", 4)
      .limit(6);

    if (reviews && reviews.length > 0) {
      const imported: WebsiteDepoimento[] = reviews.map(r => ({
        id: crypto.randomUUID(),
        nome: r.autor || 'Cliente',
        texto: r.texto || '',
        rating: r.rating || 5,
      }));
      newConfig.depoimentos = imported;
      setConfig({ ...newConfig });
    }

    toast.success("Dados importados do Google Meu Negócio! Revise e ajuste conforme necessário.");
  };

  const handleSave = async () => {
    await saveWebsite({ config: config as any });
    setHasChanges(false);
    toast.success("Alterações salvas!");
  };

  const handlePublish = async () => {
    await togglePublish();
    toast.success(website?.published ? "Site despublicado" : "Site publicado!");
  };

  const handleCreate = async () => {
    if (!slugInput.trim()) { toast.error("Digite um endereço"); return; }
    const { error } = await createWebsite(slugInput);
    if (error) toast.error("Erro ao criar: " + (error as any).message);
    else toast.success("Site criado!");
  };

  const siteUrl = (slug: string) => `https://${slug}.localai.app.br`;

  const copyUrl = () => {
    const url = website?.custom_domain ? `https://${website.custom_domain}` : siteUrl(website?.slug || '');
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Plan gate
  const allowedPlans = ['presenca_ads', 'agencia', 'price_ads', 'price_agencia', 'trial'];
  if (!loading && !allowedPlans.includes(userPlan)) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          <Globe className="h-16 w-16 text-primary mx-auto" />
          <h2 className="text-2xl font-heading font-bold">Mini Site</h2>
          <p className="text-muted-foreground">Disponível nos planos Presença + Ads e Agência. Crie um site profissional para seu negócio com subdomínio grátis.</p>
          <Button asChild><Link to="/pricing">Fazer upgrade <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  // No site yet — offer to create with auto-import
  if (!website) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-lg">
          <div className="relative inline-flex">
            <Globe className="h-16 w-16 text-primary" />
            <Sparkles className="h-6 w-6 text-accent absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h2 className="text-2xl font-heading font-bold">Crie seu mini site grátis</h2>
          <p className="text-muted-foreground">Um site profissional no ar em menos de 5 minutos. Os dados do seu Google Meu Negócio serão importados automaticamente.</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input value={slugInput} onChange={e => setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="seu-negocio" />
              <span className="text-sm text-muted-foreground whitespace-nowrap">.localai.app.br</span>
            </div>
            {slugInput && <p className="text-xs text-muted-foreground">Seu site ficará em: <strong>https://{slugInput}.localai.app.br</strong></p>}
            <Button onClick={handleCreate} className="w-full">
              <Sparkles className="h-4 w-4 mr-2" /> Criar e importar dados
            </Button>
          </div>
          {businessData && (
            <div className="p-4 rounded-xl border border-border bg-muted/50 text-left space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Dados que serão importados:</p>
              <div className="flex flex-wrap gap-2">
                {businessData.nome && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">✓ Nome</span>}
                {businessData.whatsapp && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">✓ WhatsApp</span>}
                {businessData.instagram && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">✓ Instagram</span>}
                {businessData.cidade && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">✓ Localização</span>}
                {businessData.logo_url && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">✓ Logo</span>}
                {businessData.cor_primaria && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">✓ Cores</span>}
                {businessData.nicho && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">✓ Nicho</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main editor
  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-heading font-bold">Meu Site</h1>
          {website.published ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-500/10 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Publicado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-yellow-600 bg-yellow-500/10 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Rascunho
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={importFromBusiness} disabled={importing}>
            <Download className="h-4 w-4 mr-1" /> {importing ? "Importando..." : "Importar do GMB"}
          </Button>
          {website.published && (
            <button onClick={copyUrl} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-muted px-3 py-1.5 rounded-lg transition-colors">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {website.custom_domain || `/site/${website.slug}`}
            </button>
          )}
          <Button variant="outline" size="sm" asChild>
            <a href={`/site/${website.slug}?preview=true`} target="_blank"><Eye className="h-4 w-4 mr-1" /> Preview</a>
          </Button>
          <Button variant={website.published ? "destructive" : "default"} size="sm" onClick={handlePublish}>
            {website.published ? "Despublicar" : "Publicar site"}
          </Button>
          {hasChanges && <Button size="sm" onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">{saving ? "Salvando..." : "Salvar alterações"}</Button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 border-b border-border">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">
          {activeTab === 'aparencia' && <TabAparencia config={config} website={website} updateConfig={updateConfig} onSaveTheme={(theme: string) => { saveWebsite({ theme: theme as any }); }} onSaveColor={(color: string) => { saveWebsite({ primary_color: color }); }} />}
          {activeTab === 'hero' && <TabHero config={config} updateConfig={updateConfig} />}
          {activeTab === 'sobre' && <TabSobre config={config} updateConfig={updateConfig} businessId={businessId} />}
          {activeTab === 'servicos' && <TabServicos config={config} updateConfig={updateConfig} />}
          {activeTab === 'galeria' && <TabGaleria config={config} updateConfig={updateConfig} />}
          {activeTab === 'contato' && <TabContato config={config} updateConfig={updateConfig} />}
          {activeTab === 'horarios' && <TabHorarios config={config} updateConfig={updateConfig} />}
          {activeTab === 'depoimentos' && <TabDepoimentos config={config} updateConfig={updateConfig} businessId={businessId} />}
          {activeTab === 'dominio' && <TabDominio website={website} saveWebsite={saveWebsite} />}
          {activeTab === 'analytics' && <TabAnalytics website={website} />}
        </div>
        {/* Preview */}
        <div className="hidden lg:block">
          <div className="sticky top-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Preview</span>
              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">Atualiza em tempo real</span>
            </div>
            <div className="border border-border rounded-xl overflow-hidden bg-muted" style={{ height: 600 }}>
              <iframe src={`/site/${website.slug}?preview=true`} className="w-full h-full border-0" title="Preview" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab Components ─── */

function Card({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      {title && <h3 className="font-heading font-semibold text-sm">{title}</h3>}
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function TabAparencia({ config, website, updateConfig, onSaveTheme, onSaveColor }: any) {
  const themes = [
    { id: 'dark', label: 'Escuro', bg: '#020817', fg: '#F8FAFC' },
    { id: 'light', label: 'Claro', bg: '#F8FAFC', fg: '#0F172A' },
    { id: 'brand', label: 'Marca', bg: '#020817', fg: website.primary_color },
  ];
  return (
    <>
      {/* Logo */}
      <Card title="Logotipo">
        <Field label="URL do logotipo" hint="Use uma imagem PNG com fundo transparente para melhor resultado">
          <Input value={config.logo_url || ''} onChange={e => updateConfig('logo_url', e.target.value)} placeholder="https://exemplo.com/logo.png" />
        </Field>
        {config.logo_url && (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden">
              <img src={config.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="w-16 h-16 rounded-xl bg-[#020817] flex items-center justify-center overflow-hidden">
              <img src={config.logo_url} alt="Logo dark" className="max-w-full max-h-full object-contain" />
            </div>
            <span className="text-xs text-muted-foreground">Preview: claro / escuro</span>
          </div>
        )}
      </Card>

      {/* Theme */}
      <Card title="Tema">
        <div className="grid grid-cols-3 gap-3">
          {themes.map(t => (
            <button key={t.id} onClick={() => onSaveTheme(t.id)} className={`rounded-xl p-4 border-2 transition-all ${website.theme === t.id ? 'border-primary' : 'border-border hover:border-border/80'}`}>
              <div className="h-16 rounded-lg mb-2" style={{ background: t.bg }}>
                <div className="p-2"><div className="h-2 w-8 rounded" style={{ background: t.fg, opacity: 0.5 }} /></div>
              </div>
              <span className="text-xs font-medium">{t.label}</span>
              {website.theme === t.id && <Check className="h-3 w-3 text-primary inline ml-1" />}
            </button>
          ))}
        </div>
      </Card>

      {/* Colors */}
      <Card title="Cor primária">
        <p className="text-xs text-muted-foreground">Usada em botões, destaques e acentos do site</p>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_PRESETS.map(c => (
            <button
              key={c.value}
              onClick={() => onSaveColor(c.value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${website.primary_color === c.value ? 'border-foreground' : 'border-transparent hover:border-border'}`}
            >
              <div className="w-8 h-8 rounded-full" style={{ background: c.value }} />
              <span className="text-[10px] text-muted-foreground">{c.label}</span>
            </button>
          ))}
        </div>
        <Field label="Cor personalizada">
          <div className="flex gap-2 items-center">
            <input type="color" value={website.primary_color} onChange={e => onSaveColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
            <Input value={website.primary_color} onChange={e => onSaveColor(e.target.value)} className="w-32 font-mono text-sm" />
          </div>
        </Field>
      </Card>
    </>
  );
}

function TabHero({ config, updateConfig }: { config: WebsiteConfig; updateConfig: (p: string, v: any) => void }) {
  return (
    <Card title="Banner principal">
      <Field label="Título principal" hint="Seja direto — o visitante decide em 3 segundos">
        <Input value={config.hero.titulo} onChange={e => updateConfig('hero.titulo', e.target.value)} placeholder="Bem-vindo à Pizzaria Don Marco" />
      </Field>
      <Field label="Subtítulo">
        <Input value={config.hero.subtitulo} onChange={e => updateConfig('hero.subtitulo', e.target.value)} placeholder="A melhor pizza artesanal de São Paulo desde 2010" />
      </Field>
      <Field label="Texto do botão de ação">
        <Input value={config.hero.cta_texto} onChange={e => updateConfig('hero.cta_texto', e.target.value)} placeholder="Falar no WhatsApp" />
      </Field>
      <Field label="Link do botão">
        <Input value={config.hero.cta_link} onChange={e => updateConfig('hero.cta_link', e.target.value)} placeholder="https://wa.me/5511999999999" />
      </Field>
      <Field label="Imagem de fundo" hint="Recomendado: foto do seu negócio em alta qualidade (mínimo 1200×600px)">
        <Input value={config.hero.bg_image_url} onChange={e => updateConfig('hero.bg_image_url', e.target.value)} placeholder="URL da imagem de fundo" />
        {config.hero.bg_image_url && <img src={config.hero.bg_image_url} alt="Preview" className="mt-2 w-40 h-24 object-cover rounded-lg" />}
      </Field>
    </Card>
  );
}

function TabSobre({ config, updateConfig, businessId }: { config: WebsiteConfig; updateConfig: (p: string, v: any) => void; businessId?: string }) {
  return (
    <Card title="Sobre nós">
      <Field label="Texto sobre o negócio">
        <Textarea value={config.sobre.texto} onChange={e => updateConfig('sobre.texto', e.target.value)} placeholder="Conte a história do seu negócio, seus valores e diferenciais..." rows={5} />
      </Field>
      <Field label="Foto da equipe/espaço">
        <Input value={config.sobre.foto_url} onChange={e => updateConfig('sobre.foto_url', e.target.value)} placeholder="URL da foto" />
        {config.sobre.foto_url && <img src={config.sobre.foto_url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-full" />}
      </Field>
    </Card>
  );
}

function TabServicos({ config, updateConfig }: { config: WebsiteConfig; updateConfig: (p: string, v: any) => void }) {
  const [form, setForm] = useState({ nome: '', descricao: '', preco: '', icone: 'Star' });

  const addService = () => {
    if (!form.nome) return;
    const newService: WebsiteService = { id: crypto.randomUUID(), ...form };
    updateConfig('servicos', [...config.servicos, newService]);
    setForm({ nome: '', descricao: '', preco: '', icone: 'Star' });
  };

  const removeService = (id: string) => {
    updateConfig('servicos', config.servicos.filter(s => s.id !== id));
  };

  return (
    <Card title="Serviços">
      <p className="text-sm text-muted-foreground">Adicione seus principais serviços ou produtos (máximo 12)</p>
      <div className="space-y-2">
        {config.servicos.map((s) => (
          <div key={s.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium flex-1">{s.nome}</span>
            <span className="text-xs text-muted-foreground">{s.preco}</span>
            <button onClick={() => removeService(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
          </div>
        ))}
      </div>
      {config.servicos.length < 12 && (
        <div className="space-y-3 border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-3">
            <Input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Nome do serviço" />
            <Input value={form.preco} onChange={e => setForm(p => ({ ...p, preco: e.target.value }))} placeholder="R$ 45,00" />
          </div>
          <Textarea value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} placeholder="Descrição curta" rows={2} />
          <div className="flex items-center gap-2">
            <span className="text-sm">Ícone:</span>
            <select value={form.icone} onChange={e => setForm(p => ({ ...p, icone: e.target.value }))} className="text-sm bg-muted border border-border rounded px-2 py-1">
              {iconOptions.map(ic => <option key={ic} value={ic}>{ic}</option>)}
            </select>
          </div>
          <Button size="sm" onClick={addService}><Plus className="h-4 w-4 mr-1" /> Adicionar serviço</Button>
        </div>
      )}
    </Card>
  );
}

function TabGaleria({ config, updateConfig }: { config: WebsiteConfig; updateConfig: (p: string, v: any) => void }) {
  const [url, setUrl] = useState('');
  const addPhoto = () => {
    if (!url) return;
    updateConfig('galeria', [...config.galeria, { id: crypto.randomUUID(), url, caption: '' }]);
    setUrl('');
  };
  const removePhoto = (id: string) => updateConfig('galeria', config.galeria.filter(g => g.id !== id));

  return (
    <Card title="Galeria de fotos">
      <p className="text-sm text-muted-foreground">Fotos do seu negócio, produtos ou equipe (máximo 20)</p>
      <div className="grid grid-cols-4 gap-2">
        {config.galeria.map(g => (
          <div key={g.id} className="relative group">
            <img src={g.url} alt="" className="w-full h-20 object-cover rounded-lg" />
            <button onClick={() => removePhoto(g.id)} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3 w-3 text-white" /></button>
          </div>
        ))}
      </div>
      {config.galeria.length < 20 && (
        <div className="flex gap-2">
          <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL da foto" className="flex-1" />
          <Button size="sm" onClick={addPhoto}><Plus className="h-4 w-4" /></Button>
        </div>
      )}
    </Card>
  );
}

function TabContato({ config, updateConfig }: { config: WebsiteConfig; updateConfig: (p: string, v: any) => void }) {
  return (
    <>
      <Card title="Informações de contato">
        <Field label="Telefone"><Input value={config.contato.telefone} onChange={e => updateConfig('contato.telefone', e.target.value)} placeholder="(11) 99999-9999" /></Field>
        <Field label="WhatsApp"><Input value={config.contato.whatsapp} onChange={e => updateConfig('contato.whatsapp', e.target.value)} placeholder="(11) 99999-9999" /></Field>
        <Field label="E-mail"><Input value={config.contato.email} onChange={e => updateConfig('contato.email', e.target.value)} placeholder="contato@exemplo.com" /></Field>
        <Field label="Endereço"><Textarea value={config.contato.endereco} onChange={e => updateConfig('contato.endereco', e.target.value)} placeholder="Rua Exemplo, 123 - Bairro, Cidade - SP" rows={2} /></Field>
        <Field label="Link do Google Maps" hint="Cole o link de compartilhamento do seu local no Maps">
          <Input value={config.contato.maps_url} onChange={e => updateConfig('contato.maps_url', e.target.value)} placeholder="https://maps.google.com/..." />
        </Field>
      </Card>
      <Card title="Redes sociais">
        <Field label="Instagram"><Input value={config.redes.instagram} onChange={e => updateConfig('redes.instagram', e.target.value)} placeholder="@seuinstagram" /></Field>
        <Field label="Facebook"><Input value={config.redes.facebook} onChange={e => updateConfig('redes.facebook', e.target.value)} placeholder="facebook.com/seuperfil" /></Field>
        <Field label="TikTok"><Input value={config.redes.tiktok} onChange={e => updateConfig('redes.tiktok', e.target.value)} placeholder="@seutiktok" /></Field>
        <Field label="YouTube"><Input value={config.redes.youtube} onChange={e => updateConfig('redes.youtube', e.target.value)} placeholder="youtube.com/seuchannel" /></Field>
        <Field label="LinkedIn"><Input value={config.redes.linkedin} onChange={e => updateConfig('redes.linkedin', e.target.value)} placeholder="linkedin.com/company/sunome" /></Field>
      </Card>
      <Card title="CTA Flutuante">
        <div className="flex items-center gap-3">
          <Switch checked={config.cta_flutuante.tipo !== 'nenhum'} onCheckedChange={v => updateConfig('cta_flutuante.tipo', v ? 'whatsapp' : 'nenhum')} />
          <span className="text-sm">Mostrar botão flutuante</span>
        </div>
        {config.cta_flutuante.tipo !== 'nenhum' && (
          <div className="space-y-3">
            <select value={config.cta_flutuante.tipo} onChange={e => updateConfig('cta_flutuante.tipo', e.target.value)} className="text-sm bg-muted border border-border rounded px-2 py-1.5 w-full">
              <option value="whatsapp">WhatsApp</option>
              <option value="telefone">Telefone</option>
            </select>
            <Input value={config.cta_flutuante.valor} onChange={e => updateConfig('cta_flutuante.valor', e.target.value)} placeholder="(11) 99999-9999" />
          </div>
        )}
      </Card>
    </>
  );
}

function TabHorarios({ config, updateConfig }: { config: WebsiteConfig; updateConfig: (p: string, v: any) => void }) {
  const updateDay = (index: number, field: string, value: any) => {
    const updated = [...config.horarios];
    (updated[index] as any)[field] = value;
    updateConfig('horarios', updated);
  };

  const copyToWeekdays = () => {
    const seg = config.horarios[0];
    const updated = config.horarios.map((h, i) => i > 0 && i < 5 ? { ...h, abre: seg.abre, fecha: seg.fecha, fechado: seg.fechado } : h);
    updateConfig('horarios', updated);
    toast.success("Horário copiado para dias úteis");
  };

  return (
    <Card title="Horário de funcionamento">
      <div className="space-y-3">
        {config.horarios.map((h, i) => (
          <div key={h.dia} className="flex items-center gap-3">
            <span className="text-sm font-medium w-20">{h.dia}</span>
            <div className="flex items-center gap-2">
              <Switch checked={!h.fechado} onCheckedChange={v => updateDay(i, 'fechado', !v)} />
              <span className="text-xs text-muted-foreground">{h.fechado ? 'Fechado' : 'Aberto'}</span>
            </div>
            {!h.fechado && (
              <>
                <Input type="time" value={h.abre} onChange={e => updateDay(i, 'abre', e.target.value)} className="w-28" />
                <span className="text-xs text-muted-foreground">às</span>
                <Input type="time" value={h.fecha} onChange={e => updateDay(i, 'fecha', e.target.value)} className="w-28" />
              </>
            )}
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={copyToWeekdays}>Copiar para dias úteis</Button>
    </Card>
  );
}

function TabDepoimentos({ config, updateConfig, businessId }: { config: WebsiteConfig; updateConfig: (p: string, v: any) => void; businessId?: string }) {
  const [form, setForm] = useState({ nome: '', texto: '', rating: 5 });

  const addDepo = () => {
    if (!form.nome || !form.texto) return;
    const newD: WebsiteDepoimento = { id: crypto.randomUUID(), ...form };
    updateConfig('depoimentos', [...config.depoimentos, newD]);
    setForm({ nome: '', texto: '', rating: 5 });
  };

  const removeDepo = (id: string) => updateConfig('depoimentos', config.depoimentos.filter(d => d.id !== id));

  const importReviews = async () => {
    if (!businessId) return;
    const { data } = await supabase.from("reviews").select("*").eq("business_id", businessId).gte("rating", 4).limit(6);
    if (data && data.length > 0) {
      const imported: WebsiteDepoimento[] = data.map(r => ({
        id: crypto.randomUUID(),
        nome: r.autor || 'Cliente',
        texto: r.texto || '',
        rating: r.rating || 5,
      }));
      updateConfig('depoimentos', [...config.depoimentos, ...imported].slice(0, 6));
      toast.success(`${imported.length} avaliações importadas`);
    } else {
      toast.info("Nenhuma avaliação 4★+ encontrada");
    }
  };

  return (
    <Card title="Depoimentos">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={importReviews}><Star className="h-4 w-4 mr-1" /> Importar do Google Reviews</Button>
      </div>
      <div className="space-y-2">
        {config.depoimentos.map(d => (
          <div key={d.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <div className="flex-1">
              <div className="text-sm font-medium">{d.nome}</div>
              <div className="text-xs text-muted-foreground mt-1">{d.texto}</div>
              <div className="text-xs text-yellow-500 mt-1">{"★".repeat(d.rating)}</div>
            </div>
            <button onClick={() => removeDepo(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
          </div>
        ))}
      </div>
      {config.depoimentos.length < 6 && (
        <div className="space-y-3 border-t border-border pt-4">
          <Input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Nome do cliente" />
          <Textarea value={form.texto} onChange={e => setForm(p => ({ ...p, texto: e.target.value }))} placeholder="O que disse sobre seu negócio?" rows={2} />
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setForm(p => ({ ...p, rating: n }))} className={`text-lg ${n <= form.rating ? 'text-yellow-500' : 'text-muted-foreground'}`}>★</button>
            ))}
          </div>
          <Button size="sm" onClick={addDepo}><Plus className="h-4 w-4 mr-1" /> Adicionar depoimento</Button>
        </div>
      )}
    </Card>
  );
}

function TabDominio({ website, saveWebsite }: { website: any; saveWebsite: any }) {
  const [newSlug, setNewSlug] = useState(website.slug);
  const [domain, setDomain] = useState(website.custom_domain || '');

  const updateSlug = async () => {
    await saveWebsite({ slug: newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-') } as any);
    toast.success("Endereço atualizado!");
  };

  return (
    <>
      <Card title="Subdomínio LocalAI">
        <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg space-y-3">
          <p className="text-sm">Seu site está disponível em:</p>
          <p className="text-lg font-mono font-medium">{window.location.origin}/site/{website.slug}</p>
          {website.published && <span className="text-xs text-green-600">✓ Ativo</span>}
        </div>
        <Field label="Editar endereço" hint="Alterar o endereço pode quebrar links existentes">
          <div className="flex gap-2">
            <Input value={newSlug} onChange={e => setNewSlug(e.target.value)} />
            <Button size="sm" onClick={updateSlug}>Atualizar</Button>
          </div>
        </Field>
      </Card>
      <Card title="Domínio próprio ✨">
        <p className="text-sm text-muted-foreground">Configure seu domínio para apontar para o seu site.</p>
        <Field label="Seu domínio"><Input value={domain} onChange={e => setDomain(e.target.value)} placeholder="www.seudominio.com.br" /></Field>
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <p className="text-xs font-medium">Configure o DNS:</p>
          <div className="font-mono text-xs space-y-1">
            <p>Tipo: <strong>CNAME</strong></p>
            <p>Nome: <strong>www</strong></p>
            <p>Valor: <strong>sites.localai.app</strong></p>
            <p>TTL: <strong>3600</strong></p>
          </div>
        </div>
        <Button size="sm" onClick={async () => {
          await saveWebsite({ custom_domain: domain } as any);
          toast.success("Domínio salvo!");
        }}>Salvar domínio</Button>
      </Card>
    </>
  );
}

function TabAnalytics({ website }: { website: any }) {
  return (
    <Card title="Analytics">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-heading font-bold">{website.total_visitas || 0}</div>
          <div className="text-xs text-muted-foreground">Total de visitas</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-heading font-bold">{website.visitas_semana || 0}</div>
          <div className="text-xs text-muted-foreground">Esta semana</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-heading font-bold">—</div>
          <div className="text-xs text-muted-foreground">Hoje</div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center">Analytics avançado disponível em breve</p>
    </Card>
  );
}
