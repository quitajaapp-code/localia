import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type SubStatus = "active" | "trialing" | "past_due" | "canceled" | "unpaid" | "no_subscription" | "trial_profile";

export interface SubscriptionInfo {
  status: SubStatus;
  hasAccess: boolean;
  graceDaysLeft: number | null;
  planType: string | null;
  currentPeriodEnd: string | null;
  gracePeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  isLoading: boolean;
}

export function useSubscriptionStatus(): SubscriptionInfo {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["subscription-status", user?.id],
    queryFn: async (): Promise<Omit<SubscriptionInfo, "isLoading">> => {
      if (!user) {
        return { status: "no_subscription", hasAccess: false, graceDaysLeft: null, planType: null, currentPeriodEnd: null, gracePeriodEnd: null, cancelAtPeriodEnd: false };
      }

      // Check subscriptions table
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status, plan_type, current_period_end, grace_period_end, cancel_at_period_end")
        .eq("user_id", user.id)
        .maybeSingle();

      if (sub) {
        const now = new Date();
        const graceEnd = sub.grace_period_end ? new Date(sub.grace_period_end) : null;
        const status = sub.status as SubStatus;

        let hasAccess = false;
        let graceDaysLeft: number | null = null;

        if (status === "active" || status === "trialing") {
          hasAccess = true;
        } else if (status === "past_due" && graceEnd && graceEnd >= now) {
          hasAccess = true;
          graceDaysLeft = Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }

        return {
          status,
          hasAccess,
          graceDaysLeft,
          planType: sub.plan_type,
          currentPeriodEnd: sub.current_period_end,
          gracePeriodEnd: sub.grace_period_end,
          cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
        };
      }

      // Fallback: check profile trial
      const { data: profile } = await supabase
        .from("profiles")
        .select("plano, trial_ends_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.plano === "trial" && profile.trial_ends_at) {
        const trialEnd = new Date(profile.trial_ends_at);
        if (trialEnd >= new Date()) {
          const daysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return { status: "trial_profile", hasAccess: true, graceDaysLeft: daysLeft, planType: "trial", currentPeriodEnd: profile.trial_ends_at, gracePeriodEnd: null, cancelAtPeriodEnd: false };
        }
      }

      return { status: "no_subscription", hasAccess: false, graceDaysLeft: null, planType: null, currentPeriodEnd: null, gracePeriodEnd: null, cancelAtPeriodEnd: false };
    },
    enabled: !!user,
    refetchInterval: 60000,
  });

  return {
    status: data?.status ?? "no_subscription",
    hasAccess: data?.hasAccess ?? true, // Default true while loading to avoid flash
    graceDaysLeft: data?.graceDaysLeft ?? null,
    planType: data?.planType ?? null,
    currentPeriodEnd: data?.currentPeriodEnd ?? null,
    gracePeriodEnd: data?.gracePeriodEnd ?? null,
    cancelAtPeriodEnd: data?.cancelAtPeriodEnd ?? false,
    isLoading,
  };
}
