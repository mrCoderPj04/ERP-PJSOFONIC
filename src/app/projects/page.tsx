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
  Code2,
  FileCheck,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import {
  fetchCrmCustomerProjects,
  saveCrmProject,
  assignProjectToFullStack,
  CrmCustomerProject,
} from '../../lib/crm';
import { fetchEmsEmployees, EmsUser } from '../../lib/ems';
import { saveErpTask, ErpTask } from '../../lib/erpStore';
import { syncWithProjectOS } from '../../lib/projectOS';
import { syncWithQMS } from '../../lib/qms';
import { useAuth } from '../../context/AuthContext';
import { EmptyState, Modal, Badge } from '../../components/ui';
import { exportProjectReportToExcel, exportProjectReportToPdf } from '../../lib/exportUtils';
import { addSystemNotification } from '../../lib/notificationStore';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [crmProjects, setCrmProjects] = useState<CrmCustomerProject[]>([]);
  const [emsEmployees, setEmsEmployees] = useState<EmsUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedProjectForDecompose, setSelectedProjectForDecompose] = useState<CrmCustomerProject | null>(null);
  const [assigningProjectForTl, setAssigningProjectForTl] = useState<CrmCustomerProject | null>(null);
  const [selectedTlIdForAssign, setSelectedTlIdForAssign] = useState<string>('');

  // TL Assign to Full Stack Modal
  const [assigningProjectForFullStack, setAssigningProjectForFullStack] = useState<CrmCustomerProject | null>(null);
  const [selectedFullStackId, setSelectedFullStackId] = useState<string>('');

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

  // Helper to check if employee is Quality
  const checkIsQuality = (emp: any): boolean => {
    if (!emp) return false;
    const d = (emp.designation || '').toUpperCase();
    const dept = (emp.department || '').toUpperCase();
    const r = (emp.role || '').toUpperCase();

    return (
      r === 'QA' ||
      r.includes('QA') ||
      r.includes('QUALITY') ||
      d.includes('QA') ||
      d.includes('QUALITY') ||
      d.includes('TEST') ||
      dept.includes('QUALITY') ||
      dept.includes('QA') ||
      dept.includes('TESTING')
    );
  };

  // Helper to check if employee is Team Leader
  const checkIsTeamLeader = (emp: any): boolean => {
    if (!emp) return false;
    if (checkIsQuality(emp)) return false;

    const d = (emp.designation || '').toUpperCase();
    const dept = (emp.department || '').toUpperCase();
    const r = (emp.role || '').toUpperCase();

    return (
      r === 'TEAM_LEAD' ||
      r.includes('LEAD') ||
      r.includes('TL') ||
      r.includes('MANAGER') ||
      d.includes('LEAD') ||
      d.includes('LEADER') ||
      d.includes('TL') ||
      d.includes('MANAGER') ||
      d.includes('HEAD') ||
      dept.includes('LEAD') ||
      dept.includes('LEADER') ||
      dept.includes('TL') ||
      dept.includes('TEAM LEAD') ||
      dept.includes('TEAM LEADER') ||
      dept.includes('MANAGEMENT')
    );
  };

  // User Role Checks
  const userRole = user?.role || 'EMPLOYEE';
  const userDesig = (user?.designation || '').toLowerCase();
  const userDept = (user?.department || '').toLowerCase();
  const isAdmin = userRole === 'ADMIN' || userDesig.includes('admin') || userDept.includes('admin') || userDesig.includes('director');
  const isQualityDept = !isAdmin && (userRole === 'QA' || checkIsQuality(user));
  const isTeamLead = !isAdmin && !isQualityDept && (userRole === 'TEAM_LEAD' || checkIsTeamLeader(user));
  const isFullStack = !isAdmin && !isTeamLead && !isQualityDept;

  // Filter ONLY Team Leaders for Admin "Select Department Team Leader"
  const teamLeadersList = emsEmployees.filter((emp) => checkIsTeamLeader(emp));
  const activeTlOptions = teamLeadersList.length > 0 ? teamLeadersList : emsEmployees;

  // Filter Full Stack Engineers / Developers for TL Assignment
  const fullStackEngineersList = emsEmployees.filter((emp) => {
    const isTl = checkIsTeamLeader(emp);
    const isQa = checkIsQuality(emp);
    return !isTl && !isQa;
  });

  const activeFsOptions = fullStackEngineersList.length > 0 ? fullStackEngineersList : emsEmployees;

  const loadLiveData = async () => {
    setLoading(true);
    try {
      const [projects, employees] = await Promise.all([
        fetchCrmCustomerProjects(),
        fetchEmsEmployees(),
      ]);
      setCrmProjects(projects);
      setEmsEmployees(employees);

      const tlList = employees.filter((emp) => checkIsTeamLeader(emp));
      const defaultTl = tlList[0] || employees[0];
      if (defaultTl && !adminTargetTlId) {
        setAdminTargetTlId(defaultTl.id);
      }
      if (employees.length > 0 && !selectedAssigneeId) {
        setSelectedAssigneeId(employees[0].id);
      }
    } catch (e) {
      console.error('Failed to load projects data:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLiveData();

    // Auto-fetch & live sync whenever projects are assigned or updated across tabs/profiles
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'pj_crm_active_projects') {
        loadLiveData();
      }
    };
    const handleCrmUpdate = () => {
      loadLiveData();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('pj_crm_updated', handleCrmUpdate);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pj_crm_updated', handleCrmUpdate);
    };
  }, []);

  // 1. Admin Assigns Team Leader
  const handleAssignTeamLeader = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningProjectForTl) return;
    const selectedTl = emsEmployees.find((emp) => emp.id === selectedTlIdForAssign) || activeTlOptions[0];
    if (!selectedTl) return;

    const updated = saveCrmProject({
      ...assigningProjectForTl,
      targetTeamLeadId: selectedTl.id,
      targetTeamLeadName: `[${selectedTl.employeeId}] ${selectedTl.fullName} (${selectedTl.department})`,
      departmentScope: selectedTl.department || assigningProjectForTl.departmentScope,
      stage: 'ASSIGNED_TO_TL',
    });

    setCrmProjects(updated);

    // Dispatch System Notifications
    addSystemNotification({
      type: 'PROJECT_ASSIGN',
      title: 'Project Assigned',
      message: `You assigned project "${assigningProjectForTl.projectName}" to [${selectedTl.employeeId}] ${selectedTl.fullName}`,
      senderId: user?.id || user?.employeeId,
      senderName: user?.fullName || 'Admin',
      recipientId: user?.id || user?.employeeId,
      link: '/projects',
    });
    addSystemNotification({
      type: 'PROJECT_ASSIGN',
      title: 'New Project Assigned',
      message: `${user?.fullName || 'Admin'} assigned project "${assigningProjectForTl.projectName}" to you`,
      senderId: user?.id || user?.employeeId,
      senderName: user?.fullName || 'Admin',
      recipientId: selectedTl.id,
      recipientName: selectedTl.fullName,
      recipientRole: 'TEAM_LEAD',
      link: '/projects',
    });

    setSuccessMessage(`Project "${assigningProjectForTl.projectName}" successfully assigned to Team Leader [${selectedTl.employeeId}] ${selectedTl.fullName}!`);
    setTimeout(() => setSuccessMessage(null), 5000);
    setAssigningProjectForTl(null);
  };

  // 2. Team Leader Assigns to Full Stack Engineer
  const handleAssignToFullStack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningProjectForFullStack) return;
    const selectedFs = emsEmployees.find((emp) => emp.id === selectedFullStackId) || activeFsOptions[0];
    if (!selectedFs) return;

    const updated = assignProjectToFullStack(
      assigningProjectForFullStack.id,
      selectedFs.id,
      `[${selectedFs.employeeId}] ${selectedFs.fullName} (${selectedFs.designation})`
    );

    setCrmProjects(updated);

    // Dispatch System Notifications
    addSystemNotification({
      type: 'PROJECT_ASSIGN',
      title: 'Project Assigned to Full Stack',
      message: `You assigned project "${assigningProjectForFullStack.projectName}" to [${selectedFs.employeeId}] ${selectedFs.fullName}`,
      senderId: user?.id || user?.employeeId,
      senderName: user?.fullName || 'Team Leader',
      recipientId: user?.id || user?.employeeId,
      link: '/projects',
    });
    addSystemNotification({
      type: 'PROJECT_ASSIGN',
      title: 'New Project Assigned to You',
      message: `${user?.fullName || 'Team Leader'} assigned project "${assigningProjectForFullStack.projectName}" to you`,
      senderId: user?.id || user?.employeeId,
      senderName: user?.fullName || 'Team Leader',
      recipientId: selectedFs.id,
      recipientName: selectedFs.fullName,
      link: '/projects',
    });

    setSuccessMessage(`Project "${assigningProjectForFullStack.projectName}" assigned to Full Stack Engineer ${selectedFs.fullName}!`);
    setTimeout(() => setSuccessMessage(null), 5000);
    setAssigningProjectForFullStack(null);
  };

  // 3. Admin Creates Project -> Dispatches directly to Team Leader Dashboard
  const handleAdminCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTl = emsEmployees.find((emp) => emp.id === adminTargetTlId) || activeTlOptions[0];

    const newProj: Partial<CrmCustomerProject> = {
      projectName: adminProjTitle,
      customerName: adminCustomerName || 'Valued Client',
      customerEmail: adminCustomerEmail || 'client@company.com',
      departmentScope: adminDeptScope || 'Software Engineering',
      targetTeamLeadId: selectedTl?.id,
      targetTeamLeadName: selectedTl ? `[${selectedTl.employeeId}] ${selectedTl.fullName} (${selectedTl.department})` : 'Department Team Leader',
      requirements: adminRequirements || 'Admin created project scope for Team Leader execution.',
      budget: parseFloat(adminBudget) || 45000,
      status: 'working',
      stage: 'ASSIGNED_TO_TL',
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

    // Dispatch System Notifications
    addSystemNotification({
      type: 'PROJECT_ASSIGN',
      title: 'Project Created & Assigned',
      message: `You created and assigned "${adminProjTitle}" to Team Leader ${selectedTl?.fullName}`,
      senderId: user?.id || user?.employeeId,
      senderName: user?.fullName || 'Admin',
      recipientId: user?.id || user?.employeeId,
      link: '/projects',
    });
    if (selectedTl) {
      addSystemNotification({
        type: 'PROJECT_ASSIGN',
        title: 'New Project Assigned',
        message: `${user?.fullName || 'Admin'} created and assigned project "${adminProjTitle}" to you`,
        senderId: user?.id || user?.employeeId,
        senderName: user?.fullName || 'Admin',
        recipientId: selectedTl.id,
        recipientName: selectedTl.fullName,
        recipientRole: 'TEAM_LEAD',
        link: '/projects',
      });
    }

    setSuccessMessage(`Admin Created Project "${adminProjTitle}" -> Auto-Dispatched to Team Leader ${selectedTl?.fullName}!`);
    setTimeout(() => setSuccessMessage(null), 5000);

    setIsAdminModalOpen(false);
    setAdminProjTitle('');
    setAdminCustomerName('');
    setAdminCustomerEmail('');
    setAdminRequirements('');
    setAdminBudget('');
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
      assigneeName: assignedStaff ? `[${assignedStaff.employeeId}] ${assignedStaff.fullName}` : 'EMS Staff Member',
      assigneeEmail: assignedStaff ? assignedStaff.email : '',
      assigneeDept: assignedStaff ? assignedStaff.department : selectedProjectForDecompose.departmentScope,
      priority,
      status: 'TODO',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    saveErpTask(newTask);

    addSystemNotification({
      type: 'PROJECT_ASSIGN',
      title: 'Milestone Task Assigned',
      message: `You assigned task "${taskTitle}" to ${assignedStaff ? assignedStaff.fullName : 'Engineer'}`,
      senderId: user?.id || user?.employeeId,
      senderName: user?.fullName || 'Team Leader',
      recipientId: user?.id || user?.employeeId,
      link: '/tasks',
    });
    if (assignedStaff) {
      addSystemNotification({
        type: 'PROJECT_ASSIGN',
        title: 'New Task Assigned',
        message: `${user?.fullName || 'Team Leader'} assigned task "${taskTitle}" in "${selectedProjectForDecompose.projectName}" to you`,
        senderId: user?.id || user?.employeeId,
        senderName: user?.fullName || 'Team Leader',
        recipientId: assignedStaff.id,
        recipientName: assignedStaff.fullName,
        link: '/tasks',
      });
    }

    setSuccessMessage(`Task "${taskTitle}" assigned to ${assignedStaff?.fullName}! Task synced to ERP and Full Stack profile.`);
    setTimeout(() => setSuccessMessage(null), 5000);

    setSelectedProjectForDecompose(null);
    setMilestoneTitle('');
    setTaskTitle('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase flex items-center gap-1">
              <FolderKanban className="w-3 h-3 inline" /> Project Hub & Dispatch Desk
            </span>
            <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-bold flex items-center gap-1">
              <Crown className="w-3 h-3 inline" /> {isAdmin ? 'Admin View' : isTeamLead ? 'Team Leader Workspace' : isQualityDept ? 'Quality Audit Hub' : 'Engineer Desk'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {isAdmin ? 'Agency Master Project Portfolio' : isTeamLead ? 'Team Leader Assigned Projects' : isQualityDept ? 'Quality Assurance Projects' : 'My Assigned Projects'}
          </h1>
          <p className="text-xs text-gray-400">
            {isAdmin
              ? 'Create, assign to department Team Leaders, and grant final total project approval.'
              : isTeamLead
              ? 'Projects assigned to you by Admin. Assign to Full Stack Engineers, review deliverables, route to Quality, and submit All Done.'
              : 'Execute engineering deliverables and collaborate with your team.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Admin Create Project</span>
            </button>
          )}

          <button
            onClick={loadLiveData}
            className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition-all flex items-center gap-1.5 text-xs font-bold"
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

      {/* Projects Grid or Empty State */}
      {(() => {
        const cleanStr = (s?: string) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        const uEmpIdClean = cleanStr(user?.employeeId);
        const uIdClean = cleanStr(user?.id);
        const uNameClean = (user?.fullName || '').toLowerCase().trim();

        const displayedProjects = isAdmin
          ? crmProjects
          : isTeamLead
          ? crmProjects.filter((p) => {
              const pTlIdClean = cleanStr(p.targetTeamLeadId);
              const pTlName = (p.targetTeamLeadName || '').toLowerCase().trim();
              const pTlNameClean = cleanStr(p.targetTeamLeadName);

              if (uEmpIdClean && pTlIdClean && (uEmpIdClean === pTlIdClean || pTlIdClean.includes(uEmpIdClean) || uEmpIdClean.includes(pTlIdClean))) return true;
              if (uEmpIdClean && pTlNameClean && pTlNameClean.includes(uEmpIdClean)) return true;
              if (uIdClean && pTlIdClean && (uIdClean === pTlIdClean || pTlIdClean.includes(uIdClean) || uIdClean.includes(pTlIdClean))) return true;
              if (uNameClean && pTlName && (pTlName.includes(uNameClean) || uNameClean.includes(pTlName))) return true;
              const nameTokens = uNameClean.split(/\s+/).filter((tok) => tok.length >= 3);
              if (nameTokens.length > 0 && nameTokens.some((tok) => pTlName.includes(tok))) return true;
              return false;
            })
          : isQualityDept
          ? crmProjects.filter(
              (p) =>
                p.stage === 'TL_PRODUCTION_APPROVED' ||
                p.stage === 'QUALITY_APPROVED' ||
                p.stage === 'SENT_TO_QUALITY' ||
                p.tlProductionApproval?.approved ||
                (p.productionDeliverables && !!p.productionDeliverables.implementationPlan)
            )
          : crmProjects.filter(
              (p) =>
                p.assignedEngineerId === user?.id ||
                p.assignedEngineerId === user?.employeeId ||
                (!!user?.fullName && (p.assignedEngineerName || '').toLowerCase().includes(user.fullName.toLowerCase()))
            );

        if (loading) {
          return (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-gray-900/40 border border-gray-800">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-gray-400 font-medium">Fetching customer projects...</p>
            </div>
          );
        }

        if (displayedProjects.length === 0) {
          return (
            <EmptyState
              icon={FolderKanban}
              title={isAdmin ? "No Active Projects in Dashboard" : "No Projects Assigned to You Yet"}
              description={
                isAdmin
                  ? "Click 'Admin Create Project' above to create a project that dispatches directly to the Team Leader dashboard."
                  : isTeamLead
                  ? "When Admin assigns a project to you, it will appear here immediately."
                  : isQualityDept
                  ? "When Team Leaders approve production deliverables, projects route to Quality for testing."
                  : "When your Team Leader assigns a project to you, it will appear here."
              }
              actionLabel={isAdmin ? "Create First Project" : "Sync Projects"}
              onAction={() => (isAdmin ? setIsAdminModalOpen(true) : loadLiveData())}
            />
          );
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedProjects.map((p) => {
              const isCompleted = p.status === 'COMPLETED';

              return (
                <div
                  key={p.id}
                  className={`bg-gray-900/60 rounded-2xl border ${
                    isCompleted
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-gray-800/80 hover:border-gray-700'
                  } p-5 flex flex-col justify-between transition-all backdrop-blur-md group hover:shadow-xl hover:shadow-indigo-950/20`}
                >
                  <div className="space-y-4">
                    {/* Header: Project Code & Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {p.projectCode}
                      </span>
                      {isCompleted ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> COMPLETED
                        </span>
                      ) : (
                        <Badge variant={p.status === 'working' ? 'warning' : 'info'}>
                          {p.stage || (p.targetTeamLeadName ? 'ASSIGNED_TO_TL' : 'UNASSIGNED')}
                        </Badge>
                      )}
                    </div>

                    {/* Project Title */}
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {p.projectName}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.requirements}</p>
                    </div>

                    {/* Meta Card */}
                    <div className="p-3 bg-gray-950/70 rounded-xl border border-gray-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-gray-400">
                        <span>Client:</span>
                        <span className="font-semibold text-gray-200">{p.customerName}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-400">
                        <span>Budget:</span>
                        <span className="font-mono text-emerald-400 font-bold">${p.budget?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-400">
                        <span>Team Leader:</span>
                        <span className="font-semibold text-amber-400 truncate max-w-[160px]">
                          {p.targetTeamLeadName || 'Not Assigned'}
                        </span>
                      </div>
                      {p.assignedEngineerName && (
                        <div className="flex items-center justify-between text-gray-400">
                          <span>Engineer:</span>
                          <span className="font-semibold text-cyan-400 truncate max-w-[160px]">
                            {p.assignedEngineerName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-gray-800/80 mt-4 flex flex-col gap-2">
                    {/* Admin Change / Assign TL */}
                    {isAdmin && !isCompleted && (
                      <button
                        onClick={() => {
                          setAssigningProjectForTl(p);
                          setSelectedTlIdForAssign(p.targetTeamLeadId || activeTlOptions[0]?.id || '');
                        }}
                        className="w-full py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-amber-400 hover:text-amber-300 font-bold text-xs border border-gray-800 flex items-center justify-center gap-1.5 transition-all shadow"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>{p.targetTeamLeadName ? 'Change Team Leader' : 'Assign Team Leader'}</span>
                      </button>
                    )}

                    {/* Team Leader Assign to Full Stack */}
                    {isTeamLead && !p.assignedEngineerId && !isCompleted && (
                      <button
                        onClick={() => {
                          setAssigningProjectForFullStack(p);
                          setSelectedFullStackId(activeFsOptions[0]?.id || '');
                        }}
                        className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Assign to Full Stack Engineer</span>
                      </button>
                    )}

                    {/* Reports Downloads */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => exportProjectReportToPdf(p)}
                        className="flex-1 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-bold text-[11px] flex items-center justify-center gap-1 border border-gray-700"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>

                      <button
                        onClick={() => exportProjectReportToExcel(p)}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-400 font-bold text-[11px] flex items-center justify-center gap-1 border border-emerald-800"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                      </button>

                      {isTeamLead && (
                        <button
                          onClick={() => {
                            setSelectedProjectForDecompose(p);
                            setMilestoneTitle('Phase 1: Architecture & APIs');
                            setTaskTitle(`Implement components for ${p.projectName}`);
                          }}
                          className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 shadow"
                        >
                          <Plus className="w-3.5 h-3.5" /> Task
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Admin New Project Modal */}
      <Modal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        title="Admin - Create & Assign Project to Department Team Leader"
        maxWidth="lg"
      >
        <form onSubmit={handleAdminCreateProject} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-300 uppercase mb-1">Project Title *</label>
            <input
              type="text"
              required
              value={adminProjTitle}
              onChange={(e) => setAdminProjTitle(e.target.value)}
              placeholder="e.g. Enterprise AI Cloud Suite"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-300 uppercase mb-1">Customer / Client Name *</label>
              <input
                type="text"
                required
                value={adminCustomerName}
                onChange={(e) => setAdminCustomerName(e.target.value)}
                placeholder="Acme Global Inc"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-300 uppercase mb-1">Customer Email *</label>
              <input
                type="email"
                required
                value={adminCustomerEmail}
                onChange={(e) => setAdminCustomerEmail(e.target.value)}
                placeholder="client@acme.com"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-300 uppercase mb-1">Department Scope *</label>
              <select
                value={adminDeptScope}
                onChange={(e) => setAdminDeptScope(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Cloud DevOps">Cloud DevOps</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-300 uppercase mb-1">Budget ($ USD) *</label>
              <input
                type="number"
                required
                value={adminBudget}
                onChange={(e) => setAdminBudget(e.target.value)}
                placeholder="45000"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-300 uppercase mb-1">
              Select Department Team Leader (Only Team Leaders Shown) *
            </label>
            <select
              value={adminTargetTlId}
              onChange={(e) => setAdminTargetTlId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              {activeTlOptions.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  [{emp.employeeId}] {emp.fullName} - {emp.department} ({emp.designation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-300 uppercase mb-1">Project Requirements & Scope</label>
            <textarea
              rows={3}
              value={adminRequirements}
              onChange={(e) => setAdminRequirements(e.target.value)}
              placeholder="Detail technical requirements, client specifications, milestones, and deliverable targets..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold shadow-lg flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Create & Dispatch to Team Leader</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Assign / Change Team Leader Modal */}
      <Modal
        isOpen={!!assigningProjectForTl}
        onClose={() => setAssigningProjectForTl(null)}
        title="Admin - Select Department Team Leader"
      >
        <form onSubmit={handleAssignTeamLeader} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
            <p className="text-gray-400">Project Code: <strong className="text-indigo-400">{assigningProjectForTl?.projectCode}</strong></p>
            <p className="text-gray-400">Project Name: <strong className="text-white">{assigningProjectForTl?.projectName}</strong></p>
          </div>

          <div>
            <label className="block font-bold text-gray-300 uppercase mb-1">
              Select Department Team Leader (Only Team Leaders Shown) *
            </label>
            <select
              value={selectedTlIdForAssign}
              onChange={(e) => setSelectedTlIdForAssign(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              {activeTlOptions.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  [{emp.employeeId}] {emp.fullName} - {emp.department} ({emp.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button
              type="button"
              onClick={() => setAssigningProjectForTl(null)}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Assign & Dispatch</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Team Leader Assign to Full Stack Modal */}
      <Modal
        isOpen={!!assigningProjectForFullStack}
        onClose={() => setAssigningProjectForFullStack(null)}
        title="Team Leader - Assign Project to Full Stack Developer"
      >
        <form onSubmit={handleAssignToFullStack} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
            <p className="text-gray-400">Project Code: <strong className="text-amber-400">{assigningProjectForFullStack?.projectCode}</strong></p>
            <p className="text-gray-400">Project Name: <strong className="text-white">{assigningProjectForFullStack?.projectName}</strong></p>
          </div>

          <div>
            <label className="block font-bold text-gray-300 uppercase mb-1">
              Select Full Stack Engineer *
            </label>
            <select
              value={selectedFullStackId}
              onChange={(e) => setSelectedFullStackId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              {activeFsOptions.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  [{emp.employeeId}] {emp.fullName} - {emp.department} ({emp.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button
              type="button"
              onClick={() => setAssigningProjectForFullStack(null)}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow flex items-center gap-1"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Assign & Route</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* TL Milestone Breakdown Modal */}
      <Modal
        isOpen={!!selectedProjectForDecompose}
        onClose={() => setSelectedProjectForDecompose(null)}
        title="Team Leader - Decompose Project & Assign Task"
      >
        <form onSubmit={handleDecomposeProject} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
            <p className="text-gray-400">Project: <strong className="text-white">{selectedProjectForDecompose?.projectName}</strong></p>
          </div>

          <div>
            <label className="block font-bold text-gray-300 uppercase mb-1">Milestone Name *</label>
            <input
              type="text"
              required
              value={milestoneTitle}
              onChange={(e) => setMilestoneTitle(e.target.value)}
              placeholder="e.g. Phase 1: API & DB Schema"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-300 uppercase mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Implement Supabase Prisma client"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-300 uppercase mb-1">Assignee Staff *</label>
              <select
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {emsEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    [{emp.employeeId}] {emp.fullName} - {emp.department}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-300 uppercase mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button
              type="button"
              onClick={() => setSelectedProjectForDecompose(null)}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
