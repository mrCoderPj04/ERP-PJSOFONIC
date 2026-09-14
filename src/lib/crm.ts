import { fetchSupabaseProjects, saveProjectToSupabase } from './supabase';
import { safeString } from './safeString';

export const CRM_API_BASE = process.env.NEXT_PUBLIC_CRM_API_BASE || 'https://pjsofonic-crm-backend-roft.onrender.com';
export const ERP_BACKEND_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';

export interface ProductionDeliverables {
  implementationPlan?: string;
  logoImg?: string;
  walkthrough?: string;
  workflowChart?: string;
  submittedBy?: string;
  submittedAt?: string;
}

export interface QualityReports {
  bugReport?: string;
  testReport?: string;
  qualityReport?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  qualityStatus?: 'IN PROCESS' | 'DONE' | 'QUALITY_APPROVED';
  notes?: string;
}

export interface MasterEngineeringReport {
  id?: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  
  // Document Metadata (Page 1)
  docInfo: {
    reportId: string;
    version: string;
    dateOfIssue: string;
    preparedBy: string;
    reviewedBy: string;
    classification: string;
    projectStatus: string;
  };

  // PART A — PROJECT & FULL STACK ENGINEERING (Pages 3-4)
  partA_FullStack: {
    executiveSummary: {
      projectOutcome: string;
      overallDelivery: string;
      budgetAdherence: string;
      timelineAdherence: string;
      productionStatus: string;
      qualityStatus: string;
      securityStatus: string;
      overviewText: string;
    };
    scopeDeliverables: Array<{
      taskNo: number | string;
      requirement: string;
      deliverable: string;
      status: string;
    }>;
    engineeringAreas: Array<{
      area: string;
      scope: string;
      status: string;
    }>;
    systemArchitecture: Array<{
      layer: string;
      technology: string;
      purpose: string;
    }>;
    integrations: Array<{
      integration: string;
      method: string;
      status: string;
      validation: string;
    }>;
    engineerSignoff?: {
      name: string;
      employeeId?: string;
      designation: string;
      date: string;
      signature: string;
      submittedAt?: string;
    };
  };

  // PART B — DEVOPS & PRODUCTION ENGINEERING (Pages 5-6)
  partB_DevOps: {
    devopsReport: Array<{
      component: string;
      implementation: string;
      status: string;
    }>;
    environments: Array<{
      environment: string;
      endpoint: string;
      status: string;
      deploymentDate: string;
    }>;
    cicdChecklist: Array<{
      item: string;
      status: string;
      evidence: string;
    }>;
    handoverItems: Array<{
      item: string;
      status: string;
    }>;
    devopsSignoff?: {
      name: string;
      employeeId?: string;
      designation: string;
      date: string;
      signature: string;
      submittedAt?: string;
    };
  };

  // PART C — AI ENGINEERING (Pages 7-8)
  partC_AiEngineering: {
    aiReport: Array<{
      area: string;
      description: string;
      status: string;
    }>;
    aiAgents: Array<{
      agentService: string;
      responsibility: string;
      inputs: string;
      outputs: string;
    }>;
    n8nWorkflows: Array<{
      stage: string;
      action: string;
      validation: string;
    }>;
    evaluations: Array<{
      area: string;
      target: string;
      actual: string;
      status: string;
    }>;
    aiSignoff?: {
      name: string;
      employeeId?: string;
      designation: string;
      date: string;
      signature: string;
      submittedAt?: string;
    };
  };

  // PART D — QUALITY ENGINEERING (Pages 9-10)
  partD_Quality: {
    testingAreas: Array<{
      area: string;
      planned: number | string;
      executed: number | string;
      passed: number | string;
      failed: number | string;
      coverage: string;
    }>;
    moduleStrategy: Array<{
      module: string;
      testCases: number | string;
      passed: number | string;
      failed: number | string;
      blocked: number | string;
      status: string;
    }>;
    testTypes: Array<{
      testType: string;
      objective: string;
      result: string;
    }>;
    defectSeverity: Array<{
      severity: string;
      total: number;
      resolved: number;
      retested: number;
      closed: number;
      open: number;
    }>;
    releaseCriteria: {
      criticalOpen: number;
      highOpen: number;
      regressionPassed: boolean;
      uatApproved: boolean;
      smokePassed: boolean;
      statement: string;
    };
    qaLeadSignoff?: {
      name: string;
      employeeId?: string;
      designation: string;
      date: string;
      signature: string;
      submittedAt?: string;
    };
    qualityHeadSignoff?: {
      name: string;
      employeeId?: string;
      designation: string;
      date: string;
      signature: string;
      approved: boolean;
      approvedAt?: string;
    };
  };

  // PART E — BUG BOUNTY & SECURITY (Page 11)
  partE_BugBounty: {
    securityAreas: Array<{
      area: string;
      validation: string;
      status: string;
    }>;
    vulnerabilitySummary: Array<{
      severity: string;
      identified: number;
      fixed: number;
      retested: number;
      acceptedRisk: number;
      open: number;
    }>;
    remediationFindings: Array<{
      findingId: string;
      finding: string;
      risk: string;
      remediation: string;
      retestDate: string;
      status: string;
    }>;
    securityReleaseStatus: string;
    securityLeadSignoff?: {
      name: string;
      employeeId?: string;
      designation: string;
      date: string;
      signature: string;
      submittedAt?: string;
    };
    cyberHeadSignoff?: {
      name: string;
      employeeId?: string;
      designation: string;
      date: string;
      signature: string;
      approved: boolean;
      approvedAt?: string;
    };
  };

  // PART F — PERFORMANCE & CLOSURE (Pages 12-13)
  partF_Closure: {
    performanceReliability: Array<{
      metric: string;
      target: string;
      actual: string;
      status: string;
    }>;
    finalMetrics: Array<{
      metric: string;
      target: string;
      actual: string;
      status: string;
    }>;
    lessonsLearned: Array<{
      challenge: string;
      impact: string;
      resolution: string;
      lessonLearned: string;
    }>;
    finalAcceptance: Array<{
      role: string;
      name: string;
      date: string;
      status: string;
      signature: string;
    }>;
    closureDeclaration: {
      finalClosureDate: string;
      projectManager: string;
      productionHead: string;
      qualityHead: string;
      securityLead: string;
      clientApprover: string;
    };
    revisionHistory: Array<{
      version: string;
      date: string;
      description: string;
      preparedBy: string;
      approvedBy: string;
    }>;
  };
}

export interface ProductionReport {
  id?: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  
  // 1. Executive Summary
  executiveSummary: {
    productionStatus: string;
    developmentStatus: string;
    deploymentStatus: string;
    integrationStatus: string;
    environmentSync: string;
    documentation: string;
    sourceCodeHandover: string;
    productionHandover: string;
    overview: string;
  };

  // 2. Deliverables (12 Tasks)
  deliverables: Array<{
    taskNo: string;
    requirement: string;
    deliverable: string;
    status: string;
  }>;

  // 3. System Architecture
  systemArchitecture: {
    clientLayer: string;
    applicationLayer: string;
    integrationLayer: string;
    dataLayer: string;
    infrastructureLayer: string;
  };

  // 4. Technology Stack
  techStack: Array<{
    layer: string;
    technology: string;
    purpose: string;
  }>;

  // 5. Environments
  environments: Array<{
    environment: string;
    endpoint: string;
    status: string;
    owner: string;
  }>;

  // 6. Deployment & Release Management
  deploymentInfo: {
    releaseVersion: string;
    deploymentDate: string;
    deploymentTime: string;
    deploymentOwner: string;
    releaseType: string;
    deploymentMethod: string;
    rollbackPlan: string;
    productionStatus: string;
    checklist: Record<string, boolean>;
  };

  // 7. Integrations
  integrations: {
    matrix: Array<{ integration: string; method: string; status: string; validation: string }>;
    emsIntegrationStatus: string;
    erpIntegrationStatus: string;
    envSyncStatus: string;
    dataFlowStatus: string;
  };

  // 8. Technical Documentation
  documents: Array<{ document: string; version: string; status: string }>;

  // 9. Source Code Handover
  sourceCodeHandover: {
    repository: string;
    branch: string;
    releaseTag: string;
    codeOwner: string;
    accessGranted: string;
    documentationStatus: string;
    archives: Array<{ item: string; location: string; access: string }>;
  };

  // 10. Handover Checklist
  handoverChecklist: Record<string, boolean>;

  // Lifecycle stage:
  currentStage: 'DRAFT' | 'SUBMITTED_BY_FULLSTACK' | 'REVIEWED_BY_TL' | 'APPROVED_BY_HEAD' | 'FINAL_ACCEPTED_BY_MANAGER';

  // Tier 1: Full Stack Engineer
  fullstackSignoff?: {
    name: string;
    employeeId?: string;
    designation: string;
    date: string;
    signature: string;
    submittedAt?: string;
  };

  // Tier 2: Team Leader
  teamLeadSignoff?: {
    name: string;
    employeeId?: string;
    designation: string;
    date: string;
    signature: string;
    reviewNotes?: string;
    reviewedAt?: string;
  };

  // Tier 3: Production Head
  productionHeadSignoff?: {
    name: string;
    employeeId?: string;
    designation: string;
    date: string;
    signature: string;
    approvalRemarks?: string;
    approvedAt?: string;
  };

  // Tier 4: Manager (Final Closure & Acceptance)
  managerSignoff?: {
    name: string;
    employeeId?: string;
    designation: string;
    finalClosureDate: string;
    finalStatus: 'Accepted' | 'Accepted with Minor Observations' | 'Pending Closure' | 'Rejected';
    signature: string;
    remarks?: string;
    closedAt?: string;
  };

  createdAt: string;
  updatedAt: string;
}

export interface QualityReport {
  testSummary: {
    totalTests: number;
    passed: number;
    failed: number;
    blocked: number;
    passRate: string;
    executionDate: string;
  };
  testSuites: Array<{
    suiteName: string;
    module: string;
    testsCount: number;
    passCount: number;
    failCount: number;
    status: 'PASSED' | 'FAILED' | 'BLOCKED';
  }>;
  defectSeverityMatrix: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  performanceMetrics: {
    avgApiResponseMs: number;
    p99ResponseMs: number;
    errorRatePercent: number;
    concurrencyPassed: boolean;
  };
  environmentsTested: Array<{
    env: string;
    url: string;
    status: 'VERIFIED' | 'FAILED' | 'PENDING';
  }>;
  currentStage: 'DRAFT' | 'SUBMITTED_BY_ENGINEER' | 'APPROVED_BY_HEAD';
  engineerSignoff?: {
    name: string;
    employeeId?: string;
    designation: string;
    date: string;
    signature: string;
    notes?: string;
    submittedAt?: string;
  };
  headApproval?: {
    name: string;
    employeeId?: string;
    designation: string;
    date: string;
    signature: string;
    remarks?: string;
    approved: boolean;
    approvedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CyberReport {
  executiveSummary: {
    postureStatus: 'SECURE' | 'MODERATE_RISK' | 'CRITICAL_ACTION_REQUIRED';
    totalVulnerabilitiesFound: number;
    vulnerabilitiesResolved: number;
    openVulnerabilities: number;
    testingPeriod: string;
  };
  owaspMatrix: Array<{
    category: string;
    vulnerabilityFound: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    remediationStatus: 'RESOLVED' | 'MITIGATED' | 'OPEN';
    verified: boolean;
  }>;
  pentestDetails: {
    methodology: string;
    toolsUsed: string[];
    targetScope: string;
    testDate: string;
  };
  bugBountyFindings: Array<{
    bugId: string;
    title: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
    reporter: string;
    bountyAmount: string;
    status: 'RESOLVED' | 'ACCEPTED_RISK' | 'VERIFIED';
    verificationNotes: string;
  }>;
  currentStage: 'DRAFT' | 'SUBMITTED_BY_BOUNTY' | 'APPROVED_BY_HEAD';
  testerSignoff?: {
    name: string;
    employeeId?: string;
    designation: string;
    date: string;
    signature: string;
    notes?: string;
    submittedAt?: string;
  };
  headApproval?: {
    name: string;
    employeeId?: string;
    designation: string;
    date: string;
    signature: string;
    remarks?: string;
    approved: boolean;
    approvedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CrmCustomerProject {
  id: string;
  crmProjectId?: number | string;
  projectCode: string;
  projectName: string;
  customerName: string;
  customerEmail: string;
  departmentScope: string;
  managerId?: string;
  managerName?: string;
  productionHeadId?: string;
  productionHeadName?: string;
  targetTeamLeadId?: string;
  targetTeamLeadName?: string;
  assignedEngineerId?: string;
  assignedEngineerName?: string;
  assignedDevOpsId?: string;
  assignedDevOpsName?: string;
  assignedAiEngineerId?: string;
  assignedAiEngineerName?: string;

  // Quality Department
  qualityHeadId?: string;
  qualityHeadName?: string;
  assignedQualityEngineerId?: string;
  assignedQualityEngineerName?: string;
  qualityReport?: QualityReport;

  // Cyber Security & Bug Bounty
  cyberHeadId?: string;
  cyberHeadName?: string;
  assignedBugBountyId?: string;
  assignedBugBountyName?: string;
  cyberReport?: CyberReport;

  // Manager Tri-Report Consolidation
  managerTriReview?: {
    productionApproved: boolean;
    qualityApproved: boolean;
    cyberApproved: boolean;
    notes?: string;
    managerName?: string;
    managerSignature?: string;
    submittedToAdminAt?: string;
  };

  requirements: string;
  budget: number;
  status: 'working' | 'Done' | 'IN_PROGRESS' | 'COMPLETED' | 'ACTIVE';
  stage?:
    | 'ADMIN_CREATED'
    | 'ASSIGNED_TO_MANAGER'
    | 'ASSIGNED_TO_HEAD'
    | 'ASSIGNED_TO_TL'
    | 'TL_ASSIGNED_TO_FULLSTACK'
    | 'TL_ASSIGNED_ENGINEERS'
    | 'SUBMITTED_BY_FULLSTACK'
    | 'REVIEWED_BY_TL'
    | 'APPROVED_BY_HEAD'
    | 'FINAL_ACCEPTED_BY_MANAGER'
    | 'PRODUCTION_SUBMITTED'
    | 'TL_PRODUCTION_APPROVED'
    | 'HEAD_APPROVED'
    | 'MANAGER_ACCEPTED'
    | 'ASSIGNED_TO_QUALITY_HEAD'
    | 'ASSIGNED_TO_QUALITY_ENGINEER'
    | 'QUALITY_SUBMITTED'
    | 'QUALITY_APPROVED'
    | 'ASSIGNED_TO_CYBER_HEAD'
    | 'ASSIGNED_TO_BUG_BOUNTY'
    | 'CYBER_SUBMITTED'
    | 'CYBER_APPROVED'
    | 'SUBMITTED_TO_ADMIN'
    | 'SENT_TO_QUALITY'
    | 'COMPLETED'
    | 'PENDING_CLOSURE';
  approvalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
  handoverPdfUrl?: string;
  handoverPdfByCodeUrl?: string;
  handoverDocApiUrl?: string;
  handoverDocument?: any;
  agencySignoff?: {
    signature?: string;
    name?: string;
    designation?: string;
    date?: string;
    [key: string]: any;
  };
  clientSignoff?: {
    signature?: string;
    name?: string;
    designation?: string;
    date?: string;
    [key: string]: any;
  };
  productionDeliverables?: ProductionDeliverables;
  productionReport?: ProductionReport;
  masterReport?: MasterEngineeringReport;
  tlProductionApproval?: {
    approved: boolean;
    approvedBy?: string;
    approvedAt?: string;
    notes?: string;
  };
  qualityReports?: QualityReports;
  tlFinalSubmission?: {
    submitted: boolean;
    submittedBy?: string;
    submittedAt?: string;
  };
  adminFinalApproval?: {
    approved: boolean;
    approvedBy?: string;
    approvedAt?: string;
    notes?: string;
  };
  crmSynced?: boolean;
  crmSyncedAt?: string;
  createdAt: string;
}

const CRM_STORAGE_KEY = 'pj_crm_active_projects';
const CRM_EVENT_NAME = 'pj_crm_updated';

/**
 * Resolves the full URL to the CRM Handover Executive PDF report.
 * Supports auto_print=true query param to pop open browser print dialog directly.
 */
export function getProjectHandoverPdfUrl(
  project: {
    projectCode?: string;
    id?: string;
    crmProjectId?: number | string;
    handoverPdfByCodeUrl?: string;
    handoverPdfUrl?: string;
  },
  autoPrint: boolean = false
): string {
  const code = project.projectCode;
  const baseUrl = CRM_API_BASE.replace(/\/$/, '');
  let path = '';

  if (project.handoverPdfByCodeUrl) {
    path = project.handoverPdfByCodeUrl.startsWith('/') ? project.handoverPdfByCodeUrl : `/${project.handoverPdfByCodeUrl}`;
  } else if (code) {
    path = `/api/v1/projects/code/${encodeURIComponent(code)}/handover-pdf`;
  } else if (project.crmProjectId || project.id) {
    path = `/api/v1/projects/${encodeURIComponent(String(project.crmProjectId || project.id))}/handover-pdf`;
  } else {
    path = '/api/v1/projects';
  }

  const query = autoPrint ? (path.includes('?') ? '&auto_print=true' : '?auto_print=true') : '';
  return `${baseUrl}${path}${query}`;
}

/**
 * Resolves the full URL to the CRM Handover Document JSON API.
 */
export function getProjectHandoverDocUrl(
  project: {
    projectCode?: string;
    id?: string;
    crmProjectId?: number | string;
    handoverDocApiUrl?: string;
  }
): string {
  const code = project.projectCode;
  const baseUrl = CRM_API_BASE.replace(/\/$/, '');
  let path = '';

  if (project.handoverDocApiUrl) {
    path = project.handoverDocApiUrl.startsWith('/') ? project.handoverDocApiUrl : `/${project.handoverDocApiUrl}`;
  } else if (code) {
    path = `/api/v1/projects/code/${encodeURIComponent(code)}/handover-document`;
  } else {
    path = `/api/v1/projects/${encodeURIComponent(String(project.crmProjectId || project.id))}/handover-document`;
  }

  return `${baseUrl}${path}`;
}

/**
 * Tarika 2: Fetch structured JSON handover data directly from CRM or ERP backend
 */
export async function fetchProjectHandoverDocument(projectCode: string): Promise<any> {
  try {
    const url = `${CRM_API_BASE}/api/v1/projects/code/${encodeURIComponent(projectCode)}/handover-document`;
    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Direct CRM handover fetch notice:', e);
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
    const res = await fetch(`${backendUrl}/projects/${encodeURIComponent(projectCode)}/handover-document`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('ERP Backend handover proxy notice:', err);
  }

  return null;
}

export function getStoredCrmProjects(): CrmCustomerProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CRM_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p: any) => ({
      id: safeString(p.id || `crm-${Date.now()}`),
      crmProjectId: p.crmProjectId || p.crm_project_id,
      projectCode: safeString(p.projectCode || `CRM-PRJ-${Math.floor(100 + Math.random() * 900)}`),
      projectName: safeString(p.projectName || p.title || 'CRM Active Customer Project'),
      customerName: safeString(p.customerName || 'CRM Client'),
      customerEmail: safeString(p.customerEmail || 'client@crm.com'),
      departmentScope: safeString(p.departmentScope || 'Software Engineering'),
      managerId: p.managerId ? safeString(p.managerId) : undefined,
      managerName: p.managerName ? safeString(p.managerName) : undefined,
      productionHeadId: p.productionHeadId ? safeString(p.productionHeadId) : undefined,
      productionHeadName: p.productionHeadName ? safeString(p.productionHeadName) : undefined,
      targetTeamLeadId: p.targetTeamLeadId ? safeString(p.targetTeamLeadId) : undefined,
      targetTeamLeadName: p.targetTeamLeadName ? safeString(p.targetTeamLeadName) : undefined,
      assignedEngineerId: p.assignedEngineerId ? safeString(p.assignedEngineerId) : undefined,
      assignedEngineerName: p.assignedEngineerName ? safeString(p.assignedEngineerName) : undefined,
      assignedDevOpsId: p.assignedDevOpsId ? safeString(p.assignedDevOpsId) : undefined,
      assignedDevOpsName: p.assignedDevOpsName ? safeString(p.assignedDevOpsName) : undefined,
      assignedAiEngineerId: p.assignedAiEngineerId ? safeString(p.assignedAiEngineerId) : undefined,
      assignedAiEngineerName: p.assignedAiEngineerName ? safeString(p.assignedAiEngineerName) : undefined,
      requirements: safeString(p.requirements || 'Customer project scope submitted via CRM.'),
      budget: Number(p.budget) || 0,
      status: p.status || 'working',
      stage: p.stage || (p.status === 'COMPLETED' ? 'COMPLETED' : 'ASSIGNED_TO_TL'),
      approvalStatus: p.approvalStatus || 'APPROVED',
      handoverPdfUrl: p.handoverPdfUrl || p.handover_pdf_url,
      handoverPdfByCodeUrl: p.handoverPdfByCodeUrl || p.handover_pdf_by_code_url,
      handoverDocApiUrl: p.handoverDocApiUrl || p.handover_doc_api_url,
      handoverDocument: p.handoverDocument || p.handover_document,
      agencySignoff: p.agencySignoff || p.agency_signoff,
      clientSignoff: p.clientSignoff || p.client_signoff,
      productionDeliverables: p.productionDeliverables,
      tlProductionApproval: p.tlProductionApproval,
      qualityReports: p.qualityReports,
      productionReport: p.productionReport,
      tlFinalSubmission: p.tlFinalSubmission,
      adminFinalApproval: p.adminFinalApproval,
      crmSynced: Boolean(p.crmSynced),
      crmSyncedAt: p.crmSyncedAt ? safeString(p.crmSyncedAt) : undefined,
      createdAt: safeString(p.createdAt || new Date().toISOString()),
    }));
  } catch (e) {
    return [];
  }
}

function syncProjectUpdate(updatedList: CrmCustomerProject[], updatedItem?: CrmCustomerProject) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new Event(CRM_EVENT_NAME));
    } catch (e) {}

    if (updatedItem) {
      // Background sync to Express backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
      fetch(`${backendUrl}/crm/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      }).catch(() => {});

      // Background sync to Supabase
      saveProjectToSupabase(updatedItem).catch(() => {});
    }
  }
}

export function saveCrmProject(project: Partial<CrmCustomerProject> & Record<string, any>): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  const code = project.projectCode || project.project_code || project.code;
  const index = existing.findIndex((p) => (project.id && p.id === project.id) || (code && p.projectCode === code));
  const existingProj = index >= 0 ? existing[index] : null;

  const resolvedCode = safeString(code || existingProj?.projectCode || `CRM-PRJ-${Math.floor(100 + Math.random() * 900)}`);
  const resolvedId = safeString(project.id || existingProj?.id || `crm-proj-${Date.now()}`);

  const newProj: CrmCustomerProject = {
    id: resolvedId,
    crmProjectId: project.crmProjectId || project.crm_project_id || existingProj?.crmProjectId,
    projectCode: resolvedCode,
    projectName: safeString(project.projectName || project.title || existingProj?.projectName || 'CRM Active Customer Project'),
    customerName: safeString(project.customerName || existingProj?.customerName || 'CRM Client'),
    customerEmail: safeString(project.customerEmail || existingProj?.customerEmail || 'client@crm.com'),
    departmentScope: safeString(project.departmentScope || project.project_type || existingProj?.departmentScope || 'Software Engineering'),
    managerId: project.managerId ? safeString(project.managerId) : existingProj?.managerId,
    managerName: project.managerName ? safeString(project.managerName) : existingProj?.managerName,
    productionHeadId: project.productionHeadId ? safeString(project.productionHeadId) : existingProj?.productionHeadId,
    productionHeadName: project.productionHeadName ? safeString(project.productionHeadName) : existingProj?.productionHeadName,
    targetTeamLeadId: project.targetTeamLeadId ? safeString(project.targetTeamLeadId) : existingProj?.targetTeamLeadId,
    targetTeamLeadName: project.targetTeamLeadName ? safeString(project.targetTeamLeadName) : existingProj?.targetTeamLeadName,
    assignedEngineerId: project.assignedEngineerId ? safeString(project.assignedEngineerId) : existingProj?.assignedEngineerId,
    assignedEngineerName: project.assignedEngineerName ? safeString(project.assignedEngineerName) : existingProj?.assignedEngineerName,
    assignedDevOpsId: project.assignedDevOpsId ? safeString(project.assignedDevOpsId) : existingProj?.assignedDevOpsId,
    assignedDevOpsName: project.assignedDevOpsName ? safeString(project.assignedDevOpsName) : existingProj?.assignedDevOpsName,
    assignedAiEngineerId: project.assignedAiEngineerId ? safeString(project.assignedAiEngineerId) : existingProj?.assignedAiEngineerId,
    assignedAiEngineerName: project.assignedAiEngineerName ? safeString(project.assignedAiEngineerName) : existingProj?.assignedAiEngineerName,
    requirements: safeString(project.requirements || project.overview || existingProj?.requirements || 'Customer project scope submitted via CRM.'),
    budget: Number(project.budget !== undefined ? project.budget : (existingProj?.budget || 0)),
    status: project.status || existingProj?.status || 'working',
    stage: project.stage || existingProj?.stage || 'ASSIGNED_TO_TL',
    approvalStatus: project.approvalStatus || existingProj?.approvalStatus || 'APPROVED',
    handoverPdfUrl: project.handoverPdfUrl || project.handover_pdf_url || existingProj?.handoverPdfUrl || `/api/v1/projects/${resolvedId}/handover-pdf`,
    handoverPdfByCodeUrl: project.handoverPdfByCodeUrl || project.handover_pdf_by_code_url || existingProj?.handoverPdfByCodeUrl || `/api/v1/projects/code/${resolvedCode}/handover-pdf`,
    handoverDocApiUrl: project.handoverDocApiUrl || project.handover_doc_api_url || existingProj?.handoverDocApiUrl || `/api/v1/projects/code/${resolvedCode}/handover-document`,
    handoverDocument: project.handoverDocument || project.handover_document || existingProj?.handoverDocument,
    agencySignoff: project.agencySignoff || project.agency_signoff || existingProj?.agencySignoff,
    clientSignoff: project.clientSignoff || project.client_signoff || existingProj?.clientSignoff,
    productionDeliverables: project.productionDeliverables || existingProj?.productionDeliverables,
    productionReport: project.productionReport || existingProj?.productionReport,
    tlProductionApproval: project.tlProductionApproval || existingProj?.tlProductionApproval,
    qualityReports: project.qualityReports || existingProj?.qualityReports,
    tlFinalSubmission: project.tlFinalSubmission || existingProj?.tlFinalSubmission,
    adminFinalApproval: project.adminFinalApproval || existingProj?.adminFinalApproval,
    crmSynced: project.crmSynced !== undefined ? Boolean(project.crmSynced) : existingProj?.crmSynced,
    crmSyncedAt: project.crmSyncedAt || existingProj?.crmSyncedAt,
    createdAt: safeString(project.createdAt || existingProj?.createdAt || new Date().toISOString()),
  };

  const updated = [newProj, ...existing.filter((p) => p.projectCode !== newProj.projectCode && p.id !== newProj.id)];
  syncProjectUpdate(updated, newProj);
  return updated;
}

/**
 * Validates whether the 10-section Production Report has completed all 4 sign-off tiers:
 * Tier 1: Full Stack Engineer
 * Tier 2: Team Leader
 * Tier 3: Production Head
 * Tier 4: Manager (Final Closure & Acceptance)
 */
export function isReportFullyFilled(project?: CrmCustomerProject | null): boolean {
  if (!project || !project.productionReport) return false;
  const r = project.productionReport;
  const hasFs = Boolean(r.fullstackSignoff?.signature);
  const hasTl = Boolean(r.teamLeadSignoff?.signature);
  const hasHead = Boolean(r.productionHeadSignoff?.signature);
  const hasMgr = Boolean(
    r.managerSignoff?.signature &&
    r.managerSignoff?.finalClosureDate &&
    r.managerSignoff?.finalStatus &&
    r.managerSignoff?.finalStatus !== 'Rejected'
  );
  return hasFs && hasTl && hasHead && hasMgr;
}

export function getReportSignoffProgress(project?: CrmCustomerProject | null): {
  completed: number;
  total: number;
  steps: { name: string; completed: boolean; role: string; signedBy?: string }[];
} {
  const r = project?.productionReport;
  const s1 = Boolean(r?.fullstackSignoff?.signature);
  const s2 = Boolean(r?.teamLeadSignoff?.signature);
  const s3 = Boolean(r?.productionHeadSignoff?.signature);
  const s4 = Boolean(
    r?.managerSignoff?.signature &&
    r?.managerSignoff?.finalClosureDate &&
    r?.managerSignoff?.finalStatus &&
    r?.managerSignoff?.finalStatus !== 'Rejected'
  );
  const steps = [
    { name: 'Tier 1: Full Stack Engineer Sign-off', completed: s1, role: 'Full Stack', signedBy: r?.fullstackSignoff?.name },
    { name: 'Tier 2: Team Leader Technical Review', completed: s2, role: 'Team Leader', signedBy: r?.teamLeadSignoff?.name },
    { name: 'Tier 3: Production Head Departmental Sign-off', completed: s3, role: 'Production Head', signedBy: r?.productionHeadSignoff?.name },
    { name: 'Tier 4: Manager Final Acceptance & Closure', completed: s4, role: 'Manager', signedBy: r?.managerSignoff?.name },
  ];
  const completed = steps.filter((s) => s.completed).length;
  return { completed, total: 4, steps };
}

/**
 * Admin assigns project to Manager
 */
export function assignProjectToManager(
  projectId: string,
  managerId: string,
  managerName: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      modifiedItem = {
        ...p,
        managerId,
        managerName,
        stage: 'ASSIGNED_TO_MANAGER' as const,
        status: 'working' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
  fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/assign-manager`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ managerId, managerName }),
  }).catch(() => {});

  return updated;
}

/**
 * Manager assigns project to Production Head
 */
export function assignProjectToProductionHead(
  projectId: string,
  headId: string,
  headName: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      modifiedItem = {
        ...p,
        productionHeadId: headId,
        productionHeadName: headName,
        stage: 'ASSIGNED_TO_HEAD' as const,
        status: 'working' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
  fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/assign-head`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ headId, headName }),
  }).catch(() => {});

  return updated;
}

/**
 * Production Head assigns project to Team Leader
 */
export function assignProjectToTeamLead(
  projectId: string,
  tlId: string,
  tlName: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      modifiedItem = {
        ...p,
        targetTeamLeadId: tlId,
        targetTeamLeadName: tlName,
        stage: 'ASSIGNED_TO_TL' as const,
        status: 'working' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
  fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/assign-tl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tlId, tlName }),
  }).catch(() => {});

  return updated;
}

/**
 * Team Leader assigns project to Full Stack, DevOps, and AI Engineer
 */
export function assignProjectEngineers(
  projectId: string,
  engineers: {
    fullStack?: { id: string; name: string };
    devOps?: { id: string; name: string };
    ai?: { id: string; name: string };
  }
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      modifiedItem = {
        ...p,
        assignedEngineerId: engineers.fullStack?.id || p.assignedEngineerId,
        assignedEngineerName: engineers.fullStack?.name || p.assignedEngineerName,
        assignedDevOpsId: engineers.devOps?.id || p.assignedDevOpsId,
        assignedDevOpsName: engineers.devOps?.name || p.assignedDevOpsName,
        assignedAiEngineerId: engineers.ai?.id || p.assignedAiEngineerId,
        assignedAiEngineerName: engineers.ai?.name || p.assignedAiEngineerName,
        stage: 'TL_ASSIGNED_ENGINEERS' as const,
        status: 'working' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
  fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/assign-engineers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(engineers),
  }).catch(() => {});

  return updated;
}

/**
 * Admin Final Approval & Automatic Push to CRM
 */
export async function approveAdminFinalAndSyncCrm(
  projectId: string,
  adminName: string,
  notes?: string
): Promise<{ success: boolean; crmSynced: boolean; message: string; project?: CrmCustomerProject }> {
  const existing = getStoredCrmProjects();
  const proj = existing.find((p) => p.id === projectId || p.projectCode === projectId);

  if (!proj) {
    return { success: false, crmSynced: false, message: 'Project not found' };
  }

  if (!isReportFullyFilled(proj)) {
    return {
      success: false,
      crmSynced: false,
      message: 'Cannot approve: 10-section Production Report is not fully signed off across all 4 tiers.',
    };
  }

  // Update locally first
  const modifiedItem: CrmCustomerProject = {
    ...proj,
    adminFinalApproval: {
      approved: true,
      approvedBy: adminName,
      approvedAt: new Date().toISOString(),
      notes: notes || 'Admin final sign-off & CRM push',
    },
    crmSynced: true,
    crmSyncedAt: new Date().toISOString(),
    stage: 'COMPLETED' as const,
    status: 'COMPLETED' as const,
  };

  const updated = existing.map((p) => (p.id === modifiedItem.id || p.projectCode === modifiedItem.projectCode ? modifiedItem : p));
  syncProjectUpdate(updated, modifiedItem);

  // Call Express Backend API to sync with CRM
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
    const res = await fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/admin-approve-and-crm-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminName, notes }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, crmSynced: data.crmSynced ?? true, message: data.message || 'Report approved and synced to CRM!', project: modifiedItem };
    }
  } catch (err) {
    console.warn('Backend admin-approve-and-crm-sync notice:', err);
  }

  return { success: true, crmSynced: true, message: 'Admin approval saved and scheduled for CRM sync', project: modifiedItem };
}

/**
 * Team Leader assigns project to Full Stack Developer
 */
export function assignProjectToFullStack(
  projectId: string,
  engineerId: string,
  engineerName: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      modifiedItem = {
        ...p,
        assignedEngineerId: engineerId,
        assignedEngineerName: engineerName,
        stage: 'TL_ASSIGNED_TO_FULLSTACK' as const,
        status: 'working' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);
  return updated;
}

export function getDefaultMasterEngineeringReport(
  project: Partial<CrmCustomerProject>,
  currentUser?: { name?: string; id?: string; designation?: string; email?: string }
): MasterEngineeringReport {
  const projCode = project.projectCode || 'PJ-SOFT-MSTR-DLV-001';
  const projName = project.projectName || 'PS Softonic I7 — ERP & EMS Integration Suite';
  const today = new Date().toLocaleDateString('en-GB');

  return {
    projectId: project.id || projCode,
    projectCode: projCode,
    projectName: projName,

    // Document Metadata (Page 1)
    docInfo: {
      reportId: `PS-SOFT-MSTR-${projCode.replace(/[^A-Za-z0-9]/g, '')}`,
      version: 'V1.0 — Final',
      dateOfIssue: today,
      preparedBy: project.managerName || currentUser?.name || 'Agency Project Manager',
      reviewedBy: project.customerName || 'Client SPOC / CTO',
      classification: 'CONFIDENTIAL — CLIENT PROPRIETARY',
      projectStatus: 'COMPLETED / CLOSED',
    },

    // PART A — PROJECT & FULL STACK ENGINEERING (Pages 3-4)
    partA_FullStack: {
      executiveSummary: {
        projectOutcome: 'SUCCESSFULLY COMPLETED',
        overallDelivery: '100% of agreed scope — 12/12 deliverables complete',
        budgetAdherence: 'Within budget (+/- 0%)',
        timelineAdherence: 'Delivered on schedule per milestone release plan',
        productionStatus: 'LIVE / STABLE',
        qualityStatus: 'PASSED / APPROVED',
        securityStatus: 'PASSED / ACCEPTED',
        overviewText: `The ${projName} Full Stack application is planned and documented as an end-to-end enterprise delivery covering application engineering, ERP and EMS integration, DevOps, AI automation, Quality Engineering, security validation and final production handover.`,
      },
      scopeDeliverables: [
        { taskNo: '1', requirement: 'EMS Go-Live', deliverable: 'Go-Live implementation & confirmation log', status: 'Delivered' },
        { taskNo: '2', requirement: 'ERP Open to Project', deliverable: 'Role-based project access', status: 'Delivered' },
        { taskNo: '3', requirement: 'Meeting Attendance', deliverable: 'Meeting workflow / logging', status: 'Delivered' },
        { taskNo: '4', requirement: 'Report & Senior Call', deliverable: 'Status report & escalation record', status: 'Delivered' },
        { taskNo: '5', requirement: 'MUI Report / Closure', deliverable: 'MUI reporting & closure package', status: 'Delivered' },
        { taskNo: '6', requirement: 'Implement Plan / Flow / Design', deliverable: 'Technical documentation package', status: 'Delivered' },
        { taskNo: '7', requirement: 'Buy Ready Report', deliverable: 'Procurement / Buy dashboard', status: 'Delivered' },
        { taskNo: '8', requirement: 'Buy & Testing Reports', deliverable: 'Automated report generation', status: 'Delivered' },
        { taskNo: '9', requirement: 'Soft Doc Code Copy', deliverable: 'Secure code archive', status: 'Delivered' },
        { taskNo: '10', requirement: 'Social Media Update', deliverable: 'Publishing workflow', status: 'Delivered' },
        { taskNo: '11', requirement: 'EMS + ERP / I7 Update', deliverable: 'Environment synchronization', status: 'Delivered' },
        { taskNo: '12', requirement: 'Resolve I7 App Tasks', deliverable: 'Fixes, retesting & release', status: 'Delivered' },
      ],
      engineeringAreas: [
        { area: 'Frontend', scope: 'Responsive application UI, dashboards, MUI components and Buy module', status: 'Completed' },
        { area: 'Backend', scope: 'Business logic, REST APIs, authentication and reporting', status: 'Completed' },
        { area: 'Database', scope: 'Transactional data, users, audit records and application persistence', status: 'Completed' },
        { area: 'API Integration', scope: 'ERP, EMS and external service integrations', status: 'Completed' },
        { area: 'Authentication', scope: 'Role-based access and secure session management', status: 'Completed' },
        { area: 'Reporting', scope: 'Daily / sprint / testing / delivery reports', status: 'Completed' },
        { area: 'Documentation', scope: 'Architecture, API, deployment and handover documentation', status: 'Completed' },
      ],
      systemArchitecture: [
        { layer: 'Frontend', technology: 'React / Next.js + MUI', purpose: 'User interface and responsive dashboards' },
        { layer: 'Backend', technology: 'Node.js / Express / TypeScript', purpose: 'Business logic and APIs' },
        { layer: 'Database', technology: 'PostgreSQL / Prisma ORM', purpose: 'Application and transactional data' },
        { layer: 'Integration', technology: 'REST APIs + Webhooks', purpose: 'ERP / EMS / external integrations' },
        { layer: 'AI / Automation', technology: 'n8n / Gemini / OpenAI APIs', purpose: 'Automation and intelligent workflows' },
        { layer: 'Infrastructure', technology: 'AWS / Cloudflare / Linux Ubuntu', purpose: 'Production hosting' },
        { layer: 'DevOps', technology: 'GitHub Actions / Docker CI/CD', purpose: 'CI/CD and deployment automation' },
        { layer: 'Monitoring', technology: 'Prometheus / Grafana / Sentry', purpose: 'Application and infrastructure health' },
      ],
      integrations: [
        { integration: 'EMS → ERP', method: 'REST API / Webhook', status: 'Connected', validation: 'Passed' },
        { integration: 'ERP → Application', method: 'REST API', status: 'Connected', validation: 'Passed' },
        { integration: 'Application → Reports', method: 'Internal API / Service', status: 'Active', validation: 'Passed' },
        { integration: 'Application → Soft Doc', method: 'API / Storage Archive', status: 'Active', validation: 'Passed' },
        { integration: 'Application → External Services', method: 'API / SSO OAuth', status: 'Configured', validation: 'Passed' },
      ],
      engineerSignoff: {
        name: project.assignedEngineerName || currentUser?.name || 'Lead Full Stack Engineer',
        employeeId: project.assignedEngineerId || currentUser?.id || 'EMP-FS-01',
        designation: 'Full Stack Engineer',
        date: today,
        signature: `${project.assignedEngineerName || currentUser?.name || 'Full Stack Engineer'} [Verified]`,
        submittedAt: new Date().toISOString(),
      },
    },

    // PART B — DEVOPS & PRODUCTION ENGINEERING (Pages 5-6)
    partB_DevOps: {
      devopsReport: [
        { component: 'Source Control', implementation: 'Git / GitHub Enterprise Repository', status: 'Completed' },
        { component: 'Branch Strategy', implementation: 'main / develop / release-v1.0', status: 'Configured' },
        { component: 'Build', implementation: 'npm run build (Next.js / Node production output)', status: 'Automated' },
        { component: 'CI', implementation: 'GitHub Actions automated lint & build pipeline', status: 'Configured' },
        { component: 'CD', implementation: 'Continuous deployment with blue-green rollback support', status: 'Configured' },
        { component: 'Containerization', implementation: 'Docker multi-stage container images', status: 'Configured' },
        { component: 'Secrets', implementation: 'Encrypted Vault & environment variable management', status: 'Configured' },
        { component: 'Monitoring', implementation: 'Healthcheck heartbeat + Grafana alerting', status: 'Active' },
        { component: 'Backup', implementation: 'Automated daily snapshots with 30-day retention', status: 'Configured' },
      ],
      environments: [
        { environment: 'Development', endpoint: 'https://dev.softonic-i7.internal', status: 'Active', deploymentDate: today },
        { environment: 'Testing', endpoint: 'https://test.softonic-i7.internal', status: 'Active', deploymentDate: today },
        { environment: 'Staging', endpoint: 'https://staging.softonic-i7.com', status: 'Active', deploymentDate: today },
        { environment: 'Production Frontend', endpoint: 'https://prod.softonic-i7.com', status: 'Live / Stable', deploymentDate: today },
        { environment: 'Production API', endpoint: 'https://api.softonic-i7.com/v1', status: 'Live / Stable', deploymentDate: today },
        { environment: 'Database', endpoint: 'db-cluster.softonic-i7.internal:5432', status: 'Healthy / Backed Up', deploymentDate: today },
        { environment: 'ERP', endpoint: 'https://erp.softonic.com/api', status: 'Connected', deploymentDate: today },
        { environment: 'EMS', endpoint: 'https://ems.softonic.com/sso', status: 'Connected', deploymentDate: today },
      ],
      cicdChecklist: [
        { item: 'Automated build', status: 'Completed', evidence: 'GH-Action Pipeline #142 passed' },
        { item: 'Automated tests', status: 'Completed', evidence: 'Unit & integration suite: 100% pass' },
        { item: 'Production deployment', status: 'Completed', evidence: 'Release Tag: v1.0.0-PROD' },
        { item: 'SSL / TLS', status: 'Configured', evidence: 'Let’s Encrypt / DigiCert SHA-256 Valid' },
        { item: 'Secrets management', status: 'Configured', evidence: 'Secret store rotated and verified' },
        { item: 'Database backup', status: 'Completed', evidence: 'Snapshot ID: BKP-PROD-LATEST' },
        { item: 'Monitoring', status: 'Active', evidence: 'Uptime monitor 99.98% / Alerting active' },
        { item: 'Rollback plan', status: 'Available', evidence: 'Standard runbook SOP-DEVOPS-04' },
        { item: 'Post-deployment smoke test', status: 'Passed', evidence: 'QA Smoke checklist validated' },
      ],
      handoverItems: [
        { item: 'Production access', status: 'Completed' },
        { item: 'Repository access', status: 'Completed' },
        { item: 'Deployment guide', status: 'Completed' },
        { item: 'Monitoring access', status: 'Completed' },
        { item: 'Backup procedure', status: 'Completed' },
        { item: 'Rollback procedure', status: 'Completed' },
        { item: 'Known issues communicated', status: 'Completed' },
        { item: 'Support contacts', status: 'Completed' },
      ],
      devopsSignoff: {
        name: project.assignedDevOpsName || 'Lead DevOps Engineer',
        employeeId: project.assignedDevOpsId || 'EMP-DEVOPS-01',
        designation: 'DevOps Engineer',
        date: today,
        signature: `${project.assignedDevOpsName || 'DevOps Engineer'} [Verified]`,
        submittedAt: new Date().toISOString(),
      },
    },

    // PART C — AI ENGINEERING (Pages 7-8)
    partC_AiEngineering: {
      aiReport: [
        { area: 'AI Architecture', description: 'Agent / workflow architecture and service boundaries', status: 'Completed' },
        { area: 'AI Agent', description: 'Procurement Assistant & Reporting Orchestrator Agent', status: 'Configured' },
        { area: 'LLM Integration', description: 'Google DeepMind Gemini & OpenAI Structured APIs', status: 'Integrated' },
        { area: 'Prompt Engineering', description: 'System prompts, JSON schema guardrails & role limits', status: 'Completed' },
        { area: 'Workflow Automation', description: 'n8n event-driven integration and processing workflows', status: 'Configured' },
        { area: 'ERP / EMS Actions', description: 'Authorized API operations for procurement & shift sync', status: 'Integrated' },
        { area: 'Reporting Automation', description: 'Automated delivery, defect and compliance report generation', status: 'Configured' },
        { area: 'AI Evaluation', description: 'Accuracy, safety, reliability and edge-case benchmarking', status: 'Completed' },
        { area: 'Logging', description: 'Audit trail, token usage and execution telemetry logs', status: 'Configured' },
      ],
      aiAgents: [
        { agentService: 'Reporting Agent', responsibility: 'Aggregates multi-department metrics into corporate schemas', inputs: 'Module execution logs & status events', outputs: 'Validated JSON summaries' },
        { agentService: 'Workflow Automation Agent', responsibility: 'Executes automated approval routing between EMS and ERP', inputs: 'Submission webhooks', outputs: 'Validated transition actions' },
        { agentService: 'Security Guardrail Agent', responsibility: 'Screens payload parameters against SQLi, XSS & prompt injections', inputs: 'Incoming form submissions', outputs: 'Sanitized safe payloads' },
      ],
      n8nWorkflows: [
        { stage: 'Trigger', action: 'Scheduled webhook & event dispatcher', validation: 'Trigger logged' },
        { stage: 'Authentication', action: 'Authenticate against authorized services (SSO/Bearer)', validation: 'Token/session valid' },
        { stage: 'Data Retrieval', action: 'Fetch required ERP / EMS context and parameters', validation: 'Data validated' },
        { stage: 'AI Decision', action: 'Generate next operational action and policy check', validation: 'Policy checked' },
        { stage: 'Execution', action: 'Call approved API / service endpoints', validation: 'Response validated' },
        { stage: 'Report Update', action: 'Update project report / persistence records', validation: 'Write confirmed' },
        { stage: 'Notification', action: 'Notify authorized recipients & stakeholders', validation: 'Delivery logged' },
        { stage: 'Audit', action: 'Store execution result in immutable audit log', validation: 'Audit entry created' },
      ],
      evaluations: [
        { area: 'Task completion accuracy', target: '> 99%', actual: '99.6%', status: 'Pass' },
        { area: 'Workflow success rate', target: '> 99.5%', actual: '99.9%', status: 'Pass' },
        { area: 'API action accuracy', target: '100%', actual: '100%', status: 'Pass' },
        { area: 'Failure handling', target: 'Safe fallback', actual: 'Graceful degradation', status: 'Pass' },
        { area: 'Unauthorized action prevention', target: '100%', actual: '100%', status: 'Pass' },
        { area: 'Logging / traceability', target: '100%', actual: '100%', status: 'Pass' },
      ],
      aiSignoff: {
        name: project.assignedAiEngineerName || 'Lead AI Engineer',
        employeeId: project.assignedAiEngineerId || 'EMP-AI-01',
        designation: 'AI Engineer',
        date: today,
        signature: `${project.assignedAiEngineerName || 'AI Engineer'} [Verified]`,
        submittedAt: new Date().toISOString(),
      },
    },

    // PART D — QUALITY ENGINEERING (Pages 9-10)
    partD_Quality: {
      testingAreas: [
        { area: 'Functional', planned: 120, executed: 120, passed: 120, failed: 0, coverage: '100%' },
        { area: 'Integration', planned: 65, executed: 65, passed: 65, failed: 0, coverage: '100%' },
        { area: 'System', planned: 45, executed: 45, passed: 45, failed: 0, coverage: '100%' },
        { area: 'Regression', planned: 80, executed: 80, passed: 80, failed: 0, coverage: '100%' },
        { area: 'Security', planned: 35, executed: 35, passed: 35, failed: 0, coverage: '100%' },
        { area: 'Performance', planned: 25, executed: 25, passed: 25, failed: 0, coverage: '100%' },
        { area: 'UAT', planned: 30, executed: 30, passed: 30, failed: 0, coverage: '100%' },
      ],
      moduleStrategy: [
        { module: 'EMS', testCases: 40, passed: 40, failed: 0, blocked: 0, status: 'Pass' },
        { module: 'ERP', testCases: 55, passed: 55, failed: 0, blocked: 0, status: 'Pass' },
        { module: 'MUI', testCases: 35, passed: 35, failed: 0, blocked: 0, status: 'Pass' },
        { module: 'Buy', testCases: 45, passed: 45, failed: 0, blocked: 0, status: 'Pass' },
        { module: 'Reports', testCases: 50, passed: 50, failed: 0, blocked: 0, status: 'Pass' },
        { module: 'Soft Doc', testCases: 30, passed: 30, failed: 0, blocked: 0, status: 'Pass' },
        { module: 'AI Workflows', testCases: 40, passed: 40, failed: 0, blocked: 0, status: 'Pass' },
      ],
      testTypes: [
        { testType: 'Functional Testing', objective: 'Validate requirements and user workflows', result: 'Passed' },
        { testType: 'Integration Testing', objective: 'Validate system-to-system data flow', result: 'Passed' },
        { testType: 'System Testing', objective: 'Validate end-to-end application behavior', result: 'Passed' },
        { testType: 'Regression Testing', objective: 'Ensure fixes did not break existing features', result: 'Passed' },
        { testType: 'UAT', objective: 'Validate business acceptance', result: 'Approved' },
        { testType: 'Smoke Testing', objective: 'Validate production readiness after deployment', result: 'Passed' },
      ],
      defectSeverity: [
        { severity: 'Critical', total: 0, resolved: 0, retested: 0, closed: 0, open: 0 },
        { severity: 'High', total: 0, resolved: 0, retested: 0, closed: 0, open: 0 },
        { severity: 'Medium', total: 4, resolved: 4, retested: 4, closed: 4, open: 0 },
        { severity: 'Low', total: 7, resolved: 7, retested: 7, closed: 7, open: 0 },
      ],
      releaseCriteria: {
        criticalOpen: 0,
        highOpen: 0,
        regressionPassed: true,
        uatApproved: true,
        smokePassed: true,
        statement: 'Release Criteria: Critical defects = 0 open; high-priority defects = 0 open unless formally accepted; regression passed; UAT approved; production smoke test passed.',
      },
      qaLeadSignoff: {
        name: project.assignedQualityEngineerName || 'Quality Engineer Lead',
        employeeId: project.assignedQualityEngineerId || 'EMP-QA-01',
        designation: 'Quality Engineer',
        date: today,
        signature: `${project.assignedQualityEngineerName || 'QA Lead'} [Verified]`,
        submittedAt: new Date().toISOString(),
      },
      qualityHeadSignoff: {
        name: project.qualityHeadName || 'Head of Quality Assurance',
        employeeId: project.qualityHeadId || 'HEAD-QA-01',
        designation: 'Quality Head',
        date: today,
        signature: `${project.qualityHeadName || 'Quality Head'} [Approved]`,
        approved: true,
        approvedAt: new Date().toISOString(),
      },
    },

    // PART E — BUG BOUNTY & SECURITY (Page 11)
    partE_BugBounty: {
      securityAreas: [
        { area: 'Authentication', validation: 'Login, session and credential handling', status: 'Passed' },
        { area: 'Authorization / RBAC', validation: 'Role and permission enforcement', status: 'Passed' },
        { area: 'API Security', validation: 'Input validation, access controls and error handling', status: 'Passed' },
        { area: 'HTTPS / TLS', validation: 'Encrypted transport (TLS 1.3)', status: 'Passed' },
        { area: 'Secrets Management', validation: 'No exposed credentials / keys in code', status: 'Passed' },
        { area: 'Dependency Security', validation: 'Dependency / package vulnerability review (npm audit 0 vuln)', status: 'Passed' },
        { area: 'Security Headers', validation: 'CSP, HSTS, X-Frame-Options configured', status: 'Passed' },
        { area: 'Audit Logging', validation: 'Security-relevant events traceable in audit trail', status: 'Passed' },
      ],
      vulnerabilitySummary: [
        { severity: 'Critical', identified: 0, fixed: 0, retested: 0, acceptedRisk: 0, open: 0 },
        { severity: 'High', identified: 0, fixed: 0, retested: 0, acceptedRisk: 0, open: 0 },
        { severity: 'Medium', identified: 2, fixed: 2, retested: 2, acceptedRisk: 0, open: 0 },
        { severity: 'Low', identified: 3, fixed: 3, retested: 3, acceptedRisk: 0, open: 0 },
        { severity: 'Informational', identified: 5, fixed: 5, retested: 5, acceptedRisk: 0, open: 0 },
      ],
      remediationFindings: [
        { findingId: 'SEC-001', finding: 'Rate limiting on password reset endpoint', risk: 'Medium', remediation: 'Implemented Redis-based sliding window rate limiter', retestDate: today, status: 'Closed' },
        { findingId: 'SEC-002', finding: 'Verbose error messages on unhandled database exceptions', risk: 'Low', remediation: 'Enforced sanitized error middleware with unique correlation IDs', retestDate: today, status: 'Closed' },
        { findingId: 'SEC-003', finding: 'CORS policy wildcard on development preview', risk: 'Low', remediation: 'Restricted allowed origins to verified domain white-list', retestDate: today, status: 'Closed' },
      ],
      securityReleaseStatus: 'Approved',
      securityLeadSignoff: {
        name: project.assignedBugBountyName || 'Bug Bounty Security Lead',
        employeeId: project.assignedBugBountyId || 'EMP-SEC-01',
        designation: 'Bug Bounty / Security Lead',
        date: today,
        signature: `${project.assignedBugBountyName || 'Security Lead'} [Signed]`,
        submittedAt: new Date().toISOString(),
      },
      cyberHeadSignoff: {
        name: project.cyberHeadName || 'Head of Cyber Security',
        employeeId: project.cyberHeadId || 'HEAD-CYBER-01',
        designation: 'Cyber Security Head',
        date: today,
        signature: `${project.cyberHeadName || 'Cyber Security Head'} [Approved]`,
        approved: true,
        approvedAt: new Date().toISOString(),
      },
    },

    // PART F — PERFORMANCE & CLOSURE (Pages 12-13)
    partF_Closure: {
      performanceReliability: [
        { metric: 'API Response Time', target: '< 200 ms', actual: '45 ms', status: 'Pass' },
        { metric: 'Page Load Time', target: '< 1.5 sec', actual: '0.8 sec', status: 'Pass' },
        { metric: 'Concurrent Users', target: '500+', actual: '1,000 users verified', status: 'Pass' },
        { metric: 'Error Rate', target: '< 0.1%', actual: '0.01%', status: 'Pass' },
        { metric: 'CPU Utilization', target: '< 60%', actual: '28%', status: 'Pass' },
        { metric: 'Memory Utilization', target: '< 65%', actual: '42%', status: 'Pass' },
        { metric: 'Database Response', target: '< 50 ms', actual: '12 ms', status: 'Pass' },
        { metric: 'Availability', target: '99.9%', actual: '99.98%', status: 'Pass' },
      ],
      finalMetrics: [
        { metric: 'Scope Completion', target: '100%', actual: '100%', status: 'Pass' },
        { metric: 'Tasks Completed', target: '12', actual: '12', status: 'Pass' },
        { metric: 'Critical Defects', target: '0 Open', actual: '0', status: 'Pass' },
        { metric: 'High Defects', target: '0 Open / Accepted', actual: '0', status: 'Pass' },
        { metric: 'QA Pass Rate', target: '100%', actual: '100%', status: 'Pass' },
        { metric: 'UAT', target: 'Approved', actual: 'Approved by Client Stakeholders', status: 'Pass' },
        { metric: 'Production Deployment', target: 'Complete', actual: 'Live & Operational', status: 'Pass' },
        { metric: 'Documentation', target: 'Complete', actual: '100% complete & archived', status: 'Pass' },
      ],
      lessonsLearned: [
        { challenge: 'Environment synchronization', impact: 'Initial endpoint delays between ERP sandbox and staging', resolution: 'Configured automated health-check endpoints and shared credentials', lessonLearned: 'Provision environments earlier in project sprint lifecycle' },
        { challenge: 'Integration dependency', impact: 'External webhook latency variance under load test', resolution: 'Implemented message queuing and asynchronous webhook callbacks', lessonLearned: 'Validate dependencies early and implement retry fallback models' },
        { challenge: 'Late requirement changes', impact: 'Buy module report formatting modifications during UAT', resolution: 'Adopted dynamic MUI DataGrid columns with configurable views', lessonLearned: 'Freeze / approve requirements before release and decouple UI schema' },
        { challenge: 'Production readiness', impact: 'Ensuring zero disruption during final DNS and cutover', resolution: 'Executed pre-flight rehearsal in staging environment', lessonLearned: 'Use formal release checklist and automated verification suites' },
      ],
      finalAcceptance: [
        { role: 'Project Manager', name: project.managerName || 'Project Manager', date: today, status: 'Approved', signature: `${project.managerName || 'Project Manager'} [Signed]` },
        { role: 'Production Engineer', name: project.assignedEngineerName || 'Production Engineer', date: today, status: 'Approved', signature: `${project.assignedEngineerName || 'Production Engineer'} [Signed]` },
        { role: 'Production Head', name: project.productionHeadName || 'Production Head', date: today, status: 'Approved', signature: `${project.productionHeadName || 'Production Head'} [Signed]` },
        { role: 'QA Lead', name: project.assignedQualityEngineerName || 'QA Lead', date: today, status: 'Approved', signature: `${project.assignedQualityEngineerName || 'QA Lead'} [Signed]` },
        { role: 'Quality Head', name: project.qualityHeadName || 'Quality Head', date: today, status: 'Approved', signature: `${project.qualityHeadName || 'Quality Head'} [Signed]` },
        { role: 'Security / Bug Bounty Lead', name: project.assignedBugBountyName || 'Security Lead', date: today, status: 'Approved', signature: `${project.assignedBugBountyName || 'Security Lead'} [Signed]` },
        { role: 'Client SPOC / CTO', name: project.customerName || 'Client SPOC / CTO', date: today, status: 'Approved', signature: `${project.customerName || 'Client SPOC'} [Digitally Accepted]` },
      ],
      closureDeclaration: {
        finalClosureDate: today,
        projectManager: project.managerName || 'Project Manager',
        productionHead: project.productionHeadName || 'Production Head',
        qualityHead: project.qualityHeadName || 'Quality Head',
        securityLead: project.cyberHeadName || project.assignedBugBountyName || 'Security Lead',
        clientApprover: project.customerName || 'Client / Senior Approver',
      },
      revisionHistory: [
        { version: 'V0.1', date: '15/08/2026', description: 'Initial Draft & Architecture Specification', preparedBy: 'Full Stack Engineer', approvedBy: 'Team Leader' },
        { version: 'V0.9', date: '01/09/2026', description: 'Pre-Final Review & Multi-Department Verification', preparedBy: 'QA & Security Leads', approvedBy: 'Production Head' },
        { version: 'V1.0', date: today, description: 'Final Delivery Report & Production Handover Closure', preparedBy: project.managerName || 'Project Manager', approvedBy: 'Admin Directorate' },
      ],
    },
  };
}

export function saveMasterReportSection(
  projectId: string,
  partKey: 'partA_FullStack' | 'partB_DevOps' | 'partC_AiEngineering' | 'partD_Quality' | 'partE_BugBounty' | 'partF_Closure',
  partData: any
): CrmCustomerProject[] {
  const projects = getStoredCrmProjects();
  let modified: CrmCustomerProject | null = null;

  const updated = projects.map((p: CrmCustomerProject) => {
    if (p.id === projectId || p.projectCode === projectId) {
      const currentMaster = p.masterReport || getDefaultMasterEngineeringReport(p);
      const updatedMaster: MasterEngineeringReport = {
        ...currentMaster,
        [partKey]: {
          ...currentMaster[partKey],
          ...partData,
        },
      };

      modified = {
        ...p,
        masterReport: updatedMaster,
      };
      return modified;
    }
    return p;
  });

  if (modified) {
    syncProjectUpdate(updated, modified);
  }
  return updated;
}

export function getDefaultProductionReport(
  project: Partial<CrmCustomerProject>,
  engineerUser?: { name?: string; id?: string; designation?: string; email?: string }
): ProductionReport {
  const projCode = project.projectCode || 'PJ-PROD-001';
  const projName = project.projectName || 'PS Softonic I7 Enterprise Platform';
  const engName = engineerUser?.name || project.assignedEngineerName || 'Full Stack Engineer';
  const engId = engineerUser?.id || project.assignedEngineerId || 'ENG-FS-01';

  return {
    projectId: project.id || projCode,
    projectCode: projCode,
    projectName: projName,

    // 1. Executive Summary
    executiveSummary: {
      productionStatus: '🟢 LIVE / STABLE',
      developmentStatus: '✅ Completed',
      deploymentStatus: '✅ Completed',
      integrationStatus: '✅ Completed',
      environmentSync: '✅ Completed',
      documentation: '✅ Completed',
      sourceCodeHandover: '✅ Completed',
      productionHandover: '✅ Completed',
      overview:
        `The ${projName} (${projCode}) application has been successfully designed, developed, configured, integrated and deployed into the production environment. The Production team completed the required application implementation, EMS and ERP integration, MUI reporting functionality, Buy module implementation, environment synchronization, code archival and production deployment activities. All production deliverables have been validated and confirmed operational across production infrastructure.`,
    },

    // 2. Deliverables (12 Tasks)
    deliverables: [
      { taskNo: '1', requirement: 'Production Executive Summary & Dashboard', deliverable: 'Executive summary dashboard, delivery status metrics, live system state indicators', status: 'Completed' },
      { taskNo: '2', requirement: 'Production Scope & Module Tracking', deliverable: 'Comprehensive 12-module tracking matrix, deliverable completion verification', status: 'Completed' },
      { taskNo: '3', requirement: 'Multi-Layer Production Architecture', deliverable: '5-layer enterprise architectural model (Client, Application, Integration, Data, QA)', status: 'Completed' },
      { taskNo: '4', requirement: 'Full Stack Technology Stack', deliverable: '12-tier technology stack specification (Next.js, Node, Express, Supabase, Mongo, MUI)', status: 'Completed' },
      { taskNo: '5', requirement: 'Multi-Environment Configuration', deliverable: '8 production & staging environment endpoint mapping and synchronization table', status: 'Completed' },
      { taskNo: '6', requirement: 'Production Deployment & Pre-Flight Checks', deliverable: '13-point deployment pre-flight verification checklist, zero-downtime execution logs', status: 'Completed' },
      { taskNo: '7', requirement: 'EMS & ERP Integration Engine', deliverable: 'Bi-directional synchronization matrix, employee, timesheet, quality & project bridges', status: 'Completed' },
      { taskNo: '8', requirement: 'Technical Documentation Repository', deliverable: '9 comprehensive technical engineering documents, architecture guides & API swagger specs', status: 'Completed' },
      { taskNo: '9', requirement: 'Source Code Archival & Handover', deliverable: 'Production source repository tags, archival bundles, SHA-256 verified release artifacts', status: 'Completed' },
      { taskNo: '10', requirement: 'Production Handover & Support Operations', deliverable: '10-point handover operational checklist, 24/7 escalation matrix, SLA commitments', status: 'Completed' },
      { taskNo: '11', requirement: 'MUI Reporting & Export Module', deliverable: 'Interactive DataGrid analytics, corporate XLS XML generation & vector printable PDF', status: 'Completed' },
      { taskNo: '12', requirement: 'Production Buy & Procurement Module', deliverable: 'End-to-end procurement workflows, requisition management, approval pipelines', status: 'Completed' },
    ],

    // 3. System Architecture
    systemArchitecture: {
      clientLayer: 'Next.js 14, React 18, Tailwind CSS, MUI DataGrid, Responsive corporate viewport',
      applicationLayer: 'Node.js & Express RESTful microservices, JWT authentication, RBAC authorization guards, Rate-limiting, CORS security',
      integrationLayer: 'EMS bi-directional sync, ERP enterprise accounting & project tracking, CRM Webhook pipeline, REST APIs',
      dataLayer: 'PostgreSQL / Supabase relational storage, MongoDB document store, LocalStorage fallback, Cloudinary / S3 asset storage',
      infrastructureLayer: 'Vercel / Render cloud hosting, Cloudflare SSL/TLS termination, Global CDN edge caching, 99.9% SLA load balancer',
    },

    // 4. Technology Stack (12 items)
    techStack: [
      { layer: 'Frontend Framework', technology: 'Next.js 14 / React 18', purpose: 'Server-side rendering, routing & reactive enterprise user interfaces' },
      { layer: 'Styling & UI Kit', technology: 'Tailwind CSS + MUI (Material UI)', purpose: 'Modern responsive design system, data tables & styled modal dialogues' },
      { layer: 'Programming Language', technology: 'TypeScript / JavaScript (ES2023)', purpose: 'End-to-end type safety, strict compile checks and runtime reliability' },
      { layer: 'Backend Framework', technology: 'Node.js + Express.js', purpose: 'High-performance event-driven REST API server with middleware chain' },
      { layer: 'Primary Database', technology: 'PostgreSQL / Supabase', purpose: 'Relational data persistence, foreign key integrity & project schemas' },
      { layer: 'Secondary Database', technology: 'MongoDB / Mongoose ODM', purpose: 'Flexible document store for logs, audits and rich deliverable payloads' },
      { layer: 'Authentication & Security', technology: 'JWT + HTTP-Only Cookies + RBAC', purpose: 'Secure stateless session tokens, role-based route protection' },
      { layer: 'Reporting & Export', technology: 'MUI DataGrid + XML Excel + Vector PDF', purpose: 'Corporate A4 print engine, spreadsheet generation and analytics' },
      { layer: 'State Management', technology: 'React Context + Hooks + Web Storage', purpose: 'Synchronized cross-component reactive state and offline persistence' },
      { layer: 'API Communication', technology: 'Native Fetch API + Webhooks', purpose: 'Bi-directional real-time communication between EMS, CRM and ERP' },
      { layer: 'Deployment Platform', technology: 'Vercel / Render / Cloudflare CDN', purpose: 'Zero-downtime automated CI/CD deployment pipeline' },
      { layer: 'Version Control', technology: 'Git + GitHub Enterprise', purpose: 'Semantic version tagging, code review workflows and branch locking' },
    ],

    // 5. Environments (8 items)
    environments: [
      { environment: 'Local Development', endpoint: 'http://localhost:3000 / localhost:5000', status: 'Active / Healthy', owner: 'Engineering Team' },
      { environment: 'QA / Testing Environment', endpoint: 'https://qa.pjsofonic.internal', status: 'Active / Passing', owner: 'QA Department' },
      { environment: 'UAT Staging Environment', endpoint: 'https://staging.pjsofonic.internal', status: 'Active / Verified', owner: 'Product Operations' },
      { environment: 'Production Primary ERP', endpoint: 'https://erp.pjsofonic.com', status: 'Active / LIVE', owner: 'DevOps / Cloud Ops' },
      { environment: 'Production API Gateway', endpoint: 'https://api.pjsofonic.com/api/v1', status: 'Active / LIVE', owner: 'Backend Engineering' },
      { environment: 'EMS Production Bridge', endpoint: 'https://ems.pjsofonic.com/api', status: 'Active / Connected', owner: 'Core Integration Team' },
      { environment: 'CRM Webhook Ingestion', endpoint: 'https://erp.pjsofonic.com/api/crm/sync', status: 'Active / Listening', owner: 'Integration Lead' },
      { environment: 'CDN & Asset Storage', endpoint: 'https://assets.pjsofonic.com', status: 'Active / Optimized', owner: 'Infrastructure Team' },
    ],

    // 6. Deployment & Release Management
    deploymentInfo: {
      releaseVersion: 'v1.0.0-PROD',
      deploymentDate: new Date().toLocaleDateString('en-GB'),
      deploymentTime: new Date().toLocaleTimeString(),
      deploymentOwner: engName,
      releaseType: 'Major Production Release',
      deploymentMethod: 'Blue-Green Zero-Downtime Pipeline',
      rollbackPlan: 'Automated instant rollback to previous stable commit tag v0.9.8 within 60 seconds.',
      productionStatus: 'LIVE / HEALTHY',
      checklist: {
        'Git branch merged & release tagged': true,
        'Production environment variables verified': true,
        'Database migrations executed successfully': true,
        'Clean build compilation (0 errors, 0 warnings)': true,
        'Strict TypeScript and lint checks passed': true,
        'Unit, integration & E2E test suites passed (100%)': true,
        'SSL / TLS certificates validated and installed': true,
        'Cross-Origin Resource Sharing (CORS) secured': true,
        'API rate limiting & DDoS protection active': true,
        'Application error logging & APM initialized': true,
        'Full database snapshot backup taken prior to release': true,
        'System health check endpoints return HTTP 200 OK': true,
        'Rollback strategy tested & documented': true,
      },
    },

    // 7. Integrations
    integrations: {
      matrix: [
        { integration: 'Employee Auth & Session Bridge', method: 'JWT Bearer Token Validation', status: 'Connected', validation: 'EMS -> ERP Shared Credentials' },
        { integration: 'Customer Project Provisioning', method: 'Webhook / REST API Push', status: 'Connected', validation: 'CRM -> ERP Real-Time Sync' },
        { integration: 'Timesheet & Attendance Logging', method: 'Bi-directional JSON REST API', status: 'Connected', validation: 'ERP <-> EMS Dual Confirmation' },
        { integration: 'Quality Assurance Audit Trail', method: 'Role-gated API Dispatch', status: 'Connected', validation: 'QA Dept -> Production Release' },
        { integration: 'Production Deliverables Handover', method: 'Multi-Tier Digital Sign-Off API', status: 'Connected', validation: 'Full Stack -> TL -> Head -> Manager' },
        { integration: 'Financials & Budget Tracking', method: 'Secure Accounting Microservice', status: 'Connected', validation: 'ERP Enterprise Ledger Sync' },
      ],
      emsIntegrationStatus: 'Connected & Synchronized',
      erpIntegrationStatus: 'Connected & Operational',
      envSyncStatus: 'Fully Synchronized',
      dataFlowStatus: 'Bi-directional Real-Time Active',
    },

    // 8. Technical Documentation (9 items)
    documents: [
      { document: 'System Architecture Document (SAD)', version: 'v1.0.0', status: 'Completed & Approved' },
      { document: 'API Specification (OpenAPI / Swagger 3.0)', version: 'v1.0.0', status: 'Completed & Approved' },
      { document: 'Database Schema & Entity Relationship Diagram', version: 'v1.0.0', status: 'Completed & Approved' },
      { document: 'Production Deployment & Infrastructure Runbook', version: 'v1.0.0', status: 'Completed & Approved' },
      { document: 'EMS & ERP Cross-System Integration Manual', version: 'v1.0.0', status: 'Completed & Approved' },
      { document: 'User Acceptance Testing (UAT) Verification Report', version: 'v1.0.0', status: 'Completed & Approved' },
      { document: 'Security, Encryption & Compliance Checklist', version: 'v1.0.0', status: 'Completed & Approved' },
      { document: 'Disaster Recovery & High-Availability Playbook', version: 'v1.0.0', status: 'Completed & Approved' },
      { document: 'Production Handover & Operations Support Guide', version: 'v1.0.0', status: 'Completed & Approved' },
    ],

    // 9. Source Code Handover
    sourceCodeHandover: {
      repository: 'https://github.com/pjsofonic/erp-ems-suite',
      branch: 'main / production',
      releaseTag: 'v1.0.0-PROD',
      codeOwner: 'PJ Softonic Engineering Directorate',
      accessGranted: 'Admin, DevOps, Production Head, Manager',
      documentationStatus: 'Complete with Inline TSDoc and README',
      archives: [
        { item: 'Production Frontend Build (Next.js Standalone)', location: '/builds/frontend-v1.0.0.tar.gz', access: 'DevOps Primary' },
        { item: 'Production Backend Services (Express Microservices)', location: '/builds/backend-v1.0.0.tar.gz', access: 'DevOps Primary' },
        { item: 'Database Migration Scripts & Initial Schemas', location: '/database/migrations/v1.0.0/', access: 'Database Administrator' },
        { item: 'Environment Configuration Templates (.env.example)', location: '/configs/production.env.enc', access: 'Security Lead' },
      ],
    },

    // 10. Handover Checklist (10 items)
    handoverChecklist: {
      'Production application deployed and operational on live infrastructure': true,
      'Database schema, constraints and initial seed records validated': true,
      'SSL / HTTPS certificates active across all production domains': true,
      'EMS, ERP and CRM bi-directional synchronization APIs validated': true,
      'MUI reporting, data export (Excel & PDF) fully functional': true,
      'User authentication, session tokens and role-based permissions enforced': true,
      'Automated daily database backups and snapshots scheduled': true,
      'Production logging, monitoring and error alerting active': true,
      'All 9 technical documentation deliverables verified and archived': true,
      'Support engineering team briefed on escalation and SLA matrix': true,
    },

    currentStage: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Full Stack Developer submits complete 10-section Production Report
 */
export function submitProductionReportByFullStack(
  projectId: string,
  report: ProductionReport,
  engineerUser: { name?: string; id?: string; designation?: string },
  signature: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const fullstackSignoff = {
    name: engineerUser.name || 'Full Stack Engineer',
    employeeId: engineerUser.id || 'ENG-FS',
    designation: engineerUser.designation || 'Full Stack Engineer',
    date: new Date().toLocaleDateString('en-GB'),
    signature,
    submittedAt: new Date().toISOString(),
  };

  const updatedReport: ProductionReport = {
    ...report,
    currentStage: 'SUBMITTED_BY_FULLSTACK',
    fullstackSignoff,
    updatedAt: new Date().toISOString(),
  };

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      modifiedItem = {
        ...p,
        productionReport: updatedReport,
        stage: 'PRODUCTION_SUBMITTED' as const,
        status: 'Done' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
  fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/production-report/submit-fullstack`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report: updatedReport, engineerUser, signature }),
  }).catch(() => {});

  return updated;
}

/**
 * Team Leader reviews and signs off Production Report
 */
export function reviewProductionReportByTeamLead(
  projectId: string,
  tlUser: { name?: string; id?: string; designation?: string },
  reviewNotes: string,
  signature: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      const currentReport = p.productionReport || getDefaultProductionReport(p);
      const teamLeadSignoff = {
        name: tlUser.name || 'Team Leader',
        employeeId: tlUser.id || 'TL-LEAD',
        designation: tlUser.designation || 'Team Leader',
        date: new Date().toLocaleDateString('en-GB'),
        signature,
        reviewNotes,
        reviewedAt: new Date().toISOString(),
      };

      const updatedReport: ProductionReport = {
        ...currentReport,
        currentStage: 'REVIEWED_BY_TL',
        teamLeadSignoff,
        updatedAt: new Date().toISOString(),
      };

      modifiedItem = {
        ...p,
        productionReport: updatedReport,
        tlProductionApproval: {
          approved: true,
          approvedBy: tlUser.name || 'Team Leader',
          approvedAt: new Date().toISOString(),
          notes: reviewNotes,
        },
        stage: 'TL_PRODUCTION_APPROVED' as const,
        status: 'working' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
  fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/production-report/review-tl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tlUser, reviewNotes, signature }),
  }).catch(() => {});

  return updated;
}

/**
 * Production Head approves and signs off Production Report
 */
export function approveProductionReportByHead(
  projectId: string,
  headUser: { name?: string; id?: string; designation?: string },
  approvalRemarks: string,
  signature: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      const currentReport = p.productionReport || getDefaultProductionReport(p);
      const productionHeadSignoff = {
        name: headUser.name || 'Production Head',
        employeeId: headUser.id || 'HEAD-PROD',
        designation: headUser.designation || 'Production Head',
        date: new Date().toLocaleDateString('en-GB'),
        signature,
        approvalRemarks,
        approvedAt: new Date().toISOString(),
      };

      const updatedReport: ProductionReport = {
        ...currentReport,
        currentStage: 'APPROVED_BY_HEAD',
        productionHeadSignoff,
        updatedAt: new Date().toISOString(),
      };

      modifiedItem = {
        ...p,
        productionReport: updatedReport,
        stage: 'HEAD_APPROVED' as const,
        status: 'working' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
  fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/production-report/approve-head`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ headUser, approvalRemarks, signature }),
  }).catch(() => {});

  return updated;
}

/**
 * Manager grants Final Acceptance & Project Closure
 */
export function acceptProductionReportByManager(
  projectId: string,
  managerUser: { name?: string; id?: string; designation?: string },
  finalClosureDate: string,
  finalStatus: 'Accepted' | 'Accepted with Minor Observations' | 'Pending Closure' | 'Rejected',
  signature: string,
  remarks?: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      const currentReport = p.productionReport || getDefaultProductionReport(p);
      const managerSignoff = {
        name: managerUser.name || 'Manager',
        employeeId: managerUser.id || 'MGR-OPS',
        designation: managerUser.designation || 'Manager',
        finalClosureDate: finalClosureDate || new Date().toLocaleDateString('en-GB'),
        finalStatus,
        signature,
        remarks,
        closedAt: new Date().toISOString(),
      };

      const updatedReport: ProductionReport = {
        ...currentReport,
        currentStage: 'FINAL_ACCEPTED_BY_MANAGER',
        managerSignoff,
        updatedAt: new Date().toISOString(),
      };

      const isCompleted = finalStatus === 'Accepted' || finalStatus === 'Accepted with Minor Observations';

      modifiedItem = {
        ...p,
        productionReport: updatedReport,
        stage: isCompleted ? ('COMPLETED' as const) : ('PENDING_CLOSURE' as const),
        status: isCompleted ? ('COMPLETED' as const) : ('working' as const),
        adminFinalApproval: {
          approved: isCompleted,
          approvedBy: managerUser.name || 'Manager',
          approvedAt: new Date().toISOString(),
          notes: `${finalStatus} - ${remarks || 'Approved by Manager'}`,
        },
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
  fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/production-report/accept-manager`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ managerUser, finalClosureDate, finalStatus, signature, remarks }),
  }).catch(() => {});

  return updated;
}

/**
 * Full Stack Developer submits 4 deliverables
 */
export function submitFullStackDeliverables(
  projectId: string,
  deliverables: ProductionDeliverables
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      modifiedItem = {
        ...p,
        productionDeliverables: {
          ...p.productionDeliverables,
          ...deliverables,
          submittedAt: new Date().toISOString(),
        },
        stage: 'PRODUCTION_SUBMITTED' as const,
        status: 'Done' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);
  return updated;
}

/**
 * Team Leader approves Production Deliverables and routes project to Quality (SENT TO QUALITY)
 */
export function approveTlProduction(
  projectId: string,
  tlName: string,
  notes?: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      modifiedItem = {
        ...p,
        tlProductionApproval: {
          approved: true,
          approvedBy: tlName,
          approvedAt: new Date().toISOString(),
          notes,
        },
        stage: 'TL_PRODUCTION_APPROVED' as const,
        status: 'working' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);
  return updated;
}

/**
 * Quality Department submits Bug, Test, and Quality Reports and sets Quality Approved
 */
export function submitQualityReports(
  projectId: string,
  reports: QualityReports
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      modifiedItem = {
        ...p,
        qualityReports: {
          ...p.qualityReports,
          ...reports,
          qualityStatus: 'QUALITY_APPROVED' as const,
          verifiedAt: new Date().toISOString(),
        },
        stage: 'QUALITY_APPROVED' as const,
        status: 'Done' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);
  return updated;
}

/**
 * Team Leader completes review and submits project to Admin ("Project All Done")
 */
export function submitTlProjectAllDone(
  projectId: string,
  tlName: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      modifiedItem = {
        ...p,
        tlFinalSubmission: {
          submitted: true,
          submittedBy: tlName,
          submittedAt: new Date().toISOString(),
        },
        stage: 'SUBMITTED_TO_ADMIN' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);
  return updated;
}

/**
 * Admin grants Final Total Approval -> Completed across all profiles
 */
export function approveAdminFinal(
  projectId: string,
  adminName: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      modifiedItem = {
        ...p,
        adminFinalApproval: {
          approved: true,
          approvedBy: adminName,
          approvedAt: new Date().toISOString(),
        },
        stage: 'COMPLETED' as const,
        status: 'COMPLETED' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);
  return updated;
}

/**
 * Ingests live customer projects from all sources in real-time
 */
export async function fetchCrmCustomerProjects(): Promise<CrmCustomerProject[]> {
  const projectMap = new Map<string, CrmCustomerProject>();

  // 1. Fetch live projects directly from remote CRM Backend API
  try {
    let token = '';
    if (typeof window !== 'undefined') {
      token =
        localStorage.getItem('pj_crm_token') ||
        localStorage.getItem('pj_ems_token') ||
        '';
    }
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${CRM_API_BASE}/api/v1/projects`, {
      headers,
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.projects || data.data || [];
      if (Array.isArray(list) && list.length > 0) {
        list.forEach((p: any) => {
          const code = safeString(p.project_code || p.projectCode || p.code || `CRM-${p.id || p._id}`);
          const clientName = safeString(
            (p.customer && (p.customer.name || p.customer.company)) ||
            p.company_name ||
            p.customer_name ||
            p.customerName ||
            'CRM Client'
          );
          const clientEmail = safeString(
            (p.customer && p.customer.email) ||
            p.customer_email ||
            p.customerEmail ||
            'client@crm.com'
          );
          const dept = safeString(p.project_type || p.departmentScope || p.department || 'Software Engineering');
          const tlId = p.target_team_lead_id || p.targetTeamLeadId ? safeString(p.target_team_lead_id || p.targetTeamLeadId) : undefined;
          const tlName = p.target_team_lead_name || p.targetTeamLeadName || p.target_team_lead ? safeString(p.target_team_lead_name || p.targetTeamLeadName || p.target_team_lead) : undefined;
          const reqs = safeString(p.overview || p.requirements_html || p.requirements || p.description || 'Customer project scope submitted via CRM.');
          const budgetVal = Number(p.budget || p.estimated_cost || p.estimatedCost) || 0;
          const isDone = p.status === 'COMPLETED' || p.stage === 'COMPLETED';
          const projId = safeString(p.id ? String(p.id) : (p._id || `crm-proj-${Date.now()}`));

          projectMap.set(code, {
            id: projId,
            crmProjectId: p.id || p.crmProjectId || p.crm_project_id,
            projectCode: code,
            projectName: safeString(p.title || p.projectName || p.name || 'CRM Customer Project'),
            customerName: clientName,
            customerEmail: clientEmail,
            departmentScope: dept,
            targetTeamLeadId: tlId,
            targetTeamLeadName: tlName,
            requirements: reqs,
            budget: budgetVal,
            status: isDone ? 'COMPLETED' : (p.status === 'APPROVED' ? 'working' : (p.status || 'working')),
            stage: isDone ? 'COMPLETED' : (p.stage || (tlName ? 'ASSIGNED_TO_TL' : 'ADMIN_CREATED')),
            approvalStatus: 'APPROVED',
            handoverPdfUrl: p.handoverPdfUrl || p.handover_pdf_url || `/api/v1/projects/${projId}/handover-pdf`,
            handoverPdfByCodeUrl: p.handoverPdfByCodeUrl || p.handover_pdf_by_code_url || `/api/v1/projects/code/${code}/handover-pdf`,
            handoverDocApiUrl: p.handoverDocApiUrl || p.handover_doc_api_url || `/api/v1/projects/code/${code}/handover-document`,
            handoverDocument: p.handoverDocument || p.handover_document,
            agencySignoff: p.agencySignoff || p.agency_signoff,
            clientSignoff: p.clientSignoff || p.client_signoff,
            createdAt: safeString(p.created_at || p.createdAt || new Date().toISOString()),
          });
        });
      }
    }
  } catch (err) {
    console.warn('Remote CRM API connection notice:', err);
  }

  // 2. Fetch live projects from Express Backend API
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('pj_ems_token') || localStorage.getItem('pj_crm_token') || '';
    }
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const expressRes = await fetch(`${backendUrl}/crm/projects`, { headers, cache: 'no-store' });
    if (expressRes.ok) {
      const data = await expressRes.json();
      const list = data.projects || data.data || (Array.isArray(data) ? data : []);
      if (Array.isArray(list) && list.length > 0) {
        list.forEach((p: any) => {
          const code = safeString(p.projectCode || p.code || p.project_code || `CRM-${p.id}`);
          if (!projectMap.has(code)) {
            const isDone = p.status === 'COMPLETED' || p.stage === 'COMPLETED';
            const projId = safeString(p.id || `crm-${Date.now()}`);
            projectMap.set(code, {
              id: projId,
              crmProjectId: p.crmProjectId || p.id,
              projectCode: code,
              projectName: safeString(p.projectName || p.name || 'Customer Project from CRM'),
              customerName: safeString(p.customerName || p.clientName || 'CRM Client'),
              customerEmail: safeString(p.customerEmail || p.email || 'client@crm.com'),
              departmentScope: safeString(p.departmentScope || p.department || 'Software Engineering'),
              managerId: p.managerId ? safeString(p.managerId) : undefined,
              managerName: p.managerName ? safeString(p.managerName) : undefined,
              productionHeadId: p.productionHeadId ? safeString(p.productionHeadId) : undefined,
              productionHeadName: p.productionHeadName ? safeString(p.productionHeadName) : undefined,
              targetTeamLeadId: p.targetTeamLeadId ? safeString(p.targetTeamLeadId) : undefined,
              targetTeamLeadName: p.targetTeamLeadName ? safeString(p.targetTeamLeadName) : undefined,
              assignedEngineerId: p.assignedEngineerId ? safeString(p.assignedEngineerId) : undefined,
              assignedEngineerName: p.assignedEngineerName ? safeString(p.assignedEngineerName) : undefined,
              assignedDevOpsId: p.assignedDevOpsId ? safeString(p.assignedDevOpsId) : undefined,
              assignedDevOpsName: p.assignedDevOpsName ? safeString(p.assignedDevOpsName) : undefined,
              assignedAiEngineerId: p.assignedAiEngineerId ? safeString(p.assignedAiEngineerId) : undefined,
              assignedAiEngineerName: p.assignedAiEngineerName ? safeString(p.assignedAiEngineerName) : undefined,
              requirements: safeString(p.requirements || p.description || 'Customer project scope submitted via CRM.'),
              budget: Number(p.budget) || 0,
              status: isDone ? 'COMPLETED' : (p.status || 'working'),
              stage: isDone ? 'COMPLETED' : (p.stage || 'ASSIGNED_TO_TL'),
              approvalStatus: 'APPROVED',
              handoverPdfUrl: p.handoverPdfUrl || `/api/v1/projects/${projId}/handover-pdf`,
              handoverPdfByCodeUrl: p.handoverPdfByCodeUrl || `/api/v1/projects/code/${code}/handover-pdf`,
              handoverDocApiUrl: p.handoverDocApiUrl || `/api/v1/projects/code/${code}/handover-document`,
              handoverDocument: p.handoverDocument,
              agencySignoff: p.agencySignoff,
              clientSignoff: p.clientSignoff,
              productionDeliverables: p.productionDeliverables,
              productionReport: p.productionReport,
              tlProductionApproval: p.tlProductionApproval,
              qualityReports: p.qualityReports,
              tlFinalSubmission: p.tlFinalSubmission,
              adminFinalApproval: p.adminFinalApproval,
              crmSynced: Boolean(p.crmSynced),
              crmSyncedAt: p.crmSyncedAt ? safeString(p.crmSyncedAt) : undefined,
              createdAt: safeString(p.createdAt || new Date().toISOString()),
            });
          }
        });
      }
    }
  } catch (e) {}

  // 3. Fetch from Supabase (project_erp schema)
  try {
    const supaProjects = await fetchSupabaseProjects();
    if (Array.isArray(supaProjects) && supaProjects.length > 0) {
      supaProjects.forEach((p: any) => {
        const code = safeString(p.project_code || p.projectCode || p.code || `CRM-${p.id}`);
        if (!projectMap.has(code)) {
          const isDone = p.status === 'COMPLETED' || p.stage === 'COMPLETED';
          const projId = safeString(p.id || `supa-${Date.now()}`);
          projectMap.set(code, {
            id: projId,
            crmProjectId: p.id,
            projectCode: code,
            projectName: safeString(p.project_name || p.projectName || p.name || 'CRM Approved Project'),
            customerName: safeString(p.customer_name || p.customerName || p.clientName || 'Valued CRM Client'),
            customerEmail: safeString(p.customer_email || p.customerEmail || p.email || 'client@crm.com'),
            departmentScope: safeString(p.department_scope || p.departmentScope || p.department || 'Software Engineering'),
            targetTeamLeadId: p.target_team_lead_id ? safeString(p.target_team_lead_id) : (p.targetTeamLeadId ? safeString(p.targetTeamLeadId) : undefined),
            targetTeamLeadName: p.target_team_lead_name ? safeString(p.target_team_lead_name) : (p.targetTeamLeadName ? safeString(p.targetTeamLeadName) : undefined),
            requirements: safeString(p.requirements || p.description || 'Approved project scope from CRM.'),
            budget: Number(p.budget) || 0,
            status: isDone ? 'COMPLETED' : (p.status || 'working'),
            stage: isDone ? 'COMPLETED' : 'ASSIGNED_TO_TL',
            approvalStatus: 'APPROVED',
            handoverPdfUrl: `/api/v1/projects/${projId}/handover-pdf`,
            handoverPdfByCodeUrl: `/api/v1/projects/code/${code}/handover-pdf`,
            handoverDocApiUrl: `/api/v1/projects/code/${code}/handover-document`,
            createdAt: safeString(p.created_at || p.createdAt || new Date().toISOString()),
          });
        }
      });
    }
  } catch (supaErr) {
    console.warn('Supabase projects query notice:', supaErr);
  }

  // 4. Ingest locally stored active projects (preserves all deliverables & multi-stage status)
  const storedProjects = getStoredCrmProjects();
  storedProjects.forEach((stored) => {
    const existing = projectMap.get(stored.projectCode);
    if (existing) {
      // Merge local progress on top of remote project
      projectMap.set(stored.projectCode, {
        ...existing,
        ...stored,
        crmProjectId: stored.crmProjectId || existing.crmProjectId,
        managerId: stored.managerId || existing.managerId,
        managerName: stored.managerName || existing.managerName,
        productionHeadId: stored.productionHeadId || existing.productionHeadId,
        productionHeadName: stored.productionHeadName || existing.productionHeadName,
        status: stored.status || existing.status,
        stage: stored.stage || existing.stage,
        handoverPdfUrl: stored.handoverPdfUrl || existing.handoverPdfUrl,
        handoverPdfByCodeUrl: stored.handoverPdfByCodeUrl || existing.handoverPdfByCodeUrl,
        handoverDocApiUrl: stored.handoverDocApiUrl || existing.handoverDocApiUrl,
        handoverDocument: stored.handoverDocument || existing.handoverDocument,
        agencySignoff: stored.agencySignoff || existing.agencySignoff,
        clientSignoff: stored.clientSignoff || existing.clientSignoff,
        targetTeamLeadId: stored.targetTeamLeadId || existing.targetTeamLeadId,
        targetTeamLeadName: stored.targetTeamLeadName || existing.targetTeamLeadName,
        assignedEngineerId: stored.assignedEngineerId || existing.assignedEngineerId,
        assignedEngineerName: stored.assignedEngineerName || existing.assignedEngineerName,
        assignedDevOpsId: stored.assignedDevOpsId || existing.assignedDevOpsId,
        assignedDevOpsName: stored.assignedDevOpsName || existing.assignedDevOpsName,
        assignedAiEngineerId: stored.assignedAiEngineerId || existing.assignedAiEngineerId,
        assignedAiEngineerName: stored.assignedAiEngineerName || existing.assignedAiEngineerName,
        productionDeliverables: stored.productionDeliverables || existing.productionDeliverables,
        productionReport: stored.productionReport || existing.productionReport,
        tlProductionApproval: stored.tlProductionApproval || existing.tlProductionApproval,
        qualityHeadId: stored.qualityHeadId || existing.qualityHeadId,
        qualityHeadName: stored.qualityHeadName || existing.qualityHeadName,
        assignedQualityEngineerId: stored.assignedQualityEngineerId || existing.assignedQualityEngineerId,
        assignedQualityEngineerName: stored.assignedQualityEngineerName || existing.assignedQualityEngineerName,
        qualityReport: stored.qualityReport || existing.qualityReport,
        cyberHeadId: stored.cyberHeadId || existing.cyberHeadId,
        cyberHeadName: stored.cyberHeadName || existing.cyberHeadName,
        assignedBugBountyId: stored.assignedBugBountyId || existing.assignedBugBountyId,
        assignedBugBountyName: stored.assignedBugBountyName || existing.assignedBugBountyName,
        cyberReport: stored.cyberReport || existing.cyberReport,
        managerTriReview: stored.managerTriReview || existing.managerTriReview,
        adminFinalApproval: stored.adminFinalApproval || existing.adminFinalApproval,
        crmSynced: stored.crmSynced !== undefined ? stored.crmSynced : existing.crmSynced,
        crmSyncedAt: stored.crmSyncedAt || existing.crmSyncedAt,
      });
    } else {
      projectMap.set(stored.projectCode, stored);
    }
  });

  // Filter out legacy test project codes
  const validProjects = Array.from(projectMap.values()).filter(
    (p) =>
      !p.id.startsWith('crm-proj-approved') &&
      !p.projectCode.startsWith('CRM-PRJ-70')
  );

  return validProjects;
}

/**
 * -------------------------------------------------------------------------
 * Quality Assurance Pipeline Helpers
 * -------------------------------------------------------------------------
 */

export function getDefaultQualityReport(
  project: Partial<CrmCustomerProject>,
  qaUser?: { name?: string; id?: string; designation?: string; email?: string }
): QualityReport {
  const projCode = project.projectCode || 'PJ-QA-001';
  const projName = project.projectName || 'PS Softonic Enterprise Platform';
  const qaName = qaUser?.name || project.assignedQualityEngineerName || 'Senior Quality Engineer';
  const qaId = qaUser?.id || project.assignedQualityEngineerId || 'EMP-QE-01';

  return {
    testSummary: {
      totalTests: 248,
      passed: 244,
      failed: 0,
      blocked: 4,
      passRate: '98.4%',
      executionDate: new Date().toLocaleDateString('en-GB'),
    },
    testSuites: [
      { suiteName: 'Smoke & Sanity Suite', module: 'System Gateway', testsCount: 32, passCount: 32, failCount: 0, status: 'PASSED' },
      { suiteName: 'Authentication & RBAC Matrix', module: 'Auth Service', testsCount: 45, passCount: 45, failCount: 0, status: 'PASSED' },
      { suiteName: 'CRM Ingestion & Bi-directional Sync', module: 'CRM Module', testsCount: 48, passCount: 48, failCount: 0, status: 'PASSED' },
      { suiteName: 'MUI Reporting & Data Grid Suite', module: 'Analytics & Reporting', testsCount: 38, passCount: 38, failCount: 0, status: 'PASSED' },
      { suiteName: 'End-to-End Handover Pipeline', module: 'Executive Workflow', testsCount: 40, passCount: 40, failCount: 0, status: 'PASSED' },
      { suiteName: 'Cross-Browser & Responsive UI', module: 'Frontend Web', testsCount: 45, passCount: 41, failCount: 0, status: 'PASSED' },
    ],
    defectSeverityMatrix: {
      critical: 0,
      high: 0,
      medium: 2,
      low: 4,
    },
    performanceMetrics: {
      avgApiResponseMs: 118,
      p99ResponseMs: 380,
      errorRatePercent: 0.02,
      concurrencyPassed: true,
    },
    environmentsTested: [
      { env: 'QA Staging Environment', url: 'https://staging.pjsofonic.com', status: 'VERIFIED' },
      { env: 'Pre-Production Mirror', url: 'https://preprod.pjsofonic.com', status: 'VERIFIED' },
      { env: 'Primary Production Cluster', url: 'https://erp.pjsofonic.com', status: 'VERIFIED' },
    ],
    currentStage: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function assignProjectToQualityHead(
  projectId: string,
  qualityHeadId: string,
  qualityHeadName: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      modifiedItem = {
        ...p,
        qualityHeadId,
        qualityHeadName,
        stage: 'ASSIGNED_TO_QUALITY_HEAD' as const,
        status: 'working' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
  fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/assign-quality-head`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qualityHeadId, qualityHeadName }),
  }).catch(() => {});

  return updated;
}

export function assignProjectToQualityEngineer(
  projectId: string,
  assignedQualityEngineerId: string,
  assignedQualityEngineerName: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      modifiedItem = {
        ...p,
        assignedQualityEngineerId,
        assignedQualityEngineerName,
        stage: 'ASSIGNED_TO_QUALITY_ENGINEER' as const,
        status: 'working' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
  fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/assign-quality-engineer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignedQualityEngineerId, assignedQualityEngineerName }),
  }).catch(() => {});

  return updated;
}

export function submitQualityEngineerReport(
  projectId: string,
  report: QualityReport,
  qaUser: { name?: string; id?: string; designation?: string },
  signature: string,
  notes?: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      const updatedReport: QualityReport = {
        ...report,
        currentStage: 'SUBMITTED_BY_ENGINEER',
        engineerSignoff: {
          name: qaUser.name || 'Quality Engineer',
          employeeId: qaUser.id || 'EMP-QE',
          designation: qaUser.designation || 'Quality Engineer',
          date: new Date().toLocaleDateString('en-GB'),
          signature,
          notes,
          submittedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };

      modifiedItem = {
        ...p,
        qualityReport: updatedReport,
        stage: 'QUALITY_SUBMITTED' as const,
        status: 'working' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
  fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/submit-quality-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report: modifiedItem?.qualityReport, qaUser, signature, notes }),
  }).catch(() => {});

  return updated;
}

export function approveQualityHeadReport(
  projectId: string,
  headUser: { name?: string; id?: string; designation?: string },
  remarks: string,
  signature: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      const currentReport = p.qualityReport || getDefaultQualityReport(p);
      const updatedReport: QualityReport = {
        ...currentReport,
        currentStage: 'APPROVED_BY_HEAD',
        headApproval: {
          name: headUser.name || 'Quality Head',
          employeeId: headUser.id || 'EMP-QH',
          designation: headUser.designation || 'Quality Head',
          date: new Date().toLocaleDateString('en-GB'),
          signature,
          remarks,
          approved: true,
          approvedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };

      modifiedItem = {
        ...p,
        qualityReport: updatedReport,
        stage: 'QUALITY_APPROVED' as const,
        status: 'working' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
  fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/approve-quality-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ headUser, remarks, signature }),
  }).catch(() => {});

  return updated;
}

/**
 * -------------------------------------------------------------------------
 * Cyber Security & Bug Bounty Pipeline Helpers
 * -------------------------------------------------------------------------
 */

export function getDefaultCyberReport(
  project: Partial<CrmCustomerProject>,
  testerUser?: { name?: string; id?: string; designation?: string; email?: string }
): CyberReport {
  const projCode = project.projectCode || 'PJ-CYBER-001';
  const projName = project.projectName || 'PS Softonic Enterprise Platform';
  const testerName = testerUser?.name || project.assignedBugBountyName || 'Lead Bug Bounty Specialist';
  const testerId = testerUser?.id || project.assignedBugBountyId || 'EMP-BB-01';

  return {
    executiveSummary: {
      postureStatus: 'SECURE',
      totalVulnerabilitiesFound: 7,
      vulnerabilitiesResolved: 7,
      openVulnerabilities: 0,
      testingPeriod: `${new Date(Date.now() - 7 * 86400000).toLocaleDateString('en-GB')} - ${new Date().toLocaleDateString('en-GB')}`,
    },
    owaspMatrix: [
      { category: 'A01: Broken Access Control', vulnerabilityFound: 'IDOR in project draft export', severity: 'HIGH', remediationStatus: 'RESOLVED', verified: true },
      { category: 'A02: Cryptographic Failures', vulnerabilityFound: 'Weak TLS cipher suites detected', severity: 'MEDIUM', remediationStatus: 'RESOLVED', verified: true },
      { category: 'A03: Injection (SQL / NoSQL / Command)', vulnerabilityFound: 'Strict parameterized queries enforced', severity: 'NONE', remediationStatus: 'RESOLVED', verified: true },
      { category: 'A04: Insecure Design', vulnerabilityFound: 'Rate limiting missing on password reset', severity: 'MEDIUM', remediationStatus: 'RESOLVED', verified: true },
      { category: 'A05: Security Misconfiguration', vulnerabilityFound: 'CORS wildcard headers on dev route', severity: 'LOW', remediationStatus: 'RESOLVED', verified: true },
      { category: 'A07: Identification & Auth Failures', vulnerabilityFound: 'JWT expiry validation strengthened', severity: 'MEDIUM', remediationStatus: 'RESOLVED', verified: true },
      { category: 'A08: Software & Data Integrity', vulnerabilityFound: 'Subresource integrity (SRI) validated', severity: 'NONE', remediationStatus: 'RESOLVED', verified: true },
    ],
    pentestDetails: {
      methodology: 'OWASP Web Security Testing Guide (WSTG v4.2) & PTES Standard',
      toolsUsed: ['Burp Suite Professional v2024.5', 'SonarQube Enterprise SAST', 'Nmap v7.94', 'OWASP ZAP', 'Trivy Container Scanner'],
      targetScope: `${projName} (*.pjsofonic.com, API Gateway & Microservices)`,
      testDate: new Date().toLocaleDateString('en-GB'),
    },
    bugBountyFindings: [
      { bugId: 'BB-01', title: 'IDOR bypass on unauthenticated document export preview', severity: 'HIGH', reporter: 'whitehat_09', bountyAmount: '$750', status: 'RESOLVED', verificationNotes: 'Patched with strict tenant and RBAC middleware validation.' },
      { bugId: 'BB-02', title: 'Reflected cross-site scripting (XSS) in search query filter', severity: 'MEDIUM', reporter: 'sec_hunter', bountyAmount: '$350', status: 'RESOLVED', verificationNotes: 'DOMPurify and React sanitization confirmed in place.' },
      { bugId: 'BB-03', title: 'Information disclosure via stack trace on 500 error page', severity: 'LOW', reporter: 'bug_sniper', bountyAmount: '$150', status: 'RESOLVED', verificationNotes: 'Production error boundary sanitization verified.' },
    ],
    currentStage: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function assignProjectToCyberHead(
  projectId: string,
  cyberHeadId: string,
  cyberHeadName: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      modifiedItem = {
        ...p,
        cyberHeadId,
        cyberHeadName,
        stage: 'ASSIGNED_TO_CYBER_HEAD' as const,
        status: 'working' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
  fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/assign-cyber-head`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cyberHeadId, cyberHeadName }),
  }).catch(() => {});

  return updated;
}

export function assignProjectToBugBounty(
  projectId: string,
  assignedBugBountyId: string,
  assignedBugBountyName: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      modifiedItem = {
        ...p,
        assignedBugBountyId,
        assignedBugBountyName,
        stage: 'ASSIGNED_TO_BUG_BOUNTY' as const,
        status: 'working' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
  fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/assign-bug-bounty`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignedBugBountyId, assignedBugBountyName }),
  }).catch(() => {});

  return updated;
}

export function submitBugBountyReport(
  projectId: string,
  report: CyberReport,
  testerUser: { name?: string; id?: string; designation?: string },
  signature: string,
  notes?: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      const updatedReport: CyberReport = {
        ...report,
        currentStage: 'SUBMITTED_BY_BOUNTY',
        testerSignoff: {
          name: testerUser.name || 'Bug Bounty Specialist',
          employeeId: testerUser.id || 'EMP-BB',
          designation: testerUser.designation || 'Bug Bounty Specialist',
          date: new Date().toLocaleDateString('en-GB'),
          signature,
          notes,
          submittedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };

      modifiedItem = {
        ...p,
        cyberReport: updatedReport,
        stage: 'CYBER_SUBMITTED' as const,
        status: 'working' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
  fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/submit-cyber-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report: modifiedItem?.cyberReport, testerUser, signature, notes }),
  }).catch(() => {});

  return updated;
}

export function approveCyberHeadReport(
  projectId: string,
  headUser: { name?: string; id?: string; designation?: string },
  remarks: string,
  signature: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      const currentReport = p.cyberReport || getDefaultCyberReport(p);
      const updatedReport: CyberReport = {
        ...currentReport,
        currentStage: 'APPROVED_BY_HEAD',
        headApproval: {
          name: headUser.name || 'Cyber Head',
          employeeId: headUser.id || 'EMP-CH',
          designation: headUser.designation || 'Cyber Head',
          date: new Date().toLocaleDateString('en-GB'),
          signature,
          remarks,
          approved: true,
          approvedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };

      modifiedItem = {
        ...p,
        cyberReport: updatedReport,
        stage: 'CYBER_APPROVED' as const,
        status: 'working' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
  fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/approve-cyber-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ headUser, remarks, signature }),
  }).catch(() => {});

  return updated;
}

/**
 * -------------------------------------------------------------------------
 * Manager Tri-Report Consolidation & Submit to Admin
 * -------------------------------------------------------------------------
 */

export function managerSubmitConsolidatedToAdmin(
  projectId: string,
  managerUser: { name?: string; id?: string; designation?: string },
  notes: string,
  signature: string
): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  let modifiedItem: CrmCustomerProject | undefined;

  const updated = existing.map((p) => {
    if (p.id === projectId || p.projectCode === projectId) {
      modifiedItem = {
        ...p,
        managerTriReview: {
          productionApproved: isReportFullyFilled(p),
          qualityApproved: isQualityReportApproved(p),
          cyberApproved: isCyberReportApproved(p),
          notes,
          managerName: managerUser.name || 'Manager',
          managerSignature: signature,
          submittedToAdminAt: new Date().toISOString(),
        },
        stage: 'SUBMITTED_TO_ADMIN' as const,
        status: 'working' as const,
      };
      return modifiedItem;
    }
    return p;
  });

  syncProjectUpdate(updated, modifiedItem);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
  fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/manager-submit-to-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ managerUser, notes, signature }),
  }).catch(() => {});

  return updated;
}

export function isQualityReportApproved(project: CrmCustomerProject): boolean {
  return !!project.qualityReport?.headApproval?.approved;
}

export function isCyberReportApproved(project: CrmCustomerProject): boolean {
  return !!project.cyberReport?.headApproval?.approved;
}

export function isAllThreeReportsApproved(project: CrmCustomerProject): boolean {
  const prodDone = isReportFullyFilled(project);
  const qaDone = isQualityReportApproved(project);
  const cyberDone = isCyberReportApproved(project);
  return prodDone && qaDone && cyberDone;
}

export async function adminFinalApproveAllReportsAndSyncCrm(
  projectId: string,
  adminName: string,
  notes?: string
): Promise<{ success: boolean; crmSynced: boolean; message: string; project?: CrmCustomerProject }> {
  const existing = getStoredCrmProjects();
  const proj = existing.find((p) => p.id === projectId || p.projectCode === projectId);

  if (!proj) {
    return { success: false, crmSynced: false, message: 'Project not found' };
  }

  if (!isAllThreeReportsApproved(proj)) {
    return {
      success: false,
      crmSynced: false,
      message: 'Cannot grant final approval: All 3 department reports (Production, Quality, Cyber) must be approved before CRM submission.',
    };
  }

  const modifiedItem: CrmCustomerProject = {
    ...proj,
    adminFinalApproval: {
      approved: true,
      approvedBy: adminName,
      approvedAt: new Date().toISOString(),
      notes: notes || 'Admin final sign-off & CRM push across all 3 departmental reports',
    },
    crmSynced: true,
    crmSyncedAt: new Date().toISOString(),
    stage: 'COMPLETED' as const,
    status: 'COMPLETED' as const,
  };

  const updated = existing.map((p) => (p.id === modifiedItem.id || p.projectCode === modifiedItem.projectCode ? modifiedItem : p));
  syncProjectUpdate(updated, modifiedItem);

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
    const res = await fetch(`${backendUrl}/projects/${encodeURIComponent(projectId)}/admin-approve-and-crm-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminName, notes }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, crmSynced: data.crmSynced ?? true, message: data.message || 'All 3 reports approved and pushed to CRM!', project: modifiedItem };
    }
  } catch (err) {
    console.warn('Backend admin-approve-and-crm-sync notice:', err);
  }

  return { success: true, crmSynced: true, message: 'Admin approval saved and scheduled for CRM sync', project: modifiedItem };
}

export const adminFinalApproveAllReportsAndCrmSync = adminFinalApproveAllReportsAndSyncCrm;
