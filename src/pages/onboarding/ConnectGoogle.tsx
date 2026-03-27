import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Star,
  MessageSquare,
  Chrome,
  AlertCircle,
  SkipForward,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

const ConnectGoogle = () => {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [gmbEmail, setGmbEmail] = useState("");
  const [connectedEmail, setConnectedEmail] = useState("");
  const [errorDetail, setErrorDetail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const checkedRef = useRef(false);

  // Check for OAuth callback params or existing connection
  useEffect(() => {
    if (!user || checkedRef.current) return;
    checkedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const gmbSuccess = params.get("gmb_success");
    const gmbError = params.get("gmb_error");
    const gmbEmailParam = params.get("gmb_email");

    if (gmbSuccess === "1") {
      setConnectedEmail(gmbEmailParam || "");
      setStatus("connected");
      toast({ title: "Google conectado com sucesso!" });
      window.history.replaceState({}, "", "/onboarding/connect");
      setTimeout(() => navigate("/onboarding/business"), 1200);
      return;
    }

    if (gmbError) {
      const errorMessages: Record<string, string> = {
        config: "Configuração do servidor incompleta. Contate o suporte.",
        missing_params: "Parâmetros de autorização ausentes.",
        invalid_state: "Estado de autenticação inválido. Tente novamente.",
        token_exchange: "Falha ao trocar código por token. Verifique as credenciais Google.",
        db_error: "Erro ao salvar token no banco de dados.",
        access_denied: "Acesso negado. Você precisa autorizar todos os escopos.",
        unknown: "Erro desconhecido. Tente novamente.",
      };
      setErrorDetail(errorMessages[gmbError] || `Erro: ${gmbError}`);
      setStatus("error");
      window.history.replaceState({}, "", "/onboarding/connect");
      return;
    }

    // Check if already connected
    const checkExisting = async () => {
      const { data: tokens } = await supabase
        .from("oauth_tokens")
        .select("id, google_email")
        .eq("user_id", user.id)
        .eq("provider", "google")
        .limit(1);

      if (tokens && tokens.length > 0) {
        setConnectedEmail((tokens[0] as any).google_email || user.email || "");
        setStatus("connected");
      }
    };
    checkExisting();
  }, [user, navigate, toast]);

  const handleConnect = async () => {
    setStatus("connecting");
    setErrorDetail("");

    if (!user) {
      setStatus("error");
      setErrorDetail("Usuário não autenticado.");
      return;
    }

    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!GOOGLE_CLIENT_ID) {
      setStatus("error");
      setErrorDetail("VITE_GOOGLE_CLIENT_ID não configurado.");
      return;
    }

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const redirectUri = `${SUPABASE_URL}/functions/v1/google-oauth-callback`;
    const state = btoa(JSON.stringify({ user_id: user.id }));

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/userinfo.email",
      access_type: "offline",
      prompt: "consent",
      state,
      ...(gmbEmail ? { login_hint: gmbEmail } : {}),
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const handleSkip = () => {
    navigate("/onboarding/business");
  };

  const benefits = [
    { icon: Star, text: "Sincronizar avaliações automaticamente" },
    { icon: MessageSquare, text: "Publicar posts no Google Meu Negócio" },
    { icon: MapPin, text: "Monitorar visibilidade na busca e Maps" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Conectar Google Meu Negócio
        </h2>
        <p className="text-muted-foreground mt-1">
          Conecte a conta Google que gerencia seu perfil comercial. Pode ser diferente da conta que você usou para fazer login.
        </p>
      </div>

      <div className="grid gap-3">
        {benefits.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <b.icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-foreground">{b.text}</span>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="gmb-email" className="text-sm">
                Email da conta Google com acesso ao GMB{" "}
                <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="gmb-email"
                type="email"
                placeholder="negocio@gmail.com"
                value={gmbEmail}
                onChange={(e) => setGmbEmail(e.target.value)}
                className="max-w-sm"
              />
              <p className="text-xs text-muted-foreground">
                Informar o email agiliza o login. Se não souber, deixe em branco.
              </p>
            </div>

            <Button onClick={handleConnect} className="gap-2" size="lg">
              <Chrome className="h-5 w-5" />
              Conectar conta Google
            </Button>
          </motion.div>
        )}

        {status === "connecting" && (
          <motion.div
            key="connecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border"
          >
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            <span className="text-sm text-foreground">
              Aguardando autorização do Google…
            </span>
          </motion.div>
        )}

        {status === "connected" && (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-3"
          >
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Conta Google conectada
              </p>
              {connectedEmail && (
                <p className="text-xs text-muted-foreground">{connectedEmail}</p>
              )}
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm text-foreground">
                  Não foi possível conectar. Verifique se a conta tem acesso ao Google Meu Negócio e tente novamente.
                </p>
                {errorDetail && (
                  <p className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">{errorDetail}</p>
                )}
              </div>
            </div>
            <Button onClick={() => { setStatus("idle"); setErrorDetail(""); checkedRef.current = false; }} variant="outline" size="sm">
              Tentar novamente
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {status !== "connected" && (
        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <SkipForward className="h-3.5 w-3.5" />
          Pular esta etapa (você pode conectar depois nas configurações)
        </button>
      )}
    </div>
  );
};

export default ConnectGoogle;
