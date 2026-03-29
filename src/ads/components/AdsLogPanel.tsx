import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Clock, Zap, ShieldCheck, Sparkles } from "lucide-react";
import type { AdLog } from "../../types";

const ACTION_LABELS: Record<string, { label: string; icon: typeof Bot; color: string }> = {
  campaign_created_by_ai: { label: "Campanha criada por IA", icon: Sparkles, color: "text-primary" },
  campaign_launched: { label: "Campanha lançada", icon: Zap, color: "text-success" },
  campaign_paused: { label: "Campanha pausada", icon: Clock, color: "text-warning" },
  auto_optimization: { label: "Otimização automática", icon: Bot, color: "text-primary" },
  campaign_synced: { label: "Sincronização", icon: ShieldCheck, color: "text-muted-foreground" },
  sync_attempted: { label: "Tentativa de sync", icon: ShieldCheck, color: "text-muted-foreground" },
};

export function AdsLogPanel({ campaignId }: { campaignId?: string }) {
  const [logs, setLogs] = useState<AdLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      let query = supabase
        .from("ad_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (campaignId) {
        query = query.eq("campaign_id", campaignId);
      }

      const { data } = await query;
      setLogs((data || []) as unknown as AdLog[]);
      setLoading(false);
    };
    load();
  }, [campaignId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          Log de Ações dos Agentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma ação registrada ainda.</p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {logs.map((log) => {
                const info = ACTION_LABELS[log.action] || { label: log.action, icon: Bot, color: "text-muted-foreground" };
                const IconComp = info.icon;
                return (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <IconComp className={`h-4 w-4 mt-0.5 shrink-0 ${info.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{info.label}</span>
                        {log.agent && (
                          <Badge variant="outline" className="text-xs">{log.agent}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(log.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
