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
 * Lista de secrets Twilio necessários nas Edge Functions.
 * Use como referência — a validação real acontece nas Edge Functions (Deno).
 */
export const TWILIO_REQUIRED_SECRETS = [
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_WHATSAPP_NUMBER",
] as const;
