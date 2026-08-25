import { fetchCrmCustomerProjects } from './crm';

export const PROJECTOS_API_BASE = process.env.NEXT_PUBLIC_PROJECTOS_API_BASE || 'https://sofo-projectos.onrender.com';
export const ERP_BACKEND_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';

export interface ProjectOsPayload {
  id?: string;
  projectCode: string;
  projectName: string;
  customerName: string;
  customerEmail?: string;
  departmentScope: string;
  targetTeamLeadName?: string;
  budget: number;
  status: 'working' | 'Done' | 'IN_PROGRESS' | 'COMPLETED';
  requirements?: string;
  updatedAt?: string;
  syncedWithHost?: string;
}

const PROJECTOS_STORAGE_KEY = 'pj_projectos_synced_projects';

export function getStoredProjectOsData(): ProjectOsPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(PROJECTOS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Syncs active/updated project data with ProjectOS backend & ERP Backend
 * Endpoints:
 * - https://sofo-projectos.onrender.com/api/projects
 * - https://pjsofonic-erp-backend.onrender.com/api/projectos/sync
 */
export async function syncWithProjectOS(project: ProjectOsPayload): Promise<boolean> {
  const existing = getStoredProjectOsData();
  const updatedList = [project, ...existing.filter((p) => p.projectCode !== project.projectCode)];

  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROJECTOS_STORAGE_KEY, JSON.stringify(updatedList));
    }
  } catch (e) {}

  // 1. Sync with ERP Express Backend Gateway
  try {
    fetch(`${ERP_BACKEND_API_BASE}/projectos/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    }).catch(() => {});
  } catch (e) {}

  // 2. Sync with remote ProjectOS host
  try {
    const res = await fetch(`${PROJECTOS_API_BASE}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: project.projectName,
        title: project.projectName,
        projectName: project.projectName,
        project_name: project.projectName,
        projectCode: project.projectCode,
        code: project.projectCode,
        customerName: project.customerName,
        client: project.customerName,
        client_name: project.customerName,
        customerEmail: project.customerEmail,
        departmentScope: project.departmentScope,
        department: project.departmentScope,
        targetTeamLeadName: project.targetTeamLeadName,
        budget: project.budget,
        cost: project.budget,
        status: project.status,
        requirements: project.requirements,
        description: project.requirements,
        syncedAt: new Date().toISOString(),
      }),
    });

    if (res.ok) {
      console.log(`[ProjectOS Sync Success] Synced ${project.projectName} to ${PROJECTOS_API_BASE}`);
      return true;
    }
  } catch (err) {
    console.warn(`[ProjectOS Sync Remote Warning] ${PROJECTOS_API_BASE} unavailable, local & ERP backend saved.`, err);
  }

  return true;
}

/**
 * Fetches synced projects from ProjectOS host, ERP Backend, and CRM
 */
export async function fetchProjectOSProjects(): Promise<ProjectOsPayload[]> {
  const map = new Map<string, ProjectOsPayload>();

  // 1. Fetch from ERP Backend /api/projectos/projects
  try {
    const res = await fetch(`${ERP_BACKEND_API_BASE}/projectos/projects`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.projects || data.data || [];
      if (Array.isArray(list) && list.length > 0) {
        list.forEach((p: any) => {
          const code = p.projectCode || p.code || `PRJ-${p.id}`;
          map.set(code, {
            id: p.id,
            projectCode: code,
            projectName: p.projectName || p.name || 'ERP Project',
            customerName: p.customerName || p.clientName || 'Client',
            customerEmail: p.customerEmail,
            departmentScope: p.departmentScope || 'Software Engineering',
            targetTeamLeadName: p.targetTeamLeadName,
            budget: Number(p.budget || p.cost || 0),
            status: p.status || 'working',
            requirements: p.requirements || p.description,
            updatedAt: p.updatedAt,
            syncedWithHost: PROJECTOS_API_BASE,
          });
        });
      }
    }
  } catch (e) {}

  // 2. Fetch from CRM Customer Projects
  try {
    const crmList = await fetchCrmCustomerProjects();
    crmList.forEach((p) => {
      if (!map.has(p.projectCode)) {
        map.set(p.projectCode, {
          id: p.id,
          projectCode: p.projectCode,
          projectName: p.projectName,
          customerName: p.customerName,
          customerEmail: p.customerEmail,
          departmentScope: p.departmentScope,
          targetTeamLeadName: p.targetTeamLeadName,
          budget: p.budget,
          status: p.status === 'COMPLETED' ? 'COMPLETED' : 'working',
          requirements: p.requirements,
          updatedAt: p.createdAt,
          syncedWithHost: PROJECTOS_API_BASE,
        });
      }
    });
  } catch (e) {}

  // 3. Ingest cached localStorage
  const cached = getStoredProjectOsData();
  cached.forEach((p) => {
    if (!map.has(p.projectCode)) {
      map.set(p.projectCode, p);
    }
  });

  return Array.from(map.values());
}
