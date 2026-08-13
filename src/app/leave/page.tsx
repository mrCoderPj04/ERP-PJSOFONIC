'use client';

import React, { useState } from 'react';
import { CalendarDays, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

export default function LeavePage() {
  const [leaves, setLeaves] = useState<any[]>([]); // Clean install empty state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState('CASUAL');

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const newLeave = {
      id: `leave-${Date.now()}`,
      employee: 'Verified EMS Employee',
      leaveType,
      reason,
      dates: '2026-08-20 to 2026-08-22',
      status: 'PENDING',
    };
    setLeaves([newLeave, ...leaves]);
    setIsModalOpen(false);
    setReason('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-400" /> Leave Management & Approvals
          </h1>
          <p className="text-xs text-gray-400 mt-1">Apply Leave → Manager / HR Approval → Leave Calendar Update.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Apply for Leave
        </button>
      </div>

      {leaves.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No Leave Applications Submitted"
          description="Submit casual, sick, or annual leave applications for Project Manager and HR approval."
          actionLabel="Apply For Leave"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-md">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-950/60 text-gray-400 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-6">Employee</th>
                <th className="py-3.5 px-6">Leave Type</th>
                <th className="py-3.5 px-6">Dates</th>
                <th className="py-3.5 px-6">Reason</th>
                <th className="py-3.5 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {leaves.map((l) => (
                <tr key={l.id} className="hover:bg-gray-900/40">
                  <td className="py-4 px-6 font-bold text-white">{l.employee}</td>
                  <td className="py-4 px-6 text-gray-300">{l.leaveType}</td>
                  <td className="py-4 px-6 text-gray-400">{l.dates}</td>
                  <td className="py-4 px-6 text-gray-300">{l.reason}</td>
                  <td className="py-4 px-6 text-right">
                    <Badge variant="warning">{l.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Leave Application">
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Leave Category</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="CASUAL">Casual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="ANNUAL">Annual Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Reason for Leave *</label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State reason..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg">
              Submit Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
