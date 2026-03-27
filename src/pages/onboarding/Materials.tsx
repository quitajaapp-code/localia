import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, CheckCircle2, ImageIcon, Palette } from "lucide-react";

export default function MaterialsOnboarding() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bizId, setBizId] = useState<string | null>(null);

  // Logo
  const [logoUrl, setLogoUrl] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  // Cores
  const [corPrimaria, setCorPrimaria] = useState("#1A6DFF");
  const [corSecundaria, setCorSecundaria] = useState("#0A4FCC");

  // Conteúdo extra
  const [produtos, setProdutos] = useState("");
  const [promocoes, setPromocoes] = useState("");
  const [depoimentos, setDepoimentos] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: biz } = await supabase
        .from("businesses")
        .select("id, logo_url, cor_primaria, cor_secundaria, produtos, promocoes, depoimentos")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (biz) {
        setBizId(biz.id);
        setLogoUrl(biz.logo_url || "");
        setCorPrimaria(biz.cor_primaria || "#1A6DFF");
        setCorSecundaria(biz.cor_secundaria || "#0A4FCC");
        setProdutos(biz.produtos || "");
        setPromocoes(biz.promocoes || "");
        setDepoimentos(biz.depoimentos || "");
      }

      setLoading(false);
    };
    load();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !bizId) return;

    setLogoUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `logos/${bizId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("business-assets")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("business-assets")
        .getPublicUrl(path);

      setLogoUrl(publicUrl);
      await supabase.from("businesses").update({ logo_url: publicUrl }).eq("id", bizId);
      toast({ title: "Logo enviada com sucesso!" });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao enviar logo", variant: "destructive" });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSave = async () => {
    if (!bizId) {
      toast({
        title: "Dados do negócio não encontrados",
        description: "Volte e preencha os dados do negócio primeiro.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          cor_primaria: corPrimaria,
          cor_secundaria: corSecundaria,
          produtos: produtos.trim(),
          promocoes: promocoes.trim(),
          depoimentos: depoimentos.trim(),
        })
        .eq("id", bizId);

      if (error) throw error;

      toast({ title: "Tudo certo! Bem-vindo ao LocalAI 🎉" });
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao salvar", variant: "destructive" });
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
        <h2 className="text-xl font-semibold text-foreground">Materiais de Marca</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Opcional, mas ajuda a IA a criar conteúdo muito mais alinhado com seu negócio.
        </p>
      </div>

      {/* Logo */}
      <div className="space-y-2">
        <Label>Logo do negócio</Label>
        <div
          className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-primary transition-colors"
          onClick={() => logoRef.current?.click()}
        >
          {logoUrl ? (
            <>
              <img src={logoUrl} alt="Logo" className="h-16 object-contain" />
              <div className="flex items-center gap-1.5 text-sm text-success">
                <CheckCircle2 className="w-4 h-4" />
                Logo enviada — clique para trocar
              </div>
            </>
          ) : (
            <>
              {logoUploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              ) : (
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              )}
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {logoUploading ? "Enviando..." : "Clique para fazer upload"}
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG ou SVG — máx. 2MB</p>
              </div>
            </>
          )}
        </div>
        <input
          ref={logoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoUpload}
        />
      </div>

      {/* Cores */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <Palette className="w-4 h-4" /> Cores da marca
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="cor-primaria" className="text-xs text-muted-foreground">
              Cor primária
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="cor-primaria"
                value={corPrimaria}
                onChange={(e) => setCorPrimaria(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-border"
              />
              <Input
                value={corPrimaria}
                onChange={(e) => setCorPrimaria(e.target.value)}
                className="font-mono text-sm"
                maxLength={7}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cor-secundaria" className="text-xs text-muted-foreground">
              Cor secundária
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="cor-secundaria"
                value={corSecundaria}
                onChange={(e) => setCorSecundaria(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-border"
              />
              <Input
                value={corSecundaria}
                onChange={(e) => setCorSecundaria(e.target.value)}
                className="font-mono text-sm"
                maxLength={7}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Produtos/Serviços */}
      <div className="space-y-1.5">
        <Label htmlFor="produtos">Principais produtos ou serviços</Label>
        <Textarea
          id="produtos"
          placeholder="Ex: Corte feminino, coloração, manicure, pedicure, sobrancelha..."
          value={produtos}
          onChange={(e) => setProdutos(e.target.value)}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          A IA vai mencionar esses itens nos posts e respostas.
        </p>
      </div>

      {/* Promoções */}
      <div className="space-y-1.5">
        <Label htmlFor="promocoes">Promoções ou ofertas atuais</Label>
        <Textarea
          id="promocoes"
          placeholder="Ex: 20% off na primeira visita, combo corte + barba por R$60..."
          value={promocoes}
          onChange={(e) => setPromocoes(e.target.value)}
          rows={2}
        />
      </div>

      {/* Depoimentos */}
      <div className="space-y-1.5">
        <Label htmlFor="depoimentos">Depoimentos de clientes (opcional)</Label>
        <Textarea
          id="depoimentos"
          placeholder="Cole aqui depoimentos reais de clientes satisfeitos..."
          value={depoimentos}
          onChange={(e) => setDepoimentos(e.target.value)}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Usados para enriquecer posts e credibilidade.
        </p>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
        ) : (
          "Concluir configuração"
        )}
      </Button>

      <button
        onClick={() => navigate("/dashboard")}
        className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
      >
        Pular por agora
      </button>
    </div>
  );
}
