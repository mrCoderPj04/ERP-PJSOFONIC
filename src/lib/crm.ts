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
  status: 'PENDING_TL_REVIEW' | 'TL_DECOMPOSED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
}

/**
 * Ingests live customer projects submitted via PJSOFONIC CRM Backend
 */
export async function fetchCrmCustomerProjects(): Promise<CrmCustomerProject[]> {
  try {
    const res = await fetch(`${CRM_API_BASE}/api/v1/projects`);
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.projects || data.data || [];

    return list.map((p: any) => ({
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
      status: p.status || 'PENDING_TL_REVIEW',
      createdAt: p.createdAt || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('CRM Customer Projects fetch error:', err);
    return [];
  }
}
