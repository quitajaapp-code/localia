/**
 * Google Ads API Service
 * 
 * Funções para comunicação com a API do Google Ads.
 * Tokens são gerenciados via Edge Functions para segurança.
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * List accessible Google Ads customer accounts.
 * Calls edge function to decrypt token and query Google Ads API.
 */
export async function getAccessibleCustomers(): Promise<string[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase.functions.invoke("google-ads-api", {
    body: { action: "listAccessibleCustomers" },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (error) {
    console.error("[GoogleAds] getAccessibleCustomers error:", error);
    return [];
  }
  return data?.customerIds || [];
}

export async function createCampaignOnGoogle(_params: {
  customerId: string;
  campaignName: string;
  budgetDaily: number;
  targetLocation: string;
}) {
  // TODO: Implementar quando Developer Token for aprovado
  console.log("[GoogleAds] createCampaign - aguardando integração API", _params);
  return { google_campaign_id: null, status: "simulated" };
}

export async function createAdGroup(_params: {
  customerId: string;
  campaignId: string;
  adGroupName: string;
}) {
  console.log("[GoogleAds] createAdGroup - aguardando integração API", _params);
  return { google_adgroup_id: null, status: "simulated" };
}

export async function uploadKeywords(_params: {
  customerId: string;
  adGroupId: string;
  keywords: Array<{ text: string; matchType: string }>;
}) {
  console.log("[GoogleAds] uploadKeywords - aguardando integração API", _params);
  return { uploaded: 0, status: "simulated" };
}

export async function uploadAds(_params: {
  customerId: string;
  adGroupId: string;
  ads: Array<{ headlines: string[]; descriptions: string[] }>;
}) {
  console.log("[GoogleAds] uploadAds - aguardando integração API", _params);
  return { uploaded: 0, status: "simulated" };
}

export async function fetchMetrics(_params: {
  customerId: string;
  campaignId: string;
  dateRange: string;
}) {
  console.log("[GoogleAds] fetchMetrics - aguardando integração API", _params);
  return { impressions: 0, clicks: 0, cost: 0, conversions: 0, status: "simulated" };
}
