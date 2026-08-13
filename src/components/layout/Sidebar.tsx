'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import erpLogo from '../../../logo/Erp.png';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Building2,
  TrendingUp,
  CalendarDays,
  FileSpreadsheet,
  Video,
  MessageSquare,
  FileText,
  DollarSign,
  ShieldAlert,
  BarChart3,
  Bell,
  UserCircle,
  Settings,
  ShieldCheck,
  Building,
  Crown,
} from 'lucide-react';

interface SidebarProps {
  role?: string;
  emsEmployeeId?: string;
  department?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role = 'EMPLOYEE',
  emsEmployeeId = 'EMS-1001',
  department = 'Software Engineering',
}) => {
  const pathname = usePathname();

  const userDept = (department || '').toUpperCase();
  const userRole = role || 'EMPLOYEE';
  const isTeamLeadOrAdmin = userRole === 'ADMIN' || userRole === 'TEAM_LEAD';
  const isQualityDept = userRole === 'QA' || userDept.includes('QUALITY');

  const navigationGroups = [
    {
      title: 'CORE OPERATIONAL HUB',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        ...(isTeamLeadOrAdmin ? [{ name: 'Projects (TL)', href: '/projects', icon: FolderKanban }] : []),
        { name: 'Tasks Workflow', href: '/tasks', icon: CheckSquare },
      ],
    },
    {
      title: 'CLIENTS & CRM',
      items: [
        { name: 'Clients', href: '/clients', icon: Building2 },
        { name: 'CRM & Pipeline', href: '/crm', icon: TrendingUp },
      ],
    },
    {
      title: 'TIME & WORKFORCE',
      items: [
        { name: 'Leave Management', href: '/leave', icon: CalendarDays },
        { name: 'Timesheets', href: '/timesheet', icon: FileSpreadsheet },
        { name: 'Meetings', href: '/meetings', icon: Video },
      ],
    },
    {
      title: 'COLLABORATION',
      items: [
        { name: 'Communication', href: '/communication', icon: MessageSquare },
        { name: 'Documents', href: '/documents', icon: FileText },
      ],
    },
    {
      title: 'BUSINESS & QUALITY',
      items: [
        { name: 'Finance & Invoices', href: '/finance', icon: DollarSign },
        ...(isQualityDept || isTeamLeadOrAdmin ? [{ name: 'Quality / AGM Testing', href: '/quality', icon: ShieldAlert }] : []),
        { name: 'Executive Reports', href: '/reports', icon: BarChart3 },
      ],
    },
    {
      title: 'SYSTEM & PERSONAL',
      items: [
        { name: 'Notifications', href: '/notifications', icon: Bell },
        { name: 'My Profile', href: '/profile', icon: UserCircle },
        { name: 'RBAC Permissions', href: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-gray-950/95 border-r border-gray-800/80 flex flex-col h-screen sticky top-0 z-40 select-none backdrop-blur-xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-gray-800/80 flex items-center gap-3">
        <img
          src={typeof erpLogo === 'string' ? erpLogo : erpLogo.src}
          alt="PJSOFONIC ERP Logo"
          className="w-10 h-10 object-contain rounded-xl border border-indigo-500/30 bg-gray-900/80 p-1 shadow-lg shadow-indigo-600/20"
        />
        <div>
          <h1 className="font-extrabold text-white text-base tracking-wider flex items-center gap-1">
            PJSOFONIC <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">ERP</span>
          </h1>
          <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Agency Software Suite</p>
        </div>
      </div>

      {/* EMS Authentication Badge */}
      <div className="mx-4 my-3 px-3 py-2 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-gray-300 font-medium text-[11px]">EMS Verified</span>
        </div>
        <span className="text-[10px] font-mono text-indigo-400 font-semibold">{emsEmployeeId}</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5 custom-scrollbar">
        {navigationGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            <h2 className="px-3 text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-2">
              {group.title}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/90 to-indigo-700/90 text-white shadow-md shadow-indigo-600/20 border border-indigo-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-900/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110 text-white' : 'text-gray-400'}`} />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer User Info */}
      <div className="p-4 border-t border-gray-800/80 bg-gray-950/80 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
            {userRole === 'TEAM_LEAD' ? <Crown className="w-4 h-4 text-amber-400" /> : 'EM'}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">{department}</p>
            <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 inline" /> {userRole}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
