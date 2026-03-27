import { useState, useEffect } from "react";
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

type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

const ConnectGoogle = () => {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [gmbEmail, setGmbEmail] = useState("");
  const [connectedEmail, setConnectedEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if already connected
  useEffect(() => {
    const checkExisting = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: token } = await supabase
        .from("oauth_tokens")
        .select("id, scope")
        .eq("user_id", user.id)
        .eq("provider", "google")
        .maybeSingle();

      if (token) {
        setConnectedEmail(user.user_metadata?.email || "");
        setStatus("connected");
      }
    };
    checkExisting();
  }, []);

  // Listen for OAuth callback return (from popup or redirect)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("provider_token=")) {
      handleOAuthReturn();
    }
  }, []);

  const handleOAuthReturn = async () => {
    setStatus("connecting");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus("error");
        return;
      }

      // Extract provider_token from the hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const providerToken = hashParams.get("provider_token");
      const providerRefreshToken = hashParams.get("refresh_token");

      if (providerToken) {
        // Save to oauth_tokens table
        const { error } = await supabase.from("oauth_tokens").upsert(
          {
            user_id: session.user.id,
            provider: "google",
            access_token: providerToken,
            refresh_token: providerRefreshToken || null,
            scope: "https://www.googleapis.com/auth/business.manage",
            expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
          },
          { onConflict: "user_id,provider" }
        );

        if (error) throw error;

        setConnectedEmail(session.user.email || "");
        setStatus("connected");
        toast({ title: "Google conectado com sucesso!" });

        // Clean hash from URL
        window.history.replaceState({}, "", "/onboarding/connect");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("GMB connect error:", err);
      setStatus("error");
      toast({ title: "Erro ao conectar conta Google", variant: "destructive" });
    }
  };

  const handleConnect = async () => {
    setStatus("connecting");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/onboarding/connect`,
        scopes: "openid email profile https://www.googleapis.com/auth/business.manage",
        queryParams: {
          prompt: "consent",
          access_type: "offline",
          ...(gmbEmail ? { login_hint: gmbEmail } : {}),
        },
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      setStatus("error");
      toast({ title: "Erro ao iniciar conexão", variant: "destructive" });
    }
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Conectar Google Meu Negócio
        </h2>
        <p className="text-muted-foreground mt-1">
          Conecte a conta Google que gerencia seu perfil comercial. Pode ser diferente da conta que você usou para fazer login.
        </p>
      </div>

      {/* Benefits */}
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

      {/* Connection area */}
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
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm text-foreground">
                Não foi possível conectar. Verifique se a conta tem acesso ao Google Meu Negócio e tente novamente.
              </p>
            </div>
            <Button onClick={() => setStatus("idle")} variant="outline" size="sm">
              Tentar novamente
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip option */}
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
