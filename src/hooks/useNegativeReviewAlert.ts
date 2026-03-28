import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Subscribes to realtime INSERT events on the `reviews` table.
 * When a negative review (rating ≤ 2) arrives, fires a toast and
 * increments the unread-negative counter.
 */
export function useNegativeReviewAlert() {
  const [negativeCount, setNegativeCount] = useState(0);
  const businessIdRef = useRef<string | null>(null);

  const clearCount = useCallback(() => setNegativeCount(0), []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: biz } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!biz) return;
      businessIdRef.current = biz.id;

      // Count existing unresponded negative reviews (unread indicator)
      const { count } = await supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("business_id", biz.id)
        .lte("rating", 2)
        .eq("respondido", false);

      setNegativeCount(count ?? 0);

      // Subscribe to new inserts
      channel = supabase
        .channel("negative-reviews")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "reviews",
            filter: `business_id=eq.${biz.id}`,
          },
          (payload) => {
            const newReview = payload.new as any;
            if (newReview.rating != null && newReview.rating <= 2) {
              setNegativeCount((c) => c + 1);
              toast.warning(
                `⚠️ Avaliação negativa recebida (${newReview.rating}★)${newReview.autor ? ` de ${newReview.autor}` : ""}`,
                {
                  description: newReview.texto
                    ? newReview.texto.slice(0, 100)
                    : "Sem texto",
                  duration: 10000,
                  action: {
                    label: "Ver avaliações",
                    onClick: () => {
                      window.location.href = "/dashboard/reviews";
                    },
                  },
                }
              );
            }
          }
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return { negativeCount, clearCount };
}
