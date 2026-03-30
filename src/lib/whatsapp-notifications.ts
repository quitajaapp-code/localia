/**
 * WhatsApp Notifications — Utilitários de notificação para a equipe.
 * Browser notifications + helpers para alertas.
 */

/** Solicita permissão de notificação do browser */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
}

/** Envia notificação do browser para nova mensagem */
export function notifyNewMessage(contactName: string, preview: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const notification = new Notification(`💬 ${contactName}`, {
    body: preview.slice(0, 100),
    icon: "/favicon.ico",
    tag: "wa-new-message",
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  // Auto-close after 5s
  setTimeout(() => notification.close(), 5000);
}

/** Envia notificação de conversa não respondida */
export function notifyUnreplied(contactName: string, minutesAgo: number) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const hours = Math.floor(minutesAgo / 60);
  const timeLabel = hours > 0 ? `${hours}h` : `${minutesAgo}min`;

  new Notification(`⚠️ Sem resposta há ${timeLabel}`, {
    body: `${contactName} aguarda resposta.`,
    icon: "/favicon.ico",
    tag: "wa-unreplied",
  });
}

/** Toca som de notificação (usa Audio API) */
export function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.1;
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Audio not available
  }
}
