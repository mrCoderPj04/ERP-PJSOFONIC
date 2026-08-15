export const CRM_API_BASE = 'https://pjsofonic-crm-backend.onrender.com';

export interface CrmCustomerProject {
  id: string;
  projectCode: string;
  projectName: string;
  customerName: string;
  customerEmail: string;
  departmentScope: string; // Software Engineering, Mobile, QA, Design
  targetTeamLeadId?: string;
  targetTeamLeadName?: string;
  requirements: string;
  budget: number;
  status: 'PENDING_TL_REVIEW' | 'TL_DECOMPOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'ACTIVE' | 'working' | 'Done';
  createdAt: string;
}

const CRM_STORAGE_KEY = 'pj_crm_active_projects';

export function getStoredCrmProjects(): CrmCustomerProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CRM_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function saveCrmProject(project: Partial<CrmCustomerProject>): CrmCustomerProject[] {
  const existing = getStoredCrmProjects();
  const newProj: CrmCustomerProject = {
    id: project.id || `crm-proj-${Date.now()}`,
    projectCode: project.projectCode || `CRM-PRJ-${Math.floor(100 + Math.random() * 900)}`,
    projectName: project.projectName || 'CRM Active Customer Project',
    customerName: project.customerName || 'CRM Client',
    customerEmail: project.customerEmail || 'client@crm.com',
    departmentScope: project.departmentScope || 'Software Engineering',
    targetTeamLeadId: project.targetTeamLeadId,
    targetTeamLeadName: project.targetTeamLeadName,
    requirements: project.requirements || 'Customer project scope submitted via CRM.',
    budget: project.budget || 25000,
    status: project.status || 'IN_PROGRESS',
    createdAt: project.createdAt || new Date().toISOString(),
  };

  const updated = [newProj, ...existing.filter((p) => p.id !== newProj.id)];
  try {
    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to store CRM project in localStorage', e);
  }
  return updated;
}

/**
 * Ingests real-time customer projects submitted via PJSOFONIC CRM Backend and local store
 */
export async function fetchCrmCustomerProjects(): Promise<CrmCustomerProject[]> {
  let liveProjects: CrmCustomerProject[] = [];

  // 1. Fetch live projects from remote CRM Backend API
  try {
    const res = await fetch(`${CRM_API_BASE}/api/v1/projects`);
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.projects || data.data || [];
      if (Array.isArray(list) && list.length > 0) {
        liveProjects = list.map((p: any) => ({
          id: p.id || p._id || `crm-proj-${Date.now()}`,
          projectCode: p.projectCode || p.code || `CRM-PRJ-${Math.floor(100 + Math.random() * 900)}`,
          projectName: p.projectName || p.name || 'Customer Project from CRM',
          customerName: p.customerName || p.clientName || 'CRM Client',
          customerEmail: p.customerEmail || p.email || 'client@crm.com',
          departmentScope: p.departmentScope || p.department || 'Software Engineering',
          targetTeamLeadId: p.targetTeamLeadId,
          targetTeamLeadName: p.targetTeamLeadName,
          requirements: p.requirements || p.description || 'Customer project scope submitted via CRM.',
          budget: p.budget || p.estimatedCost || 15000,
          status: p.status === 'ACTIVE' ? 'IN_PROGRESS' : p.status || 'PENDING_TL_REVIEW',
          createdAt: p.createdAt || new Date().toISOString(),
        }));
      }
    }
  } catch (err) {
    console.warn('Remote CRM API connection attempt:', err);
  }

  // 2. Fetch live projects from local Express Backend API
  try {
    const expressRes = await fetch('/api/crm/projects');
    if (expressRes.ok) {
      const data = await expressRes.json();
      const list = data.projects || data.data || (Array.isArray(data) ? data : []);
      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map((p: any) => ({
          id: p.id || p._id || `crm-proj-${Date.now()}`,
          projectCode: p.projectCode || p.code || `CRM-PRJ-${Math.floor(100 + Math.random() * 900)}`,
          projectName: p.projectName || p.name || 'Customer Project from CRM',
          customerName: p.customerName || p.clientName || 'CRM Client',
          customerEmail: p.customerEmail || p.email || 'client@crm.com',
          departmentScope: p.departmentScope || p.department || 'Software Engineering',
          targetTeamLeadId: p.targetTeamLeadId,
          targetTeamLeadName: p.targetTeamLeadName,
          requirements: p.requirements || p.description || 'Customer project scope submitted via CRM.',
          budget: p.budget || p.estimatedCost || 15000,
          status: p.status === 'ACTIVE' ? 'IN_PROGRESS' : p.status || 'PENDING_TL_REVIEW',
          createdAt: p.createdAt || new Date().toISOString(),
        }));
        liveProjects = [...liveProjects, ...mapped];
      }
    }
  } catch (e) {}

  // 3. Merge with real-time active projects stored locally
  const storedProjects = getStoredCrmProjects();

  const map = new Map<string, CrmCustomerProject>();
  storedProjects.forEach((p) => map.set(p.id, p));
  liveProjects.forEach((p) => map.set(p.id, p));

  return Array.from(map.values());
}


