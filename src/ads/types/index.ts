// ============================================================
// TYPES — Módulo Ads Isolado
// ============================================================

// === Tabelas Isoladas ===

export interface AdAccount {
  id: string;
  user_id: string;
  google_ads_customer_id: string | null;
  access_token_encrypted: unknown;
  refresh_token_encrypted: unknown;
  expires_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AdCampaign {
  id: string;
  user_id: string;
  ad_account_id: string | null;
  business_name: string;
  niche: string | null;
  city: string | null;
  budget_daily: number;
  status: string;
  google_campaign_id: string | null;
  performance_score: number;
  strategy_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // enriched
  _kwCount?: number;
  _adCount?: number;
  _negCount?: number;
}

export interface AdKeyword {
  id: string;
  campaign_id: string;
  keyword: string;
  match_type: string;
  is_negative: boolean;
  performance_score: number;
  status: string;
  created_at: string;
}

export interface AdCreative {
  id: string;
  campaign_id: string;
  headline1: string | null;
  headline2: string | null;
  headline3: string | null;
  description: string | null;
  performance_score: number;
  google_ad_id: string | null;
  status: string;
  created_at: string;
}

export interface AdMetric {
  id: string;
  campaign_id: string;
  impressions: number;
  clicks: number;
  cost: number;
  ctr: number;
  conversions: number;
  created_at: string;
}

export interface AdLog {
  id: string;
  campaign_id: string;
  action: string;
  agent: string | null;
  payload: Record<string, unknown>;
  performance_score: number;
  created_at: string;
}

// === Agent Types ===

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

export interface StrategyResult {
  urgency_level: string;
  campaign_type: string;
  bidding_strategy: string;
  geo_radius_km: number;
  conversion_focus: string;
  reasoning: string;
  // legacy fields
  targeting?: {
    location_radius: string;
    schedule: string;
    networks: string;
    bid_strategy: string;
  };
  budget_split?: {
    main_pct: number;
    local_pct: number;
    remarketing_pct: number;
  };
}

export interface KeywordResult {
  high_intent_keywords: Array<{
    termo: string;
    match_type: "exact" | "phrase" | "broad";
    intent: "alta" | "moderada" | "branding";
    cpc_estimado?: number;
  }>;
  negative_keywords: Record<string, string[]>;
  // legacy
  positives?: Array<{
    termo: string;
    match_type: string;
    intent: string;
    cpc_estimado: number;
  }>;
  negatives?: Record<string, string[]>;
}

export interface AdCopyResult {
  ads: Array<{
    headlines: string[];
    descriptions: string[];
    description?: string;
  }>;
}

export interface OptimizationResult {
  performance_level: string;
  issues_detected: string[];
  suggested_actions: Array<{
    type: "pause_keyword" | "adjust_bid" | "add_negative" | "pause_campaign" | "create_ad";
    target_id?: string;
    reason: string;
    expected_impact: string;
    params?: Record<string, unknown>;
  }>;
  summary: string;
}

// === Legacy compatibility (for existing campaigns table) ===

export interface LegacyCampaign {
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

export interface LegacyMetrics {
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
