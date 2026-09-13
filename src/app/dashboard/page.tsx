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
  Printer,
  Lock,
  Unlock,
  Server,
  Cpu,
  Terminal,
  Cloud,
  Database,
  AlertTriangle,
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
  getProjectHandoverPdfUrl,
  getProjectHandoverDocUrl,
  fetchProjectHandoverDocument,
  getDefaultProductionReport,
  submitProductionReportByFullStack,
  reviewProductionReportByTeamLead,
  approveProductionReportByHead,
  acceptProductionReportByManager,
  isReportFullyFilled,
  getReportSignoffProgress,
  assignProjectToManager,
  assignProjectToProductionHead,
  assignProjectToTeamLead,
  assignProjectEngineers,
  approveAdminFinalAndSyncCrm,
  assignProjectToQualityHead,
  assignProjectToQualityEngineer,
  submitQualityEngineerReport,
  approveQualityHeadReport,
  assignProjectToCyberHead,
  assignProjectToBugBounty,
  submitBugBountyReport,
  approveCyberHeadReport,
  managerSubmitConsolidatedToAdmin,
  adminFinalApproveAllReportsAndCrmSync,
  getDefaultQualityReport,
  getDefaultCyberReport,
  isQualityReportApproved,
  isCyberReportApproved,
  isAllThreeReportsApproved,
  CrmCustomerProject,
  ProductionDeliverables,
  QualityReports,
  ProductionReport,
  QualityReport,
  CyberReport,
  MasterEngineeringReport,
  getDefaultMasterEngineeringReport,
  saveMasterReportSection,
} from '../../lib/crm';
import { EmptyState, Modal, Badge } from '../../components/ui';
import { MasterReportModal } from '../../components/MasterReportModal';
import { useAuth } from '../../context/AuthContext';
import {
  fetchEmsEmployees,
  EmsUser,
  isManagerUser,
  isProductionHeadUser,
  isTeamLeadUser,
  isFullStackUser,
  isDevOpsUser,
  isAiEngineerUser,
  isQualityHeadUser,
  isQualityEngineerUser,
  isCyberHeadUser,
  isBugBountyUser,
  isAdminUser,
} from '../../lib/ems';
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
  exportProductionReportToPdf,
  exportQualityReportToPdf,
  exportCyberReportToPdf,
  exportMasterEngineeringReportToPdf,
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

  // 1. Admin Assign to Manager Modal State
  const [assigningManagerProject, setAssigningManagerProject] = useState<CrmCustomerProject | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState('');

  // 2. Manager Assign to Production Head Modal State
  const [assigningHeadProject, setAssigningHeadProject] = useState<CrmCustomerProject | null>(null);
  const [selectedHeadId, setSelectedHeadId] = useState('');

  // 3. Production Head Assign to Team Leader Modal State
  const [assigningTlFromHeadProject, setAssigningTlFromHeadProject] = useState<CrmCustomerProject | null>(null);
  const [selectedTlFromHeadId, setSelectedTlFromHeadId] = useState('');

  // 4. Team Leader Assign to Technical Team (Full Stack, DevOps, AI) Modal State
  const [assigningEngineersProject, setAssigningEngineersProject] = useState<CrmCustomerProject | null>(null);
  const [selectedFsEngId, setSelectedFsEngId] = useState('');
  const [selectedDevOpsEngId, setSelectedDevOpsEngId] = useState('');
  const [selectedAiEngId, setSelectedAiEngId] = useState('');

  // 5. Admin Final Total Approval & CRM Auto-Sync Modal State
  const [syncingCrmProject, setSyncingCrmProject] = useState<CrmCustomerProject | null>(null);
  const [syncingLoading, setSyncingLoading] = useState(false);
  const [adminSyncNotes, setAdminSyncNotes] = useState('');
  const [approvingCrmProjectId, setApprovingCrmProjectId] = useState<string | null>(null);

  // 6. Quality Head & Engineer Assignment States
  const [assigningQualityHeadProject, setAssigningQualityHeadProject] = useState<CrmCustomerProject | null>(null);
  const [selectedQualityHeadId, setSelectedQualityHeadId] = useState<string>('');

  const [assigningQualityEngineerProject, setAssigningQualityEngineerProject] = useState<CrmCustomerProject | null>(null);
  const [selectedQualityEngineerId, setSelectedQualityEngineerId] = useState<string>('');

  // 7. Quality Report Fill & Review States
  const [fillingQualityReportProject, setFillingQualityReportProject] = useState<CrmCustomerProject | null>(null);
  const [qualityReportDraft, setQualityReportDraft] = useState<QualityReport | null>(null);
  const [qualityEngineerSignature, setQualityEngineerSignature] = useState<string>('');
  const [qualityEngineerNotes, setQualityEngineerNotes] = useState<string>('');

  const [approvingQualityReportProject, setApprovingQualityReportProject] = useState<CrmCustomerProject | null>(null);
  const [qualityApprovalRemarks, setQualityApprovalRemarks] = useState<string>('Approved for production delivery and cyber security audit.');
  const [qualityHeadSignature, setQualityHeadSignature] = useState<string>('');

  // 8. Cyber Head & Bug Bounty Assignment States
  const [assigningCyberHeadProject, setAssigningCyberHeadProject] = useState<CrmCustomerProject | null>(null);
  const [selectedCyberHeadId, setSelectedCyberHeadId] = useState<string>('');

  const [assigningBugBountyProject, setAssigningBugBountyProject] = useState<CrmCustomerProject | null>(null);
  const [selectedBugBountyId, setSelectedBugBountyId] = useState<string>('');

  // 9. Cyber Report Fill & Review States
  const [fillingCyberReportProject, setFillingCyberReportProject] = useState<CrmCustomerProject | null>(null);
  const [cyberReportDraft, setCyberReportDraft] = useState<CyberReport | null>(null);
  const [bugBountySignature, setBugBountySignature] = useState<string>('');
  const [bugBountyNotes, setBugBountyNotes] = useState<string>('');

  const [approvingCyberReportProject, setApprovingCyberReportProject] = useState<CrmCustomerProject | null>(null);
  const [cyberApprovalRemarks, setCyberApprovalRemarks] = useState<string>('Security assessment verified. Certified secure for live operations.');
  const [cyberHeadSignature, setCyberHeadSignature] = useState<string>('');

  // 10. Manager Tri-Report Consolidation States
  const [managerConsolidatingProject, setManagerConsolidatingProject] = useState<CrmCustomerProject | null>(null);
  const [managerConsolidationNotes, setManagerConsolidationNotes] = useState<string>('All 3 Departmental Reports (Production, Quality, Cyber) audited and approved. Submitted for final Directorate Admin approval.');
  const [managerConsolidationSignature, setManagerConsolidationSignature] = useState<string>('');

  // 11. Master Engineering Report Modal State (13-Page Dossier across 6 Parts & 11 Designations)
  const [masterReportProject, setMasterReportProject] = useState<CrmCustomerProject | null>(null);
  const [masterReportActiveTab, setMasterReportActiveTab] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F'>('A');
  const [masterReportDraft, setMasterReportDraft] = useState<MasterEngineeringReport | null>(null);
  const [masterSignName, setMasterSignName] = useState('');
  const [masterSignRole, setMasterSignRole] = useState('');
  const [masterSignSignature, setMasterSignSignature] = useState('');

  // Team Leader Assign to Full Stack Modal (Legacy compatibility)
  const [assigningProject, setAssigningProject] = useState<CrmCustomerProject | null>(null);
  const [selectedFsId, setSelectedFsId] = useState('');

  // Admin Assign to Team Leader Modal (Legacy fallback)
  const [assigningTlProject, setAssigningTlProject] = useState<CrmCustomerProject | null>(null);
  const [selectedTlIdForAssign, setSelectedTlIdForAssign] = useState('');

  // Quality Audit Submission Modal State (3 items)
  const [qaSubmittingProject, setQaSubmittingProject] = useState<CrmCustomerProject | null>(null);
  const [bugReport, setBugReport] = useState('');
  const [testReport, setTestReport] = useState('');
  const [qualityReport, setQualityReport] = useState('');

  // Deliverables / Reports Inspection Modal State
  const [inspectingProject, setInspectingProject] = useState<CrmCustomerProject | null>(null);

  // CRM Handover Executive PDF Modal State
  const [pdfModalProject, setPdfModalProject] = useState<CrmCustomerProject | null>(null);

  // Admin Tab Filter: ACTIVE vs COMPLETED vs ALL
  const [adminTabFilter, setAdminTabFilter] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');

  // Multi-Tier Production Report States (10 Sections & 4 Sign-Off Tiers)
  const [prodReportProject, setProdReportProject] = useState<CrmCustomerProject | null>(null);
  const [activeReportData, setActiveReportData] = useState<ProductionReport | null>(null);
  const [fsSignature, setFsSignature] = useState('');

  const [tlReviewProject, setTlReviewProject] = useState<CrmCustomerProject | null>(null);
  const [tlNotes, setTlNotes] = useState('');
  const [tlSig, setTlSig] = useState('');

  const [headApproveProject, setHeadApproveProject] = useState<CrmCustomerProject | null>(null);
  const [headRemarks, setHeadRemarks] = useState('');
  const [headSig, setHeadSig] = useState('');

  const [mgrClosureProject, setMgrClosureProject] = useState<CrmCustomerProject | null>(null);
  const setManagerCloseProject = setMgrClosureProject;
  const [mgrFinalDate, setMgrFinalDate] = useState(new Date().toLocaleDateString('en-GB'));
  const [mgrFinalStatus, setMgrFinalStatus] = useState<'Accepted' | 'Accepted with Minor Observations' | 'Pending Closure' | 'Rejected'>('Accepted');
  const [mgrSig, setMgrSig] = useState('');
  const [mgrRemarks, setMgrRemarks] = useState('');

  const handleOpenProductionReport = (project: CrmCustomerProject) => {
    const report = project.productionReport || getDefaultProductionReport(project, {
      name: user?.fullName,
      id: user?.employeeId || user?.id,
      designation: user?.designation,
      email: user?.email,
    });
    setActiveReportData(report);
    setFsSignature(report.fullstackSignoff?.signature || user?.fullName || '');
    setProdReportProject(project);
  };

  const handleOpenQualityReport = (project: CrmCustomerProject) => {
    const report = project.qualityReport || getDefaultQualityReport(project);
    setQualityReportDraft(report);
    setQualityEngineerSignature(report.engineerSignoff?.signature || user?.fullName || '');
    setQualityEngineerNotes(report.engineerSignoff?.notes || 'All automated unit, integration, and performance test suites executed successfully.');
    setFillingQualityReportProject(project);
  };

  const handleOpenCyberReport = (project: CrmCustomerProject) => {
    const report = project.cyberReport || getDefaultCyberReport(project);
    setCyberReportDraft(report);
    setBugBountySignature(report.testerSignoff?.signature || user?.fullName || '');
    setBugBountyNotes(report.testerSignoff?.notes || 'Ethical penetration testing completed. OWASP Top 10 vulnerabilities verified and patched.');
    setFillingCyberReportProject(project);
  };

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
  const userRole = (user?.role || 'EMPLOYEE').toUpperCase();

  // 1. Admin
  const isAdmin = isAdminUser(user);

  // 2. Manager
  const isManager = !isAdmin && isManagerUser(user);

  // 3. Production Head
  const isProductionHead = !isAdmin && !isManager && isProductionHeadUser(user);

  // 4. Team Leader
  const isTeamLeader = !isAdmin && !isManager && !isProductionHead && isTeamLeadUser(user);

  // 5. Quality Head
  const isQualityHead = !isAdmin && !isManager && !isProductionHead && !isTeamLeader && isQualityHeadUser(user);

  // 6. Quality Engineer
  const isQualityEngineer = !isAdmin && !isManager && !isProductionHead && !isTeamLeader && !isQualityHead && isQualityEngineerUser(user);

  // 7. Cyber Head
  const isCyberHead = !isAdmin && !isManager && !isProductionHead && !isTeamLeader && !isQualityHead && !isQualityEngineer && isCyberHeadUser(user);

  // 8. Bug Bounty Specialist
  const isBugBountySpecialist = !isAdmin && !isManager && !isProductionHead && !isTeamLeader && !isQualityHead && !isQualityEngineer && !isCyberHead && isBugBountyUser(user);

  // 9. DevOps Engineer
  const isDevOpsEngineer = !isAdmin && !isManager && !isProductionHead && !isTeamLeader && !isQualityHead && !isQualityEngineer && !isCyberHead && !isBugBountySpecialist && isDevOpsUser(user);

  // 10. AI Engineer
  const isAiEngineer = !isAdmin && !isManager && !isProductionHead && !isTeamLeader && !isQualityHead && !isQualityEngineer && !isCyberHead && !isBugBountySpecialist && !isDevOpsEngineer && isAiEngineerUser(user);

  // 11. Full Stack Engineer (execution default)
  const isFullStackEngineer = !isAdmin && !isManager && !isProductionHead && !isTeamLeader && !isQualityHead && !isQualityEngineer && !isCyberHead && !isBugBountySpecialist && !isDevOpsEngineer && !isAiEngineer;

  const isTeamLead = isTeamLeader;
  const isFullStack = isFullStackEngineer;
  const isQualityDept = isQualityHead || isQualityEngineer;
  const isCyberDept = isCyberHead || isBugBountySpecialist;

  // Filter Employee Lists for Hierarchy Dropdowns:
  const managersList = emsEmployees.filter((emp) => isManagerUser(emp));
  const headsList = emsEmployees.filter((emp) => isProductionHeadUser(emp));
  const teamLeadersList = emsEmployees.filter((emp) => isTeamLeadUser(emp) || checkIsTeamLeader(emp));
  const activeTlOptions = teamLeadersList.length > 0 ? teamLeadersList : emsEmployees;

  const fsEngineersList = emsEmployees.filter((emp) => isFullStackUser(emp));
  const devOpsEngineersList = emsEmployees.filter((emp) => isDevOpsUser(emp));
  const aiEngineersList = emsEmployees.filter((emp) => isAiEngineerUser(emp));

  const qualityHeadsList = emsEmployees.filter((emp) => isQualityHeadUser(emp));
  const qualityEngineersList = emsEmployees.filter((emp) => isQualityEngineerUser(emp));

  const cyberHeadsList = emsEmployees.filter((emp) => isCyberHeadUser(emp));
  const bugBountyList = emsEmployees.filter((emp) => isBugBountyUser(emp));

  const fsEngineers = fsEngineersList;

  // Helper to normalize strings for comparison
  const cleanStr = (s?: string) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

  const userCleanEmpId = cleanStr(user.employeeId);
  const userCleanId = cleanStr(user.id);
  const userCleanName = (user.fullName || '').toLowerCase().trim();

  // =========================================================================
  // Role-Specific Project Matching by Employee ID & Name
  // =========================================================================

  // Manager Projects
  const myManagerProjects = isAdmin
    ? crmProjects
    : crmProjects.filter((p) => {
        const pMgrIdClean = cleanStr(p.managerId);
        const pMgrName = (p.managerName || '').toLowerCase().trim();
        return (
          (userCleanEmpId && pMgrIdClean && userCleanEmpId === pMgrIdClean) ||
          (userCleanId && pMgrIdClean && userCleanId === pMgrIdClean) ||
          (userCleanName && pMgrName && (pMgrName.includes(userCleanName) || userCleanName.includes(pMgrName)))
        );
      });

  // Production Head Projects
  const myHeadProjects = isAdmin
    ? crmProjects
    : crmProjects.filter((p) => {
        const pHeadIdClean = cleanStr(p.productionHeadId);
        const pHeadName = (p.productionHeadName || '').toLowerCase().trim();
        return (
          (userCleanEmpId && pHeadIdClean && userCleanEmpId === pHeadIdClean) ||
          (userCleanId && pHeadIdClean && userCleanId === pHeadIdClean) ||
          (userCleanName && pHeadName && (pHeadName.includes(userCleanName) || userCleanName.includes(pHeadName)))
        );
      });

  // Team Leader Projects
  const myTlProjects = isAdmin
    ? crmProjects
    : crmProjects.filter((p) => {
        const pTlIdClean = cleanStr(p.targetTeamLeadId);
        const pTlName = (p.targetTeamLeadName || '').toLowerCase().trim();
        return (
          (userCleanEmpId && pTlIdClean && (userCleanEmpId === pTlIdClean || pTlIdClean.includes(userCleanEmpId))) ||
          (userCleanId && pTlIdClean && (userCleanId === pTlIdClean || pTlIdClean.includes(userCleanId))) ||
          (userCleanName && pTlName && (pTlName.includes(userCleanName) || userCleanName.includes(pTlName)))
        );
      });

  // Full Stack Engineer Projects
  const myFsProjects = crmProjects.filter((p) => {
    const pFsIdClean = cleanStr(p.assignedEngineerId);
    const pFsName = (p.assignedEngineerName || '').toLowerCase().trim();
    if (userCleanEmpId && pFsIdClean && userCleanEmpId === pFsIdClean) return true;
    if (userCleanId && pFsIdClean && userCleanId === pFsIdClean) return true;
    if (userCleanName && pFsName && (pFsName.includes(userCleanName) || userCleanName.includes(pFsName))) return true;

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

  // DevOps Engineer Projects
  const myDevOpsProjects = crmProjects.filter((p) => {
    const pDevOpsIdClean = cleanStr(p.assignedDevOpsId);
    const pDevOpsName = (p.assignedDevOpsName || '').toLowerCase().trim();
    return (
      (userCleanEmpId && pDevOpsIdClean && userCleanEmpId === pDevOpsIdClean) ||
      (userCleanId && pDevOpsIdClean && userCleanId === pDevOpsIdClean) ||
      (userCleanName && pDevOpsName && (pDevOpsName.includes(userCleanName) || userCleanName.includes(pDevOpsName)))
    );
  });

  // AI Engineer Projects
  const myAiProjects = crmProjects.filter((p) => {
    const pAiIdClean = cleanStr(p.assignedAiEngineerId);
    const pAiName = (p.assignedAiEngineerName || '').toLowerCase().trim();
    return (
      (userCleanEmpId && pAiIdClean && userCleanEmpId === pAiIdClean) ||
      (userCleanId && pAiIdClean && userCleanId === pAiIdClean) ||
      (userCleanName && pAiName && (pAiName.includes(userCleanName) || userCleanName.includes(pAiName)))
    );
  });

  // Quality Head Projects
  const myQualityHeadProjects = isAdmin
    ? crmProjects
    : crmProjects.filter((p) => {
        const pQhId = cleanStr(p.qualityHeadId);
        const pQhName = (p.qualityHeadName || '').toLowerCase().trim();
        return (
          (userCleanEmpId && pQhId && userCleanEmpId === pQhId) ||
          (userCleanId && pQhId && userCleanId === pQhId) ||
          (userCleanName && pQhName && (pQhName.includes(userCleanName) || userCleanName.includes(pQhName)))
        );
      });

  // Quality Engineer Projects
  const myQualityEngineerProjects = crmProjects.filter((p) => {
    const pQeId = cleanStr(p.assignedQualityEngineerId);
    const pQeName = (p.assignedQualityEngineerName || '').toLowerCase().trim();
    return (
      (userCleanEmpId && pQeId && userCleanEmpId === pQeId) ||
      (userCleanId && pQeId && userCleanId === pQeId) ||
      (userCleanName && pQeName && (pQeName.includes(userCleanName) || userCleanName.includes(pQeName)))
    );
  });

  // Cyber Head Projects
  const myCyberHeadProjects = isAdmin
    ? crmProjects
    : crmProjects.filter((p) => {
        const pChId = cleanStr(p.cyberHeadId);
        const pChName = (p.cyberHeadName || '').toLowerCase().trim();
        return (
          (userCleanEmpId && pChId && userCleanEmpId === pChId) ||
          (userCleanId && pChId && userCleanId === pChId) ||
          (userCleanName && pChName && (pChName.includes(userCleanName) || userCleanName.includes(pChName)))
        );
      });

  // Bug Bounty Specialist Projects
  const myBugBountyProjects = crmProjects.filter((p) => {
    const pBbId = cleanStr(p.assignedBugBountyId);
    const pBbName = (p.assignedBugBountyName || '').toLowerCase().trim();
    return (
      (userCleanEmpId && pBbId && userCleanEmpId === pBbId) ||
      (userCleanId && pBbId && userCleanId === pBbId) ||
      (userCleanName && pBbName && (pBbName.includes(userCleanName) || userCleanName.includes(pBbName)))
    );
  });

  // Projects in Quality Queue
  const qualityQueueProjects = crmProjects.filter(
    (p) =>
      p.stage === 'TL_PRODUCTION_APPROVED' ||
      p.stage === 'QUALITY_APPROVED' ||
      p.stage === 'SENT_TO_QUALITY' ||
      p.tlProductionApproval?.approved ||
      (p.productionDeliverables && !!p.productionDeliverables.implementationPlan && p.status !== 'COMPLETED')
  );

  // =========================================================================
  // Hierarchy Handlers
  // =========================================================================

  // Manager Assigns to Quality Head
  const handleManagerAssignQualityHead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningQualityHeadProject) return;
    const qh = qualityHeadsList.find((h) => h.id === selectedQualityHeadId) || qualityHeadsList[0] || emsEmployees[0];
    if (!qh) return;

    const qhName = `[${qh.employeeId}] ${qh.fullName} (${qh.designation || 'Quality Head'})`;
    const updated = assignProjectToQualityHead(assigningQualityHeadProject.id, qh.id, qhName);
    setCrmProjects(updated);
    setNotification(`Project "${assigningQualityHeadProject.projectName}" assigned to Quality Head ${qh.fullName}!`);
    setTimeout(() => setNotification(null), 5000);
    setAssigningQualityHeadProject(null);
  };

  // Quality Head Assigns to Quality Engineer
  const handleQualityHeadAssignEngineer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningQualityEngineerProject) return;
    const qe = qualityEngineersList.find((e) => e.id === selectedQualityEngineerId) || qualityEngineersList[0] || emsEmployees[0];
    if (!qe) return;

    const qeName = `[${qe.employeeId}] ${qe.fullName} (${qe.designation || 'Quality Engineer'})`;
    const updated = assignProjectToQualityEngineer(assigningQualityEngineerProject.id, qe.id, qeName);
    setCrmProjects(updated);
    setNotification(`Project "${assigningQualityEngineerProject.projectName}" assigned to Quality Engineer ${qe.fullName}!`);
    setTimeout(() => setNotification(null), 5000);
    setAssigningQualityEngineerProject(null);
  };

  // Quality Engineer Submits Report
  const handleQualityEngineerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fillingQualityReportProject || !qualityReportDraft) return;
    const updated = submitQualityEngineerReport(
      fillingQualityReportProject.id,
      qualityReportDraft,
      { name: user.fullName, id: user.employeeId, designation: user.designation },
      qualityEngineerSignature || user.fullName,
      qualityEngineerNotes
    );
    setCrmProjects(updated);
    setNotification(`Quality Assurance Report for "${fillingQualityReportProject.projectName}" submitted to Quality Head!`);
    setTimeout(() => setNotification(null), 5000);
    setFillingQualityReportProject(null);
  };

  // Quality Head Approves Report & Routes to Manager
  const handleQualityHeadApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingQualityReportProject) return;
    const updated = approveQualityHeadReport(
      approvingQualityReportProject.id,
      { name: user.fullName, id: user.employeeId, designation: user.designation },
      qualityApprovalRemarks,
      qualityHeadSignature || user.fullName
    );
    setCrmProjects(updated);
    setNotification(`Quality Report for "${approvingQualityReportProject.projectName}" approved and returned to Manager!`);
    setTimeout(() => setNotification(null), 5000);
    setApprovingQualityReportProject(null);
  };

  // Manager Assigns to Cyber Head
  const handleManagerAssignCyberHead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningCyberHeadProject) return;
    const ch = cyberHeadsList.find((h) => h.id === selectedCyberHeadId) || cyberHeadsList[0] || emsEmployees[0];
    if (!ch) return;

    const chName = `[${ch.employeeId}] ${ch.fullName} (${ch.designation || 'Cyber Head'})`;
    const updated = assignProjectToCyberHead(assigningCyberHeadProject.id, ch.id, chName);
    setCrmProjects(updated);
    setNotification(`Project "${assigningCyberHeadProject.projectName}" assigned to Cyber Head ${ch.fullName}!`);
    setTimeout(() => setNotification(null), 5000);
    setAssigningCyberHeadProject(null);
  };

  // Cyber Head Assigns to Bug Bounty Team
  const handleCyberHeadAssignBugBounty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningBugBountyProject) return;
    const bb = bugBountyList.find((b) => b.id === selectedBugBountyId) || bugBountyList[0] || emsEmployees[0];
    if (!bb) return;

    const bbName = `[${bb.employeeId}] ${bb.fullName} (${bb.designation || 'Bug Bounty Specialist'})`;
    const updated = assignProjectToBugBounty(assigningBugBountyProject.id, bb.id, bbName);
    setCrmProjects(updated);
    setNotification(`Project "${assigningBugBountyProject.projectName}" assigned to Bug Bounty Specialist ${bb.fullName}!`);
    setTimeout(() => setNotification(null), 5000);
    setAssigningBugBountyProject(null);
  };

  // Bug Bounty Team Submits Report
  const handleBugBountySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fillingCyberReportProject || !cyberReportDraft) return;
    const updated = submitBugBountyReport(
      fillingCyberReportProject.id,
      cyberReportDraft,
      { name: user.fullName, id: user.employeeId, designation: user.designation },
      bugBountySignature || user.fullName,
      bugBountyNotes
    );
    setCrmProjects(updated);
    setNotification(`Cyber Security & Bug Bounty Report for "${fillingCyberReportProject.projectName}" submitted to Cyber Head!`);
    setTimeout(() => setNotification(null), 5000);
    setFillingCyberReportProject(null);
  };

  // Cyber Head Approves Report & Routes to Manager
  const handleCyberHeadApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingCyberReportProject) return;
    const updated = approveCyberHeadReport(
      approvingCyberReportProject.id,
      { name: user.fullName, id: user.employeeId, designation: user.designation },
      cyberApprovalRemarks,
      cyberHeadSignature || user.fullName
    );
    setCrmProjects(updated);
    setNotification(`Cyber Report for "${approvingCyberReportProject.projectName}" approved and returned to Manager!`);
    setTimeout(() => setNotification(null), 5000);
    setApprovingCyberReportProject(null);
  };

  // Manager Submits Consolidated Tri-Reports to Admin
  const handleManagerSubmitConsolidated = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerConsolidatingProject) return;
    const updated = managerSubmitConsolidatedToAdmin(
      managerConsolidatingProject.id,
      { name: user.fullName, id: user.employeeId, designation: user.designation },
      managerConsolidationNotes,
      managerConsolidationSignature || user.fullName
    );
    setCrmProjects(updated);
    setNotification(`Project "${managerConsolidatingProject.projectName}" with all 3 Reports submitted to Admin for final approval!`);
    setTimeout(() => setNotification(null), 5000);
    setManagerConsolidatingProject(null);
  };

  // Admin Final Total Approval & Push to CRM
  const handleAdminFinalApprovalAndCrmSync = async (p: CrmCustomerProject) => {
    setApprovingCrmProjectId(p.id);
    const result = await adminFinalApproveAllReportsAndCrmSync(
      p.id,
      user.fullName || 'Admin Directorate',
      'Final total corporate sign-off granted across Production, Quality & Cyber Security. Synchronized to CRM.'
    );
    setApprovingCrmProjectId(null);
    if (result.success) {
      setNotification(`🎉 Project "${p.projectName}" & all 3 Departmental Reports successfully synchronized to CRM!`);
      loadDashboardData();
    } else {
      alert(result.message);
    }
  };

  // Master Engineering Report (13-Page Dossier) Handlers
  const handleOpenMasterReport = (project: CrmCustomerProject, preferredTab?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F') => {
    setMasterReportProject(project);
    const report = project.masterReport || getDefaultMasterEngineeringReport(project, {
      name: user?.fullName,
      id: user?.employeeId || user?.id,
      designation: user?.designation,
      email: user?.email,
    });
    setMasterReportDraft(report);

    let tab: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' = 'A';
    if (preferredTab) {
      tab = preferredTab;
    } else if (isDevOpsEngineer) {
      tab = 'B';
    } else if (isAiEngineer) {
      tab = 'C';
    } else if (isQualityDept) {
      tab = 'D';
    } else if (isCyberDept) {
      tab = 'E';
    } else if (isManager) {
      tab = 'F';
    } else {
      tab = 'A';
    }
    setMasterReportActiveTab(tab);

    setMasterSignName(user?.fullName || '');
    setMasterSignRole(user?.designation || 'Engineer');
    setMasterSignSignature(user?.fullName ? user.fullName.split(' ')[0] + ' ' + (user.employeeId || 'Verified') : 'Verified Digital Signature');
  };

  const handleSaveMasterSection = (
    partKey: 'partA_FullStack' | 'partB_DevOps' | 'partC_AiEngineering' | 'partD_Quality' | 'partE_BugBounty' | 'partF_Closure'
  ) => {
    if (!masterReportProject || !masterReportDraft) return;

    const updatedDraft = { ...masterReportDraft };
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const signObj = {
      name: masterSignName || user?.fullName || 'Authorized Specialist',
      employeeId: user?.employeeId || 'EMS-USER',
      designation: masterSignRole || user?.designation || 'Specialist',
      date: dateStr,
      signature: masterSignSignature || 'Verified Digital Signature',
      submittedAt: new Date().toISOString(),
    };

    if (partKey === 'partA_FullStack') {
      updatedDraft.partA_FullStack.engineerSignoff = signObj;
    } else if (partKey === 'partB_DevOps') {
      updatedDraft.partB_DevOps.devopsSignoff = signObj;
    } else if (partKey === 'partC_AiEngineering') {
      updatedDraft.partC_AiEngineering.aiSignoff = signObj;
    } else if (partKey === 'partD_Quality') {
      if (isQualityHead || isAdmin) {
        updatedDraft.partD_Quality.qualityHeadSignoff = { ...signObj, approved: true, approvedAt: new Date().toISOString() };
      } else {
        updatedDraft.partD_Quality.qaLeadSignoff = signObj;
      }
    } else if (partKey === 'partE_BugBounty') {
      if (isCyberHead || isAdmin) {
        updatedDraft.partE_BugBounty.cyberHeadSignoff = { ...signObj, approved: true, approvedAt: new Date().toISOString() };
      } else {
        updatedDraft.partE_BugBounty.securityLeadSignoff = signObj;
      }
    } else if (partKey === 'partF_Closure') {
      updatedDraft.partF_Closure.closureDeclaration = {
        ...updatedDraft.partF_Closure.closureDeclaration,
        finalClosureDate: dateStr,
        projectManager: masterSignSignature || user?.fullName || 'Project Manager',
      };
    }

    const updatedProjects = saveMasterReportSection(masterReportProject.id, partKey, updatedDraft[partKey]);
    setCrmProjects(updatedProjects);
    setMasterReportDraft(updatedDraft);

    const partNames: Record<string, string> = {
      partA_FullStack: 'Part A (Full Stack Engineering)',
      partB_DevOps: 'Part B (DevOps & Production)',
      partC_AiEngineering: 'Part C (AI Engineering)',
      partD_Quality: 'Part D (Quality Engineering)',
      partE_BugBounty: 'Part E (Bug Bounty & Security)',
      partF_Closure: 'Part F (Performance & Closure)',
    };

    setNotification(`✅ ${partNames[partKey]} successfully signed off and updated in the 13-Page Master Dossier!`);
    setTimeout(() => setNotification(null), 5000);
  };

  // 1. Admin Assigns Project to Manager
  const handleAdminAssignManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningManagerProject) return;
    const mgr =
      managersList.find((m) => m.id === selectedManagerId) ||
      emsEmployees.find((m) => m.id === selectedManagerId) ||
      managersList[0];
    if (!mgr) return;

    const mgrName = `[${mgr.employeeId}] ${mgr.fullName} (${mgr.department || 'Management'})`;
    const updated = assignProjectToManager(assigningManagerProject.id, mgr.id, mgrName);
    setCrmProjects(updated);

    addSystemNotification({
      type: 'PROJECT_ASSIGN',
      title: 'Project Assigned to Manager',
      message: `You assigned project "${assigningManagerProject.projectName}" to Manager ${mgr.fullName}`,
      senderId: user.id || user.employeeId,
      senderName: user.fullName,
      recipientId: mgr.id,
      recipientName: mgr.fullName,
      link: '/dashboard',
    });

    setNotification(`Project "${assigningManagerProject.projectName}" assigned to Manager ${mgr.fullName}!`);
    setTimeout(() => setNotification(null), 5000);
    setAssigningManagerProject(null);
  };

  // 2. Manager Assigns Project to Production Head
  const handleManagerAssignHead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningHeadProject) return;
    const head =
      headsList.find((h) => h.id === selectedHeadId) ||
      emsEmployees.find((h) => h.id === selectedHeadId) ||
      headsList[0];
    if (!head) return;

    const headName = `[${head.employeeId}] ${head.fullName} (${head.department || 'Production'})`;
    const updated = assignProjectToProductionHead(assigningHeadProject.id, head.id, headName);
    setCrmProjects(updated);

    addSystemNotification({
      type: 'PROJECT_ASSIGN',
      title: 'Project Assigned to Production Head',
      message: `${user.fullName} assigned project "${assigningHeadProject.projectName}" to Production Head ${head.fullName}`,
      senderId: user.id || user.employeeId,
      senderName: user.fullName,
      recipientId: head.id,
      recipientName: head.fullName,
      link: '/dashboard',
    });

    setNotification(`Project "${assigningHeadProject.projectName}" assigned to Production Head ${head.fullName}!`);
    setTimeout(() => setNotification(null), 5000);
    setAssigningHeadProject(null);
  };

  // 3. Production Head Assigns Project to Team Leader
  const handleHeadAssignTl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTlFromHeadProject) return;
    const tl =
      teamLeadersList.find((t) => t.id === selectedTlFromHeadId) ||
      emsEmployees.find((t) => t.id === selectedTlFromHeadId) ||
      teamLeadersList[0];
    if (!tl) return;

    const tlName = `[${tl.employeeId}] ${tl.fullName} (${tl.department || 'Engineering'})`;
    const updated = assignProjectToTeamLead(assigningTlFromHeadProject.id, tl.id, tlName);
    setCrmProjects(updated);

    addSystemNotification({
      type: 'PROJECT_ASSIGN',
      title: 'Project Assigned to Team Leader',
      message: `${user.fullName} assigned project "${assigningTlFromHeadProject.projectName}" to Team Leader ${tl.fullName}`,
      senderId: user.id || user.employeeId,
      senderName: user.fullName,
      recipientId: tl.id,
      recipientName: tl.fullName,
      link: '/dashboard',
    });

    setNotification(`Project "${assigningTlFromHeadProject.projectName}" assigned to Team Leader ${tl.fullName}!`);
    setTimeout(() => setNotification(null), 5000);
    setAssigningTlFromHeadProject(null);
  };

  // 4. Team Leader Assigns Technical Team (Full Stack, DevOps, AI)
  const handleTlAssignEngineers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningEngineersProject) return;

    const fs =
      fsEngineersList.find((e) => e.id === selectedFsEngId) ||
      emsEmployees.find((e) => e.id === selectedFsEngId);
    const devops =
      devOpsEngineersList.find((e) => e.id === selectedDevOpsEngId) ||
      emsEmployees.find((e) => e.id === selectedDevOpsEngId);
    const ai =
      aiEngineersList.find((e) => e.id === selectedAiEngId) ||
      emsEmployees.find((e) => e.id === selectedAiEngId);

    const updated = assignProjectEngineers(assigningEngineersProject.id, {
      fullStack: fs ? { id: fs.id, name: `[${fs.employeeId}] ${fs.fullName}` } : undefined,
      devOps: devops ? { id: devops.id, name: `[${devops.employeeId}] ${devops.fullName}` } : undefined,
      ai: ai ? { id: ai.id, name: `[${ai.employeeId}] ${ai.fullName}` } : undefined,
    });
    setCrmProjects(updated);

    setNotification(`Technical team successfully assigned to project "${assigningEngineersProject.projectName}"!`);
    setTimeout(() => setNotification(null), 5000);
    setAssigningEngineersProject(null);
  };

  // 5. Admin Final Total Approval & Automatic CRM Sync
  const handleAdminApproveAndSyncCrm = async (project: CrmCustomerProject) => {
    if (!isReportFullyFilled(project)) {
      const progress = getReportSignoffProgress(project);
      alert(
        `⚠️ Report Incomplete (${progress.completed}/4 Sign-Offs Completed)\n\n` +
          `Admin cannot approve or push to CRM until all 4 sign-off tiers are completed.\n\n` +
          progress.steps
            .map((s) => `${s.completed ? '✅' : '❌'} ${s.name}: ${s.completed ? `Signed by ${s.signedBy}` : 'PENDING'}`)
            .join('\n')
      );
      return;
    }

    setSyncingLoading(true);
    try {
      const res = await approveAdminFinalAndSyncCrm(
        project.id,
        user.fullName || 'Admin',
        adminSyncNotes || 'Admin final total approval & automated CRM sync'
      );
      if (res.success) {
        setNotification(
          `🚀 Project "${project.projectName}" fully approved and auto-synced to CRM! Handover PDF & document live.`
        );
        loadDashboardData();
      } else {
        alert(`Sync warning: ${res.message}`);
      }
    } catch (err: any) {
      alert(`Failed to approve & sync: ${err.message}`);
    } finally {
      setSyncingLoading(false);
      setSyncingCrmProject(null);
    }
  };

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
      {/* PRODUCTION REPORTS HUB: MULTI-TIER WORKFLOW (FULL STACK -> TL -> HEAD -> MGR) */}
      {/* ========================================================================= */}
      <div className="p-6 md:p-7 rounded-3xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                Full Stack Production Pipeline
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                10-Section Formal Report
              </span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-1">
              <FileCheck className="w-5 h-5 text-cyan-400" /> Production Reports Hub ({crmProjects.length} Projects)
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Multi-Tier Lifecycle: 1. Full Stack Engineer (Submit) ➔ 2. Team Leader (Review) ➔ 3. Production Head (Approval) ➔ 4. Manager (Acceptance &amp; Final Closure) ➔ Admin Audit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold border border-gray-700 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Reports</span>
            </button>
          </div>
        </div>

        {crmProjects.length === 0 ? (
          <div className="p-8 bg-gray-950/60 rounded-2xl border border-gray-800 text-center">
            <p className="text-xs text-gray-400 font-medium">No projects found in the system.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {crmProjects.map((p) => {
              const report = p.productionReport;
              const stage = report?.currentStage || (p.stage === 'COMPLETED' ? 'FINAL_ACCEPTED_BY_MANAGER' : (p.productionDeliverables?.implementationPlan ? 'SUBMITTED_BY_FULLSTACK' : 'DRAFT'));
              const isClosed = stage === 'FINAL_ACCEPTED_BY_MANAGER' || p.status === 'COMPLETED';

              const fsSign = report?.fullstackSignoff?.signature;
              const tlSign = report?.teamLeadSignoff?.signature || p.tlProductionApproval?.approved;
              const headSign = report?.productionHeadSignoff?.signature || (p.stage === 'HEAD_APPROVED');
              const mgrSign = report?.managerSignoff?.signature || (p.adminFinalApproval?.approved && isClosed);

              return (
                <div
                  key={`prod-hub-${p.id}`}
                  className={`p-5 rounded-2xl bg-gray-950 border ${
                    isClosed
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : stage === 'APPROVED_BY_HEAD'
                      ? 'border-purple-500/40 shadow-purple-950/20'
                      : stage === 'REVIEWED_BY_TL'
                      ? 'border-indigo-500/40 shadow-indigo-950/20'
                      : stage === 'SUBMITTED_BY_FULLSTACK'
                      ? 'border-cyan-500/40 shadow-cyan-950/20'
                      : 'border-gray-800'
                  } transition-all space-y-3 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {p.projectCode}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          isClosed
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : stage === 'APPROVED_BY_HEAD'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : stage === 'REVIEWED_BY_TL'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            : stage === 'SUBMITTED_BY_FULLSTACK'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {isClosed
                          ? '✓ ACCEPTED & CLOSED'
                          : stage === 'APPROVED_BY_HEAD'
                          ? 'AWAITING MANAGER CLOSURE'
                          : stage === 'REVIEWED_BY_TL'
                          ? 'AWAITING HEAD APPROVAL'
                          : stage === 'SUBMITTED_BY_FULLSTACK'
                          ? 'AWAITING TL REVIEW'
                          : 'PENDING FULL STACK'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white leading-snug">{p.projectName}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Client: {p.customerName} (${p.budget?.toLocaleString()})</p>

                    <div className="mt-2.5 p-2.5 rounded-xl bg-gray-900/80 border border-gray-800/80 text-[11px] space-y-1">
                      <div className="flex justify-between text-gray-400">
                        <span>Assigned Full Stack:</span>
                        <strong className="text-cyan-300">{p.assignedEngineerName || 'Unassigned'}</strong>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Team Leader:</span>
                        <strong className="text-amber-300">{p.targetTeamLeadName || 'Unassigned'}</strong>
                      </div>
                    </div>

                    {/* Quad Signoff Tracker */}
                    <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[10px]">
                      <div className={`p-1.5 rounded border ${fsSign ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-300' : 'bg-gray-900 border-gray-800 text-gray-500'}`}>
                        <strong>1. Full Stack:</strong> {fsSign ? '✓ Signed' : 'Pending'}
                      </div>
                      <div className={`p-1.5 rounded border ${tlSign ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-300' : 'bg-gray-900 border-gray-800 text-gray-500'}`}>
                        <strong>2. Team Leader:</strong> {tlSign ? '✓ Verified' : 'Pending'}
                      </div>
                      <div className={`p-1.5 rounded border ${headSign ? 'bg-purple-950/30 border-purple-500/30 text-purple-300' : 'bg-gray-900 border-gray-800 text-gray-500'}`}>
                        <strong>3. Prod Head:</strong> {headSign ? '✓ Approved' : 'Pending'}
                      </div>
                      <div className={`p-1.5 rounded border ${mgrSign ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-gray-900 border-gray-800 text-gray-500'}`}>
                        <strong>4. Manager:</strong> {mgrSign ? '✓ Closed' : 'Pending'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2">
                    {/* Action 1: Printable A4 PDF with Admin Real-Time Lock/Unlock */}
                    {isAdmin ? (
                      isReportFullyFilled(p) ? (
                        <button
                          onClick={() => {
                            const rep = p.productionReport || getDefaultProductionReport(p, {
                              name: user.fullName,
                              id: user.employeeId,
                              designation: user.designation,
                            });
                            exportProductionReportToPdf(p, rep);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-all"
                          title="All 4 Sign-offs Complete - Report Unlocked"
                        >
                          <Unlock className="w-3.5 h-3.5 text-emerald-200" />
                          <span>🔓 View A4 PDF Report</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const prog = getReportSignoffProgress(p);
                            alert(
                              `🔒 Report Incomplete (${prog.completed}/4 Sign-Offs Completed)\n\n` +
                                `Admin can ONLY view this Production Report after all 4 tiers have completed digital sign-off.\n\n` +
                                prog.steps
                                  .map((s) => `${s.completed ? '✅' : '⏳'} ${s.name}: ${s.completed ? `Signed by ${s.signedBy || 'Pending'}` : 'PENDING'}`)
                                  .join('\n')
                            );
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gray-900 border border-red-500/40 text-red-400 text-xs font-bold flex items-center gap-1.5 shadow"
                          title={`Locked for Admin: ${getReportSignoffProgress(p).completed}/4 tiers completed`}
                        >
                          <Lock className="w-3.5 h-3.5 text-red-400" />
                          <span>🔒 Locked ({getReportSignoffProgress(p).completed}/4)</span>
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => {
                          const rep = p.productionReport || getDefaultProductionReport(p, {
                            name: user.fullName,
                            id: user.employeeId,
                            designation: user.designation,
                          });
                          exportProductionReportToPdf(p, rep);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold border border-gray-700 flex items-center gap-1 transition-all"
                        title="Print or Save A4 PDF Report"
                      >
                        <Printer className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Print A4 PDF</span>
                      </button>
                    )}

                    {/* Admin CRM Push Button */}
                    {isAdmin && (
                      p.crmSynced ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> CRM Synced
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAdminApproveAndSyncCrm(p)}
                          disabled={!isReportFullyFilled(p) || syncingLoading}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black shadow flex items-center gap-1.5 transition-all ${
                            isReportFullyFilled(p)
                              ? 'bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white'
                              : 'bg-gray-900 text-gray-500 border border-gray-800 cursor-not-allowed'
                          }`}
                          title={isReportFullyFilled(p) ? 'Grant Final Total Approval & Automatically Transmit to CRM API' : 'Locked: All 4 sign-off tiers required'}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>🚀 Final Approval &amp; Push to CRM</span>
                        </button>
                      )
                    )}

                    {/* Role-Specific Stage Transitions */}
                    {/* Full Stack Action */}
                    {(isFullStackEngineer || isAdmin) && (
                      <button
                        onClick={() => handleOpenProductionReport(p)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow flex items-center gap-1 transition-all"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>{fsSign ? 'Edit Report' : 'Fill Report'}</span>
                      </button>
                    )}

                    {/* Team Leader Action */}
                    {(isTeamLeader || isAdmin) && stage === 'SUBMITTED_BY_FULLSTACK' && (
                      <button
                        onClick={() => {
                          setTlReviewProject(p);
                          setTlNotes('All 12 modules, pre-flight checks and architecture verified in production. Ready for Head approval.');
                          setTlSig(user.fullName || 'Team Leader');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow flex items-center gap-1 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>TL Review</span>
                      </button>
                    )}

                    {/* Production Head Action */}
                    {(isProductionHead || isAdmin) && stage === 'REVIEWED_BY_TL' && (
                      <button
                        onClick={() => {
                          setHeadApproveProject(p);
                          setHeadRemarks('Production deployment and SLA metrics fully approved for operational signoff.');
                          setHeadSig(user.fullName || 'Production Head');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow flex items-center gap-1 transition-all"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Head Approve</span>
                      </button>
                    )}

                    {/* Manager Action */}
                    {(isManager || isAdmin) && stage === 'APPROVED_BY_HEAD' && (
                      <button
                        onClick={() => {
                          setManagerCloseProject(p);
                          setMgrFinalDate(new Date().toLocaleDateString('en-GB'));
                          setMgrFinalStatus('Accepted');
                          setMgrRemarks('Official project closure accepted after quad digital sign-off verification.');
                          setMgrSig(user.fullName || 'Manager');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow flex items-center gap-1 transition-all"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>Final Closure</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. MANAGER OPERATIONS COMMAND CENTER */}
      {/* ========================================================================= */}
      {isManager && !isAdmin && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                  Manager Operations Desk
                </span>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-1">
                  <Crown className="w-5 h-5 text-amber-400" /> My Assigned Operations Projects ({myManagerProjects.length})
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Assigned directly by Admin. Assign projects to Production Head, monitor quad sign-off progression, and execute Tier 4 Final Acceptance &amp; Closure.
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

            {myManagerProjects.length === 0 ? (
              <div className="p-8 bg-gray-950/60 rounded-2xl border border-gray-800 text-center space-y-2">
                <Crown className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-sm font-bold text-gray-300">No Projects Currently Assigned to You as Manager</p>
                <p className="text-xs text-gray-500">When Admin assigns a customer project to your Manager profile, it will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myManagerProjects.map((p) => {
                  const isClosed = p.stage === 'FINAL_ACCEPTED_BY_MANAGER' || p.status === 'COMPLETED';
                  const isReadyForClosure = p.stage === 'APPROVED_BY_HEAD';
                  return (
                    <div
                      key={`mgr-${p.id}`}
                      className={`p-5 rounded-2xl bg-gray-950 border ${
                        isClosed
                          ? 'border-emerald-500/40 bg-emerald-950/10'
                          : isReadyForClosure
                          ? 'border-amber-500/40 shadow-amber-950/20'
                          : 'border-gray-800'
                      } space-y-3 flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {p.projectCode}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                              isClosed
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : isReadyForClosure
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-gray-900 text-gray-400 border-gray-800'
                            }`}
                          >
                            {isClosed ? '✓ FINAL ACCEPTED' : isReadyForClosure ? 'AWAITING YOUR CLOSURE' : p.stage || 'IN PROGRESS'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white">{p.projectName}</h4>
                        <p className="text-xs text-gray-400">Client: {p.customerName} (${p.budget?.toLocaleString()})</p>

                        <div className="mt-3 p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Production Head:</span>
                            <span className="font-bold text-purple-300 truncate max-w-[160px]">
                              {p.productionHeadName || 'Pending Assign (Click Below)'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Team Leader:</span>
                            <span className="font-bold text-indigo-300 truncate max-w-[160px]">
                              {p.targetTeamLeadName || 'Pending Head Assign'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Full Stack:</span>
                            <span className="font-bold text-cyan-400 truncate max-w-[160px]">
                              {p.assignedEngineerName || 'Pending TL Assign'}
                            </span>
                          </div>

                          {/* 3 Department Pipeline Status Grid */}
                          <div className="pt-2 border-t border-gray-800 space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 flex items-center gap-1">
                                <Code2 className="w-3 h-3 text-cyan-400" /> Production Report:
                              </span>
                              <span className={`font-bold ${isReportFullyFilled(p) ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {isReportFullyFilled(p) ? '✅ 4/4 Signed' : `${getReportSignoffProgress(p).completed}/4 Signed`}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-rose-400" /> Quality Assurance:
                              </span>
                              <span className={`font-bold ${isQualityReportApproved(p) ? 'text-emerald-400' : p.qualityHeadName ? 'text-rose-400' : 'text-gray-500'}`}>
                                {isQualityReportApproved(p) ? '✅ Approved' : p.qualityHeadName ? '⏳ Testing' : 'Pending Assign'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 flex items-center gap-1">
                                <Lock className="w-3 h-3 text-purple-400" /> Cyber &amp; Bug Bounty:
                              </span>
                              <span className={`font-bold ${isCyberReportApproved(p) ? 'text-emerald-400' : p.cyberHeadName ? 'text-purple-400' : 'text-gray-500'}`}>
                                {isCyberReportApproved(p) ? '✅ Certified Secure' : p.cyberHeadName ? '⏳ Pentest' : 'Pending Assign'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-800 flex flex-col gap-2">
                        {/* Row 1 Actions: Production Assignments & Signoff */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* 1. Assign Production Head */}
                          <button
                            onClick={() => {
                              setAssigningHeadProject(p);
                              setSelectedHeadId(p.productionHeadId || headsList[0]?.id || '');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{p.productionHeadId ? 'Reassign Prod Head' : 'Assign to Production Head'}</span>
                          </button>

                          {/* 2. Tier 4 Final Acceptance & Closure */}
                          {isReadyForClosure && (
                            <button
                              onClick={() => {
                                setManagerCloseProject(p);
                                setMgrFinalDate(new Date().toLocaleDateString('en-GB'));
                                setMgrFinalStatus('Accepted');
                                setMgrSig(user.fullName || 'Manager');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center gap-1.5 animate-pulse"
                            >
                              <Crown className="w-3.5 h-3.5" />
                              <span>Sign Tier 4 Closure</span>
                            </button>
                          )}
                        </div>

                        {/* Row 2 Actions: Sequential Departmental Routing */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* 3. Assign Quality Head (Unlocked when Production is complete) */}
                          {isReportFullyFilled(p) && !isQualityReportApproved(p) && (
                            <button
                              onClick={() => {
                                setAssigningQualityHeadProject(p);
                                setSelectedQualityHeadId(p.qualityHeadId || qualityHeadsList[0]?.id || '');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>{p.qualityHeadName ? 'Reassign Quality Head' : 'Assign to Quality Head'}</span>
                            </button>
                          )}

                          {/* 4. Assign Cyber Head (Unlocked when Quality Report is approved) */}
                          {isQualityReportApproved(p) && !isCyberReportApproved(p) && (
                            <button
                              onClick={() => {
                                setAssigningCyberHeadProject(p);
                                setSelectedCyberHeadId(p.cyberHeadId || cyberHeadsList[0]?.id || '');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>{p.cyberHeadName ? 'Reassign Cyber Head' : 'Assign to Cyber Head'}</span>
                            </button>
                          )}

                          {/* 5. Consolidate Tri-Reports & Submit to Directorate Admin (Unlocked when Cyber is approved) */}
                          {isCyberReportApproved(p) && (
                            <button
                              onClick={() => {
                                setManagerConsolidatingProject(p);
                                setManagerConsolidationSignature(user.fullName || 'Manager');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs shadow flex items-center gap-1.5 animate-bounce"
                            >
                              <Crown className="w-3.5 h-3.5" />
                              <span>Submit 3 Reports to Admin</span>
                            </button>
                          )}
                        </div>

                        {/* Row 3: A4 Corporate Printable PDF Downloads */}
                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-gray-800/80">
                          <button
                            onClick={() => {
                              const rep = p.productionReport || getDefaultProductionReport(p, {
                                name: user.fullName,
                                id: user.employeeId,
                                designation: user.designation,
                              });
                              exportProductionReportToPdf(p, rep);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 text-cyan-400 font-bold text-[11px] border border-gray-800 flex items-center gap-1"
                            title="Print Production Executive Report"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Prod PDF</span>
                          </button>

                          <button
                            onClick={() => exportQualityReportToPdf(p)}
                            className="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 text-rose-400 font-bold text-[11px] border border-gray-800 flex items-center gap-1"
                            title="Print Quality Assurance Report"
                          >
                            <Printer className="w-3 h-3" />
                            <span>QA PDF</span>
                          </button>

                          <button
                            onClick={() => exportCyberReportToPdf(p)}
                            className="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 text-purple-400 font-bold text-[11px] border border-gray-800 flex items-center gap-1"
                            title="Print Cyber Security Audit"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Cyber PDF</span>
                          </button>

                          <button
                            onClick={() => handleOpenMasterReport(p)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 font-bold text-[11px] border border-indigo-700/50 flex items-center gap-1 shadow"
                            title="Open & Export 13-Page Corporate Master Engineering Dossier"
                          >
                            <Printer className="w-3 h-3 text-indigo-400" />
                            <span>13-Page Master PDF</span>
                          </button>
                        </div>
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
      {/* 3. PRODUCTION HEAD DEPARTMENT HUB */}
      {/* ========================================================================= */}
      {isProductionHead && !isAdmin && !isManager && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                  Production Head Command Desk
                </span>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-1">
                  <ShieldCheck className="w-5 h-5 text-purple-400" /> My Assigned Production Projects ({myHeadProjects.length})
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Assigned by Operations Manager. Assign project to Team Leader, review team progress, and execute Tier 3 Production Head Departmental Sign-off.
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

            {myHeadProjects.length === 0 ? (
              <div className="p-8 bg-gray-950/60 rounded-2xl border border-gray-800 text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-sm font-bold text-gray-300">No Projects Currently Assigned to You as Production Head</p>
                <p className="text-xs text-gray-500">When your Manager assigns a project to your Production Head profile, it will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myHeadProjects.map((p) => {
                  const isTlReviewed = p.stage === 'REVIEWED_BY_TL';
                  const isHeadApproved = p.stage === 'HEAD_APPROVED' || p.stage === 'FINAL_ACCEPTED_BY_MANAGER' || p.status === 'COMPLETED';

                  return (
                    <div
                      key={`head-${p.id}`}
                      className={`p-5 rounded-2xl bg-gray-950 border ${
                        isHeadApproved
                          ? 'border-purple-500/40 bg-purple-950/10'
                          : isTlReviewed
                          ? 'border-amber-500/40 shadow-amber-950/20'
                          : 'border-gray-800'
                      } space-y-3 flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                            {p.projectCode}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                              isHeadApproved
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                : isTlReviewed
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-gray-900 text-gray-400 border-gray-800'
                            }`}
                          >
                            {isHeadApproved ? '✓ HEAD APPROVED' : isTlReviewed ? 'AWAITING YOUR APPROVAL' : p.stage || 'IN PROGRESS'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white">{p.projectName}</h4>
                        <p className="text-xs text-gray-400">Client: {p.customerName} (${p.budget?.toLocaleString()})</p>

                        <div className="mt-3 p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Team Leader:</span>
                            <span className="font-bold text-amber-300 truncate max-w-[160px]">
                              {p.targetTeamLeadName || 'Pending Assign (Click Below)'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Full Stack:</span>
                            <span className="font-bold text-cyan-400 truncate max-w-[160px]">
                              {p.assignedEngineerName || 'Pending TL Assign'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-gray-800/80 text-[10px]">
                            <span className="text-gray-400">Sign-Off Progress:</span>
                            <span className="font-bold text-emerald-400">
                              {getReportSignoffProgress(p).completed}/4 Tiers Signed
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2">
                        {/* Production Head Action: Assign Team Leader */}
                        <button
                          onClick={() => {
                            setAssigningTlFromHeadProject(p);
                            setSelectedTlFromHeadId(p.targetTeamLeadId || teamLeadersList[0]?.id || '');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
                        >
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          <span>{p.targetTeamLeadId ? 'Reassign Team Leader' : 'Assign to Team Leader'}</span>
                        </button>

                        {/* Production Head Action: Tier 3 Sign-off */}
                        {isTlReviewed && (
                          <button
                            onClick={() => {
                              setHeadApproveProject(p);
                              setHeadRemarks('Production deployment and SLA metrics fully approved for operational signoff.');
                              setHeadSig(user.fullName || 'Production Head');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow flex items-center gap-1.5 animate-pulse"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Sign Tier 3 Approval</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const rep = p.productionReport || getDefaultProductionReport(p, {
                              name: user.fullName,
                              id: user.employeeId,
                              designation: user.designation,
                            });
                            exportProductionReportToPdf(p, rep);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs border border-gray-700 flex items-center gap-1 ml-auto"
                        >
                          <Printer className="w-3.5 h-3.5 text-cyan-400" />
                          <span>PDF</span>
                        </button>
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
      {/* 4. FULL STACK DEVELOPER WORKBENCH & DELIVERABLES UPLOAD */}
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
                          onClick={() => handleOpenMasterReport(p, 'A')}
                          className="px-3.5 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-bold text-xs border border-cyan-500/40 flex items-center gap-1.5 shadow"
                          title="Fill & Sign Part A (Project & Full Stack Engineering) in 13-Page Master Dossier"
                        >
                          <Printer className="w-3.5 h-3.5 text-cyan-400" />
                          <span>13-Page Master (Part A)</span>
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
                        <div className="text-xs space-y-1 mt-2 p-2.5 rounded-xl bg-gray-900 border border-gray-800">
                          <p className="text-cyan-400 font-semibold">
                            Full Stack: <strong>{p.assignedEngineerName || 'Unassigned'}</strong>
                          </p>
                          {p.assignedDevOpsName && (
                            <p className="text-emerald-400 font-semibold">
                              DevOps: <strong>{p.assignedDevOpsName}</strong>
                            </p>
                          )}
                          {p.assignedAiEngineerName && (
                            <p className="text-purple-400 font-semibold">
                              AI Engineer: <strong>{p.assignedAiEngineerName}</strong>
                            </p>
                          )}
                        </div>

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
                        <button
                          onClick={() => {
                            setAssigningEngineersProject(p);
                            setSelectedFsEngId(p.assignedEngineerId || fsEngineersList[0]?.id || '');
                            setSelectedDevOpsEngId(p.assignedDevOpsId || devOpsEngineersList[0]?.id || '');
                            setSelectedAiEngId(p.assignedAiEngineerId || aiEngineersList[0]?.id || '');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{p.assignedEngineerId ? 'Reassign Engineers' : 'Assign Engineers (FS, DevOps, AI)'}</span>
                        </button>

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
                          onClick={() => handleOpenMasterReport(p, 'A')}
                          className="px-3 py-1.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-300 font-bold text-xs border border-indigo-500/40 flex items-center gap-1.5 shadow"
                          title="Open 13-Page Master Engineering Report Dossier"
                        >
                          <Printer className="w-3.5 h-3.5 text-indigo-400" />
                          <span>13-Page Master PDF</span>
                        </button>

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
      {/* 5. DEVOPS & CLOUD INFRASTRUCTURE CONSOLE */}
      {/* ========================================================================= */}
      {isDevOpsEngineer && !isAdmin && !isManager && !isProductionHead && !isTeamLeader && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  DevOps Infrastructure Desk
                </span>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-1">
                  <Server className="w-5 h-5 text-emerald-400" /> My Assigned Infrastructure Projects ({myDevOpsProjects.length})
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Monitor container pipelines, deployment manifests, environment sync, rollback readiness, and production server health.
                </p>
              </div>

              <button
                onClick={loadDashboardData}
                className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold border border-gray-700 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Pipelines</span>
              </button>
            </div>

            {myDevOpsProjects.length === 0 ? (
              <div className="p-8 bg-gray-950/60 rounded-2xl border border-gray-800 text-center space-y-2">
                <Server className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-sm font-bold text-gray-300">No Projects Currently Assigned to You as DevOps Engineer</p>
                <p className="text-xs text-gray-500">When your Team Leader assigns infrastructure scope to your profile, it will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myDevOpsProjects.map((p) => {
                  const rep = p.productionReport || getDefaultProductionReport(p);
                  return (
                    <div
                      key={`devops-${p.id}`}
                      className="p-5 rounded-2xl bg-gray-950 border border-emerald-500/30 hover:border-emerald-500/60 transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {p.projectCode}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            🟢 CI/CD LIVE
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white">{p.projectName}</h4>
                        <p className="text-xs text-gray-400">Client: {p.customerName}</p>

                        <div className="mt-3 p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-1.5 font-mono">
                          <div className="flex items-center justify-between text-gray-400">
                            <span>Repository:</span>
                            <span className="text-emerald-300 truncate max-w-[170px]">{rep.sourceCodeHandover.repository}</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-400">
                            <span>Branch / Tag:</span>
                            <span className="text-cyan-300">{rep.sourceCodeHandover.branch} ({rep.sourceCodeHandover.releaseTag})</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-400">
                            <span>Deployment Owner:</span>
                            <span className="text-amber-300">{rep.deploymentInfo.deploymentOwner}</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-400">
                            <span>Environment Sync:</span>
                            <span className="text-emerald-400">{rep.integrations.envSyncStatus}</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-400">
                            <span>Rollback Plan:</span>
                            <span className="text-purple-300">{rep.deploymentInfo.rollbackPlan}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => exportProductionReportToPdf(p, rep)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View A4 Spec</span>
                        </button>

                        <button
                          onClick={() => handleOpenMasterReport(p, 'B')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold text-xs border border-emerald-500/40 flex items-center gap-1.5 shadow"
                          title="Fill & Sign Part B (DevOps & Production) in 13-Page Master Dossier"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-400" />
                          <span>13-Page Master (Part B)</span>
                        </button>

                        <button
                          onClick={() => setInspectingProject(p)}
                          className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs border border-gray-700 flex items-center gap-1"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. AI & MACHINE LEARNING ENGINEERING LAB */}
      {/* ========================================================================= */}
      {isAiEngineer && !isAdmin && !isManager && !isProductionHead && !isTeamLeader && !isDevOpsEngineer && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                  AI &amp; LLM Engineering Lab
                </span>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-1">
                  <Cpu className="w-5 h-5 text-purple-400" /> My Assigned AI Projects ({myAiProjects.length})
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Vector database indexing, LLM tool inference, EMS &amp; CRM embeddings synchronization, and prompt telemetry validation.
                </p>
              </div>

              <button
                onClick={loadDashboardData}
                className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold border border-gray-700 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync AI Lab</span>
              </button>
            </div>

            {myAiProjects.length === 0 ? (
              <div className="p-8 bg-gray-950/60 rounded-2xl border border-gray-800 text-center space-y-2">
                <Cpu className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-sm font-bold text-gray-300">No Projects Currently Assigned to You as AI Engineer</p>
                <p className="text-xs text-gray-500">When your Team Leader assigns AI/ML pipeline scope to your profile, it will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myAiProjects.map((p) => {
                  const rep = p.productionReport || getDefaultProductionReport(p);
                  return (
                    <div
                      key={`ai-${p.id}`}
                      className="p-5 rounded-2xl bg-gray-950 border border-purple-500/30 hover:border-purple-500/60 transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                            {p.projectCode}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-400" /> AI PIPELINE ACTIVE
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white">{p.projectName}</h4>
                        <p className="text-xs text-gray-400">Client: {p.customerName}</p>

                        <div className="mt-3 p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-1.5 font-mono">
                          <div className="flex items-center justify-between text-gray-400">
                            <span>Integration Model:</span>
                            <span className="text-purple-300 font-bold">DeepSeek / Gemini Tool Agents</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-400">
                            <span>Vector Database:</span>
                            <span className="text-cyan-300">Pinecone / pgvector [Synced]</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-400">
                            <span>Data Flow Validation:</span>
                            <span className="text-emerald-400">{rep.integrations.dataFlowStatus}</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-400">
                            <span>ERP Context Sync:</span>
                            <span className="text-emerald-400">{rep.integrations.erpIntegrationStatus}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => exportProductionReportToPdf(p, rep)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View A4 Report</span>
                        </button>

                        <button
                          onClick={() => handleOpenMasterReport(p, 'C')}
                          className="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 font-bold text-xs border border-purple-500/40 flex items-center gap-1.5 shadow"
                          title="Fill & Sign Part C (AI Engineering & Autonomous Agents) in 13-Page Master Dossier"
                        >
                          <Printer className="w-3.5 h-3.5 text-purple-400" />
                          <span>13-Page Master (Part C)</span>
                        </button>

                        <button
                          onClick={() => setInspectingProject(p)}
                          className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs border border-gray-700 flex items-center gap-1"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5A. QUALITY HEAD COMMAND HUB */}
      {/* ========================================================================= */}
      {isQualityHead && !isAdmin && !isManager && !isProductionHead && !isTeamLeader && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                  Quality Assurance Directorate
                </span>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-1">
                  <ShieldAlert className="w-5 h-5 text-rose-400" /> Quality Department Projects ({myQualityHeadProjects.length})
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Assigned by Operations Manager after production completion. Assign to EMS Quality Engineers, review test execution matrices, and approve final Quality Assurance Certification.
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

            {myQualityHeadProjects.length === 0 ? (
              <div className="p-8 bg-gray-950/60 rounded-2xl border border-gray-800 text-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-sm font-bold text-gray-300">No Projects Currently Assigned to You as Quality Head</p>
                <p className="text-xs text-gray-500">When Manager assigns completed production projects to Quality, they will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myQualityHeadProjects.map((p) => {
                  const qa = p.qualityReport || getDefaultQualityReport(p);
                  const isApproved = isQualityReportApproved(p);
                  const isSubmittedByEng = qa.currentStage === 'SUBMITTED_BY_ENGINEER';

                  return (
                    <div
                      key={`qh-${p.id}`}
                      className={`p-5 rounded-2xl bg-gray-950 border ${
                        isApproved
                          ? 'border-emerald-500/40 bg-emerald-950/10'
                          : isSubmittedByEng
                          ? 'border-rose-500/40 shadow-rose-950/20'
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
                              isApproved
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : isSubmittedByEng
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                                : 'bg-gray-900 text-gray-400 border-gray-800'
                            }`}
                          >
                            {isApproved ? '✓ QUALITY CERTIFIED' : isSubmittedByEng ? 'REPORT READY FOR REVIEW' : 'TESTING IN PROGRESS'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white">{p.projectName}</h4>
                        <p className="text-xs text-gray-400">Client: {p.customerName} (${p.budget?.toLocaleString()})</p>

                        <div className="mt-3 p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Assigned QA Engineer:</span>
                            <span className="font-bold text-rose-300 truncate max-w-[170px]">
                              {p.assignedQualityEngineerName || 'Pending Assign (Click Below)'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Total Tests Run:</span>
                            <span className="font-bold text-cyan-300">{qa.testSummary.totalTests} tests ({qa.testSummary.passRate} pass rate)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Critical / High Bugs:</span>
                            <span className="font-bold text-amber-400">
                              {qa.defectSeverityMatrix.critical} Critical • {qa.defectSeverityMatrix.high} High
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Avg API Latency:</span>
                            <span className="font-bold text-emerald-400">{qa.performanceMetrics.avgApiResponseMs}ms</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {/* 1. Assign Quality Engineer */}
                          <button
                            onClick={() => {
                              setAssigningQualityEngineerProject(p);
                              setSelectedQualityEngineerId(p.assignedQualityEngineerId || qualityEngineersList[0]?.id || '');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>{p.assignedQualityEngineerId ? 'Reassign QA Engineer' : 'Assign to QA Engineer'}</span>
                          </button>

                          {/* 2. Review & Approve Quality Report */}
                          {isSubmittedByEng && !isApproved && (
                            <button
                              onClick={() => {
                                setApprovingQualityReportProject(p);
                                setQualityHeadSignature(user.fullName || 'Quality Head');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center gap-1.5 animate-bounce"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve QA Report</span>
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => exportQualityReportToPdf(p)}
                          className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs border border-gray-700 flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5 text-rose-400" />
                          <span>QA PDF</span>
                        </button>

                        <button
                          onClick={() => handleOpenMasterReport(p, 'D')}
                          className="px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold text-xs border border-rose-500/40 flex items-center gap-1.5 shadow"
                          title="Review & Sign Part D (Quality Assurance) in 13-Page Master Dossier"
                        >
                          <Printer className="w-3.5 h-3.5 text-rose-400" />
                          <span>13-Page Master (Part D)</span>
                        </button>
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
      {/* 5B. QUALITY ENGINEER WORKSPACE */}
      {/* ========================================================================= */}
      {isQualityEngineer && !isAdmin && !isManager && !isProductionHead && !isTeamLeader && !isQualityHead && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                  Quality Engineering Workbench
                </span>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-1">
                  <TestTube className="w-5 h-5 text-rose-400" /> My Quality Testing Projects ({myQualityEngineerProjects.length})
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Assigned by Quality Head. Execute automated &amp; manual test suites, verify API latency and defect matrices, and submit the 5-Section QA Report for Head Approval.
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

            {myQualityEngineerProjects.length === 0 ? (
              <div className="p-8 bg-gray-950/60 rounded-2xl border border-gray-800 text-center space-y-2">
                <TestTube className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-sm font-bold text-gray-300">No Projects Currently Assigned to You for QA Testing</p>
                <p className="text-xs text-gray-500">When Quality Head assigns a project to your Quality Engineer profile, it will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myQualityEngineerProjects.map((p) => {
                  const qa = p.qualityReport || getDefaultQualityReport(p);
                  const isApproved = isQualityReportApproved(p);
                  const isSubmitted = qa.currentStage === 'SUBMITTED_BY_ENGINEER' || isApproved;

                  return (
                    <div
                      key={`qe-${p.id}`}
                      className={`p-5 rounded-2xl bg-gray-950 border ${
                        isApproved
                          ? 'border-emerald-500/40 bg-emerald-950/10'
                          : isSubmitted
                          ? 'border-indigo-500/40'
                          : 'border-rose-500/40'
                      } space-y-3 flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            {p.projectCode}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                              isApproved
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : isSubmitted
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                            }`}
                          >
                            {isApproved ? '✓ APPROVED BY HEAD' : isSubmitted ? 'SUBMITTED TO HEAD' : 'AUDIT ACTION REQUIRED'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white">{p.projectName}</h4>
                        <p className="text-xs text-gray-400">Client: {p.customerName} (${p.budget?.toLocaleString()})</p>

                        <div className="mt-3 p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Total Test Count:</span>
                            <span className="font-bold text-white">{qa.testSummary.totalTests} Tests</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Pass Rate:</span>
                            <span className="font-bold text-emerald-400">{qa.testSummary.passRate}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Critical Defects:</span>
                            <span className="font-bold text-rose-400">{qa.defectSeverityMatrix.critical}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Avg API Latency:</span>
                            <span className="font-bold text-cyan-400">{qa.performanceMetrics.avgApiResponseMs}ms</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenQualityReport(p)}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
                        >
                          <TestTube className="w-3.5 h-3.5" />
                          <span>{isSubmitted ? 'Edit / Resubmit QA Report' : 'Fill & Submit QA Report'}</span>
                        </button>

                        <button
                          onClick={() => exportQualityReportToPdf(p)}
                          className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs border border-gray-700 flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5 text-rose-400" />
                          <span>QA PDF</span>
                        </button>

                        <button
                          onClick={() => handleOpenMasterReport(p, 'D')}
                          className="px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold text-xs border border-rose-500/40 flex items-center gap-1.5 shadow"
                          title="Fill & Sign Part D (Quality Assurance) in 13-Page Master Dossier"
                        >
                          <Printer className="w-3.5 h-3.5 text-rose-400" />
                          <span>13-Page Master (Part D)</span>
                        </button>
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
      {/* 6A. CYBER SECURITY HEAD COMMAND HUB */}
      {/* ========================================================================= */}
      {isCyberHead && !isAdmin && !isManager && !isProductionHead && !isTeamLeader && !isQualityHead && !isQualityEngineer && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[10px] font-bold uppercase tracking-wider">
                  Cyber Security Command
                </span>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-1">
                  <Lock className="w-5 h-5 text-violet-400" /> Cyber Security Projects ({myCyberHeadProjects.length})
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Assigned by Operations Manager after Quality sign-off. Assign penetration testing to Bug Bounty Specialists, audit OWASP Top 10 remediation, and issue Cyber Head Security Certification.
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

            {myCyberHeadProjects.length === 0 ? (
              <div className="p-8 bg-gray-950/60 rounded-2xl border border-gray-800 text-center space-y-2">
                <Lock className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-sm font-bold text-gray-300">No Projects Currently Assigned to You as Cyber Head</p>
                <p className="text-xs text-gray-500">When Manager assigns quality-approved projects to Cyber Security, they will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myCyberHeadProjects.map((p) => {
                  const cyber = p.cyberReport || getDefaultCyberReport(p);
                  const isApproved = isCyberReportApproved(p);
                  const isSubmittedByTester = cyber.currentStage === 'SUBMITTED_BY_BOUNTY';

                  return (
                    <div
                      key={`ch-${p.id}`}
                      className={`p-5 rounded-2xl bg-gray-950 border ${
                        isApproved
                          ? 'border-emerald-500/40 bg-emerald-950/10'
                          : isSubmittedByTester
                          ? 'border-violet-500/40 shadow-violet-950/20'
                          : 'border-gray-800'
                      } space-y-3 flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                            {p.projectCode}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                              isApproved
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : isSubmittedByTester
                                ? 'bg-violet-500/20 text-violet-300 border-violet-500/40 animate-pulse'
                                : 'bg-gray-900 text-gray-400 border-gray-800'
                            }`}
                          >
                            {isApproved ? '✓ SECURITY CERTIFIED' : isSubmittedByTester ? 'PENTEST READY FOR REVIEW' : 'PENTEST IN PROGRESS'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white">{p.projectName}</h4>
                        <p className="text-xs text-gray-400">Client: {p.customerName} (${p.budget?.toLocaleString()})</p>

                        <div className="mt-3 p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Bug Bounty Specialist:</span>
                            <span className="font-bold text-violet-300 truncate max-w-[170px]">
                              {p.assignedBugBountyName || 'Pending Assign (Click Below)'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Security Posture:</span>
                            <span className={`font-bold ${cyber.executiveSummary.postureStatus === 'SECURE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {cyber.executiveSummary.postureStatus}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Vulnerabilities Patched:</span>
                            <span className="font-bold text-emerald-400">
                              {cyber.executiveSummary.vulnerabilitiesResolved} / {cyber.executiveSummary.totalVulnerabilitiesFound} Resolved
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Open Critical CVEs:</span>
                            <span className="font-bold text-rose-400">{cyber.executiveSummary.openVulnerabilities} Open</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {/* 1. Assign Bug Bounty Specialist */}
                          <button
                            onClick={() => {
                              setAssigningBugBountyProject(p);
                              setSelectedBugBountyId(p.assignedBugBountyId || bugBountyList[0]?.id || '');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>{p.assignedBugBountyId ? 'Reassign Specialist' : 'Assign to Bug Bounty'}</span>
                          </button>

                          {/* 2. Review & Approve Cyber Report */}
                          {isSubmittedByTester && !isApproved && (
                            <button
                              onClick={() => {
                                setApprovingCyberReportProject(p);
                                setCyberHeadSignature(user.fullName || 'Cyber Head');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center gap-1.5 animate-bounce"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve Cyber Report</span>
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => exportCyberReportToPdf(p)}
                          className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs border border-gray-700 flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5 text-violet-400" />
                          <span>Cyber PDF</span>
                        </button>

                        <button
                          onClick={() => handleOpenMasterReport(p, 'E')}
                          className="px-3 py-1.5 rounded-xl bg-violet-950 hover:bg-violet-900 text-violet-300 font-bold text-xs border border-violet-500/40 flex items-center gap-1.5 shadow"
                          title="Review & Sign Part E (Bug Bounty & Security Assurance) in 13-Page Master Dossier"
                        >
                          <Printer className="w-3.5 h-3.5 text-violet-400" />
                          <span>13-Page Master (Part E)</span>
                        </button>
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
      {/* 6B. BUG BOUNTY SPECIALIST WORKSPACE */}
      {/* ========================================================================= */}
      {isBugBountySpecialist && !isAdmin && !isManager && !isProductionHead && !isTeamLeader && !isQualityHead && !isQualityEngineer && !isCyberHead && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[10px] font-bold uppercase tracking-wider">
                  Ethical Bug Bounty Workspace
                </span>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-1">
                  <ShieldAlert className="w-5 h-5 text-violet-400" /> My Bug Bounty Projects ({myBugBountyProjects.length})
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Assigned by Cyber Security Head. Conduct penetration testing, verify OWASP Top 10 matrix compliance, record bounty payouts, and submit report to Cyber Head.
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

            {myBugBountyProjects.length === 0 ? (
              <div className="p-8 bg-gray-950/60 rounded-2xl border border-gray-800 text-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-sm font-bold text-gray-300">No Projects Currently Assigned to You for Pentesting</p>
                <p className="text-xs text-gray-500">When Cyber Head assigns a project to your Bug Bounty profile, it will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myBugBountyProjects.map((p) => {
                  const cyber = p.cyberReport || getDefaultCyberReport(p);
                  const isApproved = isCyberReportApproved(p);
                  const isSubmitted = cyber.currentStage === 'SUBMITTED_BY_BOUNTY' || isApproved;

                  return (
                    <div
                      key={`bb-${p.id}`}
                      className={`p-5 rounded-2xl bg-gray-950 border ${
                        isApproved
                          ? 'border-emerald-500/40 bg-emerald-950/10'
                          : isSubmitted
                          ? 'border-indigo-500/40'
                          : 'border-violet-500/40'
                      } space-y-3 flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                            {p.projectCode}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                              isApproved
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : isSubmitted
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                : 'bg-violet-500/20 text-violet-300 border-violet-500/40 animate-pulse'
                            }`}
                          >
                            {isApproved ? '✓ CERTIFIED BY HEAD' : isSubmitted ? 'SUBMITTED TO HEAD' : 'PENTEST IN PROGRESS'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white">{p.projectName}</h4>
                        <p className="text-xs text-gray-400">Client: {p.customerName} (${p.budget?.toLocaleString()})</p>

                        <div className="mt-3 p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Security Posture:</span>
                            <span className="font-bold text-white">{cyber.executiveSummary.postureStatus}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">OWASP Tests Verified:</span>
                            <span className="font-bold text-emerald-400">
                              {cyber.owaspMatrix.filter((m) => m.verified).length} / {cyber.owaspMatrix.length} Verified
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Bounty Findings Logged:</span>
                            <span className="font-bold text-cyan-400">{cyber.bugBountyFindings.length} Reports</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Testing Window:</span>
                            <span className="font-bold text-gray-300">{cyber.executiveSummary.testingPeriod}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenCyberReport(p)}
                          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>{isSubmitted ? 'Edit / Resubmit Pentest Report' : 'Fill & Submit Pentest Report'}</span>
                        </button>

                        <button
                          onClick={() => exportCyberReportToPdf(p)}
                          className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs border border-gray-700 flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5 text-violet-400" />
                          <span>Cyber PDF</span>
                        </button>

                        <button
                          onClick={() => handleOpenMasterReport(p, 'E')}
                          className="px-3 py-1.5 rounded-xl bg-violet-950 hover:bg-violet-900 text-violet-300 font-bold text-xs border border-violet-500/40 flex items-center gap-1.5 shadow"
                          title="Fill & Sign Part E (Bug Bounty & Security Assurance) in 13-Page Master Dossier"
                        >
                          <Printer className="w-3.5 h-3.5 text-violet-400" />
                          <span>13-Page Master (Part E)</span>
                        </button>
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
      {/* 7. ADMIN CONTROL HUB: FULL AUDIT, ASSIGN MANAGER & FINAL TOTAL APPROVAL */}
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
                              <span className="text-gray-400">Manager:</span>
                              <span className="font-bold text-amber-300 truncate max-w-[160px]">
                                {p.managerName || 'Pending Assign'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Prod Head:</span>
                              <span className="font-bold text-purple-300 truncate max-w-[160px]">
                                {p.productionHeadName || 'Pending Assign'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Team Leader:</span>
                              <span className="font-bold text-indigo-300 truncate max-w-[160px]">
                                {p.targetTeamLeadName || 'Pending Assign'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Full Stack:</span>
                              <span className="font-bold text-cyan-400 truncate max-w-[160px]">
                                {p.assignedEngineerName || 'Pending TL Assign'}
                              </span>
                            </div>

                            {/* Technical & Department Staffing */}
                            <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-800/80 space-y-0.5">
                              {p.assignedDevOpsName && <div>DevOps: <strong className="text-emerald-300">{p.assignedDevOpsName}</strong></div>}
                              {p.assignedAiEngineerName && <div>AI: <strong className="text-purple-300">{p.assignedAiEngineerName}</strong></div>}
                              {p.qualityHeadName && <div>Quality Head: <strong className="text-rose-300">{p.qualityHeadName}</strong></div>}
                              {p.cyberHeadName && <div>Cyber Head: <strong className="text-violet-300">{p.cyberHeadName}</strong></div>}
                            </div>

                            {/* Tri-Department Approval Status Grid */}
                            <div className="pt-2 border-t border-gray-800 space-y-1 text-[10px]">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">🏭 Production (4 Tiers):</span>
                                <span className={`font-bold ${isReportFullyFilled(p) ? 'text-emerald-400' : 'text-amber-400'}`}>
                                  {isReportFullyFilled(p) ? '✓ 4/4 Signed' : `${getReportSignoffProgress(p).completed}/4 Signed`}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">🛡️ Quality Assurance:</span>
                                <span className={`font-bold ${isQualityReportApproved(p) ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {isQualityReportApproved(p) ? '✓ Head Approved' : p.qualityHeadName ? '⏳ Testing' : 'Pending'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">🔒 Cyber &amp; Pentest:</span>
                                <span className={`font-bold ${isCyberReportApproved(p) ? 'text-emerald-400' : 'text-violet-400'}`}>
                                  {isCyberReportApproved(p) ? '✓ Certified Secure' : p.cyberHeadName ? '⏳ Pentest' : 'Pending'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-gray-800/80">
                              <span className={`text-[10px] font-bold ${isAllThreeReportsApproved(p) ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {isAllThreeReportsApproved(p) ? '🌟 All 3 Reports Approved' : '⏳ Reports Pending'}
                              </span>
                              {p.crmSynced && (
                                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                  ✓ CRM Synced
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-800 flex flex-col gap-2">
                          {/* Admin Action: Assign / Change Manager */}
                          <button
                            onClick={() => {
                              setAssigningManagerProject(p);
                              setSelectedManagerId(p.managerId || managersList[0]?.id || '');
                            }}
                            className="w-full py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-amber-400 hover:text-amber-300 font-bold text-xs border border-gray-800 flex items-center justify-center gap-1.5 transition-all shadow"
                          >
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span>{p.managerName ? 'Reassign Manager' : 'Assign to Manager'}</span>
                          </button>

                          {/* 3 Corporate Printable A4 PDF Reports */}
                          <div className="grid grid-cols-3 gap-1.5">
                            {isReportFullyFilled(p) ? (
                              <button
                                onClick={() => {
                                  const rep = p.productionReport || getDefaultProductionReport(p, {
                                    name: user.fullName,
                                    id: user.employeeId,
                                    designation: user.designation,
                                  });
                                  exportProductionReportToPdf(p, rep);
                                }}
                                className="py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-cyan-300 font-bold text-[10px] border border-cyan-500/30 flex items-center justify-center gap-1"
                                title="Print Production Executive Report"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Prod PDF</span>
                              </button>
                            ) : (
                              <div className="py-1.5 rounded-lg bg-gray-950 text-gray-600 text-[10px] text-center border border-gray-800" title="Production locked until 4 sign-offs">
                                🔒 Prod
                              </div>
                            )}

                            {isQualityReportApproved(p) ? (
                              <button
                                onClick={() => exportQualityReportToPdf(p)}
                                className="py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-rose-300 font-bold text-[10px] border border-rose-500/30 flex items-center justify-center gap-1"
                                title="Print Quality Assurance Report"
                              >
                                <Printer className="w-3 h-3" />
                                <span>QA PDF</span>
                              </button>
                            ) : (
                              <div className="py-1.5 rounded-lg bg-gray-950 text-gray-600 text-[10px] text-center border border-gray-800" title="QA locked until Head approval">
                                🔒 QA
                              </div>
                            )}

                            {isCyberReportApproved(p) ? (
                              <button
                                onClick={() => exportCyberReportToPdf(p)}
                                className="py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-violet-300 font-bold text-[10px] border border-violet-500/30 flex items-center justify-center gap-1"
                                title="Print Cyber Security & Bug Bounty Audit"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Cyber PDF</span>
                              </button>
                            ) : (
                              <div className="py-1.5 rounded-lg bg-gray-950 text-gray-600 text-[10px] text-center border border-gray-800" title="Cyber locked until Head approval">
                                🔒 Cyber
                              </div>
                            )}
                          </div>

                          {/* Final Directorate Approval & Auto-Push to CRM */}
                          <button
                            onClick={() => handleAdminFinalApprovalAndCrmSync(p)}
                            disabled={!isAllThreeReportsApproved(p) || approvingCrmProjectId === p.id}
                            className={`w-full py-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all ${
                              isAllThreeReportsApproved(p)
                                ? 'bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-white animate-pulse'
                                : 'bg-gray-900 text-gray-500 border border-gray-800 cursor-not-allowed'
                            }`}
                            title={
                              isAllThreeReportsApproved(p)
                                ? 'All 3 Reports Approved! Click to grant final approval and auto-sync to CRM'
                                : 'Locked: All 3 department reports (Production, Quality, Cyber) must be approved'
                            }
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              {approvingCrmProjectId === p.id
                                ? 'Syncing to CRM...'
                                : p.crmSynced
                                ? '✅ Approved & Synced to CRM'
                                : isAllThreeReportsApproved(p)
                                ? '🚀 Directorate Final Approval & Push to CRM'
                                : '🔒 Locked: Pending 3 Reports'}
                            </span>
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
                        {/* CRM Executive Handover PDF Button */}
                        <button
                          onClick={() => setPdfModalProject(p)}
                          className="w-full py-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600 text-indigo-300 hover:text-white font-black text-xs border border-indigo-500/30 flex items-center justify-center gap-1.5 transition-all shadow"
                          title="Open CRM Executive Handover PDF with Stamps & Sign-off"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>📄 View Handover Document (PDF)</span>
                        </button>

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

          {/* Section 3: CRM Handover Document & Executive PDF (Tarika 1 & 2) */}
          {inspectingProject && (() => {
            const pdfUrl = getProjectHandoverPdfUrl(inspectingProject);
            const pdfPrintUrl = getProjectHandoverPdfUrl(inspectingProject, true);
            const agencySignoff = inspectingProject.agencySignoff || inspectingProject.handoverDocument?.agencySignoff;
            const clientSignoff = inspectingProject.clientSignoff || inspectingProject.handoverDocument?.clientSignoff;

            return (
              <div className="p-4 rounded-xl bg-gray-950 border border-indigo-500/30 space-y-3 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-2.5">
                  <div>
                    <span className="font-bold text-indigo-400 uppercase text-[11px] block flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> 3. Executive Handover Document &amp; Verified PDF Matrix
                    </span>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Verified corporate handover report generated by CRM with client &amp; agency digital signatures.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" /> New Tab
                    </a>
                    <a
                      href={pdfPrintUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <Printer className="w-3 h-3" /> Print / Save PDF
                    </a>
                  </div>
                </div>

                {/* Sign-off Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                    <span className="text-emerald-400 font-bold block">✓ Agency Director Sign-off</span>
                    <span className="text-white font-semibold">{agencySignoff?.name || 'Admin Director'}</span>
                    <span className="text-gray-400 block text-[10px]">{agencySignoff?.designation || 'Agency Project Director'} • {agencySignoff?.date || '09/09/2026'}</span>
                    <span className="text-emerald-300/80 font-mono text-[9px] block mt-0.5">{agencySignoff?.signature || 'Admin Name [Digitally Signed]'}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                    <span className="text-cyan-400 font-bold block">✓ Client Approval Sign-off</span>
                    <span className="text-white font-semibold">{clientSignoff?.name || inspectingProject.customerName}</span>
                    <span className="text-gray-400 block text-[10px]">{clientSignoff?.designation || 'Client Representative'} • {clientSignoff?.date || '09/09/2026'}</span>
                    <span className="text-cyan-300/80 font-mono text-[9px] block mt-0.5">{clientSignoff?.signature || 'Client Authorized Signatory [Verified]'}</span>
                  </div>
                </div>

                {/* Embedded PDF Iframe Viewer */}
                <div className="mt-2 rounded-xl border border-gray-800 overflow-hidden bg-white shadow">
                  <iframe
                    src={pdfUrl}
                    title={`Handover PDF - ${inspectingProject.projectCode}`}
                    width="100%"
                    height="600px"
                    style={{ border: 'none' }}
                  />
                </div>
              </div>
            );
          })()}

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
              {inspectingProject && (
                <button
                  onClick={() => {
                    const proj = inspectingProject;
                    setInspectingProject(null);
                    setPdfModalProject(proj);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> Full Handover Viewer
                </button>
              )}
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

      {/* 6. Dedicated Fullscreen CRM Handover Document & PDF Viewer Modal */}
      <Modal
        isOpen={!!pdfModalProject}
        onClose={() => setPdfModalProject(null)}
        title={`Executive Project Handover Document (PDF) - ${pdfModalProject?.projectCode || ''}`}
        maxWidth="5xl"
      >
        {pdfModalProject && (() => {
          const pdfUrl = getProjectHandoverPdfUrl(pdfModalProject);
          const pdfPrintUrl = getProjectHandoverPdfUrl(pdfModalProject, true);
          const agencySignoff = pdfModalProject.agencySignoff || pdfModalProject.handoverDocument?.agencySignoff;
          const clientSignoff = pdfModalProject.clientSignoff || pdfModalProject.handoverDocument?.clientSignoff;

          return (
            <div className="space-y-4 text-xs">
              {/* Header Action Bar */}
              <div className="p-4 rounded-2xl bg-gray-950 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded font-mono text-[11px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                      {pdfModalProject.projectCode}
                    </span>
                    <Badge variant="success">CRM APPROVED &amp; VERIFIED</Badge>
                  </div>
                  <h3 className="text-base font-bold text-white">{pdfModalProject.projectName}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Client: <strong className="text-gray-200">{pdfModalProject.customerName}</strong>
                    <span className="mx-2 text-gray-600">•</span>
                    Budget: <strong className="text-amber-400">${pdfModalProject.budget?.toLocaleString()}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow flex items-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in New Tab</span>
                  </a>

                  <a
                    href={pdfPrintUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center gap-1.5 transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>🖨️ Direct Print / Save as PDF</span>
                  </a>
                </div>
              </div>

              {/* Verified Signoffs Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-950/80 border border-emerald-500/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Development Agency Director Sign-off
                  </span>
                  <p className="font-bold text-white text-sm mt-1">{agencySignoff?.name || 'Admin Name'}</p>
                  <p className="text-gray-400 text-xs">{agencySignoff?.designation || 'Agency Project Director'} • {agencySignoff?.date || '09/09/2026'}</p>
                  <p className="text-emerald-300 font-mono text-[10px] mt-1 bg-emerald-950/40 p-1.5 rounded border border-emerald-500/20">
                    ✍️ {agencySignoff?.signature || 'Admin Name [Digitally Signed]'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-950/80 border border-cyan-500/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Client Sign-off &amp; Acceptance
                  </span>
                  <p className="font-bold text-white text-sm mt-1">{clientSignoff?.name || pdfModalProject.customerName}</p>
                  <p className="text-gray-400 text-xs">{clientSignoff?.designation || 'Client Representative'} • {clientSignoff?.date || '09/09/2026'}</p>
                  <p className="text-cyan-300 font-mono text-[10px] mt-1 bg-cyan-950/40 p-1.5 rounded border border-cyan-500/20">
                    ✍️ {clientSignoff?.signature || `${pdfModalProject.customerName} [Authorized Client Sign-off]`}
                  </p>
                </div>
              </div>

              {/* Embedded Corporate Printable Document View (Tarika 1) */}
              <div className="rounded-2xl border border-gray-800 overflow-hidden bg-white shadow-2xl">
                <iframe
                  src={pdfUrl}
                  title={`Project Handover Document - ${pdfModalProject.projectCode}`}
                  width="100%"
                  height="720px"
                  style={{ border: 'none' }}
                />
              </div>

              <div className="pt-2 flex justify-between items-center">
                <span className="text-[11px] text-gray-500">
                  Document verified with corporate watermark, agency seal &amp; dual digital sign-offs.
                </span>
                <button
                  type="button"
                  onClick={() => setPdfModalProject(null)}
                  className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold transition-all"
                >
                  Close Document View
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* 7. Full Stack Engineer Production Report Modal (10 Comprehensive Sections) */}
      <Modal
        isOpen={!!prodReportProject}
        onClose={() => setProdReportProject(null)}
        title={`Production Report (10 Sections) - ${prodReportProject?.projectCode || ''}`}
        maxWidth="5xl"
      >
        {prodReportProject && activeReportData && (
          <div className="space-y-6 text-xs text-gray-300 max-h-[80vh] overflow-y-auto pr-2">
            <div className="p-4 rounded-2xl bg-gray-950 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Tier 1: Full Stack Engineer Submission Desk
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{prodReportProject.projectName}</h3>
                <p className="text-gray-400 text-xs">Code: {prodReportProject.projectCode} • Client: {prodReportProject.customerName}</p>
              </div>
              <button
                type="button"
                onClick={() => exportProductionReportToPdf(prodReportProject, activeReportData)}
                className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold border border-gray-700 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                <span>Preview A4 PDF</span>
              </button>
            </div>

            {/* Section 1: Executive Summary */}
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
              <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wide">1. Production Executive Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-gray-950 border border-gray-800">
                  <span className="text-gray-500 block">Production Status</span>
                  <strong className="text-emerald-400">{activeReportData.executiveSummary.productionStatus}</strong>
                </div>
                <div className="p-2 rounded-lg bg-gray-950 border border-gray-800">
                  <span className="text-gray-500 block">Development</span>
                  <strong className="text-cyan-400">{activeReportData.executiveSummary.developmentStatus}</strong>
                </div>
                <div className="p-2 rounded-lg bg-gray-950 border border-gray-800">
                  <span className="text-gray-500 block">Deployment</span>
                  <strong className="text-indigo-400">{activeReportData.executiveSummary.deploymentStatus}</strong>
                </div>
                <div className="p-2 rounded-lg bg-gray-950 border border-gray-800">
                  <span className="text-gray-500 block">Integration Sync</span>
                  <strong className="text-purple-400">{activeReportData.executiveSummary.integrationStatus}</strong>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-[11px] mb-1 font-semibold">Production Overview Description:</label>
                <textarea
                  value={activeReportData.executiveSummary.overview}
                  onChange={(e) => setActiveReportData({
                    ...activeReportData,
                    executiveSummary: { ...activeReportData.executiveSummary, overview: e.target.value },
                  })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Section 2: Deliverables (12 Tasks) */}
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
              <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wide">2. Scope &amp; Implemented Modules (12 Tasks)</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeReportData.deliverables.map((d, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between gap-3 text-[11px]">
                    <div className="flex-1">
                      <span className="text-cyan-400 font-bold">Task {d.taskNo}: {d.requirement}</span>
                      <p className="text-gray-400 text-[10px] mt-0.5">{d.deliverable}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Architecture Layers */}
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
              <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wide">3. Production Architecture Overview</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-gray-950 border border-gray-800">
                  <strong className="text-cyan-300">Client Layer:</strong> {activeReportData.systemArchitecture.clientLayer}
                </div>
                <div className="p-2 rounded-lg bg-gray-950 border border-gray-800">
                  <strong className="text-indigo-300">Application Layer:</strong> {activeReportData.systemArchitecture.applicationLayer}
                </div>
                <div className="p-2 rounded-lg bg-gray-950 border border-gray-800">
                  <strong className="text-purple-300">Integration Layer:</strong> {activeReportData.systemArchitecture.integrationLayer}
                </div>
                <div className="p-2 rounded-lg bg-gray-950 border border-gray-800">
                  <strong className="text-emerald-300">Data Layer:</strong> {activeReportData.systemArchitecture.dataLayer}
                </div>
              </div>
            </div>

            {/* Section 6: Pre-flight Deployment Checklist (13 items) */}
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
              <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wide">6. Deployment &amp; Pre-Flight Checklist (13 Points)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {Object.entries(activeReportData.deploymentInfo.checklist).map(([key, val]) => (
                  <label key={key} className="flex items-center gap-2 p-2 rounded-lg bg-gray-950 border border-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={(e) => setActiveReportData({
                        ...activeReportData,
                        deploymentInfo: {
                          ...activeReportData.deploymentInfo,
                          checklist: { ...activeReportData.deploymentInfo.checklist, [key]: e.target.checked },
                        },
                      })}
                      className="rounded text-cyan-500 focus:ring-0"
                    />
                    <span className={val ? 'text-gray-200' : 'text-gray-500'}>{key}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Section 10: Handover Checklist (10 items) */}
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
              <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wide">10. Production Handover &amp; Support Checklist (10 Points)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {Object.entries(activeReportData.handoverChecklist).map(([key, val]) => (
                  <label key={key} className="flex items-center gap-2 p-2 rounded-lg bg-gray-950 border border-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={(e) => setActiveReportData({
                        ...activeReportData,
                        handoverChecklist: { ...activeReportData.handoverChecklist, [key]: e.target.checked },
                      })}
                      className="rounded text-emerald-500 focus:ring-0"
                    />
                    <span className={val ? 'text-gray-200' : 'text-gray-500'}>{key}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Full Stack Digital Signature */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-gray-950 to-gray-950 border border-cyan-500/40 space-y-3">
              <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-1.5">
                ✍️ Tier 1 Sign-Off: Full Stack Engineer Digital Signature
              </h4>
              <p className="text-[11px] text-gray-400">
                By typing your legal/authorized signature below, you confirm full technical implementation of the 12 tasks, passing of pre-flight checks, and production environment readiness.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-[10px] mb-1 font-semibold uppercase">Signing Engineer Name:</label>
                  <input
                    type="text"
                    disabled
                    value={user.fullName}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-cyan-400 text-[10px] mb-1 font-bold uppercase">Digital Signature String *</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe / e-Signed"
                    value={fsSignature}
                    onChange={(e) => setFsSignature(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-cyan-500 text-white text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setProdReportProject(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!fsSignature.trim()) {
                    alert('Please enter your digital signature string to submit the Production Report.');
                    return;
                  }
                  const updatedProjects = submitProductionReportByFullStack(
                    prodReportProject.id,
                    activeReportData,
                    {
                      name: user.fullName,
                      id: user.employeeId || user.id,
                      designation: user.designation || 'Full Stack Engineer',
                    },
                    fsSignature.trim()
                  );
                  setCrmProjects(updatedProjects);
                  setNotification(`Production Report for "${prodReportProject.projectName}" successfully submitted with digital signature! Forwarded to Team Leader for review.`);
                  setTimeout(() => setNotification(null), 6000);
                  setProdReportProject(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black shadow-lg flex items-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Submit Production Report &amp; Sign Off</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 8. Team Leader Review Modal */}
      <Modal
        isOpen={!!tlReviewProject}
        onClose={() => setTlReviewProject(null)}
        title={`Team Leader Verification & Review - ${tlReviewProject?.projectCode || ''}`}
        maxWidth="2xl"
      >
        {tlReviewProject && (
          <div className="space-y-5 text-xs text-gray-300">
            <div className="p-4 rounded-2xl bg-gray-950 border border-indigo-500/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Tier 2: Team Leader Review Desk
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">{tlReviewProject.projectName}</h3>
              <p className="text-gray-400 text-xs">Assigned Full Stack: {tlReviewProject.assignedEngineerName || 'Engineer'}</p>
            </div>

            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-1.5">
                Team Leader Technical Review Notes &amp; Observations:
              </label>
              <textarea
                value={tlNotes}
                onChange={(e) => setTlNotes(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                placeholder="Enter review notes verifying deliverables, code completeness and stability..."
              />
            </div>

            <div className="p-4 rounded-2xl bg-gray-950 border border-indigo-500/30 space-y-2">
              <label className="block text-indigo-400 text-[11px] font-bold uppercase">
                Team Leader Digital Signature *
              </label>
              <input
                type="text"
                placeholder="e.g. Jane Smith, Team Leader [Signed]"
                value={tlSig}
                onChange={(e) => setTlSig(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-indigo-500/50 text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setTlReviewProject(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!tlSig.trim()) {
                    alert('Please enter your digital signature to sign off as Team Leader.');
                    return;
                  }
                  const updatedProjects = reviewProductionReportByTeamLead(
                    tlReviewProject.id,
                    {
                      name: user.fullName,
                      id: user.employeeId || user.id,
                      designation: user.designation || 'Team Leader',
                    },
                    tlNotes.trim(),
                    tlSig.trim()
                  );
                  setCrmProjects(updatedProjects);
                  setNotification(`Project "${tlReviewProject.projectName}" reviewed & signed off by Team Leader! Routed to Production Head.`);
                  setTimeout(() => setNotification(null), 6000);
                  setTlReviewProject(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg flex items-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Verify &amp; Sign Off as Team Leader</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 9. Production Head Approval Modal */}
      <Modal
        isOpen={!!headApproveProject}
        onClose={() => setHeadApproveProject(null)}
        title={`Production Head Approval - ${headApproveProject?.projectCode || ''}`}
        maxWidth="2xl"
      >
        {headApproveProject && (
          <div className="space-y-5 text-xs text-gray-300">
            <div className="p-4 rounded-2xl bg-gray-950 border border-purple-500/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Tier 3: Production Head Approval Desk
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">{headApproveProject.projectName}</h3>
              <p className="text-gray-400 text-xs">Review by TL: {headApproveProject.productionReport?.teamLeadSignoff?.name || 'Verified'}</p>
            </div>

            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-1.5">
                Production Head Approval Remarks:
              </label>
              <textarea
                value={headRemarks}
                onChange={(e) => setHeadRemarks(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:border-purple-500 focus:outline-none"
                placeholder="Enter executive approval remarks..."
              />
            </div>

            <div className="p-4 rounded-2xl bg-gray-950 border border-purple-500/30 space-y-2">
              <label className="block text-purple-400 text-[11px] font-bold uppercase">
                Production Head Digital Signature *
              </label>
              <input
                type="text"
                placeholder="e.g. Robert Davis, Production Head [Approved]"
                value={headSig}
                onChange={(e) => setHeadSig(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-purple-500/50 text-white text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setHeadApproveProject(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!headSig.trim()) {
                    alert('Please enter your digital signature to approve as Production Head.');
                    return;
                  }
                  const updatedProjects = approveProductionReportByHead(
                    headApproveProject.id,
                    {
                      name: user.fullName,
                      id: user.employeeId || user.id,
                      designation: user.designation || 'Production Head',
                    },
                    headRemarks.trim(),
                    headSig.trim()
                  );
                  setCrmProjects(updatedProjects);
                  setNotification(`Project "${headApproveProject.projectName}" approved by Production Head! Routed to Manager for Final Acceptance & Closure.`);
                  setTimeout(() => setNotification(null), 6000);
                  setHeadApproveProject(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black shadow-lg flex items-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Approve &amp; Sign Off as Production Head</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 10. Manager Final Acceptance & Closure Modal */}
      <Modal
        isOpen={!!mgrClosureProject}
        onClose={() => setManagerCloseProject(null)}
        title={`Manager Final Acceptance & Project Closure - ${mgrClosureProject?.projectCode || ''}`}
        maxWidth="2xl"
      >
        {mgrClosureProject && (
          <div className="space-y-5 text-xs text-gray-300">
            <div className="p-4 rounded-2xl bg-gray-950 border border-emerald-500/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Tier 4: Manager Final Acceptance &amp; Closure Desk
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">{mgrClosureProject.projectName}</h3>
              <p className="text-gray-400 text-xs">Client: {mgrClosureProject.customerName} • Budget: ${mgrClosureProject.budget?.toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-xs font-semibold mb-1">
                  Final Closure Date (DD/MM/YYYY) *
                </label>
                <input
                  type="text"
                  value={mgrFinalDate}
                  onChange={(e) => setMgrFinalDate(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-xs font-semibold mb-1">
                  Final Project Acceptance Status *
                </label>
                <select
                  value={mgrFinalStatus}
                  onChange={(e) => setMgrFinalStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Accepted">🟢 Accepted (Full Production Acceptance)</option>
                  <option value="Accepted with Minor Observations">🟡 Accepted with Minor Observations</option>
                  <option value="Pending Closure">🟠 Pending Closure</option>
                  <option value="Rejected">🔴 Rejected</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-1.5">
                Manager Remarks &amp; Final Observations:
              </label>
              <textarea
                value={mgrRemarks}
                onChange={(e) => setMgrRemarks(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                placeholder="Final closure observations, client delivery confirmation..."
              />
            </div>

            <div className="p-4 rounded-2xl bg-gray-950 border border-emerald-500/30 space-y-2">
              <label className="block text-emerald-400 text-[11px] font-bold uppercase">
                Manager Authorized Digital Signature *
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah Connor, Operations Manager [Closed]"
                value={mgrSig}
                onChange={(e) => setMgrSig(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-emerald-500/50 text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setManagerCloseProject(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!mgrSig.trim()) {
                    alert('Please enter your digital signature to sign off and close the project as Manager.');
                    return;
                  }
                  const updatedProjects = acceptProductionReportByManager(
                    mgrClosureProject.id,
                    {
                      name: user.fullName,
                      id: user.employeeId || user.id,
                      designation: user.designation || 'Manager',
                    },
                    mgrFinalDate.trim(),
                    mgrFinalStatus,
                    mgrSig.trim(),
                    mgrRemarks.trim()
                  );
                  setCrmProjects(updatedProjects);
                  setNotification(`Project "${mgrClosureProject.projectName}" officially CLOSED & ACCEPTED! Quad digital sign-off complete.`);
                  setTimeout(() => setNotification(null), 6000);
                  setManagerCloseProject(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg flex items-center gap-1.5 transition-all"
              >
                <Crown className="w-4 h-4" />
                <span>Complete Final Acceptance &amp; Close Project</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 11. Admin Assign Project to Manager Modal */}
      <Modal
        isOpen={!!assigningManagerProject}
        onClose={() => setAssigningManagerProject(null)}
        title={`Assign Project to Manager - ${assigningManagerProject?.projectCode || ''}`}
        maxWidth="md"
      >
        {assigningManagerProject && (
          <form onSubmit={handleAdminAssignManager} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-amber-400 font-bold block">{assigningManagerProject.projectName}</span>
              <p className="text-gray-400">Client: {assigningManagerProject.customerName} • Budget: ${assigningManagerProject.budget?.toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1.5">
                Select Operations Manager from EMS *
              </label>
              <select
                value={selectedManagerId}
                onChange={(e) => setSelectedManagerId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                required
              >
                <option value="">-- Choose Operations Manager --</option>
                {managersList.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.employeeId}] {m.fullName} - {m.designation} ({m.department})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1">
                Detected from EMS employees with designation or role &apos;Manager&apos; / &apos;Operations&apos;.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setAssigningManagerProject(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black flex items-center gap-1.5 shadow"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Confirm Manager Assignment</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 12. Manager Assign Project to Production Head Modal */}
      <Modal
        isOpen={!!assigningHeadProject}
        onClose={() => setAssigningHeadProject(null)}
        title={`Assign Project to Production Head - ${assigningHeadProject?.projectCode || ''}`}
        maxWidth="md"
      >
        {assigningHeadProject && (
          <form onSubmit={handleManagerAssignHead} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-purple-400 font-bold block">{assigningHeadProject.projectName}</span>
              <p className="text-gray-400">Client: {assigningHeadProject.customerName} • Budget: ${assigningHeadProject.budget?.toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1.5">
                Select Production Head from EMS *
              </label>
              <select
                value={selectedHeadId}
                onChange={(e) => setSelectedHeadId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:border-purple-500 focus:outline-none"
                required
              >
                <option value="">-- Choose Production Head --</option>
                {headsList.map((h) => (
                  <option key={h.id} value={h.id}>
                    [{h.employeeId}] {h.fullName} - {h.designation} ({h.department})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1">
                Detected from EMS employees with designation &apos;Production Head&apos; or department &apos;Production&apos;.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setAssigningHeadProject(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black flex items-center gap-1.5 shadow"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Confirm Head Assignment</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 13. Production Head Assign Project to Team Leader Modal */}
      <Modal
        isOpen={!!assigningTlFromHeadProject}
        onClose={() => setAssigningTlFromHeadProject(null)}
        title={`Assign Project to Team Leader - ${assigningTlFromHeadProject?.projectCode || ''}`}
        maxWidth="md"
      >
        {assigningTlFromHeadProject && (
          <form onSubmit={handleHeadAssignTl} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-indigo-400 font-bold block">{assigningTlFromHeadProject.projectName}</span>
              <p className="text-gray-400">Client: {assigningTlFromHeadProject.customerName} • Budget: ${assigningTlFromHeadProject.budget?.toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1.5">
                Select Team Leader from EMS *
              </label>
              <select
                value={selectedTlFromHeadId}
                onChange={(e) => setSelectedTlFromHeadId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-indigo-500/40 text-white text-xs focus:border-indigo-500 focus:outline-none"
                required
              >
                <option value="">-- Choose Team Leader --</option>
                {teamLeadersList.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.employeeId}] {t.fullName} - {t.designation} ({t.department})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1">
                Detected from EMS employees with designation &apos;Team Leader&apos; or role &apos;TEAM_LEAD&apos;.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setAssigningTlFromHeadProject(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black flex items-center gap-1.5 shadow"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Confirm TL Assignment</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 14. Team Leader Assign Technical Team (Full Stack, DevOps, AI) Modal */}
      <Modal
        isOpen={!!assigningEngineersProject}
        onClose={() => setAssigningEngineersProject(null)}
        title={`Assign Technical Team (Full Stack, DevOps, AI) - ${assigningEngineersProject?.projectCode || ''}`}
        maxWidth="lg"
      >
        {assigningEngineersProject && (
          <form onSubmit={handleTlAssignEngineers} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-cyan-400 font-bold block">{assigningEngineersProject.projectName}</span>
              <p className="text-gray-400">Client: {assigningEngineersProject.customerName} • Scope: {assigningEngineersProject.departmentScope}</p>
            </div>

            <div className="space-y-3">
              {/* 1. Full Stack Engineer */}
              <div>
                <label className="block text-cyan-300 font-bold mb-1 flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5" /> 1. Full Stack Engineer (Primary Code Implementation &amp; Report Submission) *
                </label>
                <select
                  value={selectedFsEngId}
                  onChange={(e) => setSelectedFsEngId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-cyan-500/40 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  required
                >
                  <option value="">-- Select Full Stack Engineer --</option>
                  {fsEngineersList.map((e) => (
                    <option key={e.id} value={e.id}>
                      [{e.employeeId}] {e.fullName} - {e.designation} ({e.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. DevOps Engineer */}
              <div>
                <label className="block text-emerald-300 font-bold mb-1 flex items-center gap-1">
                  <Server className="w-3.5 h-3.5" /> 2. DevOps Engineer (Infrastructure, CI/CD, Deployment &amp; Environment Sync)
                </label>
                <select
                  value={selectedDevOpsEngId}
                  onChange={(e) => setSelectedDevOpsEngId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-emerald-500/40 text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- Select DevOps Engineer (Optional) --</option>
                  {devOpsEngineersList.map((e) => (
                    <option key={e.id} value={e.id}>
                      [{e.employeeId}] {e.fullName} - {e.designation} ({e.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. AI Engineer */}
              <div>
                <label className="block text-purple-300 font-bold mb-1 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" /> 3. AI Engineer (Model Inference, Embeddings, Vector Search &amp; Agents)
                </label>
                <select
                  value={selectedAiEngId}
                  onChange={(e) => setSelectedAiEngId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-purple-500/40 text-white text-xs focus:border-purple-500 focus:outline-none"
                >
                  <option value="">-- Select AI Engineer (Optional) --</option>
                  {aiEngineersList.map((e) => (
                    <option key={e.id} value={e.id}>
                      [{e.employeeId}] {e.fullName} - {e.designation} ({e.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setAssigningEngineersProject(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black flex items-center gap-1.5 shadow"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Assign Technical Team</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 15. Manager Assign Project to Quality Head Modal */}
      <Modal
        isOpen={!!assigningQualityHeadProject}
        onClose={() => setAssigningQualityHeadProject(null)}
        title={`Assign Project to Quality Head - ${assigningQualityHeadProject?.projectCode || ''}`}
        maxWidth="md"
      >
        {assigningQualityHeadProject && (
          <form onSubmit={handleManagerAssignQualityHead} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-rose-400 font-bold block">{assigningQualityHeadProject.projectName}</span>
              <p className="text-gray-400">Client: {assigningQualityHeadProject.customerName} • Scope: {assigningQualityHeadProject.departmentScope}</p>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1.5">
                Select Quality Head from EMS *
              </label>
              <select
                value={selectedQualityHeadId}
                onChange={(e) => setSelectedQualityHeadId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-rose-500/40 text-white text-xs focus:border-rose-500 focus:outline-none"
                required
              >
                <option value="">-- Choose Quality Head --</option>
                {qualityHeadsList.map((q) => (
                  <option key={q.id} value={q.id}>
                    [{q.employeeId}] {q.fullName} - {q.designation} ({q.department})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1">
                Detected from EMS employees with designation &apos;Quality Head&apos; or &apos;QA Lead&apos;.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setAssigningQualityHeadProject(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black flex items-center gap-1.5 shadow"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Confirm Quality Head Assignment</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 16. Quality Head Assign Project to Quality Engineer Modal */}
      <Modal
        isOpen={!!assigningQualityEngineerProject}
        onClose={() => setAssigningQualityEngineerProject(null)}
        title={`Assign Project to Quality Engineer - ${assigningQualityEngineerProject?.projectCode || ''}`}
        maxWidth="md"
      >
        {assigningQualityEngineerProject && (
          <form onSubmit={handleQualityHeadAssignEngineer} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-rose-400 font-bold block">{assigningQualityEngineerProject.projectName}</span>
              <p className="text-gray-400">Client: {assigningQualityEngineerProject.customerName} • Budget: ${assigningQualityEngineerProject.budget?.toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1.5">
                Select Quality Engineer from EMS *
              </label>
              <select
                value={selectedQualityEngineerId}
                onChange={(e) => setSelectedQualityEngineerId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-rose-500/40 text-white text-xs focus:border-rose-500 focus:outline-none"
                required
              >
                <option value="">-- Choose Quality Engineer --</option>
                {qualityEngineersList.map((q) => (
                  <option key={q.id} value={q.id}>
                    [{q.employeeId}] {q.fullName} - {q.designation} ({q.department})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1">
                Detected from EMS employees with designation &apos;Quality Engineer&apos; or &apos;QA Engineer&apos;.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setAssigningQualityEngineerProject(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black flex items-center gap-1.5 shadow"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Assign Quality Engineer</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 17. Quality Engineer Fill & Submit Quality Report Modal */}
      <Modal
        isOpen={!!fillingQualityReportProject}
        onClose={() => setFillingQualityReportProject(null)}
        title={`Execute Quality Testing & Submit Report - ${fillingQualityReportProject?.projectCode || ''}`}
        maxWidth="2xl"
      >
        {fillingQualityReportProject && qualityReportDraft && (
          <form onSubmit={handleQualityEngineerSubmit} className="space-y-4 text-xs max-h-[80vh] overflow-y-auto pr-1">
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-rose-400 font-bold block">{fillingQualityReportProject.projectName}</span>
              <p className="text-gray-400">Lead QA Audit: ISO/IEC/IEEE 29119 Quality Standards Execution</p>
            </div>

            {/* Test Summary */}
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5">
                <TestTube className="w-4 h-4 text-rose-400" /> 1. Test Suite Execution Summary
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">Total Tests</label>
                  <input
                    type="number"
                    value={qualityReportDraft.testSummary.totalTests}
                    onChange={(e) =>
                      setQualityReportDraft({
                        ...qualityReportDraft,
                        testSummary: { ...qualityReportDraft.testSummary, totalTests: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Passed</label>
                  <input
                    type="number"
                    value={qualityReportDraft.testSummary.passed}
                    onChange={(e) =>
                      setQualityReportDraft({
                        ...qualityReportDraft,
                        testSummary: { ...qualityReportDraft.testSummary, passed: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-emerald-400 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Failed</label>
                  <input
                    type="number"
                    value={qualityReportDraft.testSummary.failed}
                    onChange={(e) =>
                      setQualityReportDraft({
                        ...qualityReportDraft,
                        testSummary: { ...qualityReportDraft.testSummary, failed: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-rose-400 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Pass Rate</label>
                  <input
                    type="text"
                    value={qualityReportDraft.testSummary.passRate}
                    onChange={(e) =>
                      setQualityReportDraft({
                        ...qualityReportDraft,
                        testSummary: { ...qualityReportDraft.testSummary, passRate: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-cyan-400 text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Defect Severity Matrix */}
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> 2. Defect Severity Matrix
              </h5>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">Critical</label>
                  <input
                    type="number"
                    value={qualityReportDraft.defectSeverityMatrix.critical}
                    onChange={(e) =>
                      setQualityReportDraft({
                        ...qualityReportDraft,
                        defectSeverityMatrix: { ...qualityReportDraft.defectSeverityMatrix, critical: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-rose-400 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">High</label>
                  <input
                    type="number"
                    value={qualityReportDraft.defectSeverityMatrix.high}
                    onChange={(e) =>
                      setQualityReportDraft({
                        ...qualityReportDraft,
                        defectSeverityMatrix: { ...qualityReportDraft.defectSeverityMatrix, high: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-amber-400 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Medium</label>
                  <input
                    type="number"
                    value={qualityReportDraft.defectSeverityMatrix.medium}
                    onChange={(e) =>
                      setQualityReportDraft({
                        ...qualityReportDraft,
                        defectSeverityMatrix: { ...qualityReportDraft.defectSeverityMatrix, medium: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-yellow-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Low</label>
                  <input
                    type="number"
                    value={qualityReportDraft.defectSeverityMatrix.low}
                    onChange={(e) =>
                      setQualityReportDraft({
                        ...qualityReportDraft,
                        defectSeverityMatrix: { ...qualityReportDraft.defectSeverityMatrix, low: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-emerald-400 text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Server className="w-4 h-4 text-cyan-400" /> 3. Performance Metrics
              </h5>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">Avg API Response (ms)</label>
                  <input
                    type="number"
                    value={qualityReportDraft.performanceMetrics.avgApiResponseMs}
                    onChange={(e) =>
                      setQualityReportDraft({
                        ...qualityReportDraft,
                        performanceMetrics: { ...qualityReportDraft.performanceMetrics, avgApiResponseMs: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">P99 Response (ms)</label>
                  <input
                    type="number"
                    value={qualityReportDraft.performanceMetrics.p99ResponseMs}
                    onChange={(e) =>
                      setQualityReportDraft({
                        ...qualityReportDraft,
                        performanceMetrics: { ...qualityReportDraft.performanceMetrics, p99ResponseMs: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-white text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Engineer Sign-off & Notes */}
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" /> 4. Quality Engineer Digital Sign-Off
              </h5>
              <div>
                <label className="text-gray-400 block mb-1">Audit Notes / Execution Summary *</label>
                <textarea
                  rows={2}
                  value={qualityEngineerNotes}
                  onChange={(e) => setQualityEngineerNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-rose-500"
                  required
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Digital Signature (Full Name) *</label>
                <input
                  type="text"
                  value={qualityEngineerSignature}
                  onChange={(e) => setQualityEngineerSignature(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-rose-500/40 text-rose-300 font-mono text-xs focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setFillingQualityReportProject(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black flex items-center gap-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit QA Report to Quality Head</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 18. Quality Head Review & Approve Quality Report Modal */}
      <Modal
        isOpen={!!approvingQualityReportProject}
        onClose={() => setApprovingQualityReportProject(null)}
        title={`Review & Approve QA Report - ${approvingQualityReportProject?.projectCode || ''}`}
        maxWidth="md"
      >
        {approvingQualityReportProject && (
          <form onSubmit={handleQualityHeadApprove} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-rose-400 font-bold block">{approvingQualityReportProject.projectName}</span>
              <p className="text-gray-400">Quality Engineer: {approvingQualityReportProject.assignedQualityEngineerName}</p>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1.5">
                Quality Head Approval Remarks *
              </label>
              <textarea
                rows={3}
                value={qualityApprovalRemarks}
                onChange={(e) => setQualityApprovalRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1.5">
                Quality Head Digital Signature *
              </label>
              <input
                type="text"
                value={qualityHeadSignature}
                onChange={(e) => setQualityHeadSignature(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-emerald-500/40 text-emerald-400 font-mono text-xs focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setApprovingQualityReportProject(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 shadow"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Grant Quality Head Approval</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 19. Manager Assign Project to Cyber Head Modal */}
      <Modal
        isOpen={!!assigningCyberHeadProject}
        onClose={() => setAssigningCyberHeadProject(null)}
        title={`Assign Project to Cyber Head - ${assigningCyberHeadProject?.projectCode || ''}`}
        maxWidth="md"
      >
        {assigningCyberHeadProject && (
          <form onSubmit={handleManagerAssignCyberHead} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-violet-400 font-bold block">{assigningCyberHeadProject.projectName}</span>
              <p className="text-gray-400">Quality Verified: {assigningCyberHeadProject.qualityReport?.testSummary?.passRate || '100%'} Pass Rate</p>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1.5">
                Select Cyber Head from EMS *
              </label>
              <select
                value={selectedCyberHeadId}
                onChange={(e) => setSelectedCyberHeadId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-violet-500/40 text-white text-xs focus:border-violet-500 focus:outline-none"
                required
              >
                <option value="">-- Choose Cyber Head --</option>
                {cyberHeadsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.employeeId}] {c.fullName} - {c.designation} ({c.department})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1">
                Detected from EMS employees with designation &apos;Cyber Head&apos; or &apos;Security Lead&apos;.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setAssigningCyberHeadProject(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black flex items-center gap-1.5 shadow"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Confirm Cyber Head Assignment</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 20. Cyber Head Assign Project to Bug Bounty Team Modal */}
      <Modal
        isOpen={!!assigningBugBountyProject}
        onClose={() => setAssigningBugBountyProject(null)}
        title={`Assign Project to Bug Bounty Specialist - ${assigningBugBountyProject?.projectCode || ''}`}
        maxWidth="md"
      >
        {assigningBugBountyProject && (
          <form onSubmit={handleCyberHeadAssignBugBounty} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-violet-400 font-bold block">{assigningBugBountyProject.projectName}</span>
              <p className="text-gray-400">Client: {assigningBugBountyProject.customerName} • Scope: {assigningBugBountyProject.departmentScope}</p>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1.5">
                Select Bug Bounty Specialist / Pentester from EMS *
              </label>
              <select
                value={selectedBugBountyId}
                onChange={(e) => setSelectedBugBountyId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-violet-500/40 text-white text-xs focus:border-violet-500 focus:outline-none"
                required
              >
                <option value="">-- Choose Bug Bounty Specialist --</option>
                {bugBountyList.map((b) => (
                  <option key={b.id} value={b.id}>
                    [{b.employeeId}] {b.fullName} - {b.designation} ({b.department})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1">
                Detected from EMS employees with designation &apos;Bug Bounty Specialist&apos; or &apos;Penetration Tester&apos;.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setAssigningBugBountyProject(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black flex items-center gap-1.5 shadow"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Assign Bug Bounty Specialist</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 21. Bug Bounty Specialist Fill & Submit Cyber Report Modal */}
      <Modal
        isOpen={!!fillingCyberReportProject}
        onClose={() => setFillingCyberReportProject(null)}
        title={`Conduct Penetration Testing & Submit Cyber Report - ${fillingCyberReportProject?.projectCode || ''}`}
        maxWidth="2xl"
      >
        {fillingCyberReportProject && cyberReportDraft && (
          <form onSubmit={handleBugBountySubmit} className="space-y-4 text-xs max-h-[80vh] overflow-y-auto pr-1">
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-violet-400 font-bold block">{fillingCyberReportProject.projectName}</span>
              <p className="text-gray-400">OWASP Top 10 Testing &amp; Ethical Bug Bounty Penetration Audit</p>
            </div>

            {/* Executive Posture */}
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-violet-400" /> 1. Security Posture &amp; Vulnerability Metrics
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">Posture Status</label>
                  <select
                    value={cyberReportDraft.executiveSummary.postureStatus}
                    onChange={(e) =>
                      setCyberReportDraft({
                        ...cyberReportDraft,
                        executiveSummary: {
                          ...cyberReportDraft.executiveSummary,
                          postureStatus: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-emerald-400 text-xs font-bold"
                  >
                    <option value="SECURE">SECURE</option>
                    <option value="MODERATE_RISK">MODERATE_RISK</option>
                    <option value="CRITICAL_ACTION_REQUIRED">CRITICAL_ACTION_REQUIRED</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Total Identified</label>
                  <input
                    type="number"
                    value={cyberReportDraft.executiveSummary.totalVulnerabilitiesFound}
                    onChange={(e) =>
                      setCyberReportDraft({
                        ...cyberReportDraft,
                        executiveSummary: { ...cyberReportDraft.executiveSummary, totalVulnerabilitiesFound: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Resolved</label>
                  <input
                    type="number"
                    value={cyberReportDraft.executiveSummary.vulnerabilitiesResolved}
                    onChange={(e) =>
                      setCyberReportDraft({
                        ...cyberReportDraft,
                        executiveSummary: { ...cyberReportDraft.executiveSummary, vulnerabilitiesResolved: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-emerald-400 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Open CVEs</label>
                  <input
                    type="number"
                    value={cyberReportDraft.executiveSummary.openVulnerabilities}
                    onChange={(e) =>
                      setCyberReportDraft({
                        ...cyberReportDraft,
                        executiveSummary: { ...cyberReportDraft.executiveSummary, openVulnerabilities: Number(e.target.value) },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-rose-400 text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* OWASP Top 10 Summary */}
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> 2. OWASP Top 10 Assessment Verification
              </h5>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {cyberReportDraft.owaspMatrix.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-950 border border-gray-800 text-[11px]">
                    <div>
                      <span className="font-bold text-white">{item.category}</span>
                      <p className="text-gray-400 text-[10px]">{item.vulnerabilityFound}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/20">
                        {item.remediationStatus}
                      </span>
                      <input
                        type="checkbox"
                        checked={item.verified}
                        onChange={(e) => {
                          const updated = [...cyberReportDraft.owaspMatrix];
                          updated[idx] = { ...updated[idx], verified: e.target.checked };
                          setCyberReportDraft({ ...cyberReportDraft, owaspMatrix: updated });
                        }}
                        className="rounded border-gray-700 text-emerald-600 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tester Sign-off & Notes */}
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" /> 3. Bug Bounty Specialist Digital Sign-Off
              </h5>
              <div>
                <label className="text-gray-400 block mb-1">Pentest Notes / Remediation Observations *</label>
                <textarea
                  rows={2}
                  value={bugBountyNotes}
                  onChange={(e) => setBugBountyNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-violet-500"
                  required
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Digital Signature (Full Name) *</label>
                <input
                  type="text"
                  value={bugBountySignature}
                  onChange={(e) => setBugBountySignature(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-violet-500/40 text-violet-300 font-mono text-xs focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setFillingCyberReportProject(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black flex items-center gap-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Report to Cyber Head</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 22. Cyber Head Review & Approve Cyber Report Modal */}
      <Modal
        isOpen={!!approvingCyberReportProject}
        onClose={() => setApprovingCyberReportProject(null)}
        title={`Review & Approve Cyber Report - ${approvingCyberReportProject?.projectCode || ''}`}
        maxWidth="md"
      >
        {approvingCyberReportProject && (
          <form onSubmit={handleCyberHeadApprove} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-violet-400 font-bold block">{approvingCyberReportProject.projectName}</span>
              <p className="text-gray-400">Bug Bounty Tester: {approvingCyberReportProject.assignedBugBountyName}</p>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1.5">
                Cyber Security Head Certification Remarks *
              </label>
              <textarea
                rows={3}
                value={cyberApprovalRemarks}
                onChange={(e) => setCyberApprovalRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-violet-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1.5">
                Cyber Head Digital Signature *
              </label>
              <input
                type="text"
                value={cyberHeadSignature}
                onChange={(e) => setCyberHeadSignature(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-emerald-500/40 text-emerald-400 font-mono text-xs focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setApprovingCyberReportProject(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 shadow"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Grant Cyber Head Certification</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 23. Manager Tri-Report Consolidation & Submit to Directorate Admin Modal */}
      <Modal
        isOpen={!!managerConsolidatingProject}
        onClose={() => setManagerConsolidatingProject(null)}
        title={`Consolidate Tri-Reports & Submit to Admin - ${managerConsolidatingProject?.projectCode || ''}`}
        maxWidth="lg"
      >
        {managerConsolidatingProject && (
          <form onSubmit={handleManagerSubmitConsolidated} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-amber-400 font-bold block">{managerConsolidatingProject.projectName}</span>
              <p className="text-gray-400">Auditing and consolidating all 3 Departmental Reports before Directorate final approval.</p>
            </div>

            {/* Tri-Report Status Checkboxes */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-gray-950 border border-emerald-500/40 text-center space-y-1">
                <Code2 className="w-5 h-5 text-cyan-400 mx-auto" />
                <span className="font-bold text-white block">1. Production</span>
                <span className="text-emerald-400 font-bold text-[10px]">✓ 4/4 Signed</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-950 border border-emerald-500/40 text-center space-y-1">
                <ShieldAlert className="w-5 h-5 text-rose-400 mx-auto" />
                <span className="font-bold text-white block">2. Quality</span>
                <span className="text-emerald-400 font-bold text-[10px]">✓ Head Approved</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-950 border border-emerald-500/40 text-center space-y-1">
                <Lock className="w-5 h-5 text-violet-400 mx-auto" />
                <span className="font-bold text-white block">3. Cyber Security</span>
                <span className="text-emerald-400 font-bold text-[10px]">✓ Certified Secure</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1.5">
                Manager Executive Consolidation Notes *
              </label>
              <textarea
                rows={3}
                value={managerConsolidationNotes}
                onChange={(e) => setManagerConsolidationNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1.5">
                Manager Digital Signature *
              </label>
              <input
                type="text"
                value={managerConsolidationSignature}
                onChange={(e) => setManagerConsolidationSignature(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-amber-500/40 text-amber-300 font-mono text-xs focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setManagerConsolidatingProject(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black flex items-center gap-1.5 shadow"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Submit Tri-Reports to Admin</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 24. Master Engineering, Quality & Project Delivery Report Modal (13 Pages across 6 Parts & 11 Designations) */}
      <MasterReportModal
        isOpen={!!masterReportProject}
        onClose={() => setMasterReportProject(null)}
        project={masterReportProject}
        currentUser={user}
        activeTab={masterReportActiveTab}
        setActiveTab={setMasterReportActiveTab}
        draft={masterReportDraft}
        onSaveSection={handleSaveMasterSection}
        signName={masterSignName}
        setSignName={setMasterSignName}
        signRole={masterSignRole}
        setSignRole={setMasterSignRole}
        signSignature={masterSignSignature}
        setSignSignature={setMasterSignSignature}
        onExportPdf={() => {
          if (masterReportProject) {
            exportMasterEngineeringReportToPdf(masterReportProject, masterReportDraft || undefined);
          }
        }}
        isAdmin={isAdmin}
        isManager={isManager}
        isQualityHead={isQualityHead}
        isCyberHead={isCyberHead}
      />
    </div>
  );
}
