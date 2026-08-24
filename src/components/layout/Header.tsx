'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Clock,
  User,
  LogOut,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  FolderKanban,
  MessageSquare,
  CheckSquare,
  ShieldAlert,
  Crown,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  getNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  SystemNotification,
} from '../../lib/notificationStore';

interface HeaderProps {
  userRole?: string;
  userName?: string;
  emsEmployeeId?: string;
  avatarUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
  userRole = 'EMPLOYEE',
  userName = 'EMS Employee',
  emsEmployeeId = 'EMS-USER',
  avatarUrl,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const { user, logout } = useAuth();
  const router = useRouter();
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    if (!user) return;
    const userNotifs = getNotificationsForUser(user);
    setNotifications(userNotifs);
  };

  useEffect(() => {
    loadNotifications();

    const handleNotifUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('storage', handleNotifUpdate);
    window.addEventListener('pj_system_notification_event', handleNotifUpdate);
    window.addEventListener('pj_crm_updated', handleNotifUpdate);

    return () => {
      window.removeEventListener('storage', handleNotifUpdate);
      window.removeEventListener('pj_system_notification_event', handleNotifUpdate);
      window.removeEventListener('pj_crm_updated', handleNotifUpdate);
    };
  }, [user]);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    logout();
    router.push('/login');
  };

  const handleNotificationClick = (notif: SystemNotification) => {
    markNotificationAsRead(notif.id);
    loadNotifications();
    setShowNotifications(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(user?.employeeId, user?.id);
    loadNotifications();
  };

  const handleClearAll = () => {
    clearAllNotifications();
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIconForType = (type: SystemNotification['type']) => {
    switch (type) {
      case 'PROJECT_ASSIGN':
        return <FolderKanban className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'CHAT_MESSAGE':
        return <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'TIMESHEET_CREATED':
      case 'TIMESHEET_DONE':
        return <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'QUALITY_SENT':
      case 'QUALITY_APPROVED':
        return <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'ADMIN_APPROVED':
        return <Crown className="w-4 h-4 text-amber-400 shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <header className="h-16 border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input */}
      <div className="w-80 relative">
        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search projects, tasks, clients, EMS employees..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-900/90 border border-gray-800 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
      </div>

      {/* Right Tools & Profile */}
      <div className="flex items-center gap-4">
        {/* Attendance Live Timer Toggle */}
        <button
          onClick={() => setIsClockedIn(!isClockedIn)}
          className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
            isClockedIn
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${isClockedIn ? 'animate-pulse text-emerald-400' : ''}`} />
          <span>{isClockedIn ? 'Working (Active)' : 'Clock In Work'}</span>
        </button>

        {/* System Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              loadNotifications();
            }}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors relative"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <>
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center px-1 shadow-lg shadow-rose-600/40 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
                <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-rose-500 animate-ping opacity-75" />
              </>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-88 sm:w-96 bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl p-4 z-50 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> System Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-gray-400 hover:text-indigo-400 font-semibold flex items-center gap-1"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>Read all</span>
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-[10px] text-gray-400 hover:text-rose-400 font-semibold flex items-center gap-1 ml-1"
                      title="Clear all notifications"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs space-y-1">
                  <Bell className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <p className="font-bold text-gray-300">No Notifications Yet</p>
                  <p className="text-[10px] text-gray-500">Live system events, project assignments, messages, and timesheets will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        notif.read
                          ? 'bg-gray-900/40 border-gray-800/80 opacity-75 hover:opacity-100 hover:bg-gray-900'
                          : 'bg-gray-900 border-indigo-500/40 shadow-sm hover:border-indigo-500'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-gray-950 border border-gray-800 mt-0.5">
                        {getIconForType(notif.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`text-[11px] font-bold truncate ${notif.read ? 'text-gray-300' : 'text-white'}`}>
                            {notif.title}
                          </span>
                          <span className="text-[9px] text-gray-500 shrink-0">{formatTimeAgo(notif.createdAt)}</span>
                        </div>
                        <p className="text-[11px] text-gray-300 leading-snug break-words">
                          {notif.message}
                        </p>
                        <div className="mt-1 flex items-center justify-between text-[10px]">
                          <span className="text-indigo-400 font-medium">By: {notif.senderName}</span>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-900 transition-colors border border-transparent hover:border-gray-800"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className="w-8 h-8 rounded-xl object-cover border border-indigo-500/40"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-600/20">
                {(userName || 'EMS Employee').substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-white leading-tight">{userName}</p>
              <p className="text-[10px] text-indigo-400 font-semibold">{userRole}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-3 z-50 animate-scaleUp">
              <div className="p-2 border-b border-gray-800 mb-2">
                <p className="text-xs font-bold text-white">{userName}</p>
                <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 inline" /> EMS ID: {emsEmployeeId}
                </p>
              </div>

              <div className="space-y-1">
                <Link
                  href="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>My Profile & EMS Data</span>
                </Link>
              </div>

              <div className="border-t border-gray-800 pt-2 mt-2">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors w-full text-left font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sign Out (Revoke Session)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
