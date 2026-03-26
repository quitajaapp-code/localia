import { supabase } from "@/integrations/supabase/client";

export async function createCheckoutSession(planId: string, userEmail?: string) {
  const { data, error } = await supabase.functions.invoke("create-checkout", {
    body: { plan_id: planId, email: userEmail },
  });

  if (error) throw new Error(error.message || "Erro ao criar sessão de checkout");
  if (!data?.url) throw new Error("URL de checkout não retornada");

  window.location.href = data.url;
}
