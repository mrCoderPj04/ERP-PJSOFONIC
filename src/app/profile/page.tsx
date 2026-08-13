'use client';

import React from 'react';
import { UserCircle, ShieldCheck, Mail, Phone, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-indigo-400" /> Employee Profile & Live EMS Metadata
          </h1>
          <p className="text-xs text-gray-400 mt-1">Identity master details retrieved live from PJSOFONIC EMS authentication gateway.</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-4 max-w-xl">
        <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
          <div className="relative">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-16 h-16 rounded-2xl object-cover border border-indigo-500/40"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 border border-indigo-500/30 flex items-center justify-center text-white font-extrabold text-xl shadow-lg">
              {(user.fullName || 'EMS Employee').substring(0, 2).toUpperCase()}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {user.fullName}
              {user.role === 'TEAM_LEAD' && (
                <Crown className="w-4 h-4 text-amber-400 inline" />
              )}
            </h2>
            <p className="text-xs text-indigo-400 font-mono flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" /> EMS ID: {user.employeeId}
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-2 border-b border-gray-800/60">
            <span className="text-gray-400">Designation:</span>
            <span className="text-white font-medium">{user.designation}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-800/60">
            <span className="text-gray-400">Department:</span>
            <span className="text-white font-medium">{user.department}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-800/60">
            <span className="text-gray-400">EMS Email Address:</span>
            <span className="text-white font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-800/60">
            <span className="text-gray-400">Contact Number:</span>
            <span className="text-white font-medium">{user.phone || 'Registered in EMS Database'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-800/60">
            <span className="text-gray-400">ERP Access Role:</span>
            <span className="text-amber-400 font-bold">{user.role}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400">EMS Identity Status:</span>
            <span className="text-emerald-400 font-bold">ACTIVE & VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
