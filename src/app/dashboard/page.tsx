'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  CheckSquare,
  Users,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Crown,
  Mail,
  Phone,
  Layers,
  Sparkles,
  Play,
  Check,
  Send,
  Code2,
} from 'lucide-react';
import { fetchCrmCustomerProjects, CrmCustomerProject } from '../../lib/crm';
import { EmptyState, Modal } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { fetchEmsEmployees, EmsUser } from '../../lib/ems';
import { getErpTasks, saveErpTask, submitWorkForTask, ErpTask } from '../../lib/erpStore';

export default function DashboardPage() {
  const { user } = useAuth();
  const [crmProjects, setCrmProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<ErpTask[]>([]);
  const [emsEmployees, setEmsEmployees] = useState<EmsUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Full Stack Work Submission Modal State
  const [submittingTask, setSubmittingTask] = useState<ErpTask | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const projects = await fetchCrmCustomerProjects();
      setCrmProjects(projects);
    } catch (e) {
      console.error('Failed to fetch CRM projects:', e);
    }

    try {
      const allTasks = getErpTasks();
      setTasks(allTasks);
    } catch (e) {
      console.error('Failed to load ERP tasks:', e);
    }

    try {
      const employees = await fetchEmsEmployees();
      setEmsEmployees(employees);
    } catch (e) {
      console.error('Failed to load EMS employees:', e);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle Full Stack Engineer Status Switcher (working <-> Done)
  const handleFullStackStatusChange = (task: ErpTask, newStatus: 'working' | 'Done') => {
    if (newStatus === 'Done') {
      setSubmittingTask(task);
      setSubmissionNotes(task.submittedWork || 'Completed milestone deliverables according to technical specifications.');
      return;
    }

    // Set to working (IN_PROGRESS)
    const existing = getErpTasks();
    const updated = existing.map((t) => (t.id === task.id ? { ...t, status: 'IN_PROGRESS' as const } : t));
    try {
      localStorage.setItem('pj_erp_tasks_store', JSON.stringify(updated));
    } catch (e) {}
    setTasks(updated);

    // Sync to Express Backend if online
    fetch(`http://localhost:5000/api/tasks/${task.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'working' }),
    }).catch(() => {});

    setNotification(`Status for "${task.title}" updated to WORKING (IN_PROGRESS).`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleConfirmSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingTask) return;

    const updated = submitWorkForTask(submittingTask.id, submissionNotes);
    setTasks(updated);

    // Sync to Express Backend
    fetch(`http://localhost:5000/api/tasks/${submittingTask.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Done', submittedWork: submissionNotes }),
    }).catch(() => {});

    setNotification(`Work for "${submittingTask.title}" marked DONE and submitted to Team Leader dashboard!`);
    setTimeout(() => setNotification(null), 5000);

    setSubmittingTask(null);
    setSubmissionNotes('');
  };

  if (!user) return null;

  const userDept = (user?.department || '').toUpperCase();
  const userDesig = (user?.designation || '').toUpperCase();
  const userRole = user?.role || 'EMPLOYEE';
  const isAdmin = userRole === 'ADMIN' || userDesig.includes('ADMIN') || userDept.includes('ADMIN');
  const isTeamLead = userRole === 'TEAM_LEAD' || (!isAdmin && (userDesig.includes('LEAD') || userDesig.includes('MANAGER') || userDesig.includes('TL')));
  const isTeamLeadOrAdmin = isAdmin || isTeamLead;
  const isQualityDept = userRole === 'QA' || userDept.includes('QUALITY');
  const isFullStack = !isAdmin && !isTeamLead && !isQualityDept;

  // Gated Quality Queue: only tasks whose parent project status is 'Done' by the Team Leader
  const qualityQueueTasks = tasks.filter((t) => {
    const isParentDone = crmProjects.some(
      (p) => (p.id === t.projectId || p.projectCode === t.projectCode) && (p.status === 'Done' || p.status === 'COMPLETED')
    );
    const isExplicitQuality = t.id.startsWith('quality-task-');
    return (isParentDone || isExplicitQuality) && (t.status === 'WORK_SUBMITTED' || t.qualityStatus === 'IN PROCESS');
  });
  const qualityQueueCount = qualityQueueTasks.length;

  // Filter projects strictly assigned to this Team Leader (or all for Admin)
  const assignedProjects = isAdmin
    ? crmProjects
    : crmProjects.filter(
        (p) =>
          p.targetTeamLeadId === user.id ||
          p.targetTeamLeadId === user.employeeId ||
          (!!user.fullName && (p.targetTeamLeadName || '').toLowerCase().includes(user.fullName.toLowerCase()))
      );

  // Filter tasks specific to regular employee or team tasks
  const myAssignedTasks = tasks.filter(
    (t) =>
      t.assigneeId === user.id ||
      t.assigneeId === user.employeeId ||
      (!!user.fullName && (t.assigneeName || '').toLowerCase().includes(user.fullName.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Notifications */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. REAL-TIME LOGGED-IN EMS EMPLOYEE PROFILE BANNER CARD */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-gray-900 via-indigo-950/60 to-gray-900 border border-gray-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* Avatar & Main Info */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-600/30 border border-indigo-400/30">
                {(user.fullName || 'EMS Employee')
                  .split(' ')
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || 'EM'}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-gray-950 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-bold">
                  EMS ID: {user.employeeId}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 inline" /> Verified EMS Account
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                {user.fullName}
                {isTeamLead && (
                  <Crown className="w-5 h-5 text-amber-400 inline shrink-0" />
                )}
                {isFullStack && (
                  <Code2 className="w-5 h-5 text-indigo-400 inline shrink-0" />
                )}
              </h1>

              <p className="text-xs text-indigo-300 font-semibold flex items-center gap-2">
                <span>{user.designation}</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-300 font-normal">{user.department}</span>
              </p>
            </div>
          </div>

          {/* Contact Details & Quick Badges */}
          <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800/80 space-y-2 text-xs w-full md:w-auto min-w-[270px]">
            <div className="flex items-center gap-2 text-gray-300">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-mono">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{user.phone || 'Registered in EMS Database'}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-800/80 pt-2 mt-2">
              <span className="text-[10px] text-gray-500 uppercase font-bold">EMS Access Role</span>
              <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                {userRole}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ADMIN VIEW: ACTIVE PROJECT MANAGEMENT */}
      {isAdmin && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Active Projects Control Hub
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{assignedProjects.length}</span>
                <span className="text-xs text-indigo-400 font-semibold">Active Projects Ingested from CRM</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FolderKanban className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  active project
                </h2>
                <p className="text-xs text-gray-400">
                  CRM active projects. Assign them to Team Leaders for technical decomposition and engineer task execution.
                </p>
              </div>

              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold border border-gray-800 transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Projects</span>
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-10 bg-gray-900/40 border border-gray-800 rounded-2xl">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs text-gray-400">Fetching active projects...</p>
              </div>
            ) : assignedProjects.length === 0 ? (
              <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-6">
                <EmptyState
                  icon={FolderKanban}
                  title="No Active Projects Found"
                  description="Projects approved in CRM will appear here for Team Leader delegation."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {assignedProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-md space-y-3 flex flex-col justify-between hover:border-indigo-500/40 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {proj.projectCode}
                        </span>
                        {proj.targetTeamLeadName ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-400" /> STATUS: ASSIGNED ({proj.targetTeamLeadName})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                            STATUS: UNASSIGNED
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white">{proj.projectName}</h3>
                      <p className="text-xs text-gray-400">Client: {proj.customerName}</p>

                      <div className="mt-3 p-3 rounded-xl bg-gray-950 border border-gray-800 text-xs space-y-1.5">
                        <div className="flex justify-between items-center text-gray-400">
                          <span>Department:</span>
                          <span className="font-bold text-indigo-400 flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5" /> {proj.departmentScope}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-gray-400">
                          <span>Assigned TL:</span>
                          {proj.targetTeamLeadName ? (
                            <span className="font-bold text-amber-400">{proj.targetTeamLeadName}</span>
                          ) : (
                            <span className="text-gray-500 italic text-[11px]">Unassigned</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">${proj.budget?.toLocaleString() || '0'}</span>
                      <Link
                        href="/projects"
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1"
                      >
                        <span>{proj.targetTeamLeadName ? `Assign to Team Leader (${proj.targetTeamLeadName})` : 'Assign to Team Leader'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TEAM LEADER DUAL WORKBENCH: SIDE-BY-SIDE 'ASSIGN PROJECT' & 'MY ASSIGNED TASKS' */}
      {isTeamLead && !isAdmin && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* COLUMN 1: ASSIGN PROJECT (FETCHED FROM ADMIN DELEGATION) */}
            <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-md space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                      Admin Delegated Queue
                    </span>
                    <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-1">
                      <Crown className="w-5 h-5 text-amber-400" /> assign Project ({assignedProjects.length})
                    </h3>
                  </div>
                  <Link
                    href="/projects"
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1"
                  >
                    <span>Manage All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Projects assigned to you by Admin. Decompose into technical milestones and assign tasks to Full Stack engineers.
                </p>

                {loading ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs text-gray-400">Fetching assigned projects...</p>
                  </div>
                ) : assignedProjects.length === 0 ? (
                  <div className="p-6 bg-gray-950/60 rounded-xl border border-gray-800 mt-3 text-center">
                    <p className="text-xs text-gray-400 font-medium">No projects assigned to you by Admin yet.</p>
                    <p className="text-[11px] text-gray-500 mt-1">When Admin delegates an approved CRM project to your profile, it will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3 mt-4">
                    {assignedProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-4 rounded-xl bg-gray-950 border border-gray-800/80 hover:border-amber-500/40 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {proj.projectCode}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            STATUS: ASSIGNED TO YOU
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white">{proj.projectName}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Client: <strong className="text-gray-300">{proj.customerName}</strong></span>
                          <span>Budget: <strong className="text-emerald-400">${proj.budget?.toLocaleString() || '0'}</strong></span>
                        </div>

                        <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
                          <span className="text-[11px] text-gray-500">Dept: {proj.departmentScope}</span>
                          <Link
                            href="/projects"
                            className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-[11px] shadow flex items-center gap-1"
                          >
                            <span>TL Breakdown & Assign</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 2: MY ASSIGNED TASKS & TEAM WORKBENCH */}
            <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-md space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                      Engineer Task Progress
                    </span>
                    <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-1">
                      <CheckSquare className="w-5 h-5 text-indigo-400" /> My Assigned Tasks ({myAssignedTasks.length})
                    </h3>
                  </div>
                  <Link
                    href="/tasks"
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1"
                  >
                    <span>View All Tasks</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Technical milestone tasks delegated to team engineers. Review submitted work before marking project Done.
                </p>

                {myAssignedTasks.length === 0 ? (
                  <div className="p-6 bg-gray-950/60 rounded-xl border border-gray-800 mt-3 text-center">
                    <p className="text-xs text-gray-400 font-medium">No tasks currently assigned to your direct queue.</p>
                    <p className="text-[11px] text-gray-500 mt-1">Click "TL Breakdown & Assign" on your assigned project to create engineer tasks.</p>
                  </div>
                ) : (
                  <div className="space-y-3 mt-4">
                    {myAssignedTasks.slice(0, 5).map((t) => (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-white">{t.title}</h4>
                          <p className="text-gray-400 text-[11px]">
                            {t.projectName} • Assignee: <span className="text-indigo-400 font-bold">{t.assigneeName}</span>
                          </p>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border ${
                            t.status === 'WORK_SUBMITTED'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : t.status === 'QUALITY_APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                          }`}
                        >
                          {t.status === 'WORK_SUBMITTED' ? 'DONE (SUBMITTED)' : t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. QUALITY & AGM QUALITY STAFF TESTING HUB */}
      {isQualityDept && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Quality & AGM Audit Testing Queue
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-400">{qualityQueueCount}</span>
                <span className="text-xs text-rose-300 font-semibold">Transferred by Team Leader (Status Done) → Awaiting Quality Verification</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" /> Quality Testing Queue (Quality & AGM Department)
                </h3>
                <p className="text-xs text-gray-400">
                  When Team Leader marks project status as "Done", it unlocks here on your Quality Desk for audit verification & QMS sync.
                </p>
              </div>
              <Link
                href="/quality"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
              >
                Open Quality Testing Desk ({qualityQueueCount}) →
              </Link>
            </div>

            {qualityQueueTasks.length === 0 ? (
              <p className="text-xs text-gray-500 italic p-4 bg-gray-950/60 rounded-xl border border-gray-800">
                No work currently waiting for Quality Testing. When Team Leader marks a project status as "Done", its tasks will automatically route here for Quality Testing.
              </p>
            ) : (
              <div className="space-y-2">
                {qualityQueueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono font-bold text-[10px]">
                        ROUTED TO QUALITY & AGM AUDIT
                      </span>
                      <h4 className="font-bold text-white">{task.title}</h4>
                      <p className="text-gray-400">Submitted by: <strong className="text-indigo-400">{task.assigneeName}</strong> ({task.assigneeDept})</p>
                    </div>

                    <Link
                      href="/quality"
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shrink-0 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Inspect & Verify
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. FULL STACK / ENGINEERING EMPLOYEE TASK WORKBENCH */}
      {isFullStack && (
        <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                Full Stack Engineering Workbench
              </span>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-1">
                <Code2 className="w-5 h-5 text-indigo-400" /> My Assigned Projects & Tasks ({myAssignedTasks.length})
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Tasks assigned to you by Team Leaders. Switch status between <strong>working</strong> and <strong>Done</strong> to submit your work.
              </p>
            </div>
            <Link
              href="/tasks"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 shrink-0"
            >
              Open Full Tasks Desk →
            </Link>
          </div>

          {myAssignedTasks.length === 0 ? (
            <div className="p-8 bg-gray-950/60 rounded-2xl border border-gray-800 text-center space-y-2">
              <Code2 className="w-8 h-8 text-gray-600 mx-auto" />
              <p className="text-sm font-bold text-gray-300">No Tasks Assigned to You Yet</p>
              <p className="text-xs text-gray-500">When your Team Leader decomposes an assigned project and delegates tasks to you, they will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAssignedTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl bg-gray-950 border border-gray-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono font-bold text-[10px] border border-indigo-500/20">
                        {t.priority} PRIORITY
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          t.status === 'WORK_SUBMITTED'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : t.status === 'QUALITY_APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                        }`}
                      >
                        {t.status === 'WORK_SUBMITTED' ? 'DONE (SUBMITTED TO TL)' : t.status === 'IN_PROGRESS' ? 'WORKING (IN PROGRESS)' : t.status}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">{t.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">Project: <strong className="text-gray-300">{t.projectName}</strong></p>
                    {t.milestoneName && (
                      <p className="text-xs text-indigo-400/80 mt-0.5">Milestone: {t.milestoneName}</p>
                    )}

                    {t.submittedWork && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-gray-900/80 border border-gray-800 text-[11px] text-gray-300 italic">
                        "Submission: {t.submittedWork}"
                      </div>
                    )}
                  </div>

                  {/* Interactive Status Switcher: working <-> Done */}
                  <div className="pt-3 border-t border-gray-800/80 space-y-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Engineer Status Switcher:
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFullStackStatusChange(t, 'working')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                          t.status === 'IN_PROGRESS' || t.status === 'TODO' || t.status === 'working'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow'
                            : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" /> working
                      </button>

                      <button
                        onClick={() => handleFullStackStatusChange(t, 'Done')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                          t.status === 'WORK_SUBMITTED' || t.status === 'Done' || t.status === 'QUALITY_APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow'
                            : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" /> Done
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Full Stack Work Submission Modal */}
      <Modal
        isOpen={!!submittingTask}
        onClose={() => setSubmittingTask(null)}
        title="Full Stack Engineer - Mark Task as DONE & Submit Work"
        maxWidth="md"
      >
        <form onSubmit={handleConfirmSubmitWork} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 text-xs space-y-1">
            <p className="text-gray-400">Task: <strong className="text-white">{submittingTask?.title}</strong></p>
            <p className="text-gray-400">Project: <strong className="text-indigo-400">{submittingTask?.projectName}</strong></p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
              Work Deliverables & Notes *
            </label>
            <textarea
              required
              rows={4}
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="Describe deliverables, GitHub PR links, API endpoints implemented..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button
              type="button"
              onClick={() => setSubmittingTask(null)}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Mark Done & Submit to TL</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
