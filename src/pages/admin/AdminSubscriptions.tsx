import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface ProfileRow {
  id: string;
  user_id: string;
  nome: string | null;
  email: string | null;
  plano: string | null;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
}

const PLANS = ["trial", "presenca", "presenca_ads", "agencia"];

export default function AdminSubscriptions() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState("");

  const fetch = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setProfiles(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handlePlanChange = async (profileId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ plano: newPlan })
      .eq("id", profileId);

    if (error) {
      toast.error("Erro ao alterar plano");
    } else {
      toast.success("Plano atualizado com sucesso");
      setEditingId(null);
      fetch();
    }
  };

  const trialStatus = (trialEnd: string | null) => {
    if (!trialEnd) return null;
    const diff = new Date(trialEnd).getTime() - Date.now();
    if (diff <= 0) return <Badge variant="destructive">Expirado</Badge>;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return <Badge variant="outline">{days}d restantes</Badge>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Assinaturas</h1>

      <Card>
        <CardHeader>
          <CardTitle>{loading ? "Carregando…" : `${profiles.length} assinatura(s)`}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Trial</TableHead>
                <TableHead>Stripe ID</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{p.nome || "—"}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingId === p.id ? (
                      <Select value={newPlan} onValueChange={setNewPlan}>
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PLANS.map((pl) => (
                            <SelectItem key={pl} value={pl}>{pl}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge>{p.plano || "trial"}</Badge>
                    )}
                  </TableCell>
                  <TableCell>{trialStatus(p.trial_ends_at)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {p.stripe_customer_id || "—"}
                  </TableCell>
                  <TableCell>
                    {editingId === p.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handlePlanChange(p.id)}>Salvar</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancelar</Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingId(p.id); setNewPlan(p.plano || "trial"); }}
                      >
                        Editar Plano
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
