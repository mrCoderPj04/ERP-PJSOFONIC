import { fetchSupabaseProjects, saveProjectToSupabase } from './supabase';
import { safeString } from './safeString';

export const CRM_API_BASE = process.env.NEXT_PUBLIC_CRM_API_BASE || 'https://pjsofonic-crm-backend.onrender.com';
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

export interface CrmCustomerProject {
  id: string;
  projectCode: string;
  projectName: string;
  customerName: string;
  customerEmail: string;
  departmentScope: string;
  targetTeamLeadId?: string;
  targetTeamLeadName?: string;
  assignedEngineerId?: string;
  assignedEngineerName?: string;
  requirements: string;
  budget: number;
  status: 'working' | 'Done' | 'IN_PROGRESS' | 'COMPLETED' | 'ACTIVE';
  stage?: 'ADMIN_CREATED' | 'ASSIGNED_TO_TL' | 'TL_ASSIGNED_TO_FULLSTACK' | 'PRODUCTION_SUBMITTED' | 'TL_PRODUCTION_APPROVED' | 'SENT_TO_QUALITY' | 'QUALITY_APPROVED' | 'SUBMITTED_TO_ADMIN' | 'COMPLETED';
  approvalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
  productionDeliverables?: ProductionDeliverables;
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
  createdAt: string;
}

const CRM_STORAGE_KEY = 'pj_crm_active_projects';
const CRM_EVENT_NAME = 'pj_crm_updated';

export function getStoredCrmProjects(): CrmCustomerProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CRM_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p: any) => ({
      id: safeString(p.id || `crm-${Date.now()}`),
      projectCode: safeString(p.projectCode || `CRM-PRJ-${Math.floor(100 + Math.random() * 900)}`),
      projectName: safeString(p.projectName || 'CRM Active Customer Project'),
      customerName: safeString(p.customerName || 'CRM Client'),
      customerEmail: safeString(p.customerEmail || 'client@crm.com'),
      departmentScope: safeString(p.departmentScope || 'Software Engineering'),
      targetTeamLeadId: p.targetTeamLeadId ? safeString(p.targetTeamLeadId) : undefined,
      targetTeamLeadName: p.targetTeamLeadName ? safeString(p.targetTeamLeadName) : undefined,
      assignedEngineerId: p.assignedEngineerId ? safeString(p.assignedEngineerId) : undefined,
      assignedEngineerName: p.assignedEngineerName ? safeString(p.assignedEngineerName) : undefined,
      requirements: safeString(p.requirements || 'Customer project scope submitted via CRM.'),
      budget: Number(p.budget) || 0,
      status: p.status || 'working',
      stage: p.stage || (p.status === 'COMPLETED' ? 'COMPLETED' : 'ASSIGNED_TO_TL'),
      approvalStatus: p.approvalStatus || 'APPROVED',
      productionDeliverables: p.productionDeliverables,
      tlProductionApproval: p.tlProductionApproval,
      qualityReports: p.qualityReports,
      tlFinalSubmission: p.tlFinalSubmission,
      adminFinalApproval: p.adminFinalApproval,
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

export function saveCrmProject(project: Partial<CrmCustomerProject>): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  const index = existing.findIndex((p) => p.id === project.id || p.projectCode === project.projectCode);
  const existingProj = index >= 0 ? existing[index] : null;

  const newProj: CrmCustomerProject = {
    id: safeString(project.id || existingProj?.id || `crm-proj-${Date.now()}`),
    projectCode: safeString(project.projectCode || existingProj?.projectCode || `CRM-PRJ-${Math.floor(100 + Math.random() * 900)}`),
    projectName: safeString(project.projectName || existingProj?.projectName || 'CRM Active Customer Project'),
    customerName: safeString(project.customerName || existingProj?.customerName || 'CRM Client'),
    customerEmail: safeString(project.customerEmail || existingProj?.customerEmail || 'client@crm.com'),
    departmentScope: safeString(project.departmentScope || existingProj?.departmentScope || 'Software Engineering'),
    targetTeamLeadId: project.targetTeamLeadId ? safeString(project.targetTeamLeadId) : existingProj?.targetTeamLeadId,
    targetTeamLeadName: project.targetTeamLeadName ? safeString(project.targetTeamLeadName) : existingProj?.targetTeamLeadName,
    assignedEngineerId: project.assignedEngineerId ? safeString(project.assignedEngineerId) : existingProj?.assignedEngineerId,
    assignedEngineerName: project.assignedEngineerName ? safeString(project.assignedEngineerName) : existingProj?.assignedEngineerName,
    requirements: safeString(project.requirements || existingProj?.requirements || 'Customer project scope submitted via CRM.'),
    budget: Number(project.budget !== undefined ? project.budget : (existingProj?.budget || 0)),
    status: project.status || existingProj?.status || 'working',
    stage: project.stage || existingProj?.stage || 'ASSIGNED_TO_TL',
    approvalStatus: project.approvalStatus || existingProj?.approvalStatus || 'APPROVED',
    productionDeliverables: project.productionDeliverables || existingProj?.productionDeliverables,
    tlProductionApproval: project.tlProductionApproval || existingProj?.tlProductionApproval,
    qualityReports: project.qualityReports || existingProj?.qualityReports,
    tlFinalSubmission: project.tlFinalSubmission || existingProj?.tlFinalSubmission,
    adminFinalApproval: project.adminFinalApproval || existingProj?.adminFinalApproval,
    createdAt: safeString(project.createdAt || existingProj?.createdAt || new Date().toISOString()),
  };

  const updated = [newProj, ...existing.filter((p) => p.projectCode !== newProj.projectCode && p.id !== newProj.id)];
  syncProjectUpdate(updated, newProj);
  return updated;
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
 * Ingests live customer projects from all sources
 */
export async function fetchCrmCustomerProjects(): Promise<CrmCustomerProject[]> {
  const projectMap = new Map<string, CrmCustomerProject>();

  // 1. Fetch live projects directly from remote CRM Backend API
  try {
    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('pj_crm_token') || localStorage.getItem('pj_ems_token') || '';
    }
    const headers: Record<string, string> = {};
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

          projectMap.set(code, {
            id: safeString(p.id || p._id || `crm-proj-${Date.now()}`),
            projectCode: code,
            projectName: safeString(p.title || p.projectName || p.name || 'CRM Customer Project'),
            customerName: clientName,
            customerEmail: clientEmail,
            departmentScope: dept,
            targetTeamLeadId: tlId,
            targetTeamLeadName: tlName,
            requirements: safeString(p.overview || p.requirements_html || p.requirements || p.description || 'Customer project scope submitted via CRM.'),
            budget: Number(p.budget || p.estimated_cost || p.estimatedCost) || 0,
            status: p.status === 'COMPLETED' ? 'COMPLETED' : (p.status === 'APPROVED' ? 'working' : (p.status || 'working')),
            stage: p.status === 'COMPLETED' ? 'COMPLETED' : 'ASSIGNED_TO_TL',
            approvalStatus: 'APPROVED',
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
    const expressRes = await fetch(`${backendUrl}/crm/projects`, { cache: 'no-store' });
    if (expressRes.ok) {
      const data = await expressRes.json();
      const list = data.projects || data.data || (Array.isArray(data) ? data : []);
      if (Array.isArray(list) && list.length > 0) {
        list.forEach((p: any) => {
          const code = safeString(p.projectCode || p.code || p.project_code || `CRM-${p.id}`);
          if (!projectMap.has(code)) {
            projectMap.set(code, {
              id: safeString(p.id || `crm-${Date.now()}`),
              projectCode: code,
              projectName: safeString(p.projectName || p.name || 'Customer Project from CRM'),
              customerName: safeString(p.customerName || p.clientName || 'CRM Client'),
              customerEmail: safeString(p.customerEmail || p.email || 'client@crm.com'),
              departmentScope: safeString(p.departmentScope || p.department || 'Software Engineering'),
              targetTeamLeadId: p.targetTeamLeadId ? safeString(p.targetTeamLeadId) : undefined,
              targetTeamLeadName: p.targetTeamLeadName ? safeString(p.targetTeamLeadName) : undefined,
              requirements: safeString(p.requirements || p.description || 'Customer project scope submitted via CRM.'),
              budget: Number(p.budget) || 0,
              status: p.status === 'COMPLETED' ? 'COMPLETED' : (p.status || 'working'),
              stage: p.stage || (p.status === 'COMPLETED' ? 'COMPLETED' : 'ASSIGNED_TO_TL'),
              approvalStatus: 'APPROVED',
              productionDeliverables: p.productionDeliverables,
              tlProductionApproval: p.tlProductionApproval,
              qualityReports: p.qualityReports,
              tlFinalSubmission: p.tlFinalSubmission,
              adminFinalApproval: p.adminFinalApproval,
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
          projectMap.set(code, {
            id: safeString(p.id || `supa-${Date.now()}`),
            projectCode: code,
            projectName: safeString(p.project_name || p.projectName || p.name || 'CRM Approved Project'),
            customerName: safeString(p.customer_name || p.customerName || p.clientName || 'Valued CRM Client'),
            customerEmail: safeString(p.customer_email || p.customerEmail || p.email || 'client@crm.com'),
            departmentScope: safeString(p.department_scope || p.departmentScope || p.department || 'Software Engineering'),
            targetTeamLeadId: p.target_team_lead_id ? safeString(p.target_team_lead_id) : (p.targetTeamLeadId ? safeString(p.targetTeamLeadId) : undefined),
            targetTeamLeadName: p.target_team_lead_name ? safeString(p.target_team_lead_name) : (p.targetTeamLeadName ? safeString(p.targetTeamLeadName) : undefined),
            requirements: safeString(p.requirements || p.description || 'Approved project scope from CRM.'),
            budget: Number(p.budget) || 0,
            status: p.status === 'COMPLETED' ? 'COMPLETED' : (p.status || 'working'),
            stage: p.status === 'COMPLETED' ? 'COMPLETED' : 'ASSIGNED_TO_TL',
            approvalStatus: 'APPROVED',
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
  storedProjects.forEach((p) => {
    projectMap.set(p.projectCode, p);
  });

  // Filter out legacy test project codes
  const validProjects = Array.from(projectMap.values()).filter(
    (p) =>
      !p.id.startsWith('crm-proj-approved') &&
      !p.projectCode.startsWith('CRM-PRJ-70')
  );

  return validProjects;
}
