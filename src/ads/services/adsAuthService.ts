import { supabase } from "@/integrations/supabase/client";
import type { AdAccount } from "../types";

/**
 * Redirect user to Google OAuth2 for Google Ads authorization.
 */
export async function connectGoogleAds(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!clientId || !supabaseUrl) throw new Error("Configuração OAuth ausente");

  const redirectUri = `${supabaseUrl}/functions/v1/google-ads-oauth-callback`;
  const state = btoa(JSON.stringify({ user_id: user.id }));

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/adwords openid email",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Get the user's connected Google Ads account.
 */
export async function getAdAccount(): Promise<AdAccount | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("ad_accounts")
    .select("*")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  return data as unknown as AdAccount | null;
}

/**
 * Disconnect Google Ads account.
 */
export async function disconnectGoogleAds(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  await supabase
    .from("ad_accounts")
    .update({ status: "disconnected", updated_at: new Date().toISOString() })
    .eq("user_id", user.id);
}

/**
 * Get Google Ads customer ID. Returns null if not connected.
 */
export async function getCustomerId(): Promise<string | null> {
  const account = await getAdAccount();
  return account?.google_ads_customer_id || null;
}

/**
 * Refresh the Google Ads access token via edge function.
 */
export async function refreshAccessToken(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  const { data, error } = await supabase.functions.invoke("google-ads-refresh", {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (error) {
    console.error("Token refresh error:", error);
    return false;
  }
  return data?.success === true;
}
