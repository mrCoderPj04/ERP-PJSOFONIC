export const PROJECTOS_API_BASE = 'https://sofo-projectos.onrender.com';

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
 * Syncs active/updated project data with ProjectOS backend
 * Endpoint: https://sofo-projectos.onrender.com/api/projects
 */
export async function syncWithProjectOS(project: ProjectOsPayload): Promise<boolean> {
  const existing = getStoredProjectOsData();
  const updatedList = [project, ...existing.filter((p) => p.projectCode !== project.projectCode)];

  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROJECTOS_STORAGE_KEY, JSON.stringify(updatedList));
    }
  } catch (e) {}

  try {
    const res = await fetch(`${PROJECTOS_API_BASE}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectCode: project.projectCode,
        projectName: project.projectName,
        customerName: project.customerName,
        customerEmail: project.customerEmail,
        departmentScope: project.departmentScope,
        targetTeamLeadName: project.targetTeamLeadName,
        budget: project.budget,
        status: project.status,
        requirements: project.requirements,
        syncedAt: new Date().toISOString(),
      }),
    });

    if (res.ok) {
      console.log(`[ProjectOS Sync Success] Synced ${project.projectName} to ${PROJECTOS_API_BASE}`);
      return true;
    }
  } catch (err) {
    console.warn(`[ProjectOS Sync Remote Warning] ${PROJECTOS_API_BASE} unavailable, local fallback saved.`, err);
  }

  return true;
}

/**
 * Fetches synced projects from ProjectOS host or local fallback
 */
export async function fetchProjectOSProjects(): Promise<ProjectOsPayload[]> {
  try {
    const res = await fetch(`${PROJECTOS_API_BASE}/api/projects`);
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.projects || data.data || [];
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (err) {
    console.warn('Fetch from ProjectOS failed, returning stored local fallback.');
  }

  return getStoredProjectOsData();
}
