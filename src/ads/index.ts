// Agents
export { runStrategyAgent } from "./agents/strategyAgent";
export { runKeywordAgent } from "./agents/keywordAgent";
export { runAdCopyAgent } from "./agents/adCopyAgent";
export { runOptimizationAgent } from "./agents/optimizationAgent";

// Services
export { connectGoogleAds, getAdAccount, disconnectGoogleAds, getCustomerId } from "./services/adsAuthService";
export { createCampaignWithAI, launchCampaign, pauseCampaign, syncCampaign } from "./services/adsService";
export { getLatestMetrics, getMetricsHistory, saveMetricsSnapshot, getCampaignPerformance } from "./services/metricsService";

// Hooks
export { useAds } from "./hooks/useAds";
export { useAdMetrics } from "./hooks/useAdMetrics";

// Types
export type * from "./types";
