import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAgency } from "@/hooks/useAgency";
import { useAuth } from "@/hooks/useAuth";
import { InviteClientModal } from "@/components/agency/InviteClientModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Star, MessageSquareWarning, Users, Plus, ExternalLink, Loader2 } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function AgencyDashboard() {
  usePageTitle("Painel da Agência");
  const { user } = useAuth();
  const { clients, clientsLoading, maxClients, isAgency, isLoading, linkClient, isLinking } = useAgency();
  const [showInvite, setShowInvite] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAgency) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Acesso Restrito</h2>
        <p className="text-muted-foreground">Você não possui acesso ao painel de agência.</p>
        <Button onClick={() => navigate("/dashboard")}>Ir para Dashboard</Button>
      </div>
    );
  }

  const totalPendingReviews = clients.reduce((sum, c) => sum + c.pending_reviews, 0);
  const avgRating = clients.length
    ? (clients.reduce((sum, c) => sum + c.avg_rating, 0) / clients.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel da Agência</h1>
          <p className="text-muted-foreground">Gerencie todos os seus clientes em um só lugar.</p>
        </div>
        <Button onClick={() => setShowInvite(true)} disabled={clients.length >= maxClients}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Cliente
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.length}<span className="text-lg text-muted-foreground">/{maxClients}</span>
            </div>
            {clients.length >= maxClients && (
              <p className="text-xs text-destructive mt-1">Limite atingido</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reviews Pendentes</CardTitle>
            <MessageSquareWarning className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPendingReviews}</div>
            <p className="text-xs text-muted-foreground">Em todos os clientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nota Média</CardTitle>
            <Star className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating}</div>
            <p className="text-xs text-muted-foreground">Média GMB dos clientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {clientsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Nenhum cliente vinculado</p>
              <p className="text-sm text-muted-foreground mb-4">Adicione seu primeiro cliente para começar.</p>
              <Button onClick={() => setShowInvite(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cliente
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Negócio</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead className="text-center">GMB</TableHead>
                  <TableHead className="text-center">Nota</TableHead>
                  <TableHead className="text-center">Reviews</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.business_id}>
                    <TableCell className="font-medium">{client.business_name}</TableCell>
                    <TableCell>{client.nicho || "—"}</TableCell>
                    <TableCell>
                      {client.cidade && client.estado ? `${client.cidade}/${client.estado}` : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={client.gmb_connected ? "default" : "secondary"}>
                        {client.gmb_connected ? "Conectado" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3 w-3 text-warning fill-warning" />
                        {client.avg_rating || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {client.review_count}
                      {client.pending_reviews > 0 && (
                        <Badge variant="destructive" className="ml-1 text-xs">
                          {client.pending_reviews}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/dashboard?bid=${client.business_id}`)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Gerenciar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InviteClientModal
        open={showInvite}
        onOpenChange={setShowInvite}
        onLink={(id) => {
          linkClient(id);
          setShowInvite(false);
        }}
        isLinking={isLinking}
        currentCount={clients.length}
        maxCount={maxClients}
      />
    </div>
  );
}
