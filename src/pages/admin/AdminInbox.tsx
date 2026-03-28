import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  MessageSquare, Send, Bot, User, AlertCircle,
  Plus, Search, Sparkles,
} from "lucide-react";

type Conversation = {
  id: string;
  canal: string;
  status: string;
  assigned_agent: string;
  subject: string | null;
  contact_name: string | null;
  contact_identifier: string | null;
  last_message_at: string;
  created_at: string;
};

type Message = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

const AGENT_LABELS: Record<string, { label: string; color: string }> = {
  sdr:     { label: "Agente SDR",     color: "bg-primary/10 text-primary" },
  support: { label: "Agente Suporte", color: "bg-success/10 text-success" },
  humano:  { label: "Humano",         color: "bg-warning/10 text-warning" },
  bot:     { label: "Bot",            color: "bg-muted text-muted-foreground" },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  aberta:     { label: "Aberta",     color: "bg-primary/10 text-primary" },
  aguardando: { label: "Aguardando", color: "bg-warning/10 text-warning" },
  resolvida:  { label: "Resolvida",  color: "bg-success/10 text-success" },
  spam:       { label: "Spam",       color: "bg-muted text-muted-foreground" },
};

export default function AdminInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("aberta");
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [newContact, setNewContact] = useState({ nome: "", identifier: "", canal: "whatsapp", agente: "sdr" });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadConversations(); }, [filterStatus]);

  useEffect(() => {
    if (selected) loadMessages(selected.id);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    let query = supabase
      .from("conversations" as any)
      .select("*")
      .order("last_message_at", { ascending: false });
    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    const { data } = await query;
    setConversations((data as any[]) || []);
  };

  const loadMessages = async (convId: string) => {
    const { data } = await supabase
      .from("messages" as any)
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages((data as any[]) || []);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selected) return;
    setSending(true);
    const msg = input.trim();
    setInput("");

    try {
      // Determina qual agente invocar
      const funcao = selected.assigned_agent === "sdr" ? "agent-sdr" : "agent-support";

      const { data, error } = await supabase.functions.invoke(funcao, {
        body: {
          conversation_id: selected.id,
          message: msg,
        },
      });

      if (error) throw error;
      await loadMessages(selected.id);
      await loadConversations();

      // Se o agente escalou para humano
      if (data?.passar_humano || data?.escalar_humano) {
        toast.warning("Agente escalou esta conversa para atendimento humano");
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  const createConversation = async () => {
    if (!newContact.nome) { toast.error("Nome é obrigatório"); return; }
    const { data, error } = await supabase.from("conversations" as any).insert({
      canal: newContact.canal,
      assigned_agent: newContact.agente,
      contact_name: newContact.nome,
      contact_identifier: newContact.identifier,
      status: "aberta",
    } as any).select().single();
    if (error) { toast.error("Erro ao criar conversa"); return; }
    setNewConvOpen(false);
    setNewContact({ nome: "", identifier: "", canal: "whatsapp", agente: "sdr" });
    await loadConversations();
    setSelected(data as any);
  };

  const filteredConvs = conversations.filter((c) => {
    if (!search) return true;
    return (c.contact_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.contact_identifier || "").toLowerCase().includes(search.toLowerCase());
  });

  const roleLabel = (role: string) => {
    if (role === "user") return { label: "Cliente", icon: User, bg: "bg-muted" };
    if (role === "agent_sdr") return { label: "SDR", icon: Bot, bg: "bg-primary/10" };
    if (role === "agent_support") return { label: "Suporte", icon: Bot, bg: "bg-success/10" };
    return { label: "Humano", icon: User, bg: "bg-warning/10" };
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 border border-border rounded-xl overflow-hidden">

      {/* Lista de conversas */}
      <div className="w-80 flex-shrink-0 border-r border-border flex flex-col bg-card">
        <div className="p-3 border-b border-border space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm flex-1">Inbox</h2>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setNewConvOpen(true)}>
              <Plus className="h-3 w-3 mr-1" /> Nova
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="pl-8 h-8 text-xs" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="aberta">Abertas</SelectItem>
              <SelectItem value="aguardando">Aguardando</SelectItem>
              <SelectItem value="resolvida">Resolvidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {filteredConvs.map((conv) => {
            const agentInfo = AGENT_LABELS[conv.assigned_agent] || AGENT_LABELS.bot;
            const statusInfo = STATUS_LABELS[conv.status] || STATUS_LABELS.aberta;
            return (
              <div
                key={conv.id}
                onClick={() => setSelected(conv)}
                className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${selected?.id === conv.id ? "bg-muted" : ""}`}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="text-sm font-medium truncate">
                    {conv.contact_name || conv.contact_identifier || "Sem nome"}
                  </span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(conv.last_message_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge className={`text-[10px] py-0 px-1.5 ${agentInfo.color}`}>{agentInfo.label}</Badge>
                  <Badge className={`text-[10px] py-0 px-1.5 ${statusInfo.color}`}>{statusInfo.label}</Badge>
                  <span className="text-[10px] text-muted-foreground">{conv.canal}</span>
                </div>
              </div>
            );
          })}
          {filteredConvs.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma conversa
            </div>
          )}
        </div>
      </div>

      {/* Chat principal */}
      {selected ? (
        <div className="flex-1 flex flex-col bg-background">
          {/* Chat header */}
          <div className="p-3 border-b border-border flex items-center gap-3 bg-card">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {(selected.contact_name || "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{selected.contact_name || selected.contact_identifier || "Sem nome"}</p>
              <div className="flex items-center gap-2">
                <Badge className={`text-[10px] py-0 px-1.5 ${(AGENT_LABELS[selected.assigned_agent] || AGENT_LABELS.bot).color}`}>
                  {(AGENT_LABELS[selected.assigned_agent] || AGENT_LABELS.bot).label}
                </Badge>
                <span className="text-[10px] text-muted-foreground">{selected.canal}</span>
              </div>
            </div>
            <Select
              value={selected.assigned_agent}
              onValueChange={async (v) => {
                await supabase.from("conversations" as any).update({ assigned_agent: v } as any).eq("id", selected.id);
                setSelected({ ...selected, assigned_agent: v });
                toast.success("Agente alterado");
              }}
            >
              <SelectTrigger className="w-36 h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sdr">Agente SDR</SelectItem>
                <SelectItem value="support">Agente Suporte</SelectItem>
                <SelectItem value="humano">Humano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const info = roleLabel(msg.role);
              const isUser = msg.role === "user";
              return (
                <div key={msg.id} className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${info.bg}`}>
                    <info.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <span className="text-[10px] text-muted-foreground px-1">{info.label}</span>
                    <div className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground px-1">
                      {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card">
            {selected.assigned_agent === "humano" && (
              <div className="flex items-center gap-2 mb-2 text-xs text-warning bg-warning/10 px-3 py-2 rounded-lg">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Modo humano — você está respondendo diretamente
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder={selected.assigned_agent === "humano" ? "Escreva sua resposta..." : "Simular mensagem do cliente..."}
                className="flex-1"
                disabled={sending}
              />
              <Button onClick={sendMessage} disabled={sending || !input.trim()} size="sm">
                {sending ? <Sparkles className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            {selected.assigned_agent !== "humano" && (
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                O agente responde automaticamente · Enter para enviar
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div className="space-y-3">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium">Selecione uma conversa</p>
            <p className="text-xs text-muted-foreground">ou crie uma nova para testar os agentes</p>
            <Button variant="outline" size="sm" onClick={() => setNewConvOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Nova conversa
            </Button>
          </div>
        </div>
      )}

      {/* Modal nova conversa */}
      {newConvOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-xl p-5 w-80 space-y-3 shadow-xl">
            <h3 className="font-semibold">Nova Conversa</h3>
            <div className="space-y-2">
              <Input value={newContact.nome} onChange={(e) => setNewContact(p => ({ ...p, nome: e.target.value }))} placeholder="Nome do contato *" />
              <Input value={newContact.identifier} onChange={(e) => setNewContact(p => ({ ...p, identifier: e.target.value }))} placeholder="WhatsApp ou e-mail" />
              <Select value={newContact.canal} onValueChange={(v) => setNewContact(p => ({ ...p, canal: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newContact.agente} onValueChange={(v) => setNewContact(p => ({ ...p, agente: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sdr">Agente SDR (Vendas)</SelectItem>
                  <SelectItem value="support">Agente Suporte</SelectItem>
                  <SelectItem value="humano">Humano (sem IA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setNewConvOpen(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={createConversation}>Criar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
