'use client';

import React, { useState } from 'react';
import { Settings, ShieldCheck, Lock, Key, Users, Crown } from 'lucide-react';
import { ModuleType, ActionType } from '@/lib/rbac';
import { Badge } from '@/components/ui/Badge';

export default function SettingsPage() {
  const [selectedRole, setSelectedRole] = useState('TEAM_LEAD');

  const roles = [
    { name: 'TEAM_LEAD', description: 'Department Team Leader managing project breakdowns & staff task assignments' },
    { name: 'EMPLOYEE', description: 'Registered staff member executing tasks & time logging' },
    { name: 'QA', description: 'Quality & AGM Quality testing staff verifying completed projects' },
    { name: 'FINANCE', description: 'Financial billing and invoicing manager' },
  ];

  const modules: ModuleType[] = [
    'PROJECTS',
    'TASKS',
    'EMPLOYEES',
    'CLIENTS',
    'CRM',
    'ATTENDANCE',
    'LEAVE',
    'TIMESHEET',
    'MEETINGS',
    'COMMUNICATION',
    'DOCUMENTS',
    'FINANCE',
    'QUALITY',
    'REPORTS',
    'SETTINGS',
  ];

  const actions: ActionType[] = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT', 'ASSIGN'];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase">
              EMS Role Permission Matrix
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" /> ERP Role Authorization Matrix
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Authorization matrix for registered EMS employee roles (Team Leader, Employee, Quality/AGM Quality, Finance).
          </p>
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
        {roles.map((role) => (
          <button
            key={role.name}
            onClick={() => setSelectedRole(role.name)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              selectedRole === role.name
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30'
                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
            }`}
          >
            {role.name === 'TEAM_LEAD' ? <Crown className="w-4 h-4 text-amber-400" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{role.name}</span>
          </button>
        ))}
      </div>

      {/* Selected Role Description Box */}
      <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800/80 text-xs flex items-center justify-between">
        <div>
          <span className="text-indigo-400 font-bold uppercase text-[10px]">EMS Role Profile</span>
          <h3 className="text-sm font-bold text-white mt-0.5">{selectedRole}</h3>
          <p className="text-gray-400 text-[11px] mt-0.5">
            {roles.find((r) => r.name === selectedRole)?.description}
          </p>
        </div>
        <Badge variant="purple">EMS VERIFIED PERMISSIONS</Badge>
      </div>

      {/* Authorization Matrix Table */}
      <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Module Action Authorization Matrix</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-950/60 text-gray-400 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-6">ERP Module</th>
                {actions.map((act) => (
                  <th key={act} className="py-3.5 px-4 text-center">
                    {act}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {modules.map((mod) => (
                <tr key={mod} className="hover:bg-gray-900/40">
                  <td className="py-3.5 px-6 font-bold text-white tracking-wide">{mod}</td>
                  {actions.map((act) => (
                    <td key={act} className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs">
                        ✓
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
