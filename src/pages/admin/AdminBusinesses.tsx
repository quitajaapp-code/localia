import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface BusinessRow {
  id: string;
  nome: string;
  nicho: string | null;
  cidade: string | null;
  estado: string | null;
  gmb_location_id: string | null;
  created_at: string | null;
}

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("businesses")
        .select("id, nome, nicho, cidade, estado, gmb_location_id, created_at")
        .order("created_at", { ascending: false });
      setBusinesses(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = businesses.filter(
    (b) => b.nome.toLowerCase().includes(search.toLowerCase()) ||
      (b.nicho || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Negócios</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou nicho…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{loading ? "Carregando…" : `${filtered.length} negócio(s)`}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Nicho</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>GMB</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.nome}</TableCell>
                  <TableCell>{b.nicho || "—"}</TableCell>
                  <TableCell>{[b.cidade, b.estado].filter(Boolean).join(", ") || "—"}</TableCell>
                  <TableCell>
                    {b.gmb_location_id
                      ? <Badge variant="default">Conectado</Badge>
                      : <Badge variant="outline">Não conectado</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {b.created_at ? new Date(b.created_at).toLocaleDateString("pt-BR") : "—"}
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
