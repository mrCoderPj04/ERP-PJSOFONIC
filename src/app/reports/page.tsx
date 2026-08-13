'use client';

import React from 'react';
import { BarChart3, Download, TrendingUp, Users, FolderKanban, DollarSign } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" /> Executive Analytics & Management Reports
          </h1>
          <p className="text-xs text-gray-400 mt-1">Cross-module insights: Project Performance, EMS Staff Productivity, Financial P&L, Attendance Audits.</p>
        </div>
        <button className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2">
          <Download className="w-4 h-4" /> Export Executive PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md">
          <FolderKanban className="w-6 h-6 text-indigo-400 mb-2" />
          <h3 className="text-sm font-bold text-white">Project Reports</h3>
          <p className="text-xs text-gray-400 mt-1">Delivery velocities, sprint milestones & blockers.</p>
        </div>
        <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md">
          <Users className="w-6 h-6 text-emerald-400 mb-2" />
          <h3 className="text-sm font-bold text-white">Employee Reports</h3>
          <p className="text-xs text-gray-400 mt-1">Task completion metrics & timesheet utilization.</p>
        </div>
        <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md">
          <DollarSign className="w-6 h-6 text-sky-400 mb-2" />
          <h3 className="text-sm font-bold text-white">Finance Reports</h3>
          <p className="text-xs text-gray-400 mt-1">Gross revenue, project profitability & expense audits.</p>
        </div>
        <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md">
          <TrendingUp className="w-6 h-6 text-amber-400 mb-2" />
          <h3 className="text-sm font-bold text-white">Management Reports</h3>
          <p className="text-xs text-gray-400 mt-1">High-level executive KPIs & agency health summary.</p>
        </div>
      </div>
    </div>
  );
}
