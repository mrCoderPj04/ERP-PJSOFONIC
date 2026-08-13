'use client';

import React from 'react';
import { Bell, Sparkles, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotificationsPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-400" /> Event-Driven Notification Architecture
          </h1>
          <p className="text-xs text-gray-400 mt-1">Automatic notifications triggered on Project/Task assignments, work submissions, leave approvals, & meeting invites.</p>
        </div>
      </div>

      <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-6">
        <EmptyState
          icon={Bell}
          title="No Recent Notifications"
          description="System event triggers automatically generate real-time notifications for assigned projects, task reviews, leave responses, and meeting invites."
        />
      </div>
    </div>
  );
}
