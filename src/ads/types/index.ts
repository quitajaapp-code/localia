// ============================================================
// TYPES — Módulo Ads Isolado (Decision-Based Agents)
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

// === Context Engine Types ===

export interface BusinessContext {
  name: string;
  niche: string;
  city: string;
  state: string;
  ticket: string;
  differential: string;
  products: string;
  years_experience: string;
  whatsapp: string | null;
  website_url: string | null;
  target_audience: string;
}

export interface PerformanceContext {
  total_campaigns: number;
  active_campaigns: number;
  avg_ctr: number;
  avg_cpc: number;
  total_conversions: number;
  total_spend: number;
  best_performing_keywords: string[];
}

export interface HistoryContext {
  previous_keywords: string[];
  paused_keywords: string[];
  best_headlines: string[];
  failed_ads: string[];
}

export interface LocationContext {
  radius: string;
  target_areas: string[];
  competitors_density: "high" | "medium" | "low";
}

export interface FullAgentContext {
  business: BusinessContext;
  performance: PerformanceContext;
  history: HistoryContext;
  location: LocationContext;
}

// === Agent Input/Output Types (Structured Decision) ===

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
  target_audience?: string;
}

export interface StrategyResult {
  urgency_level: "high" | "medium" | "low";
  search_intent: "transactional" | "urgent" | "exploratory";
  campaign_type: "search" | "display" | "local" | "performance_max";
  bidding_strategy: "maximize_conversions" | "maximize_clicks" | "target_cpa" | "manual_cpc";
  geo_radius_km: number;
  conversion_focus: "calls" | "website" | "directions" | "whatsapp";
  risk_level: "low" | "medium" | "high";
  reasoning: string;
  schedule: string;
  budget_split: {
    main_pct: number;
    local_pct: number;
    remarketing_pct: number;
  };
}

export interface KeywordResult {
  high_intent_keywords: Array<{
    term: string;
    match_type: "exact" | "phrase";
    intent: "alta" | "moderada";
    urgency: boolean;
    estimated_cpc: number;
  }>;
  negative_keywords: {
    employment: string[];
    diy_educational: string[];
    out_of_region: string[];
    unrealistic_price: string[];
    competitors: string[];
  };
}

export interface AdCopyResult {
  ads: Array<{
    headline1: string;
    headline2: string;
    headline3: string;
    description: string;
    targeting_rationale: string;
  }>;
}

export interface OptimizationResult {
  performance_level: "excellent" | "good" | "needs_attention" | "critical";
  issues_detected: Array<{
    type: string;
    severity: "high" | "medium" | "low";
    detail: string;
  }>;
  actions: Array<{
    type: "pause_keyword" | "adjust_bid" | "add_negative" | "pause_campaign" | "create_ad" | "increase_budget" | "change_schedule";
    target: string;
    reason: string;
    expected_impact: string;
    priority: number;
  }>;
  summary: string;
  roi_assessment: string;
}

// === Legacy compatibility ===

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
