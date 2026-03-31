import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Mail, Lock, User, Eye, EyeOff, Chrome, CheckCircle2, XCircle, Loader2, Phone } from "lucide-react";
import localaiLogo from "@/assets/localai-lockup-horizontal.png";
import localaiLogoBco from "@/assets/localai-lockup-horizontalbco.png";

function translateError(msg: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "Email ou senha incorretos.",
    "Email not confirmed": "Confirme seu email antes de fazer login.",
    "User already registered": "Este email já está cadastrado.",
    "Password should be at least 6 characters": "A senha deve ter pelo menos 8 caracteres.",
    "Signup requires a valid password": "Informe uma senha válida.",
    "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos.",
  };
  for (const [key, val] of Object.entries(map)) {
    if (msg.includes(key)) return val;
  }
  return msg;
}

type AuthPhase = "idle" | "verifying" | "authenticated" | "failed";
const OAUTH_INTENT_KEY = "localai_oauth_in_progress";
const OAUTH_INTENT_STARTED_AT_KEY = "localai_oauth_started_at";
const OAUTH_INTENT_MAX_AGE_MS = 10 * 60 * 1000;

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [authPhase, setAuthPhase] = useState<AuthPhase>("idle");
  const [authUserName, setAuthUserName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const clearOAuthIntent = () => {
    sessionStorage.removeItem(OAUTH_INTENT_KEY);
    sessionStorage.removeItem(OAUTH_INTENT_STARTED_AT_KEY);
  };

  const hasFreshOAuthIntent = () => {
    if (sessionStorage.getItem(OAUTH_INTENT_KEY) !== "1") return false;

    const startedAtRaw = sessionStorage.getItem(OAUTH_INTENT_STARTED_AT_KEY);
    if (!startedAtRaw) return true;

    const startedAt = Number(startedAtRaw);
    if (Number.isNaN(startedAt)) {
      clearOAuthIntent();
      return false;
    }

    const isFresh = Date.now() - startedAt <= OAUTH_INTENT_MAX_AGE_MS;
    if (!isFresh) clearOAuthIntent();
    return isFresh;
  };

  // Detect session only when returning from OAuth callback
  useEffect(() => {
    let fallbackTimer: number | undefined;

    const hasOAuthCallbackParams = () => {
      const hash = window.location.hash;
      const search = new URLSearchParams(window.location.search);
      return hash.includes("access_token=") || search.has("code");
    };

    const shouldProcessOAuth = () => hasOAuthCallbackParams() || hasFreshOAuthIntent();

    // If we land on /auth with OAuth params, show verifying state immediately
    if (shouldProcessOAuth()) {
      setAuthPhase("verifying");
      fallbackTimer = window.setTimeout(() => {
        setAuthPhase((phase) => {
          if (phase === "verifying") {
            clearOAuthIntent();
            return "failed";
          }
          return phase;
        });
      }, 12000);
    }

    const routeAfterSignIn = async () => {
      setAuthPhase("verifying");

      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        clearOAuthIntent();
        setAuthPhase("failed");
        return;
      }

      const displayName = user.user_metadata?.full_name || user.user_metadata?.nome || user.email || "";
      setAuthUserName(displayName);
      setAuthPhase("authenticated");

      // Brief pause to show success state
      await new Promise((r) => setTimeout(r, 1500));

      // Check if user is admin
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (isAdmin) {
        navigate("/admin", { replace: true });
        return;
      }

      const { data: biz } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (biz && biz.length > 0) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/onboarding/connect", { replace: true });
      }

      clearOAuthIntent();
    };

    const resumeOAuthIfSessionExists = async () => {
      if (!shouldProcessOAuth()) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        void routeAfterSignIn();
      }
    };

    void resumeOAuthIfSessionExists();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!shouldProcessOAuth()) return;

      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
        void routeAfterSignIn();
      }
    });

    return () => {
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, [navigate]);

  const formatWhatsapp = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 13);
    if (digits.length === 0) return "";
    if (digits.length <= 2) return `+${digits}`;
    if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`;
    if (digits.length <= 9) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`;
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  };

  const whatsappValid = /^\+55 \(\d{2}\) \d{5}-\d{4}$/.test(whatsapp);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) return toast({ title: "Email inválido", variant: "destructive" });
    if (!passwordValid) return toast({ title: "Senha deve ter no mínimo 8 caracteres", variant: "destructive" });
    if (mode === "signup" && !passwordsMatch) return toast({ title: "As senhas não coincidem", variant: "destructive" });
    if (mode === "signup" && !whatsappValid) return toast({ title: "WhatsApp inválido. Use o formato +55 (XX) XXXXX-XXXX", variant: "destructive" });

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nome, whatsapp } },
        });
        if (error) throw error;

        // Create CRM lead on signup
        if (data.user) {
          await supabase.from("leads" as any).insert({
            nome,
            email,
            whatsapp,
            source: "site",
            pipeline_stage: "novo",
          } as any).then(() => {});
        }

        toast({ title: "Cadastro realizado!", description: "Verifique seu email para confirmar a conta." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        setAuthPhase("verifying");
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setAuthUserName(user.user_metadata?.nome || user.user_metadata?.full_name || user.email || "");
          setAuthPhase("authenticated");
          await new Promise((r) => setTimeout(r, 1200));

          // Check if user is admin
          const { data: isAdminUser } = await supabase.rpc("has_role", {
            _user_id: user.id,
            _role: "admin",
          });

          if (isAdminUser) {
            navigate("/admin", { replace: true });
          } else {
            const { data: biz } = await supabase.from("businesses").select("id").eq("user_id", user.id).limit(1);
            if (biz && biz.length > 0) {
              navigate("/dashboard");
            } else {
              navigate("/onboarding/connect");
            }
          }
        } else {
          setAuthPhase("failed");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast({ title: translateError(msg), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);

    // Mark explicit OAuth intent to avoid accidental redirects from stale events
    sessionStorage.setItem(OAUTH_INTENT_KEY, "1");
    sessionStorage.setItem(OAUTH_INTENT_STARTED_AT_KEY, String(Date.now()));

    // Prevent stale local sessions from bypassing OAuth flow
    await supabase.auth.signOut();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://localai.app.br/auth",
        scopes: "openid email profile https://www.googleapis.com/auth/business.manage",
        queryParams: {
          prompt: "select_account consent",
          access_type: "offline",
        },
      },
    });

    if (error) {
      clearOAuthIntent();
      toast({ title: translateError(error.message), variant: "destructive" });
      setGoogleLoading(false);
    }
  };

  const handleReset = async () => {
    if (!resetEmail) return;
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetLoading(false);
    if (error) {
      toast({ title: translateError(error.message), variant: "destructive" });
    } else {
      toast({ title: "Email enviado!", description: "Verifique sua caixa de entrada." });
      setResetOpen(false);
    }
  };

  // Visual auth validation overlay
  if (authPhase !== "idle") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm mx-auto p-8"
        >
          <AnimatePresence mode="wait">
            {authPhase === "verifying" && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Verificando autenticação…</h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Validando sua conta com o Google
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Conectando de forma segura
                </div>
              </motion.div>
            )}

            {authPhase === "authenticated" && (
              <motion.div
                key="authenticated"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Autenticado com sucesso!</h2>
                  {authUserName && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Bem-vindo, <span className="font-medium text-foreground">{authUserName}</span>
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Redirecionando…</p>
              </motion.div>
            )}

            {authPhase === "failed" && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Falha na autenticação</h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Não foi possível validar sua conta. Tente novamente.
                  </p>
                </div>
                <Button onClick={() => { setAuthPhase("idle"); window.history.replaceState({}, "", "/auth"); }}>
                  Voltar ao login
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-cyan-500 relative overflow-hidden items-center justify-center p-12">
        <div className="relative z-10 text-primary-foreground max-w-md">
          <img src={localaiLogoBco} alt="LocalAI Logo Branco" className="h-10 mb-4" />
          <p className="text-xl opacity-90 mb-6">
            Seu negócio local no topo do Google — no piloto automático.
          </p>
          <ul className="space-y-3 text-sm opacity-80">
            <li>✦ Posts automáticos no Google Meu Negócio</li>
            <li>✦ Respostas com IA para avaliações</li>
            <li>✦ Campanhas Google Ads otimizadas</li>
            <li>✦ Relatórios unificados</li>
          </ul>
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYtMmgtNHY2aDR2MmgtNHY0aDJ2LTJoNHYtMmgtMnYtMnptMC04aC0ydjJoMnYtMnptLTQtNGgtMnY0aDJ2LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <img src={localaiLogo} alt="LocalAI" className="h-8 mx-auto" />
          </div>

          {/* Toggle */}
          <div className="flex bg-muted rounded-lg p-1 mb-8">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                mode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                mode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Criar conta
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {mode === "signup" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="nome"
                        placeholder="Seu nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="whatsapp"
                        placeholder="+55 (51) 99999-9999"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(formatWhatsapp(e.target.value))}
                        className="pl-10"
                        required
                      />
                    </div>
                    {whatsapp && !whatsappValid && (
                      <p className="text-xs text-destructive">Formato: +55 (XX) XXXXX-XXXX</p>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {email && !emailValid && (
                  <p className="text-xs text-destructive">Email inválido</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && !passwordValid && (
                  <p className="text-xs text-destructive">Mínimo 8 caracteres</p>
                )}
              </div>

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm"
                      type="password"
                      placeholder="Repita a senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-destructive">As senhas não coincidem</p>
                  )}
                </div>
              )}

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => { setResetEmail(email); setResetOpen(true); }}
                  className="text-xs text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                ) : mode === "login" ? "Entrar" : "Criar conta"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-border text-foreground font-medium hover:bg-muted"
                onClick={handleGoogle}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground" />
                ) : (
                  <>
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google"
                      className="h-4 w-4 mr-2"
                    />
                    Continuar com Google
                  </>
                )}
              </Button>
            </motion.form>
          </AnimatePresence>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Ao continuar, você concorda com os Termos de Uso e Política de Privacidade.
          </p>
        </div>
      </div>

      {/* Reset password dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperar senha</DialogTitle>
            <DialogDescription>
              Informe seu email para receber o link de redefinição.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="seu@email.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <Button onClick={handleReset} className="w-full" disabled={resetLoading}>
              {resetLoading ? "Enviando..." : "Enviar link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
