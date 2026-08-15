'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  UserCheck,
  UserX,
  Building2,
  RefreshCw,
  Crown,
} from 'lucide-react';
import { getLeaveRequests, saveLeaveRequest, updateLeaveStatus, LeaveRequest } from '../../lib/leaveStore';
import { useAuth } from '../../context/AuthContext';
import { EmptyState, Modal, Badge } from '../../components/ui';

export default function LeavePage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState<'CASUAL' | 'SICK' | 'ANNUAL' | 'MATERNITY' | 'EMERGENCY'>('CASUAL');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]);
  const [notification, setNotification] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN' || (user?.designation || '').toLowerCase().includes('admin') || (user?.department || '').toLowerCase().includes('admin');

  const loadLeaves = () => {
    const data = getLeaveRequests();
    setLeaves(data);
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const newLeave = saveLeaveRequest({
      employeeId: user?.employeeId || 'EMS-001',
      employeeName: user?.fullName || 'EMS Staff Member',
      employeeEmail: user?.email || '',
      department: user?.department || 'Software Engineering',
      designation: user?.designation || 'Software Engineer',
      leaveType,
      startDate,
      endDate,
      reason,
    });

    setLeaves(newLeave);
    setIsModalOpen(false);
    setReason('');

    setNotification('Leave application submitted successfully! Pending Admin approval.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAdminDecision = (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    const adminName = user?.fullName || 'System Admin';
    const updated = updateLeaveStatus(leaveId, status, adminName);
    setLeaves(updated);

    setNotification(
      status === 'APPROVED'
        ? 'Leave request APPROVED by Admin successfully!'
        : 'Leave request REJECTED by Admin.'
    );
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter leaves: Admin sees all, employee sees their own leaves
  const myLeaves = leaves.filter((l) => l.employeeId === user?.employeeId || l.employeeEmail === user?.email);
  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 inline" /> Leave Management & Admin Approvals
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-400" /> Employee Leaves & Admin Approval Portal
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Employees apply for leave → Requests auto-route to Admin Portal → Admin Approves / Rejects in 1-click.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Apply for Leave
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Approval Section (VISIBLE ONLY TO ADMIN) */}
      {isAdmin && (
        <div className="p-6 rounded-2xl bg-gray-900/60 border border-amber-500/30 backdrop-blur-md space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-3 h-3 inline" /> Admin Only Approval Portal
                </span>
              </div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" /> Admin Leave Approvals Control Center
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Leave requests submitted by any employee on any profile route here for Admin approval.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
              Pending Admin Approvals: {pendingLeaves.length}
            </span>
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-gray-950/60 border border-gray-800 text-xs text-gray-400">
              No pending leave applications requiring Admin approval.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingLeaves.map((leave) => (
                <div key={leave.id} className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{leave.employeeName}</h4>
                      <p className="text-[11px] text-gray-400">{leave.department} ({leave.designation})</p>
                    </div>
                    <Badge variant="warning">PENDING APPROVAL</Badge>
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-900/80 text-[11px] space-y-1">
                    <div className="flex justify-between text-gray-300">
                      <span>Leave Type:</span>
                      <strong className="text-indigo-400">{leave.leaveType} LEAVE</strong>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Dates:</span>
                      <strong className="text-white">{leave.startDate} to {leave.endDate}</strong>
                    </div>
                    <div className="mt-1 text-gray-400 italic">
                      "{leave.reason}"
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-800/80">
                    <button
                      onClick={() => handleAdminDecision(leave.id, 'REJECTED')}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 flex items-center gap-1"
                    >
                      <UserX className="w-3.5 h-3.5" /> Reject Leave
                    </button>
                    <button
                      onClick={() => handleAdminDecision(leave.id, 'APPROVED')}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Approve Leave
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Employee My Leaves Table */}
      <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-indigo-400" />
          {isAdmin ? 'All Submitted Leave Applications Master List' : 'My Leave Applications & Approval Status'}
        </h3>

        {(isAdmin ? leaves : myLeaves).length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No Leave Applications Found"
            description="Click 'Apply for Leave' to submit a casual, sick, or annual leave application for Admin approval."
            actionLabel="Apply for Leave"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="bg-gray-950/80 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/80 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-6">Employee Name</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Leave Type</th>
                  <th className="py-3.5 px-6">Dates</th>
                  <th className="py-3.5 px-6">Reason</th>
                  <th className="py-3.5 px-6 text-right">Approval Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {(isAdmin ? leaves : myLeaves).map((l) => (
                  <tr key={l.id} className="hover:bg-gray-900/40">
                    <td className="py-4 px-6 font-bold text-white">{l.employeeName}</td>
                    <td className="py-4 px-6 text-gray-400">{l.department}</td>
                    <td className="py-4 px-6 text-indigo-400 font-semibold">{l.leaveType}</td>
                    <td className="py-4 px-6 text-gray-300 font-mono">{l.startDate} to {l.endDate}</td>
                    <td className="py-4 px-6 text-gray-300 max-w-xs truncate">{l.reason}</td>
                    <td className="py-4 px-6 text-right">
                      <Badge variant={l.status === 'APPROVED' ? 'success' : l.status === 'REJECTED' ? 'danger' : 'warning'}>
                        {l.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Apply for Leave (Auto-Routes to Admin Approval)">
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Leave Category</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="CASUAL">Casual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="ANNUAL">Annual Leave</option>
              <option value="EMERGENCY">Emergency Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Reason for Leave *</label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detail your reason for leave application..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg">
              Submit to Admin for Approval
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
