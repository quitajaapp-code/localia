import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdAccountInfo {
  id: string;
  status: string | null;
  google_ads_customer_id: string | null;
  expires_at: string | null;
}

export function useGoogleAdsAuth() {
  const [account, setAccount] = useState<AdAccountInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const isConnected = account?.status === "connected";

  const fetchAccount = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("ad_accounts")
        .select("id, status, google_ads_customer_id, expires_at")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      setAccount(data as AdAccountInfo | null);
    } catch (err) {
      console.error("Error fetching ad account:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  const connect = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!clientId || !supabaseUrl) {
      toast.error("Configuração OAuth ausente");
      return;
    }

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
  }, []);

  const disconnect = useCallback(async () => {
    if (!account) return;
    try {
      await supabase
        .from("ad_accounts")
        .update({ status: "disconnected", updated_at: new Date().toISOString() })
        .eq("id", account.id);
      setAccount((prev) => prev ? { ...prev, status: "disconnected" } : null);
      toast.success("Google Ads desconectado");
    } catch {
      toast.error("Erro ao desconectar");
    }
  }, [account]);

  const refreshToken = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const { data, error } = await supabase.functions.invoke("google-ads-refresh", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) {
        console.error("Token refresh error:", error);
        return false;
      }
      await fetchAccount();
      return data?.success === true;
    } catch {
      return false;
    }
  }, [fetchAccount]);

  const getAccount = useCallback(() => account, [account]);

  return {
    account,
    isConnected,
    loading,
    connect,
    disconnect,
    refreshToken,
    getAccount,
    refetch: fetchAccount,
  };
}
