import { fetchSupabaseProjects, saveProjectToSupabase } from './supabase';
import { safeString } from './safeString';

export const CRM_API_BASE = 'https://pjsofonic-crm-backend.onrender.com';

export interface CrmCustomerProject {
  id: string;
  projectCode: string;
  projectName: string;
  customerName: string;
  customerEmail: string;
  departmentScope: string; // Software Engineering, Full Stack, Mobile Engineering, QA, Design
  targetTeamLeadId?: string;
  targetTeamLeadName?: string;
  requirements: string;
  budget: number;
  status: 'PENDING_TL_REVIEW' | 'TL_DECOMPOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'ACTIVE' | 'working' | 'Done';
  approvalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdAt: string;
}

const CRM_STORAGE_KEY = 'pj_crm_active_projects';

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
      requirements: safeString(p.requirements || 'Customer project scope submitted via CRM.'),
      budget: Number(p.budget) || 0,
      status: p.status || 'working',
      approvalStatus: p.approvalStatus || 'APPROVED',
      createdAt: safeString(p.createdAt || new Date().toISOString()),
    }));
  } catch (e) {
    return [];
  }
}

export function saveCrmProject(project: Partial<CrmCustomerProject>): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  const newProj: CrmCustomerProject = {
    id: safeString(project.id || `crm-proj-${Date.now()}`),
    projectCode: safeString(project.projectCode || `CRM-PRJ-${Math.floor(100 + Math.random() * 900)}`),
    projectName: safeString(project.projectName || 'CRM Active Customer Project'),
    customerName: safeString(project.customerName || 'CRM Client'),
    customerEmail: safeString(project.customerEmail || 'client@crm.com'),
    departmentScope: safeString(project.departmentScope || 'Software Engineering'),
    targetTeamLeadId: project.targetTeamLeadId ? safeString(project.targetTeamLeadId) : undefined,
    targetTeamLeadName: project.targetTeamLeadName ? safeString(project.targetTeamLeadName) : undefined,
    requirements: safeString(project.requirements || 'Customer project scope submitted via CRM.'),
    budget: Number(project.budget) || 0,
    status: project.status || 'working',
    approvalStatus: project.approvalStatus || 'APPROVED',
    createdAt: safeString(project.createdAt || new Date().toISOString()),
  };

  const updated = [newProj, ...existing.filter((p) => p.projectCode !== newProj.projectCode && p.id !== newProj.id)];
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Failed to store CRM project in localStorage', e);
  }

  // 1. Sync to Supabase project_erp schema in background
  saveProjectToSupabase(newProj).catch((err) => console.warn('Supabase sync notice:', err));

  // 2. Sync to local Express Backend if online
  if (typeof window !== 'undefined') {
    fetch('http://localhost:5000/api/crm/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProj),
    }).catch(() => {});
  }

  return updated;
}

/**
 * Ingests strictly live customer projects from:
 * 1. Live PJSOFONIC CRM Backend API (with auth token)
 * 2. Supabase (project_erp schema)
 * 3. Local Express Backend API (/api/crm/projects)
 * 4. Stored user projects
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
            status: p.status === 'APPROVED' ? 'working' : p.status === 'COMPLETED' ? 'Done' : (p.status || 'working'),
            approvalStatus: 'APPROVED',
            createdAt: safeString(p.created_at || p.createdAt || new Date().toISOString()),
          });
        });
      }
    }
  } catch (err) {
    console.warn('Remote CRM API connection notice:', err);
  }

  // 2. Fetch live projects from local Express Backend API
  try {
    const expressRes = await fetch('http://localhost:5000/api/crm/projects', { cache: 'no-store' });
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
              status: p.status === 'ACTIVE' ? 'working' : (p.status || 'working'),
              approvalStatus: 'APPROVED',
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
            status: p.status === 'ACTIVE' ? 'working' : (p.status || 'working'),
            approvalStatus: 'APPROVED',
            createdAt: safeString(p.created_at || p.createdAt || new Date().toISOString()),
          });
        }
      });
    }
  } catch (supaErr) {
    console.warn('Supabase projects query notice:', supaErr);
  }

  // 4. Ingest locally stored active projects
  const storedProjects = getStoredCrmProjects();
  storedProjects.forEach((p) => {
    if (!projectMap.has(p.projectCode)) {
      projectMap.set(p.projectCode, p);
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
