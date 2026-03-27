import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const NICHOS = [
  "Restaurante / Alimentação",
  "Salão de Beleza / Estética",
  "Clínica / Saúde",
  "Academia / Fitness",
  "Advocacia / Jurídico",
  "Contabilidade",
  "Imobiliária",
  "Oficina / Automotivo",
  "Pet Shop / Veterinário",
  "Farmácia",
  "Supermercado / Mercado",
  "Loja de Roupas / Moda",
  "Tecnologia / TI",
  "Educação / Cursos",
  "Outros",
];

const TOM_OPTIONS = [
  "Descontraído e próximo",
  "Profissional e formal",
  "Divertido e criativo",
  "Técnico e especializado",
  "Empático e acolhedor",
  "Direto e objetivo",
];

const ESTADOS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

type PageState = "loading" | "select-location" | "form" | "no-gmb" | "manual-gmb";

interface GmbLocation {
  name: string;
  title: string;
  address: string;
  phone: string;
  website: string;
  accountName: string;
}

export default function BusinessInfo() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [saving, setSaving] = useState(false);
  const [bizId, setBizId] = useState<string | null>(null);
  const [gmbLocations, setGmbLocations] = useState<GmbLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GmbLocation | null>(null);
  const [manualGmbId, setManualGmbId] = useState("");

  const [nome, setNome] = useState("");
  const [nicho, setNicho] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tom, setTom] = useState("");
  const [publicoAlvo, setPublicoAlvo] = useState("");
  const [diferenciais, setDiferenciais] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check existing business
      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (biz) {
        setBizId(biz.id);
        setNome(biz.nome || "");
        setNicho(biz.nicho || "");
        setCidade(biz.cidade || "");
        setEstado(biz.estado || "");
        setWhatsapp(biz.whatsapp || "");
        setWebsite(biz.website_url || "");
        setInstagram(biz.instagram || "");
        setTom(biz.tom_de_voz || "");
        setPublicoAlvo(biz.publico_alvo || "");
        setDiferenciais(biz.diferenciais || "");
        setPageState("form");
        return;
      }

      // Check if has OAuth token → try to list GMB locations
      const { data: tokens } = await supabase
        .from("oauth_tokens")
        .select("id")
        .eq("user_id", user.id)
        .eq("provider", "google")
        .limit(1);

      if (tokens && tokens.length > 0) {
        try {
          const { data, error } = await supabase.functions.invoke("gmb-list-locations");
          if (!error && data?.accounts) {
            const allLocations: GmbLocation[] = [];
            for (const account of data.accounts) {
              for (const loc of account.locations || []) {
                allLocations.push({
                  ...loc,
                  accountName: account.accountName,
                });
              }
            }
            if (allLocations.length > 0) {
              setGmbLocations(allLocations);
              setPageState("select-location");
              return;
            }
          }
        } catch (e) {
          console.warn("Failed to fetch GMB locations:", e);
        }
      }

      setPageState("no-gmb");
    };
    load();
  }, []);

  const handleSelectLocation = (loc: GmbLocation) => {
    setSelectedLocation(loc);
    setNome(loc.title || "");
    setWhatsapp(loc.phone || "");
    setWebsite(loc.website || "");

    // Parse address for city/state
    if (loc.address) {
      const parts = loc.address.split(",").map((s) => s.trim());
      if (parts.length >= 2) {
        setCidade(parts[parts.length - 2] || "");
        const uf = parts[parts.length - 1]?.toUpperCase();
        if (ESTADOS.includes(uf)) setEstado(uf);
      }
    }

    setPageState("form");
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      toast({ title: "Nome do negócio é obrigatório", variant: "destructive" });
      return;
    }
    if (!nicho) {
      toast({ title: "Selecione o segmento do negócio", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const payload = {
        user_id: user.id,
        nome: nome.trim(),
        nicho,
        cidade: cidade.trim(),
        estado,
        whatsapp: whatsapp.trim(),
        website_url: website.trim(),
        instagram: instagram.trim(),
        tom_de_voz: tom,
        publico_alvo: publicoAlvo.trim(),
        diferenciais: diferenciais.trim(),
        gmb_location_id: selectedLocation?.name ?? null,
      };

      if (bizId) {
        const { error } = await supabase.from("businesses").update(payload).eq("id", bizId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("businesses").insert(payload);
        if (error) throw error;
      }

      toast({ title: "Negócio salvo com sucesso!" });
      navigate("/onboarding/materials");
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao salvar", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (pageState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Buscando seus negócios no Google...</p>
      </div>
    );
  }

  if (pageState === "select-location") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Selecione o negócio</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Encontramos {gmbLocations.length} local(is) na sua conta Google. Selecione o que deseja gerenciar.
          </p>
        </div>

        <div className="grid gap-3">
          {gmbLocations.map((loc, i) => (
            <motion.button
              key={loc.name || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelectLocation(loc)}
              className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left w-full"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{loc.title}</p>
                {loc.address && (
                  <p className="text-sm text-muted-foreground">{loc.address}</p>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        <button
          onClick={() => setPageState("no-gmb")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cadastrar manualmente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Dados do Negócio</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Essas informações são usadas para personalizar seus posts e respostas com IA.
        </p>
      </div>

      {selectedLocation && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <span className="text-sm text-foreground">
            Preenchido com dados de <strong>{selectedLocation.title}</strong>
          </span>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome do negócio <span className="text-destructive">*</span></Label>
          <Input id="nome" placeholder="Ex: Salão da Maria" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Segmento <span className="text-destructive">*</span></Label>
          <Select value={nicho} onValueChange={setNicho}>
            <SelectTrigger><SelectValue placeholder="Selecione o segmento" /></SelectTrigger>
            <SelectContent>
              {NICHOS.map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" placeholder="Ex: São Paulo" value={cidade} onChange={(e) => setCidade(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
              <SelectContent>
                {ESTADOS.map((uf) => (<SelectItem key={uf} value={uf}>{uf}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" placeholder="(51) 99999-9999" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input id="website" placeholder="https://..." value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" placeholder="@seuperfil" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Tom de voz da IA</Label>
          <Select value={tom} onValueChange={setTom}>
            <SelectTrigger><SelectValue placeholder="Como a IA deve escrever?" /></SelectTrigger>
            <SelectContent>
              {TOM_OPTIONS.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="publico">Público-alvo</Label>
          <Input id="publico" placeholder="Ex: Mulheres entre 25-45 anos, classe B/C" value={publicoAlvo} onChange={(e) => setPublicoAlvo(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="diferenciais">Diferenciais do negócio</Label>
          <Textarea
            id="diferenciais"
            placeholder="O que torna seu negócio especial? Ex: atendimento personalizado, 10 anos de experiência..."
            value={diferenciais}
            onChange={(e) => setDiferenciais(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
        ) : (
          "Salvar e continuar"
        )}
      </Button>
    </div>
  );
}
