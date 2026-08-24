export interface ChatMessage {
  id: string;
  senderId: string; // Normalized employeeId (e.g. EMS-1001 or 1001)
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  recipientId: string; // 'ALL' for Team Channel or normalized recipient employeeId
  recipientName: string;
  channel: 'TEAM' | 'DIRECT';
  content: string;
  timestamp: string;
  createdAt: number;
}

const CHAT_STORAGE_KEY = 'pj_erp_chat_realtime_v3';
const CHAT_EVENT_NAME = 'pj_chat_updated_realtime_v3';

// Helper to normalize user identifiers so cross-profile matching works 100%
export function normalizeChatId(idOrEmployeeId?: string): string {
  if (!idOrEmployeeId) return '';
  const str = String(idOrEmployeeId).toUpperCase().trim();
  const cleaned = str.replace(/^EMS-?/, '').replace(/[^A-Z0-9]/g, '');
  return cleaned || str;
}

// Retrieve all messages from storage
export function getAllChatMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse chat messages:', e);
    return [];
  }
}

// Retrieves filtered chat messages for Team channel or Direct DM between two users
export function getFilteredMessages(
  channel: 'TEAM' | 'DIRECT',
  currentUserIdOrEmpId?: string,
  peerIdOrEmpId?: string
): ChatMessage[] {
  const all = getAllChatMessages();

  if (channel === 'TEAM') {
    return all.filter((m) => m.channel === 'TEAM' || m.recipientId === 'ALL');
  }

  if (channel === 'DIRECT' && currentUserIdOrEmpId && peerIdOrEmpId) {
    const me = normalizeChatId(currentUserIdOrEmpId);
    const peer = normalizeChatId(peerIdOrEmpId);

    return all.filter((m) => {
      if (m.channel !== 'DIRECT') return false;
      const sId = normalizeChatId(m.senderId);
      const rId = normalizeChatId(m.recipientId);

      const isMatch =
        (sId === me && rId === peer) ||
        (sId === peer && rId === me) ||
        (me.length > 2 && peer.length > 2 && (
          (sId.includes(me) && rId.includes(peer)) ||
          (sId.includes(peer) && rId.includes(me))
        ));

      return isMatch;
    });
  }

  return all.filter((m) => m.channel === 'DIRECT');
}

// Sends a new message and notifies all tabs/components & backend in real-time
export function sendChatMessage(
  msg: Omit<ChatMessage, 'id' | 'createdAt' | 'timestamp'>
): ChatMessage {
  const all = getAllChatMessages();
  const now = new Date();

  const newMsg: ChatMessage = {
    ...msg,
    senderId: normalizeChatId(msg.senderId),
    recipientId: msg.channel === 'TEAM' ? 'ALL' : normalizeChatId(msg.recipientId),
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now.getTime(),
    timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const updated = [...all, newMsg];

  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(CHAT_EVENT_NAME));
  } catch (e) {
    console.error('Failed to save chat message to storage:', e);
  }

  // Sync to Express Backend
  if (typeof window !== 'undefined') {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002/api';
    fetch(`${backendUrl}/chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg),
    }).catch(() => {});
  }

  return newMsg;
}

// Subscribes to real-time chat updates (across tabs & same window)
export function subscribeToChatUpdates(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = () => callback();
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === CHAT_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(CHAT_EVENT_NAME, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(CHAT_EVENT_NAME, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}

// Async sync from backend
export async function syncChatMessagesFromBackend(): Promise<ChatMessage[]> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
    const res = await fetch(`${backendUrl}/chat/messages`).catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data.messages)) {
        const local = getAllChatMessages();
        const map = new Map<string, ChatMessage>();
        local.forEach((m) => map.set(m.id, m));
        data.messages.forEach((m: ChatMessage) => map.set(m.id, m));
        const merged = Array.from(map.values()).sort((a, b) => a.createdAt - b.createdAt);
        if (typeof window !== 'undefined') {
          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(merged));
          window.dispatchEvent(new Event(CHAT_EVENT_NAME));
        }
        return merged;
      }
    }
  } catch (e) {}
  return getAllChatMessages();
}

export function clearChatMessages() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    window.dispatchEvent(new Event(CHAT_EVENT_NAME));
  }
}
