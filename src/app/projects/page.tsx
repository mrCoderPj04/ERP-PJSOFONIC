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
  Shield,
  Play,
  Check,
  ExternalLink,
  Send,
} from 'lucide-react';
import { fetchCrmCustomerProjects, saveCrmProject, CrmCustomerProject } from '../../lib/crm';
import { fetchEmsEmployees, EmsUser } from '../../lib/ems';
import { saveErpTask, ErpTask } from '../../lib/erpStore';
import { syncWithProjectOS } from '../../lib/projectOS';
import { syncWithQMS } from '../../lib/qms';
import { useAuth } from '../../context/AuthContext';
import { EmptyState, Modal, Badge } from '../../components/ui';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [crmProjects, setCrmProjects] = useState<CrmCustomerProject[]>([]);
  const [emsEmployees, setEmsEmployees] = useState<EmsUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedProjectForDecompose, setSelectedProjectForDecompose] = useState<CrmCustomerProject | null>(null);

  // Admin New Project Form State
  const [adminProjTitle, setAdminProjTitle] = useState('');
  const [adminCustomerName, setAdminCustomerName] = useState('');
  const [adminCustomerEmail, setAdminCustomerEmail] = useState('');
  const [adminDeptScope, setAdminDeptScope] = useState('Software Engineering');
  const [adminTargetTlId, setAdminTargetTlId] = useState('');
  const [adminRequirements, setAdminRequirements] = useState('');
  const [adminBudget, setAdminBudget] = useState('');

  // TL Breakdown Form State
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Admin Role Check
  const isAdmin = user?.role === 'ADMIN' || (user?.designation || '').toLowerCase().includes('admin') || (user?.department || '').toLowerCase().includes('admin');

  const loadLiveData = async () => {
    setLoading(true);
    const [projects, employees] = await Promise.all([
      fetchCrmCustomerProjects(),
      fetchEmsEmployees(),
    ]);
    setCrmProjects(projects);
    setEmsEmployees(employees);
    if (employees.length > 0 && !adminTargetTlId) {
      setAdminTargetTlId(employees[0].id);
      setSelectedAssigneeId(employees[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLiveData();
  }, []);

  // Admin Creates Project -> Dispatches directly to Team Leader Dashboard & ProjectOS
  const handleAdminCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTl = emsEmployees.find((emp) => emp.id === adminTargetTlId) || emsEmployees[0];

    const newProj: Partial<CrmCustomerProject> = {
      projectName: adminProjTitle,
      customerName: adminCustomerName || 'Valued Client',
      customerEmail: adminCustomerEmail || 'client@company.com',
      departmentScope: adminDeptScope || 'Software Engineering',
      targetTeamLeadId: selectedTl?.id,
      targetTeamLeadName: selectedTl ? `${selectedTl.fullName} (${selectedTl.department})` : 'Department Team Leader',
      requirements: adminRequirements || 'Admin created project scope for Team Leader execution.',
      budget: parseFloat(adminBudget) || 45000,
      status: 'working',
    };

    const updated = saveCrmProject(newProj);
    setCrmProjects(updated);

    // Sync with ProjectOS backend host
    await syncWithProjectOS({
      projectCode: updated[0].projectCode,
      projectName: updated[0].projectName,
      customerName: updated[0].customerName,
      customerEmail: updated[0].customerEmail,
      departmentScope: updated[0].departmentScope,
      targetTeamLeadName: updated[0].targetTeamLeadName,
      budget: updated[0].budget,
      status: 'working',
      requirements: updated[0].requirements,
    });

    setSuccessMessage(`Admin Created Project "${adminProjTitle}" -> Auto-Dispatched to Team Leader & Synced to ProjectOS (https://sofo-projectos.onrender.com)!`);
    setTimeout(() => setSuccessMessage(null), 5000);

    setIsAdminModalOpen(false);
    setAdminProjTitle('');
    setAdminCustomerName('');
    setAdminCustomerEmail('');
    setAdminRequirements('');
    setAdminBudget('');
  };

  // Team Leader Updates Status (working -> Done) -> Auto-Routes to Quality Department & QMS backend
  const handleStatusChange = async (project: CrmCustomerProject, newStatus: 'working' | 'Done') => {
    const updatedProjects = crmProjects.map((p) => {
      if (p.id === project.id) {
        return { ...p, status: newStatus };
      }
      return p;
    });

    setCrmProjects(updatedProjects);
    saveCrmProject({ ...project, status: newStatus });

    // Sync with ProjectOS backend
    await syncWithProjectOS({
      projectCode: project.projectCode,
      projectName: project.projectName,
      customerName: project.customerName,
      customerEmail: project.customerEmail,
      departmentScope: project.departmentScope,
      targetTeamLeadName: project.targetTeamLeadName,
      budget: project.budget,
      status: newStatus,
      requirements: project.requirements,
    });

    if (newStatus === 'Done') {
      // 1. Create task entry in Quality Testing Queue (erpStore)
      const qualityTask: ErpTask = {
        id: `quality-task-${Date.now()}`,
        projectId: project.id,
        projectCode: project.projectCode,
        projectName: project.projectName,
        milestoneName: 'Final Quality Verification & Testing',
        title: `[Quality Testing] ${project.projectName}`,
        assigneeId: user?.id || 'tl-lead',
        assigneeName: user?.fullName || 'Team Leader',
        assigneeDept: 'Quality Assurance & QA',
        priority: 'CRITICAL',
        status: 'WORK_SUBMITTED',
        submittedWork: `Team Leader marked project status as DONE. Transferred project scope: "${project.requirements}" to Quality Department Testing Queue.`,
        submittedAt: new Date().toISOString(),
        qualityStatus: 'IN PROCESS',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };

      saveErpTask(qualityTask);

      // 2. Sync directly with QMS Backend host (https://pjsofonic-qms.onrender.com)
      await syncWithQMS({
        projectCode: project.projectCode,
        projectName: project.projectName,
        customerName: project.customerName,
        departmentScope: project.departmentScope,
        submittedByTl: user?.fullName || 'Team Leader',
        requirements: project.requirements,
        testingStatus: 'IN PROCESS',
        submittedAt: new Date().toISOString(),
      });

      setSuccessMessage(
        `Project "${project.projectName}" marked DONE by Team Leader! Transferred to Quality Department Testing Queue & Synced to QMS (https://pjsofonic-qms.onrender.com)!`
      );
      setTimeout(() => setSuccessMessage(null), 6000);
    }
  };

  const handleDecomposeProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForDecompose) return;

    const assignedStaff = emsEmployees.find((emp) => emp.id === selectedAssigneeId) || emsEmployees[0];

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

    setCrmProjects(
      crmProjects.map((p) =>
        p.id === selectedProjectForDecompose.id ? { ...p, status: 'TL_DECOMPOSED' } : p
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
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase flex items-center gap-1">
              <Shield className="w-3 h-3 inline" /> Admin Project Control & Team Leader Dashboard
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-400" /> Customer Projects & Team Leader Workflow
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Admin creates projects → Auto-fetched on Team Leader Dashboard → Status working to Done → Transferred to Quality Testing & QMS!
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Admin Create Project
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 text-xs font-medium flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" /> Team Leader View
            </div>
          )}

          <button
            onClick={loadLiveData}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs border border-gray-700 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* External Integration Hosts Indicator Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider block">ProjectOS Host Integration</span>
            <span className="font-bold text-white text-xs">https://sofo-projectos.onrender.com</span>
            <p className="text-[11px] text-gray-400 mt-0.5">Admin & Team Leader project updates sync in real-time with ProjectOS backend.</p>
          </div>
          <ExternalLink className="w-4 h-4 text-indigo-400 shrink-0" />
        </div>

        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-rose-400 tracking-wider block">QMS Host Integration</span>
            <span className="font-bold text-white text-xs">https://pjsofonic-qms.onrender.com</span>
            <p className="text-[11px] text-gray-400 mt-0.5">Projects marked 'Done' by TL automatically route to QMS Quality Testing Queue.</p>
          </div>
          <ExternalLink className="w-4 h-4 text-rose-400 shrink-0" />
        </div>
      </div>

      {/* Projects Grid or Empty State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-gray-900/40 border border-gray-800">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-gray-400 font-medium">Fetching customer projects for Team Leader dashboard...</p>
        </div>
      ) : crmProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No Active Projects in Team Leader Dashboard"
          description={isAdmin ? "Click 'Admin Create Project' above to create a project that dispatches directly to the Team Leader dashboard." : "Projects created by Admin will automatically fetch here in your Team Leader dashboard."}
          actionLabel={isAdmin ? "Admin Create Project" : "Sync Projects"}
          onAction={isAdmin ? () => setIsAdminModalOpen(true) : loadLiveData}
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
                  <Badge variant={project.status === 'Done' ? 'success' : project.status === 'working' ? 'warning' : 'info'}>
                    {project.status === 'Done' ? 'DONE (IN QA TESTING)' : project.status === 'working' ? 'WORKING (IN PROGRESS)' : 'ADMIN ACTIVE'}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {project.projectName}
                </h3>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-500" /> Client: {project.customerName}
                </p>

                <div className="mt-3 p-3 rounded-xl bg-gray-950/80 border border-gray-800 text-xs space-y-1">
                  <div className="flex justify-between text-gray-400">
                    <span>Department Scope:</span>
                    <span className="font-bold text-indigo-400">{project.departmentScope}</span>
                  </div>
                  {project.targetTeamLeadName && (
                    <div className="flex justify-between text-gray-400">
                      <span>Team Leader:</span>
                      <span className="font-bold text-amber-400">{project.targetTeamLeadName}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400">
                    <span>Budget ($):</span>
                    <span className="font-bold text-emerald-400">${project.budget.toLocaleString()}</span>
                  </div>
                </div>

                {/* Status Switcher Control for Team Leader */}
                <div className="mt-3.5 p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Team Leader Status Control:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(project, 'working')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                        project.status === 'working' || project.status === 'IN_PROGRESS' || project.status === 'ACTIVE'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow'
                          : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-white'
                      }`}
                    >
                      <Play className="w-3 h-3 inline" /> working
                    </button>

                    <button
                      onClick={() => handleStatusChange(project, 'Done')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                        project.status === 'Done'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow'
                          : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 inline" /> Done
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-400 line-clamp-2 italic bg-gray-950/40 p-2.5 rounded-lg">
                  "{project.requirements}"
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
                <span className="text-gray-500 text-[11px]">
                  ProjectOS & QMS Synced
                </span>

                <button
                  onClick={() => setSelectedProjectForDecompose(project)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg flex items-center gap-1 transition-all"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Assign Tasks</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Create Project Modal */}
      <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} title="Admin - Create New Project (Direct Dispatch to Team Leader)">
        <form onSubmit={handleAdminCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={adminProjTitle}
              onChange={(e) => setAdminProjTitle(e.target.value)}
              placeholder="e.g. Next-Gen Enterprise Billing Gateway"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Client Name *</label>
              <input
                type="text"
                required
                value={adminCustomerName}
                onChange={(e) => setAdminCustomerName(e.target.value)}
                placeholder="e.g. Apex Global Corp"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Client Email</label>
              <input
                type="email"
                value={adminCustomerEmail}
                onChange={(e) => setAdminCustomerEmail(e.target.value)}
                placeholder="e.g. client@apex.com"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Department Scope</label>
              <select
                value={adminDeptScope}
                onChange={(e) => setAdminDeptScope(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="Mobile Engineering">Mobile Engineering</option>
                <option value="Quality Assurance & QA">Quality Assurance & QA</option>
                <option value="UI/UX Product Design">UI/UX Product Design</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Assign Team Leader *</label>
              <select
                value={adminTargetTlId}
                onChange={(e) => setAdminTargetTlId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {emsEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} - {emp.department} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Project Budget ($) *</label>
            <input
              type="number"
              required
              value={adminBudget}
              onChange={(e) => setAdminBudget(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Requirements & Scope</label>
            <textarea
              rows={3}
              value={adminRequirements}
              onChange={(e) => setAdminRequirements(e.target.value)}
              placeholder="Detail technical requirements for Team Leader execution..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button type="button" onClick={() => setIsAdminModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg">
              Create & Dispatch to TL Dashboard
            </button>
          </div>
        </form>
      </Modal>

      {/* TL Project Breakdown Modal */}
      <Modal
        isOpen={!!selectedProjectForDecompose}
        onClose={() => setSelectedProjectForDecompose(null)}
        title="Team Leader Task Assignment & Milestone Division"
        maxWidth="lg"
      >
        <form onSubmit={handleDecomposeProject} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 text-xs space-y-1">
            <p className="text-gray-400">Project: <strong className="text-white">{selectedProjectForDecompose?.projectName}</strong></p>
            <p className="text-gray-400">Department Scope: <strong className="text-indigo-400">{selectedProjectForDecompose?.departmentScope}</strong></p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Technical Milestone Title *</label>
            <input
              type="text"
              required
              value={milestoneTitle}
              onChange={(e) => setMilestoneTitle(e.target.value)}
              placeholder="e.g. Phase 1: Core API & Database Setup"
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
              placeholder="e.g. Develop ProjectOS API Sync Engine"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Assign EMS Engineer *</label>
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
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg"
            >
              Assign Task to Engineer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
