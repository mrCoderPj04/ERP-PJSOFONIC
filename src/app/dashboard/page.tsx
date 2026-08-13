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
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { fetchEmsEmployees, EmsUser } from '@/lib/ems';
import { getErpTasks, ErpTask } from '@/lib/erpStore';

export default function DashboardPage() {
  const { user } = useAuth();
  const [crmProjects, setCrmProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<ErpTask[]>([]);
  const [emsEmployees, setEmsEmployees] = useState<EmsUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://pjsofonic-crm-backend.onrender.com/api/v1/projects');
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.projects || data.data || [];
        const approvedOnly = rawList.filter(
          (p: any) =>
            p.status === 'APPROVED' ||
            p.approvalStatus === 'APPROVED' ||
            p.stage === 'APPROVED' ||
            p.isApproved === true
        );
        setCrmProjects(approvedOnly.length > 0 ? approvedOnly : rawList);
      }
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

  if (!user) return null;

  const qualityQueueCount = tasks.filter(
    (t) => t.status === 'WORK_SUBMITTED' || t.qualityStatus === 'IN PROCESS'
  ).length;

  const userDept = (user?.department || '').toUpperCase();
  const userRole = user?.role || 'EMPLOYEE';
  const isTeamLeadOrAdmin = userRole === 'ADMIN' || userRole === 'TEAM_LEAD';
  const isQualityDept = userRole === 'QA' || userDept.includes('QUALITY');

  // Filter tasks specific to regular employee if not TL or Quality
  const myAssignedTasks = tasks.filter(
    (t) => t.assigneeId === user.id || t.assigneeName === user.fullName
  );

  return (
    <div className="space-y-8 animate-fadeIn">
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
                {userRole === 'TEAM_LEAD' && (
                  <Crown className="w-5 h-5 text-amber-400 inline shrink-0" />
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
              <span className="truncate">{user.email}</span>
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

      {/* 2. STRICT ROLE-BASED DASHBOARD PANELS */}

      {/* PANEL A: TEAM LEADER (TL) CONTROL HUB */}
      {isTeamLeadOrAdmin && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Condition 1: CRM Approved Projects Pending Breakdown
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{crmProjects.length}</span>
                <span className="text-xs text-indigo-400 font-semibold">Auto-routed to Team Lead</span>
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
                  <Crown className="w-5 h-5 text-amber-400" /> Team Leader (TL) CRM Project Decomposition Hub
                </h2>
                <p className="text-xs text-gray-400">
                  Projects approved in CRM automatically arrive here for Team Leaders to break down into milestones and assign tasks to EMS engineers.
                </p>
              </div>

              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold border border-gray-800 transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync CRM Projects</span>
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-10 bg-gray-900/40 border border-gray-800 rounded-2xl">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs text-gray-400">Fetching approved customer projects from CRM API...</p>
              </div>
            ) : crmProjects.length === 0 ? (
              <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-6">
                <EmptyState
                  icon={FolderKanban}
                  title="No Approved CRM Projects Pending Breakdown"
                  description="Customer projects approved in PJSOFONIC CRM automatically route here to Team Leaders for milestone breakdown and task delegation."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {crmProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-md space-y-3 flex flex-col justify-between hover:border-indigo-500/40 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {proj.projectCode}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          APPROVED CRM PROJECT
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white">{proj.projectName}</h3>
                      <p className="text-xs text-gray-400">Client: {proj.customerName}</p>

                      <div className="mt-3 p-3 rounded-xl bg-gray-950 border border-gray-800 text-xs">
                        <span className="text-gray-500 font-semibold block mb-0.5">Department Scope:</span>
                        <span className="font-bold text-indigo-400 flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" /> {proj.departmentScope}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">${proj.budget?.toLocaleString() || '15,000'}</span>
                      <Link
                        href="/projects"
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1"
                      >
                        <span>TL Breakdown & Assign</span> <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PANEL B: QUALITY & AGM QUALITY STAFF TESTING HUB */}
      {isQualityDept && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Condition 2: Quality & AGM Quality Audit Testing Queue
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-400">{qualityQueueCount}</span>
                <span className="text-xs text-rose-300 font-semibold">Work Submitted → Awaiting Quality Verification</span>
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
                  When developers move tasks to WORK_SUBMITTED, they automatically route directly to your Quality testing table for audit verification.
                </p>
              </div>
              <Link
                href="/quality"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
              >
                Open Quality Testing Desk ({qualityQueueCount}) →
              </Link>
            </div>

            {tasks.filter((t) => t.status === 'WORK_SUBMITTED' || t.qualityStatus === 'IN PROCESS').length === 0 ? (
              <p className="text-xs text-gray-500 italic p-4 bg-gray-950/60 rounded-xl border border-gray-800">
                No submitted work currently waiting for Quality Testing. Work submitted by engineers on the Tasks page will automatically appear here.
              </p>
            ) : (
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.status === 'WORK_SUBMITTED' || t.qualityStatus === 'IN PROCESS')
                  .map((task) => (
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

      {/* PANEL C: REGULAR EMPLOYEE TASK WORKBENCH */}
      {!isTeamLeadOrAdmin && !isQualityDept && (
        <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-400" /> My Assigned Tasks ({myAssignedTasks.length})
              </h3>
              <p className="text-xs text-gray-400">
                Tasks assigned to you by Team Leads. Once completed, move status to WORK_SUBMITTED to send to Quality testing.
              </p>
            </div>
            <Link
              href="/tasks"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              Open Tasks Workflow →
            </Link>
          </div>

          {myAssignedTasks.length === 0 ? (
            <p className="text-xs text-gray-500 italic p-4 bg-gray-950/60 rounded-xl border border-gray-800">
              You currently have no tasks assigned. Team Leads will delegate project tasks to you here.
            </p>
          ) : (
            <div className="space-y-2">
              {myAssignedTasks.map((t) => (
                <div key={t.id} className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white">{t.title}</h4>
                    <p className="text-gray-400 text-[11px]">{t.projectName} • Priority: {t.priority}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 font-mono font-bold text-[10px] border border-indigo-500/20">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
