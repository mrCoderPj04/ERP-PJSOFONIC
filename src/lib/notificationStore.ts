import { safeString } from './safeString';

export interface SystemNotification {
  id: string;
  type:
    | 'PROJECT_ASSIGN'
    | 'CHAT_MESSAGE'
    | 'TIMESHEET_CREATED'
    | 'TIMESHEET_DONE'
    | 'DELIVERABLES_SUBMITTED'
    | 'QUALITY_SENT'
    | 'QUALITY_APPROVED'
    | 'ADMIN_APPROVED'
    | 'SYSTEM_ALERT';
  title: string;
  message: string;
  senderId?: string;
  senderName: string;
  recipientId?: string; // specific user ID or 'ALL'
  recipientName?: string;
  recipientRole?: 'ADMIN' | 'TEAM_LEAD' | 'QA' | 'EMPLOYEE' | 'ALL';
  link?: string;
  read: boolean;
  createdAt: string;
}

const NOTIFICATIONS_STORAGE_KEY = 'pj_system_notifications_store';
const NOTIFICATION_EVENT = 'pj_system_notification_event';

export function getStoredNotifications(): SystemNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function addSystemNotification(
  notif: Omit<SystemNotification, 'id' | 'createdAt' | 'read'> & { id?: string; createdAt?: string; read?: boolean }
): SystemNotification {
  const newNotif: SystemNotification = {
    id: notif.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: notif.type,
    title: safeString(notif.title),
    message: safeString(notif.message),
    senderId: notif.senderId ? safeString(notif.senderId) : undefined,
    senderName: safeString(notif.senderName || 'System'),
    recipientId: notif.recipientId ? safeString(notif.recipientId) : 'ALL',
    recipientName: notif.recipientName ? safeString(notif.recipientName) : undefined,
    recipientRole: notif.recipientRole || 'ALL',
    link: notif.link || '/dashboard',
    read: notif.read || false,
    createdAt: notif.createdAt || new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const existing = getStoredNotifications();
      const updated = [newNotif, ...existing.filter((n) => n.id !== newNotif.id)].slice(0, 100);
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: newNotif }));
    } catch (e) {}

    // Background sync to backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
    fetch(`${backendUrl}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotif),
    }).catch(() => {});
  }

  return newNotif;
}

export function markNotificationAsRead(id: string): SystemNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getStoredNotifications();
    const updated = existing.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT));
    return updated;
  } catch (e) {
    return [];
  }
}

export function markAllNotificationsAsRead(userEmpId?: string, userId?: string): SystemNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getStoredNotifications();
    const cleanStr = (s?: string) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanUser = cleanStr(userId);
    const cleanEmp = cleanStr(userEmpId);

    const updated = existing.map((n) => {
      const cleanRec = cleanStr(n.recipientId);
      if (
        !n.recipientId ||
        n.recipientId === 'ALL' ||
        cleanRec === cleanUser ||
        cleanRec === cleanEmp
      ) {
        return { ...n, read: true };
      }
      return n;
    });

    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT));
    return updated;
  } catch (e) {
    return [];
  }
}

export function clearAllNotifications(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT));
  } catch (e) {}
}

export function getNotificationsForUser(
  user?: { id?: string; employeeId?: string; role?: string; department?: string; designation?: string; fullName?: string } | null
): SystemNotification[] {
  if (!user) return [];
  const all = getStoredNotifications();

  const cleanStr = (s?: string) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const uIdClean = cleanStr(user.id);
  const uEmpClean = cleanStr(user.employeeId);
  const uNameClean = (user.fullName || '').toLowerCase().trim();
  const uRole = (user.role || '').toUpperCase();
  const uDept = (user.department || '').toUpperCase();
  const uDesig = (user.designation || '').toUpperCase();

  const isAdmin = uRole === 'ADMIN' || uDesig.includes('ADMIN') || uDept.includes('ADMIN');
  const isQa = uRole === 'QA' || uDept.includes('QUALITY') || uDesig.includes('QA');
  const isTl = !isAdmin && !isQa && (uRole === 'TEAM_LEAD' || uRole.includes('LEAD') || uDesig.includes('LEAD') || uDept.includes('LEAD'));

  return all.filter((n) => {
    // 1. Broadcast to all
    if (!n.recipientId || n.recipientId === 'ALL') return true;

    // 2. Direct match by recipient ID or Employee ID
    const recClean = cleanStr(n.recipientId);
    if (uIdClean && (recClean === uIdClean || recClean.includes(uIdClean) || uIdClean.includes(recClean))) return true;
    if (uEmpClean && (recClean === uEmpClean || recClean.includes(uEmpClean) || uEmpClean.includes(recClean))) return true;

    // 3. Match by Recipient Name
    if (n.recipientName && uNameClean && n.recipientName.toLowerCase().includes(uNameClean)) return true;

    // 4. Match by Recipient Role Group
    if (n.recipientRole) {
      if (n.recipientRole === 'ALL') return true;
      if (n.recipientRole === 'ADMIN' && isAdmin) return true;
      if (n.recipientRole === 'QA' && isQa) return true;
      if (n.recipientRole === 'TEAM_LEAD' && (isTl || isAdmin)) return true;
    }

    // 5. Match if sender was current user (to see personal activity in notification feed)
    const senderClean = cleanStr(n.senderId);
    if (senderClean && (senderClean === uIdClean || senderClean === uEmpClean)) return true;

    return false;
  });
}
