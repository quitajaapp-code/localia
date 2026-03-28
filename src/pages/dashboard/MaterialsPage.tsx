import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, X, Image, Video, Globe, MessageSquare, Sparkles, Save,
  Palette, Camera, Info, Award, Users, Brain, CheckCircle, ExternalLink, Loader2
} from "lucide-react";
import AiSuggestButton from "@/components/shared/AiSuggestButton";

const TOM_OPTIONS = [
  "Descontraído e próximo", "Profissional e formal", "Divertido e criativo",
  "Técnico e especializado", "Empático e acolhedor", "Direto e objetivo",
];

const FOTO_CATEGORIAS = ["Fachada", "Interior", "Produto/Serviço", "Equipe"];

type BizData = {
  id: string;
  tom_de_voz: string;
  website_url: string;
  whatsapp: string;
  logo_url: string;
  cor_primaria: string;
  cor_secundaria: string;
  video_url: string;
  diferenciais: string;
  promocoes: string;
  faq: string;
  produtos: string;
  instagram: string;
  outras_redes: string;
  depoimentos: string;
  premios: string;
  num_clientes: string;
  anos_experiencia: string;
  ia_sempre_mencionar: string;
  ia_nunca_mencionar: string;
  publico_alvo: string;
};

const EMPTY: BizData = {
  id: "", tom_de_voz: "", website_url: "", whatsapp: "", logo_url: "",
  cor_primaria: "#4F46E5", cor_secundaria: "#06B6D4", video_url: "",
  diferenciais: "", promocoes: "", faq: "", produtos: "",
  instagram: "", outras_redes: "", depoimentos: "", premios: "",
  num_clientes: "", anos_experiencia: "", ia_sempre_mencionar: "",
  ia_nunca_mencionar: "", publico_alvo: "",
};

type PhotoItem = { id: string; url: string; nome: string };

function ScoreGauge({ score }: { score: number }) {
  const color = score <= 40 ? "hsl(var(--destructive))" : score <= 70 ? "hsl(var(--warning))" : "hsl(var(--success))";
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const status = score <= 40
    ? "Configuração básica — a IA tem poucos recursos para trabalhar"
    : score <= 70
    ? "Bom começo! Adicione mais para turbinar seus resultados"
    : "Excelente! Sua campanha está com máxima eficiência";

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
        <motion.circle
          cx="90" cy="90" r={radius} fill="none" stroke={color} strokeWidth="12"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          transform="rotate(-90 90 90)"
        />
        <text x="90" y="85" textAnchor="middle" className="fill-foreground" fontSize="36" fontWeight="bold">{score}</text>
        <text x="90" y="108" textAnchor="middle" className="fill-muted-foreground" fontSize="14">/100</text>
      </svg>
      <p className="text-sm text-muted-foreground text-center max-w-xs mt-2">{status}</p>
    </div>
  );
}

function SectionCard({ title, icon: Icon, filled, total, children }: {
  title: string; icon: React.ElementType; filled: number; total: number; children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Badge variant={filled >= total ? "default" : "secondary"} className="text-xs">
            {filled}/{total}
          </Badge>
        </div>
        <Progress value={(filled / total) * 100} className="h-1.5 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export default function MaterialsPage() {
  usePageTitle("Materiais");
  const [data, setData] = useState<BizData>(EMPTY);
  const [bizNome, setBizNome] = useState("");
  const [bizNicho, setBizNicho] = useState("");
  const [bizCidade, setBizCidade] = useState("");
  const [bizEstado, setBizEstado] = useState("");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const initialRef = useRef<BizData>(EMPTY);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (biz) {
        setBizNome(biz.nome || "");
        setBizNicho(biz.nicho || "");
        setBizCidade(biz.cidade || "");
        setBizEstado(biz.estado || "");
        const mapped: BizData = {
          id: biz.id,
          tom_de_voz: biz.tom_de_voz || "",
          website_url: biz.website_url || "",
          whatsapp: biz.whatsapp || "",
          logo_url: (biz as any).logo_url || "",
          cor_primaria: (biz as any).cor_primaria || "#4F46E5",
          cor_secundaria: (biz as any).cor_secundaria || "#06B6D4",
          video_url: (biz as any).video_url || "",
          diferenciais: (biz as any).diferenciais || "",
          promocoes: (biz as any).promocoes || "",
          faq: (biz as any).faq || "",
          produtos: (biz as any).produtos || "",
          instagram: (biz as any).instagram || "",
          outras_redes: (biz as any).outras_redes || "",
          depoimentos: (biz as any).depoimentos || "",
          premios: (biz as any).premios || "",
          num_clientes: (biz as any).num_clientes || "",
          anos_experiencia: (biz as any).anos_experiencia || "",
          ia_sempre_mencionar: (biz as any).ia_sempre_mencionar || "",
          ia_nunca_mencionar: (biz as any).ia_nunca_mencionar || "",
          publico_alvo: (biz as any).publico_alvo || "",
        };
        setData(mapped);
        initialRef.current = mapped;

        // Load photos
        const { data: mats } = await supabase
          .from("materials")
          .select("*")
          .eq("business_id", biz.id)
          .eq("tipo", "foto");
        if (mats) setPhotos(mats.map(m => ({ id: m.id, url: m.url || "", nome: m.nome || "" })));
      }
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  };

  const update = useCallback((field: keyof BizData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    setDirty(true);
  }, []);

  const score = useMemo(() => {
    let s = 0;
    // 1. Identity (15)
    if (data.logo_url) s += 5;
    if (data.cor_primaria && data.cor_primaria !== "#4F46E5") s += 3;
    if (data.cor_secundaria && data.cor_secundaria !== "#06B6D4") s += 2;
    if (data.tom_de_voz) s += 5;
    // 2. Photos (20)
    s += Math.min(20, photos.length * 4);
    // 3. Video (20)
    if (data.video_url) s += 20;
    // 4. Business info (10)
    if (data.diferenciais) s += 2.5;
    if (data.promocoes) s += 2.5;
    if (data.faq) s += 2.5;
    if (data.produtos) s += 2.5;
    // 5. Digital presence (15)
    if (data.website_url) s += 5;
    if (data.whatsapp) s += 5;
    if (data.instagram) s += 3;
    if (data.outras_redes) s += 2;
    // 6. Social proof (10)
    if (data.depoimentos) s += 4;
    if (data.premios) s += 2;
    if (data.num_clientes) s += 2;
    if (data.anos_experiencia) s += 2;
    // 7. AI context (10)
    if (data.ia_sempre_mencionar) s += 4;
    if (data.ia_nunca_mencionar) s += 3;
    if (data.publico_alvo) s += 3;
    return Math.round(Math.min(100, s));
  }, [data, photos]);

  const aiContext = useMemo(() => ({
    nome: bizNome, nicho: bizNicho, cidade: bizCidade, estado: bizEstado,
    publico_alvo: data.publico_alvo, diferenciais: data.diferenciais,
    tom_de_voz: data.tom_de_voz, produtos: data.produtos,
  }), [bizNome, bizNicho, bizCidade, bizEstado, data.publico_alvo, data.diferenciais, data.tom_de_voz, data.produtos]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, ...rest } = data;
      await supabase.from("businesses").update(rest as any).eq("id", id);
      await supabase.from("businesses").update({ score_materiais: score }).eq("id", id);
      initialRef.current = data;
      setDirty(false);
      toast.success("Materiais salvos com sucesso!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar");
    } finally { setSaving(false); }
  };

  const uploadPhotos = async (files: FileList) => {
    if (!data.id) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (photos.length >= 20) break;
        const ext = file.name.split(".").pop();
        const path = `${data.id}/fotos/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("business-assets").upload(path, file);
        if (upErr) { toast.error(`Erro no upload: ${file.name}`); continue; }
        const { data: urlData } = supabase.storage.from("business-assets").getPublicUrl(path);
        const { data: mat } = await supabase.from("materials").insert({
          business_id: data.id, tipo: "foto", nome: file.name, url: urlData.publicUrl, status: "ativo",
        }).select().single();
        if (mat) setPhotos(prev => [...prev, { id: mat.id, url: mat.url || "", nome: mat.nome || "" }]);
      }
      toast.success("Fotos enviadas!");
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  const removePhoto = async (photoId: string) => {
    await supabase.from("materials").delete().eq("id", photoId);
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    toast.success("Foto removida");
  };

  const uploadLogo = async (file: File) => {
    if (!data.id) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${data.id}/logo.${ext}`;
      await supabase.storage.from("business-assets").upload(path, file, { upsert: true });
      const { data: urlData } = supabase.storage.from("business-assets").getPublicUrl(path);
      update("logo_url", urlData.publicUrl);
      toast.success("Logo enviado!");
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  // Section fill counts
  const s1Filled = [data.logo_url, data.cor_primaria !== "#4F46E5" ? data.cor_primaria : "", data.cor_secundaria !== "#06B6D4" ? data.cor_secundaria : "", data.tom_de_voz].filter(Boolean).length;
  const s2Filled = Math.min(5, photos.length);
  const s3Filled = data.video_url ? 1 : 0;
  const s4Filled = [data.diferenciais, data.promocoes, data.faq, data.produtos].filter(Boolean).length;
  const s5Filled = [data.website_url, data.whatsapp, data.instagram, data.outras_redes].filter(Boolean).length;
  const s6Filled = [data.depoimentos, data.premios, data.num_clientes, data.anos_experiencia].filter(Boolean).length;
  const s7Filled = [data.ia_sempre_mencionar, data.ia_nunca_mencionar, data.publico_alvo].filter(Boolean).length;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Materiais</h1>

      {/* Score */}
      <Card className="mb-8">
        <CardContent className="py-8 flex flex-col items-center">
          <ScoreGauge score={score} />
        </CardContent>
      </Card>

      <div className="space-y-6">
        {/* 1. Identidade Visual */}
        <SectionCard title="Identidade Visual" icon={Palette} filled={s1Filled} total={4}>
          <div>
            <Label className="text-sm font-medium mb-2 block">Logo</Label>
            {data.logo_url ? (
              <div className="flex items-center gap-4">
                <img src={data.logo_url} alt="Logo" className="h-16 w-16 rounded-lg object-contain border bg-card" />
                <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>Trocar</Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => logoInputRef.current?.click()} disabled={uploading}>
                <Upload className="h-4 w-4 mr-2" /> Enviar logo
              </Button>
            )}
            <input ref={logoInputRef} type="file" accept="image/png,image/svg+xml,image/jpeg" className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-1 block">Cor primária</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={data.cor_primaria} onChange={(e) => update("cor_primaria", e.target.value)}
                  className="h-10 w-10 rounded cursor-pointer border-0" />
                <Input value={data.cor_primaria} onChange={(e) => update("cor_primaria", e.target.value)} className="font-mono text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-sm mb-1 block">Cor secundária</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={data.cor_secundaria} onChange={(e) => update("cor_secundaria", e.target.value)}
                  className="h-10 w-10 rounded cursor-pointer border-0" />
                <Input value={data.cor_secundaria} onChange={(e) => update("cor_secundaria", e.target.value)} className="font-mono text-sm" />
              </div>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-1 block">Tom de voz</Label>
            <Select value={data.tom_de_voz} onValueChange={(v) => update("tom_de_voz", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {TOM_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </SectionCard>

        {/* 2. Fotos */}
        <SectionCard title="Fotos do Negócio" icon={Camera} filled={s2Filled} total={5}>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm flex items-start gap-2">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>Fotos de qualidade aumentam em <strong>35% os cliques</strong> no seu perfil do Google. Envie pelo menos 5 fotos.</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {FOTO_CATEGORIAS.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
          </div>
          {photos.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {photos.map((p) => (
                <div key={p.id} className="relative group aspect-square rounded-lg overflow-hidden border">
                  <img src={p.url} alt={p.nome} className="w-full h-full object-cover" />
                  <button onClick={() => removePhoto(p.id)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive/80 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading || photos.length >= 20}>
            {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {photos.length >= 20 ? "Limite atingido (20)" : "Enviar fotos"}
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => e.target.files && uploadPhotos(e.target.files)} />
          <p className="text-xs text-muted-foreground">{photos.length}/20 fotos enviadas</p>
        </SectionCard>

        {/* 3. Vídeo */}
        <SectionCard title="Vídeo" icon={Video} filled={s3Filled} total={1}>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm flex items-start gap-2">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>Vídeo habilita campanhas Performance Max, que têm <strong>30% mais conversão</strong>.</span>
          </div>
          <div>
            <Label className="text-sm mb-1 block">Link do vídeo (YouTube, Drive ou URL direta)</Label>
            <Input value={data.video_url} onChange={(e) => update("video_url", e.target.value)}
              placeholder="https://youtube.com/watch?v=..." />
          </div>
        </SectionCard>

        {/* 4. Informações */}
        <SectionCard title="Informações do Negócio" icon={Info} filled={s4Filled} total={4}>
          {([
            ["diferenciais", "Diferenciais vs. concorrentes", "O que te diferencia? Ex: 10 anos de experiência, atendimento 24h..."],
            ["promocoes", "Promoções ou destaques atuais", "Ofertas, combos, lançamentos..."],
            ["faq", "Perguntas frequentes dos clientes", "Quais dúvidas seus clientes mais têm?"],
            ["produtos", "Produtos/serviços principais com preço", "Liste seus serviços e valores aproximados"],
          ] as const).map(([field, label, placeholder]) => (
            <div key={field}>
              <Label className="text-sm mb-1 block">{label}</Label>
              <Textarea value={data[field]} onChange={(e) => update(field, e.target.value)}
                placeholder={placeholder} rows={3} />
            </div>
          ))}
        </SectionCard>

        {/* 5. Presença Digital */}
        <SectionCard title="Presença Digital" icon={Globe} filled={s5Filled} total={4}>
          <div>
            <Label className="text-sm mb-1 block">Website</Label>
            <div className="flex gap-2">
              <Input value={data.website_url} onChange={(e) => update("website_url", e.target.value)}
                placeholder="https://seusite.com.br" className="flex-1" />
              {data.website_url && (
                <Button variant="outline" size="icon" asChild>
                  <a href={data.website_url} target="_blank" rel="noopener"><ExternalLink className="h-4 w-4" /></a>
                </Button>
              )}
            </div>
          </div>
          <div>
            <Label className="text-sm mb-1 block">WhatsApp</Label>
            <Input value={data.whatsapp} onChange={(e) => update("whatsapp", e.target.value)}
              placeholder="(11) 99999-9999" />
          </div>
          <div>
            <Label className="text-sm mb-1 block">Instagram</Label>
            <Input value={data.instagram} onChange={(e) => update("instagram", e.target.value)}
              placeholder="@seunegocio" />
          </div>
          <div>
            <Label className="text-sm mb-1 block">Outras redes sociais</Label>
            <Input value={data.outras_redes} onChange={(e) => update("outras_redes", e.target.value)}
              placeholder="Facebook, TikTok, LinkedIn..." />
          </div>
        </SectionCard>

        {/* 6. Prova Social */}
        <SectionCard title="Prova Social" icon={Award} filled={s6Filled} total={4}>
          <div>
            <Label className="text-sm mb-1 block">Depoimentos de clientes (um por linha)</Label>
            <Textarea value={data.depoimentos} onChange={(e) => update("depoimentos", e.target.value)}
              placeholder={'"Melhor atendimento da cidade!" — Maria\n"Recomendo muito!" — João'} rows={4} />
          </div>
          <div>
            <Label className="text-sm mb-1 block">Prêmios ou certificações</Label>
            <Input value={data.premios} onChange={(e) => update("premios", e.target.value)}
              placeholder="ISO 9001, Prêmio destaque 2024..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-1 block">Clientes/mês</Label>
              <Input value={data.num_clientes} onChange={(e) => update("num_clientes", e.target.value)}
                placeholder="500" />
            </div>
            <div>
              <Label className="text-sm mb-1 block">Anos de experiência</Label>
              <Input value={data.anos_experiencia} onChange={(e) => update("anos_experiencia", e.target.value)}
                placeholder="10" />
            </div>
          </div>
        </SectionCard>

        {/* 7. Contexto IA */}
        <SectionCard title="Contexto para IA" icon={Brain} filled={s7Filled} total={3}>
          <div>
            <Label className="text-sm mb-1 block">O que a IA deve <strong>sempre</strong> mencionar nos posts?</Label>
            <Textarea value={data.ia_sempre_mencionar} onChange={(e) => update("ia_sempre_mencionar", e.target.value)}
              placeholder="Ex: Estacionamento gratuito, aceita cartão, delivery..." rows={3} />
          </div>
          <div>
            <Label className="text-sm mb-1 block">O que a IA <strong>nunca</strong> deve mencionar?</Label>
            <Textarea value={data.ia_nunca_mencionar} onChange={(e) => update("ia_nunca_mencionar", e.target.value)}
              placeholder="Ex: Preços específicos, nome de concorrentes..." rows={3} />
          </div>
          <div>
            <Label className="text-sm mb-1 block">Público-alvo ideal</Label>
            <Textarea value={data.publico_alvo} onChange={(e) => update("publico_alvo", e.target.value)}
              placeholder="Idade, perfil, motivação principal..." rows={2} />
          </div>
        </SectionCard>
      </div>

      {/* Floating save */}
      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <Button size="lg" onClick={handleSave} disabled={saving} className="shadow-lg px-8">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar alterações
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
