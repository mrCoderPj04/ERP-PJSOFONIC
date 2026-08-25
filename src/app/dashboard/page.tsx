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
  FileCheck,
  Download,
  FileSpreadsheet,
  Upload,
  ImageIcon,
  FileText,
  Workflow,
  Eye,
  Building,
  ExternalLink,
  TestTube,
} from 'lucide-react';
import {
  fetchCrmCustomerProjects,
  saveCrmProject,
  submitFullStackDeliverables,
  approveTlProduction,
  submitQualityReports,
  submitTlProjectAllDone,
  approveAdminFinal,
  assignProjectToFullStack,
  CrmCustomerProject,
  ProductionDeliverables,
  QualityReports,
} from '../../lib/crm';
import { EmptyState, Modal, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { fetchEmsEmployees, EmsUser } from '../../lib/ems';
import {
  getErpTasks,
  saveErpTask,
  submitWorkForTask,
  getTimesheetTodos,
  toggleTimesheetTodoStatus,
  ErpTask,
  TimesheetTodo,
} from '../../lib/erpStore';
import {
  exportProjectReportToExcel,
  exportProjectReportToPdf,
  exportTimesheetReportToExcel,
} from '../../lib/exportUtils';
import { syncWithQMS } from '../../lib/qms';
import { addSystemNotification } from '../../lib/notificationStore';

export default function DashboardPage() {
  const { user } = useAuth();
  const [crmProjects, setCrmProjects] = useState<CrmCustomerProject[]>([]);
  const [tasks, setTasks] = useState<ErpTask[]>([]);
  const [emsEmployees, setEmsEmployees] = useState<EmsUser[]>([]);
  const [timesheetTodos, setTimesheetTodos] = useState<TimesheetTodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Full Stack Deliverables Modal State (4 items)
  const [uploadingProject, setUploadingProject] = useState<CrmCustomerProject | null>(null);
  const [implPlan, setImplPlan] = useState('');
  const [logoImg, setLogoImg] = useState('');
  const [walkthrough, setWalkthrough] = useState('');
  const [workflowChart, setWorkflowChart] = useState('');

  // Team Leader Assign to Full Stack Modal
  const [assigningProject, setAssigningProject] = useState<CrmCustomerProject | null>(null);
  const [selectedFsId, setSelectedFsId] = useState('');

  // Admin Assign to Team Leader Modal
  const [assigningTlProject, setAssigningTlProject] = useState<CrmCustomerProject | null>(null);
  const [selectedTlIdForAssign, setSelectedTlIdForAssign] = useState('');

  // Quality Audit Submission Modal State (3 items)
  const [qaSubmittingProject, setQaSubmittingProject] = useState<CrmCustomerProject | null>(null);
  const [bugReport, setBugReport] = useState('');
  const [testReport, setTestReport] = useState('');
  const [qualityReport, setQualityReport] = useState('');

  // Deliverables / Reports Inspection Modal State
  const [inspectingProject, setInspectingProject] = useState<CrmCustomerProject | null>(null);

  // Admin Tab Filter: ACTIVE vs COMPLETED vs ALL
  const [adminTabFilter, setAdminTabFilter] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [projects, employees] = await Promise.all([
        fetchCrmCustomerProjects(),
        fetchEmsEmployees(),
      ]);
      setCrmProjects(projects);
      setEmsEmployees(employees);
      setTasks(getErpTasks());
      setTimesheetTodos(getTimesheetTodos());
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();

    // Real-time polling every 8s to fetch CRM & Supabase projects dynamically
    const pollInterval = setInterval(() => {
      fetchCrmCustomerProjects()
        .then((projects) => {
          if (Array.isArray(projects) && projects.length > 0) {
            setCrmProjects(projects);
          }
        })
        .catch(() => {});
    }, 8000);

    const handleFocus = () => {
      loadDashboardData();
    };
    window.addEventListener('focus', handleFocus);

    // Listen for storage and custom CRM update changes across tabs & profiles
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'pj_crm_active_projects' || e.key === 'pj_erp_tasks_store') {
        loadDashboardData();
      }
    };
    const handleCustomCrmUpdate = () => {
      loadDashboardData();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('pj_crm_updated', handleCustomCrmUpdate);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pj_crm_updated', handleCustomCrmUpdate);
    };
  }, []);

  if (!user) return null;

  // Helper to check if employee is Quality / QA Staff
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
      d.includes('QC') ||
      d.includes('AUDIT') ||
      dept.includes('QUALITY') ||
      dept.includes('QA') ||
      dept.includes('TESTING') ||
      dept.includes('QC') ||
      dept.includes('AUDIT')
    );
  };

  // Helper to check if employee is Team Leader
  const checkIsTeamLeader = (emp: any): boolean => {
    if (!emp) return false;
    if (checkIsQuality(emp)) return false; // Quality staff are not Team Leaders

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

  const userDept = (user?.department || '').toUpperCase();
  const userDesig = (user?.designation || '').toUpperCase();
  const userRole = user?.role || 'EMPLOYEE';
  const isAdmin = userRole === 'ADMIN' || userDesig.includes('ADMIN') || userDept.includes('ADMIN') || userDesig.includes('DIRECTOR');
  const isQualityDept = !isAdmin && (userRole === 'QA' || checkIsQuality(user));
  const isTeamLead = !isAdmin && !isQualityDept && (userRole === 'TEAM_LEAD' || checkIsTeamLeader(user));
  const isFullStack = !isAdmin && !isTeamLead && !isQualityDept;

  // Filter ONLY Team Leaders for Admin "Select Department Team Leader"
  const teamLeadersList = emsEmployees.filter((emp) => checkIsTeamLeader(emp));
  const activeTlOptions = teamLeadersList.length > 0 ? teamLeadersList : emsEmployees;

  // Filter Full Stack Engineers for Team Leader assignment dropdown
  const fsEngineers = emsEmployees.filter((emp) => {
    const isTl = checkIsTeamLeader(emp);
    const isQa = checkIsQuality(emp);
    return !isTl && !isQa;
  });

  // Helper to normalize strings for comparison
  const cleanStr = (s?: string) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

  // =========================================================================
  // Robust Matching for Team Leader Assigned Projects
  // =========================================================================
  const myTlProjects = isAdmin
    ? crmProjects
    : crmProjects.filter((p) => {
        const userCleanEmpId = cleanStr(user.employeeId);
        const userCleanId = cleanStr(user.id);
        const userCleanName = (user.fullName || '').toLowerCase().trim();

        const pTlIdClean = cleanStr(p.targetTeamLeadId);
        const pTlName = (p.targetTeamLeadName || '').toLowerCase().trim();
        const pTlNameClean = cleanStr(p.targetTeamLeadName);

        if (!p.targetTeamLeadId && !p.targetTeamLeadName) return false;

        // 1. Match by Employee ID
        if (userCleanEmpId && pTlIdClean && (userCleanEmpId === pTlIdClean || pTlIdClean.includes(userCleanEmpId) || userCleanEmpId.includes(pTlIdClean))) {
          return true;
        }
        if (userCleanEmpId && pTlNameClean && pTlNameClean.includes(userCleanEmpId)) {
          return true;
        }

        // 2. Match by User ID
        if (userCleanId && pTlIdClean && (userCleanId === pTlIdClean || pTlIdClean.includes(userCleanId) || userCleanId.includes(pTlIdClean))) {
          return true;
        }

        // 3. Match by Full Name
        if (userCleanName && pTlName && (pTlName.includes(userCleanName) || userCleanName.includes(pTlName))) {
          return true;
        }

        // 4. Match by Name word tokens (>= 3 chars)
        const nameTokens = userCleanName.split(/\s+/).filter((tok) => tok.length >= 3);
        if (nameTokens.length > 0 && nameTokens.some((tok) => pTlName.includes(tok))) {
          return true;
        }

        return false;
      });

  // Robust Matching for Full Stack Engineer Assigned Projects
  const myFsProjects = crmProjects.filter((p) => {
    const userCleanEmpId = cleanStr(user.employeeId);
    const userCleanId = cleanStr(user.id);
    const userCleanName = (user.fullName || '').toLowerCase().trim();

    const pFsIdClean = cleanStr(p.assignedEngineerId);
    const pFsName = (p.assignedEngineerName || '').toLowerCase().trim();
    const pFsNameClean = cleanStr(p.assignedEngineerName);

    if (userCleanEmpId && pFsIdClean && (userCleanEmpId === pFsIdClean || pFsIdClean.includes(userCleanEmpId) || userCleanEmpId.includes(pFsIdClean))) {
      return true;
    }
    if (userCleanEmpId && pFsNameClean && pFsNameClean.includes(userCleanEmpId)) {
      return true;
    }
    if (userCleanId && pFsIdClean && (userCleanId === pFsIdClean || pFsIdClean.includes(userCleanId) || userCleanId.includes(pFsIdClean))) {
      return true;
    }
    if (userCleanName && pFsName && (pFsName.includes(userCleanName) || userCleanName.includes(pFsName))) {
      return true;
    }

    const taskMatch = tasks.some((t) => {
      const isProjectTask = t.projectId === p.id || t.projectCode === p.projectCode;
      const isUserTask =
        cleanStr(t.assigneeId) === userCleanEmpId ||
        cleanStr(t.assigneeId) === userCleanId ||
        (t.assigneeName && t.assigneeName.toLowerCase().includes(userCleanName));
      return isProjectTask && isUserTask;
    });

    return Boolean(taskMatch);
  });

  // =========================================================================
  // Projects in Quality Queue (Sent to Quality / Approved by TL Production / QA Approved)
  // =========================================================================
  const qualityQueueProjects = crmProjects.filter(
    (p) =>
      p.stage === 'TL_PRODUCTION_APPROVED' ||
      p.stage === 'QUALITY_APPROVED' ||
      p.stage === 'SENT_TO_QUALITY' ||
      p.tlProductionApproval?.approved ||
      (p.productionDeliverables && !!p.productionDeliverables.implementationPlan && p.status !== 'COMPLETED')
  );

  // 1. Admin Assigns Team Leader to CRM Project
  const handleAdminAssignTl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTlProject) return;

    const selectedTl = emsEmployees.find((emp) => emp.id === selectedTlIdForAssign) || activeTlOptions[0];
    if (!selectedTl) return;

    const updated = saveCrmProject({
      ...assigningTlProject,
      targetTeamLeadId: selectedTl.id,
      targetTeamLeadName: `[${selectedTl.employeeId}] ${selectedTl.fullName} (${selectedTl.department})`,
      departmentScope: selectedTl.department || assigningTlProject.departmentScope,
      stage: 'ASSIGNED_TO_TL',
      status: 'working',
    });

    setCrmProjects(updated);

    // Dispatch System Notifications
    addSystemNotification({
      type: 'PROJECT_ASSIGN',
      title: 'Project Assigned',
      message: `You assigned project "${assigningTlProject.projectName}" to [${selectedTl.employeeId}] ${selectedTl.fullName}`,
      senderId: user.id || user.employeeId,
      senderName: user.fullName,
      recipientId: user.id || user.employeeId,
      link: '/dashboard',
    });
    addSystemNotification({
      type: 'PROJECT_ASSIGN',
      title: 'New Project Assigned',
      message: `${user.fullName} assigned project "${assigningTlProject.projectName}" to you`,
      senderId: user.id || user.employeeId,
      senderName: user.fullName,
      recipientId: selectedTl.id,
      recipientName: selectedTl.fullName,
      recipientRole: 'TEAM_LEAD',
      link: '/dashboard',
    });

    setNotification(
      `Project "${assigningTlProject.projectName}" successfully assigned to Team Leader [${selectedTl.employeeId}] ${selectedTl.fullName}!`
    );
    setTimeout(() => setNotification(null), 5000);
    setAssigningTlProject(null);
  };

  // 2. Full Stack Submit 4 Deliverables
  const handleFullStackDeliverablesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingProject) return;

    const deliverables: ProductionDeliverables = {
      implementationPlan: implPlan || 'Implementation plan: Standard architecture patterns applied, modular services configured.',
      logoImg: logoImg || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
      walkthrough: walkthrough || 'Walkthrough: Tested endpoints, verified UI components, responsive layout confirmed.',
      workflowChart: workflowChart || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80',
      submittedBy: `[${user.employeeId}] ${user.fullName}`,
      submittedAt: new Date().toISOString(),
    };

    const updated = submitFullStackDeliverables(uploadingProject.id, deliverables);
    setCrmProjects(updated);

    // Dispatch System Notifications
    addSystemNotification({
      type: 'DELIVERABLES_SUBMITTED',
      title: '4 Deliverables Submitted',
      message: `You submitted 4 deliverables for "${uploadingProject.projectName}" to Team Leader`,
      senderId: user.id || user.employeeId,
      senderName: user.fullName,
      recipientId: user.id || user.employeeId,
      link: '/dashboard',
    });
    addSystemNotification({
      type: 'DELIVERABLES_SUBMITTED',
      title: 'Production Deliverables Submitted',
      message: `${user.fullName} submitted 4 deliverables for "${uploadingProject.projectName}"`,
      senderId: user.id || user.employeeId,
      senderName: user.fullName,
      recipientId: uploadingProject.targetTeamLeadId,
      recipientName: uploadingProject.targetTeamLeadName,
      recipientRole: 'TEAM_LEAD',
      link: '/dashboard',
    });

    setNotification(`All 4 reports submitted for "${uploadingProject.projectName}"! Sent to Team Leader Dashboard under Production Section.`);
    setTimeout(() => setNotification(null), 5000);

    setUploadingProject(null);
    setImplPlan('');
    setLogoImg('');
    setWalkthrough('');
    setWorkflowChart('');
  };

  // 3. Team Leader Approves Production Deliverables -> Direct to Quality Profile
  const handleTlApproveProduction = (project: CrmCustomerProject) => {
    const updated = approveTlProduction(project.id, user.fullName);
    setCrmProjects(updated);

    // Sync project to QMS backend
    syncWithQMS({
      projectCode: project.projectCode,
      projectName: project.projectName,
      customerName: project.customerName,
      departmentScope: project.departmentScope,
      submittedByTl: user.fullName,
      testingStatus: 'IN PROCESS',
      requirements: project.requirements,
      submittedAt: new Date().toISOString(),
    });

    // Dispatch System Notifications
    addSystemNotification({
      type: 'QUALITY_SENT',
      title: 'Project Sent to Quality',
      message: `You approved deliverables for "${project.projectName}" and sent to Quality Profile`,
      senderId: user.id || user.employeeId,
      senderName: user.fullName,
      recipientId: user.id || user.employeeId,
      link: '/dashboard',
    });
    addSystemNotification({
      type: 'QUALITY_SENT',
      title: 'New Project in Quality Queue',
      message: `${user.fullName} (Team Leader) approved deliverables and sent "${project.projectName}" to Quality testing`,
      senderId: user.id || user.employeeId,
      senderName: user.fullName,
      recipientRole: 'QA',
      link: '/dashboard',
    });

    setNotification(`Production deliverables approved for "${project.projectName}"! Project routed directly to Quality Profile & QMS.`);
    setTimeout(() => setNotification(null), 5000);
  };

  // 4. Quality Submits 3 Reports (Save QA Reports)
  const handleQualityReportsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaSubmittingProject) return;

    const reports: QualityReports = {
      bugReport: bugReport || '0 Critical Bugs found. Minor UI edge cases addressed and cleared.',
      testReport: testReport || 'End-to-end unit and integration tests executed: 100% pass rate.',
      qualityReport: qualityReport || 'Overall quality audit rating: Grade A+. Code complies with enterprise standards.',
      verifiedBy: `[${user.employeeId}] ${user.fullName} (QA Auditor)`,
      verifiedAt: new Date().toISOString(),
      qualityStatus: 'IN PROCESS',
    };

    const updated = submitQualityReports(qaSubmittingProject.id, reports);
    setCrmProjects(updated);

    addSystemNotification({
      type: 'QUALITY_APPROVED',
      title: '3 QA Reports Saved',
      message: `You updated 3 QA reports for "${qaSubmittingProject.projectName}"`,
      senderId: user.id || user.employeeId,
      senderName: user.fullName,
      recipientId: user.id || user.employeeId,
      link: '/dashboard',
    });

    setNotification(`3 QA Reports saved for "${qaSubmittingProject.projectName}"! Click 'Approve QA Report' to finalize approval.`);
    setTimeout(() => setNotification(null), 5000);

    setQaSubmittingProject(null);
    setBugReport('');
    setTestReport('');
    setQualityReport('');
  };

  // 5. Quality Grants Approval Report
  const handleGrantQualityApproval = (project: CrmCustomerProject) => {
    const reports: QualityReports = {
      bugReport: project.qualityReports?.bugReport || '0 Critical Bugs found in automated test runs.',
      testReport: project.qualityReports?.testReport || '100% Test pass rate across API & UI workflows.',
      qualityReport: project.qualityReports?.qualityReport || 'Quality Audit Grade A+: Ready for production deployment.',
      verifiedBy: `[${user.employeeId}] ${user.fullName} (QA Auditor)`,
      verifiedAt: new Date().toISOString(),
      qualityStatus: 'QUALITY_APPROVED',
    };

    const updated = submitQualityReports(project.id, reports);
    setCrmProjects(updated);

    // Dispatch System Notifications
    addSystemNotification({
      type: 'QUALITY_APPROVED',
      title: 'Quality Approval Granted',
      message: `You approved QA reports for "${project.projectName}"`,
      senderId: user.id || user.employeeId,
      senderName: user.fullName,
      recipientId: user.id || user.employeeId,
      link: '/dashboard',
    });
    addSystemNotification({
      type: 'QUALITY_APPROVED',
      title: 'Quality Approval Received',
      message: `${user.fullName} (QA Auditor) approved QA reports for "${project.projectName}"`,
      senderId: user.id || user.employeeId,
      senderName: user.fullName,
      recipientId: project.targetTeamLeadId,
      recipientName: project.targetTeamLeadName,
      recipientRole: 'TEAM_LEAD',
      link: '/dashboard',
    });

    setNotification(`Quality Approval Granted for "${project.projectName}"! Project sent to Team Leader Quality Section.`);
    setTimeout(() => setNotification(null), 5000);
  };

  // 6. Quality Opens QMS Live Application
  const handleOpenQmsLive = (project: CrmCustomerProject) => {
    // Open live QMS application
    window.open('https://pjsofonic-qms.onrender.com/', '_blank');
  };

  // 7. Team Leader Submits "Project All Done" to Admin
  const handleTlSubmitAllDone = (project: CrmCustomerProject) => {
    const updated = submitTlProjectAllDone(project.id, user.fullName);
    setCrmProjects(updated);

    // Dispatch System Notifications
    addSystemNotification({
      type: 'ADMIN_APPROVED',
      title: 'Project All Done Submitted',
      message: `You marked "${project.projectName}" ALL DONE and submitted to Admin for final approval`,
      senderId: user.id || user.employeeId,
      senderName: user.fullName,
      recipientId: user.id || user.employeeId,
      link: '/dashboard',
    });
    addSystemNotification({
      type: 'ADMIN_APPROVED',
      title: 'Project Submitted for Final Approval',
      message: `${user.fullName} (Team Leader) marked project "${project.projectName}" as ALL DONE and submitted for final approval`,
      senderId: user.id || user.employeeId,
      senderName: user.fullName,
      recipientRole: 'ADMIN',
      link: '/dashboard',
    });

    setNotification(`Project "${project.projectName}" marked ALL DONE! Submitted to Admin Profile for final approval.`);
    setTimeout(() => setNotification(null), 5000);
  };

  // 8. Admin Grants Final Total Approval -> Completed across all profiles
  const handleAdminFinalApproval = (project: CrmCustomerProject) => {
    const updated = approveAdminFinal(project.id, user.fullName);
    setCrmProjects(updated);

    // Dispatch System Notifications
    addSystemNotification({
      type: 'ADMIN_APPROVED',
      title: 'Final Total Approval Granted',
      message: `You granted final total approval for "${project.projectName}". Project is now COMPLETED!`,
      senderId: user.id || user.employeeId,
      senderName: user.fullName,
      recipientId: user.id || user.employeeId,
      link: '/dashboard',
    });
    addSystemNotification({
      type: 'ADMIN_APPROVED',
      title: 'Project Completed & Approved',
      message: `${user.fullName} (Admin) granted Final Total Approval for "${project.projectName}" (COMPLETED)`,
      senderId: user.id || user.employeeId,
      senderName: user.fullName,
      recipientId: 'ALL',
      link: '/dashboard',
    });

    setNotification(`Total Approval granted for "${project.projectName}"! Project is now COMPLETED on all profiles.`);
    setTimeout(() => setNotification(null), 6000);
  };

  // Team Leader Assign to Full Stack
  const handleTlAssignToFullStack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningProject) return;
    const fs = emsEmployees.find((emp) => emp.id === selectedFsId) || fsEngineers[0];
    if (!fs) return;

    const updated = assignProjectToFullStack(
      assigningProject.id,
      fs.id,
      `[${fs.employeeId}] ${fs.fullName} (${fs.designation})`
    );
    setCrmProjects(updated);

    // Dispatch System Notifications
    addSystemNotification({
      type: 'PROJECT_ASSIGN',
      title: 'Project Assigned to Full Stack',
      message: `You assigned project "${assigningProject.projectName}" to [${fs.employeeId}] ${fs.fullName}`,
      senderId: user.id || user.employeeId,
      senderName: user.fullName,
      recipientId: user.id || user.employeeId,
      link: '/dashboard',
    });
    addSystemNotification({
      type: 'PROJECT_ASSIGN',
      title: 'New Project Assigned to You',
      message: `${user.fullName} assigned project "${assigningProject.projectName}" to you`,
      senderId: user.id || user.employeeId,
      senderName: user.fullName,
      recipientId: fs.id,
      recipientName: fs.fullName,
      link: '/dashboard',
    });

    setNotification(`Project "${assigningProject.projectName}" assigned to Full Stack Engineer ${fs.fullName}!`);
    setTimeout(() => setNotification(null), 5000);
    setAssigningProject(null);
  };

  // Full Stack Timesheet TODO quick toggle
  const handleToggleTodo = (id: string) => {
    const updated = toggleTimesheetTodoStatus(id);
    setTimesheetTodos(updated);
    const target = updated.find((t) => t.id === id);
    if (target && target.completed) {
      addSystemNotification({
        type: 'TIMESHEET_DONE',
        title: 'Timesheet Task Completed',
        message: `${user.fullName} marked timesheet task "${target.taskTitle}" as Done`,
        senderId: user.id || user.employeeId,
        senderName: user.fullName,
        recipientRole: 'TEAM_LEAD',
        link: '/timesheet',
      });
      addSystemNotification({
        type: 'TIMESHEET_DONE',
        title: 'Task Done',
        message: `You marked "${target.taskTitle}" as Done`,
        senderId: user.id || user.employeeId,
        senderName: user.fullName,
        recipientId: user.id || user.employeeId,
        link: '/timesheet',
      });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Notifications */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. REAL-TIME LOGGED-IN EMS EMPLOYEE PROFILE BANNER */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-gray-900 via-indigo-950/60 to-gray-900 border border-gray-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="relative">
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
                  <ShieldCheck className="w-3.5 h-3.5 inline" /> Verified EMS Profile
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                {user.fullName}
                {isAdmin && <Crown className="w-5 h-5 text-amber-400 inline" />}
                {isTeamLead && <Crown className="w-5 h-5 text-amber-400 inline" />}
                {isFullStack && <Code2 className="w-5 h-5 text-cyan-400 inline" />}
                {isQualityDept && <ShieldAlert className="w-5 h-5 text-rose-400 inline" />}
              </h1>

              <p className="text-xs text-indigo-300 font-semibold flex items-center gap-2">
                <span>{user.designation}</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-300 font-normal">{user.department}</span>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800/80 space-y-2 text-xs w-full md:w-auto min-w-[270px]">
            <div className="flex items-center gap-2 text-gray-300">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-mono">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{user.phone || 'Registered in EMS'}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-800/80 pt-2 mt-2">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Role Dashboard Mode</span>
              <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                {isAdmin ? 'ADMIN CONTROL' : isTeamLead ? 'TEAM LEADER' : isQualityDept ? 'QUALITY QA AUDIT' : 'FULL STACK ENGINEER'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FULL STACK DEVELOPER WORKBENCH & DELIVERABLES UPLOAD */}
      {/* ========================================================================= */}
      {isFullStack && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                  Full Stack Engineer Execution Desk
                </span>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-1">
                  <Code2 className="w-5 h-5 text-cyan-400" /> Assigned Projects ({myFsProjects.length})
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Update status, upload the 4 required deliverables (Implementation Plan, Logo img, Walkthrough, Workflow chart) and submit for Team Leader review.
                </p>
              </div>

              <button
                onClick={loadDashboardData}
                className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold border border-gray-700 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            </div>

            {myFsProjects.length === 0 ? (
              <div className="p-8 bg-gray-950/60 rounded-2xl border border-gray-800 text-center space-y-2">
                <Code2 className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-sm font-bold text-gray-300">No Projects Currently Assigned to You</p>
                <p className="text-xs text-gray-500">When your Team Leader assigns a project to your profile, it will appear here for execution.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myFsProjects.map((p) => {
                  const hasSubmitted = !!p.productionDeliverables?.implementationPlan;
                  const isCompleted = p.status === 'COMPLETED';

                  return (
                    <div
                      key={p.id}
                      className={`p-5 rounded-2xl bg-gray-950 border ${
                        isCompleted
                          ? 'border-emerald-500/40 bg-emerald-950/10'
                          : 'border-gray-800/80 hover:border-cyan-500/40'
                      } transition-all space-y-3 flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            {p.projectCode}
                          </span>
                          {isCompleted ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> COMPLETED
                            </span>
                          ) : (
                            <Badge variant={hasSubmitted ? 'success' : 'warning'}>
                              {p.stage || (hasSubmitted ? 'PRODUCTION_SUBMITTED' : 'WORKING')}
                            </Badge>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-white">{p.projectName}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Team Leader: <strong className="text-amber-400">{p.targetTeamLeadName || 'Assigned TL'}</strong></p>

                        <div className="mt-3 p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-1.5">
                          <div className="flex justify-between text-gray-400">
                            <span>Status:</span>
                            <span className="font-bold text-cyan-400 uppercase">{p.status}</span>
                          </div>
                          <div className="flex justify-between text-gray-400">
                            <span>Deliverables Status:</span>
                            <span className={hasSubmitted ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                              {hasSubmitted ? '✓ 4 Deliverables Submitted' : 'Pending Deliverables'}
                            </span>
                          </div>
                        </div>

                        {p.productionDeliverables && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-gray-900/60 border border-gray-800 text-[11px] text-gray-300 space-y-1">
                            <span className="font-bold text-emerald-400 block">Submitted Deliverables:</span>
                            <p className="truncate">1. Plan: {p.productionDeliverables.implementationPlan}</p>
                            <p className="truncate">2. Logo: {p.productionDeliverables.logoImg ? 'Provided' : 'N/A'}</p>
                            <p className="truncate">3. Walkthrough: {p.productionDeliverables.walkthrough}</p>
                            <p className="truncate">4. Chart: {p.productionDeliverables.workflowChart ? 'Provided' : 'N/A'}</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-gray-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setUploadingProject(p);
                            setImplPlan(p.productionDeliverables?.implementationPlan || '');
                            setLogoImg(p.productionDeliverables?.logoImg || '');
                            setWalkthrough(p.productionDeliverables?.walkthrough || '');
                            setWorkflowChart(p.productionDeliverables?.workflowChart || '');
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{hasSubmitted ? 'Update / Re-Upload Deliverables' : 'Upload 4 Deliverables & Submit'}</span>
                        </button>

                        <button
                          onClick={() => setInspectingProject(p)}
                          className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 text-xs border border-gray-800"
                          title="View Deliverables"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Full Stack Timesheet TODO Widget */}
          <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-indigo-400" /> Daily Timesheet TODO Checklist
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Click any TODO to mark it Done as you complete daily engineering work.</p>
              </div>
              <Link
                href="/timesheet"
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow flex items-center gap-1"
              >
                <span>Full Timesheet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {timesheetTodos.length === 0 ? (
              <p className="text-xs text-gray-500 italic p-4 bg-gray-950/60 rounded-xl border border-gray-800">
                No TODO items created yet. Visit Timesheet page or click "Add TODO" to log hours.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {timesheetTodos.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleTodo(item.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      item.completed
                        ? 'bg-gray-950/40 border-emerald-900/40 opacity-70'
                        : 'bg-gray-950 border-gray-800 hover:border-indigo-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${
                          item.completed
                            ? 'bg-emerald-500 border-emerald-400 text-white'
                            : 'border-gray-700 bg-gray-900 text-transparent'
                        }`}
                      >
                        ✓
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${item.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                          {item.taskTitle}
                        </p>
                        <span className="text-[10px] text-gray-400">{item.projectName} • {item.hours} hrs</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {item.completed ? 'DONE' : 'TODO'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TEAM LEADER DUAL WORKBENCH: PRODUCTION SECTION & QUALITY SECTION */}
      {/* ========================================================================= */}
      {isTeamLead && !isAdmin && (
        <div className="space-y-8">
          {/* SECTION A: PRODUCTION SECTION (Full Stack Deliverables Review & Approval) */}
          <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                  Production Deliverables Desk
                </span>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-1">
                  <Workflow className="w-5 h-5 text-amber-400" /> Assigned Projects ({myTlProjects.length}) - Production Section
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Review Full Stack submitted reports (Implementation plan, Logo img, Walkthrough, Workflow chart) and approve to route directly to Quality profile.
                </p>
              </div>

              <button
                onClick={loadDashboardData}
                className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold border border-gray-700 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Projects</span>
              </button>
            </div>

            {myTlProjects.length === 0 ? (
              <div className="p-8 bg-gray-950/60 rounded-2xl border border-gray-800 text-center">
                <p className="text-xs text-gray-400 font-medium">No projects assigned to you by Admin yet.</p>
                <p className="text-[11px] text-gray-500 mt-1">When Admin selects your name in "Select Department Team Leader", projects will appear here immediately.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myTlProjects.map((p) => {
                  const prod = p.productionDeliverables;
                  const isSubmitted = !!prod?.implementationPlan;
                  const isTlApproved = !!p.tlProductionApproval?.approved;
                  const isCompleted = p.status === 'COMPLETED';

                  return (
                    <div
                      key={p.id}
                      className={`p-5 rounded-2xl bg-gray-950 border ${
                        isCompleted
                          ? 'border-emerald-500/40 bg-emerald-950/10'
                          : isTlApproved
                          ? 'border-indigo-500/30'
                          : isSubmitted
                          ? 'border-amber-500/40 shadow-amber-950/20'
                          : 'border-gray-800'
                      } transition-all space-y-3 flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {p.projectCode}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                              isCompleted
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : isTlApproved
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                : isSubmitted
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-gray-900 text-gray-400 border-gray-800'
                            }`}
                          >
                            {isCompleted
                              ? 'COMPLETED'
                              : isTlApproved
                              ? 'SENT TO QUALITY'
                              : isSubmitted
                              ? 'DELIVERABLES SUBMITTED'
                              : 'PENDING FULL STACK'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white">{p.projectName}</h4>
                        <p className="text-xs text-gray-400">Client: {p.customerName} (${p.budget?.toLocaleString()})</p>
                        <p className="text-xs text-cyan-400 mt-1 font-semibold">
                          Assigned Full Stack: {p.assignedEngineerName || 'Unassigned (Assign Below)'}
                        </p>

                        {/* Submitted Deliverables Card */}
                        {isSubmitted ? (
                          <div className="mt-3 p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-2">
                            <span className="font-bold text-amber-400 flex items-center gap-1">
                              <FileCheck className="w-4 h-4 text-emerald-400" /> 4 Submitted Production Deliverables:
                            </span>
                            <div className="space-y-1 text-[11px] text-gray-300 pl-1">
                              <p>• <strong>1. Implementation Plan:</strong> {prod.implementationPlan?.slice(0, 60)}...</p>
                              <p>• <strong>2. Logo Image:</strong> {prod.logoImg ? '✓ Uploaded' : 'N/A'}</p>
                              <p>• <strong>3. Walkthrough:</strong> {prod.walkthrough?.slice(0, 60)}...</p>
                              <p>• <strong>4. Workflow Chart:</strong> {prod.workflowChart ? '✓ Uploaded' : 'N/A'}</p>
                            </div>
                            <span className="text-[10px] text-gray-500 block pt-1">
                              Submitted by {prod.submittedBy} on {prod.submittedAt ? new Date(prod.submittedAt).toLocaleDateString() : ''}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-3 p-3 rounded-xl bg-gray-900/50 border border-gray-800 text-xs text-gray-400 italic">
                            Full Stack Engineer has not yet submitted the 4 deliverables.
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2">
                        {!p.assignedEngineerId && (
                          <button
                            onClick={() => {
                              setAssigningProject(p);
                              setSelectedFsId(fsEngineers[0]?.id || '');
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow flex items-center gap-1"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Assign to Full Stack</span>
                          </button>
                        )}

                        {isSubmitted && !isTlApproved && (
                          <button
                            onClick={() => handleTlApproveProduction(p)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                            <span>Approve & Send to Quality Profile →</span>
                          </button>
                        )}

                        {isTlApproved && (
                          <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" /> In Quality Audit Queue
                          </span>
                        )}

                        <button
                          onClick={() => setInspectingProject(p)}
                          className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION B: QUALITY SECTION (Review Quality Reports, Download PDF/Excel, Submit All Done) */}
          <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                  Quality Audit & Finalization Desk
                </span>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-1">
                  <ShieldAlert className="w-5 h-5 text-rose-400" /> Quality Section (QA Reports, PDF/Excel Exports & Admin Submit)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  View Quality submitted reports (Bug report, Test report, Quality report). Download reports as PDF & Excel, and submit Project All Done to Admin.
                </p>
              </div>

              {/* Timesheet Excel Download Button for Team Leader */}
              <button
                onClick={() => exportTimesheetReportToExcel(timesheetTodos, user.fullName)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Team Timesheet (Excel)</span>
              </button>
            </div>

            {myTlProjects.filter((p) => p.qualityReports?.qualityStatus === 'QUALITY_APPROVED' || p.tlProductionApproval?.approved).length === 0 ? (
              <div className="p-6 bg-gray-950/60 rounded-2xl border border-gray-800 text-center">
                <p className="text-xs text-gray-400">
                  No projects in Quality section yet. When you approve Production deliverables, projects route to Quality and their QA reports will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myTlProjects
                  .filter((p) => p.qualityReports?.qualityStatus === 'QUALITY_APPROVED' || p.tlProductionApproval?.approved)
                  .map((p) => {
                    const qa = p.qualityReports;
                    const isQaApproved = qa?.qualityStatus === 'QUALITY_APPROVED';
                    const isSubmittedToAdmin = p.tlFinalSubmission?.submitted;
                    const isCompleted = p.status === 'COMPLETED';

                    return (
                      <div
                        key={`qa-sec-${p.id}`}
                        className={`p-5 rounded-2xl bg-gray-950 border ${
                          isCompleted
                            ? 'border-emerald-500/40 bg-emerald-950/10'
                            : isQaApproved
                            ? 'border-rose-500/30'
                            : 'border-gray-800'
                        } space-y-3 flex flex-col justify-between`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-mono text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                              {p.projectCode}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                                isCompleted
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : isSubmittedToAdmin
                                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                  : isQaApproved
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              }`}
                            >
                              {isCompleted
                                ? 'ALL DONE & COMPLETED'
                                : isSubmittedToAdmin
                                ? 'SUBMITTED TO ADMIN'
                                : isQaApproved
                                ? 'QUALITY APPROVED'
                                : 'IN QUALITY AUDIT'}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white">{p.projectName}</h4>

                          {/* Quality Reports Summary Box */}
                          {isQaApproved && qa ? (
                            <div className="mt-3 p-3.5 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-2">
                              <span className="font-bold text-rose-400 flex items-center gap-1">
                                <ShieldAlert className="w-4 h-4" /> 3 Verified Quality Reports:
                              </span>
                              <div className="space-y-1 text-[11px] text-gray-300 pl-1">
                                <p>• <strong>1. Bug Report:</strong> {qa.bugReport}</p>
                                <p>• <strong>2. Test Report:</strong> {qa.testReport}</p>
                                <p>• <strong>3. Quality Report:</strong> {qa.qualityReport}</p>
                              </div>
                              <span className="text-[10px] text-gray-500 block pt-1">
                                Verified by {qa.verifiedBy} on {qa.verifiedAt ? new Date(qa.verifiedAt).toLocaleDateString() : ''}
                              </span>
                            </div>
                          ) : (
                            <div className="mt-3 p-3 rounded-xl bg-gray-900/50 border border-gray-800 text-xs text-gray-400 italic">
                              Quality Auditor is currently reviewing the project deliverables.
                            </div>
                          )}
                        </div>

                        {/* Action Buttons: Download PDF, Download Excel, Submit All Done */}
                        <div className="pt-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => exportProjectReportToPdf(p)}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download PDF</span>
                            </button>

                            <button
                              onClick={() => exportProjectReportToExcel(p)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center gap-1"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5" />
                              <span>Download Excel</span>
                            </button>
                          </div>

                          {isQaApproved && !isSubmittedToAdmin && !isCompleted && (
                            <button
                              onClick={() => handleTlSubmitAllDone(p)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4 text-white" />
                              <span>Project All Done / Submit to Admin →</span>
                            </button>
                          )}

                          {isSubmittedToAdmin && !isCompleted && (
                            <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-bold">
                              Waiting for Admin Approval
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. QUALITY DEPARTMENT AUDIT WORKBENCH */}
      {/* ========================================================================= */}
      {isQualityDept && (
        <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                Quality Assurance Hub
              </span>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-1">
                <ShieldAlert className="w-5 h-5 text-rose-400" /> Quality Testing Queue ({qualityQueueProjects.length})
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Inspect Team Leader approved deliverables. Test project via live QMS, submit 3 QA reports, and grant Quality Approval.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* QMS Live Test Portal Link */}
              <a
                href="https://pjsofonic-qms.onrender.com/"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open QMS Testing Suite</span>
              </a>

              <button
                onClick={loadDashboardData}
                className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold border border-gray-700 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Queue</span>
              </button>
            </div>
          </div>

          {qualityQueueProjects.length === 0 ? (
            <div className="p-8 bg-gray-950/60 rounded-2xl border border-gray-800 text-center">
              <ShieldAlert className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-300">No Projects Pending Quality Testing</p>
              <p className="text-xs text-gray-500">When Team Leaders approve production deliverables, projects automatically route here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {qualityQueueProjects.map((p) => {
                const prod = p.productionDeliverables;
                const qa = p.qualityReports;
                const isApproved = qa?.qualityStatus === 'QUALITY_APPROVED';
                const hasQaReports = !!qa?.bugReport;

                return (
                  <div
                    key={p.id}
                    className={`p-5 rounded-2xl bg-gray-950 border ${
                      isApproved ? 'border-emerald-500/30' : 'border-rose-500/40 shadow-rose-950/20'
                    } space-y-3 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          {p.projectCode}
                        </span>
                        <Badge variant={isApproved ? 'success' : 'warning'}>
                          {isApproved ? 'QUALITY APPROVED' : 'IN AUDIT / SENT TO QA'}
                        </Badge>
                      </div>

                      <h4 className="text-base font-bold text-white">{p.projectName}</h4>
                      <p className="text-xs text-gray-400">TL: <strong className="text-amber-400">{p.targetTeamLeadName}</strong> • Engineer: <strong className="text-cyan-400">{p.assignedEngineerName || prod?.submittedBy}</strong></p>

                      {/* Production Deliverables Overview */}
                      <div className="mt-3 p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-1 text-gray-300">
                        <span className="font-bold text-white block mb-1">Submitted Deliverables for Audit:</span>
                        <p className="truncate">• Plan: {prod?.implementationPlan || 'Provided'}</p>
                        <p className="truncate">• Walkthrough: {prod?.walkthrough || 'Provided'}</p>
                        <p>• Logo & Workflow Chart: {prod?.logoImg && prod?.workflowChart ? '✓ Verified' : 'Uploaded'}</p>
                      </div>

                      {/* QA Reports Preview if filled */}
                      {hasQaReports && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-gray-900/60 border border-gray-800 text-[11px] text-gray-300 space-y-1">
                          <span className="font-bold text-rose-400 block">Current QA Reports:</span>
                          <p className="truncate">• Bug: {qa?.bugReport}</p>
                          <p className="truncate">• Test: {qa?.testReport}</p>
                          <p className="truncate">• Quality: {qa?.qualityReport}</p>
                        </div>
                      )}
                    </div>

                    {/* SEPARATE DISTINCT BUTTONS FOR QUALITY ACTIONS */}
                    <div className="pt-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2">
                      {/* Button 1: Submit 3 QA Reports */}
                      <button
                        onClick={() => {
                          setQaSubmittingProject(p);
                          setBugReport(p.qualityReports?.bugReport || '0 Critical Bugs found in automated test runs.');
                          setTestReport(p.qualityReports?.testReport || '100% Test pass rate across API & UI workflows.');
                          setQualityReport(p.qualityReports?.qualityReport || 'Quality Audit Grade A+: Ready for production deployment.');
                        }}
                        className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{hasQaReports ? 'Edit 3 QA Reports' : 'Submit 3 QA Reports'}</span>
                      </button>

                      {/* Button 2: Approve Report */}
                      {!isApproved ? (
                        <button
                          onClick={() => handleGrantQualityApproval(p)}
                          className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Report</span>
                        </button>
                      ) : (
                        <span className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      )}

                      {/* Button 3: Test Project (Opens QMS live link) */}
                      <button
                        onClick={() => handleOpenQmsLive(p)}
                        className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
                        title="Open QMS live testing portal"
                      >
                        <TestTube className="w-3.5 h-3.5" />
                        <span>Test Project</span>
                        <ExternalLink className="w-3 h-3 opacity-75" />
                      </button>

                      {/* Button 4: Inspect Deliverables */}
                      <button
                        onClick={() => setInspectingProject(p)}
                        className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 text-xs border border-gray-800 ml-auto"
                        title="View Deliverables"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ADMIN CONTROL HUB: FULL AUDIT, ASSIGN TL & FINAL TOTAL APPROVAL */}
      {/* ========================================================================= */}
      {isAdmin && (() => {
        const adminActiveProjects = crmProjects.filter((p) => p.status !== 'COMPLETED' && p.stage !== 'COMPLETED');
        const adminCompletedProjects = crmProjects.filter((p) => p.status === 'COMPLETED' || p.stage === 'COMPLETED');

        return (
          <div className="space-y-6">
            {/* Section A: Active Projects */}
            <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                    Admin Executive Command Hub
                  </span>
                  <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-1">
                    <Crown className="w-5 h-5 text-amber-400" /> Active &amp; Ongoing Projects ({adminActiveProjects.length})
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Live production pipeline. Assign CRM projects to Team Leaders, review deliverables, and grant Final Total Approval.
                  </p>
                </div>

                {/* Filter Tabs & Quick Action */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadDashboardData()}
                    className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs border border-gray-700 flex items-center gap-1 transition-all"
                    title="Refresh Live Projects"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync</span>
                  </button>

                  <Link
                    href="/projects"
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow flex items-center gap-1"
                  >
                    <span>Projects Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {adminActiveProjects.length === 0 ? (
                <EmptyState
                  icon={FolderKanban}
                  title="No Active Ongoing Projects"
                  description="All projects have been completed or no new projects are currently in the active pipeline."
                  actionLabel="Go to Projects Page"
                  onAction={() => (window.location.href = '/projects')}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {adminActiveProjects.map((p) => {
                    const isReadyForAdmin =
                      p.tlFinalSubmission?.submitted ||
                      p.stage === 'SUBMITTED_TO_ADMIN' ||
                      p.qualityReports?.qualityStatus === 'QUALITY_APPROVED';

                    return (
                      <div
                        key={`admin-active-${p.id}`}
                        className={`p-5 rounded-2xl bg-gray-950 border ${
                          isReadyForAdmin
                            ? 'border-amber-500/40 shadow-amber-950/20'
                            : 'border-gray-800'
                        } space-y-3 flex flex-col justify-between`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              {p.projectCode}
                            </span>
                            <Badge variant={isReadyForAdmin ? 'warning' : 'info'}>
                              {p.stage || (p.targetTeamLeadName ? 'ASSIGNED_TO_TL' : 'UNASSIGNED')}
                            </Badge>
                          </div>

                          <h4 className="text-base font-bold text-white">{p.projectName}</h4>
                          <p className="text-xs text-gray-400">
                            Client: {p.customerName} (${p.budget?.toLocaleString()})
                          </p>

                          <div className="mt-3 p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Team Leader:</span>
                              <span className="font-bold text-amber-400 truncate max-w-[160px]">
                                {p.targetTeamLeadName || 'Not Assigned'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Engineer:</span>
                              <span className="font-bold text-cyan-400 truncate max-w-[160px]">
                                {p.assignedEngineerName || 'Pending TL Assign'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 pt-1 border-t border-gray-800/80">
                              <span
                                className={`text-[10px] font-bold ${
                                  p.productionDeliverables?.implementationPlan
                                    ? 'text-emerald-400'
                                    : 'text-gray-500'
                                }`}
                              >
                                {p.productionDeliverables?.implementationPlan
                                  ? '✓ 4 Deliverables'
                                  : '○ Deliverables'}
                              </span>
                              <span>•</span>
                              <span
                                className={`text-[10px] font-bold ${
                                  p.qualityReports?.qualityStatus === 'QUALITY_APPROVED'
                                    ? 'text-emerald-400'
                                    : 'text-gray-500'
                                }`}
                              >
                                {p.qualityReports?.qualityStatus === 'QUALITY_APPROVED'
                                  ? '✓ QA Approved'
                                  : '○ QA Pending'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-800 flex flex-col gap-2">
                          {/* Admin Action: Assign / Change Team Leader */}
                          <button
                            onClick={() => {
                              setAssigningTlProject(p);
                              setSelectedTlIdForAssign(
                                p.targetTeamLeadId || activeTlOptions[0]?.id || ''
                              );
                            }}
                            className="w-full py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-amber-400 hover:text-amber-300 font-bold text-xs border border-gray-800 flex items-center justify-center gap-1.5 transition-all shadow"
                          >
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span>
                              {p.targetTeamLeadName ? 'Change Team Leader' : 'Assign Team Leader'}
                            </span>
                          </button>

                          {/* Reports Downloads */}
                          <div className="flex items-center justify-between gap-2">
                            <button
                              onClick={() => exportProjectReportToPdf(p)}
                              className="flex-1 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-bold text-[11px] flex items-center justify-center gap-1 border border-gray-700"
                            >
                              <Download className="w-3.5 h-3.5" /> PDF Report
                            </button>

                            <button
                              onClick={() => exportProjectReportToExcel(p)}
                              className="flex-1 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-400 font-bold text-[11px] flex items-center justify-center gap-1 border border-emerald-800"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel Report
                            </button>

                            <button
                              onClick={() => setInspectingProject(p)}
                              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                              title="Inspect"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Final Total Approval Button */}
                          <button
                            onClick={() => handleAdminFinalApproval(p)}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Grant Final Total Project Approval</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section B: Completed & Archived Projects */}
            <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 backdrop-blur-md space-y-6 shadow-xl shadow-emerald-950/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                    Archive &amp; Approved Dossiers
                  </span>
                  <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Completed Projects ({adminCompletedProjects.length})
                  </h3>
                  <p className="text-xs text-emerald-200/70 mt-0.5">
                    Fully delivered customer projects with verified 4 engineering deliverables, 3 QA reports, and executive admin sign-off.
                  </p>
                </div>
              </div>

              {adminCompletedProjects.length === 0 ? (
                <div className="py-8 text-center bg-gray-950/40 rounded-2xl border border-dashed border-emerald-500/20 text-xs text-gray-400">
                  <p className="font-semibold text-gray-300">No Projects Completed Yet</p>
                  <p className="text-[11px] mt-1 text-gray-500">
                    When you grant &apos;Final Total Approval&apos; on any active project above, it will automatically move here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {adminCompletedProjects.map((p) => (
                    <div
                      key={`admin-completed-${p.id}`}
                      className="p-5 rounded-2xl bg-gray-950 border border-emerald-500/40 bg-emerald-950/10 shadow-lg shadow-emerald-950/30 space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {p.projectCode}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ALL DONE / COMPLETED
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white">{p.projectName}</h4>
                        <p className="text-xs text-gray-400">
                          Client: {p.customerName} (${p.budget?.toLocaleString()})
                        </p>

                        <div className="mt-3 p-3 rounded-xl bg-gray-900/80 border border-emerald-500/20 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Team Leader:</span>
                            <span className="font-bold text-amber-400 truncate max-w-[160px]">
                              {p.targetTeamLeadName || 'Not Assigned'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Engineer:</span>
                            <span className="font-bold text-cyan-400 truncate max-w-[160px]">
                              {p.assignedEngineerName || 'Full Stack Staff'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-gray-800">
                            <span className="text-gray-400">Approved By:</span>
                            <span className="font-bold text-emerald-400">
                              {p.adminFinalApproval?.approvedBy || user.fullName}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-emerald-500/20 flex flex-col gap-2">
                        {/* Reports Downloads */}
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => exportProjectReportToPdf(p)}
                            className="flex-1 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white font-bold text-[11px] flex items-center justify-center gap-1 border border-gray-700"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF Dossier
                          </button>

                          <button
                            onClick={() => exportProjectReportToExcel(p)}
                            className="flex-1 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1 border border-emerald-800"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel Sheet
                          </button>

                          <button
                            onClick={() => setInspectingProject(p)}
                            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                            title="Inspect Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="py-2 text-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>PROJECT COMPLETED &amp; SIGNED OFF</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. Admin Assign Team Leader Modal (STRICT: ONLY TEAM LEADERS) */}
      <Modal
        isOpen={!!assigningTlProject}
        onClose={() => setAssigningTlProject(null)}
        title="Admin - Select Department Team Leader"
      >
        <form onSubmit={handleAdminAssignTl} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
            <p className="text-gray-400">Project Code: <strong className="text-indigo-400">{assigningTlProject?.projectCode}</strong></p>
            <p className="text-gray-400">Project Name: <strong className="text-white">{assigningTlProject?.projectName}</strong></p>
            <p className="text-gray-400">Client: <strong className="text-gray-300">{assigningTlProject?.customerName}</strong></p>
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
              onClick={() => setAssigningTlProject(null)}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Assign & Dispatch to Team Leader</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Full Stack Deliverables Upload Modal (4 Reports) */}
      <Modal
        isOpen={!!uploadingProject}
        onClose={() => setUploadingProject(null)}
        title="Full Stack - Upload 4 Required Project Deliverables"
        maxWidth="lg"
      >
        <form onSubmit={handleFullStackDeliverablesSubmit} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-0.5">
            <p className="text-gray-400">Project: <strong className="text-white">{uploadingProject?.projectName}</strong> ({uploadingProject?.projectCode})</p>
            <p className="text-gray-400">Team Leader: <strong className="text-amber-400">{uploadingProject?.targetTeamLeadName}</strong></p>
          </div>

          <div>
            <label className="block font-bold text-gray-300 uppercase mb-1">1. Implementation Plan *</label>
            <textarea
              required
              rows={3}
              value={implPlan}
              onChange={(e) => setImplPlan(e.target.value)}
              placeholder="Describe system architecture, tech stack, API modules, and database schemas implemented..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-300 uppercase mb-1">2. Logo Image (Image URL / Asset) *</label>
            <input
              type="text"
              required
              value={logoImg}
              onChange={(e) => setLogoImg(e.target.value)}
              placeholder="https://... or upload image link"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
            {logoImg && (
              <div className="mt-2 p-2 bg-gray-950 rounded-lg border border-gray-800 inline-block">
                <span className="text-[10px] text-gray-500 block mb-1">Logo Preview:</span>
                <img src={logoImg} alt="Logo" className="w-16 h-16 object-contain rounded border border-gray-800" />
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-gray-300 uppercase mb-1">3. Walkthrough *</label>
            <textarea
              required
              rows={3}
              value={walkthrough}
              onChange={(e) => setWalkthrough(e.target.value)}
              placeholder="Provide end-user walkthrough steps, test cases, deployment URLs, or credentials..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-300 uppercase mb-1">4. Work Flow Chart (Diagram Image URL) *</label>
            <input
              type="text"
              required
              value={workflowChart}
              onChange={(e) => setWorkflowChart(e.target.value)}
              placeholder="https://... or workflow diagram link"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
            {workflowChart && (
              <div className="mt-2 p-2 bg-gray-950 rounded-lg border border-gray-800 inline-block">
                <span className="text-[10px] text-gray-500 block mb-1">Workflow Chart Preview:</span>
                <img src={workflowChart} alt="Chart" className="max-h-24 object-contain rounded border border-gray-800" />
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button
              type="button"
              onClick={() => setUploadingProject(null)}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold shadow-lg flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Submit All 4 Deliverables to Team Leader</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Team Leader Assign to Full Stack Modal */}
      <Modal
        isOpen={!!assigningProject}
        onClose={() => setAssigningProject(null)}
        title="Team Leader - Assign Project to Full Stack Developer"
      >
        <form onSubmit={handleTlAssignToFullStack} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
            <p className="text-gray-400">Project Code: <strong className="text-amber-400">{assigningProject?.projectCode}</strong></p>
            <p className="text-gray-400">Project Name: <strong className="text-white">{assigningProject?.projectName}</strong></p>
          </div>

          <div>
            <label className="block font-bold text-gray-300 uppercase mb-1">
              Select Full Stack Engineer *
            </label>
            <select
              value={selectedFsId}
              onChange={(e) => setSelectedFsId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              {fsEngineers.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  [{emp.employeeId}] {emp.fullName} - {emp.department} ({emp.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button
              type="button"
              onClick={() => setAssigningProject(null)}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow flex items-center gap-1"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Assign & Route to Full Stack Profile</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. Quality Department Submission Modal (3 Reports) */}
      <Modal
        isOpen={!!qaSubmittingProject}
        onClose={() => setQaSubmittingProject(null)}
        title="Quality Department - Submit 3 QA Reports"
        maxWidth="lg"
      >
        <form onSubmit={handleQualityReportsSubmit} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
            <p className="text-gray-400">Project: <strong className="text-white">{qaSubmittingProject?.projectName}</strong> ({qaSubmittingProject?.projectCode})</p>
            <p className="text-gray-400">Team Leader: <strong className="text-amber-400">{qaSubmittingProject?.targetTeamLeadName}</strong></p>
          </div>

          <div>
            <label className="block font-bold text-gray-300 uppercase mb-1">1. Bug Report *</label>
            <textarea
              required
              rows={3}
              value={bugReport}
              onChange={(e) => setBugReport(e.target.value)}
              placeholder="Detail bug scan results, resolved issues, zero-blocker verification..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-300 uppercase mb-1">2. Test Report *</label>
            <textarea
              required
              rows={3}
              value={testReport}
              onChange={(e) => setTestReport(e.target.value)}
              placeholder="Detail automated & manual test suite coverage, load testing benchmarks..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-300 uppercase mb-1">3. Quality Report *</label>
            <textarea
              required
              rows={3}
              value={qualityReport}
              onChange={(e) => setQualityReport(e.target.value)}
              placeholder="Final Quality audit verdict, code quality rating, compliance check..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-gray-800">
            <a
              href="https://pjsofonic-qms.onrender.com/"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open QMS Live App</span>
            </a>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQaSubmittingProject(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg flex items-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Save 3 QA Reports</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* 5. Complete Project Dossier & Deliverables Inspection Modal */}
      <Modal
        isOpen={!!inspectingProject}
        onClose={() => setInspectingProject(null)}
        title={`Project Dossier - ${inspectingProject?.projectCode}`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
            <h4 className="text-base font-bold text-white">{inspectingProject?.projectName}</h4>
            <p className="text-gray-400">Client: <strong className="text-gray-200">{inspectingProject?.customerName}</strong></p>
            <p className="text-gray-400">Team Leader: <strong className="text-amber-400">{inspectingProject?.targetTeamLeadName}</strong></p>
            <p className="text-gray-400">Engineer: <strong className="text-cyan-400">{inspectingProject?.assignedEngineerName || 'N/A'}</strong></p>
          </div>

          {/* Section 1: Production Deliverables */}
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
            <span className="font-bold text-cyan-400 uppercase text-[11px] block">
              1. Production Deliverables (Full Stack Submission)
            </span>

            <div>
              <span className="text-gray-400 font-bold block mb-0.5">Implementation Plan:</span>
              <p className="p-2.5 bg-gray-900 rounded-lg text-gray-200 font-mono">
                {inspectingProject?.productionDeliverables?.implementationPlan || 'Not yet submitted.'}
              </p>
            </div>

            <div>
              <span className="text-gray-400 font-bold block mb-0.5">Logo Image:</span>
              {inspectingProject?.productionDeliverables?.logoImg ? (
                <img
                  src={inspectingProject.productionDeliverables.logoImg}
                  alt="Logo"
                  className="max-h-24 object-contain rounded border border-gray-800 p-1 bg-gray-900"
                />
              ) : (
                <p className="text-gray-500 italic">Not provided</p>
              )}
            </div>

            <div>
              <span className="text-gray-400 font-bold block mb-0.5">Walkthrough:</span>
              <p className="p-2.5 bg-gray-900 rounded-lg text-gray-200 font-mono">
                {inspectingProject?.productionDeliverables?.walkthrough || 'Not yet submitted.'}
              </p>
            </div>

            <div>
              <span className="text-gray-400 font-bold block mb-0.5">Workflow Chart:</span>
              {inspectingProject?.productionDeliverables?.workflowChart ? (
                <img
                  src={inspectingProject.productionDeliverables.workflowChart}
                  alt="Workflow Chart"
                  className="max-h-32 object-contain rounded border border-gray-800 p-1 bg-gray-900"
                />
              ) : (
                <p className="text-gray-500 italic">Not provided</p>
              )}
            </div>
          </div>

          {/* Section 2: Quality Reports */}
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
            <span className="font-bold text-rose-400 uppercase text-[11px] block">
              2. Quality Assurance Reports (QA Department)
            </span>

            <div>
              <span className="text-gray-400 font-bold block mb-0.5">Bug Report:</span>
              <p className="p-2.5 bg-gray-900 rounded-lg text-gray-200 font-mono">
                {inspectingProject?.qualityReports?.bugReport || 'Pending QA audit.'}
              </p>
            </div>

            <div>
              <span className="text-gray-400 font-bold block mb-0.5">Test Report:</span>
              <p className="p-2.5 bg-gray-900 rounded-lg text-gray-200 font-mono">
                {inspectingProject?.qualityReports?.testReport || 'Pending QA audit.'}
              </p>
            </div>

            <div>
              <span className="text-gray-400 font-bold block mb-0.5">Quality Report:</span>
              <p className="p-2.5 bg-gray-900 rounded-lg text-gray-200 font-mono">
                {inspectingProject?.qualityReports?.qualityReport || 'Pending QA audit.'}
              </p>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-gray-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => inspectingProject && exportProjectReportToPdf(inspectingProject)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={() => inspectingProject && exportProjectReportToExcel(inspectingProject)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
            </div>

            <button
              onClick={() => setInspectingProject(null)}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
