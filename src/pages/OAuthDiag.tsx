import { useAuth } from "@/hooks/useAuth";

const OAuthDiag = () => {
  const { user } = useAuth();

  const VITE_GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "(não definido)";
  const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "(não definido)";

  const gmbRedirectUri = `${VITE_SUPABASE_URL}/functions/v1/google-oauth-callback`;
  const authRedirectUri = `${VITE_SUPABASE_URL}/auth/v1/callback`;
  const state = user ? btoa(JSON.stringify({ user_id: user.id })) : "(usuário não logado)";

  const gmbAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${VITE_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(gmbRedirectUri)}&response_type=code&scope=${encodeURIComponent("https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/userinfo.email")}&access_type=offline&prompt=consent&state=${state}`;

  const items = [
    { label: "VITE_GOOGLE_CLIENT_ID", value: VITE_GOOGLE_CLIENT_ID },
    { label: "VITE_SUPABASE_URL", value: VITE_SUPABASE_URL },
    { label: "GMB Redirect URI (Edge Function)", value: gmbRedirectUri },
    { label: "Auth Redirect URI (Supabase Auth)", value: authRedirectUri },
    { label: "User ID", value: user?.id || "(não logado)" },
    { label: "State (base64)", value: state },
  ];

  return (
    <div className="min-h-screen bg-background p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">🔧 Diagnóstico OAuth</h1>
      <p className="text-sm text-muted-foreground">
        Valores em tempo real usados nos fluxos de OAuth. Compare com o Google Cloud Console.
      </p>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-card p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
            <p className="text-sm font-mono text-foreground break-all select-all">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-4 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Google Cloud Console → URIs necessárias</p>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Authorized redirect URIs (adicione ambas):</p>
          <code className="block text-xs font-mono text-primary break-all select-all">{gmbRedirectUri}</code>
          <code className="block text-xs font-mono text-primary break-all select-all">{authRedirectUri}</code>
        </div>
      </div>

      {user && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">URL completa de teste GMB OAuth</p>
          <a
            href={gmbAuthUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-primary underline break-all"
          >
            Abrir fluxo GMB OAuth →
          </a>
        </div>
      )}
    </div>
  );
};

export default OAuthDiag;
