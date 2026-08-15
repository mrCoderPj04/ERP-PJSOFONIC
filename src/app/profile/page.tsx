'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCircle,
  ShieldCheck,
  Crown,
  TrendingUp,
  FolderKanban,
  Building2,
  RefreshCw,
  Layers,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  CalendarDays,
  UserCheck,
  UserX,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchCrmCustomerProjects, saveCrmProject, CrmCustomerProject } from '../../lib/crm';
import { getLeaveRequests, saveLeaveRequest, updateLeaveStatus, LeaveRequest } from '../../lib/leaveStore';
import { Badge, EmptyState, Modal } from '../../components/ui';

export default function ProfilePage() {
  const { user } = useAuth();
  const [crmProjects, setCrmProjects] = useState<CrmCustomerProject[]>([]);
  const [loadingCrm, setLoadingCrm] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Leave State
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveType, setLeaveType] = useState<'CASUAL' | 'SICK' | 'ANNUAL' | 'EMERGENCY'>('CASUAL');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]);
  const [notification, setNotification] = useState<string | null>(null);

  // New Project Form State
  const [title, setTitle] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [departmentScope, setDepartmentScope] = useState('Software Engineering');
  const [requirements, setRequirements] = useState('');
  const [value, setValue] = useState('');

  // Admin Check
  const isAdmin = user?.role === 'ADMIN' || (user?.designation || '').toLowerCase().includes('admin') || (user?.department || '').toLowerCase().includes('admin');

  // Flexible Team Leader / Department detection
  const isTeamLeader =
    user?.role === 'TEAM_LEAD' ||
    isAdmin ||
    (user?.department || '').toLowerCase().includes('lead') ||
    (user?.department || '').toLowerCase().includes('leader') ||
    (user?.department || '').toLowerCase().includes('tl') ||
    (user?.designation || '').toLowerCase().includes('lead') ||
    (user?.designation || '').toLowerCase().includes('leader') ||
    (user?.designation || '').toLowerCase().includes('tl') ||
    (user?.designation || '').toLowerCase().includes('manager') ||
    (user?.designation || '').toLowerCase().includes('head') ||
    (user?.designation || '').toLowerCase().includes('director');

  const loadCrmActiveProjects = async () => {
    setLoadingCrm(true);
    try {
      const projects = await fetchCrmCustomerProjects();
      const activeOnly = projects.filter((p) => p.status !== 'COMPLETED');
      setCrmProjects(activeOnly);
    } catch (e) {
      console.error('Failed to load active CRM projects on profile', e);
    } finally {
      setLoadingCrm(false);
    }
  };

  const loadLeaves = () => {
    const data = getLeaveRequests();
    setLeaves(data);
  };

  useEffect(() => {
    if (user) {
      loadCrmActiveProjects();
      loadLeaves();
    }
  }, [user]);

  const handleCreateCrmProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newProj = {
      projectName: title,
      customerName: customerName || 'Valued Client',
      customerEmail: customerEmail || 'client@crm.com',
      departmentScope: departmentScope || user?.department || 'Software Engineering',
      requirements: requirements || 'Customer scope created for Team Leader profile.',
      budget: parseFloat(value) || 35000,
      status: 'ACTIVE' as const,
    };

    saveCrmProject(newProj);
    loadCrmActiveProjects();
    setIsModalOpen(false);

    setTitle('');
    setCustomerName('');
    setCustomerEmail('');
    setRequirements('');
    setValue('');
  };

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
      reason: leaveReason,
    });

    setLeaves(newLeave);
    setIsLeaveModalOpen(false);
    setLeaveReason('');

    setNotification('Leave application submitted! Pending Admin approval.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAdminDecision = (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    const adminName = user?.fullName || 'System Admin';
    const updated = updateLeaveStatus(leaveId, status, adminName);
    setLeaves(updated);

    setNotification(
      status === 'APPROVED' ? 'Leave request APPROVED by Admin!' : 'Leave request REJECTED by Admin.'
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const myLeaves = leaves.filter((l) => l.employeeId === user?.employeeId || l.employeeEmail === user?.email);
  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING');

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-indigo-400" /> Employee Profile & Live EMS Metadata
          </h1>
          <p className="text-xs text-gray-400 mt-1">Identity master details retrieved live from PJSOFONIC EMS authentication gateway.</p>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-4 lg:col-span-1 h-fit">
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
                {isTeamLeader && (
                  <span title="Team Leader">
                    <Crown className="w-4 h-4 text-amber-400 inline" />
                  </span>
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

        {/* Main Content Area: CRM Active Projects & Leaves Control Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* LEAVES SECTION WITH ADMIN APPROVAL PORTAL */}
          <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                    Leaves & Approvals
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2 mt-1">
                  <CalendarDays className="w-5 h-5 text-indigo-400" /> Apply for Leave & Approvals
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Employees apply for leaves here. All employee leave applications route to Admin for Approval.
                </p>
              </div>

              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> Apply for Leave
              </button>
            </div>

            {/* ADMIN ONLY LEAVE APPROVAL CONTROL CENTER */}
            {isAdmin && (
              <div className="p-4 rounded-xl bg-gray-950/90 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-2">
                  <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 inline" /> Admin Approval for Employee Leaves ({pendingLeaves.length} Pending)
                  </span>
                  <a href="/leave" className="text-[11px] font-bold text-indigo-400 hover:underline">
                    View Full Portal →
                  </a>
                </div>

                {pendingLeaves.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-2">
                    No pending employee leave requests requiring Admin approval right now.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pendingLeaves.map((leave) => (
                      <div key={leave.id} className="p-3 rounded-lg bg-gray-900 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-white">{leave.employeeName} <span className="text-gray-400 font-normal">({leave.department})</span></p>
                          <p className="text-gray-400 text-[11px]"><strong className="text-indigo-400">{leave.leaveType} LEAVE</strong>: {leave.startDate} to {leave.endDate}</p>
                          <p className="text-gray-500 italic text-[11px]">"{leave.reason}"</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleAdminDecision(leave.id, 'REJECTED')}
                            className="px-3 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold border border-rose-500/30 flex items-center gap-1"
                          >
                            <UserX className="w-3 h-3" /> Reject
                          </button>
                          <button
                            onClick={() => handleAdminDecision(leave.id, 'APPROVED')}
                            className="px-3.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow flex items-center gap-1"
                          >
                            <UserCheck className="w-3 h-3" /> Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MY LEAVES STATUS LIST */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                {isAdmin ? 'All Submitted Employee Leaves Summary' : 'My Leave Applications & Status'}
              </h4>
              {(isAdmin ? leaves : myLeaves).length === 0 ? (
                <p className="text-xs text-gray-500 italic py-2">No leave applications submitted yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(isAdmin ? leaves : myLeaves).map((leave) => (
                    <div key={leave.id} className="p-3 rounded-xl bg-gray-950/60 border border-gray-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{leave.employeeName}</span>
                        <span className="text-indigo-400 ml-2 font-semibold">[{leave.leaveType}]</span>
                        <p className="text-[11px] text-gray-400">{leave.startDate} to {leave.endDate} - "{leave.reason}"</p>
                      </div>
                      <Badge variant={leave.status === 'APPROVED' ? 'success' : leave.status === 'REJECTED' ? 'danger' : 'warning'}>
                        {leave.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CRM ACTIVE PROJECTS SECTION */}
          <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                    Team Leader Direct Profile Fetch
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2 mt-1">
                  <TrendingUp className="w-5 h-5 text-indigo-400" /> CRM Active Projects
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Direct live customer projects fetched from CRM for your Team Leader department profile.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Active Project</span>
                </button>
                <button
                  onClick={loadCrmActiveProjects}
                  disabled={loadingCrm}
                  className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs border border-gray-700 transition-all flex items-center justify-center gap-1 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingCrm ? 'animate-spin' : ''}`} />
                  <span>Fetch</span>
                </button>
              </div>
            </div>

            {!isTeamLeader ? (
              <div className="p-6 rounded-xl bg-gray-950/80 border border-gray-800 text-center space-y-2">
                <Crown className="w-8 h-8 text-gray-600 mx-auto" />
                <h4 className="text-sm font-bold text-gray-300">Team Leader Profile Integration</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  CRM active project direct fetch is tailored for Department Team Leaders. Your profile department is logged as <strong className="text-indigo-400">{user.department} ({user.designation})</strong>.
                </p>
              </div>
            ) : loadingCrm ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs text-gray-400 font-medium">Directly fetching active CRM projects for Team Leader...</p>
              </div>
            ) : crmProjects.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No Active CRM Projects Found"
                description="Click 'Add Active Project' or create a project in CRM Hub to fetch active projects directly on your profile."
                actionLabel="Create Active CRM Project"
                onAction={() => setIsModalOpen(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {crmProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-5 rounded-xl bg-gray-950/80 border border-gray-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                          {project.projectCode}
                        </span>
                        <Badge variant={project.status === 'TL_DECOMPOSED' ? 'success' : 'info'}>
                          {project.status === 'TL_DECOMPOSED' ? 'TL DECOMPOSED' : 'DISPATCHED BY CRM ADMIN'}
                        </Badge>
                      </div>

                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {project.projectName}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-500 shrink-0" /> {project.customerName}
                      </p>

                      <div className="mt-2.5 p-2.5 rounded-lg bg-gray-900/60 border border-gray-800/80 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-gray-400">
                          <span>Department Scope:</span>
                          <span className="text-indigo-300 font-semibold">{project.departmentScope}</span>
                        </div>
                        {project.targetTeamLeadName && (
                          <div className="flex items-center justify-between text-gray-400">
                            <span>Assigned TL:</span>
                            <span className="text-amber-400 font-semibold">{project.targetTeamLeadName}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-gray-400">
                          <span>Project Budget:</span>
                          <span className="text-emerald-400 font-bold">${project.budget.toLocaleString()}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 mt-2 line-clamp-2 italic bg-gray-900/30 p-2 rounded">
                        "{project.requirements}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
                      <span className="text-gray-500 text-[11px]">
                        Created: {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                      <a
                        href="/projects"
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 shadow transition-all"
                      >
                        <span>Breakdown & Assign</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} title="Apply for Leave (Auto-Routes to Admin Approval)">
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
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="Detail your reason for leave application..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg">
              Submit to Admin for Approval
            </button>
          </div>
        </form>
      </Modal>

      {/* Inline Create Active CRM Project Modal for Profile */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Active CRM Project for Team Leader">
        <form onSubmit={handleCreateCrmProject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Enterprise CRM Integration API"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Client Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Apex Global Corp"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Client Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. client@apex.com"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Department Scope</label>
              <input
                type="text"
                value={departmentScope}
                onChange={(e) => setDepartmentScope(e.target.value)}
                placeholder="e.g. Software Engineering"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Project Budget ($) *</label>
              <input
                type="number"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 45000"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Requirements & Scope</label>
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Detail the active project scope for Team Leader breakdown..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg">
              Save Active CRM Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
