import { useState, useEffect, useCallback, useRef } from "react";
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
  const [debugInfo, setDebugInfo] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const handledRef = useRef(false);

  const saveProviderToken = useCallback(async (
    userId: string,
    email: string,
    providerToken: string,
    providerRefreshToken: string | null,
  ) => {
    try {
      console.log("[GMB] Saving provider token for user", userId);
      setDebugInfo(prev => prev + "\nSalvando token...");

      const { data: existingTokens } = await supabase
        .from("oauth_tokens")
        .select("id")
        .eq("user_id", userId)
        .eq("provider", "google")
        .order("created_at", { ascending: false });

      const payload = {
        user_id: userId,
        provider: "google" as const,
        access_token: providerToken,
        refresh_token: providerRefreshToken,
        scope: "business.manage",
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      };

      let error: unknown = null;
      if (existingTokens && existingTokens.length > 0) {
        const res = await supabase
          .from("oauth_tokens")
          .update(payload)
          .eq("id", existingTokens[0].id);
        error = res.error;
      } else {
        const res = await supabase.from("oauth_tokens").insert(payload);
        error = res.error;
      }

      if (error) {
        console.error("[GMB] DB error:", error);
        setDebugInfo(prev => prev + `\nErro DB: ${JSON.stringify(error)}`);
        throw error;
      }

      console.log("[GMB] Token saved successfully");
      setDebugInfo(prev => prev + "\nToken salvo com sucesso!");
      setConnectedEmail(email);
      setStatus("connected");
      toast({ title: "Google conectado com sucesso!" });

      window.history.replaceState({}, "", "/onboarding/connect");
      setTimeout(() => navigate("/onboarding/business"), 800);
    } catch (err) {
      console.error("[GMB] Save error:", err);
      setStatus("error");
      toast({ title: "Erro ao salvar token", variant: "destructive" });
    }
  }, [navigate, toast]);

  // Main effect: listen for auth state changes to capture provider_token
  useEffect(() => {
    let mounted = true;

    // 1. Check if already connected
    const checkExisting = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;

      const { data: tokens } = await supabase
        .from("oauth_tokens")
        .select("id, scope")
        .eq("user_id", user.id)
        .eq("provider", "google")
        .order("created_at", { ascending: false })
        .limit(1);

      if (tokens && tokens.length > 0 && mounted) {
        setConnectedEmail(user.email || "");
        setStatus("connected");
      }
    };

    checkExisting();

    // 2. Listen for SIGNED_IN event which carries provider_token in PKCE flow
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || handledRef.current) return;

      console.log("[GMB] Auth event:", event, "provider_token:", session?.provider_token ? "YES" : "NO");

      if (event === "SIGNED_IN" && session?.provider_token) {
        handledRef.current = true;
        setDebugInfo(`Evento: ${event}, Token: presente`);
        await saveProviderToken(
          session.user.id,
          session.user.email || "",
          session.provider_token,
          session.provider_refresh_token || null,
        );
      }
    });

    // 3. Also check current session immediately (in case event already fired)
    const checkSession = async () => {
      if (handledRef.current) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !mounted || handledRef.current) return;

      // Check URL for OAuth return indicators
      const hash = window.location.hash;
      const search = window.location.search;
      const isOAuthReturn = hash.includes("access_token") || hash.includes("provider_token") || search.includes("code=");

      if (isOAuthReturn && session.provider_token) {
        handledRef.current = true;
        setDebugInfo(`Session check: Token presente`);
        await saveProviderToken(
          session.user.id,
          session.user.email || "",
          session.provider_token,
          session.provider_refresh_token || null,
        );
      } else if (isOAuthReturn && !session.provider_token) {
        console.log("[GMB] OAuth return detected but no provider_token in session");
        setDebugInfo("OAuth retornou mas sem provider_token. Verifique se os escopos do Google estão corretos no Supabase Dashboard.");
        // Don't set error immediately - the onAuthStateChange might fire later
        setTimeout(() => {
          if (!handledRef.current && mounted) {
            setStatus("error");
            toast({
              title: "Token do Google não recebido",
              description: "O Supabase não retornou o provider_token. Verifique a configuração do provider Google no Supabase Dashboard.",
              variant: "destructive",
            });
          }
        }, 3000);
      }
    };

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [saveProviderToken, toast]);

  const handleConnect = async () => {
    setStatus("connecting");
    setDebugInfo("Iniciando OAuth...");
    handledRef.current = false;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/onboarding/connect`,
        scopes: "https://www.googleapis.com/auth/business.manage",
        queryParams: {
          prompt: "consent",
          access_type: "offline",
          ...(gmbEmail ? { login_hint: gmbEmail } : {}),
        },
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      console.error("[GMB] OAuth start error:", error);
      setDebugInfo(`Erro ao iniciar: ${error.message}`);
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
                {debugInfo && (
                  <p className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">{debugInfo}</p>
                )}
              </div>
            </div>
            <Button onClick={() => { setStatus("idle"); setDebugInfo(""); }} variant="outline" size="sm">
              Tentar novamente
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug info (visible during connecting too) */}
      {debugInfo && status === "connecting" && (
        <p className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">{debugInfo}</p>
      )}

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
