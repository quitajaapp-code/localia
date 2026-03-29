export interface AdAccount {
  id: string;
  user_id: string;
  google_ads_customer_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AdCampaign {
  id: string;
  business_id: string;
  ad_account_id: string | null;
  nome: string;
  status: string | null;
  tipo: string | null;
  verba_mensal: number | null;
  verba_restante: number | null;
  budget_daily: number | null;
  ads_campaign_id: string | null;
  created_at: string | null;
  _adCount?: number;
  _kwCount?: number;
}

export interface AdKeyword {
  id: string;
  campaign_id: string;
  termo: string;
  match_type: string | null;
  is_negative?: boolean;
  status: string | null;
  impressoes: number | null;
  cliques: number | null;
  cpc_atual: number | null;
  conversoes: number | null;
}

export interface AdCreative {
  id: string;
  campaign_id: string;
  headline1: string | null;
  headline2: string | null;
  headline3: string | null;
  description_text: string | null;
  headlines: unknown;
  descriptions: unknown;
  status: string | null;
  impressoes: number | null;
  cliques: number | null;
  ctr: number | null;
  cpc: number | null;
  ads_ad_id: string | null;
}

export interface AdMetrics {
  id: string;
  business_id: string;
  impressoes: number | null;
  cliques: number | null;
  cpc_medio: number | null;
  conversoes: number | null;
  gasto_total: number | null;
  ctr: number | null;
  semana_ref: string | null;
  created_at: string | null;
}

export interface AdLog {
  id: string;
  campaign_id: string;
  action: string;
  agent: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface StrategyResult {
  campaign_type: string;
  targeting: {
    location_radius: string;
    schedule: string;
    networks: string;
    bid_strategy: string;
  };
  budget_split: {
    main_pct: number;
    local_pct: number;
    remarketing_pct: number;
  };
  reasoning: string;
}

export interface KeywordResult {
  positives: Array<{
    termo: string;
    match_type: "exact" | "phrase" | "broad";
    intent: "alta" | "moderada" | "branding";
    cpc_estimado: number;
  }>;
  negatives: Record<string, string[]>;
}

export interface AdCopyResult {
  ads: Array<{
    headlines: string[];
    descriptions: string[];
  }>;
}

export interface OptimizationResult {
  actions: Array<{
    type: "pause_keyword" | "adjust_bid" | "add_negative" | "pause_campaign" | "create_ad";
    target_id?: string;
    reason: string;
    expected_impact: string;
    params?: Record<string, unknown>;
  }>;
  summary: string;
}

export interface AgentContext {
  business_name: string;
  niche: string;
  city: string;
  state: string;
  budget_monthly: number;
  objective: string;
  radius: string;
  products?: string;
  differentials?: string;
  years_experience?: string;
  whatsapp?: string;
  website_url?: string;
}
