/**
 * Utilitários para WhatsApp Interno da equipe LocalIA
 */

/** Padroniza número para formato E.164 brasileiro (+55...) */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("55") && digits.length >= 12) {
    return `+${digits}`;
  }
  if (digits.length === 11) {
    return `+55${digits}`;
  }
  if (digits.length === 10) {
    // Adiciona 9 para celulares
    return `+55${digits.slice(0, 2)}9${digits.slice(2)}`;
  }
  return `+${digits}`;
}

/** Verifica se um número parece válido */
export function isValidPhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  return /^\+55\d{12,13}$/.test(formatted);
}

/** Calcula tempo de resposta entre duas datas em minutos */
export function calculateResponseTime(
  receivedAt: string,
  repliedAt: string
): number {
  const diff =
    new Date(repliedAt).getTime() - new Date(receivedAt).getTime();
  return Math.max(0, Math.round(diff / 60000));
}

/** Formata tempo de resposta para exibição */
export function formatResponseTime(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return `${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

/** Gera quick replies padrão para SDR */
export function generateQuickReplies(context?: {
  contactName?: string;
  leadStage?: string;
}): string[] {
  const name = context?.contactName || "você";
  const replies = [
    `Olá ${name}! Tudo bem? Como posso ajudar?`,
    `${name}, obrigado pelo contato! Vou verificar e já retorno.`,
    `Perfeito! Vou agendar uma demonstração para ${name}.`,
    `Entendi! Vou encaminhar para nossa equipe técnica.`,
  ];

  if (context?.leadStage === "demo") {
    replies.push(
      `${name}, sua demonstração está confirmada! Qualquer dúvida estamos aqui.`
    );
  }

  if (context?.leadStage === "proposta") {
    replies.push(
      `${name}, enviei a proposta por e-mail. Conseguiu avaliar?`
    );
  }

  return replies;
}

/** Extrai iniciais do nome para avatar */
export function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
