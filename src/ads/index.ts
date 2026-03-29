// ============================================================
// Módulo Ads — Exports centralizados
// ============================================================

// Agents
export { runStrategyAgent } from "./agents/strategyAgent";
export { runKeywordAgent } from "./agents/keywordAgent";
export { runAdCopyAgent } from "./agents/adCopyAgent";
export { runOptimizationAgent } from "./agents/optimizationAgent";

// Services
export { connectGoogleAds, getAdAccount, disconnectGoogleAds, getCustomerId, refreshAccessToken } from "./services/adsAuthService";
export { createCampaignWithAI, launchCampaign, pauseCampaign, syncCampaign } from "./services/adsService";
export { getLatestMetrics, getMetricsHistory, saveMetricsSnapshot, getCampaignPerformance } from "./services/metricsService";
export { orchestrateCampaignCreation } from "./services/campaignOrchestrator";
export { buildAgentContext } from "./services/contextEngine";
export * from "./services/googleAdsService";

// Hooks
export { useAds } from "./hooks/useAds";
export { useAdMetrics } from "./hooks/useAdMetrics";
export { useGoogleAdsAuth } from "./hooks/useGoogleAdsAuth";

// Types
export type * from "./types";
