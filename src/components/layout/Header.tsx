'use client';

import React, { useState } from 'react';
import { Search, Bell, Clock, User, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

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
  const { logout } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    logout();
    router.push('/login');
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

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-4 z-50 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> System Notifications
                </h4>
                <span className="text-[10px] text-gray-500">Live Events</span>
              </div>
              <div className="text-center py-6 text-gray-400 text-xs">
                <p className="font-medium text-gray-300">No new notifications</p>
                <p className="text-[10px] text-gray-500 mt-1">Events will appear here in real-time.</p>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
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
