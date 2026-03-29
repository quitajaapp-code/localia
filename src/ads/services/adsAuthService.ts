import { supabase } from "@/integrations/supabase/client";
import type { AdAccount } from "../types";

/**
 * Connect Google Ads account.
 * Currently stores the customer ID for future API integration.
 */
export async function connectGoogleAds(customerId: string): Promise<AdAccount> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  // Check if already connected
  const { data: existing } = await supabase
    .from("ad_accounts")
    .select("*")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("ad_accounts")
      .update({ google_ads_customer_id: customerId, status: "connected", updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as AdAccount;
  }

  const { data, error } = await supabase
    .from("ad_accounts")
    .insert({ user_id: user.id, google_ads_customer_id: customerId, status: "connected" })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as AdAccount;
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
