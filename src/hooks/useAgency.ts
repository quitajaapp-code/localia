import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { createContext, useContext } from "react";

export interface AgencyClient {
  business_id: string;
  business_name: string;
  nicho: string | null;
  cidade: string | null;
  estado: string | null;
  gmb_connected: boolean;
  review_count: number;
  pending_reviews: number;
  avg_rating: number;
}

// Context for selected business across dashboard
export interface AgencyContextType {
  isAgency: boolean;
  selectedBusinessId: string | null;
  setSelectedBusinessId: (id: string | null) => void;
  clients: AgencyClient[];
  maxClients: number;
}

export const AgencyContext = createContext<AgencyContextType>({
  isAgency: false,
  selectedBusinessId: null,
  setSelectedBusinessId: () => {},
  clients: [],
  maxClients: 10,
});

export const useAgencyContext = () => useContext(AgencyContext);

export function useAgency() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isAgencyQuery = useQuery({
    queryKey: ["is-agency", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "agency")
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  const profileQuery = useQuery({
    queryKey: ["agency-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("id, max_clients_allowed")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user && isAgencyQuery.data === true,
  });

  const clientsQuery = useQuery({
    queryKey: ["agency-clients", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.rpc("get_agency_clients", {
        p_agency_user_id: user.id,
      });
      if (error) throw error;
      return (data ?? []) as AgencyClient[];
    },
    enabled: !!user && isAgencyQuery.data === true,
  });

  const linkClientMutation = useMutation({
    mutationFn: async (businessId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.rpc("link_business_to_agency", {
        p_agency_user_id: user.id,
        p_business_id: businessId,
      });
      if (error) throw error;
      const result = data as any;
      if (!result?.success) throw new Error(result?.error || "Failed to link");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-clients"] });
      toast.success("Cliente vinculado com sucesso!");
    },
    onError: (err: Error) => {
      if (err.message.includes("limit")) {
        toast.error("Limite de clientes atingido. Faça upgrade do plano.");
      } else {
        toast.error(err.message);
      }
    },
  });

  const unlinkClientMutation = useMutation({
    mutationFn: async (businessId: string) => {
      const { error } = await supabase
        .from("businesses")
        .update({ agency_id: null } as any)
        .eq("id", businessId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-clients"] });
      toast.success("Cliente removido da agência.");
    },
    onError: () => toast.error("Erro ao desvincular cliente."),
  });

  return {
    isAgency: isAgencyQuery.data ?? false,
    isLoading: isAgencyQuery.isLoading,
    clients: clientsQuery.data ?? [],
    clientsLoading: clientsQuery.isLoading,
    maxClients: profileQuery.data?.max_clients_allowed ?? 10,
    linkClient: linkClientMutation.mutate,
    unlinkClient: unlinkClientMutation.mutate,
    isLinking: linkClientMutation.isPending,
    refetch: () => clientsQuery.refetch(),
  };
}
