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
import { Loader2 } from "lucide-react";

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

export default function BusinessInfo() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bizId, setBizId] = useState<string | null>(null);

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

  // Carrega negócio existente se já tiver cadastrado
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
      }

      setLoading(false);
    };
    load();
  }, []);

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
      };

      if (bizId) {
        const { error } = await supabase
          .from("businesses")
          .update(payload)
          .eq("id", bizId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("businesses")
          .insert(payload);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
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

      <div className="space-y-4">
        {/* Nome */}
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome do negócio <span className="text-destructive">*</span></Label>
          <Input
            id="nome"
            placeholder="Ex: Salão da Maria"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        {/* Nicho */}
        <div className="space-y-1.5">
          <Label>Segmento <span className="text-destructive">*</span></Label>
          <Select value={nicho} onValueChange={setNicho}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o segmento" />
            </SelectTrigger>
            <SelectContent>
              {NICHOS.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cidade + Estado */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              placeholder="Ex: São Paulo"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger>
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS.map((uf) => (
                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            placeholder="(51) 99999-9999"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </div>

        {/* Website + Instagram */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              placeholder="https://..."
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              placeholder="@seuperfil"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
          </div>
        </div>

        {/* Tom de voz */}
        <div className="space-y-1.5">
          <Label>Tom de voz da IA</Label>
          <Select value={tom} onValueChange={setTom}>
            <SelectTrigger>
              <SelectValue placeholder="Como a IA deve escrever?" />
            </SelectTrigger>
            <SelectContent>
              {TOM_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Público-alvo */}
        <div className="space-y-1.5">
          <Label htmlFor="publico">Público-alvo</Label>
          <Input
            id="publico"
            placeholder="Ex: Mulheres entre 25-45 anos, classe B/C"
            value={publicoAlvo}
            onChange={(e) => setPublicoAlvo(e.target.value)}
          />
        </div>

        {/* Diferenciais */}
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
