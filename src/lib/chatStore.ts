export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  recipientId: string; // 'ALL' or specific employeeId / userId
  recipientName: string;
  channel: 'TEAM' | 'DIRECT';
  content: string;
  timestamp: string;
  createdAt: number;
}

const CHAT_STORAGE_KEY = 'pj_erp_chat_messages_v1';
const CHAT_EVENT_NAME = 'pj_chat_updated';

// Helper to retrieve all messages from persistent storage
export function getAllChatMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse chat messages:', e);
    return [];
  }
}

// Retrieves filtered chat messages for Team channel or Direct DM between two users
export function getFilteredMessages(
  channel: 'TEAM' | 'DIRECT',
  currentUserId?: string,
  peerId?: string
): ChatMessage[] {
  const all = getAllChatMessages();

  if (channel === 'TEAM') {
    return all.filter((m) => m.channel === 'TEAM');
  }

  if (channel === 'DIRECT' && currentUserId && peerId) {
    return all.filter(
      (m) =>
        m.channel === 'DIRECT' &&
        ((m.senderId === currentUserId && m.recipientId === peerId) ||
          (m.senderId === peerId && m.recipientId === currentUserId))
    );
  }

  return all.filter((m) => m.channel === 'DIRECT');
}

// Sends a new message and notifies all tabs/components in real-time
export function sendChatMessage(
  msg: Omit<ChatMessage, 'id' | 'createdAt' | 'timestamp'>
): ChatMessage {
  const all = getAllChatMessages();
  const now = new Date();

  const newMsg: ChatMessage = {
    ...msg,
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now.getTime(),
    timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const updated = [...all, newMsg];

  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom event for same-tab reactivity
    window.dispatchEvent(new Event(CHAT_EVENT_NAME));
  } catch (e) {
    console.error('Failed to save chat message:', e);
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
