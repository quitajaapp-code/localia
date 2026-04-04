import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useNegativeReviewAlert } from "@/hooks/useNegativeReviewAlert";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAgency, AgencyContext } from "@/hooks/useAgency";

export function DashboardLayout() {
  const { negativeCount, clearCount } = useNegativeReviewAlert();
  const { user } = useAuth();
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const agency = useAgency();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchAlerts = async () => {
      const { data: biz } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (!biz) return;
      const { count } = await supabase
        .from("agent_alerts")
        .select("id", { count: "exact", head: true })
        .eq("business_id", biz.id)
        .eq("read", false);
      setUnreadAlerts(count || 0);
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <AgencyContext.Provider
      value={{
        isAgency: agency.isAgency,
        selectedBusinessId,
        setSelectedBusinessId,
        clients: agency.clients,
        maxClients: agency.maxClients,
      }}
    >
      <div className="flex min-h-screen bg-background">
        <Sidebar negativeReviewCount={negativeCount} onReviewsSeen={clearCount} unreadAlerts={unreadAlerts} />
        <main className="flex-1 overflow-auto md:ml-64">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </AgencyContext.Provider>
  );
}
