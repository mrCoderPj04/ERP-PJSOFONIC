'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Plus,
  Crown,
  Users,
  CheckSquare,
  ArrowRight,
  Sparkles,
  Building2,
  Share2,
  Clock,
  Layers,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { fetchCrmCustomerProjects, CrmCustomerProject } from '@/lib/crm';
import { fetchEmsEmployees, EmsUser } from '@/lib/ems';
import { saveErpTask, ErpTask } from '@/lib/erpStore';
import { useAuth } from '@/context/AuthContext';
import { EmptyState, Modal, Badge } from '../../components/ui';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [crmProjects, setCrmProjects] = useState<CrmCustomerProject[]>([]);
  const [emsEmployees, setEmsEmployees] = useState<EmsUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectForDecompose, setSelectedProjectForDecompose] = useState<CrmCustomerProject | null>(null);

  // Breakdown Form State
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadLiveData = async () => {
    setLoading(true);
    const [projects, employees] = await Promise.all([
      fetchCrmCustomerProjects(),
      fetchEmsEmployees(),
    ]);
    setCrmProjects(projects);
    setEmsEmployees(employees);
    if (employees.length > 0) {
      setSelectedAssigneeId(employees[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLiveData();
  }, []);

  const handleDecomposeProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForDecompose) return;

    const assignedStaff = emsEmployees.find((e) => e.id === selectedAssigneeId) || emsEmployees[0];

    // Create a real task in erpStore
    const newTask: ErpTask = {
      id: `task-${Date.now()}`,
      projectId: selectedProjectForDecompose.id,
      projectCode: selectedProjectForDecompose.projectCode,
      projectName: selectedProjectForDecompose.projectName,
      milestoneName: milestoneTitle || 'Technical Milestone 1',
      title: taskTitle,
      assigneeId: assignedStaff ? assignedStaff.id : 'ems-staff-01',
      assigneeName: assignedStaff ? assignedStaff.fullName : 'EMS Staff Member',
      assigneeEmail: assignedStaff ? assignedStaff.email : '',
      assigneeDept: assignedStaff ? assignedStaff.department : selectedProjectForDecompose.departmentScope,
      priority,
      status: 'TODO',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    saveErpTask(newTask);

    // Update status to TL_DECOMPOSED
    setCrmProjects(
      crmProjects.map((p) =>
        p.id === selectedProjectForDecompose.id
          ? { ...p, status: 'TL_DECOMPOSED' }
          : p
      )
    );

    setSuccessMessage(`Task "${taskTitle}" assigned to ${newTask.assigneeName} in EMS!`);
    setTimeout(() => setSuccessMessage(null), 4000);

    setSelectedProjectForDecompose(null);
    setMilestoneTitle('');
    setTaskTitle('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase">
              Condition 1: CRM Ingested Approved Projects
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-400" /> Customer Projects & Team Leader (TL) Breakdown
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Approved customer projects from CRM auto-route to Team Leaders for milestone breakdown & task assignment to EMS engineers.
          </p>
        </div>

        <button
          onClick={loadLiveData}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs border border-gray-700 transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync CRM Backend API</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Team Leader Workflow Principle Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-xs flex items-start gap-3">
        <Crown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-white mb-0.5">Team Leader (TL) Auto-Routing Principle</h4>
          <p className="text-gray-300 text-[11px] leading-relaxed">
            When a customer project is approved in PJSOFONIC CRM, it auto-appears under the <strong className="text-amber-400">Team Leader's (TL) control panel</strong>. The TL reviews requirements, breaks the project into technical milestones, and delegates tasks to EMS registered engineers.
          </p>
        </div>
      </div>

      {/* Projects Grid or Empty State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-gray-900/40 border border-gray-800">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-gray-400 font-medium">Fetching approved customer projects from CRM backend...</p>
        </div>
      ) : crmProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No Approved CRM Customer Projects Waiting"
          description="Customer projects approved in PJSOFONIC CRM automatically route here to Department Team Leaders."
          actionLabel="Sync Live CRM Backend API"
          onAction={loadLiveData}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crmProjects.map((project) => (
            <div
              key={project.id}
              className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800/80 hover:border-indigo-500/40 transition-all duration-300 backdrop-blur-md flex flex-col justify-between group space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                    {project.projectCode}
                  </span>
                  <Badge variant={project.status === 'TL_DECOMPOSED' ? 'success' : 'warning'}>
                    {project.status === 'TL_DECOMPOSED' ? 'TL DECOMPOSED' : 'PENDING TL REVIEW'}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {project.projectName}
                </h3>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-500" /> Client: {project.customerName}
                </p>

                <div className="mt-3 p-3 rounded-xl bg-gray-950/80 border border-gray-800 text-xs">
                  <span className="text-gray-500 font-semibold block mb-1">Target Department Scope:</span>
                  <span className="font-bold text-indigo-400 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 inline" /> {project.departmentScope}
                  </span>
                </div>

                <div className="mt-3 text-xs text-gray-400 line-clamp-3 italic bg-gray-950/40 p-2.5 rounded-lg">
                  "{project.requirements}"
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">
                  ${project.budget.toLocaleString()}
                </span>

                <button
                  onClick={() => setSelectedProjectForDecompose(project)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>{project.status === 'TL_DECOMPOSED' ? 'Add Another Task' : 'TL Divide Project'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TL Project Breakdown Modal */}
      <Modal
        isOpen={!!selectedProjectForDecompose}
        onClose={() => setSelectedProjectForDecompose(null)}
        title="Team Leader (TL) Project Breakdown & Task Assignment"
        maxWidth="lg"
      >
        <form onSubmit={handleDecomposeProject} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 text-xs space-y-1">
            <p className="text-gray-400">Project Name: <strong className="text-white">{selectedProjectForDecompose?.projectName}</strong></p>
            <p className="text-gray-400">Department Scope: <strong className="text-indigo-400">{selectedProjectForDecompose?.departmentScope}</strong></p>
            <p className="text-gray-400">Client: <strong className="text-emerald-400">{selectedProjectForDecompose?.customerName}</strong></p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Technical Milestone Title *</label>
            <input
              type="text"
              required
              value={milestoneTitle}
              onChange={(e) => setMilestoneTitle(e.target.value)}
              placeholder="e.g. Phase 1: Database Architecture & Auth API"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Sub-Task Title *</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Develop Real-Time Login API with EMS Backend"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Assign EMS Registered Engineer *</label>
              <select
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {emsEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    [{emp.employeeId}] {emp.fullName} - {emp.department} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button
              type="button"
              onClick={() => setSelectedProjectForDecompose(null)}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg"
            >
              Divide Project & Assign Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
