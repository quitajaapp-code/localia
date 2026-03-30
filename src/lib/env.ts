/**
 * Validação de variáveis de ambiente
 * Verifica se as variáveis necessárias estão configuradas.
 * No frontend, apenas variáveis VITE_* são acessíveis.
 * Secrets do Twilio ficam apenas no Supabase (Edge Functions).
 */

interface EnvConfig {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  SUPABASE_PROJECT_ID: string;
}

export function getEnvConfig(): EnvConfig {
  const config: EnvConfig = {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "",
    SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
    SUPABASE_PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID || "",
  };

  if (import.meta.env.PROD) {
    const missing = Object.entries(config)
      .filter(([, v]) => !v)
      .map(([k]) => `VITE_${k}`);

    if (missing.length > 0) {
      console.error(`[env] Variáveis obrigatórias ausentes: ${missing.join(", ")}`);
    }
  }

  return config;
}

/**
 * Valida se os secrets do Twilio estão configurados no Supabase.
 * Chamado apenas nas Edge Functions (Deno), não no frontend.
 */
export function validateTwilioSecrets(): {
  valid: boolean;
  missing: string[];
} {
  const required = ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_WHATSAPP_NUMBER"];

  // No frontend, não temos acesso — retorna ok
  if (typeof Deno === "undefined") {
    return { valid: true, missing: [] };
  }

  const missing = required.filter((k) => !(globalThis as any).Deno?.env?.get(k));
  return { valid: missing.length === 0, missing };
}
