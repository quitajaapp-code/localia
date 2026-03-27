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
import { Mail, Lock, User, Eye, EyeOff, Chrome } from "lucide-react";

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

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nome, setNome] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Detect session only when returning from OAuth callback
  useEffect(() => {
    const hasOAuthCallbackParams = () => {
      const hash = window.location.hash;
      const search = new URLSearchParams(window.location.search);
      return hash.includes("access_token=") || search.has("code");
    };

    const routeAfterSignIn = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;

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
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const oauthInProgress = sessionStorage.getItem("localai_oauth_in_progress") === "1";
      if (event === "SIGNED_IN" && session?.user && hasOAuthCallbackParams() && oauthInProgress) {
        sessionStorage.removeItem("localai_oauth_in_progress");
        void routeAfterSignIn();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) return toast({ title: "Email inválido", variant: "destructive" });
    if (!passwordValid) return toast({ title: "Senha deve ter no mínimo 8 caracteres", variant: "destructive" });
    if (mode === "signup" && !passwordsMatch) return toast({ title: "As senhas não coincidem", variant: "destructive" });

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nome } },
        });
        if (error) throw error;
        toast({ title: "Cadastro realizado!", description: "Verifique seu email para confirmar a conta." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Check if user has business (onboarding complete)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: biz } = await supabase.from("businesses").select("id").eq("user_id", user.id).limit(1);
          if (biz && biz.length > 0) {
            navigate("/dashboard");
          } else {
            navigate("/onboarding/connect");
          }
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

    // Prevent stale local sessions from bypassing OAuth flow
    await supabase.auth.signOut({ scope: "local" });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://localai.app.br/auth",
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
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

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-cyan-500 relative overflow-hidden items-center justify-center p-12">
        <div className="relative z-10 text-primary-foreground max-w-md">
          <h1 className="text-4xl font-bold mb-4">LocalAI</h1>
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
            <h1 className="text-3xl font-bold text-primary">LocalAI</h1>
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
                className="w-full"
                onClick={handleGoogle}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground" />
                ) : (
                  <>
                    <Chrome className="h-4 w-4 mr-2" />
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
